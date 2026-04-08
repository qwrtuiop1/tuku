const express = require('express');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ciService = require('../services/ciService');
const moderationService = require('../services/moderationService');

const router = express.Router();

// 获取维护模式状态（公共接口，无需认证）
router.get('/maintenance-status', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['maintenance_mode']
    );
    
    const maintenanceMode = result.length > 0 ? result[0].setting_value === 'true' : false;
    
    res.json({
      maintenance_mode: maintenanceMode,
      message: maintenanceMode ? '系统正在维护中' : '系统正常运行'
    });
  } catch (error) {
    console.error('获取维护模式状态失败:', error);
    res.status(500).json({ 
      maintenance_mode: false,
      message: '无法获取维护状态' 
    });
  }
}));

// 获取系统基本信息（公共接口，无需认证）
router.get('/info', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?)',
      ['system_name', 'system_description', 'system_version', 'max_file_size', 'max_upload_files', 'config_version', 'allowed_image_types', 'allowed_video_types']
    );
    
    const settings = {};
    result.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({
      system_name: settings.system_name || '图库系统',
      system_description: settings.system_description || '一个功能强大的图库管理系统',
      system_version: settings.system_version || '1.0.0',
      max_file_size: Math.round(parseInt(settings.max_file_size) / (1024 * 1024)) || 100, // 将字节转换为MB
      max_upload_files: parseInt(settings.max_upload_files) || 10, // 默认10个文件
      allowed_image_types: (settings.allowed_image_types || 'jpg,jpeg,png,gif,webp,svg').split(',').map(s => s.trim()).filter(Boolean),
      allowed_video_types: (settings.allowed_video_types || 'mp4,webm,mov,avi,mkv,m4v,flv,wmv,mpeg,mpg,3gp,ts,m2ts,ogv').split(',').map(s => s.trim()).filter(Boolean),
      config_version: settings.config_version || null
    });
  } catch (error) {
    console.error('获取系统信息失败:', error);
    res.status(500).json({ 
      system_name: '图库系统',
      system_description: '一个功能强大的图库管理系统',
      system_version: '1.0.0',
      max_file_size: 100, // 默认100MB
      max_upload_files: 10, // 默认10个文件
      config_version: null
    });
  }
}));

// 获取分享功能状态（公共接口）
router.get('/share-status', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['sharing_enabled', 'share_disabled_at']
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });
    const sharingEnabled = map.sharing_enabled !== 'false'; // 默认开启
    const shareDisabledAt = map.share_disabled_at || null;
    res.json({ sharing_enabled: sharingEnabled, share_disabled_at: shareDisabledAt });
  } catch (error) {
    res.json({ sharing_enabled: true, share_disabled_at: null });
  }
}));

module.exports = router;

// 审核配置（数据库优先，ENV 兜底）
router.get('/moderation', asyncHandler(async (req, res) => {
  const keys = [
    'moderation_enable',
    'moderation_provider',
    'moderation_api_url',
    'moderation_api_key',
    'moderation_model',
    'moderation_strictness',
    'moderation_max_image_bytes',
    'moderation_image_heuristic',
    'moderation_ocr_api_url',
    'moderation_ocr_api_key',
    'moderation_http_timeout_ms'
  ];
  const placeholders = keys.map(() => '?').join(',');
  try {
    const [rows] = await pool.execute(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
      keys
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });
    res.json({
      enable: (map.moderation_enable || 'false') === 'true',
      provider: map.moderation_provider || '',
      apiUrl: map.moderation_api_url || '',
      apiKey: map.moderation_api_key || '',
      model: map.moderation_model || '',
      strictness: map.moderation_strictness ? Number(map.moderation_strictness) : 70,
      maxImageBytes: map.moderation_max_image_bytes ? Number(map.moderation_max_image_bytes) : (20 * 1024 * 1024),
      imageHeuristic: (map.moderation_image_heuristic || 'true') === 'true',
      ocrApiUrl: map.moderation_ocr_api_url || '',
      ocrApiKey: map.moderation_ocr_api_key || '',
      httpTimeoutMs: map.moderation_http_timeout_ms ? Number(map.moderation_http_timeout_ms) : 20000
    });
  } catch (e) {
    res.json({
      enable: false,
      provider: '',
      apiUrl: '',
      apiKey: '',
      model: '',
      strictness: 70,
      maxImageBytes: 20 * 1024 * 1024,
      imageHeuristic: true,
      ocrApiUrl: '',
      ocrApiKey: '',
      httpTimeoutMs: 20000
    });
  }
}));

router.put('/moderation', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const body = req.body || {};
  const entries = [
    ['moderation_enable', body.enable ? 'true' : 'false'],
    ['moderation_provider', String(body.provider || '').trim()],
    ['moderation_api_url', String(body.apiUrl || '').trim()],
    ['moderation_api_key', String(body.apiKey || '').trim()],
    ['moderation_model', String(body.model || '').trim()],
    ['moderation_strictness', String(Math.min(100, Math.max(0, Number(body.strictness || 70))))],
    ['moderation_max_image_bytes', String(Math.min(200 * 1024 * 1024, Math.max(10 * 1024, Number(body.maxImageBytes || (20 * 1024 * 1024)))))],
    ['moderation_image_heuristic', body.imageHeuristic === false ? 'false' : 'true'],
    ['moderation_ocr_api_url', String(body.ocrApiUrl || '').trim()],
    ['moderation_ocr_api_key', String(body.ocrApiKey || '').trim()],
    ['moderation_http_timeout_ms', String(Math.min(120000, Math.max(1000, Number(body.httpTimeoutMs || 20000))))],
  ];
  // 批量 upsert
  for (const [k, v] of entries) {
    try {
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
        [k, v]
      );
    } catch (e) {}
  }
  res.json({ success: true });
}));

// ============================================================
// 腾讯云 CI 配置（数据库优先，ENV 兜底）
// ============================================================

const CI_CONFIG_KEYS = [
  'ci_enable',
  'ci_region',
  'ci_secret_id',
  'ci_secret_key',
  'ci_bucket',
  'ci_appid',
  'ci_cos_host',
  'ci_moderation_enable',
  'ci_moderation_async',
  'ci_thumbnail_enable',
  'ci_thumbnail_style',
  'ci_ocr_enable'
];

// 获取 CI 配置
router.get('/ci-config', asyncHandler(async (req, res) => {
  const placeholders = CI_CONFIG_KEYS.map(() => '?').join(',');
  try {
    const [rows] = await pool.execute(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
      CI_CONFIG_KEYS
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });

    res.json({
      enable: (map.ci_enable || process.env.CI_ENABLE || 'false') === 'true',
      region: map.ci_region || process.env.CI_REGION || 'ap-guangzhou',
      secretId: map.ci_secret_id || process.env.CI_SECRET_ID || '',
      secretKey: map.ci_secret_key || process.env.CI_SECRET_KEY ? '******' : '',
      secretKeyRaw: map.ci_secret_key || process.env.CI_SECRET_KEY || '',
      bucket: map.ci_bucket || process.env.CI_BUCKET || '',
      appId: map.ci_appid || process.env.CI_APPID || '',
      cosHost: map.ci_cos_host || process.env.CI_COS_HOST || '',
      moderationEnable: (map.ci_moderation_enable || process.env.CI_MODERATION_ENABLE || 'true') === 'true',
      moderationAsync: (map.ci_moderation_async || process.env.CI_MODERATION_ASYNC || 'false') === 'true',
      thumbnailEnable: (map.ci_thumbnail_enable || process.env.CI_THUMBNAIL_ENABLE || 'true') === 'true',
      thumbnailStyle: map.ci_thumbnail_style || process.env.CI_THUMBNAIL_STYLE || 'imageMogr2/thumbnail/300x300/gravity/center/interlace/1/quality/80',
      ocrEnable: (map.ci_ocr_enable || process.env.CI_OCR_ENABLE || 'true') === 'true'
    });
  } catch (e) {
    res.json({
      enable: false,
      region: 'ap-guangzhou',
      secretId: '',
      secretKey: '',
      secretKeyRaw: '',
      bucket: '',
      appId: '',
      cosHost: '',
      moderationEnable: true,
      moderationAsync: false,
      thumbnailEnable: true,
      thumbnailStyle: 'imageMogr2/thumbnail/300x300/gravity/center/interlace/1/quality/80',
      ocrEnable: true
    });
  }
}));

// 更新 CI 配置
router.put('/ci-config', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const body = req.body || {};

  // 特殊处理 secretKey：前端只传掩码，后端需要合并新旧值
  let finalSecretKey = body.secretKeyRaw;
  if (!finalSecretKey && body.secretKey === '******') {
    // 前端未修改密码，保留原值
    try {
      const [rows] = await pool.execute(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['ci_secret_key']
      );
      if (rows.length > 0) {
        finalSecretKey = rows[0].setting_value;
      } else {
        finalSecretKey = process.env.CI_SECRET_KEY || '';
      }
    } catch (_) {
      finalSecretKey = process.env.CI_SECRET_KEY || '';
    }
  }

  const entries = [
    ['ci_enable', body.enable ? 'true' : 'false'],
    ['ci_region', String(body.region || 'ap-guangzhou').trim()],
    ['ci_secret_id', String(body.secretId || '').trim()],
    ['ci_secret_key', String(finalSecretKey || '').trim()],
    ['ci_bucket', String(body.bucket || '').trim()],
    ['ci_appid', String(body.appId || '').trim()],
    ['ci_cos_host', String(body.cosHost || '').trim()],
    ['ci_moderation_enable', body.moderationEnable === false ? 'false' : 'true'],
    ['ci_moderation_async', body.moderationAsync ? 'true' : 'false'],
    ['ci_thumbnail_enable', body.thumbnailEnable === false ? 'false' : 'true'],
    ['ci_thumbnail_style', String(body.thumbnailStyle || 'imageMogr2/thumbnail/300x300/gravity/center/interlace/1/quality/80').trim()],
    ['ci_ocr_enable', body.ocrEnable === false ? 'false' : 'true']
  ];

  // 批量 upsert
  for (const [k, v] of entries) {
    try {
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
        [k, v]
      );
    } catch (e) {
      console.error(`[CI Config] Failed to update ${k}:`, e.message);
    }
  }

  // 清除配置缓存
  try {
    ciService._clearCache();
    moderationService._clearCache();
  } catch (_) {}

  res.json({ success: true, message: 'CI 配置已更新' });
}));
