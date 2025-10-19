const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { pool } = require('../config/database');

/**
 * 动态Nginx配置管理器
 * 根据系统设置自动更新Nginx文件大小限制
 */
class NginxConfigManager {
  constructor() {
    // 使用相对路径，避免初始化时访问不存在的文件
    this.nginxConfigPath = process.env.NGINX_CONFIG_PATH || '/www/server/panel/vhost/nginx/dist.conf';
    this.backupPath = process.env.NGINX_BACKUP_PATH || '/www/server/panel/vhost/nginx/dist.conf.backup';
    this.tempPath = process.env.NGINX_TEMP_PATH || '/tmp/nginx_config_temp.conf';
    
    console.log('NginxConfigManager initialized with paths:', {
      config: this.nginxConfigPath,
      backup: this.backupPath,
      temp: this.tempPath
    });
  }

  /**
   * 从数据库获取当前文件大小限制
   */
  async getCurrentFileSizeLimit() {
    try {
      const [result] = await pool.execute(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['max_file_size']
      );
      
      if (result.length > 0) {
        const maxFileSizeBytes = parseInt(result[0].setting_value);
        // 转换为GB，并添加一些缓冲
        const limitGB = Math.ceil(maxFileSizeBytes / (1024 * 1024 * 1024)) + 1;
        return Math.min(limitGB, 10); // 最大10GB
      }
      
      return 2; // 默认2GB
    } catch (error) {
      console.error('获取文件大小限制失败:', error);
      return 2; // 默认2GB
    }
  }

  /**
   * 读取当前Nginx配置
   */
  async readNginxConfig() {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(this.nginxConfigPath)) {
        console.log('Nginx配置文件不存在:', this.nginxConfigPath);
        return null;
      }
      
      const config = await fs.promises.readFile(this.nginxConfigPath, 'utf8');
      return config;
    } catch (error) {
      console.error('读取Nginx配置失败:', error);
      // 如果权限不足，返回默认配置
      if (error.code === 'EACCES') {
        console.log('权限不足，使用默认配置');
        return this.getDefaultConfig();
      }
      throw error;
    }
  }

  /**
   * 获取默认Nginx配置
   */
  getDefaultConfig() {
    return `server {
    listen 80;
    listen 443 ssl;
    server_name tukubackend.vtart.cn;
    
    # 默认文件大小限制
    client_max_body_size 2G;
    client_body_buffer_size 128k;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        add_header X-Cache $upstream_cache_status;
        proxy_set_header X-Host $host:$server_port;
        proxy_set_header X-Scheme $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 86400s;
        proxy_send_timeout 30s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`;
  }

  /**
   * 备份当前配置
   */
  async backupConfig() {
    try {
      const config = await this.readNginxConfig();
      await fs.promises.writeFile(this.backupPath, config);
      console.log('Nginx配置已备份到:', this.backupPath);
    } catch (error) {
      console.error('备份Nginx配置失败:', error);
      throw error;
    }
  }

  /**
   * 更新Nginx配置中的文件大小限制
   */
  async updateConfig(newLimitGB) {
    try {
      const config = await this.readNginxConfig();
      
      // 创建新的配置内容
      let newConfig = config;
      
      // 移除现有的client_max_body_size配置
      newConfig = newConfig.replace(/client_max_body_size\s+\d+[GMK]?;?\s*/g, '');
      
      // 在server块中添加新的配置
      const serverBlockRegex = /(server\s*{[^}]*listen[^}]*server_name[^}]*)/;
      const match = newConfig.match(serverBlockRegex);
      
      if (match) {
        const serverStart = match[1];
        const newServerStart = serverStart + `\n    # 动态文件大小限制 - 由系统自动管理\n    client_max_body_size ${newLimitGB}G;\n    client_body_buffer_size 128k;\n    client_body_timeout 60s;\n    client_header_timeout 60s;\n`;
        
        newConfig = newConfig.replace(serverBlockRegex, newServerStart);
      } else {
        // 如果找不到server块，在文件开头添加
        newConfig = `# 动态文件大小限制 - 由系统自动管理\nclient_max_body_size ${newLimitGB}G;\nclient_body_buffer_size 128k;\nclient_body_timeout 60s;\nclient_header_timeout 60s;\n\n` + newConfig;
      }
      
      // 写入临时文件
      await fs.promises.writeFile(this.tempPath, newConfig);
      
      console.log(`Nginx配置已更新，文件大小限制设置为: ${newLimitGB}GB`);
      return newConfig;
    } catch (error) {
      console.error('更新Nginx配置失败:', error);
      throw error;
    }
  }

  /**
   * 测试Nginx配置
   */
  async testConfig() {
    return new Promise((resolve, reject) => {
      exec('nginx -t', (error, stdout, stderr) => {
        if (error) {
          console.error('Nginx配置测试失败:', error);
          console.error('错误输出:', stderr);
          reject(error);
        } else {
          console.log('Nginx配置测试通过:', stdout);
          resolve(true);
        }
      });
    });
  }

  /**
   * 应用Nginx配置
   */
  async applyConfig() {
    try {
      // 测试配置
      await this.testConfig();
      
      // 备份当前配置
      await this.backupConfig();
      
      // 应用新配置
      await fs.promises.copyFile(this.tempPath, this.nginxConfigPath);
      
      // 重新加载Nginx
      await this.reloadNginx();
      
      console.log('Nginx配置已成功应用');
      return true;
    } catch (error) {
      console.error('应用Nginx配置失败:', error);
      
      // 如果失败，尝试恢复备份
      try {
        if (fs.existsSync(this.backupPath)) {
          await fs.promises.copyFile(this.backupPath, this.nginxConfigPath);
          await this.reloadNginx();
          console.log('已恢复Nginx配置备份');
        }
      } catch (restoreError) {
        console.error('恢复Nginx配置备份失败:', restoreError);
      }
      
      throw error;
    }
  }

  /**
   * 重新加载Nginx
   */
  async reloadNginx() {
    return new Promise((resolve, reject) => {
      exec('systemctl reload nginx', (error, stdout, stderr) => {
        if (error) {
          console.error('重新加载Nginx失败:', error);
          reject(error);
        } else {
          console.log('Nginx已重新加载');
          resolve(true);
        }
      });
    });
  }

  /**
   * 检查配置是否需要更新
   */
  async checkAndUpdateConfig() {
    try {
      const currentLimitGB = await this.getCurrentFileSizeLimit();
      const config = await this.readNginxConfig();
      
      // 检查当前配置中的限制
      const currentConfigMatch = config.match(/client_max_body_size\s+(\d+)[GMK]?/);
      const currentConfigLimit = currentConfigMatch ? parseInt(currentConfigMatch[1]) : 0;
      
      if (currentConfigLimit !== currentLimitGB) {
        console.log(`检测到配置变化: ${currentConfigLimit}GB -> ${currentLimitGB}GB`);
        await this.updateConfig(currentLimitGB);
        await this.applyConfig();
        return true;
      } else {
        console.log('Nginx配置无需更新');
        return false;
      }
    } catch (error) {
      console.error('检查配置更新失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前配置状态
   */
  async getConfigStatus() {
    try {
      const currentLimitGB = await this.getCurrentFileSizeLimit();
      
      // 由于权限问题，我们无法直接读取Nginx配置
      // 返回建议的配置状态
      return {
        databaseLimit: currentLimitGB,
        nginxLimit: 'unknown', // 无法读取
        needsUpdate: true, // 假设需要更新
        lastChecked: new Date().toISOString(),
        configAccessible: false,
        configPath: this.nginxConfigPath,
        message: '无法访问Nginx配置文件，请手动检查配置',
        suggestedConfig: this.getSuggestedNginxConfig(currentLimitGB)
      };
    } catch (error) {
      console.error('获取配置状态失败:', error);
      return {
        databaseLimit: 2,
        nginxLimit: 'unknown',
        needsUpdate: true,
        lastChecked: new Date().toISOString(),
        configAccessible: false,
        configPath: this.nginxConfigPath,
        error: error.message,
        message: '获取配置状态失败',
        suggestedConfig: this.getSuggestedNginxConfig(2)
      };
    }
  }

  /**
   * 获取建议的Nginx配置
   */
  getSuggestedNginxConfig(limitGB) {
    return `# 建议的Nginx配置
# 文件路径: ${this.nginxConfigPath}

server {
    listen 80;
    listen 443 ssl;
    server_name tukubackend.vtart.cn;
    
    # 文件大小限制 - 基于数据库设置: ${limitGB}GB
    client_max_body_size ${limitGB}G;
    client_body_buffer_size 128k;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        add_header X-Cache $upstream_cache_status;
        proxy_set_header X-Host $host:$server_port;
        proxy_set_header X-Scheme $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 86400s;
        proxy_send_timeout 30s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}`;
  }
}

module.exports = NginxConfigManager;
