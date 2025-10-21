-- 添加缺失的系统级通知设置
-- 确保系统设置表包含所有通知相关的配置项

INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
-- 邮件通知配置
('enable_email_notification', 'false', '是否启用邮件通知'),
('smtp_host', '', 'SMTP服务器地址'),
('smtp_port', '587', 'SMTP端口'),
('smtp_username', '', 'SMTP用户名'),
('smtp_password', '', 'SMTP密码'),
('sender_email', '', '发送者邮箱'),
('sender_name', '图库系统', '发送者名称'),

-- 系统通知配置
('enable_system_notification', 'true', '是否启用系统通知'),
('notification_retention_days', '30', '通知保留天数');

-- 显示执行结果
SELECT '系统级通知设置添加完成!' as message;
SELECT setting_key, setting_value, description 
FROM system_settings 
WHERE setting_key IN (
  'enable_email_notification', 'smtp_host', 'smtp_port', 'smtp_username', 
  'smtp_password', 'sender_email', 'sender_name', 'enable_system_notification', 
  'notification_retention_days', 'email_frequency', 'system_frequency'
)
ORDER BY setting_key;

