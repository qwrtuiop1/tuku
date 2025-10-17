# 部署问题排查清单

## 问题描述
- **401 Unauthorized**: `GET https://tukubackend.vtart.cn/api/admin/settings 401 (Unauthorized)`
- **404 Not Found**: `GET https://tukufrontend.vtart.cn/login 404 (Not Found)`

## 已修复的问题

### 1. 401 Unauthorized 错误 ✅
**问题原因**: 后端admin路由缺少JWT认证中间件
**修复方案**: 在 `backend/src/routes/admin.js` 中添加了 `authenticateToken` 中间件
```javascript
// 修复前
router.use(requireAdmin);

// 修复后  
router.use(authenticateToken);
router.use(requireAdmin);
```

## 需要检查的问题

### 2. 404 Not Found 错误 🔍
**可能原因**:
1. 服务器端文件未正确部署
2. Nginx配置问题
3. 文件权限问题
4. Vue Router history模式配置问题

## 排查步骤

### 步骤1: 检查服务器端文件部署
```bash
# 检查前端文件是否存在
ls -la /www/wwwroot/tukufrontend/
ls -la /www/wwwroot/tukufrontend/index.html

# 检查文件权限
chmod 644 /www/wwwroot/tukufrontend/index.html
chmod 755 /www/wwwroot/tukufrontend/
```

### 步骤2: 检查Nginx配置
```bash
# 检查Nginx配置
nginx -t

# 重新加载Nginx配置
nginx -s reload

# 检查Nginx错误日志
tail -f /var/log/nginx/tukufrontend_error.log
```

### 步骤3: 检查后端服务状态
```bash
# 检查后端服务是否运行
ps aux | grep node
netstat -tlnp | grep :3000

# 重启后端服务
cd /path/to/backend/dist
npm start
```

### 步骤4: 检查CORS配置
确保后端CORS配置允许前端域名：
```javascript
// backend/src/app.js
app.use(cors({
  origin: ['https://tukufrontend.vtart.cn'],
  credentials: true
}));
```

### 步骤5: 检查SSL证书
```bash
# 检查SSL证书是否有效
openssl x509 -in /path/to/your/certificate.crt -text -noout
```

## 测试步骤

### 1. 测试API端点
```bash
# 测试后端API
curl -X GET https://tukubackend.vtart.cn/api/admin/settings

# 测试带认证的API
curl -X GET https://tukubackend.vtart.cn/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 测试前端路由
```bash
# 测试根路径
curl -I https://tukufrontend.vtart.cn/

# 测试登录页面
curl -I https://tukufrontend.vtart.cn/login
```

### 3. 浏览器测试
1. 打开浏览器开发者工具
2. 访问 `https://tukufrontend.vtart.cn/login`
3. 检查Network标签页中的请求状态
4. 检查Console标签页中的错误信息

## 常见解决方案

### 方案1: 重新部署前端
```bash
# 上传新的dist文件到服务器
scp -r frontend/dist/* user@server:/www/wwwroot/tukufrontend/

# 设置正确的文件权限
chown -R www-data:www-data /www/wwwroot/tukufrontend/
chmod -R 755 /www/wwwroot/tukufrontend/
```

### 方案2: 修复Nginx配置
确保nginx配置包含：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 方案3: 重启服务
```bash
# 重启Nginx
systemctl restart nginx

# 重启后端服务
pm2 restart tuku-backend
# 或者
systemctl restart tuku-backend
```

## 监控和日志

### 查看实时日志
```bash
# Nginx访问日志
tail -f /var/log/nginx/tukufrontend_access.log

# Nginx错误日志  
tail -f /var/log/nginx/tukufrontend_error.log

# 后端应用日志
tail -f /var/log/tuku-backend.log
```

## 联系信息
如果问题仍然存在，请提供：
1. 服务器端文件列表 (`ls -la /www/wwwroot/tukufrontend/`)
2. Nginx错误日志 (`tail -20 /var/log/nginx/tukufrontend_error.log`)
3. 后端服务状态 (`ps aux | grep node`)
4. 浏览器Network标签页截图



