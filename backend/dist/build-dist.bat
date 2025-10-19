@echo off
echo 正在打包后端dist文件夹...

REM 更新src文件夹
echo 更新src文件夹...
xcopy /E /I /Y src dist\src

REM 复制配置文件
echo 复制配置文件...
copy package.json dist\ >nul
copy package-lock.json dist\ >nul
copy Dockerfile dist\ >nul
copy env.example dist\ >nul
copy README.md dist\ >nul

REM 复制数据库文件
echo 复制数据库文件...
xcopy /E /I /Y database dist\database

REM 创建压缩包
echo 创建压缩包...
powershell "Compress-Archive -Path dist\* -DestinationPath backend-dist-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.zip"

echo 打包完成！
pause
