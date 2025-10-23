const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

class DatabaseInitService {
  constructor() {
    this.initScripts = [
      'fix_notification_frequency.sql'
    ];
  }

  // 执行SQL脚本
  async executeSqlScript(scriptName) {
    try {
      // 兼容打包后 dist 目录与源码目录两种路径
      const candidates = [
        // 打包后：services 在 dist/services，数据库脚本在 dist/database
        path.join(__dirname, '../database', scriptName),
        // 源码开发：services 在 src/services，数据库脚本在 backend/database
        path.join(__dirname, '../../database', scriptName)
      ];

      let scriptPath = null;
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          scriptPath = p;
          break;
        }
      }

      // 检查文件是否存在
      if (!scriptPath) {
        console.log(`⚠️ SQL脚本文件不存在: ${scriptName}`);
        return false;
      }

      // 读取SQL文件内容
      const sqlContent = fs.readFileSync(scriptPath, 'utf8');
      
      // 分割SQL语句（按分号分割）
      const sqlStatements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      // 执行每个SQL语句
      for (const statement of sqlStatements) {
        if (statement.trim()) {
          try {
            await pool.execute(statement);
            console.log(`✅ 执行SQL成功: ${statement.substring(0, 50)}...`);
          } catch (error) {
            // 如果是重复键错误，忽略（INSERT IGNORE的效果）
            if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_DUP_KEYNAME') {
              console.log(`ℹ️ SQL语句已存在，跳过: ${statement.substring(0, 50)}...`);
            } else {
              console.error(`❌ 执行SQL失败: ${statement.substring(0, 50)}...`, error.message);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ 执行SQL脚本失败 ${scriptName}:`, error.message);
      return false;
    }
  }

  // 检查是否需要执行初始化脚本
  async checkAndExecuteInitScripts() {
    console.log('🔍 检查数据库初始化脚本...');

    for (const scriptName of this.initScripts) {
      try {
        console.log(`📋 检查脚本: ${scriptName}`);
        
        // 检查是否已经执行过（通过检查特定记录）
        if (scriptName === 'fix_notification_frequency.sql') {
          const [result] = await pool.execute(
            'SELECT COUNT(*) as count FROM system_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?)',
            ['email_frequency', 'system_frequency', 'enable_login_notification', 'enable_upload_notification', 'enable_storage_warning', 'enable_security_alert', 'enable_maintenance_notification']
          );
          
          if (result[0].count >= 7) {
            console.log(`✅ 脚本 ${scriptName} 已执行过，跳过`);
            continue;
          }
        }

        // 执行脚本
        const success = await this.executeSqlScript(scriptName);
        if (success) {
          console.log(`✅ 脚本 ${scriptName} 执行完成`);
        } else {
          console.log(`⚠️ 脚本 ${scriptName} 执行失败`);
        }

      } catch (error) {
        console.error(`❌ 检查脚本 ${scriptName} 时出错:`, error.message);
      }
    }

    // 额外：强制确保通知相关表结构与字段（兼容低版本MySQL无 IF NOT EXISTS）
    try {
      // 确保 notification_history 存在
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS notification_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          sender_id INT NULL,
          notification_type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'normal',
          send_at DATETIME NULL,
          delete_at DATETIME NULL,
          target VARCHAR(20) DEFAULT 'all',
          is_read TINYINT(1) DEFAULT 0,
          read_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 检查并补齐列
      const [cols] = await pool.execute('DESCRIBE notification_history');
      const colNames = cols.map(c => c.Field);
      const addCol = async (sql) => {
        try { await pool.execute(sql); } catch (e) { /* 可能已存在，忽略 */ }
      };
      if (!colNames.includes('sender_id')) await addCol(`ALTER TABLE notification_history ADD COLUMN sender_id INT NULL`);
      if (!colNames.includes('priority')) await addCol(`ALTER TABLE notification_history ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'`);
      if (!colNames.includes('send_at')) await addCol(`ALTER TABLE notification_history ADD COLUMN send_at DATETIME NULL`);
      if (!colNames.includes('delete_at')) await addCol(`ALTER TABLE notification_history ADD COLUMN delete_at DATETIME NULL`);
      if (!colNames.includes('target')) await addCol(`ALTER TABLE notification_history ADD COLUMN target VARCHAR(20) DEFAULT 'all'`);
      if (!colNames.includes('updated_at')) await addCol(`ALTER TABLE notification_history ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);

      // 确保 user_notifications 表存在
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS user_notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          notification_id INT NOT NULL,
          user_id INT NOT NULL,
          is_read TINYINT(1) DEFAULT 0,
          read_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_notification_user (notification_id, user_id),
          INDEX idx_user_id_is_read (user_id, is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch (forceErr) {
      console.error('❌ 强制校验通知相关表结构失败:', forceErr.message);
    }

    console.log('🎉 数据库初始化脚本检查完成');
  }

  // 验证数据库连接
  async testConnection() {
    try {
      const [result] = await pool.execute('SELECT 1 as test');
      console.log('✅ 数据库连接正常');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  // 初始化数据库
  async initialize() {
    console.log('🚀 开始数据库初始化...');
    
    // 测试数据库连接
    const connected = await this.testConnection();
    if (!connected) {
      console.error('❌ 数据库连接失败，无法执行初始化');
      return false;
    }

    // 执行初始化脚本
    await this.checkAndExecuteInitScripts();
    
    console.log('✅ 数据库初始化完成');
    return true;
  }
}

module.exports = new DatabaseInitService();
