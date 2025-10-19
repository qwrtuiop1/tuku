# 动态Nginx配置管理系统

## 功能概述

这个系统可以让Nginx的文件大小限制跟随管理员的系统设置动态变化，实现更灵活的文件上传管理。

## 核心特性

### 🔄 **自动同步**
- 系统每5分钟自动检查配置变化
- 自动更新Nginx配置文件
- 自动重新加载Nginx服务

### 🛡️ **安全保护**
- 配置更新前自动备份
- 配置测试失败时自动回滚
- 权限验证（仅管理员可操作）

### 📊 **实时监控**
- 实时显示配置状态
- 配置同步状态监控
- 详细的日志记录

## 系统架构

```
管理员设置 → 数据库 → 后端API → Nginx配置 → 自动重载
     ↓           ↓        ↓         ↓         ↓
   前端界面 → 状态监控 → 定时检查 → 配置更新 → 服务重启
```

## API接口

### 1. 获取配置状态
```http
GET /api/nginx-config/status
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "databaseLimit": 2,
    "nginxLimit": 1,
    "needsUpdate": true,
    "lastChecked": "2025-10-19T02:15:22.590Z"
  }
}
```

### 2. 更新配置
```http
POST /api/nginx-config/update
```

### 3. 强制更新配置
```http
POST /api/nginx-config/force-update
```

### 4. 测试配置
```http
POST /api/nginx-config/test
```

### 5. 获取建议配置
```http
GET /api/nginx-config/suggest
```

## 配置逻辑

### 文件大小限制计算
```javascript
// 基于数据库设置计算Nginx限制
const maxFileSizeBytes = parseInt(databaseSetting);
const limitGB = Math.ceil(maxFileSizeBytes / (1024 * 1024 * 1024)) + 1;
const nginxLimit = Math.min(limitGB, 10); // 最大10GB
```

### 配置更新流程
1. 读取数据库设置
2. 计算建议的Nginx限制
3. 备份当前Nginx配置
4. 更新配置文件
5. 测试配置语法
6. 重新加载Nginx
7. 失败时自动回滚

## 使用方法

### 1. 部署系统

**后端部署**：
```bash
# 重新部署后端服务
docker-compose down
docker-compose up -d --build
```

**Nginx配置**：
```nginx
# 在Nginx配置中添加初始限制
client_max_body_size 2G;
```

### 2. 管理员操作

**通过API管理**：
```javascript
// 检查配置状态
fetch('/api/nginx-config/status')
  .then(response => response.json())
  .then(data => console.log(data));

// 更新配置
fetch('/api/nginx-config/update', { method: 'POST' })
  .then(response => response.json())
  .then(data => console.log(data));
```

**通过前端界面**：
- 访问管理员设置页面
- 查看Nginx配置管理组件
- 实时监控配置状态
- 手动触发配置更新

### 3. 自动更新

系统启动后会自动：
- 每5分钟检查配置变化
- 自动更新Nginx配置
- 记录详细的操作日志

## 配置示例

### Nginx配置更新前
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name tukubackend.vtart.cn;
    
    # 旧的限制
    client_max_body_size 1G;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... 其他配置
    }
}
```

### Nginx配置更新后
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name tukubackend.vtart.cn;
    
    # 动态文件大小限制 - 由系统自动管理
    client_max_body_size 3G;
    client_body_buffer_size 128k;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... 其他配置
    }
}
```

## 监控和日志

### 后端日志
```
启动Nginx自动更新服务...
检查Nginx配置是否需要更新...
检测到配置变化: 1GB -> 3GB
Nginx配置已更新，文件大小限制设置为: 3GB
Nginx配置测试通过
Nginx配置已成功应用
✅ Nginx配置已自动更新
```

### 错误处理
```
❌ Nginx配置自动更新失败: Error: nginx: configuration file test failed
已恢复Nginx配置备份
```

## 安全考虑

### 权限控制
- 仅管理员可以操作配置
- API接口需要认证
- 操作日志记录

### 配置保护
- 自动备份机制
- 测试失败自动回滚
- 配置文件权限控制

### 服务稳定性
- 配置更新不影响服务
- 失败时自动恢复
- 详细的错误日志

## 故障排除

### 常见问题

**1. 配置更新失败**
```bash
# 检查Nginx配置语法
nginx -t

# 检查文件权限
ls -la /www/server/panel/vhost/nginx/dist.conf

# 查看错误日志
tail -f /www/wwwlogs/dist.error.log
```

**2. 自动更新不工作**
```bash
# 检查服务状态
docker logs tuku-backend | grep "Nginx自动更新"

# 手动触发更新
curl -X POST https://tukubackend.vtart.cn/api/nginx-config/force-update \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. 权限问题**
```bash
# 检查文件权限
chmod 644 /www/server/panel/vhost/nginx/dist.conf
chown www:www /www/server/panel/vhost/nginx/dist.conf
```

## 扩展功能

### 未来计划
- 支持多个Nginx配置文件
- 配置变更历史记录
- 更细粒度的权限控制
- 配置模板管理
- 批量配置更新

### 自定义配置
- 修改检查间隔
- 自定义配置模板
- 添加更多Nginx参数
- 集成其他服务配置

## 技术支持

如有问题，请检查：
1. 后端日志
2. Nginx错误日志
3. 文件权限
4. 服务状态

系统会自动处理大部分问题，并提供详细的错误信息。
