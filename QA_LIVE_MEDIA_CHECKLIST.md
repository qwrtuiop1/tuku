# 实况图三层播放与弱网联调检查清单

## 环境准备
- 后端：ffmpeg 可用；环境变量检查（LIVE_MEDIA_MAX_DURATION、LIVE_MEDIA_POSTER_QUALITY、LIVE_MEDIA_MAKE_WEBM）
- 前端：构建产物最新；前端 Nginx 已开启 Accept-Ranges bytes 与缓存策略

## 素材准备
- iOS Live Photo：同名 .heic + .mov
- Android Motion Photo：内嵌 MP4 的 .jpg
- 动图：.gif 与 .webp（≥ 和 ≤ 10 秒各一份）

## 上传验证（/api/live-media/upload）
- 批量选择 HEIC+MOV；应返回 202，稍后在“仅实况”能看到卡片
- 上传 GIF/WebP；生成 poster.jpg 与 video.mp4（可选 video.webm）
- 上传 Motion Photo JPG；应抽取出 MP4 并生成 poster

## 列表层（Files 页 → 勾选“仅实况”）
- 卡片展示封面与 LIVE 角标
- 桌面悬停/移动端长按 300ms：静音循环预览
- 离屏后预览停止（滚动/切页）

## 详情层（点击卡片 → 详情弹窗）
- 自动加载并播放（静音）；显示分辨率/时长/FPS
- 切换不同资源无报错；关闭后释放资源

## 全屏层（详情中点击“全屏播放”）
- 可控播放/暂停、系统媒体控件可用
- 退出全屏恢复详情

## 兼容性
- iOS Safari（最新/次新版）、iPadOS Safari
- Android Chrome（最新）、微信内置 WebView（基本播放）
- 桌面 Chrome/Edge/Safari/Firefox（MP4 优先，WebM 作为备选）

## 网络与性能
- 使用 DevTools Network 设置 3G/Slow 4G：
  - 首屏显示封面，起播 < 2s（缓存命中后 < 1s）
  - Range 请求返回 206，断点续传正常
- CPU 节流 4×：预览稳定，无明显掉帧（或自动暂停）

## 回退与降级
- prefers-reduced-motion: reduce：不自动播放，仅展示封面
- 无 MP4/WebM 时：卡片仅静态封面

## API 验证
- GET /api/live-media?page=1&limit=20 返回分页与可访问 URL
- GET /api/live-media/:id 返回元数据
- GET /api/live-media/:id/stream.mp4 带 Range 头返回 206 与 Content-Range

## Nginx 校验
- 视频响应头包含：Accept-Ranges: bytes、合理 Cache-Control
- 封面与视频分别命中长期缓存

## 安全
- 前端 CSP 未拦截视频/封面请求
- CORS 不阻塞接口（同源/允许域）

## 通过标准
- 三类素材全流程通过；三层播放一致；弱网/降级合理；主要浏览器通过















