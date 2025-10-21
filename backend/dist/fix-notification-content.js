const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '134.175.220.243',
  user: 'tuku',
  password: 'RHd5biyaXmaAbyDC',
  database: 'tuku',
  charset: 'utf8mb4'
};

async function fixNotificationContent() {
  let connection;
  
  try {
    console.log('🔍 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 更新通知内容
    console.log('\n📝 更新通知内容...');
    
    const [result] = await connection.execute(
      `UPDATE notification_history 
       SET title = ?, content = ?, priority = ?
       WHERE id = ?`,
      [
        '系统通知测试',
        '这是一条系统通知的测试消息。用于验证通知功能是否正常工作。',
        'normal',
        18
      ]
    );
    
    console.log(`✅ 更新了 ${result.affectedRows} 条通知记录`);
    
    // 验证更新结果
    const [updated] = await connection.execute(
      'SELECT id, title, content, priority FROM notification_history WHERE id = ?',
      [18]
    );
    
    if (updated.length > 0) {
      const notification = updated[0];
      console.log('\n📋 更新后的通知内容:');
      console.log(`  - ID: ${notification.id}`);
      console.log(`  - 标题: "${notification.title}"`);
      console.log(`  - 内容: "${notification.content}"`);
      console.log(`  - 优先级: ${notification.priority}`);
    }
    
    // 创建一些新的测试通知
    console.log('\n📝 创建新的测试通知...');
    
    const testNotifications = [
      {
        title: '欢迎使用图库系统',
        content: '欢迎您使用图库系统！您可以开始上传和管理您的文件了。',
        type: 'system',
        priority: 'normal',
        target: 'all'
      },
      {
        title: '存储空间提醒',
        content: '您的存储空间使用率已达到80%，建议及时清理不需要的文件。',
        type: 'storage_warning',
        priority: 'high',
        target: 'all'
      },
      {
        title: '系统维护通知',
        content: '系统将于今晚23:00-24:00进行维护，期间可能影响正常使用。',
        type: 'maintenance',
        priority: 'urgent',
        target: 'all'
      }
    ];
    
    for (const notification of testNotifications) {
      // 插入通知历史记录
      const [insertResult] = await connection.execute(
        `INSERT INTO notification_history 
         (notification_type, title, content, priority, target, sender_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          notification.type,
          notification.title,
          notification.content,
          notification.priority,
          notification.target,
          1 // 发送者ID
        ]
      );
      
      const notificationId = insertResult.insertId;
      console.log(`✅ 创建通知 ${notificationId}: ${notification.title}`);
      
      // 为所有用户创建通知投递记录
      const [users] = await connection.execute('SELECT id FROM users WHERE status = "active"');
      
      for (const user of users) {
        await connection.execute(
          'INSERT IGNORE INTO user_notifications (notification_id, user_id, is_read, created_at) VALUES (?, ?, 0, NOW())',
          [notificationId, user.id]
        );
      }
      
      console.log(`✅ 通知 ${notificationId} 已发送给 ${users.length} 个用户`);
    }
    
    // 验证最终结果
    console.log('\n🔍 验证最终结果...');
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM notification_history');
    const [userNotificationCount] = await connection.execute('SELECT COUNT(*) as count FROM user_notifications');
    
    console.log(`📊 通知历史记录总数: ${finalCount[0].count}`);
    console.log(`📊 用户通知投递记录总数: ${userNotificationCount[0].count}`);
    
    // 显示最新的通知
    const [latestNotifications] = await connection.execute(
      `SELECT nh.id, nh.title, nh.content, nh.notification_type, nh.priority, nh.created_at,
              COUNT(un.id) as recipient_count
       FROM notification_history nh
       LEFT JOIN user_notifications un ON nh.id = un.notification_id
       GROUP BY nh.id
       ORDER BY nh.created_at DESC
       LIMIT 5`
    );
    
    console.log('\n📋 最新的通知:');
    latestNotifications.forEach(notification => {
      console.log(`  - ID: ${notification.id}, 标题: "${notification.title}", 类型: ${notification.notification_type}, 接收者: ${notification.recipient_count}人`);
    });
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行修复
fixNotificationContent().catch(console.error);
