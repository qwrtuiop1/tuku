const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function createNotificationTables() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 创建 notification_history 表
    console.log('\n📬 创建 notification_history 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
        title VARCHAR(200) NOT NULL COMMENT '通知标题',
        content TEXT COMMENT '通知内容',
        is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        read_at TIMESTAMP NULL COMMENT '阅读时间',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_notification_type (notification_type),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知历史记录表'
    `);
    console.log('✅ notification_history 表创建成功');
    
    // 创建 notification_templates 表
    console.log('\n📝 创建 notification_templates 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_key VARCHAR(100) UNIQUE NOT NULL COMMENT '模板键',
        template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
        template_type ENUM('email', 'system', 'push') NOT NULL COMMENT '模板类型',
        subject VARCHAR(500) COMMENT '邮件主题',
        content TEXT NOT NULL COMMENT '模板内容',
        variables JSON COMMENT '模板变量',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_template_key (template_key),
        INDEX idx_template_type (template_type),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表'
    `);
    console.log('✅ notification_templates 表创建成功');
    
    // 添加通知相关设置到 system_settings 表
    console.log('\n⚙️ 添加通知相关设置...');
    await connection.execute(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
      ('enable_login_notification', 'true', '是否启用登录通知'),
      ('enable_upload_notification', 'true', '是否启用文件上传通知'),
      ('enable_storage_warning', 'true', '是否启用存储空间警告'),
      ('enable_security_alert', 'true', '是否启用安全提醒'),
      ('enable_maintenance_notification', 'true', '是否启用系统维护通知'),
      ('email_frequency', 'realtime', '邮件通知频率'),
      ('system_frequency', 'realtime', '系统通知频率')
    `);
    console.log('✅ 通知相关设置添加成功');
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建结果...');
    
    // 检查 notification_history 表
    try {
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM notification_history');
      console.log('✅ notification_history 表存在，记录数:', result[0].count);
    } catch (error) {
      console.log('❌ notification_history 表不存在:', error.message);
    }
    
    // 检查 notification_templates 表
    try {
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM notification_templates');
      console.log('✅ notification_templates 表存在，记录数:', result[0].count);
    } catch (error) {
      console.log('❌ notification_templates 表不存在:', error.message);
    }
    
    // 检查通知相关设置
    const [settings] = await connection.execute(
      'SELECT setting_key FROM system_settings WHERE setting_key LIKE "%notification%" OR setting_key IN ("email_frequency", "system_frequency")'
    );
    console.log('📋 通知相关设置:', settings.map(s => s.setting_key));
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行创建
createNotificationTables().catch(console.error);

