# 文件上传修复部署指南

## 问题描述
800MB视频上传失败，错误信息：
- CORS错误: `No 'Access-Control-Allow-Origin' header is present`
- 413错误: `Content Too Large`
- 网络连接失败: `net::ERR_FAILED`

## 已修复的问题

### 1. Express.js Body解析限制
- 将 `express.json()` 和 `express.urlencoded()` 的限制从 `10mb` 提升到 `2gb`
- 位置：`backend/src/app.js` 第133-134行

### 2. CORS预检请求问题
- 添加了文件上传相关的请求头支持
- 增加了 `Access-Control-Max-Age: 86400` 缓存预检请求
- 位置：`backend/src/app.js` 第60-72行和第99-107行

### 3. Traefik反向代理限制
- 添加了 `traefik.http.middlewares.backend-maxbody.maxbody=2147483648` (2GB)
- 位置：`docker-compose.yml` 第29-30行

### 4. Multer文件大小限制
- 硬编码2GB限制，绕过数据库查询
- 添加了所有multer限制的详细配置
- 位置：`backend/src/routes/files.js` 第107-165行

## 部署步骤

### 1. 停止现有服务
```bash
docker-compose down
```

### 2. 重新构建并启动服务
```bash
docker-compose up -d --build
```

### 3. 验证部署
```bash
# 查看服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f backend

# 查看Traefik日志
docker-compose logs -f traefik
```

### 4. 测试文件上传
- 尝试上传800MB+的视频文件
- 观察控制台日志确认请求正常处理
- 检查后端日志中的调试信息

## 调试信息

修复后的代码会输出详细的调试信息：
- 文件上传请求开始
- Content-Type和Content-Length
- 硬编码文件大小限制 (2GB)
- Multer中间件创建信息
- 任何Multer错误的详细信息

## 回滚方案

如果修复后出现问题，可以回滚到原始配置：

1. 恢复 `backend/src/routes/files.js` 中的 `getFileSizeLimit` 函数
2. 恢复 `backend/src/app.js` 中的body解析限制
3. 移除 `docker-compose.yml` 中的Traefik配置
4. 重新部署服务

## 注意事项

- 确保服务器有足够的磁盘空间存储大文件
- 监控服务器资源使用情况
- 考虑添加文件上传进度显示
- 可能需要调整数据库连接池大小

