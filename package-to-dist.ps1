# Package backend + frontend to their dist folders (no compression, no node_modules)
$ErrorActionPreference = 'Stop'
$projectRoot = "D:\QIanDuanXiangMu\tuku"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Packaging (no compression)..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- Backend: backend/dist ---
$backendDest = Join-Path $projectRoot "backend\dist"
Write-Host ""
Write-Host "[1/2] Packaging backend..." -ForegroundColor Yellow
if (Test-Path $backendDest) {
    Remove-Item -Path $backendDest -Recurse -Force
}
New-Item -Path $backendDest -ItemType Directory -Force | Out-Null

# Copy backend/src
$backendSrc = Join-Path $projectRoot "backend\src"
Copy-Item -Path $backendSrc -Destination $backendDest -Recurse -Force

# Copy backend root config files (no node_modules)
$backendRoot = Join-Path $projectRoot "backend"
$backendExtraItems = @(
    "package.json",
    ".env",
    "app.js"
)
foreach ($name in $backendExtraItems) {
    $src = Join-Path $backendRoot $name
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $backendDest -Force
    }
}

# Copy backend subdirectories (config, middleware, routes, services, utils)
$backendSubDirs = @("config", "middleware", "routes", "services", "utils")
foreach ($sub in $backendSubDirs) {
    $src = Join-Path $backendRoot $sub
    $dst = Join-Path $backendDest $sub
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    }
}
Write-Host "  - Backend done ($backendDest)" -ForegroundColor Green

# --- Frontend: frontend/dist (already built) ---
$frontendDist = Join-Path $projectRoot "frontend\dist"
Write-Host ""
Write-Host "[2/2] Frontend dist (already built at frontend\dist)" -ForegroundColor Yellow

# --- Show results ---
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendSize = (Get-ChildItem -Path $backendDest -Recurse -File | Measure-Object -Property Length -Sum).Sum
$backendMB = [math]::Round($backendSize / 1MB, 1)
Write-Host "  backend\dist  ($backendMB MB)" -ForegroundColor Cyan

$frontendSize = (Get-ChildItem -Path $frontendDist -Recurse -File | Measure-Object -Property Length -Sum).Sum
$frontendMB = [math]::Round($frontendSize / 1MB, 1)
Write-Host "  frontend\dist  ($frontendMB MB)" -ForegroundColor Cyan
