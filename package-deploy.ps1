# Package script - Frontend and Backend packaging without compression
# Purpose: Package frontend and backend to deployment-package directory, no compression

$ErrorActionPreference = 'Stop'
$projectRoot = "D:\QIanDuanXiangMu\tuku"
$deploymentDir = Join-Path $projectRoot "deployment-package"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting packaging (no compression)..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Clean old package directories
$backendDest = Join-Path $deploymentDir "backend"
$frontendDest = Join-Path $deploymentDir "frontend"

Write-Host ""
Write-Host "[1/4] Cleaning old directories..." -ForegroundColor Yellow
if (Test-Path $backendDest) {
    Remove-Item -Path $backendDest -Recurse -Force
    Write-Host "  - Cleaned backend directory" -ForegroundColor Gray
}
if (Test-Path $frontendDest) {
    Remove-Item -Path $frontendDest -Recurse -Force
    Write-Host "  - Cleaned frontend directory" -ForegroundColor Gray
}

# Package frontend
Write-Host ""
Write-Host "[2/4] Packaging frontend..." -ForegroundColor Yellow
$frontendSource = Join-Path $projectRoot "frontend\dist"
$frontendSourceBackup = Join-Path $projectRoot "tuku-frontend-dist"

if (Test-Path $frontendSource) {
    Copy-Item -Path $frontendSource -Destination $frontendDest -Recurse -Force
    Write-Host "  - Frontend done (source: frontend\dist)" -ForegroundColor Green
} elseif (Test-Path $frontendSourceBackup) {
    Copy-Item -Path $frontendSourceBackup -Destination $frontendDest -Recurse -Force
    Write-Host "  - Frontend done (source: tuku-frontend-dist)" -ForegroundColor Green
} else {
    Write-Host "  - ERROR: Frontend dist not found!" -ForegroundColor Red
}

# Package backend
Write-Host ""
Write-Host "[3/4] Packaging backend..." -ForegroundColor Yellow
$backendSource = Join-Path $projectRoot "backend\src"
$backendSourceBackup = Join-Path $projectRoot "tuku-backend-src"

if (Test-Path $backendSource) {
    Copy-Item -Path $backendSource -Destination $backendDest -Recurse -Force
    Write-Host "  - Backend done (source: backend\src)" -ForegroundColor Green
} elseif (Test-Path $backendSourceBackup) {
    Copy-Item -Path $backendSourceBackup -Destination $backendDest -Recurse -Force
    Write-Host "  - Backend done (source: tuku-backend-src)" -ForegroundColor Green
} else {
    Write-Host "  - ERROR: Backend source not found!" -ForegroundColor Red
}

# Copy config files
Write-Host ""
Write-Host "[4/4] Copying config files..." -ForegroundColor Yellow
$backendEnvSource = Join-Path $projectRoot "backend\.env"
$backendEnvDest = Join-Path $backendDest ".env"
if (Test-Path $backendEnvSource) {
    Copy-Item -Path $backendEnvSource -Destination $backendEnvDest -Force
    Write-Host "  - Backend .env copied" -ForegroundColor Green
}

$frontendEnvSource = Join-Path $projectRoot "frontend\.env"
$frontendEnvDest = Join-Path $frontendDest ".env"
if (Test-Path $frontendEnvSource) {
    Copy-Item -Path $frontendEnvSource -Destination $frontendEnvDest -Force
    Write-Host "  - Frontend .env copied" -ForegroundColor Green
}

# Show results
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Packaging complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Package structure:" -ForegroundColor White
Get-ChildItem -Path $deploymentDir -Force | ForEach-Object {
    if ($_.PSIsContainer) {
        $size = (Get-ChildItem -Path $_.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 1)
        $dirName = $_.Name
        Write-Host "  $dirName/  ($sizeMB MB)" -ForegroundColor Cyan
    } else {
        $fileName = $_.Name
        Write-Host "  $fileName" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Deployment directory: $deploymentDir" -ForegroundColor White
