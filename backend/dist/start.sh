#!/bin/bash

echo "🚀 启动图库系统后端服务..."
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "📥 下载地址: https://nodejs.org/"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install --production
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 检查环境配置文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到.env文件，请复制env.example为.env并配置"
    echo "📝 请确保配置了数据库连接信息"
    read -p "按回车键继续..."
fi

# 启动服务
echo "🎯 启动服务中..."
node src/app.js
