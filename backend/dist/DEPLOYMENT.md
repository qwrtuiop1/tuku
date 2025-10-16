# 后端部署说明

## 🚀 快速部署步骤

### 1. 环境变量配置

**重要：** 部署前必须正确配置环境变量！

```bash
# 复制环境变量模板
cp env.example .env

# 编辑环境变量文件
nano .env
```

**必须修改的配置：**
```bash
# JWT密钥 - 必须修改为安全的随机字符串
JWT_SECRET=your_secure_jwt_secret_key_here

# 数据库配置
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# 服务器配置
PORT=3000
NODE_ENV=production
```

### 2. 检查环境变量

```bash
# 运行环境变量检查脚本
node check-env.js
```

如果看到 `✅ 环境变量配置正常！` 说明配置正确。

### 3. 安装依赖

```bash
npm install
```

### 4. 启动服务

```bash
# 直接启动
node src/app.js

# 或使用 PM2
pm2 start src/app.js --name backend

# 或使用 systemd
systemctl start your-backend-service
```

## 🔧 常见问题

### JWT密钥错误
如果看到 `secretOrPrivateKey must have a value` 错误：

1. 检查 `.env` 文件是否存在
2. 确认 `JWT_SECRET` 已设置且不是占位符值
3. 运行 `node check-env.js` 检查配置

### CORS错误
如果前端无法访问后端API：

1. 检查 `FRONTEND_DOMAIN` 配置
2. 确认域名在CORS允许列表中
3. 查看服务器日志中的CORS调试信息

### 数据库连接错误
如果无法连接数据库：

1. 检查数据库配置信息
2. 确认数据库服务正在运行
3. 测试网络连接

## 📋 部署检查清单

- [ ] 环境变量文件 `.env` 已创建
- [ ] `JWT_SECRET` 已设置为安全的随机字符串
- [ ] 数据库连接信息正确
- [ ] 依赖包已安装 (`npm install`)
- [ ] 服务已启动
- [ ] 端口3000可访问
- [ ] 前端可以正常访问API

## 🆘 故障排除

### 查看日志
```bash
# PM2 日志
pm2 logs backend

# systemd 日志
journalctl -u your-backend-service -f

# 直接运行查看错误
node src/app.js
```

### 测试API
```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试CORS
curl -H "Origin: https://tukufrontend.vtart.cn" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/auth/login
```
