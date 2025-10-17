#!/bin/bash
# 后端启动脚本

echo "启动图库系统后端服务..."

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js (版本 >= 16.0.0)"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "错误: Node.js版本过低，需要 >= 16.0.0，当前版本: $(node -v)"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "警告: 未找到.env文件，请复制env.example为.env并配置环境变量"
    if [ -f "env.example" ]; then
        echo "正在复制env.example为.env..."
        cp env.example .env
        echo "请编辑.env文件配置数据库连接等信息"
    fi
fi

# 启动服务
echo "正在启动服务..."
node src/app.js



