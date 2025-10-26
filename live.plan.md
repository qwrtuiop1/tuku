# 实况图上传与三层播放改造计划

## 范围与目标

- 支持三类“实况”：iOS Live Photo(HEIC+MOV)、Android Motion Photo(JPEG内嵌MP4)、动图(GIF/WebP)
- 上传侧自动识别/配对/转码，生成封面与高兼容视频(MP4 H.264/AAC，辅以WebM)
- 前端“三层”：列表卡片、详情页、全屏，统一播放策略、手势与降级
- 保留原文件可选；默认走高性能视频播放，弱网/低端设备平滑降级

## 后端改造

### 1) 数据模型与存储

- 新表：`live_media_assets`
- 字段：id，owner_user_id，kind(live_photo|motion_photo|animated)，poster_path(jpg/webp)，video_mp4_path，video_webm_path，original_image_path，original_video_path，duration_ms，width，height，fps，loopable，created_at
- 目录结构：`storage/live_media/{user_id}/{asset_id}/[poster.jpg|video.mp4|video.webm|original.*]`
- 数据库迁移文件：`backend/database/create_live_media_assets.sql`

### 2) 依赖与容器

- backend/Dockerfile：加入 ffmpeg 与 libvips(sharp 运行时依赖)
- backend/package.json：新增 `sharp`, `fluent-ffmpeg`, `exifr` 或 `exiftool-vendored`，`mime`
- 环境变量：`LIVE_MEDIA_MAX_DURATION`, `LIVE_MEDIA_KEEP_ORIGINAL`, `LIVE_MEDIA_POSTER_QUALITY`

### 3) 上传与处理 API

- 新路由：`backend/src/routes/liveMedia.js`
- POST `/api/live-media/upload`
  - 支持多文件表单：自动识别三种来源
  - 配对策略：
  - iOS: 基名相同 `.heic` + `.mov`
  - Android: `.jpg`/`.jpeg` 探测 XMP MotionPhoto；从 JPEG 中抽取内嵌 MP4
  - GIF/WebP: 直接接收；转码为 MP4/WebM
  - 队列式处理：同步小文件，超时或长视频以 202 接受并轮询结果
- GET `/api/live-media/:id` → 返回资源 JSON（各变体 URL、元数据）
- GET `/api/live-media/:id/stream.mp4`、`stream.webm` → Range 支持
- 服务层：`backend/src/services/liveMediaService.js`
- 解析/配对/元数据提取(exif/xmp)
- 生成 `poster.jpg`（sharp 从首帧/关键帧）
- ffmpeg：
  - MOV/内嵌MP4 → MP4(H.264/AAC)，并行产出 WebM(VP9/Opus)（可配）
  - GIF/WebP → MP4/WebM，统一帧率与最大分辨率/时长
- 持久化与清理策略（失败回滚）
- Range 处理（如走 Node）：在 `liveMedia.js` 中按 `Range` 返回分片并设置 `Accept-Ranges: bytes`

### 4) Nginx/静态服务

- 若使用 Nginx 直出：
- 为 `mp4, webm, jpg, webp` 设置正确 `types` 与缓存
- 添加 `add_header Accept-Ranges bytes;` 与 `expires`/`cache-control`
- 可选 `mp4;` 模块以优化 MP4 起播
- 前端 Nginx(`nginx-frontend.conf`)：为封面/视频开启长期缓存与 CORS（如跨域）

## 前端改造（Vue 3 + Vite）

### 1) 组件与层次

- 新组件：
- `frontend/src/components/LiveMediaCard.vue`（列表卡片）
- `frontend/src/components/LiveMediaPlayer.vue`（详情页主播放器）
- `frontend/src/components/LiveMediaFullscreen.vue`（全屏查看器）
- 集中逻辑：`frontend/src/utils/liveMedia.ts`（能力检测、源选择、策略）

### 2) 播放策略

- 源选择优先级：MP4 → WebM → 动图(原始 GIF/WebP) → 静态封面
- 列表卡片：
- 默认静态封面 + “Live” 角标
- 桌面悬停/移动端长按 300ms 预览（静音，循环 ≤3s 片段）
- IntersectionObserver 懒加载，离屏即暂停/卸载
- 详情页：
- 进入视口自动播放（静音），可切换声音与循环
- 网络差/低性能降级至短预览或静态
- 全屏：
- 手势：双击播放/暂停，单指滑动进度，双指缩放，向下滑关闭
- UI：时间线、声音、循环、速度(0.5/1x)
- 无障碍：`prefers-reduced-motion` 关闭自动播放；键盘可控

### 3) 上传体验

- 支持批量拖拽/选择；本地即时配对与类型识别
- 预览面板：封面帧选择、裁剪与压缩提示
- 进度/失败重试；服务端 202 处理时轮询任务状态

### 4) 兼容与降级

- Safari/iOS：使用 MP4；HEIC 仅作为原图存档与封面来源
- 旧安卓/低端机：限制分辨率与码率（后端可配）
- GIF 超长：提示转码并截断到 `LIVE_MEDIA_MAX_DURATION`

## 关键代码要点（简版）

- Range 响应（Node）示例要点：解析 `Range`，返回 206，`Content-Range` 与分片流
- ffmpeg 转码参数建议：
- MP4: `-c:v libx264 -profile:v high -pix_fmt yuv420p -b:v 2000k -maxrate 2500k -bufsize 4000k -movflags +faststart`
- WebM: `-c:v libvpx-vp9 -b:v 0 -crf 35`
- 时长/尺寸限制：最长 N 秒，最大宽 1080p，可配

## 测试与验收

- 上传三类素材（配对/内嵌/动图），校验封面/视频、元数据、播放
- 三层页面在 3G/4G/桌面不同浏览器的行为一致性
- 大小/时长越界与失败回滚验证
- Nginx Range、缓存、生效验证

## 迁移与回滚

- 新表可无损上线；功能灰度：前端开关“启用实况播放（Beta）”
- 回滚：关闭新入口，保留已入库资源静态展示

### To-dos

- [ ] 创建 live_media_assets 表与索引
- [ ] 在后端镜像加入 ffmpeg 与 libvips 依赖
- [ ] 添加 sharp、fluent-ffmpeg、exifr 依赖与初始化
- [ ] 实现 liveMediaService 解析配对与元数据提取
- [ ] 实现 ffmpeg 转码与 poster 生成
- [ ] 新增 /api/live-media/upload 接口与处理流
- [ ] 实现 /api/live-media/:id/stream(.mp4|.webm) Range 响应
- [ ] 更新 Nginx 类型、缓存、Accept-Ranges 与 CORS
- [ ] 编写 liveMedia.ts 能力检测与资源选择
- [ ] 创建 LiveMediaCard.vue 列表卡片组件
- [ ] 创建 LiveMediaPlayer.vue 详情播放器组件
- [ ] 创建 LiveMediaFullscreen.vue 全屏组件
- [ ] 增强上传配对识别与封面选择 UI
- [ ] 在列表/详情整合新组件并接通数据
- [ ] 完成跨端三层播放联调与弱网测试

### 扩展：混合多选上传（图片/视频/实况）

- 前端：在 `frontend/src/components/FileUploader.vue` 中对多选结果进行分组
  - HEIC+MOV 按同名配对，打包调用 `/api/live-media/upload`（分别返回 jobId）
  - GIF/WebP 单文件作为实况批次上传
  - 其他文件（jpg/png/mp4/mov 未配对）走 `/api/files/upload`
  - 任务进度：支持多个 job 的轮询与列表展示
- 后端：保持单资产批次上传语义不变；复用已存在的任务查询接口
- 文档：在 QA 清单中补充混合多选上传验证流程（混合队列完成顺序、失败重试）
