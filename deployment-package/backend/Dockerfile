# 图库系统 Docker 配置

# 后端 Dockerfile
FROM node:16-alpine

WORKDIR /app

# 复制package文件
COPY backend/package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY backend/ .

# 创建存储目录
RUN mkdir -p storage/users

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
















