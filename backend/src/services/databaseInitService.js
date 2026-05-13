const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

class DatabaseInitService {
  constructor() {
    this.initScripts = [
      // 第三方登录/绑定所需字段
      'add_third_party_login.sql',
      'add_qq_unionid.sql',
      'add_epass_id.sql',
      // 其他初始化修复
      'fix_notification_frequency.sql',
      // 实况媒体表
      'create_live_media_assets.sql',
      'create_live_media_jobs.sql',
      'create_live_media_variants.sql',
      'add_live_media_folder_id.sql',
      // 新功能表
      'add_tags.sql',
      'add_albums.sql',
      'add_recycle_bin.sql'
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

    // 额外兜底：强制确保 users 表包含第三方绑定相关列与索引
    try {
      const [cols] = await pool.execute('DESCRIBE users');
      const colNames = cols.map(c => c.Field);
      const ensureCol = async (sql) => { try { await pool.execute(sql); } catch (e) { /* 可能已存在或不支持IF NOT EXISTS，忽略 */ } };
      const ensureIdx = async (sql) => { try { await pool.execute(sql); } catch (e) { /* 可能已存在或列缺失，忽略 */ } };

      if (!colNames.includes('qq_openid')) await ensureCol(`ALTER TABLE users ADD COLUMN qq_openid VARCHAR(64) NULL COMMENT 'QQ OpenID'`);
      if (!colNames.includes('wechat_openid')) await ensureCol(`ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(64) NULL COMMENT '微信OpenID'`);
      if (!colNames.includes('third_party_type')) await ensureCol(`ALTER TABLE users ADD COLUMN third_party_type ENUM('qq','wechat','local') DEFAULT 'local' COMMENT '登录类型'`);
      if (!colNames.includes('third_party_id')) await ensureCol(`ALTER TABLE users ADD COLUMN third_party_id VARCHAR(64) NULL COMMENT '第三方平台用户ID'`);
      if (!colNames.includes('avatar_url')) await ensureCol(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL COMMENT '头像URL'`);
      if (!colNames.includes('qq_unionid')) await ensureCol(`ALTER TABLE users ADD COLUMN qq_unionid VARCHAR(128) NULL COMMENT 'QQ UnionID'`);
      if (!colNames.includes('epass_id')) await ensureCol(`ALTER TABLE users ADD COLUMN epass_id VARCHAR(128) NULL COMMENT 'EPass通行证ID'`);

      // 尝试创建索引（忽略已存在或列不存在错误）
      await ensureIdx(`CREATE INDEX idx_users_qq_openid ON users(qq_openid)`);
      await ensureIdx(`CREATE INDEX idx_users_wechat_openid ON users(wechat_openid)`);
      await ensureIdx(`CREATE INDEX idx_users_third_party ON users(third_party_type, third_party_id)`);
      await ensureIdx(`CREATE UNIQUE INDEX uk_users_qq_unionid ON users(qq_unionid)`);
      await ensureIdx(`CREATE UNIQUE INDEX uk_users_epass_id ON users(epass_id)`);
      await ensureIdx(`CREATE UNIQUE INDEX uk_users_email ON users(email)`);
    } catch (e) {
      console.error('❌ 兜底检查 users 表结构失败:', e.message);
    }
    
    console.log('✅ 数据库初始化完成');
    
    // 兜底：确保 live_media_assets.folder_id 存在并建立索引/外键
    try {
      const [lmCols] = await pool.execute('DESCRIBE live_media_assets');
      const lmColNames = lmCols.map(c => c.Field);
      if (!lmColNames.includes('folder_id')) {
        try { await pool.execute('ALTER TABLE live_media_assets ADD COLUMN folder_id INT NULL'); } catch (_) {}
      }
      try { await pool.execute('ALTER TABLE live_media_assets ADD INDEX idx_owner_folder (owner_user_id, folder_id)'); } catch (_) {}
      try { await pool.execute('ALTER TABLE live_media_assets ADD CONSTRAINT fk_live_asset_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL'); } catch (_) {}
    } catch (e) {
      console.error('❌ 兜底添加 live_media_assets.folder_id 失败:', e.message);
    }
    
    // 兜底：扩展 live_media_jobs.status 枚举加入 cancelled
    try {
      await pool.execute("ALTER TABLE live_media_jobs MODIFY COLUMN status ENUM('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued'");
    } catch (_) {}

    // 兜底：确保 file_favorites 表存在
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS file_favorites (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          file_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_file_favorite (user_id, file_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ file_favorites 表检查完成');
    } catch (e) {
      console.error('❌ 兜底创建 file_favorites 表失败:', e.message);
    }

    // 兜底：确保回收站相关表和字段存在
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS recycle_bin (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          file_id INT NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          thumbnail_path VARCHAR(500),
          file_type ENUM('image', 'video') NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          width INT,
          height INT,
          duration INT,
          file_hash VARCHAR(64),
          deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expire_at TIMESTAMP NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      const [upCols] = await pool.execute('DESCRIBE user_preferences');
      const upColNames = upCols.map(c => c.Field);
      const safeAddCol = async (col, sql) => {
        if (!upColNames.includes(col)) {
          try { await pool.execute(sql); } catch (e) { console.warn(`⚠️ 添加列 ${col} 失败:`, e.message); }
        }
      };
      await safeAddCol('recycle_days', "ALTER TABLE user_preferences ADD COLUMN recycle_days INT DEFAULT 30");
      await safeAddCol('auto_cleanup', "ALTER TABLE user_preferences ADD COLUMN auto_cleanup TINYINT(1) DEFAULT 1");
      console.log('✅ recycle_bin 表及字段检查完成');
    } catch (e) {
      console.error('❌ 兜底创建 recycle_bin 表失败:', e.message);
    }

    // 兜底：确保标签系统表存在
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS file_tags (
          id INT PRIMARY KEY AUTO_INCREMENT,
          tag_name VARCHAR(50) NOT NULL,
          tag_color VARCHAR(20) DEFAULT '#409EFF',
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_tag (user_id, tag_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS file_tag_relations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          file_id INT NOT NULL,
          tag_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES file_tags(id) ON DELETE CASCADE,
          UNIQUE KEY unique_file_tag (file_id, tag_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ 标签系统表检查完成');
    } catch (e) {
      console.error('❌ 兜底创建标签系统表失败:', e.message);
    }

    // 兜底：确保相册系统表存在
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS albums (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          album_name VARCHAR(100) NOT NULL,
          album_description TEXT,
          cover_file_id INT NULL,
          is_public TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (cover_file_id) REFERENCES files(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS album_files (
          id INT PRIMARY KEY AUTO_INCREMENT,
          album_id INT NOT NULL,
          file_id INT NOT NULL,
          sort_order INT DEFAULT 0,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
          UNIQUE KEY unique_album_file (album_id, file_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ 相册系统表检查完成');
    } catch (e) {
      console.error('❌ 兜底创建相册系统表失败:', e.message);
    }

    return true;
  }
}

module.exports = new DatabaseInitService();
