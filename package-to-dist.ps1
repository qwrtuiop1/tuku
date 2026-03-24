# Package backend + frontend for deployment (no zip compression, no node_modules)
# 说明：
# - backend\dist：与源码目录同构的可部署副本（不含依赖、不含本脚本生成的旧 dist、不含用户上传目录 storage）
# - 服务器解压/同步后请在 backend 目录执行：npm ci 或 npm install --omit=dev
# - 若服务器上出现 node_modules，那是部署时 npm 安装的依赖，不是本脚本打包进去的
# - frontend\dist：需先在前端项目执行 npm run build；本脚本不压缩，仅提示体积
$ErrorActionPreference = 'Stop'
$projectRoot = "D:\QIanDuanXiangMu\tuku"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Packaging (no compression)..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- Backend: backend/dist ---
$backendDest = Join-Path $projectRoot "backend\dist"
$backendRoot = Join-Path $projectRoot "backend"
Write-Host ""
Write-Host "[1/2] Packaging backend..." -ForegroundColor Yellow
if (Test-Path $backendDest) {
    Remove-Item -Path $backendDest -Recurse -Force
}
New-Item -Path $backendDest -ItemType Directory -Force | Out-Null

$skipNames = [System.Collections.Generic.HashSet[string]]::new(
    [string[]]@('node_modules', 'dist', 'storage', '.git')
)

Get-ChildItem -Path $backendRoot -Force | ForEach-Object {
    $name = $_.Name
    if ($skipNames.Contains($name)) {
        return
    }
    $target = Join-Path $backendDest $name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $target -Recurse -Force
    } else {
        # 不把本地 .env 打进包，避免泄露密钥；服务器用 env.example 自行配置
        if ($name -eq '.env') {
            return
        }
        Copy-Item -Path $_.FullName -Destination $backendDest -Force
    }
}

Write-Host "  - Backend done ($backendDest)" -ForegroundColor Green
Write-Host "  - Excluded: node_modules, dist, storage, .env (use env.example on server)" -ForegroundColor DarkGray

# --- Frontend: frontend/dist (already built) ---
$frontendDist = Join-Path $projectRoot "frontend\dist"
Write-Host ""
Write-Host "[2/2] Frontend dist (run 'npm run build' in frontend first)" -ForegroundColor Yellow
if (-not (Test-Path $frontendDist)) {
    Write-Host "  ! frontend\dist missing — build the frontend before deploying" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendSize = (Get-ChildItem -Path $backendDest -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$backendMB = if ($backendSize) { [math]::Round($backendSize / 1MB, 1) } else { 0 }
Write-Host "  backend\dist  ($backendMB MB)" -ForegroundColor Cyan

if (Test-Path $frontendDist) {
    $frontendSize = (Get-ChildItem -Path $frontendDist -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $frontendMB = [math]::Round($frontendSize / 1MB, 1)
    Write-Host "  frontend\dist  ($frontendMB MB)" -ForegroundColor Cyan
}
