# 图库系统 - 部署包

## 📦 包含内容

### 后端 (backend/dist/)
- `src/` - 后端源代码
- `database/` - 数据库脚本
- `package.json` - 依赖配置
- `package-lock.json` - 依赖锁定
- `env.example` - 环境变量示例

### 前端 (frontend/dist/)
- `index.html` - 主页面
- `assets/` - 静态资源文件

## 🚀 部署步骤

### 1. 后端部署

1. **上传文件**
   ```bash
   # 上传 backend/dist/ 到服务器
   scp -r backend/dist/* user@server:/path/to/backend/
   ```

2. **安装依赖**
   ```bash
   cd /path/to/backend
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，设置数据库和QQ登录配置
   ```

4. **更新数据库**
   ```bash
   mysql -h$DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < database/add_third_party_login.sql
   ```

5. **启动服务**
   ```bash
   # 使用PM2 (推荐)
   pm2 start src/app.js --name tuku-backend
   
   # 或直接启动
   node src/app.js
   ```

### 2. 前端部署

1. **上传文件**
   ```bash
   # 上传 frontend/dist/ 到Web服务器目录
   scp -r frontend/dist/* user@server:/var/www/html/
   ```

2. **配置Nginx** (示例)
   ```nginx
   server {
       listen 80;
       server_name tukufrontend.vtart.cn;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 🔧 环境变量配置

### 必需配置
```env
# 数据库配置
DB_HOST=134.175.220.243
DB_USER=tuku
DB_PASSWORD=RHd5biyaXmaAbyDC
DB_NAME=tuku

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 服务配置
PORT=3000
NODE_ENV=production
```

### QQ登录配置 (可选)
```env
# QQ互联应用配置
QQ_APP_ID=your_qq_app_id
QQ_APP_KEY=your_qq_app_key
QQ_REDIRECT_URI=https://tukufrontend.vtart.cn/auth/qq/callback
```

## 📋 新增功能

### ✅ 已修复问题
- 修复用户状态更新重复提示
- 修复移动端文件夹进入重复提示
- 修复前端请求拦截器问题
- 修复登录错误信息重复显示

### ✅ 新增功能
- QQ登录支持
- 第三方登录用户管理
- 改进的错误处理机制

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库配置
   - 确认网络连接
   - 验证用户权限

2. **QQ登录失败**
   - 检查QQ应用配置
   - 确认回调URL设置
   - 验证HTTPS证书

3. **前端无法访问后端**
   - 检查CORS配置
   - 确认API地址设置
   - 验证防火墙规则

## 📞 技术支持

如遇到问题，请检查：
1. 服务器日志
2. 浏览器控制台
3. 网络连接状态
4. 环境变量配置

---
**版本**: 1.0.0  
**更新时间**: 2025-01-16  
**包含功能**: 文件管理、用户管理、QQ登录、移动端支持


