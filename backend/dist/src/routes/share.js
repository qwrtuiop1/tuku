const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const moderationService = require('../services/moderationService');

const router = express.Router();
const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

// 获取系统分享开关
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

// 简易本地启发式文本判定（兜底）
function likelyNonCompliant(name = '', mime = '') {
  const s = `${name} ${mime}`.toLowerCase();
  const banned = ['违法','违规','暴恐','涉黄','赌博','诈骗','侵权','仇恨','辱骂','极端','恐怖','porn','sexual','nudity','xxx','rape','terror','gore','kill','abuse','weapon','drugs'];
  return banned.some(k => s.includes(k));
}

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
  // 审核相关字段（幂等新增）
  try { await pool.execute("ALTER TABLE file_shares ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'"); } catch (_) {}
  try { await pool.execute('ALTER TABLE file_shares ADD COLUMN review_progress INT NOT NULL DEFAULT 0'); } catch (_) {}
  try { await pool.execute('ALTER TABLE file_shares ADD COLUMN review_reason VARCHAR(255) NULL'); } catch (_) {}
  try { await pool.execute('ALTER TABLE file_shares ADD COLUMN review_debug MEDIUMTEXT NULL'); } catch (_) {}
  try { await pool.execute("ALTER TABLE file_shares ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (_) {}
}

async function ensureReviewTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS file_share_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_id INT NOT NULL,
      owner_user_id INT NOT NULL,
      allow_preview TINYINT(1) DEFAULT 1,
      allow_download TINYINT(1) DEFAULT 1,
      expires_at DATETIME NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
      review_progress INT NOT NULL DEFAULT 0,
      review_reason VARCHAR(255) NULL,
      share_token VARCHAR(64) NULL,
      review_debug MEDIUMTEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  // 兼容老表：补充缺失列
  try { await pool.execute('ALTER TABLE file_share_reviews ADD COLUMN review_debug MEDIUMTEXT NULL'); } catch (_) {}
}

async function appendJsonDebug(table, keyColumn, keyValue, column, entry) {
  try {
    const [rows] = await pool.execute(`SELECT ${column} FROM ${table} WHERE ${keyColumn}=?`, [keyValue]);
    const cur = rows && rows[0] && rows[0][column] ? rows[0][column] : null;
    let arr = [];
    try { if (cur) arr = JSON.parse(cur); } catch (_) {}
    arr.push(Object.assign({ ts: new Date().toISOString() }, entry));
    await pool.execute(`UPDATE ${table} SET ${column}=? WHERE ${keyColumn}=?`, [JSON.stringify(arr).slice(0, 4 * 1024 * 1024), keyValue]);
  } catch (_) {}
}

async function simulateReview(token, file) {
  const step = async (p) => pool.execute('UPDATE file_shares SET review_progress=?, updated_at=CURRENT_TIMESTAMP WHERE token=?', [p, token])
  try {
    console.log('[review] token=%s step=init file_id=%s type=%s', token, file.id, file.file_type)
    await appendJsonDebug('file_shares', 'token', token, 'review_debug', { step: 'init', file_id: file.id, type: file.file_type })
    await step(15); await new Promise(r => setTimeout(r, 200));
    // 可选 OCR 文本
    let ocrText = null;
    try { ocrText = await moderationService.fetchOcrText(file); console.log('[review] token=%s ocr=ok', token); await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'ocr', ok:true }) } catch (e) { console.log('[review] token=%s ocr=skip %s', token, e?.message||''); await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'ocr', ok:false, error: String(e?.message||'') }) }
    await step(45); await new Promise(r => setTimeout(r, 200));
    let decision = await moderationService.reviewFile(file, [ocrText].filter(Boolean)).catch((e) => { console.log('[review] token=%s ai-fail %s', token, e?.message||''); appendJsonDebug('file_shares','token',token,'review_debug',{ step:'ai', ok:false, error:String(e?.message||'') }); return null })
    if (decision && decision.source === 'ai') {
      await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'ai', ok:true, score: decision.score ?? null })
    }
    if (!decision) {
      const localApproved = !likelyNonCompliant(file.original_name || '', file.mime_type || '')
      decision = { approved: localApproved, reason: '本地启发式规则' }
      console.log('[review] token=%s local=%s', token, localApproved)
      await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'local', approved: localApproved })
    }
    await step(85); await new Promise(r => setTimeout(r, 150));
    if (!decision.approved) {
      await pool.execute("UPDATE file_shares SET status='rejected', review_progress=100, review_reason=? WHERE token=?", [decision.reason || '内容疑似不合规，请修改后重试', token])
      console.log('[review] token=%s result=rejected reason=%s', token, decision.reason||'')
      await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'final', status:'rejected', reason: decision.reason || null })
    } else {
      await pool.execute("UPDATE file_shares SET status='approved', review_progress=100, review_reason=NULL WHERE token=?", [token])
      console.log('[review] token=%s result=approved', token)
      await appendJsonDebug('file_shares','token',token,'review_debug',{ step:'final', status:'approved' })
    }
  } catch (_) {}
}

async function simulateReviewForReviewRow(reviewId, file, allowPreview, allowDownload, expiresAt) {
  const step = async (p) => pool.execute('UPDATE file_share_reviews SET review_progress=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [p, reviewId])
  try {
    console.log('[review-row] id=%s step=init file_id=%s type=%s', reviewId, file.id, file.file_type)
    await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'init', file_id:file.id, type:file.file_type })
    await step(15); await new Promise(r => setTimeout(r, 200));
    let ocrText = null; try { ocrText = await require('../services/moderationService').fetchOcrText(file); console.log('[review-row] id=%s ocr=ok', reviewId); await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'ocr', ok:true }) } catch (e) { console.log('[review-row] id=%s ocr=skip %s', reviewId, e?.message||''); await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'ocr', ok:false, error:String(e?.message||'') }) }
    await step(45); await new Promise(r => setTimeout(r, 200));
    let decision = await require('../services/moderationService').reviewFile(file, [ocrText].filter(Boolean)).catch((e) => { console.log('[review-row] id=%s ai-fail %s', reviewId, e?.message||''); appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'ai', ok:false, error:String(e?.message||'') }); return null })
    if (decision && decision.source === 'ai') {
      await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'ai', ok:true, score: decision.score ?? null })
    }
    if (!decision) { const localApproved = !likelyNonCompliant(file.original_name || '', file.mime_type || ''); decision = { approved: localApproved, reason: '本地启发式规则' }; console.log('[review-row] id=%s local=%s', reviewId, localApproved); await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'local', approved: localApproved }) }
    await step(85); await new Promise(r => setTimeout(r, 150));
    if (!decision.approved) {
      await pool.execute("UPDATE file_share_reviews SET status='rejected', review_progress=100, review_reason=? WHERE id=?", [decision.reason || '内容疑似不合规，请修改后重试', reviewId])
      await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'final', status:'rejected', reason: decision.reason || null })
      console.log('[review-row] id=%s result=rejected reason=%s', reviewId, decision.reason||'')
    } else {
      // 审核通过：创建正式分享token
      const token = uuidv4().replace(/-/g, '').slice(0, 24);
      await ensureShareTable();
      await pool.execute(
        'INSERT INTO file_shares (token, file_id, owner_user_id, allow_preview, allow_download, expires_at, status, review_progress, review_reason) VALUES (?,?,?,?,?,?,?,?,?)',
        [token, file.id, file.user_id, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null, 'approved', 100, null]
      );
      await pool.execute("UPDATE file_share_reviews SET status='approved', review_progress=100, review_reason=NULL, share_token=? WHERE id=?", [token, reviewId])
      await appendJsonDebug('file_share_reviews','id',reviewId,'review_debug',{ step:'final', status:'approved', token })
      console.log('[review-row] id=%s result=approved token=%s', reviewId, token)
    }
  } catch (_) {}
}

async function ensureLiveShareTables() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS live_media_share_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      owner_user_id INT NOT NULL,
      allow_preview TINYINT(1) DEFAULT 1,
      allow_download TINYINT(1) DEFAULT 1,
      expires_at DATETIME NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
      review_progress INT NOT NULL DEFAULT 0,
      review_reason VARCHAR(255) NULL,
      share_token VARCHAR(64) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS live_media_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token VARCHAR(64) NOT NULL UNIQUE,
      asset_id INT NOT NULL,
      owner_user_id INT NOT NULL,
      allow_preview TINYINT(1) DEFAULT 1,
      allow_download TINYINT(1) DEFAULT 1,
      expires_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function buildUploadsUrl(rel) {
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  return rel ? `${backendDomain}/uploads/${String(rel).replace(/^[\\/]+/, '')}` : null;
}

async function simulateLiveReviewRow(reviewId, asset, allowPreview, allowDownload, expiresAt) {
  const step = async (p) => pool.execute('UPDATE live_media_share_reviews SET review_progress=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [p, reviewId])
  try {
    await step(15); await new Promise(r => setTimeout(r, 200));
    // 构造伪文件行，优先使用 poster 进行审核
    const pseudo = {
      id: asset.id,
      original_name: asset.kind || 'live',
      mime_type: 'image/jpeg',
      file_type: 'image',
      file_path: asset.poster_path,
      thumbnail_path: asset.poster_path
    };
    await step(45); await new Promise(r => setTimeout(r, 200));
    let decision = await require('../services/moderationService').reviewFile(pseudo, []).catch(() => null)
    if (!decision) { decision = { approved: true } }
    await step(85); await new Promise(r => setTimeout(r, 150));
    if (!decision.approved) {
      await pool.execute("UPDATE live_media_share_reviews SET status='rejected', review_progress=100, review_reason=? WHERE id=?", [decision.reason || '内容疑似不合规，请修改后重试', reviewId])
    } else {
      // 通过后创建 live token
      const token = uuidv4().replace(/-/g, '').slice(0, 24);
      await pool.execute(
        'INSERT INTO live_media_shares (token, asset_id, owner_user_id, allow_preview, allow_download, expires_at) VALUES (?,?,?,?,?,?)',
        [token, asset.id, asset.owner_user_id, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null]
      );
      await pool.execute("UPDATE live_media_share_reviews SET status='approved', review_progress=100, review_reason=NULL, share_token=? WHERE id=?", [token, reviewId])
    }
  } catch (_) {}
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
  const file = files[0];

  const token = uuidv4().replace(/-/g, '').slice(0, 24);
  const expiresAt = (expireInHours && Number(expireInHours) > 0)
    ? new Date(Date.now() + Number(expireInHours) * 3600 * 1000)
    : null;

  await pool.execute(
    'INSERT INTO file_shares (token, file_id, owner_user_id, allow_preview, allow_download, expires_at, status, review_progress, review_reason) VALUES (?,?,?,?,?,?,?,?,?)',
    [token, file_id, userId, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null, 'pending_review', 5, null]
  );

  // 异步启动审核模拟
  setImmediate(() => { simulateReview(token, file) });

  res.json({ success: true, token, expires_at: expiresAt ? expiresAt.toISOString() : null, status: 'pending_review', review_progress: 5 });
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
  // 未审核通过前不公开
  if (!share.status || share.status !== 'approved') return null;
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

// 分享审核状态
router.get('/:token/status', authenticateToken, asyncHandler(async (req, res) => {
  await ensureShareTable();
  const token = req.params.token;
  const [rows] = await pool.execute('SELECT token, owner_user_id, status, review_progress, review_reason, expires_at, created_at FROM file_shares WHERE token=?', [token]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: '不存在' });
  const r = rows[0];
  // 仅允许本人查询
  if (String(r.owner_user_id) !== String(req.user.id)) return res.status(403).json({ message: '无权限' });
  res.json({
    token: r.token,
    status: r.status || 'approved',
    review_progress: r.review_progress || 0,
    review_reason: r.review_reason || null,
    expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : null
  })
}))

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

// 发起审核（不立刻返回公开链接）
router.post('/review', authenticateToken, asyncHandler(async (req, res) => {
  const shareSettings = await getShareSettings();
  if (!shareSettings.enabled) {
    return res.status(403).json({ message: '分享功能已关闭' });
  }
  await ensureReviewTable();
  const userId = req.user.id;
  const { file_id, allowPreview, allowDownload, expireInHours } = req.body || {};
  if (!file_id) return res.status(400).json({ message: '缺少 file_id' });

  const [files] = await pool.execute('SELECT id, user_id, file_path, original_name, mime_type, file_size, file_type, created_at, thumbnail_path FROM files WHERE id=? AND user_id=?', [file_id, userId]);
  if (!files || files.length === 0) return res.status(404).json({ message: '文件不存在' });
  const file = files[0];
  const expiresAt = (expireInHours && Number(expireInHours) > 0)
    ? new Date(Date.now() + Number(expireInHours) * 3600 * 1000)
    : null;

  const [result] = await pool.execute(
    'INSERT INTO file_share_reviews (file_id, owner_user_id, allow_preview, allow_download, expires_at, status, review_progress) VALUES (?,?,?,?,?,?,?)',
    [file_id, userId, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null, 'pending_review', 5]
  );
  const reviewId = result.insertId;
  setImmediate(() => simulateReviewForReviewRow(reviewId, file, !!allowPreview, !!allowDownload, expiresAt));
  res.json({ success: true, review_id: reviewId });
}));

// 审核状态轮询（返回share_token仅在通过后）
router.get('/review/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  await ensureReviewTable();
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const [rows] = await pool.execute('SELECT id, file_id, owner_user_id, status, review_progress, review_reason, share_token, expires_at, created_at, review_debug FROM file_share_reviews WHERE id=?', [id]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: '不存在' });
  const r = rows[0];
  if (String(r.owner_user_id) !== String(userId)) return res.status(403).json({ message: '无权限' });
  res.json({
    review_id: r.id,
    status: r.status,
    review_progress: r.review_progress,
    review_reason: r.review_reason,
    share_token: r.share_token || null,
    expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
    debug: (function(d){ try { return d ? JSON.parse(d) : [] } catch(_) { return [] } })(r.review_debug)
  });
}));

// 发起实况审核
router.post('/review-live', authenticateToken, asyncHandler(async (req, res) => {
  const shareSettings = await getShareSettings();
  if (!shareSettings.enabled) {
    return res.status(403).json({ message: '分享功能已关闭' });
  }
  await ensureLiveShareTables();
  const userId = req.user.id;
  const { asset_id, allowPreview, allowDownload, expireInHours } = req.body || {};
  if (!asset_id) return res.status(400).json({ message: '缺少 asset_id' });
  const [rows] = await pool.execute('SELECT * FROM live_media_assets WHERE id=? AND owner_user_id=?', [asset_id, userId]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: '实况资源不存在' });
  const asset = rows[0];
  const expiresAt = (expireInHours && Number(expireInHours) > 0)
    ? new Date(Date.now() + Number(expireInHours) * 3600 * 1000)
    : null;
  const [result] = await pool.execute(
    'INSERT INTO live_media_share_reviews (asset_id, owner_user_id, allow_preview, allow_download, expires_at, status, review_progress) VALUES (?,?,?,?,?,?,?)',
    [asset_id, userId, allowPreview ? 1 : 0, allowDownload ? 1 : 0, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null, 'pending_review', 5]
  );
  const reviewId = result.insertId;
  setImmediate(() => simulateLiveReviewRow(reviewId, asset, !!allowPreview, !!allowDownload, expiresAt));
  res.json({ success: true, review_id: reviewId });
}));

// 实况审核状态
router.get('/review-live/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  await ensureLiveShareTables();
  const userId = req.user.id;
  const id = parseInt(req.params.id, 10);
  const [rows] = await pool.execute('SELECT * FROM live_media_share_reviews WHERE id=?', [id]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: '不存在' });
  const r = rows[0];
  if (String(r.owner_user_id) !== String(userId)) return res.status(403).json({ message: '无权限' });
  res.json({
    review_id: r.id,
    status: r.status,
    review_progress: r.review_progress,
    review_reason: r.review_reason,
    share_token: r.share_token || null,
    expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : null
  })
}));

// 公开：根据 token 获取实况信息
router.get('/live/:token', asyncHandler(async (req, res) => {
  await ensureLiveShareTables();
  const token = req.params.token;
  const [rows] = await pool.execute('SELECT * FROM live_media_shares WHERE token=?', [token]);
  if (!rows || rows.length === 0) return res.status(404).json({ message: '分享不存在或已过期' });
  const share = rows[0];
  if (share.expires_at && new Date(share.expires_at) < new Date()) return res.status(404).json({ message: '分享不存在或已过期' });
  const [assets] = await pool.execute('SELECT * FROM live_media_assets WHERE id=?', [share.asset_id]);
  if (!assets || assets.length === 0) return res.status(404).json({ message: '资源不存在' });
  const a = assets[0];
  res.json({
    success: true,
    allow_preview: !!share.allow_preview,
    allow_download: !!share.allow_download,
    poster_url: buildUploadsUrl(a.poster_path),
    video_mp4_url: buildUploadsUrl(a.video_mp4_path),
    video_webm_url: buildUploadsUrl(a.video_webm_path),
    kind: a.kind,
    duration_ms: a.duration_ms,
    width: a.width,
    height: a.height,
    fps: a.fps,
  });
}));

module.exports = router;


