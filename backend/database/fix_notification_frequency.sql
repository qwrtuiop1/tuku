-- 修复通知设置缺失字段
-- 添加缺失的通知频率设置字段到系统设置表

INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
-- 通知频率设置
('email_frequency', 'realtime', '邮件通知频率'),
('system_frequency', 'realtime', '系统通知频率'),

-- 用户通知偏好设置（系统级默认值）
('enable_login_notification', 'true', '是否启用登录通知'),
('enable_upload_notification', 'true', '是否启用文件上传通知'),
('enable_storage_warning', 'true', '是否启用存储空间警告'),
('enable_security_alert', 'true', '是否启用安全提醒'),
('enable_maintenance_notification', 'true', '是否启用系统维护通知');

-- 显示执行结果
SELECT '通知设置字段修复完成!' as message;
SELECT setting_key, setting_value, description 
FROM system_settings 
WHERE setting_key IN ('email_frequency', 'system_frequency', 'enable_login_notification', 'enable_upload_notification', 'enable_storage_warning', 'enable_security_alert', 'enable_maintenance_notification');
