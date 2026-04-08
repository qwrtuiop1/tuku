ALTER TABLE live_media_assets
  ADD COLUMN IF NOT EXISTS folder_id INT NULL AFTER owner_user_id;

-- 低版本 MySQL 不支持 IF NOT EXISTS，做容错
-- 尝试创建列（若已存在会报错，忽略）
-- ALTER TABLE live_media_assets ADD COLUMN folder_id INT NULL;

ALTER TABLE live_media_assets
  ADD INDEX idx_owner_folder (owner_user_id, folder_id);

-- 外键（若 folders 不存在或已存在外键将失败，忽略即可）
ALTER TABLE live_media_assets
  ADD CONSTRAINT fk_live_asset_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;


