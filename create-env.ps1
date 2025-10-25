# 创建前端环境变量文件的PowerShell脚本
# 使用方法：在PowerShell中运行此脚本

Write-Host "正在创建前端环境变量配置文件..." -ForegroundColor Green

$envContent = @"
# 前端环境变量配置
# 注意：Vite 要求环境变量以 VITE_ 开头才能在客户端访问

# Geetest 验证码配置
VITE_GEETEST_CAPTCHA_ID=7922d406fb215d02770d5a4cd71af066

# QQ 登录配置
VITE_QQ_APP_ID=102816534
VITE_QQ_REDIRECT_URI=https://tukufrontend.vtart.cn/auth/qq/callback

# API 配置
VITE_API_BASE_URL=https://tukubackend.vtart.cn
"@

# 创建.env文件
$envPath = "frontend\.env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ 前端环境变量配置文件已创建：$envPath" -ForegroundColor Green
Write-Host ""
Write-Host "📋 配置内容：" -ForegroundColor Yellow
Write-Host "   - Geetest验证码ID: 7922d406fb215d02770d5a4cd71af066" -ForegroundColor Cyan
Write-Host "   - QQ应用ID: 102816534" -ForegroundColor Cyan
Write-Host "   - QQ回调地址: https://tukufrontend.vtart.cn/auth/qq/callback" -ForegroundColor Cyan
Write-Host "   - API基础URL: https://tukubackend.vtart.cn" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 请重启前端开发服务器以使配置生效" -ForegroundColor Yellow
Write-Host "   命令: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


