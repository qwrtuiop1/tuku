-- 回收站
CREATE TABLE IF NOT EXISTS recycle_bin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  file_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_type ENUM('image', 'video') NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INT,
  height INT,
  duration INT,
  file_hash VARCHAR(64),
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expire_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户回收站设置
ALTER TABLE user_preferences ADD COLUMN recycle_days INT DEFAULT 30;
ALTER TABLE user_preferences ADD COLUMN auto_cleanup BOOLEAN DEFAULT TRUE;
