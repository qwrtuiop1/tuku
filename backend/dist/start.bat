@echo off
REM 后端启动脚本 (Windows)

echo 启动图库系统后端服务...

REM 检查Node.js环境
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js (版本 ^>= 16.0.0)
    pause
    exit /b 1
)

REM 检查环境变量文件
if not exist ".env" (
    echo 警告: 未找到.env文件，请复制env.example为.env并配置环境变量
    if exist "env.example" (
        echo 正在复制env.example为.env...
        copy env.example .env
        echo 请编辑.env文件配置数据库连接等信息
    )
)

REM 启动服务
echo 正在启动服务...
node src/app.js
pause



