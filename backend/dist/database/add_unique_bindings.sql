-- Ensure unique bindings for email, QQ, and EPass on users table
-- Note: Execute manually in MySQL. If existing duplicates exist, resolve them first.

-- Email unique
ALTER TABLE `users`
  ADD UNIQUE KEY `uniq_users_email` (`email`);

-- EPass unique
ALTER TABLE `users`
  ADD UNIQUE KEY `uniq_users_epass_id` (`epass_id`);

-- QQ OpenId unique
ALTER TABLE `users`
  ADD UNIQUE KEY `uniq_users_qq_openid` (`qq_openid`);

-- QQ UnionId unique
ALTER TABLE `users`
  ADD UNIQUE KEY `uniq_users_qq_unionid` (`qq_unionid`);


