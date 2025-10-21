const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function quickCheck() {
  let connection;
  
  try {
    console.log('🔍 快速检查数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查 notification_history 表
    try {
      await connection.execute('SELECT 1 FROM notification_history LIMIT 1');
      console.log('✅ notification_history 表存在');
    } catch (error) {
      console.log('❌ notification_history 表不存在:', error.message);
    }
    
    // 检查 system_settings 中的通知设置
    const [settings] = await connection.execute(
      'SELECT setting_key FROM system_settings WHERE setting_key LIKE "%notification%" OR setting_key IN ("email_frequency", "system_frequency")'
    );
    console.log('📋 通知相关设置:', settings.map(s => s.setting_key));
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickCheck().catch(console.error);
