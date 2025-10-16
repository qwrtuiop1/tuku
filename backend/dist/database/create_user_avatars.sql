USE tuku_dev;

-- 创建用户头像表
CREATE TABLE IF NOT EXISTS user_avatars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INT NULL,
  height INT NULL,
  is_current BOOLEAN DEFAULT FALSE COMMENT '是否为当前使用的头像',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_current (is_current),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户头像表';

-- 创建触发器：确保每个用户只有一个当前头像
DELIMITER //
CREATE TRIGGER ensure_single_current_avatar
BEFORE UPDATE ON user_avatars
FOR EACH ROW
BEGIN
  IF NEW.is_current = TRUE AND OLD.is_current = FALSE THEN
    UPDATE user_avatars 
    SET is_current = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
END//
DELIMITER ;

-- 创建触发器：插入时确保只有一个当前头像
DELIMITER //
CREATE TRIGGER ensure_single_current_avatar_insert
BEFORE INSERT ON user_avatars
FOR EACH ROW
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE user_avatars 
    SET is_current = FALSE 
    WHERE user_id = NEW.user_id;
  END IF;
END//
DELIMITER ;













