const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查所有表
    console.log('\n📋 检查数据库表结构:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('现有表:', tables.map(t => Object.values(t)[0]));
    
    // 检查 system_settings 表
    console.log('\n⚙️ 检查 system_settings 表:');
    const [settings] = await connection.execute('SELECT setting_key, setting_value FROM system_settings ORDER BY setting_key');
    console.log('系统设置:', settings);
    
    // 检查 notification_history 表是否存在
    console.log('\n📬 检查 notification_history 表:');
    try {
      const [notifications] = await connection.execute('DESCRIBE notification_history');
      console.log('✅ notification_history 表存在');
      console.log('表结构:', notifications);
      
      // 检查表中的数据
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM notification_history');
      console.log('通知记录数量:', count[0].count);
    } catch (error) {
      console.log('❌ notification_history 表不存在:', error.message);
    }
    
    // 检查 notification_templates 表是否存在
    console.log('\n📝 检查 notification_templates 表:');
    try {
      const [templates] = await connection.execute('DESCRIBE notification_templates');
      console.log('✅ notification_templates 表存在');
      console.log('表结构:', templates);
    } catch (error) {
      console.log('❌ notification_templates 表不存在:', error.message);
    }
    
    // 检查用户表结构
    console.log('\n👤 检查 users 表结构:');
    const [users] = await connection.execute('DESCRIBE users');
    console.log('users 表结构:', users);
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行检查
checkDatabaseStructure().catch(console.error);
