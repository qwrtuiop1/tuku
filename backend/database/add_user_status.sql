-- 添加用户状态字段
USE tuku_dev;

-- 添加status字段到users表
ALTER TABLE users ADD COLUMN status ENUM('active', 'disabled') DEFAULT 'active' COMMENT '用户状态' AFTER role;

-- 为现有用户设置默认状态为active
UPDATE users SET status = 'active' WHERE status IS NULL;

-- 添加索引
CREATE INDEX idx_status ON users(status);









