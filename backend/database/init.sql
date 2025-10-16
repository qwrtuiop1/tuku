-- 图库系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS tuku_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuku_dev;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  avatar_url VARCHAR(255) COMMENT '头像URL',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色',
  storage_limit BIGINT DEFAULT 1073741824 COMMENT '存储限制(字节)',
  used_storage BIGINT DEFAULT 0 COMMENT '已使用存储(字节)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 文件夹表
CREATE TABLE IF NOT EXISTS folders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  folder_name VARCHAR(255) NOT NULL COMMENT '文件夹名称',
  parent_folder_id INT DEFAULT NULL COMMENT '父文件夹ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_user_parent (user_id, parent_folder_id),
  INDEX idx_folder_name (folder_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件夹表';

-- 文件表
CREATE TABLE IF NOT EXISTS files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  filename VARCHAR(255) NOT NULL COMMENT '文件名',
  original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_type ENUM('image', 'video') NOT NULL COMMENT '文件类型',
  file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
  file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
  thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
  folder_id INT DEFAULT NULL COMMENT '文件夹ID',
  mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  width INT COMMENT '宽度(图片)',
  height INT COMMENT '高度(图片)',
  duration INT DEFAULT NULL COMMENT '时长(视频,秒)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
  INDEX idx_user_folder (user_id, folder_id),
  INDEX idx_file_type (file_type),
  INDEX idx_created_at (created_at),
  INDEX idx_file_size (file_size)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT '设置键',
  setting_value TEXT COMMENT '设置值',
  description VARCHAR(255) COMMENT '描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

-- 插入默认系统设置
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('max_file_size', '104857600', '最大文件大小(字节)'),
('allowed_image_types', 'jpg,jpeg,png,gif,webp,svg', '允许的图片类型'),
('allowed_video_types', 'mp4,webm,mov', '允许的视频类型'),
('thumbnail_size', '300', '缩略图尺寸'),
('system_name', '图库系统', '系统名称'),
('max_upload_files', '10', '单次最大上传文件数'),
('enable_registration', 'true', '是否允许注册'),
('maintenance_mode', 'false', '维护模式'),
('auto_clean_logs', 'false', '自动清理日志');

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level ENUM('error', 'warn', 'info', 'debug') NOT NULL COMMENT '日志级别',
  message TEXT NOT NULL COMMENT '日志消息',
  source VARCHAR(100) COMMENT '日志来源',
  user_id INT DEFAULT NULL COMMENT '用户ID',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳',
  INDEX idx_level (level),
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 创建默认管理员用户 (用户名: zyl, 密码: 123456)
INSERT IGNORE INTO users (username, email, password_hash, role, storage_limit) VALUES
('zyl', 'zyl@tuku.com', '$2a$10$rTbSxuWaClnVDZuPz5CwmOvzbLd5gUBUCdt/gsZRX8b7H5I5TwYiG', 'admin', 10737418240);

-- 创建测试用户 (密码: test123)
INSERT IGNORE INTO users (username, email, password_hash, role, storage_limit) VALUES
('testuser', 'test@tuku.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1073741824);

-- 创建示例文件夹
INSERT IGNORE INTO folders (user_id, folder_name, parent_folder_id) VALUES
(1, '默认文件夹', NULL),
(1, '图片', NULL),
(1, '视频', NULL),
(2, '我的图片', NULL),
(2, '工作文件', NULL);

-- 显示创建结果
SELECT '数据库初始化完成!' as message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as folder_count FROM folders;
SELECT COUNT(*) as setting_count FROM system_settings;
