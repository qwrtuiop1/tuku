-- 增强通知设置功能
-- 扩展系统设置表，添加更多通知相关设置

-- 添加新的通知设置字段到系统设置表
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
-- 用户通知偏好设置
('enable_login_notification', 'true', '是否启用登录通知'),
('enable_upload_notification', 'true', '是否启用文件上传通知'),
('enable_storage_warning', 'true', '是否启用存储空间警告'),
('enable_security_alert', 'true', '是否启用安全提醒'),
('enable_maintenance_notification', 'true', '是否启用系统维护通知'),

-- 通知频率设置
('email_frequency', 'realtime', '邮件通知频率'),
('system_frequency', 'realtime', '系统通知频率');

-- 扩展用户通知设置表，添加更多通知类型字段（每条单独执行，兼容低版本MySQL）
ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS login_notifications BOOLEAN DEFAULT TRUE COMMENT '登录通知';
ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS upload_notifications BOOLEAN DEFAULT TRUE COMMENT '文件上传通知';
ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS maintenance_notifications BOOLEAN DEFAULT TRUE COMMENT '系统维护通知';
ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS email_frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '邮件通知频率';
ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS system_frequency VARCHAR(20) DEFAULT 'realtime' COMMENT '系统通知频率';

-- 为现有用户更新默认设置
UPDATE user_notification_settings
SET
  login_notifications = TRUE,
  upload_notifications = TRUE,
  maintenance_notifications = TRUE,
  email_frequency = 'realtime',
  system_frequency = 'realtime'
WHERE login_notifications IS NULL;

-- 创建通知历史记录表
CREATE TABLE IF NOT EXISTS notification_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT COMMENT '通知内容',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  read_at TIMESTAMP NULL COMMENT '阅读时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知历史记录表';

-- 创建通知模板表
CREATE TABLE IF NOT EXISTS notification_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(100) UNIQUE NOT NULL COMMENT '模板键',
  template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
  template_type ENUM('email', 'system', 'push') NOT NULL COMMENT '模板类型',
  subject VARCHAR(500) COMMENT '邮件主题',
  content TEXT NOT NULL COMMENT '模板内容',
  variables JSON COMMENT '模板变量',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_template_key (template_key),
  INDEX idx_template_type (template_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 插入默认通知模板
INSERT IGNORE INTO notification_templates (template_key, template_name, template_type, subject, content, variables) VALUES
-- 登录通知模板
('login_notification', '用户登录通知', 'email', '登录通知 - {{system_name}}',
'<h2>登录通知</h2><p>您的账户在 {{login_time}} 从 {{ip_address}} 登录了 {{system_name}}。</p><p>如果这不是您的操作，请立即修改密码。</p>',
'{"system_name": "系统名称", "login_time": "登录时间", "ip_address": "IP地址"}'),

('login_notification_system', '用户登录通知', 'system', NULL,
'用户 {{username}} 在 {{login_time}} 从 {{ip_address}} 登录了系统',
'{"username": "用户名", "login_time": "登录时间", "ip_address": "IP地址"}'),

-- 文件上传通知模板
('upload_notification', '文件上传完成通知', 'email', '文件上传完成 - {{system_name}}',
'<h2>文件上传完成</h2><p>您上传的文件 {{file_name}} 已成功上传到 {{system_name}}。</p><p>文件大小：{{file_size}}</p>',
'{"system_name": "系统名称", "file_name": "文件名", "file_size": "文件大小"}'),

('upload_notification_system', '文件上传完成通知', 'system', NULL,
'用户 {{username}} 上传了文件 {{file_name}}',
'{"username": "用户名", "file_name": "文件名"}'),

-- 存储空间警告模板
('storage_warning', '存储空间不足警告', 'email', '存储空间不足警告 - {{system_name}}',
'<h2>存储空间不足警告</h2><p>您的存储空间使用率已达到 {{usage_percentage}}%，剩余空间 {{remaining_space}}。</p><p>建议及时清理不需要的文件。</p>',
'{"system_name": "系统名称", "usage_percentage": "使用率", "remaining_space": "剩余空间"}'),

('storage_warning_system', '存储空间不足警告', 'system', NULL,
'用户 {{username}} 的存储空间使用率已达到 {{usage_percentage}}%',
'{"username": "用户名", "usage_percentage": "使用率"}'),

-- 安全提醒模板
('security_alert', '安全事件提醒', 'email', '安全事件提醒 - {{system_name}}',
'<h2>安全事件提醒</h2><p>检测到异常登录活动：{{event_description}}</p><p>时间：{{event_time}}</p><p>IP地址：{{ip_address}}</p><p>如果这不是您的操作，请立即修改密码。</p>',
'{"system_name": "系统名称", "event_description": "事件描述", "event_time": "事件时间", "ip_address": "IP地址"}'),

('security_alert_system', '安全事件提醒', 'system', NULL,
'检测到用户 {{username}} 的异常登录活动：{{event_description}}',
'{"username": "用户名", "event_description": "事件描述"}'),

-- 系统维护通知模板
('maintenance_notification', '系统维护通知', 'email', '系统维护通知 - {{system_name}}',
'<h2>系统维护通知</h2><p>{{maintenance_message}}</p><p>维护时间：{{maintenance_time}}</p><p>预计恢复时间：{{estimated_recovery_time}}</p>',
'{"system_name": "系统名称", "maintenance_message": "维护消息", "maintenance_time": "维护时间", "estimated_recovery_time": "预计恢复时间"}'),

('maintenance_notification_system', '系统维护通知', 'system', NULL,
'系统维护通知：{{maintenance_message}}',
'{"maintenance_message": "维护消息"}');

-- 创建通知队列表（用于异步发送通知）
CREATE TABLE IF NOT EXISTS notification_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
  template_key VARCHAR(100) COMMENT '模板键',
  recipient_email VARCHAR(255) COMMENT '收件人邮箱',
  subject VARCHAR(500) COMMENT '邮件主题',
  content TEXT NOT NULL COMMENT '通知内容',
  variables JSON COMMENT '模板变量',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '优先级',
  status ENUM('pending', 'processing', 'sent', 'failed') DEFAULT 'pending' COMMENT '状态',
  retry_count INT DEFAULT 0 COMMENT '重试次数',
  max_retries INT DEFAULT 3 COMMENT '最大重试次数',
  error_message TEXT COMMENT '错误信息',
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '计划发送时间',
  sent_at TIMESTAMP NULL COMMENT '实际发送时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知队列表';

-- 创建通知统计表
CREATE TABLE IF NOT EXISTS notification_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL COMMENT '通知类型',
  total_sent INT DEFAULT 0 COMMENT '总发送数',
  total_read INT DEFAULT 0 COMMENT '总阅读数',
  last_sent_at TIMESTAMP NULL COMMENT '最后发送时间',
  last_read_at TIMESTAMP NULL COMMENT '最后阅读时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_notification_type (user_id, notification_type),
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知统计表';

-- 显示创建结果
SELECT '通知设置增强完成!' as message;
SELECT COUNT(*) as system_settings_count FROM system_settings WHERE setting_key LIKE '%notification%' OR setting_key LIKE '%email%';
SELECT COUNT(*) as notification_templates_count FROM notification_templates;
SELECT COUNT(*) as notification_queue_count FROM notification_queue;
