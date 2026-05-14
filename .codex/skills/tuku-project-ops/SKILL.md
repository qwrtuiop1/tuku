---
name: tuku-project-ops
description: "Tuku 项目专用操作流程，仅适用于 D:\\QIanDuanXiangMu\\tuku。当用户要求启动、重启、运行、打包、构建，或使用中文触发词如"启动"、"重启"、"打包"、"前端"、"后端"时使用此技能。任务使用 PowerShell 命令；前端构建输出到 D:\\QIanDuanXiangMu\\tuku\\frontend\\dist；后端打包仅报告变更文件，不生成 zip 或部署包。"
---

# Tuku 项目操作指南

## 适用范围

本技能仅适用于本地 Tuku 项目目录 `D:\QIanDuanXiangMu\tuku` 及其子文件夹。

如果当前工作区不是此目录，且用户未明确指定此路径，则不适用本技能。

## 规则

- 启动、重启、构建、打包操作只使用 PowerShell 命令。
- 不使用 Bash、cmd 批处理文件、Python、Node 辅助脚本、Docker、PM2 或自定义脚本。
- 用户要求打包/构建后端时，不生成压缩包、上传或部署。
- "同时打包前端和后端"理解为：运行前端构建，然后按文件夹汇总后端变更文件。
- 保持命令输出和最终报告简洁。
- 日志文件位于 `D:\QIanDuanXiangMu\tuku\.codex-logs\`

## 启动前端和后端

启动两端服务，从项目文件夹执行 PowerShell 命令：

```powershell
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\backend''; npm run dev'
Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath ''D:\QIanDuanXiangMu\tuku\frontend''; npm run dev'
```

启动后报告访问地址：
- **后端**: http://localhost:3000
- **前端**: http://localhost:5173

如果用户只要求启动一端，只运行对应的命令。

## 重启前端和后端

重启两端时，先停止可识别为该项目的 Node/npm/Vite/nodemon 进程，再重新启动：

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

重启后报告访问地址：
- **后端**: http://localhost:3000
- **前端**: http://localhost:5173

如果停止时未找到匹配进程，继续执行启动命令。

## 构建前端

前端构建请求使用：

```powershell
Set-Location -LiteralPath 'D:\QIanDuanXiangMu\tuku\frontend'
npm run build
```

前端构建输出目录：

```text
D:\QIanDuanXiangMu\tuku\frontend\dist
```

不要将输出移动到仓库根目录的 `dist` 文件夹。

## 打包后端

后端打包请求不生成压缩包，只报告变更的后端文件（按文件夹分组）。只有用户要求完整项目/打包汇总时，才包含其他变更文件。

使用 PowerShell 收集变更文件：

```powershell
Set-Location -LiteralPath 'D:\QIanDuanXiangMu\tuku'
git status --short
```

需要分组报告时，使用此 PowerShell 分组形式：

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

最终答案中按文件夹分组文件，例如：

```text
backend/src/routes
- M backend/src/routes/files.js
- M backend/src/routes/share.js

backend/src/services
- M backend/src/services/storageService.js
```

不要提及 zip 文件、上传、部署包或生成的后端压缩包，除非用户明确更改此规则。

## 查看日志

项目运行时日志存储在 `.codex-logs\` 文件夹，可用的日志文件：

- `backend.out.log` - 后端标准输出（启动信息、GeeTest 请求等）
- `backend.err.log` - 后端错误（SQL 错误、ECONNRESET 等）
- `frontend.out.log` - 前端标准输出（Sass 警告等）
- `frontend.err.log` - 前端标准错误

查看最近的后端错误：

```powershell
Get-Content -Tail 50 'D:\QIanDuanXiangMu\tuku\.codex-logs\backend.err.log'
```

查看最近的后端输出：

```powershell
Get-Content -Tail 50 'D:\QIanDuanXiangMu\tuku\.codex-logs\backend.out.log'
```

## 已知问题（来自日志）

调试时注意以下已知模式：

1. **Sass 弃用警告** - 前端可能显示大量 `legacy-js-api` 弃用警告，这是无害的，可以忽略。

2. **ECONNRESET** - 偶尔的连接重置错误在数据库连接池负载较重或服务器重启时是正常的。

3. **GeeTest bypass** - 日志显示 `result: 'success', reason: 'bypass status'` 是 GeeTest 在测试/bypass 模式下的正常行为。
