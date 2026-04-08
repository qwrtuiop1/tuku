const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.emailConfig = null;
  }

  // 初始化邮件配置
  async initEmailConfig() {
    try {
      const [settings] = await pool.execute(
        'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?)',
        ['enable_email_notification', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'sender_email', 'sender_name']
      );

      const config = {};
      settings.forEach(setting => {
        config[setting.setting_key] = setting.setting_value;
      });

      if (config.enable_email_notification === 'true' && 
          config.smtp_host && config.smtp_port && 
          config.smtp_username && config.smtp_password && 
          config.sender_email) {
        
        this.emailConfig = {
          host: config.smtp_host,
          port: parseInt(config.smtp_port),
          secure: config.smtp_port == 465,
          auth: {
            user: config.smtp_username,
            pass: config.smtp_password
          }
        };

        this.transporter = nodemailer.createTransport(this.emailConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error('初始化邮件配置失败:', error);
      return false;
    }
  }

  // 发送邮件通知
  async sendEmailNotification(to, subject, content, templateKey = null) {
    try {
      if (!this.transporter) {
        const initialized = await this.initEmailConfig();
        if (!initialized) {
          throw new Error('邮件服务未配置或配置错误');
        }
      }

      // 获取发件人信息
      const [senderSettings] = await pool.execute(
        'SELECT setting_value FROM system_settings WHERE setting_key IN (?, ?)',
        ['sender_email', 'sender_name']
      );

      const senderEmail = senderSettings.find(s => s.setting_key === 'sender_email')?.setting_value;
      const senderName = senderSettings.find(s => s.setting_key === 'sender_name')?.setting_value || '图库系统';

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: to,
        subject: subject,
        html: content
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // 记录发送历史
      await this.recordNotificationHistory(to, 'email', subject, content, templateKey);
      
      return result;
    } catch (error) {
      console.error('发送邮件通知失败:', error);
      throw error;
    }
  }

  // 发送系统通知
  async sendSystemNotification(userId, notificationType, title, content, templateKey = null) {
    try {
      // 检查用户是否启用了该类型的通知
      const [userSettings] = await pool.execute(
        'SELECT * FROM user_notification_settings WHERE user_id = ?',
        [userId]
      );

      if (userSettings.length === 0) {
        console.log(`用户 ${userId} 没有通知设置，跳过系统通知`);
        return;
      }

      const settings = userSettings[0];
      let shouldNotify = false;

      switch (notificationType) {
        case 'login':
          shouldNotify = settings.login_notifications;
          break;
        case 'upload':
          shouldNotify = settings.upload_notifications;
          break;
        case 'storage_warning':
          shouldNotify = settings.storage_warnings;
          break;
        case 'security_alert':
          shouldNotify = settings.security_alerts;
          break;
        case 'maintenance':
          shouldNotify = settings.maintenance_notifications;
          break;
        default:
          shouldNotify = true;
      }

      if (!shouldNotify) {
        console.log(`用户 ${userId} 禁用了 ${notificationType} 类型的通知`);
        return;
      }

      // 插入通知历史记录
      await pool.execute(
        'INSERT INTO notification_history (user_id, notification_type, title, content) VALUES (?, ?, ?, ?)',
        [userId, notificationType, title, content]
      );

      // 更新通知统计
      await this.updateNotificationStats(userId, notificationType);

      return true;
    } catch (error) {
      console.error('发送系统通知失败:', error);
      throw error;
    }
  }

  // 发送登录通知
  async sendLoginNotification(userId, loginInfo) {
    try {
      const { ipAddress, userAgent, loginTime } = loginInfo;
      
      // 获取用户信息
      const [users] = await pool.execute(
        'SELECT username, email FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      const title = '登录通知';
      const content = `用户 ${user.username} 在 ${loginTime} 从 ${ipAddress} 登录了系统`;

      // 发送系统通知
      await this.sendSystemNotification(userId, 'login', title, content);

      // 发送邮件通知（如果用户启用了邮件通知）
      if (user.email) {
        const emailContent = `
          <h2>登录通知</h2>
          <p>您的账户在 ${loginTime} 从 ${ipAddress} 登录了图库系统。</p>
          <p>如果这不是您的操作，请立即修改密码。</p>
          <p>用户代理：${userAgent}</p>
        `;
        
        await this.sendEmailNotification(user.email, '登录通知 - 图库系统', emailContent);
      }
    } catch (error) {
      console.error('发送登录通知失败:', error);
    }
  }

  // 发送文件上传通知
  async sendUploadNotification(userId, fileInfo) {
    try {
      const { fileName, fileSize, uploadTime } = fileInfo;
      
      const [users] = await pool.execute(
        'SELECT username, email FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      const title = '文件上传完成';
      const content = `用户 ${user.username} 上传了文件 ${fileName}`;

      // 发送系统通知
      await this.sendSystemNotification(userId, 'upload', title, content);

      // 发送邮件通知
      if (user.email) {
        const emailContent = `
          <h2>文件上传完成</h2>
          <p>您上传的文件 ${fileName} 已成功上传到图库系统。</p>
          <p>文件大小：${fileSize}</p>
          <p>上传时间：${uploadTime}</p>
        `;
        
        await this.sendEmailNotification(user.email, '文件上传完成 - 图库系统', emailContent);
      }
    } catch (error) {
      console.error('发送文件上传通知失败:', error);
    }
  }

  // 发送存储空间警告
  async sendStorageWarning(userId, storageInfo) {
    try {
      const { usagePercentage, remainingSpace, totalSpace } = storageInfo;
      
      const [users] = await pool.execute(
        'SELECT username, email FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      const title = '存储空间不足警告';
      const content = `用户 ${user.username} 的存储空间使用率已达到 ${usagePercentage}%`;

      // 发送系统通知
      await this.sendSystemNotification(userId, 'storage_warning', title, content);

      // 发送邮件通知
      if (user.email) {
        const emailContent = `
          <h2>存储空间不足警告</h2>
          <p>您的存储空间使用率已达到 ${usagePercentage}%，剩余空间 ${remainingSpace}。</p>
          <p>总空间：${totalSpace}</p>
          <p>建议及时清理不需要的文件。</p>
        `;
        
        await this.sendEmailNotification(user.email, '存储空间不足警告 - 图库系统', emailContent);
      }
    } catch (error) {
      console.error('发送存储空间警告失败:', error);
    }
  }

  // 发送安全提醒
  async sendSecurityAlert(userId, securityInfo) {
    try {
      const { eventType, eventDescription, ipAddress, eventTime } = securityInfo;
      
      const [users] = await pool.execute(
        'SELECT username, email FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      const title = '安全事件提醒';
      const content = `检测到用户 ${user.username} 的异常登录活动：${eventDescription}`;

      // 发送系统通知
      await this.sendSystemNotification(userId, 'security_alert', title, content);

      // 发送邮件通知
      if (user.email) {
        const emailContent = `
          <h2>安全事件提醒</h2>
          <p>检测到异常登录活动：${eventDescription}</p>
          <p>时间：${eventTime}</p>
          <p>IP地址：${ipAddress}</p>
          <p>如果这不是您的操作，请立即修改密码。</p>
        `;
        
        await this.sendEmailNotification(user.email, '安全事件提醒 - 图库系统', emailContent);
      }
    } catch (error) {
      console.error('发送安全提醒失败:', error);
    }
  }

  // 发送系统维护通知
  async sendMaintenanceNotification(maintenanceInfo) {
    try {
      const { message, startTime, estimatedEndTime } = maintenanceInfo;
      
      // 获取所有启用了维护通知的用户
      const [users] = await pool.execute(
        'SELECT u.id, u.username, u.email FROM users u ' +
        'JOIN user_notification_settings uns ON u.id = uns.user_id ' +
        'WHERE uns.maintenance_notifications = TRUE'
      );

      const title = '系统维护通知';
      
      for (const user of users) {
        const content = `系统维护通知：${message}`;
        
        // 发送系统通知
        await this.sendSystemNotification(user.id, 'maintenance', title, content);

        // 发送邮件通知
        if (user.email) {
          const emailContent = `
            <h2>系统维护通知</h2>
            <p>${message}</p>
            <p>维护时间：${startTime}</p>
            <p>预计恢复时间：${estimatedEndTime}</p>
          `;
          
          await this.sendEmailNotification(user.email, '系统维护通知 - 图库系统', emailContent);
        }
      }
    } catch (error) {
      console.error('发送系统维护通知失败:', error);
    }
  }

  // 记录通知历史
  async recordNotificationHistory(recipient, type, title, content, templateKey = null) {
    try {
      await pool.execute(
        'INSERT INTO notification_history (user_id, notification_type, title, content) VALUES (?, ?, ?, ?)',
        [recipient, type, title, content]
      );
    } catch (error) {
      console.error('记录通知历史失败:', error);
    }
  }

  // 更新通知统计
  async updateNotificationStats(userId, notificationType) {
    try {
      await pool.execute(
        'INSERT INTO notification_stats (user_id, notification_type, total_sent, last_sent_at) ' +
        'VALUES (?, ?, 1, NOW()) ' +
        'ON DUPLICATE KEY UPDATE total_sent = total_sent + 1, last_sent_at = NOW()',
        [userId, notificationType]
      );
    } catch (error) {
      console.error('更新通知统计失败:', error);
    }
  }

  // 获取用户通知历史
  async getUserNotificationHistory(userId, limit = 50, offset = 0) {
    try {
      const [notifications] = await pool.execute(
        'SELECT * FROM notification_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      return notifications;
    } catch (error) {
      console.error('获取用户通知历史失败:', error);
      throw error;
    }
  }

  // 标记通知为已读
  async markNotificationAsRead(notificationId, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE user_notifications SET is_read = 1, read_at = NOW() WHERE notification_id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (result.affectedRows > 0) {
        try {
          await pool.execute(
            'UPDATE notification_stats SET total_read = COALESCE(total_read, 0) + 1, last_read_at = NOW() WHERE user_id = ?',
            [userId]
          );
        } catch (e) {
          // 统计表可能不存在，忽略
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      throw error;
    }
  }

  // 清理过期通知
  async cleanExpiredNotifications() {
    try {
      const [settings] = await pool.execute(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['notification_retention_days']
      );

      const retentionDays = parseInt(settings[0]?.setting_value) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const [result] = await pool.execute(
        'DELETE FROM notification_history WHERE created_at < ?',
        [cutoffDate]
      );

      console.log(`清理了 ${result.affectedRows} 条过期通知`);
      return result.affectedRows;
    } catch (error) {
      console.error('清理过期通知失败:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
