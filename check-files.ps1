param(
    [string]$FilePath
)
$data = [System.IO.File]::ReadAllBytes($FilePath)
$n = $data.Length
Write-Host "========================================"
Write-Host ("File: " + [IO.Path]::GetFileName($FilePath))
Write-Host ("Size: " + $n + " bytes")

Write-Host ("First 4 bytes: " + [string]::Format('{0:X2} {1:X2} {2:X2} {3:X2}', $data[0], $data[1], $data[2], $data[3]))
if ($data[0] -eq 0xFF -and $data[1] -eq 0xD8) {
    Write-Host "  -> Valid JPEG SOI"
}

$eoiPos = -1
for ($i = $n - 2; $i -ge 0; $i--) {
    if ($data[$i] -eq 0xFF -and ($i + 1) -lt $n -and $data[$i+1] -eq 0xD9) {
        $eoiPos = $i
        break
    }
}

if ($eoiPos -ge 0) {
    $afterBytes = $n - $eoiPos - 1
    Write-Host ("JPEG EOI at offset 0x" + [Convert]::ToString($eoiPos, 16) + " ($eoiPos)")
    Write-Host ("Bytes after EOI: $afterBytes")
    if ($afterBytes -gt 0 -and $afterBytes -le 200) {
        $hex = -join ($data[($eoiPos+1)..($n-1)] | ForEach-Object { $_.ToString('X2') + ' ' })
        Write-Host ("After EOI: " + $hex)
    } elseif ($afterBytes -gt 200) {
        $hex1 = -join ($data[($eoiPos+1)..[Math]::Min($eoiPos+40, $n-1)] | ForEach-Object { $_.ToString('X2') + ' ' })
        $hex2 = -join ($data[($n-40)..($n-1)] | ForEach-Object { $_.ToString('X2') + ' ' })
        Write-Host ("After EOI (first 40): " + $hex1)
        Write-Host ("Last 40 bytes: " + $hex2)
    }
} else {
    Write-Host "NO JPEG EOI FOUND near end!"
}

Write-Host "Searching for MP4 ftyp box..."
$windowStart = [Math]::Max(0, $n - 2097152)
$found = $false
for ($i = $windowStart; $i -lt $n - 8; $i++) {
    $boxLen = ($data[$i] -shl 24) + ($data[$i+1] -shl 16) + ($data[$i+2] -shl 8) + $data[$i+3]
    if ($data[$i+4] -eq 0x66 -and $data[$i+5] -eq 0x74 -and $data[$i+6] -eq 0x79 -and $data[$i+7] -eq 0x70) {
        Write-Host ("FOUND ftyp at offset 0x" + [Convert]::ToString($i, 16) + " ($i)")
        Write-Host ("  Box length: $boxLen")
        Write-Host ("  Bytes: " + [string]::Format('{0:X2} {1:X2} {2:X2} {3:X2} {4:X2} {5:X2} {6:X2} {7:X2}', $data[$i],$data[$i+1],$data[$i+2],$data[$i+3],$data[$i+4],$data[$i+5],$data[$i+6],$data[$i+7]))
        $found = $true
    }
}
if (-not $found) {
    Write-Host "No ftyp box found in last 2MB"
}

Write-Host ""
Write-Host "VERDICT:"
if ($eoiPos -ge 0 -and $afterBytes -eq 0) {
    Write-Host "  PLAIN JPEG"
} elseif ($eoiPos -ge 0 -and $afterBytes -gt 0) {
    Write-Host "  JPEG with $afterBytes bytes after EOI"
} elseif ($eoiPos -lt 0) {
    Write-Host "  NO JPEG EOI - possible Motion Photo"
}
