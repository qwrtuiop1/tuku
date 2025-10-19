# 800MB视频上传失败 - 全面诊断方案

## 错误分析

```
CORS错误: No 'Access-Control-Allow-Origin' header is present
413错误: Content Too Large
网络错误: net::ERR_FAILED
```

## 可能的原因和解决方案

### 1. 服务器没有重新部署 (最可能)

**检查方法**：
```bash
# 检查容器状态
docker ps

# 检查容器重启时间
docker inspect tuku-backend | grep -i restart

# 查看后端日志
docker logs tuku-backend --tail 50
```

**解决方案**：
```bash
# 强制重新部署
docker-compose down
docker-compose up -d --build --force-recreate
```

### 2. Traefik配置问题

**检查方法**：
```bash
# 查看Traefik配置
docker-compose logs traefik | grep -i "backend-maxbody"

# 检查Traefik中间件
curl -H "Host: tukubackend.vtart.cn" http://localhost/api/health
```

**解决方案**：
确保 `docker-compose.yml` 包含：
```yaml
labels:
  - "traefik.http.middlewares.backend-maxbody.maxbody=2147483648"
  - "traefik.http.routers.backend.middlewares=backend-maxbody"
```

### 3. Nginx限制 (如果使用Nginx)

**检查方法**：
```bash
# 查找Nginx配置
find /etc/nginx -name "*.conf" -exec grep -l "client_max_body_size" {} \;

# 检查Nginx错误日志
tail -f /var/log/nginx/error.log
```

**解决方案**：
在Nginx配置中添加：
```nginx
client_max_body_size 2G;
```

### 4. 服务器提供商限制

**检查方法**：
- 查看服务器提供商的控制面板
- 检查是否有文件上传大小限制
- 查看服务器资源使用情况

**解决方案**：
- 联系服务器提供商
- 升级服务器配置
- 使用分片上传

### 5. 应用层限制

**检查方法**：
访问测试端点：
- `https://tukubackend.vtart.cn/api/health`
- `https://tukubackend.vtart.cn/api/cors-test`
- `https://tukubackend.vtart.cn/api/upload-test`

**解决方案**：
确保代码修复已部署

## 诊断步骤

### 步骤1: 检查服务器状态
```bash
# 检查服务是否运行
docker-compose ps

# 检查容器资源使用
docker stats

# 检查磁盘空间
df -h
```

### 步骤2: 测试CORS
在浏览器控制台运行：
```javascript
fetch('https://tukubackend.vtart.cn/api/cors-test')
  .then(response => response.json())
  .then(data => console.log('CORS测试:', data))
  .catch(error => console.error('CORS错误:', error));
```

### 步骤3: 测试文件上传配置
```javascript
fetch('https://tukubackend.vtart.cn/api/files/test-config', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(response => response.json())
.then(data => console.log('配置测试:', data))
.catch(error => console.error('配置错误:', error));
```

### 步骤4: 检查网络连接
```bash
# 测试后端连接
curl -I https://tukubackend.vtart.cn/api/health

# 测试文件上传端点
curl -X POST https://tukubackend.vtart.cn/api/upload-test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 紧急解决方案

### 方案1: 强制重新部署
```bash
# 停止所有服务
docker-compose down

# 清理容器和镜像
docker system prune -f

# 重新构建并启动
docker-compose up -d --build --force-recreate
```

### 方案2: 检查Traefik配置
```bash
# 查看Traefik配置
docker-compose config

# 检查Traefik日志
docker-compose logs traefik
```

### 方案3: 使用分片上传
如果问题持续存在，考虑实现分片上传：
- 将大文件分割成小块
- 逐个上传小块
- 在服务器端合并文件

## 监控和日志

### 查看关键日志
```bash
# 后端日志
docker-compose logs -f backend

# Traefik日志
docker-compose logs -f traefik

# 系统日志
journalctl -u docker -f
```

### 监控指标
- 文件上传成功率
- 响应时间
- 错误率
- 资源使用情况

## 联系支持

如果问题仍然存在，请提供：
1. 服务器配置信息
2. 错误日志
3. 网络环境信息
4. 服务器提供商信息
