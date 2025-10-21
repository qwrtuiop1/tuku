const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function checkNotificationData() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查表结构
    console.log('\n📋 检查通知相关表结构...');
    
    // 检查 notification_history 表
    try {
      const [columns] = await connection.execute('DESCRIBE notification_history');
      console.log('✅ notification_history 表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
      
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM notification_history');
      console.log(`📊 notification_history 记录数: ${count[0].count}`);
      
      if (count[0].count > 0) {
        const [samples] = await connection.execute('SELECT id, notification_type, title, created_at FROM notification_history ORDER BY created_at DESC LIMIT 5');
        console.log('📝 最近的通知记录:');
        samples.forEach(record => {
          console.log(`  - ID: ${record.id}, 类型: ${record.notification_type}, 标题: ${record.title}, 时间: ${record.created_at}`);
        });
      }
    } catch (error) {
      console.log('❌ notification_history 表不存在:', error.message);
    }
    
    // 检查 user_notifications 表
    try {
      const [columns] = await connection.execute('DESCRIBE user_notifications');
      console.log('\n✅ user_notifications 表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });
      
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM user_notifications');
      console.log(`📊 user_notifications 记录数: ${count[0].count}`);
      
      if (count[0].count > 0) {
        const [samples] = await connection.execute('SELECT id, notification_id, user_id, is_read, created_at FROM user_notifications ORDER BY created_at DESC LIMIT 5');
        console.log('📝 最近的用户通知记录:');
        samples.forEach(record => {
          console.log(`  - ID: ${record.id}, 通知ID: ${record.notification_id}, 用户ID: ${record.user_id}, 已读: ${record.is_read}, 时间: ${record.created_at}`);
        });
      }
    } catch (error) {
      console.log('❌ user_notifications 表不存在:', error.message);
    }
    
    // 检查用户表
    console.log('\n👥 检查用户数据...');
    const [users] = await connection.execute('SELECT id, username, email, role FROM users ORDER BY id LIMIT 5');
    console.log('📝 用户列表:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}`);
    });
    
    // 测试通知查询
    console.log('\n🔍 测试通知查询...');
    if (users.length > 0) {
      const testUserId = users[0].id;
      console.log(`测试用户ID: ${testUserId}`);
      
      try {
        // 测试获取所有通知的查询
        const [allNotifications] = await connection.execute(
          `SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, 
                  un.created_at, un.is_read, un.read_at
           FROM user_notifications un
           JOIN notification_history nh ON nh.id = un.notification_id
           WHERE un.user_id = ?
           ORDER BY un.created_at DESC
           LIMIT 50`,
          [testUserId]
        );
        
        console.log(`📬 用户 ${testUserId} 的所有通知 (${allNotifications.length} 条):`);
        allNotifications.forEach(notification => {
          console.log(`  - ID: ${notification.id}, 类型: ${notification.notification_type}, 标题: ${notification.title}, 已读: ${notification.is_read}`);
        });
        
        // 测试获取未读通知的查询
        const [unreadNotifications] = await connection.execute(
          `SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, un.created_at
           FROM user_notifications un
           JOIN notification_history nh ON nh.id = un.notification_id
           WHERE un.user_id = ? AND un.is_read = 0
           ORDER BY un.created_at DESC
           LIMIT 10`,
          [testUserId]
        );
        
        console.log(`📬 用户 ${testUserId} 的未读通知 (${unreadNotifications.length} 条):`);
        unreadNotifications.forEach(notification => {
          console.log(`  - ID: ${notification.id}, 类型: ${notification.notification_type}, 标题: ${notification.title}`);
        });
        
      } catch (error) {
        console.log('❌ 测试通知查询失败:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行检查
checkNotificationData().catch(console.error);
