const mysql = require('mysql2/promise');

async function testDatabaseValues() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tuku',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('=== 检查数据库中的 max_file_size 值 ===');
    
    const [result] = await pool.execute(
      'SELECT setting_key, setting_value, updated_at FROM system_settings WHERE setting_key = ?',
      ['max_file_size']
    );
    
    if (result.length > 0) {
      const setting = result[0];
      const bytes = parseInt(setting.setting_value);
      const mb = Math.round(bytes / (1024 * 1024));
      
      console.log('设置键:', setting.setting_key);
      console.log('原始值 (bytes):', setting.setting_value);
      console.log('转换后 (MB):', mb);
      console.log('最后更新时间:', setting.updated_at);
    } else {
      console.log('未找到 max_file_size 设置');
    }
    
    // 检查所有存储相关设置
    console.log('\n=== 所有存储相关设置 ===');
    const [allSettings] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE "%file%" OR setting_key LIKE "%storage%" ORDER BY setting_key'
    );
    
    allSettings.forEach(setting => {
      console.log(`${setting.setting_key}: ${setting.setting_value}`);
    });
    
  } catch (error) {
    console.error('数据库查询失败:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseValues();
