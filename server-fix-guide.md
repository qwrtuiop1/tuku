# 服务器问题修复指南

## 当前问题
1. **401 Unauthorized**: `tukubackend.vtart.cn/api/admin/settings 401`
2. **404 Not Found**: `tukufrontend.vtart.cn/login 404`
3. **CORS错误**: 头像加载失败 `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`

## 立即解决方案

### 步骤1: 重启后端服务 🔄

```bash
# 方法1: 如果使用PM2管理
pm2 restart tuku-backend
pm2 logs tuku-backend

# 方法2: 如果使用systemd
systemctl restart tuku-backend
systemctl status tuku-backend

# 方法3: 手动重启
# 1. 找到运行中的Node.js进程
ps aux | grep node
# 2. 杀死进程
kill -9 [PID]
# 3. 重新启动
cd /path/to/backend/dist
npm start
```

### 步骤2: 检查后端文件更新 📁

```bash
# 检查admin.js文件是否已更新
cat /path/to/backend/dist/src/routes/admin.js | grep -A 5 "router.use"

# 如果文件未更新，手动复制
cp /path/to/backend/src/routes/admin.js /path/to/backend/dist/src/routes/admin.js
```

### 步骤3: 修复前端404问题 🌐

```bash
# 1. 检查前端文件是否存在
ls -la /www/wwwroot/tukufrontend/
ls -la /www/wwwroot/tukufrontend/index.html

# 2. 如果文件不存在，重新部署
# 上传新的dist文件
scp -r frontend/dist/* user@server:/www/wwwroot/tukufrontend/

# 3. 设置正确的权限
chown -R www-data:www-data /www/wwwroot/tukufrontend/
chmod -R 755 /www/wwwroot/tukufrontend/
chmod 644 /www/wwwroot/tukufrontend/index.html
```

### 步骤4: 修复CORS问题 🔒

检查后端CORS配置：

```bash
# 查看后端CORS配置
cat /path/to/backend/dist/src/app.js | grep -A 10 "cors"
```

确保CORS配置包含：
```javascript
app.use(cors({
  origin: [
    'https://tukufrontend.vtart.cn',
    'https://tukubackend.vtart.cn'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 步骤5: 验证Nginx配置 ⚙️

```bash
# 1. 检查Nginx配置
nginx -t

# 2. 检查前端Nginx配置
cat /etc/nginx/sites-available/tukufrontend.conf
# 或
cat /etc/nginx/conf.d/tukufrontend.conf

# 3. 确保配置包含
location / {
    try_files $uri $uri/ /index.html;
}

# 4. 重新加载Nginx
nginx -s reload
```

## 快速修复脚本

创建修复脚本 `fix-server.sh`：

```bash
#!/bin/bash

echo "🔧 开始修复服务器问题..."

# 1. 重启后端服务
echo "📡 重启后端服务..."
pm2 restart tuku-backend || systemctl restart tuku-backend

# 2. 检查前端文件
echo "📁 检查前端文件..."
if [ ! -f "/www/wwwroot/tukufrontend/index.html" ]; then
    echo "❌ 前端文件不存在，需要重新部署"
    exit 1
fi

# 3. 设置文件权限
echo "🔐 设置文件权限..."
chown -R www-data:www-data /www/wwwroot/tukufrontend/
chmod -R 755 /www/wwwroot/tukufrontend/
chmod 644 /www/wwwroot/tukufrontend/index.html

# 4. 重新加载Nginx
echo "⚙️ 重新加载Nginx..."
nginx -s reload

# 5. 检查服务状态
echo "✅ 检查服务状态..."
pm2 status || systemctl status tuku-backend
nginx -t

echo "🎉 修复完成！"
```

## 测试步骤

### 1. 测试API
```bash
# 测试后端API
curl -X GET https://tukubackend.vtart.cn/api/admin/settings

# 测试带认证的API
curl -X GET https://tukubackend.vtart.cn/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 测试前端
```bash
# 测试根路径
curl -I https://tukufrontend.vtart.cn/

# 测试登录页面
curl -I https://tukufrontend.vtart.cn/login
```

### 3. 浏览器测试
1. 清除浏览器缓存
2. 打开开发者工具
3. 访问 `https://tukufrontend.vtart.cn/login`
4. 检查Network标签页

## 常见问题解决

### 问题1: 后端服务无法启动
```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查Node.js版本
node --version

# 检查依赖
cd /path/to/backend/dist
npm install
```

### 问题2: 前端文件权限问题
```bash
# 修复权限
chown -R www-data:www-data /www/wwwroot/tukufrontend/
find /www/wwwroot/tukufrontend/ -type d -exec chmod 755 {} \;
find /www/wwwroot/tukufrontend/ -type f -exec chmod 644 {} \;
```

### 问题3: Nginx配置错误
```bash
# 检查Nginx错误日志
tail -f /var/log/nginx/error.log

# 检查前端错误日志
tail -f /var/log/nginx/tukufrontend_error.log
```

## 监控命令

```bash
# 实时监控后端日志
pm2 logs tuku-backend --lines 50

# 实时监控Nginx日志
tail -f /var/log/nginx/tukufrontend_access.log
tail -f /var/log/nginx/tukufrontend_error.log

# 检查服务状态
pm2 status
systemctl status nginx
```

## 联系支持

如果问题仍然存在，请提供：
1. `pm2 status` 或 `systemctl status tuku-backend` 输出
2. `nginx -t` 输出
3. `ls -la /www/wwwroot/tukufrontend/` 输出
4. `tail -20 /var/log/nginx/tukufrontend_error.log` 输出




















