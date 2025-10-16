@echo off
echo 🚀 启动图库系统后端服务...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    npm install --production
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查环境配置文件
if not exist ".env" (
    echo ⚠️  警告: 未找到.env文件，请复制env.example为.env并配置
    echo 📝 请确保配置了数据库连接信息
    pause
)

REM 启动服务
echo 🎯 启动服务中...
node src/app.js

pause
