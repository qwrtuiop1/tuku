param([string[]]$Paths)
foreach ($p in $Paths) {
    $data = [System.IO.File]::ReadAllBytes($p)
    $n = $data.Length
    Write-Host "========================================"
    Write-Host "File: $([IO.Path]::GetFileName($p))"
    Write-Host "Size: $n bytes ($(if($n -gt 1MB){"$([math]::Round($n/1MB,2)) MB"}else{"$([math]::Round($n/1KB,1)) KB"}))"

    # Check for JPEG SOI
    Write-Host "First 4 bytes: $([string]::Format('{0:X2} {1:X2} {2:X2} {3:X2}', $data[0], $data[1], $data[2], $data[3]))"
    if ($data[0] -eq 0xFF -and $data[1] -eq 0xD8) {
        Write-Host "  -> Valid JPEG SOI (FF D8)"
    }

    # Find JPEG markers in first 2KB
    Write-Host "`nJPEG markers (first 2KB):"
    $foundMarkers = @()
    for ($i = 0; $i -lt [Math]::Min(2048, $n - 1); $i++) {
        if ($data[$i] -eq 0xFF -and $i + 2 -lt $n) {
            $m = $data[$i+1]
            $len = ($data[$i+2] -shl 8) + $data[$i+3]
            $name = switch($m) {
                0xD8 { "SOI" }
                0xD9 { "EOI" }
                0xE0 { "APP0 (JFIF)" }
                0xE1 { "APP1 (EXIF)" }
                0xE2 { "APP2 (ICC/Meta)" }
                0xDB { "DQT (Quant)" }
                0xC0 { "SOF0 (Baseline)" }
                0xC4 { "DHT (Huffman)" }
                0xDA { "SOS (Scan)" }
                0xFE { "COM (Comment)" }
                0xEE { "Adobe" }
                default { "Marker 0x$($m.ToString('X2'))" }
            }
            $foundMarkers += "  0x$($i.ToString('X4')): $name (len=$len)"
        }
    }
    $foundMarkers | Select-Object -First 15 | ForEach-Object { Write-Host $_ }

    # Find last JPEG EOI (FF D9) - search from end
    $eoiPos = -1
    for ($i = $n - 2; $i -ge 0; $i--) {
        if ($data[$i] -eq 0xFF -and $i + 1 -lt $n -and $data[$i+1] -eq 0xD9) {
            $eoiPos = $i
            break
        }
    }

    if ($eoiPos -ge 0) {
        $afterBytes = $n - $eoiPos - 1
        Write-Host "`nJPEG EOI (FF D9) found at offset 0x$($eoiPos.ToString('X4')) ($eoiPos)"
        Write-Host "  Bytes after EOI: $afterBytes"
        if ($afterBytes -gt 0 -and $afterBytes -le 100) {
            $hex = -join ($data[($eoiPos+1)..($n-1)] | ForEach-Object { $_.ToString('X2') + ' ' })
            Write-Host "  After EOI: $hex"
        } elseif ($afterBytes -gt 100) {
            $hex = -join ($data[($eoiPos+1)..[Math]::Min($eoiPos+32, $n-1)] | ForEach-Object { $_.ToString('X2') + ' ' })
            Write-Host "  After EOI (first 32 bytes): $hex"
            Write-Host "  After EOI (last 20 bytes): ..." + (-join ($data[($n-21)..($n-1)] | ForEach-Object { $_.ToString('X2') + ' ' }))
        }
    } else {
        Write-Host "`nNO JPEG EOI found at end of file!"
    }

    # Check for MP4 ftyp markers near end
    Write-Host "`nSearching for MP4 ftyp box near end of file..."
    $windowStart = [Math]::Max(0, $n - 2097152)  # 2MB window
    $ftypFound = $false
    for ($i = $windowStart; $i -lt $n - 8; $i++) {
        if ($data[$i] -eq 0x00 -and $data[$i+1] -eq 0x00 -and $data[$i+2] -eq 0x00) {
            $boxLen = ($data[$i+3] -shl 24) -shr 24
            # Actually read big-endian u32
            $boxLen = ($data[$i] -shl 24) + ($data[$i+1] -shl 16) + ($data[$i+2] -shl 8) + $data[$i+3]
            if ($data[$i+4] -eq 0x66 -and $data[$i+5] -eq 0x74 -and $data[$i+6] -eq 0x79 -and $data[$i+7] -eq 0x70) {
                Write-Host "  FOUND ftyp box at offset 0x$($i.ToString('X4'))!"
                Write-Host "    Box length (big-endian): $boxLen"
                Write-Host "    Brand: $([char]$data[$i+8])$([char]$data[$i+9])$([char]$data[$i+10])$([char]$data[$i+11])"
                Write-Host "    Bytes: $([string]::Format('{0:X2} {1:X2} {2:X2} {3:X2} {4:X2} {5:X2} {6:X2} {7:X2}', $data[$i],$data[$i+1],$data[$i+2],$data[$i+3],$data[$i+4],$data[$i+5],$data[$i+6],$data[$i+7]))"
                $ftypFound = $true
            }
        }
    }
    if (-not $ftypFound) {
        Write-Host "  No MP4 ftyp box found in last 2MB"
    }

    # Overall verdict
    Write-Host "`nVERDICT:"
    if ($eoiPos -ge 0 -and $afterBytes -eq 0) {
        Write-Host "  -> PLAIN JPEG (ends at FF D9, no appended data)"
    } elseif ($eoiPos -ge 0 -and $afterBytes -gt 0) {
        Write-Host "  -> LIKELY PLAIN JPEG (ends with FF D9 but has $afterBytes bytes after)"
        Write-Host "     The bytes after EOI may be harmless padding or indicate Motion Photo"
    } else {
        Write-Host "  -> POSSIBLE MOTION PHOTO or non-standard JPEG"
    }
    Write-Host ""
}
