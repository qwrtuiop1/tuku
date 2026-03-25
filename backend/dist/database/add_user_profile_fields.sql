-- 添加用户昵称和个人简介字段
USE tuku_dev;

-- 添加nickname字段到users表
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称' AFTER avatar_url;

-- 添加bio字段到users表
ALTER TABLE users ADD COLUMN bio VARCHAR(200) DEFAULT NULL COMMENT '个人简介' AFTER nickname;

-- 添加索引
CREATE INDEX idx_nickname ON users(nickname);

-- 显示更新结果
SELECT '用户表字段添加完成!' as message;
DESCRIBE users;
