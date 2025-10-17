@echo off
echo 正在打包前端项目...

REM 安装依赖（如果需要）
echo 检查依赖...
if not exist node_modules (
    echo 安装依赖包...
    npm install
)

REM 构建项目
echo 构建前端项目...
npm run build

REM 检查构建结果
if exist dist (
    echo 构建成功！
    echo 创建压缩包...
    powershell "Compress-Archive -Path dist\* -DestinationPath frontend-dist-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.zip -Force"
    echo 打包完成！
    echo 压缩包位置: frontend-dist-*.zip
) else (
    echo 构建失败！
    exit /b 1
)

pause
