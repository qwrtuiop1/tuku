@echo off
REM 存储路径迁移脚本 (Windows版本)
REM 将storage文件夹从backend\dist\storage移动到backend\storage

echo 🚀 开始迁移存储路径...

REM 设置路径变量
set OLD_STORAGE_PATH=D:\tuku\backend\dist\storage
set NEW_STORAGE_PATH=D:\tuku\backend\storage

REM 检查旧路径是否存在
if not exist "%OLD_STORAGE_PATH%" (
    echo ❌ 旧存储路径不存在: %OLD_STORAGE_PATH%
    echo 请检查路径是否正确
    pause
    exit /b 1
)

REM 检查新路径是否已存在
if exist "%NEW_STORAGE_PATH%" (
    echo ⚠️  新存储路径已存在: %NEW_STORAGE_PATH%
    echo 是否要覆盖现有目录? (y/N)
    set /p response=
    if /i not "%response%"=="y" (
        echo ❌ 操作已取消
        pause
        exit /b 1
    )
    echo 🗑️  删除现有目录...
    rmdir /s /q "%NEW_STORAGE_PATH%"
)

REM 创建新目录
echo 📁 创建新存储目录...
mkdir "%NEW_STORAGE_PATH%"

REM 移动文件
echo 📦 移动存储文件...
xcopy "%OLD_STORAGE_PATH%\*" "%NEW_STORAGE_PATH%\" /E /I /H /Y

REM 检查移动结果
if exist "%NEW_STORAGE_PATH%" (
    echo ✅ 存储文件移动成功
    
    REM 显示新目录内容
    echo 📋 新存储目录内容:
    dir "%NEW_STORAGE_PATH%"
    
    echo ✅ 文件移动完成
    
    REM 询问是否删除旧目录
    echo 🗑️  是否删除旧存储目录? (y/N)
    set /p response=
    if /i "%response%"=="y" (
        rmdir /s /q "%OLD_STORAGE_PATH%"
        echo ✅ 旧存储目录已删除
    ) else (
        echo ℹ️  旧存储目录保留: %OLD_STORAGE_PATH%
    )
    
) else (
    echo ❌ 存储文件移动失败
    pause
    exit /b 1
)

echo 🎉 存储路径迁移完成!
echo 新存储路径: %NEW_STORAGE_PATH%
echo.
echo 📝 下一步操作:
echo 1. 更新环境变量 UPLOAD_PATH=/www/wwwroot/tuku/backend/storage
echo 2. 执行数据库迁移脚本: migrate_storage_path.sql
echo 3. 重启后端服务
pause
