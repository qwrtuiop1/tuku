const mysql = require('mysql2/promise');
const config = require('./dist/src/config/database.js');

async function fixMissingUserNotifications() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('🔍 检查缺失的用户通知记录...');
    
    // 查找所有没有 user_notifications 记录的通知
    const [orphanedNotifications] = await connection.execute(`
      SELECT nh.id, nh.title, nh.target, nh.sender_id, nh.created_at
      FROM notification_history nh
      LEFT JOIN user_notifications un ON nh.id = un.notification_id
      WHERE un.notification_id IS NULL
      ORDER BY nh.id DESC
    `);
    
    console.log(`发现 ${orphanedNotifications.length} 条缺失用户通知记录的通知:`);
    orphanedNotifications.forEach(n => {
      console.log(`- ID: ${n.id}, 标题: ${n.title}, 目标: ${n.target}, 发送者: ${n.sender_id}`);
    });
    
    if (orphanedNotifications.length === 0) {
      console.log('✅ 没有发现缺失的用户通知记录');
      return;
    }
    
    console.log('\n🔧 开始修复...');
    
    for (const notification of orphanedNotifications) {
      console.log(`\n处理通知 ID: ${notification.id}`);
      
      // 根据通知的目标范围确定用户
      let query = 'SELECT id FROM users WHERE status = "active"';
      let params = [];
      
      if (notification.target === 'admin') {
        query += ' AND role = "admin"';
      } else if (notification.target === 'user') {
        query += ' AND role = "user"';
      }
      
      if (notification.sender_id) {
        query += ' AND id <> ?';
        params.push(notification.sender_id);
      }
      
      const [users] = await connection.execute(query, params);
      console.log(`  找到 ${users.length} 个目标用户`);
      
      // 为每个用户创建通知记录
      for (const user of users) {
        try {
          await connection.execute(
            'INSERT IGNORE INTO user_notifications (notification_id, user_id, is_read, created_at) VALUES (?, ?, 0, NOW())',
            [notification.id, user.id]
          );
          console.log(`  ✅ 为用户 ${user.id} 创建通知记录`);
        } catch (error) {
          console.log(`  ❌ 为用户 ${user.id} 创建通知记录失败:`, error.message);
        }
      }
    }
    
    console.log('\n✅ 修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  } finally {
    await connection.end();
  }
}

fixMissingUserNotifications();
