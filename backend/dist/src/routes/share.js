const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

// 解析物理文件路径，尽可能兼容历史与不同部署目录
function resolveFilePath(rawPath) {
  const baseUploadPath = BASE_STORAGE;
  let filePath;

  if (!rawPath) return null;

  if (path.isAbsolute(rawPath)) {
    filePath = rawPath;
  } else {
    let normalizedPath = String(rawPath).replace(/\\/g, '/');
    if (normalizedPath.startsWith('storage/')) {
      normalizedPath = normalizedPath.substring(8);
    }
    // 优先按存储根拼接
    filePath = path.resolve(baseUploadPath, normalizedPath);
  }

  return filePath;
}

async function ensureFileExistsOrTryAlternatives(initialPath, rawPath) {
  if (initialPath && await fs.pathExists(initialPath)) return initialPath;

  const baseUploadPath = BASE_STORAGE;
  const alternatives = [
    path.join('/www/wwwroot/tuku/backend', String(rawPath || '')),
    path.join('/www/wwwroot/tuku/backend/dist', String(rawPath || '')),
    path.join(baseUploadPath, String(rawPath || '')),
    path.resolve(String(rawPath || '')),
    String(rawPath || '')
  ];

  for (const alt of alternatives) {
    try {
      if (alt && await fs.pathExists(alt)) return alt;
    } catch (_) {}
  }
  return null;
}

async function ensureShareTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS file_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token VARCHAR(64) NOT NULL UNIQUE,
      file_id INT NOT NULL,
      owner_user_id INT NOT NULL,
      allow_preview TINYINT(1) DEFAULT 1,
      allow_download TINYINT(1) DEFAULT 1,
      expires_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getShareSettings() {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['sharing_enabled', 'share_disabled_at']
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });
    return {
      enabled: map.sharing_enabled !== 'false',
      disabledAt: map.share_disabled_at ? new Date(map.share_disabled_at) : null
    };
  } catch (e) {
    return { enabled: true, disabledAt: null };
  }
}

// 创建分享链接（需登录）
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const shareSettings = await getShareSettings();
  if (!shareSettings.enabled) {
    return res.status(403).json({ message: '分享功能已关闭' });
  }
  await ensureShareTable();
  const userId = req.user.id;
  const { file_id, allowPreview, allowDownload, expireInHours } = req.body || {};
  if (!file_id) return res.status(400).json({ message: '缺少 file_id' });

  // 校验文件归属
  const [files] = await pool.execute('SELECT id, file_path, original_name, mime_type, file_size, file_type, created_at FROM files WHERE id=? AND user_id=?', [file_id, userId]);
  if (!files || files.length === 0) return res.status(404).json({ message: '文件不存在' });

  const token = uuidv4().replace(/-/g, '').slice(0, 24);
  const expiresAt = (expireInHours && Number(expireInHours) > 0)
    ? new Date(Date.now() + Number(expireInHours) * 3600 * 1000)
    : null;

  await pool.execute(
    'INSERT INTO file_shares (token, file_id, owner_user_id, allow_preview, allow_download, expires_at) VALUES (?,?,?,?,?,?)',
    [token, file_id, userId, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null]
  );

  res.json({ success: true, token, expires_at: expiresAt ? expiresAt.toISOString() : null });
}));

async function getShareAndFile(token) {
  await ensureShareTable();
  const [rows] = await pool.execute('SELECT * FROM file_shares WHERE token=?', [token]);
  if (!rows || rows.length === 0) return null;
  const share = rows[0];
  // 全局分享关闭或禁用时间点校验
  const settings = await getShareSettings();
  if (!settings.enabled) return null;
  if (settings.disabledAt && share.created_at && new Date(share.created_at) <= settings.disabledAt) return null;
  if (share.expires_at && new Date(share.expires_at) < new Date()) return null;
  const [files] = await pool.execute('SELECT id, user_id, original_name, mime_type, file_size, file_type, file_path, thumbnail_path, created_at FROM files WHERE id=?', [share.file_id]);
  if (!files || files.length === 0) return null;
  return { share, file: files[0] };
}

// 公共：获取分享元数据
router.get('/:token', asyncHandler(async (req, res) => {
  const token = req.params.token;
  const record = await getShareAndFile(token);
  if (!record) return res.status(404).json({ message: '分享不存在或已过期' });
  const { share, file } = record;
  // 为防止关闭分享后仍可直接访问静态地址，这里不再返回直链
  const expiresAtIso = share.expires_at ? new Date(share.expires_at).toISOString() : null;
  const expiresIn = share.expires_at ? Math.max(0, Math.floor((new Date(share.expires_at).getTime() - Date.now())/1000)) : null;
  res.json({
    success: true,
    file: {
      id: file.id,
      original_name: file.original_name,
      file_size: file.file_size,
      mime_type: file.mime_type,
      file_type: file.file_type,
      created_at: file.created_at,
    },
    allow_preview: !!share.allow_preview,
    allow_download: !!share.allow_download,
    preview_url: share.allow_preview ? (file.file_type === 'image' ? `/api/share/${token}/preview` : null) : null,
    stream_url: share.allow_preview ? (file.file_type === 'video' ? `/api/share/${token}/stream` : null) : null,
    download_url: share.allow_download ? `/api/share/${token}/download` : null,
    expires_at: expiresAtIso,
    expires_in_seconds: expiresIn
  });
}));

// 公共：视频流播放（支持范围请求）
router.get('/:token/stream', asyncHandler(async (req, res) => {
  const token = req.params.token;
  const record = await getShareAndFile(token);
  if (!record) return res.status(404).json({ message: '分享不存在或已过期' });
  const { share, file } = record;
  if (!share.allow_preview) return res.status(403).json({ message: '不允许预览' });
  if (file.file_type !== 'video') return res.status(400).json({ message: '仅支持视频流' });

  const raw = file.file_path;
  const primary = resolveFilePath(raw);
  const full = await ensureFileExistsOrTryAlternatives(primary, raw);
  if (!full) return res.status(404).json({ message: '文件不存在' });

  const stat = await fs.stat(full);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = file.mime_type || 'video/mp4';

  if (range) {
    const parts = String(range).replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
      return res.status(416).set({ 'Content-Range': `bytes */${fileSize}` }).end();
    }
    const chunkSize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag, Content-Range',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable, no-transform'
    });
    fs.createReadStream(full, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable, no-transform'
    });
    fs.createReadStream(full).pipe(res);
  }
}));

// 公共：图片预览（受分享开关与过期保护）
router.get('/:token/preview', asyncHandler(async (req, res) => {
  const token = req.params.token;
  const record = await getShareAndFile(token);
  if (!record) return res.status(404).json({ message: '分享不存在或已过期' });
  const { share, file } = record;
  if (!share.allow_preview) return res.status(403).json({ message: '不允许预览' });
  if (file.file_type !== 'image') return res.status(400).json({ message: '仅支持图片预览' });
  const raw = file.file_path;
  const primary = resolveFilePath(raw);
  const full = await ensureFileExistsOrTryAlternatives(primary, raw);
  if (!full) return res.status(404).json({ message: '文件不存在' });
  const stat = await fs.stat(full);
  res.writeHead(200, {
    'Content-Type': file.mime_type || 'image/jpeg',
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Content-Disposition': `inline; filename="${path.basename(full)}"`,
    'Cache-Control': 'public, max-age=31536000, immutable, no-transform'
  });
  fs.createReadStream(full).pipe(res);
}));

// 公共：下载文件
router.get('/:token/download', asyncHandler(async (req, res) => {
  const token = req.params.token;
  const record = await getShareAndFile(token);
  if (!record) return res.status(404).json({ message: '分享不存在或已过期' });
  const { share, file } = record;
  if (!share.allow_download) return res.status(403).json({ message: '不允许下载' });
  const raw = file.file_path;
  const primary = resolveFilePath(raw);
  const full = await ensureFileExistsOrTryAlternatives(primary, raw);
  if (!full) return res.status(404).json({ message: '文件不存在' });
  return res.download(full, file.original_name || path.basename(full));
}));

module.exports = router;


