-- 迁移存储路径脚本
-- 将文件路径从相对路径更新为绝对路径
-- 执行前请确保已备份数据库

-- 更新文件表中的路径
-- 将相对路径更新为绝对路径
UPDATE files 
SET file_path = CONCAT('/www/wwwroot/tuku/backend/storage/', file_path)
WHERE file_path NOT LIKE '/www/wwwroot/tuku/backend/storage/%'
  AND file_path NOT LIKE '/%'  -- 排除已经是绝对路径的记录
  AND file_path IS NOT NULL
  AND file_path != '';

-- 更新用户头像路径
UPDATE users 
SET avatar_url = CONCAT('/www/wwwroot/tuku/backend/storage/users/user_', id, '/avatars/', SUBSTRING_INDEX(avatar_url, '/', -1))
WHERE avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND avatar_url NOT LIKE '/www/wwwroot/tuku/backend/storage/%'
  AND avatar_url NOT LIKE '/%';  -- 排除已经是绝对路径的记录

-- 显示更新结果
SELECT 
  'files' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN file_path LIKE '/www/wwwroot/tuku/backend/storage/%' THEN 1 END) as updated_paths
FROM files
WHERE file_path IS NOT NULL AND file_path != ''

UNION ALL

SELECT 
  'users' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN avatar_url LIKE '/www/wwwroot/tuku/backend/storage/%' THEN 1 END) as updated_paths
FROM users
WHERE avatar_url IS NOT NULL AND avatar_url != '';

-- 验证更新结果
SELECT 'files' as table_name, file_path, original_name 
FROM files 
WHERE file_path LIKE '/www/wwwroot/tuku/backend/storage/%'
LIMIT 5;

SELECT 'users' as table_name, id, username, avatar_url 
FROM users 
WHERE avatar_url LIKE '/www/wwwroot/tuku/backend/storage/%'
LIMIT 5;
