-- QQ UnionID 支持
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS qq_unionid VARCHAR(128) NULL COMMENT 'QQ UnionID（同主体多个应用统一ID）';

-- 保证唯一性
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_qq_unionid ON users(qq_unionid);


