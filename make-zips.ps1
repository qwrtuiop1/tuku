Add-Type -AssemblyName System.IO.Compression.FileSystem

$comp = [System.IO.Compression.CompressionLevel]::NoCompression

# Frontend
if (Test-Path 'D:\QIanDuanXiangMu\tuku\tuku-frontend.zip') { Remove-Item 'D:\QIanDuanXiangMu\tuku\tuku-frontend.zip' -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory('D:\QIanDuanXiangMu\tuku\frontend\dist', 'D:\QIanDuanXiangMu\tuku\tuku-frontend.zip', $comp, $true)
Write-Host 'Frontend done'

# Backend
if (Test-Path 'D:\QIanDuanXiangMu\tuku\tuku-backend.zip') { Remove-Item 'D:\QIanDuanXiangMu\tuku\tuku-backend.zip' -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory('D:\QIanDuanXiangMu\tuku\backend\src', 'D:\QIanDuanXiangMu\tuku\tuku-backend.zip', $comp, $false)
Write-Host 'Backend done'

# Show sizes
Get-ChildItem 'D:\QIanDuanXiangMu\tuku\tuku-frontend.zip','D:\QIanDuanXiangMu\tuku\tuku-backend.zip' | ForEach-Object { Write-Host $_.Name ':' ([math]::Round($_.Length/1MB,1)) 'MB' }
