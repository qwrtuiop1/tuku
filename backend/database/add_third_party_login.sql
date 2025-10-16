-- 添加第三方登录支持
-- 为用户表添加第三方登录相关字段

-- 添加第三方登录字段
ALTER TABLE users 
ADD COLUMN qq_openid VARCHAR(64) NULL COMMENT 'QQ OpenID',
ADD COLUMN wechat_openid VARCHAR(64) NULL COMMENT '微信OpenID',
ADD COLUMN third_party_type ENUM('qq', 'wechat', 'local') DEFAULT 'local' COMMENT '登录类型',
ADD COLUMN third_party_id VARCHAR(64) NULL COMMENT '第三方平台用户ID',
ADD COLUMN avatar_url VARCHAR(500) NULL COMMENT '头像URL';

-- 添加索引
CREATE INDEX idx_users_qq_openid ON users(qq_openid);
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX idx_users_third_party ON users(third_party_type, third_party_id);

-- 添加唯一约束（确保同一第三方平台的用户ID唯一）
ALTER TABLE users 
ADD CONSTRAINT uk_users_qq_openid UNIQUE (qq_openid),
ADD CONSTRAINT uk_users_wechat_openid UNIQUE (wechat_openid);

-- 更新现有用户数据
UPDATE users SET third_party_type = 'local' WHERE third_party_type IS NULL;


