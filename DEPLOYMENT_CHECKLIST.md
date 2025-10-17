# 前端部署检查清单

## 1. 文件部署检查

### 检查服务器文件结构
```bash
# 登录服务器后检查
ls -la /www/wwwroot/tukufrontend/
ls -la /www/wwwroot/tukufrontend/index.html
ls -la /www/wwwroot/tukufrontend/assets/
```

### 确保文件权限正确
```bash
chown -R www:www /www/wwwroot/tukufrontend/
chmod -R 755 /www/wwwroot/tukufrontend/
```

## 2. Nginx配置检查

### 检查nginx配置
```bash
nginx -t
systemctl reload nginx
```

### 检查nginx错误日志
```bash
tail -f /var/log/nginx/tukufrontend_error.log
tail -f /var/log/nginx/error.log
```

### 检查nginx访问日志
```bash
tail -f /var/log/nginx/tukufrontend_access.log
```

## 3. 域名和SSL检查

### 检查域名解析
```bash
nslookup tukufrontend.vtart.cn
ping tukufrontend.vtart.cn
```

### 检查SSL证书
```bash
openssl x509 -in /path/to/your/certificate.crt -text -noout
```

## 4. 服务状态检查

### 检查nginx服务状态
```bash
systemctl status nginx
systemctl restart nginx
```

### 检查端口占用
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

## 5. 测试步骤

### 本地测试
```bash
# 测试nginx配置
curl -I http://localhost/
curl -I https://localhost/

# 测试特定路径
curl -I http://localhost/login
curl -I https://localhost/login
```

### 外部测试
```bash
# 测试域名访问
curl -I http://tukufrontend.vtart.cn/
curl -I https://tukufrontend.vtart.cn/
curl -I https://tukufrontend.vtart.cn/login
```

## 6. 常见问题解决

### 问题1：404 Not Found
- 检查文件是否存在
- 检查nginx配置中的root路径
- 检查try_files配置

### 问题2：SSL证书错误
- 检查证书路径
- 检查证书有效期
- 重新生成证书

### 问题3：权限问题
- 检查文件所有者
- 检查文件权限
- 检查nginx用户权限

## 7. 部署命令

### 上传文件到服务器
```bash
# 使用scp上传
scp -r frontend/dist/* user@server:/www/wwwroot/tukufrontend/

# 或使用rsync
rsync -avz frontend/dist/ user@server:/www/wwwroot/tukufrontend/
```

### 重启服务
```bash
systemctl restart nginx
systemctl status nginx
```

## 8. 验证部署

### 检查关键文件
- [ ] index.html 存在
- [ ] assets目录存在
- [ ] 所有JS/CSS文件存在
- [ ] 文件权限正确

### 检查功能
- [ ] 首页可以访问
- [ ] /login 路径可以访问
- [ ] 静态资源可以加载
- [ ] Vue Router正常工作

## 9. 监控和维护

### 设置日志监控
```bash
# 监控错误日志
tail -f /var/log/nginx/tukufrontend_error.log | grep -i error

# 监控访问日志
tail -f /var/log/nginx/tukufrontend_access.log | grep -i 404
```

### 定期检查
- 检查SSL证书有效期
- 检查磁盘空间
- 检查nginx配置
- 检查文件完整性



