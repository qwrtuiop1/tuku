const fs = require('fs-extra');
const path = require('path');
const { URL } = require('url');
const http = require('http');
const https = require('https');
const sharp = require('sharp');
const { pool } = require('../config/database');

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
  'moderation_ocr_api_key'
];

function envModerationDefaults() {
  return {
    enable: (process.env.MODERATION_ENABLE || 'false').toLowerCase() === 'true',
    provider: (process.env.MODERATION_PROVIDER || '').toLowerCase(),
    apiUrl: process.env.MODERATION_API_URL || '',
    apiKey: process.env.MODERATION_API_KEY || '',
    model: process.env.MODERATION_MODEL || '',
    strictness: Math.min(100, Math.max(0, parseInt(process.env.MODERATION_STRICTNESS || '70', 10))),
    maxImageBytes: Math.min(2 * 1024 * 1024, parseInt(process.env.MODERATION_MAX_IMAGE_BYTES || String(512 * 1024), 10)),
    imageHeuristic: (process.env.MODERATION_IMAGE_HEURISTIC || 'true').toLowerCase() === 'true',
    ocrApiUrl: process.env.MODERATION_OCR_API_URL || '',
    ocrApiKey: process.env.MODERATION_OCR_API_KEY || ''
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
      maxImageBytes: map.moderation_max_image_bytes ? Math.min(2 * 1024 * 1024, parseInt(map.moderation_max_image_bytes, 10)) : cfg.maxImageBytes,
      imageHeuristic: map.moderation_image_heuristic ? String(map.moderation_image_heuristic).toLowerCase() === 'true' : cfg.imageHeuristic,
      ocrApiUrl: map.moderation_ocr_api_url || cfg.ocrApiUrl,
      ocrApiKey: map.moderation_ocr_api_key || cfg.ocrApiKey
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
  if (!MODERATION_OCR_API_URL) return null;
  try {
    const imageBase64 = await readThumbnailBase64(fileRow);
    if (!imageBase64) return null;
    const headers = MODERATION_OCR_API_KEY ? { Authorization: `Bearer ${MODERATION_OCR_API_KEY}` } : {};
    const { status, body } = await postJson(MODERATION_OCR_API_URL, headers, {
      type: 'ocr', image_base64: imageBase64, lang: 'zh-CN'
    });
    if (status >= 200 && status < 300 && body && typeof body.text === 'string') {
      const t = body.text.trim();
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

function postJson(urlString, headers, body) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlString);
      const isHttps = u.protocol === 'https:';
      const options = {
        method: 'POST',
        hostname: u.hostname,
        port: u.port || (isHttps ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {})
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
      req.on('error', reject);
      req.write(JSON.stringify(body || {}));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
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
    max_tokens: 200
  };
  const headers = cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {};
  try {
    const { status, body } = await postJson(cfg.apiUrl, headers, payload);
    if (status >= 200 && status < 300 && body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content) {
      const content = String(body.choices[0].message.content || '').trim();
      // 解析JSON
      let parsed = null;
      try { parsed = JSON.parse(content); } catch (_) {}
      if (parsed && (parsed.decision || parsed.score !== undefined)) {
        const allow = String(parsed.decision || '').toLowerCase() === 'allow';
        const block = String(parsed.decision || '').toLowerCase() === 'block';
        const score = typeof parsed.score === 'number' ? parsed.score : null;
        if (block) return { approved: false, reason: parsed.reason || 'AI判定不合规' };
        if (allow) return { approved: true };
        if (score !== null) return { approved: score < cfg.strictness, reason: score >= cfg.strictness ? '风险评分过高' : undefined };
      }
    }
  } catch (_) {}
  return null;
}

async function callExternalModeration(fileRow, extraTextList) {
  const cfg = await loadModerationConfig();
  if (!cfg.enable || !cfg.apiUrl) return null;
  // 优先使用指定提供商
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
    const { status, body } = await postJson(cfg.apiUrl, headers, payload);
    if (status >= 200 && status < 300) {
      const allowed = body.allowed === true || body.allow === true || body.decision === 'allow' || body.label === 'allow';
      const block = body.allowed === false || body.allow === false || body.decision === 'block' || body.label === 'block';
      const score = typeof body.score === 'number' ? body.score : (typeof body.risk === 'number' ? body.risk : null);
      if (block) return { approved: false, reason: body.reason || '内容不合规' };
      if (allowed) return { approved: true };
      if (score !== null) {
        return { approved: score < cfg.strictness, reason: score >= cfg.strictness ? '风险评分过高' : undefined };
      }
      return { approved: false, reason: body.reason || '审核未通过' };
    }
  } catch (_) {}
  return null;
}

module.exports = {
  async reviewFile(fileRow, extraTextList = []) {
    if (isLikelyViolationFromText(fileRow.original_name || '', fileRow.mime_type || '')) {
      return { approved: false, reason: '命中不合规关键词' };
    }
    if (ENABLE_IMAGE_HEURISTIC && (fileRow.file_type === 'image' || /image\//i.test(fileRow.mime_type || ''))) {
      const res = await quickImageHeuristic(fileRow);
      if (res && res.flag) {
        return { approved: false, reason: `图像可疑（皮肤像素占比 ${res.score}%）` };
      }
    }
    const ext = await callExternalModeration(fileRow, extraTextList || []);
    if (ext) return ext;
    const mime = (fileRow.mime_type || '').toLowerCase();
    if (!mime || mime.includes('octet-stream')) {
      return { approved: false, reason: '文件类型未知，无法审核' };
    }
    return { approved: true };
  },
  fetchOcrText
};
