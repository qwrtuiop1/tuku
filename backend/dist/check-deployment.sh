#!/bin/bash

echo "=== 检查后端部署状态 ==="

# 1. 检查Docker容器状态
echo "1. 检查Docker容器状态:"
docker ps | grep tuku

# 2. 检查容器重启时间
echo -e "\n2. 检查容器重启时间:"
docker inspect tuku-backend | grep -i restart

# 3. 检查后端日志
echo -e "\n3. 检查后端日志 (最后20行):"
docker logs tuku-backend --tail 20

# 4. 检查文件是否存在
echo -e "\n4. 检查Nginx配置路由文件:"
docker exec tuku-backend ls -la /app/src/routes/nginxConfig.js

# 5. 检查服务是否正常
echo -e "\n5. 测试健康检查:"
curl -s https://tukubackend.vtart.cn/api/health | head -100

echo -e "\n=== 检查完成 ==="
