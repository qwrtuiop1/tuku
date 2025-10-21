const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function checkNotificationDetails() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查通知的完整内容
    console.log('\n📋 检查通知详细内容...');
    
    const [notifications] = await connection.execute(`
      SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, 
             nh.sender_id, nh.target, nh.created_at,
             un.user_id, un.is_read, un.read_at, un.created_at as user_notification_created_at
      FROM notification_history nh
      LEFT JOIN user_notifications un ON nh.id = un.notification_id
      ORDER BY nh.created_at DESC
    `);
    
    console.log(`📊 找到 ${notifications.length} 条通知记录:`);
    notifications.forEach((notification, index) => {
      console.log(`\n📝 通知 ${index + 1}:`);
      console.log(`  - 通知ID: ${notification.id}`);
      console.log(`  - 类型: ${notification.notification_type}`);
      console.log(`  - 标题: "${notification.title}"`);
      console.log(`  - 内容: "${notification.content}"`);
      console.log(`  - 优先级: ${notification.priority}`);
      console.log(`  - 发送者ID: ${notification.sender_id}`);
      console.log(`  - 目标: ${notification.target}`);
      console.log(`  - 创建时间: ${notification.created_at}`);
      console.log(`  - 用户ID: ${notification.user_id}`);
      console.log(`  - 已读状态: ${notification.is_read}`);
      console.log(`  - 阅读时间: ${notification.read_at}`);
      console.log(`  - 用户通知创建时间: ${notification.user_notification_created_at}`);
    });
    
    // 检查特定用户的通知
    console.log('\n👤 检查特定用户的通知...');
    const [users] = await connection.execute('SELECT id, username, email FROM users ORDER BY id');
    
    for (const user of users) {
      const [userNotifications] = await connection.execute(
        `SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, 
                un.created_at, un.is_read, un.read_at
         FROM user_notifications un
         JOIN notification_history nh ON nh.id = un.notification_id
         WHERE un.user_id = ?
         ORDER BY un.created_at DESC`,
        [user.id]
      );
      
      console.log(`\n👤 用户 ${user.username} (ID: ${user.id}) 的通知:`);
      if (userNotifications.length === 0) {
        console.log('  - 无通知');
      } else {
        userNotifications.forEach(notification => {
          console.log(`  - ID: ${notification.id}, 类型: ${notification.notification_type}, 标题: "${notification.title}", 已读: ${notification.is_read}`);
        });
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
checkNotificationDetails().catch(console.error);
