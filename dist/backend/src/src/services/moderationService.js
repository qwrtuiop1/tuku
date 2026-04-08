const fs = require('fs-extra');
const path = require('path');
const { URL } = require('url');
const http = require('http');
const https = require('https');
const sharp = require('sharp');
const { pool } = require('../config/database');
const ciService = require('./ciService');

const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

// 动态审核配置（数据库优先，ENV 兜底），5 秒缓存
let moderationCfgCacheTs = 0;
let moderationCfgCache = null;
const MOD_KEYS = [
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
  'moderation_http_timeout',
  'moderation_http_timeout_ms',
  // 腾讯云 CI 配置
  'ci_enable',
  'ci_region',
  'ci_secret_id',
  'ci_secret_key',
  'ci_bucket',
  'ci_appid',
  'ci_cos_host',
  'ci_moderation_enable',
  'ci_moderation_async'
];

function envModerationDefaults() {
  return {
    enable: (process.env.MODERATION_ENABLE || 'false').toLowerCase() === 'true',
    provider: (process.env.MODERATION_PROVIDER || '').toLowerCase(),
    apiUrl: process.env.MODERATION_API_URL || '',
    apiKey: process.env.MODERATION_API_KEY || '',
    model: process.env.MODERATION_MODEL || '',
    strictness: Math.min(100, Math.max(0, parseInt(process.env.MODERATION_STRICTNESS || '70', 10))),
    // 提升最大图片大小上限至 20MB
    maxImageBytes: Math.min(20 * 1024 * 1024, parseInt(process.env.MODERATION_MAX_IMAGE_BYTES || String(512 * 1024), 10)),
    imageHeuristic: (process.env.MODERATION_IMAGE_HEURISTIC || 'true').toLowerCase() === 'true',
    ocrApiUrl: process.env.MODERATION_OCR_API_URL || '',
    ocrApiKey: process.env.MODERATION_OCR_API_KEY || '',
    httpTimeout: parseInt(process.env.MODERATION_HTTP_TIMEOUT || process.env.MODERATION_HTTP_TIMEOUT_MS || '8000', 10),
    // 腾讯云 CI 配置
    ci_enable: (process.env.CI_ENABLE || 'false').toLowerCase() === 'true',
    ci_region: process.env.CI_REGION || 'ap-guangzhou',
    ci_secret_id: process.env.CI_SECRET_ID || '',
    ci_secret_key: process.env.CI_SECRET_KEY || '',
    ci_bucket: process.env.CI_BUCKET || '',
    ci_appid: process.env.CI_APPID || '',
    ci_cos_host: process.env.CI_COS_HOST || '',
    ci_moderation_enable: (process.env.CI_MODERATION_ENABLE || 'true').toLowerCase() === 'true',
    ci_moderation_async: (process.env.CI_MODERATION_ASYNC || 'false').toLowerCase() === 'true'
  };
}

async function loadModerationConfig() {
  const now = Date.now();
  if (moderationCfgCache && (now - moderationCfgCacheTs) < 5000) return moderationCfgCache;
  let cfg = envModerationDefaults();
  try {
    const placeholders = MOD_KEYS.map(() => '?').join(',');
    const [rows] = await pool.execute(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
      MOD_KEYS
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });
    cfg = {
      enable: map.moderation_enable ? String(map.moderation_enable).toLowerCase() === 'true' : cfg.enable,
      provider: map.moderation_provider ? String(map.moderation_provider).toLowerCase() : cfg.provider,
      apiUrl: map.moderation_api_url || cfg.apiUrl,
      apiKey: map.moderation_api_key || cfg.apiKey,
      model: map.moderation_model || cfg.model,
      strictness: map.moderation_strictness ? Math.min(100, Math.max(0, parseInt(map.moderation_strictness, 10))) : cfg.strictness,
      // 与 ENV 一致采用 20MB 上限
      maxImageBytes: map.moderation_max_image_bytes ? Math.min(20 * 1024 * 1024, parseInt(map.moderation_max_image_bytes, 10)) : cfg.maxImageBytes,
      imageHeuristic: map.moderation_image_heuristic ? String(map.moderation_image_heuristic).toLowerCase() === 'true' : cfg.imageHeuristic,
      ocrApiUrl: map.moderation_ocr_api_url || cfg.ocrApiUrl,
      ocrApiKey: map.moderation_ocr_api_key || cfg.ocrApiKey,
      httpTimeout: map.moderation_http_timeout
        ? parseInt(map.moderation_http_timeout, 10)
        : (map.moderation_http_timeout_ms ? parseInt(map.moderation_http_timeout_ms, 10) : cfg.httpTimeout),
      // 腾讯云 CI 配置
      ci_enable: map.ci_enable ? String(map.ci_enable).toLowerCase() === 'true' : cfg.ci_enable,
      ci_region: map.ci_region || cfg.ci_region,
      ci_secret_id: map.ci_secret_id || cfg.ci_secret_id,
      ci_secret_key: map.ci_secret_key || cfg.ci_secret_key,
      ci_bucket: map.ci_bucket || cfg.ci_bucket,
      ci_appid: map.ci_appid || cfg.ci_appid,
      ci_cos_host: map.ci_cos_host || cfg.ci_cos_host,
      ci_moderation_enable: map.ci_moderation_enable !== undefined ? String(map.ci_moderation_enable).toLowerCase() === 'true' : cfg.ci_moderation_enable,
      ci_moderation_async: map.ci_moderation_async !== undefined ? String(map.ci_moderation_async).toLowerCase() === 'true' : cfg.ci_moderation_async
    };
  } catch (_) {}
  moderationCfgCache = cfg;
  moderationCfgCacheTs = now;
  return cfg;
}

function toAbsolute(p) {
  if (!p) return null;
  if (path.isAbsolute(p)) return p;
  const normalized = String(p).replace(/\\/g, '/').replace(/^storage\//, '');
  return path.resolve(BASE_STORAGE, normalized);
}

function isLikelyViolationFromText(name = '', mime = '') {
  const s = `${name} ${mime}`.toLowerCase();
  const bannedWords = [
    '暴恐','涉黄','赌博','诈骗','违禁','违法','违规','侵权','辱骂','仇恨','恐怖','极端',
    'porn','sexual','nudity','xxx','rape','terror','gore','kill','abuse','weapon','drugs'
  ];
  return bannedWords.some(k => s.includes(k));
}

async function readThumbnailBase64(fileRow) {
  try {
    const candidate = fileRow.thumbnail_path || fileRow.file_path;
    const abs = toAbsolute(candidate);
    if (!abs || !(await fs.pathExists(abs))) return null;
    const cfg = await loadModerationConfig();
    const stat = await fs.stat(abs);
    if (stat.size > cfg.maxImageBytes) return null;
    const buf = await fs.readFile(abs);
    return `data:${fileRow.mime_type || 'application/octet-stream'};base64,${buf.toString('base64')}`;
  } catch (_) {
    return null;
  }
}

async function fetchOcrText(fileRow) {
  try {
    const cfg = await loadModerationConfig();
    if (!cfg.ocrApiUrl) return null;
    const imageBase64 = await readThumbnailBase64(fileRow);
    if (!imageBase64) return null;
    const headers = cfg.ocrApiKey ? { Authorization: `Bearer ${cfg.ocrApiKey}` } : {};
    const { status, body } = await postJson(cfg.ocrApiUrl, headers, {
      type: 'ocr', image_base64: imageBase64, lang: 'zh-CN'
    }, cfg.httpTimeout);
    if (status >= 200 && status < 300 && body && typeof body.text === 'string') {
      const t = String(body.text || '').trim();
      return t ? t : null;
    }
  } catch (_) {}
  return null;
}

// 简易皮肤像素占比启发式（YCbCr范围法），高占比可能提示不当裸露
async function quickImageHeuristic(fileRow) {
  try {
    const mime = String(fileRow.mime_type || '').toLowerCase();
    if (!/image\/(jpeg|jpg|png|webp|gif)/.test(mime)) return null;
    const candidate = fileRow.thumbnail_path || fileRow.file_path;
    const abs = toAbsolute(candidate);
    if (!abs || !(await fs.pathExists(abs))) return null;
    const { data, info } = await sharp(abs)
      .resize(224, 224, { fit: 'inside', withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixels = data;
    let skin = 0, total = info.width * info.height;
    for (let i = 0; i < pixels.length; i += 3) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const y  =  0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      if (y > 50 && y < 240 && cb > 77 && cb < 127 && cr > 133 && cr < 173) {
        skin++;
      }
    }
    const ratio = (skin / Math.max(1, total)) * 100; // 百分比
    const base = 32; // 基础阈值（%）
    const cfg = await loadModerationConfig();
    const adj = Math.max(10, base - (cfg.strictness - 50) * 0.3); // 严格度提高则阈值下降
    const flag = ratio >= adj;
    return { score: Math.min(100, Math.round(ratio)), flag };
  } catch (_) {
    return null;
  }
}

function postJson(urlString, headers, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlString);
      const isHttps = u.protocol === 'https:';
      const t = parseInt(String(timeoutMs || process.env.MODERATION_HTTP_TIMEOUT || process.env.MODERATION_HTTP_TIMEOUT_MS || 8000), 10);
      const options = {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
        timeout: t
      };
      const req = (isHttps ? https : http).request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode || 0, body: json });
          } catch (e) {
            resolve({ status: res.statusCode || 0, body: {} });
          }
        });
      });
      req.setTimeout(t, () => {
        try { req.destroy(new Error('timeout')); } catch (_) {}
      });
      req.on('error', reject);
      req.write(JSON.stringify(body || {}));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function callTencentCiModeration(fileRow, extraTextList) {
  const cfg = await loadModerationConfig();
  // 如果配置了 ci_enable 或 ci_bucket，则尝试使用 CI
  const ciEnabled = cfg.ci_enable === true || String(cfg.ci_enable || '').toLowerCase() === 'true';
  const ciBucket = cfg.ci_bucket || process.env.CI_BUCKET || '';

  if (!ciEnabled || !ciBucket) return null;

  try {
    // 构建文件访问 URL
    const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
    const candidate = fileRow.thumbnail_path || fileRow.file_path;
    if (!candidate) return null;

    let normalized = candidate.replace(/\\/g, '/');
    if (normalized.startsWith('storage/')) {
      normalized = normalized.substring(8);
    }
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    const fileUrl = `${backendDomain}${normalized}`;

    const ci = await ciService.getInstance();
    if (!ci.enable) return null;

    // 优先使用异步审核
    if (ci.moderationAsync) {
      const asyncResult = await ci.moderationImageDetectAsync(fileUrl);
      if (asyncResult && asyncResult.jobId) {
        return {
          approved: true, // 异步审核先放行，失败后回调处理
          reason: `腾讯云CI审核任务已提交: ${asyncResult.jobId}`,
          jobId: asyncResult.jobId,
          source: 'ci_async',
          score: null,
          status: 'pending'
        };
      }
    }

    // 同步审核
    const result = await ci.moderationImageDetect(fileUrl);
    if (result) {
      return {
        approved: result.approved,
        reason: result.reason || undefined,
        score: result.score || null,
        categories: result.categories || [],
        source: 'ci_sync',
        status: result.status
      };
    }
  } catch (err) {
    console.error('[Moderation] callTencentCiModeration error:', err.message);
  }
  return null;
}

// 腾讯云 CI OCR 识别
async function callTencentCiOcr(fileRow) {
  const cfg = await loadModerationConfig();
  const ciEnabled = cfg.ci_enable === true || String(cfg.ci_enable || '').toLowerCase() === 'true';
  const ciBucket = cfg.ci_bucket || process.env.CI_BUCKET || '';

  if (!ciEnabled || !ciBucket) return null;

  try {
    const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
    const candidate = fileRow.thumbnail_path || fileRow.file_path;
    if (!candidate) return null;

    let normalized = candidate.replace(/\\/g, '/');
    if (normalized.startsWith('storage/')) {
      normalized = normalized.substring(8);
    }
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    const fileUrl = `${backendDomain}${normalized}`;

    const ci = await ciService.getInstance();
    if (!ci.enable || !ci.ocrEnable) return null;

    const result = await ci.ocrRecognize(fileUrl);
    if (result && result.fullText) {
      return result.fullText;
    }
  } catch (err) {
    console.error('[Moderation] callTencentCiOcr error:', err.message);
  }
  return null;
}

async function callSiliconflowModeration(fileRow, extraTextList) {
  const cfg = await loadModerationConfig();
  if (!cfg.enable || !cfg.apiUrl || !cfg.model) return null;
  // 准备文本：文件名 + 额外文本（可扩展OCR/ASR）
  const texts = [String(fileRow.original_name || '')].concat(extraTextList || []).filter(Boolean);
  const textJoined = texts.join('\n').slice(0, 4000);
  const systemPrompt = `你是一个内容审核助手。请根据中国大陆主流平台审核标准判断文本是否合规。
输出严格的JSON：{"decision":"allow|block","reason":"原因","score":0-100}
- decision: allow=通过, block=不通过
- score: 0(安全)到100(高风险)
只输出JSON，不要多余内容。`;
  const userPrompt = `待审核文本：\n${textJoined}\n\n严格度阈值: ${cfg.strictness}`;
  const payload = {
    model: cfg.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0,
    max_tokens: 200,
    // 强制要求模型输出严格 JSON，避免多余文本导致解析失败
    response_format: { type: 'json_object' },
    // 关闭思考链，减少非JSON思考输出干扰
    enable_thinking: false,
    n: 1
  };
  const headers = cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {};
  try {
    const { status, body } = await postJson(cfg.apiUrl, headers, payload, cfg.httpTimeout);
    if (status >= 200 && status < 300 && body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content) {
      const content = String(body.choices[0].message.content || '').trim();
      // 解析JSON
      let parsed = null;
      try { parsed = JSON.parse(content); } catch (_) {}
      if (parsed && (parsed.decision || parsed.score !== undefined)) {
        const allow = String(parsed.decision || '').toLowerCase() === 'allow';
        const block = String(parsed.decision || '').toLowerCase() === 'block';
        const score = typeof parsed.score === 'number' ? parsed.score : null;
        if (block) return { approved: false, reason: parsed.reason || 'AI判定不合规', source: 'ai', score };
        if (allow) return { approved: true, source: 'ai', score };
        if (score !== null) return { approved: score < cfg.strictness, reason: score >= cfg.strictness ? '风险评分过高' : undefined, source: 'ai', score };
      }
    }
  } catch (_) {}
  return null;
}

async function callExternalModeration(fileRow, extraTextList) {
  const cfg = await loadModerationConfig();
  if (!cfg.enable || !cfg.apiUrl) return null;

  // 腾讯云 CI 审核
  if (cfg.provider === 'ci' || cfg.provider === 'tencent-ci') {
    return await callTencentCiModeration(fileRow, extraTextList || []);
  }

  // Siliconflow AI 审核
  if (cfg.provider === 'siliconflow') {
    return await callSiliconflowModeration(fileRow, extraTextList || []);
  }

  // 通用自研接口
  const imageBase64 = await readThumbnailBase64(fileRow);
  const payload = {
    type: 'file_share_review',
    metadata: {
      id: fileRow.id,
      name: fileRow.original_name,
      mime: fileRow.mime_type,
      size: fileRow.file_size,
      kind: fileRow.file_type
    },
    texts: Array.isArray(extraTextList) ? extraTextList.filter(Boolean) : undefined,
    image_base64: imageBase64 || undefined,
    strictness: cfg.strictness
  };
  const headers = cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {};
  try {
    const { status, body } = await postJson(cfg.apiUrl, headers, payload, cfg.httpTimeout);
    if (status >= 200 && status < 300) {
      const allowed = body.allowed === true || body.allow === true || body.decision === 'allow' || body.label === 'allow';
      const block = body.allowed === false || body.allow === false || body.decision === 'block' || body.label === 'block';
      const score = typeof body.score === 'number' ? body.score : (typeof body.risk === 'number' ? body.risk : null);
      if (block) return { approved: false, reason: body.reason || '内容不合规', source: 'ai', score };
      if (allowed) return { approved: true, source: 'ai', score };
      if (score !== null) {
        return { approved: score < cfg.strictness, reason: score >= cfg.strictness ? '风险评分过高' : undefined, source: 'ai', score };
      }
      return { approved: false, reason: body.reason || '审核未通过', source: 'ai' };
    }
  } catch (_) {}
  return null;
}

module.exports = {
  async reviewFile(fileRow, extraTextList = []) {
    const cfg = await loadModerationConfig();

    // 如果审核总开关未启用，直接通过（异步审核不会拦截文件）
    if (!cfg.enable) {
      return { approved: true, source: 'disabled' };
    }

    // 1) 先尝试腾讯云 CI OCR 识别文字（用于辅助审核）
    let combinedTextList = [...(extraTextList || [])];
    if (fileRow.file_type === 'image' || /image\//i.test(fileRow.mime_type || '')) {
      const ciOcrText = await callTencentCiOcr(fileRow);
      if (ciOcrText) {
        combinedTextList.push(`[CI-OCR文字]: ${ciOcrText}`);
      } else {
        // CI OCR 失败时降级使用本地 OCR
        const localOcrText = await fetchOcrText(fileRow);
        if (localOcrText) {
          combinedTextList.push(`[OCR文字]: ${localOcrText}`);
        }
      }
    }

    // 2) 尝试腾讯云 CI 审核
    const ciResult = await callTencentCiModeration(fileRow, combinedTextList);
    if (ciResult) return ciResult;

    // 3) 尝试外部 AI 审核（Siliconflow / 自研接口）
    const ext = await callExternalModeration(fileRow, combinedTextList);
    if (ext) return ext;

    // 4) 本地快速规则（关键词）
    if (isLikelyViolationFromText(fileRow.original_name || '', fileRow.mime_type || '')) {
      return { approved: false, reason: '命中不合规关键词', source: 'local' };
    }

    // 5) 图像启发式
    if (cfg.imageHeuristic && (fileRow.file_type === 'image' || /image\//i.test(fileRow.mime_type || ''))) {
      const res = await quickImageHeuristic(fileRow);
      if (res && res.flag) {
        return { approved: false, reason: `图像可疑（皮肤像素占比 ${res.score}%）`, source: 'heuristic', score: res.score };
      }
    }

    // 6) 兜底
    const mime = (fileRow.mime_type || '').toLowerCase();
    if (!mime || mime.includes('octet-stream')) {
      return { approved: false, reason: '文件类型未知，无法审核', source: 'local' };
    }
    return { approved: true, source: 'local' };
  },
  fetchOcrText,

  // 清除配置缓存（供外部调用，如后台更新配置后）
  _clearCache() {
    moderationCfgCache = null;
    moderationCfgCacheTs = 0;
  }
};
