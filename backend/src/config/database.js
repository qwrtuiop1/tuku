const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('❌ 缺少数据库环境变量，请确保 .env 中设置了 DB_HOST、DB_USER、DB_PASSWORD、DB_NAME');
  process.exit(1);
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 初始化数据库表
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        has_password TINYINT(1) NOT NULL DEFAULT 1,
        nickname VARCHAR(50),
        bio TEXT,
        avatar_url VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        storage_limit BIGINT DEFAULT 1073741824,
        used_storage BIGINT DEFAULT 0,
        last_login TIMESTAMP NULL,
        login_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 添加缺失的字段（如果表已存在）
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50)`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255)`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password TINYINT(1) NOT NULL DEFAULT 1 AFTER password_hash`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0`);
    } catch (error) {
      // 字段可能已存在，忽略错误
    }

    // 更新现有用户状态
    try {
      await connection.execute(`UPDATE users SET status = 'active' WHERE status IS NULL`);
    } catch (error) {
      // 忽略错误
    }

    // 强制检查并修复表结构
    try {
      // 检查表结构
      const [columns] = await connection.execute(`DESCRIBE users`);
      const columnNames = columns.map(col => col.Field);
      
      // 如果缺少必要字段，强制添加
      if (!columnNames.includes('status')) {
        console.log('🔧 检测到缺少status字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'`);
        await connection.execute(`UPDATE users SET status = 'active' WHERE status IS NULL`);
      }
      
      if (!columnNames.includes('last_login')) {
        console.log('🔧 检测到缺少last_login字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL`);
      }
      
      if (!columnNames.includes('login_count')) {
        console.log('🔧 检测到缺少login_count字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0`);
      }
      
      if (!columnNames.includes('nickname')) {
        console.log('🔧 检测到缺少nickname字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN nickname VARCHAR(50)`);
      }
      
      if (!columnNames.includes('bio')) {
        console.log('🔧 检测到缺少bio字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN bio TEXT`);
      }
      
      if (!columnNames.includes('avatar_url')) {
        console.log('🔧 检测到缺少avatar_url字段，正在添加...');
        await connection.execute(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)`);
      }
      
      // 枚举扩展：third_party_type 增加 'epass'（容错执行）
      try {
        await connection.execute("ALTER TABLE users MODIFY third_party_type ENUM('qq','wechat','local','epass') DEFAULT 'local'");
      } catch (e) {
        // 可能已存在或无此列，忽略
      }

      console.log('✅ 数据库表结构检查完成');
    } catch (error) {
      console.error('❌ 数据库表结构检查失败:', error.message);
    }

    // 创建文件夹表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS folders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        folder_name VARCHAR(255) NOT NULL,
        parent_folder_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE,
        INDEX idx_user_parent (user_id, parent_folder_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建文件表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type ENUM('image', 'video') NOT NULL,
        file_size BIGINT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        thumbnail_path VARCHAR(500),
        folder_id INT DEFAULT NULL,
        mime_type VARCHAR(100) NOT NULL,
        width INT,
        height INT,
        duration INT DEFAULT NULL,
        file_hash VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
        INDEX idx_user_folder (user_id, folder_id),
        INDEX idx_file_type (file_type),
        INDEX idx_created_at (created_at),
        INDEX idx_file_hash (file_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建系统设置表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建系统统计缓存表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stat_key VARCHAR(100) UNIQUE NOT NULL,
        stat_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 插入默认系统设置
    await connection.execute(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
      ('max_file_size', '104857600', '最大文件大小(字节)'),
      ('allowed_image_types', 'jpg,jpeg,png,gif,webp,svg', '允许的图片类型'),
      ('allowed_video_types', 'mp4,webm,mov', '允许的视频类型'),
      ('thumbnail_size', '300', '缩略图尺寸'),
      ('system_name', '图库系统', '系统名称')
    `);

    // 创建用户偏好设置表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        default_view VARCHAR(10) DEFAULT 'grid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preferences (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户通知设置表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email_notifications BOOLEAN DEFAULT TRUE,
        storage_warnings BOOLEAN DEFAULT TRUE,
        security_alerts BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_notification_settings (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 扩展登录日志 login_method 枚举，增加 'epass'（容错执行）
    try {
      await connection.execute("ALTER TABLE user_login_logs MODIFY login_method ENUM('password','qq','email','epass') DEFAULT 'password'");
    } catch (e) {
      // 表可能不存在或已包含，忽略
    }

    // 创建用户趋势数据表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_trends (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        trend_date DATE NOT NULL,
        total_files INT DEFAULT 0,
        total_size BIGINT DEFAULT 0,
        image_count INT DEFAULT 0,
        image_size BIGINT DEFAULT 0,
        video_count INT DEFAULT 0,
        video_size BIGINT DEFAULT 0,
        folder_count INT DEFAULT 0,
        other_files INT DEFAULT 0,
        other_size BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_trend (user_id, trend_date),
        INDEX idx_user_date (user_id, trend_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 为现有用户创建默认设置
    await connection.execute(`
      INSERT IGNORE INTO user_preferences (user_id, default_view)
      SELECT id, 'grid' FROM users
    `);

    await connection.execute(`
      INSERT IGNORE INTO user_notification_settings (user_id, email_notifications, storage_warnings, security_alerts)
      SELECT id, TRUE, TRUE, TRUE FROM users
    `);

    // 创建用户设置历史记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_settings_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        setting_type ENUM('preferences', 'notifications', 'profile') NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        change_reason VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_setting_type (setting_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 用户收藏/星标文件表
    await connection.execute(`
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

    // 创建默认管理员用户（如不存在则提示）
    // 注意：生产环境应通过环境变量配置，禁止自动创建弱密码管理员
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || '', 10);
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      await connection.execute(`
        INSERT IGNORE INTO users (username, email, password_hash, role, status) VALUES
        (?, ?, ?, 'admin', 'active')
      `, [process.env.ADMIN_USERNAME, process.env.ADMIN_EMAIL || `${process.env.ADMIN_USERNAME}@tuku.local`, adminPassword]);
      console.log('✅ 管理员账户已通过环境变量配置');
    } else {
      console.log('ℹ️  未配置 ADMIN_USERNAME/ADMIN_PASSWORD，跳过自动创建管理员');
      console.log('   请在 .env 中设置 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_EMAIL 以创建管理员账户');
    }

    connection.release();
    console.log('✅ 数据库表初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
};

// Helper: 获取缓存的统计数据
const getCachedStat = async (key) => {
  try {
    const [rows] = await pool.execute(
      'SELECT stat_value FROM system_stats WHERE stat_key = ?',
      [key]
    );
    return rows.length > 0 ? rows[0].stat_value : null;
  } catch { return null; }
};

// Helper: 设置缓存的统计数据
const setCachedStat = async (key, value) => {
  try {
    await pool.execute(
      'INSERT INTO system_stats (stat_key, stat_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE stat_value = VALUES(stat_value)',
      [key, String(value)]
    );
  } catch { /* ignore */ }
};

module.exports = {
  pool,
  testConnection,
  initDatabase,
  getCachedStat,
  setCachedStat
};

