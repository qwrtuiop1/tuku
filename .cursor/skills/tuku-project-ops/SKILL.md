---
name: tuku-project-ops
description: "Project-specific operating workflow for D:\\QIanDuanXiangMu\\tuku only. Use when the user asks to start, restart, run, package, build, or use Chinese trigger words such as 启动, 重启, 打包, 前端, or 后端 for the Tuku frontend/backend in this checkout. For these tasks, use PowerShell statements only; frontend build output must be D:\\QIanDuanXiangMu\\tuku\\frontend\\dist, and backend packaging means only reporting changed files grouped by folder, with no zip, upload, or deployment artifact."
---

# Tuku Project Ops

## Scope

Use this skill only for the local Tuku checkout at `D:\QIanDuanXiangMu\tuku` or its subfolders.

If the active workspace is not this checkout and the user did not explicitly name this path, do not apply this skill.

## Rules

- Use PowerShell statements only for start, restart, build, and packaging requests.
- Do not use Bash, cmd batch files, Python, Node helper scripts, Docker, PM2, or custom generated scripts for these operations.
- Do not compress, upload, publish, or deploy when the user asks to package/build the backend.
- Treat "package/build both frontend and backend" as: run the frontend build, then summarize backend changed files grouped by folder.
- Keep command output and final reports concise.
- Log files are located at `D:\QIanDuanXiangMu\tuku\.codex-logs\`

## Start Frontend And Backend

For requests to start both sides, start both services with PowerShell from their project folders:

```powershell
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\backend''; npm run dev'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\frontend''; npm run dev'
```

If the user asks for only one side, run only the corresponding statement.

## Restart Frontend And Backend

For requests to restart both sides, stop only Tuku-related Node/npm/Vite/nodemon processes that can be identified by this project path, then start again:

```powershell
$project = 'D:\QIanDuanXiangMu\tuku'
Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -and
    ($_.CommandLine -like "*$project*") -and
    ($_.CommandLine -match 'node|npm|vite|nodemon|src\\app\.js')
  } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\backend''; npm run dev'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\frontend''; npm run dev'
```

If stopping finds no matching process, continue with the start statements.

## Build Or Package Frontend

For frontend build/package requests, use:

```powershell
Set-Location -LiteralPath 'D:\QIanDuanXiangMu\tuku\frontend'
npm run build
```

The expected frontend build directory is:

```text
D:\QIanDuanXiangMu\tuku\frontend\dist
```

Do not move the output to the repository root `dist` folder.

## Package Backend

For backend package/build requests, do not build an archive. Report only which backend-related files changed, grouped by folder. Include other changed project files only if the user asked for the whole project/package summary.

Use PowerShell to gather the changed files:

```powershell
Set-Location -LiteralPath 'D:\QIanDuanXiangMu\tuku'
git status --short
```

When a grouped report is useful, use this PowerShell grouping form:

```powershell
Set-Location -LiteralPath 'D:\QIanDuanXiangMu\tuku'
git status --short |
  ForEach-Object {
    $status = $_.Substring(0, 2).Trim()
    $path = $_.Substring(3)
    if ($path -match ' -> ') { $path = ($path -split ' -> ')[-1] }
    [pscustomobject]@{
      Status = $status
      Path = $path
      Folder = if ((Split-Path -Parent $path)) { Split-Path -Parent $path } else { '.' }
    }
  } |
  Group-Object Folder |
  ForEach-Object {
    $_.Name
    $_.Group | ForEach-Object { "  $($_.Status) $($_.Path)" }
  }
```

In the final answer, group files under the same folder together, for example:

```text
backend/src/routes
- M backend/src/routes/files.js
- M backend/src/routes/share.js

backend/src/services
- M backend/src/services/storageService.js
```

Do not mention zip files, uploads, deployment packages, or generated backend archives unless the user explicitly changes this rule.

## View Logs

The project stores runtime logs in `.codex-logs\` folder. Available log files:

- `backend.out.log` - Backend stdout (startup messages, GeeTest requests, etc.)
- `backend.err.log` - Backend errors (SQL errors, ECONNRESET, etc.)
- `frontend.out.log` - Frontend stdout (Sass warnings, etc.)
- `frontend.err.log` - Frontend stderr

To read recent backend errors:

```powershell
Get-Content -Tail 50 'D:\QIanDuanXiangMu\tuku\.codex-logs\backend.err.log'
```

To read recent backend output:

```powershell
Get-Content -Tail 50 'D:\QIanDuanXiangMu\tuku\.codex-logs\backend.out.log'
```

## Known Issues (from logs)

When debugging, be aware of these known patterns:

1. **Sass Deprecation Warnings** - Frontend may show many `legacy-js-api` deprecation warnings. These are harmless and can be ignored.

2. **ECONNRESET** - Occasional connection reset errors are normal when the database connection pool is under heavy load or when the server is restarting.

3. **GeeTest bypass** - The logs show `result: 'success', reason: 'bypass status'` which is normal behavior when GeeTest is in testing/bypass mode.
