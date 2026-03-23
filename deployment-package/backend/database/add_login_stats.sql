-- 添加用户登录统计字段
-- 执行时间: 2025-01-16

USE tuku_dev;

-- 添加登录统计字段到用户表
ALTER TABLE users 
ADD COLUMN login_count INT DEFAULT 0 COMMENT '登录次数',
ADD COLUMN last_login TIMESTAMP NULL COMMENT '最后登录时间',
ADD INDEX idx_last_login (last_login);

-- 更新现有用户的登录次数为1（假设他们已经登录过一次）
UPDATE users SET login_count = 1, last_login = created_at WHERE login_count = 0;

-- 创建用户登录记录表（可选，用于详细记录每次登录）
CREATE TABLE IF NOT EXISTS user_login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  ip_address VARCHAR(45) COMMENT '登录IP地址',
  user_agent TEXT COMMENT '用户代理',
  login_method ENUM('password', 'qq', 'email') DEFAULT 'password' COMMENT '登录方式',
  success BOOLEAN DEFAULT TRUE COMMENT '登录是否成功',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_login_time (user_id, login_time),
  INDEX idx_login_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户登录记录表';

-- 插入系统日志记录此次更新
INSERT INTO system_logs (level, message, source, timestamp) VALUES 
('info', '数据库更新：添加用户登录统计字段', 'DATABASE_MIGRATION', NOW());
