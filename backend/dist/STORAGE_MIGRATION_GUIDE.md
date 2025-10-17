# 存储路径迁移部署说明

## 📋 概述

本次更新将存储路径从 `backend/dist/storage` 迁移到 `backend/storage`，避免以后更新dist文件夹时用户存储的文件丢失。

## 🔄 变更内容

### 1. 路径变更
- **旧路径**: `/www/wwwroot/tuku/backend/dist/storage`
- **新路径**: `/www/wwwroot/tuku/backend/storage`

### 2. 代码修改
- ✅ 更新所有后端代码中的默认存储路径
- ✅ 修改环境变量配置文件
- ✅ 更新静态文件服务配置
- ✅ 修改文件上传、下载、删除逻辑

### 3. 数据库更新
- ✅ 创建数据库迁移脚本
- ✅ 更新文件表中的路径记录
- ✅ 更新用户头像路径

## 🚀 部署步骤

### 步骤1: 备份数据
```bash
# 备份数据库
mysqldump -h 134.175.220.243 -u tuku -p tuku > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份现有storage文件夹
cp -r /www/wwwroot/tuku/backend/dist/storage /www/wwwroot/tuku/backend/dist/storage_backup_$(date +%Y%m%d_%H%M%S)
```

### 步骤2: 移动存储文件
```bash
# 在服务器上执行
cd /www/wwwroot/tuku/backend
chmod +x migrate_storage.sh
./migrate_storage.sh
```

### 步骤3: 更新环境变量
```bash
# 编辑环境变量文件
nano /www/wwwroot/tuku/backend/.env

# 更新UPLOAD_PATH
UPLOAD_PATH=/www/wwwroot/tuku/backend/storage
```

### 步骤4: 执行数据库迁移
```bash
# 连接数据库执行迁移脚本
mysql -h 134.175.220.243 -u tuku -p tuku < database/migrate_storage_path.sql
```

### 步骤5: 更新后端代码
```bash
# 停止后端服务
pm2 stop tuku-backend

# 更新代码
cd /www/wwwroot/tuku/backend
git pull origin main

# 或者手动更新dist文件夹
cp -r src/* dist/src/
cp env.example dist/

# 重启后端服务
pm2 restart tuku-backend
```

### 步骤6: 验证部署
```bash
# 检查服务状态
pm2 status

# 检查存储目录
ls -la /www/wwwroot/tuku/backend/storage/

# 检查日志
pm2 logs tuku-backend
```

## 🔍 验证清单

### 文件系统验证
- [ ] 新存储目录存在: `/www/wwwroot/tuku/backend/storage`
- [ ] 用户文件已迁移: `/www/wwwroot/tuku/backend/storage/users/`
- [ ] 目录权限正确: `755`
- [ ] 文件所有者正确: `www:www`

### 数据库验证
- [ ] 文件路径已更新为绝对路径
- [ ] 用户头像路径已更新
- [ ] 路径格式正确: `/www/wwwroot/tuku/backend/storage/...`

### 功能验证
- [ ] 文件上传功能正常
- [ ] 文件下载功能正常
- [ ] 文件删除功能正常
- [ ] 头像上传功能正常
- [ ] 文件预览功能正常

## 🛠️ 回滚方案

如果部署出现问题，可以按以下步骤回滚：

### 1. 恢复存储文件
```bash
# 如果有备份，恢复存储文件
cp -r /www/wwwroot/tuku/backend/dist/storage_backup_* /www/wwwroot/tuku/backend/dist/storage
```

### 2. 恢复环境变量
```bash
# 恢复旧的环境变量
UPLOAD_PATH=./storage
```

### 3. 恢复数据库
```bash
# 恢复数据库备份
mysql -h 134.175.220.243 -u tuku -p tuku < backup_*.sql
```

### 4. 重启服务
```bash
pm2 restart tuku-backend
```

## 📊 影响分析

### 正面影响
- ✅ 避免更新dist时文件丢失
- ✅ 存储路径更加稳定
- ✅ 便于维护和管理
- ✅ 支持热更新

### 注意事项
- ⚠️ 需要停机维护
- ⚠️ 需要迁移现有文件
- ⚠️ 需要更新数据库记录
- ⚠️ 需要更新环境变量

## 🔧 故障排除

### 常见问题

#### 1. 文件上传失败
```bash
# 检查目录权限
ls -la /www/wwwroot/tuku/backend/storage/
chmod -R 755 /www/wwwroot/tuku/backend/storage/
chown -R www:www /www/wwwroot/tuku/backend/storage/
```

#### 2. 文件下载404
```bash
# 检查文件是否存在
ls -la /www/wwwroot/tuku/backend/storage/users/user_*/files/

# 检查nginx配置
nginx -t
systemctl reload nginx
```

#### 3. 数据库连接问题
```bash
# 检查数据库连接
mysql -h 134.175.220.243 -u tuku -p -e "SELECT COUNT(*) FROM files;"
```

## 📞 技术支持

如果在部署过程中遇到问题，请：
1. 检查日志文件: `pm2 logs tuku-backend`
2. 验证文件权限和路径
3. 确认数据库连接正常
4. 联系技术支持团队

---

**部署完成后，请更新TODO状态为已完成！** 🎉
