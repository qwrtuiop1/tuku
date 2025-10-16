-- 创建用户偏好设置表
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    default_view VARCHAR(10) DEFAULT 'grid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- 创建用户通知设置表
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    storage_warnings BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification_settings (user_id)
);

-- 为现有用户创建默认设置
INSERT IGNORE INTO user_preferences (user_id, default_view)
SELECT id, 'grid' FROM users;

INSERT IGNORE INTO user_notification_settings (user_id, email_notifications, storage_warnings, security_alerts)
SELECT id, TRUE, TRUE, TRUE FROM users;






