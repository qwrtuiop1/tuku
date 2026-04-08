-- 完善通知存储功能
-- 确保notification_history表包含所有需要的字段

-- 检查并添加缺失的字段
ALTER TABLE notification_history 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级',
ADD COLUMN IF NOT EXISTS send_at TIMESTAMP NULL COMMENT '发送时间',
ADD COLUMN IF NOT EXISTS delete_at TIMESTAMP NULL COMMENT '删除时间',
ADD COLUMN IF NOT EXISTS target VARCHAR(20) DEFAULT 'all' COMMENT '发送范围',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- 为现有记录设置默认值
UPDATE notification_history 
SET 
  priority = 'normal',
  target = 'all'
WHERE priority IS NULL OR target IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification_history(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notification_history(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification_history(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_priority ON notification_history(priority);

-- 发送者字段（用于标记谁创建/发送了该通知）
ALTER TABLE notification_history
ADD COLUMN IF NOT EXISTS sender_id INT NULL COMMENT '发送者用户ID' AFTER user_id;

-- 用户与通知的投递映射表（每个用户一条投递状态记录）
CREATE TABLE IF NOT EXISTS user_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_notifications_notification
    FOREIGN KEY (notification_id) REFERENCES notification_history(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY uniq_user_notification (notification_id, user_id),
  KEY idx_user_read (user_id, is_read)
);

-- 显示表结构
DESCRIBE notification_history;

-- 显示执行结果
SELECT '通知存储功能完善完成!' as message;
SELECT COUNT(*) as total_notifications FROM notification_history;
