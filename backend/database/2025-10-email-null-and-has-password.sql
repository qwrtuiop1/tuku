-- 邮箱可为空 + has_password 标记 + 占位邮箱归一化

-- 1) 邮箱允许为空
ALTER TABLE `users`
  MODIFY COLUMN `email` VARCHAR(100) NULL;

-- 2) 新增是否已设置密码标记（默认认为已设置，便于存量账号）
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `has_password` TINYINT(1) NOT NULL DEFAULT 1;

-- 3) 历史占位邮箱统一置 NULL
UPDATE `users` SET `email` = NULL WHERE `email` LIKE 'unbound_%@unbind.local';
UPDATE `users` SET `email` = NULL WHERE `email` LIKE 'qq_%@noemail.qq.local';

-- 4) 存量回填：第三方首登且疑似未设置密码的标记为未设置
UPDATE `users`
SET `has_password` = 0
WHERE (`third_party_type` IN ('qq','epass') OR `qq_openid` IS NOT NULL OR `epass_id` IS NOT NULL)
  AND (`email` IS NULL OR `email` LIKE '%@unbind.local' OR `email` LIKE '%@noemail.qq.local');
