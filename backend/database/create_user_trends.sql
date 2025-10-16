-- 创建用户趋势数据表
CREATE TABLE IF NOT EXISTS user_trends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trend_date DATE NOT NULL,
    total_files INT DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    image_count INT DEFAULT 0,
    image_size BIGINT DEFAULT 0,
    video_count INT DEFAULT 0,
    video_size BIGINT DEFAULT 0,
    folder_count INT DEFAULT 0,
    other_files INT DEFAULT 0,
    other_size BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, trend_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_trend_date (user_id, trend_date),
    INDEX idx_trend_date (trend_date)
);

-- 创建趋势变化表（用于存储每日变化）
CREATE TABLE IF NOT EXISTS trend_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    change_date DATE NOT NULL,
    change_type ENUM('files', 'size', 'images', 'videos', 'folders') NOT NULL,
    change_value INT NOT NULL,
    change_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_change_date (user_id, change_date),
    INDEX idx_change_type (change_type)
);










