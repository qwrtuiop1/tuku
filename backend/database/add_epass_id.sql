-- 为用户表添加 EPass 通行证绑定字段
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS epass_id VARCHAR(128) NULL COMMENT 'E时代通行证ID';

-- 为 epass_id 添加唯一索引，避免重复绑定
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_epass_id ON users(epass_id);


