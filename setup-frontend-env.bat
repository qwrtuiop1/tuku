@echo off
echo 创建前端环境变量配置文件...

echo # 前端环境变量配置 > frontend\.env
echo # 注意：Vite 要求环境变量以 VITE_ 开头才能在客户端访问 >> frontend\.env
echo. >> frontend\.env
echo # Geetest 验证码配置 >> frontend\.env
echo VITE_GEETEST_CAPTCHA_ID=7922d406fb215d02770d5a4cd71af066 >> frontend\.env
echo. >> frontend\.env
echo # QQ 登录配置 >> frontend\.env
echo VITE_QQ_APP_ID=102816534 >> frontend\.env
echo VITE_QQ_REDIRECT_URI=https://tukufrontend.vtart.cn/auth/qq/callback >> frontend\.env
echo. >> frontend\.env
echo # API 配置 >> frontend\.env
echo VITE_API_BASE_URL=https://tukubackend.vtart.cn >> frontend\.env

echo.
echo ✅ 前端环境变量配置文件已创建：frontend\.env
echo.
echo 📋 配置内容：
echo    - Geetest验证码ID: 7922d406fb215d02770d5a4cd71af066
echo    - QQ应用ID: 102816534
echo    - QQ回调地址: https://tukufrontend.vtart.cn/auth/qq/callback
echo    - API基础URL: https://tukubackend.vtart.cn
echo.
echo 🔄 请重启前端开发服务器以使配置生效
echo.
pause


