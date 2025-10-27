const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const liveMediaService = require('../services/liveMediaService');

const router = express.Router();

const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

// 简单的多文件接收，用于 Live 媒体识别/配对
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const tmpDir = path.join(BASE_STORAGE, 'tmp');
      await fs.ensureDir(tmpDir);
      cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
    files: 5
  }
});

router.post('/upload', authenticateToken, upload.array('files', 5), asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ message: '未接收到文件' });
  const folderId = req.body && req.body.folder_id ? parseInt(req.body.folder_id, 10) : null;

  try {
    const jobId = await liveMediaService.createUploadJob(userId, files, folderId);
    res.status(202).json({ message: '处理已接受', jobId });
  } catch (e) {
    res.status(400).json({ message: e.message || '处理失败' });
  } finally {
    // 注意：不要在这里删除临时文件，后台异步处理仍需读取这些路径
    // 临时文件的清理已移动到 liveMediaService 中在处理完成/失败后统一执行
  }
}));

// 列表
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const offset = (page - 1) * limit;
  const db = require('../config/database').pool;
  const folderId = req.query.folder_id ? parseInt(req.query.folder_id, 10) : null;
  let rows, cnt;
  if (folderId) {
    [rows] = await db.execute(
      'SELECT * FROM live_media_assets WHERE owner_user_id=? AND folder_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, folderId, limit, offset]
    );
    [cnt] = await db.execute('SELECT COUNT(*) AS total FROM live_media_assets WHERE owner_user_id=? AND folder_id=?', [userId, folderId]);
  } else {
    [rows] = await db.execute(
      'SELECT * FROM live_media_assets WHERE owner_user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    [cnt] = await db.execute('SELECT COUNT(*) AS total FROM live_media_assets WHERE owner_user_id=?', [userId]);
  }
  const total = cnt && cnt[0] ? cnt[0].total : 0;
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const buildUrl = (rel) => rel ? `${backendDomain}/uploads/${String(rel).replace(/^\/*/, '')}` : null;
  const items = rows.map(r => ({
    id: r.id,
    kind: r.kind,
    poster_url: buildUrl(r.poster_path),
    video_mp4_url: buildUrl(r.video_mp4_path),
    video_webm_url: buildUrl(r.video_webm_path),
    duration_ms: r.duration_ms,
    width: r.width,
    height: r.height,
    fps: r.fps,
    loopable: !!r.loopable
  }));
  res.json({ items, pagination: { page, limit, total } });
}));

router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset) return res.status(404).json({ message: '资源不存在' });

  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const buildUrl = (rel) => rel ? `${backendDomain}/uploads/${rel.replace(/^\/*/, '')}` : null;
  // 获取变体
  const [variants] = await require('../config/database').pool.execute('SELECT label, width, height, bitrate_k, mp4_path, webm_path FROM live_media_variants WHERE asset_id=? ORDER BY height ASC', [id]);

  res.json({
    id: asset.id,
    kind: asset.kind,
    poster_url: buildUrl(asset.poster_path),
    video_mp4_url: buildUrl(asset.video_mp4_path),
    video_webm_url: buildUrl(asset.video_webm_path),
    variants: variants.map(v => ({
      label: v.label,
      width: v.width,
      height: v.height,
      bitrate_k: v.bitrate_k,
      mp4_url: buildUrl(v.mp4_path),
      webm_url: buildUrl(v.webm_path)
    })),
    duration_ms: asset.duration_ms,
    width: asset.width,
    height: asset.height,
    fps: asset.fps,
    loopable: !!asset.loopable
  });
}));

// Range 流式输出
async function streamFile(req, res, filePath, mimeType) {
  const full = path.isAbsolute(filePath) ? filePath : path.join(BASE_STORAGE, filePath);
  if (!await fs.pathExists(full)) return res.status(404).end();

  const stat = await fs.stat(full);
  const fileSize = stat.size;
  const range = req.headers.range;
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', mimeType);

  if (!range) {
    res.setHeader('Content-Length', fileSize);
    fs.createReadStream(full).pipe(res);
    return;
  }

  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = (end - start) + 1;

  res.status(206);
  res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  res.setHeader('Content-Length', chunkSize);
  fs.createReadStream(full, { start, end }).pipe(res);
}

router.get('/:id/stream.mp4', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset || !asset.video_mp4_path) return res.status(404).json({ message: '资源不存在' });
  await streamFile(req, res, asset.video_mp4_path, 'video/mp4');
}));

router.get('/:id/stream.webm', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset || !asset.video_webm_path) return res.status(404).json({ message: '资源不存在' });
  await streamFile(req, res, asset.video_webm_path, 'video/webm');
}));

// 变体流式播放: /api/live-media/:id/stream/:label.mp4
router.get('/:id/stream/:label.mp4', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const label = req.params.label;
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset) return res.status(404).json({ message: '资源不存在' });
  const [rows] = await require('../config/database').pool.execute('SELECT mp4_path FROM live_media_variants WHERE asset_id=? AND label=?', [id, label]);
  if (!rows || rows.length === 0 || !rows[0].mp4_path) return res.status(404).json({ message: '资源不存在' });
  await streamFile(req, res, rows[0].mp4_path, 'video/mp4');
}));

// 原件下载（图片类：Android Motion Photo 原始JPEG、GIF/WebP 动图原图；iOS Live Photo 原图请使用 /original-image 与 /original-video）
router.get('/:id/original', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset) return res.status(404).json({ message: '资源不存在' });
  // motion_photo 与 animated 均存 original_image_path
  if (asset.original_image_path && (asset.kind === 'motion_photo' || asset.kind === 'animated')) {
    const full = path.isAbsolute(asset.original_image_path) ? asset.original_image_path : path.join(BASE_STORAGE, asset.original_image_path);
    if (!await fs.pathExists(full)) return res.status(404).json({ message: '原件不存在' });
    return res.download(full, path.basename(full));
  }
  // live_photo 需要分别下载图片与视频
  if (asset.kind === 'live_photo') {
    return res.status(400).json({ message: '该资源包含图像与视频，请分别下载', image: `/api/live-media/${id}/original-image`, video: `/api/live-media/${id}/original-video` });
  }
  return res.status(404).json({ message: '无可用原件' });
}));

// iOS Live Photo 原始 HEIC 下载或其他含 original_image_path 的资源
router.get('/:id/original-image', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset || !asset.original_image_path) return res.status(404).json({ message: '原图不存在' });
  const full = path.isAbsolute(asset.original_image_path) ? asset.original_image_path : path.join(BASE_STORAGE, asset.original_image_path);
  if (!await fs.pathExists(full)) return res.status(404).json({ message: '原图不存在' });
  return res.download(full, path.basename(full));
}));

// iOS Live Photo 原始 MOV 下载
router.get('/:id/original-video', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const asset = await liveMediaService.getAssetById(id, userId);
  if (!asset || !asset.original_video_path) return res.status(404).json({ message: '原始视频不存在' });
  const full = path.isAbsolute(asset.original_video_path) ? asset.original_video_path : path.join(BASE_STORAGE, asset.original_video_path);
  if (!await fs.pathExists(full)) return res.status(404).json({ message: '原始视频不存在' });
  return res.download(full, path.basename(full));
}));

// 任务状态查询
router.get('/jobs/:id', authenticateToken, asyncHandler(async (req, res) => {
  const job = await liveMediaService.getJob(req.params.id, req.user.id);
  if (!job) return res.status(404).json({ message: '任务不存在' });
  res.json(job);
}));

// 取消任务
router.delete('/jobs/:id', authenticateToken, asyncHandler(async (req, res) => {
  const ok = await liveMediaService.cancelJob(req.params.id, req.user.id);
  if (!ok) return res.status(404).json({ message: '任务不存在' });
  res.json({ success: true });
}));

// 删除实况资源
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const ok = await liveMediaService.deleteAssetById(id, userId);
  if (!ok) return res.status(404).json({ message: '资源不存在' });
  res.json({ success: true });
}));

module.exports = router;


