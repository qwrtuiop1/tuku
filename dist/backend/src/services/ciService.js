/**
 * 腾讯云数据万象 CI 服务模块
 * 文档: https://cloud.tencent.com/document/product/460/陆地
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const axios = require('axios');

const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

// ============================================================
// 配置管理
// ============================================================

let ciConfigCache = null;
let ciConfigCacheTs = 0;

const CI_CONFIG_KEYS = [
  'ci_enable',
  'ci_region',
  'ci_secret_id',
  'ci_secret_key',
  'ci_bucket',
  'ci_appid',
  'ci_cos_host',        // 自定义COS域名（可选）
  'ci_moderation_enable',
  'ci_moderation_async', // 异步审核开关
  'ci_thumbnail_enable', // 缩略图使用CI
  'ci_thumbnail_style',  // CI截图样式
  'ci_ocr_enable'        // OCR识别开关
];

function envCiDefaults() {
  return {
    enable: (process.env.CI_ENABLE || 'false').toLowerCase() === 'true',
    region: process.env.CI_REGION || 'ap-guangzhou',
    secretId: process.env.CI_SECRET_ID || '',
    secretKey: process.env.CI_SECRET_KEY || '',
    bucket: process.env.CI_BUCKET || '',
    appId: process.env.CI_APPID || '',
    cosHost: process.env.CI_COS_HOST || '',
    moderationEnable: (process.env.CI_MODERATION_ENABLE || 'true').toLowerCase() === 'true',
    moderationAsync: (process.env.CI_MODERATION_ASYNC || 'false').toLowerCase() === 'true',
    thumbnailEnable: (process.env.CI_THUMBNAIL_ENABLE || 'true').toLowerCase() === 'true',
    thumbnailStyle: process.env.CI_THUMBNAIL_STYLE || 'imageMogr2/thumbnail/300x300/gravity/center/interlace/1/quality/80',
    ocrEnable: (process.env.CI_OCR_ENABLE || 'true').toLowerCase() === 'true'
  };
}

async function loadCiConfig() {
  const now = Date.now();
  if (ciConfigCache && (now - ciConfigCacheTs) < 10000) return ciConfigCache;

  const { pool } = require('../config/database');
  let cfg = envCiDefaults();

  if (cfg.enable && cfg.secretId && cfg.secretKey && cfg.bucket) {
    try {
      const placeholders = CI_CONFIG_KEYS.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
        CI_CONFIG_KEYS
      );
      const map = {};
      rows.forEach(r => { map[r.setting_key] = r.setting_value });

      if (Object.keys(map).length > 0) {
        cfg = {
          enable: map.ci_enable ? String(map.ci_enable).toLowerCase() === 'true' : cfg.enable,
          region: map.ci_region || cfg.region,
          secretId: map.ci_secret_id || cfg.secretId,
          secretKey: map.ci_secret_key || cfg.secretKey,
          bucket: map.ci_bucket || cfg.bucket,
          appId: map.ci_appid || cfg.appId,
          cosHost: map.ci_cos_host || cfg.cosHost,
          moderationEnable: map.ci_moderation_enable ? String(map.ci_moderation_enable).toLowerCase() === 'true' : cfg.moderationEnable,
          moderationAsync: map.ci_moderation_async ? String(map.ci_moderation_async).toLowerCase() === 'true' : cfg.moderationAsync,
          thumbnailEnable: map.ci_thumbnail_enable ? String(map.ci_thumbnail_enable).toLowerCase() === 'true' : cfg.thumbnailEnable,
          thumbnailStyle: map.ci_thumbnail_style || cfg.thumbnailStyle,
          ocrEnable: map.ci_ocr_enable ? String(map.ci_ocr_enable).toLowerCase() === 'true' : cfg.ocrEnable
        };
      }
    } catch (_) {}
  }

  ciConfigCache = cfg;
  ciConfigCacheTs = now;
  return ciConfigCache;
}

// ============================================================
// 腾讯云签名工具
// ============================================================

function sha1(str, key) {
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(str);
  return hmac.digest('hex');
}

function makeSign({
  secretId,
  secretKey,
  method,
  pathname,
  query,
  headers,
  payload = ''
}) {
  const signTime = `${Math.floor(Date.now() / 1000) - 300}-${Math.floor(Date.now() / 1000) + 3600}`;
  const signHeaders = Object.entries(headers)
    .map(([k, v]) => `${k.toLowerCase()}=${encodeURIComponent(String(v))}`)
    .sort()
    .join('&');

  const httpString = [
    method.toLowerCase(),
    pathname,
    query ? Object.entries(query).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : '',
    signHeaders
  ].join('\n') + '\n';

  const stringToSign = `sha1\n${signTime}\n${sha1(httpString, secretKey)}\n`;
  const signature = sha1(stringToSign, secretKey);

  const auth = `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}&q-header-list=${Object.keys(headers).map(k => k.toLowerCase()).sort().join(';')}&q-url-param-list=${query ? Object.keys(query).sort().join(';') : ''}&q-signature=${signature}`;

  return auth;
}

// ============================================================
// HTTP 请求封装
// ============================================================

function ciRequest(method, host, pathname, query, body, headers, timeout = 30000) {
  return new Promise((resolve, reject) => {
    try {
      const options = {
        method: method.toUpperCase(),
        hostname: host,
        port: 443,
        path: `${pathname}${query ? '?' + Object.entries(query).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : ''}`,
        headers: {
          'Host': host,
          'Content-Type': 'application/json',
          ...headers
        },
        timeout
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              status: res.statusCode,
              body: json,
              raw: data,
              headers: res.headers
            });
          } catch (_) {
            resolve({
              status: res.statusCode,
              body: {},
              raw: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('CI request timeout')); });

      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================
// CI 服务核心类
// ============================================================

class CiService {
  constructor(config) {
    this.enable = config.enable;
    this.region = config.region;
    this.secretId = config.secretId;
    this.secretKey = config.secretKey;
    this.bucket = config.bucket;
    this.appId = config.appId || (config.bucket.match(/-\d+$/) ? config.bucket.match(/-\d+$/)[0].slice(1) : '');
    this.cosHost = config.cosHost || `${this.bucket}.cos.${this.region}.myqcloud.com`;
    this.moderationEnable = config.moderationEnable;
    this.moderationAsync = config.moderationAsync;
    this.thumbnailEnable = config.thumbnailEnable;
    this.thumbnailStyle = config.thumbnailStyle;
    this.ocrEnable = config.ocrEnable;
  }

  getHost() {
    return `${this.bucket}.cos.${this.region}.myqcloud.com`;
  }

  // 生成访问签名 URL（用于前端直传 COS）
  getSignedUrl(key, expiresIn = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const signTime = `${Math.floor(Date.now() / 1000)}-${exp}`;
    const httpString = `a=${this.bucket}\n&b=${key}\n&e=${exp}\n&k=${this.secretKey}`;
    const signature = crypto.createHmac('sha1', this.secretKey)
      .update(Buffer.from(httpString, 'utf8'))
      .digest('hex');

    const signStr = `a=${this.appId}&k=${this.secretId}&e=${exp}&t=${Math.floor(Date.now() / 1000)}&r=${Math.floor(Math.random() * 1000000)}&f=`;
    const data = Buffer.from(signStr + signature);
    const signBase64 = data.toString('base64');

    return `https://${this.cosHost}/${key}?sign=${encodeURIComponent(signBase64)}`;
  }

  // 生成持久化配置
  getPersistentBody(confType, key, conf) {
    if (confType === 'porn' || confType === 'terror' || confType === 'politics' || confType === 'ads') {
      return {
        ...conf,
        detectType: 'porn,terror,politics',
        bizType: 0
      };
    }
    return conf;
  }

  // 获取公开访问URL
  getPublicUrl(key) {
    // 移除开头的 /
    const cleanKey = key.replace(/^\//, '');
    return `https://${this.cosHost}/${cleanKey}`;
  }

  // 生成缩略图URL
  getThumbnailUrl(key, style = null) {
    const cleanKey = key.replace(/^\//, '');
    const styleStr = style || this.thumbnailStyle;
    return `https://${this.cosHost}/${cleanKey}?${styleStr}`;
  }

  // 生成水印URL
  getWatermarkUrl(key, watermarkText, style = null) {
    const cleanKey = key.replace(/^\//, '');
    // CI 图片水印参数（文字base64编码）
    const textBase64 = Buffer.from(watermarkText).toString('base64');
    const wmStyle = style || `watermark/2/text/${textBase64}/fill/1/fontsize/20/dissolve/50/gravity/southeast/dx/10/dy/10`;
    return `https://${this.cosHost}/${cleanKey}?${wmStyle}`;
  }

  // ============================================================
  // 图片审核 - 同步（直接返回结果）
  // ============================================================

  async moderationImageDetect(filePathOrUrl, options = {}) {
    if (!this.enable || !this.moderationEnable) {
      return null;
    }

    const {
      detectType = 'porn,terror,politics',
      bizType = 0
    } = options;

    try {
      const isUrl = /^https?:\/\//.test(String(filePathOrUrl));
      let headers = {};
      let body = {};

      if (isUrl) {
        body = {
          detectType,
          bizType,
          url: filePathOrUrl
        };
      } else {
        // 本地文件转 base64
        const absPath = toAbsolute(filePathOrUrl);
        if (!absPath || !(await fs.pathExists(absPath))) {
          throw new Error('File not found: ' + filePathOrUrl);
        }
        const buf = await fs.readFile(absPath);
        const base64 = buf.toString('base64');
        const mimeType = getMimeType(absPath);
        body = {
          detectType,
          bizType,
          bizType: 0,
          thresholds: [0, 10, 45, 70, 80, 95],
          imageBase64: base64
        };
      }

      const pathname = '/image/auditing';
      const query = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers: {
          'Host': this.getHost(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(body))
        },
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status, body: result, headers: respHeaders } = await ciRequest(
        'POST',
        this.getHost(),
        pathname,
        query,
        body,
        headers,
        30000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] moderationImageDetect request-id: ${requestId}`);
      }

      if (status === 200 && result) {
        return this._parseModerationResult(result, filePathOrUrl);
      }
    } catch (err) {
      console.error('[CI] moderationImageDetect error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 图片审核 - 异步（提交任务，返回 JobId）
  // ============================================================

  async moderationImageDetectAsync(key, options = {}) {
    if (!this.enable || !this.moderationEnable) {
      return null;
    }

    const {
      detectType = 'Porn,Terror,Politics,Ads',
      callbackUrl = ''
    } = options;

    try {
      const cleanKey = key.replace(/^\//, '');
      const body = {
        Input: { Object: cleanKey },
        Conf: {
          DetectType: detectType,
          CallbackUrl: callbackUrl,
          ReturnHighlightInfos: true
        }
      };

      const pathname = '/video/auditing';
      const query = {};
      const headers = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers: {
          'Host': this.getHost(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(body))
        },
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status, body: result, headers: respHeaders } = await ciRequest(
        'POST',
        this.getHost(),
        pathname,
        query,
        body,
        headers,
        30000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] moderationImageDetectAsync request-id: ${requestId}`);
      }

      if (status === 200 && result && result.JobsDetail) {
        return {
          jobId: result.JobsDetail.JobId,
          state: result.JobsDetail.State,
          url: this.getPublicUrl(cleanKey)
        };
      }
    } catch (err) {
      console.error('[CI] moderationImageDetectAsync error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 查询异步审核结果
  // ============================================================

  async moderationQueryResult(jobId) {
    if (!this.enable) return null;

    try {
      const pathname = `/video/auditing/${jobId}`;
      const query = {};
      const headers = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'GET',
        pathname,
        query,
        headers: {
          'Host': this.getHost()
        }
      });
      headers['Authorization'] = auth;

      const { status, body, headers: respHeaders } = await ciRequest(
        'GET',
        this.getHost(),
        pathname,
        query,
        null,
        headers,
        15000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] moderationQueryResult request-id: ${requestId}`);
      }

      if (status === 200 && body && body.JobsDetail) {
        return this._parseModerationResult(body.JobsDetail, null);
      }
    } catch (err) {
      console.error('[CI] moderationQueryResult error:', err.message);
    }
    return null;
  }

  // ============================================================
  // OCR 文字识别
  // ============================================================

  async ocrRecognize(filePathOrUrl, options = {}) {
    if (!this.enable || !this.ocrEnable) return null;

    const { lang = 'zh' } = options;

    try {
      const isUrl = /^https?:\/\//.test(String(filePathOrUrl));
      let headers = {};
      let body = {};

      if (isUrl) {
        body = { url: filePathOrUrl };
      } else {
        const absPath = toAbsolute(filePathOrUrl);
        if (!absPath || !(await fs.pathExists(absPath))) return null;
        const buf = await fs.readFile(absPath);
        const base64 = buf.toString('base64');
        body = { imageBase64: base64 };
      }

      const pathname = '/ocr/recognize';
      const query = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers: {
          'Host': this.getHost(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(body))
        },
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status, body: result, headers: respHeaders } = await ciRequest(
        'POST',
        this.getHost(),
        pathname,
        query,
        body,
        headers,
        30000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] ocrRecognize request-id: ${requestId}`);
      }

      if (status === 200 && result) {
        return {
          texts: result.TextDetections ? result.TextDetections.map(t => ({
            text: t.DetectedText,
            confidence: t.Confidence,
            bounds: t.DetectedQuads ? t.DetectedQuads[0] : null
          })) : [],
          fullText: result.TextDetections ? result.TextDetections.map(t => t.DetectedText).join('\n') : ''
        };
      }
    } catch (err) {
      console.error('[CI] ocrRecognize error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 图片上传到 COS
  // ============================================================

  async uploadToCos(localFilePath, cosKey, options = {}) {
    if (!this.enable) return null;

    try {
      const absPath = toAbsolute(localFilePath);
      if (!absPath || !(await fs.pathExists(absPath))) {
        throw new Error('Local file not found: ' + localFilePath);
      }

      const buf = await fs.readFile(absPath);
      const cleanKey = cosKey.replace(/^\//, '');

      const pathname = '/' + cleanKey;
      const query = {};
      const headers = {
        'Host': this.getHost(),
        'Content-Type': options.mimeType || 'application/octet-stream',
        'Content-Length': buf.length
      };

      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'PUT',
        pathname,
        query,
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status } = await new Promise((resolve, reject) => {
        const req = https.request({
          method: 'PUT',
          hostname: this.getHost(),
          port: 443,
          path: pathname,
          headers
        }, (res) => {
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Upload timeout')); });
        req.write(buf);
        req.end();
      });

      if (status === 200 || status === 201) {
        return {
          key: cleanKey,
          url: this.getPublicUrl(cleanKey),
          thumbnailUrl: this.getThumbnailUrl(cleanKey),
          size: buf.length
        };
      }
    } catch (err) {
      console.error('[CI] uploadToCos error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 删除 COS 对象
  // ============================================================

  async deleteObject(key) {
    if (!this.enable) return false;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const headers = { 'Host': this.getHost() };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'DELETE',
        pathname,
        query: {},
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status } = await ciRequest('DELETE', this.getHost(), pathname, {}, null, headers, 15000);
      return status === 200 || status === 204;
    } catch (err) {
      console.error('[CI] deleteObject error:', err.message);
    }
    return false;
  }

  // ============================================================
  // 获取对象信息
  // ============================================================

  async headObject(key) {
    if (!this.enable) return null;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const headers = { 'Host': this.getHost() };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'HEAD',
        pathname,
        query: {},
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status, body } = await ciRequest('HEAD', this.getHost(), pathname, {}, null, headers, 15000);
      if (status === 200) {
        return body;
      }
    } catch (_) {}
    return null;
  }

  // ============================================================
  // 获取图片信息（通过 CI 图片处理接口）
  // ============================================================

  async getImageInfo(key) {
    if (!this.enable) return null;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const query = { 'imageInfo': '' };
      const headers = { 'Host': this.getHost() };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'GET',
        pathname,
        query,
        headers
      });
      headers['Authorization'] = auth;

      const { status, body, headers: respHeaders } = await ciRequest('GET', this.getHost(), pathname, query, null, headers, 15000);

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] getImageInfo request-id: ${requestId}`);
      }

      if (status === 200 && body && body.imageInfo) {
        const info = body.imageInfo;
        return {
          format: info.format || '',
          width: parseInt(info.width) || null,
          height: parseInt(info.height) || null,
          size: parseInt(info.size) || null,
          colorSpace: info.colorSpace || '',
          orientation: info.orientation ? parseInt(info.orientation) : null
        };
      }
    } catch (err) {
      console.error('[CI] getImageInfo error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 检测文件类型（通过文件头魔数）
  // ============================================================

  async detectFileType(filePathOrUrl, mimeHint = '') {
    if (!this.enable) return null;

    try {
      const isUrl = /^https?:\/\//.test(String(filePathOrUrl));

      if (isUrl) {
        // 远程文件：使用 CI 的 fileDownload 获取文件头
        const key = this._extractKeyFromUrl(filePathOrUrl);
        if (key) {
          return await this._detectTypeByCosHead(key);
        }
        // 无法从 URL 提取 key，尝试 HEAD 请求
        return await this._detectTypeByHttpHead(filePathOrUrl);
      } else {
        // 本地文件：直接读取文件头
        const absPath = toAbsolute(filePathOrUrl);
        if (!absPath || !(await fs.pathExists(absPath))) return null;
        return await this._detectTypeByFileHeader(absPath);
      }
    } catch (err) {
      console.error('[CI] detectFileType error:', err.message);
    }
    return null;
  }

  _extractKeyFromUrl(url) {
    // 尝试从 URL 中提取 COS key
    const host = this.cosHost.replace('.', '\\.');
    const regex = new RegExp(`https?://${host}/(.+)$`);
    const match = String(url).match(regex);
    return match ? match[1] : null;
  }

  async _detectTypeByCosHead(key) {
    try {
      const pathname = '/' + key;
      const headers = { 'Host': this.getHost() };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'HEAD',
        pathname,
        query: {},
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status, body, rawHeaders } = await new Promise((resolve, reject) => {
        const req = https.request({
          method: 'HEAD',
          hostname: this.getHost(),
          port: 443,
          path: pathname,
          headers
        }, (res) => {
          const headers = {};
          res.rawHeaders.forEach((v, i) => {
            if (i % 2 === 0) headers[res.rawHeaders[i].toLowerCase()] = res.rawHeaders[i + 1];
          });
          let data = '';
          res.on('data', c => { data += c; });
          res.on('end', () => resolve({ status: res.statusCode, rawHeaders: headers, body: data }));
        });
        req.on('error', reject);
        req.end();
      });

      if (status === 200 || status === 403) {
        // 403 可能是因为没有权限，但仍能从 Content-Type 获取线索
        const contentType = rawHeaders['content-type'] || '';
        const etag = rawHeaders['etag'] || '';

        // 从 Content-Type 推断
        if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) return 'image/jpeg';
        if (contentType.includes('image/png')) return 'image/png';
        if (contentType.includes('image/gif')) return 'image/gif';
        if (contentType.includes('image/webp')) return 'image/webp';
        if (contentType.includes('video/mp4')) return 'video/mp4';
        if (contentType.includes('video/')) return 'video';
        if (contentType.includes('image/')) return 'image';

        // 从 ETag 推断（CI 存储视频时 ETag 通常是 "video/..." 开头）
        if (etag.includes('video/')) {
          if (etag.includes('mp4')) return 'video/mp4';
          return 'video';
        }
      }
    } catch (_) {}
    return null;
  }

  async _detectTypeByHttpHead(url) {
    return new Promise((resolve) => {
      try {
        const u = new URL(url);
        const isHttps = u.protocol === 'https:';
        const req = (isHttps ? https : http).request({
          method: 'HEAD',
          hostname: u.hostname,
          port: u.port || (isHttps ? 443 : 80),
          path: u.pathname + u.search,
          timeout: 10000
        }, (res) => {
          const ct = res.headers['content-type'] || '';
          if (ct.includes('jpeg') || ct.includes('jpg')) resolve('image/jpeg');
          else if (ct.includes('png')) resolve('image/png');
          else if (ct.includes('gif')) resolve('image/gif');
          else if (ct.includes('webp')) resolve('image/webp');
          else if (ct.includes('svg')) resolve('image/svg+xml');
          else if (ct.includes('video/mp4') || ct.includes('quicktime')) resolve('video/mp4');
          else if (ct.includes('video/')) resolve('video');
          else if (ct.includes('image/')) resolve('image');
          else resolve(null);
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.end();
      } catch (_) {
        resolve(null);
      }
    });
  }

  async _detectTypeByFileHeader(absPath) {
    try {
      const header = Buffer.alloc(12);
      const fd = await fs.open(absPath, 'r');
      await fd.read(header, 0, 12, 0);
      await fd.close();

      // JPEG: FF D8 FF
      if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) return 'image/jpeg';
      // PNG: 89 50 4E 47
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return 'image/png';
      // GIF: 47 49 46 38
      if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return 'image/gif';
      // WebP: 52 49 46 46 ... 57 45 42 50
      if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
          header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) return 'image/webp';
      // MP4/MOV: 00 00 00 ?? 66 74 79 70
      if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) return 'video/mp4';
      // MP4/MOV: 00 00 00 ?? 6D 6F 6F 76
      if (header[4] === 0x6D && header[5] === 0x6F && header[6] === 0x6F && header[7] === 0x76) return 'video/quicktime';
      // PDF: 25 50 44 46
      if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) return 'application/pdf';
    } catch (_) {}
    return null;
  }

  // ============================================================
  // 分片上传（用于大文件）
  // ============================================================

  async initMultipartUpload(key, options = {}) {
    if (!this.enable) return null;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const query = { uploads: '' };
      const headers = {
        'Host': this.getHost(),
        'Content-Type': 'application/octet-stream'
      };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status, body } = await ciRequest('POST', this.getHost(), pathname, query, null, headers, 30000);

      if (status === 200 && body && body.InitiateMultipartUploadResult) {
        return {
          uploadId: body.InitiateMultipartUploadResult.UploadId,
          key: cleanKey
        };
      }
    } catch (err) {
      console.error('[CI] initMultipartUpload error:', err.message);
    }
    return null;
  }

  async uploadPart(key, uploadId, partNumber, data, options = {}) {
    if (!this.enable) return null;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const query = { uploadId, partNumber };
      const headers = {
        'Host': this.getHost(),
        'Content-Type': 'application/octet-stream',
        'Content-Length': data.length
      };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'PUT',
        pathname,
        query,
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status, body } = await new Promise((resolve, reject) => {
        const req = https.request({
          method: 'PUT',
          hostname: this.getHost(),
          port: 443,
          path: pathname + `?uploadId=${uploadId}&partNumber=${partNumber}`,
          headers
        }, (res) => {
          let d = '';
          res.on('data', c => { d += c; });
          res.on('end', () => {
            try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
            catch (_) { resolve({ status: res.statusCode, body: {} }); }
          });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
      });

      if (status === 200) {
        return { etag: body.ETag || '' };
      }
    } catch (err) {
      console.error('[CI] uploadPart error:', err.message);
    }
    return null;
  }

  async completeMultipartUpload(key, uploadId, parts, options = {}) {
    if (!this.enable) return null;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const query = { uploadId };
      const body = { Parts: parts };
      const headers = {
        'Host': this.getHost(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers,
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status } = await ciRequest('POST', this.getHost(), pathname, query, body, headers, 60000);

      if (status === 200) {
        return {
          key: cleanKey,
          url: this.getPublicUrl(cleanKey)
        };
      }
    } catch (err) {
      console.error('[CI] completeMultipartUpload error:', err.message);
    }
    return null;
  }

  async abortMultipartUpload(key, uploadId) {
    if (!this.enable) return false;

    try {
      const cleanKey = key.replace(/^\//, '');
      const pathname = '/' + cleanKey;
      const query = { uploadId };
      const headers = { 'Host': this.getHost() };
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'DELETE',
        pathname,
        query,
        headers,
        payload: ''
      });
      headers['Authorization'] = auth;

      const { status } = await ciRequest('DELETE', this.getHost(), pathname, query, null, headers, 30000);
      return status === 200 || status === 204;
    } catch (err) {
      console.error('[CI] abortMultipartUpload error:', err.message);
    }
    return false;
  }

  // ============================================================
  // 生成前端直传签名
  // ============================================================

  generateUploadSignature(key, expiresIn = 3600) {
    // V5 签名算法
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const signTime = `${Math.floor(Date.now() / 1000)}-${exp}`;

    // 使用简单的 HMAC-SHA1 签名（适用于前端直传）
    const httpString = [
      'put',
      '/' + key.replace(/^\//, ''),
      '',
      `q-sign-algorithm=sha1&q-ak=${this.secretId}&q-key-time=${signTime}&q-header-list=host&q-url-param-list=`,
      `q-signature=${this._makeSignV1('put', '/' + key.replace(/^\//, ''), signTime)}`
    ].join('\n');

    return {
      uploadUrl: `https://${this.cosHost}/${key.replace(/^\//, '')}`,
      signature: httpString,
      expires: exp
    };
  }

  _makeSignV1(method, pathname, signTime) {
    const stringToSign = `${method}\n${pathname}\n\nhost\n`;
    return crypto.createHmac('sha1', this.secretKey)
      .update(stringToSign)
      .digest('hex');
  }

  // ============================================================
  // 生成访问签名 URL
  // ============================================================

  getSignedUrl(key, expiresIn = 3600) {
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const signTime = `${Math.floor(Date.now() / 1000)}-${exp}`;

    const stringToSign = `GET\n/${key.replace(/^\//, '')}\n\nhost\n`;
    const signature = crypto.createHmac('sha1', this.secretKey)
      .update(stringToSign)
      .digest('hex');

    const encodedKey = encodeURIComponent(key.replace(/^\//, ''));
    return `https://${this.cosHost}/${encodedKey}?sign=v1&exp=${exp}&ak=${this.secretId}&sig=${signature}`;
  }

  // ============================================================
  // 解析审核结果（统一格式）
  // ============================================================

  _parseModerationResult(result, fileRef) {
    // 异步任务格式
    const isAsyncJob = result.State !== undefined || result.JobId !== undefined;

    if (isAsyncJob) {
      const state = result.State; // Running, Success, Failed, Timeout

      if (state === 'Running') {
        return { status: 'pending', jobId: result.JobId, approved: null };
      }
      if (state !== 'Success') {
        return { status: 'error', jobId: result.JobsId || result.JobId, reason: `CI job ${state}` };
      }

      // Success，解析 DetailResults
      return this._parseAsyncDetail(result.DetailResults || result);
    }

    // 同步返回格式
    const resp = result.Response || result;
    const results = resp.ImageResults || resp.DetailResults || [];

    const categories = [];
    const allSuggestions = [];
    const allScores = [];

    for (const r of results) {
      const cats = r.PornInfo || r.TerrorInfo || r.PoliticsInfo || r.AdsInfo || r;
      if (cats) {
        const label = cats.Label || '';
        const score = parseFloat(cats.Score || 0);
        const hit = cats.HitFlag === 1 || cats.HitFlag === '1' || score >= 70;

        if (label && label !== 'Normal' && label !== 'normal') {
          categories.push({ type: label, score, hit });
        }
        allScores.push(score);
        allSuggestions.push({ label, score, hit });
      }
    }

    const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    const blocked = categories.some(c => c.hit) || maxScore >= 80;

    return {
      status: 'success',
      approved: !blocked,
      reason: blocked ? categories.filter(c => c.hit).map(c => `${c.type}(${c.score}分)`).join(', ') : undefined,
      score: maxScore,
      categories,
      details: allSuggestions,
      jobId: result.JobId || result.JobsId || null,
      source: 'ci'
    };
  }

  // ============================================================
  // 视频转动图 (Animation)
  // 将视频片段转换为 GIF/WebP
  // ============================================================
  async videoToAnimation(cosKey, options = {}) {
    if (!this.enable) return null;

    const {
      templateId = '',       // 转动图模板 ID（可选）
      startTime = '0',       // 开始时间，单位：秒
      timeSpan = '3',        // 截图时长，单位：秒
      frameRate = '15',      // 帧率
      outputFormat = 'gif',  // 输出格式：gif, webp
      width = '320',         // 输出宽度
      quality = '80',        // 质量
      outputKey = ''         // 输出文件路径，不传则自动生成
    } = options;

    try {
      const cleanKey = cosKey.replace(/^\//, '');
      const outputFileKey = outputKey || this._generateOutputKey(cleanKey, `.${outputFormat}`);

      // 使用 CI 媒体处理 API
      const body = {
        Input: { Object: cleanKey },
        Operation: {
          Output: {
            Region: this.region,
            Bucket: this.bucket,
            Object: outputFileKey
          }
        }
      };

      // 如果没有指定模板，使用自定义参数
      if (!templateId) {
        body.Operation.Animation = {
          StartTime: startTime,
          TimeSpan: timeSpan,
          FrameRate: frameRate,
          Format: outputFormat,
          Width: width,
          Quality: quality
        };
      } else {
        body.Operation.TemplateId = templateId;
      }

      const pathname = '/video/av动画片';
      const query = {};
      const headers = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers: {
          'Host': this.getHost(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(body))
        },
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status, body: result, headers: respHeaders } = await ciRequest(
        'POST',
        this.getHost(),
        pathname,
        query,
        body,
        headers,
        60000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] videoToAnimation request-id: ${requestId}`);
      }

      if (status === 200 && result && result.JobsDetail) {
        return {
          jobId: result.JobsDetail.JobId,
          state: result.JobsDetail.State,
          outputKey: outputFileKey,
          outputUrl: this.getPublicUrl(outputFileKey)
        };
      }
    } catch (err) {
      console.error('[CI] videoToAnimation error:', err.message);
    }
    return null;
  }

  // ============================================================
  // 智能封面 (SmartCover)
  // AI 自动生成视频封面
  // ============================================================
  async generateSmartCover(cosKey, options = {}) {
    if (!this.enable) return null;

    const {
      templateId = '',      // 智能封面模板 ID（可选）
      count = '3',          // 生成封面数量
      width = '',           // 封面宽度（可选）
      height = '',          // 封面高度（可选）
      deleteDuplicates = 'false',  // 是否去重
      outputKey = ''        // 输出文件路径，不传则自动生成
    } = options;

    try {
      const cleanKey = cosKey.replace(/^\//, '');
      const outputDir = outputKey || this._generateOutputKey(cleanKey, '/');

      // 构建智能封面参数
      const smartCoverConfig = {
        Format: 'jpg',
        Count: count,
        DeleteDuplicates: deleteDuplicates
      };

      if (width) smartCoverConfig.Width = width;
      if (height) smartCoverConfig.Height = height;

      const body = {
        Input: { Object: cleanKey },
        Operation: {
          Output: {
            Region: this.region,
            Bucket: this.bucket,
            Object: outputDir
          },
          SmartCover: smartCoverConfig
        }
      };

      // 如果有模板 ID，使用模板
      if (templateId) {
        body.Operation.TemplateId = templateId;
        delete body.Operation.SmartCover;
      }

      const pathname = '/video/av智能封面';
      const query = {};
      const headers = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'POST',
        pathname,
        query,
        headers: {
          'Host': this.getHost(),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(body))
        },
        payload: JSON.stringify(body)
      });
      headers['Authorization'] = auth;

      const { status, body: result, headers: respHeaders } = await ciRequest(
        'POST',
        this.getHost(),
        pathname,
        query,
        body,
        headers,
        60000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] generateSmartCover request-id: ${requestId}`);
      }

      if (status === 200 && result && result.JobsDetail) {
        const jobDetail = result.JobsDetail;
        return {
          jobId: jobDetail.JobId,
          state: jobDetail.State,
          covers: jobDetail.ResultObject ? this._parseSmartCoverResults(jobDetail.ResultObject, outputDir) : []
        };
      }
    } catch (err) {
      console.error('[CI] generateSmartCover error:', err.message);
    }
    return null;
  }

  // 查询视频转动图/智能封面任务结果
  async queryMediaJob(jobId) {
    if (!this.enable) return null;

    try {
      const pathname = `/video/av智能封面/${jobId}`;
      const query = {};
      const headers = {};
      const auth = makeSign({
        secretId: this.secretId,
        secretKey: this.secretKey,
        method: 'GET',
        pathname,
        query,
        headers: {
          'Host': this.getHost()
        }
      });
      headers['Authorization'] = auth;

      const { status, body, headers: respHeaders } = await ciRequest(
        'GET',
        this.getHost(),
        pathname,
        query,
        null,
        headers,
        15000
      );

      // 记录 CI 请求 ID，方便排查问题
      const requestId = respHeaders['x-ci-request-id'];
      if (requestId) {
        console.log(`[CI] queryMediaJob request-id: ${requestId}`);
      }

      if (status === 200 && body && body.JobsDetail) {
        const job = body.JobsDetail;
        return {
          jobId: job.JobId,
          state: job.State,
          outputKey: job.Output ? job.Output.Object : null,
          outputUrl: job.Output ? this.getPublicUrl(job.Output.Object) : null,
          covers: job.ResultObject ? this._parseSmartCoverResults(job.ResultObject, '') : []
        };
      }
    } catch (err) {
      console.error('[CI] queryMediaJob error:', err.message);
    }
    return null;
  }

  // 内部方法：解析智能封面结果
  _parseSmartCoverResults(resultObjects, baseDir) {
    if (!resultObjects) return [];

    const objects = Array.isArray(resultObjects) ? resultObjects : [resultObjects];
    return objects.map(obj => {
      const objectKey = obj.Object || obj;
      return {
        key: objectKey,
        url: this.getPublicUrl(objectKey)
      };
    });
  }

  // 内部方法：生成输出文件路径
  _generateOutputKey(sourceKey, suffix) {
    const dir = path.dirname(sourceKey);
    const name = path.basename(sourceKey, path.extname(sourceKey));
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${dir}/${name}_processed_${timestamp}_${random}${suffix}`;
  }

  _parseAsyncDetail(details) {
    if (!details || !Array.isArray(details)) {
      return { status: 'error', reason: 'No details', approved: false };
    }

    const categories = [];
    const allScores = [];

    for (const d of details) {
      const info = d.PornInfo || d.TerrorInfo || d.PoliticsInfo || d.AdsInfo || d;
      if (info) {
        const label = info.Label || d.Label || '';
        const score = parseFloat(info.Score || info.Score || 0);
        const hit = info.HitFlag === 1 || info.HitFlag === '1' || score >= 70;

        if (label && label !== 'Normal' && label !== 'normal' && label !== '') {
          categories.push({ type: label, score, hit });
        }
        allScores.push(score);
      }
    }

    const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    const blocked = categories.some(c => c.hit) || maxScore >= 80;

    return {
      status: 'success',
      approved: !blocked,
      reason: blocked ? categories.filter(c => c.hit).map(c => `${c.type}(${c.score}分)`).join(', ') : undefined,
      score: maxScore,
      categories,
      source: 'ci'
    };
  }
}

// ============================================================
// 工具函数
// ============================================================

function toAbsolute(p) {
  if (!p) return null;
  if (/^https?:\/\//.test(p)) return null; // 远程URL不需要转换
  if (path.isAbsolute(p)) return p;
  const normalized = String(p).replace(/\\/g, '/').replace(/^storage\//, '');
  return path.resolve(BASE_STORAGE, normalized);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath || '').toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime'
  };
  return map[ext] || 'application/octet-stream';
}

// ============================================================
// 单例导出
// ============================================================

let _instance = null;

module.exports = {
  async getInstance() {
    const cfg = await loadCiConfig();
    if (!_instance || _instance.config !== cfg) {
      _instance = new CiService(cfg);
      _instance.config = cfg;
    }
    return _instance;
  },

  // 兼容旧审核接口
  async reviewFile(fileRow, extraTextList = []) {
    const ci = await this.getInstance();
    if (!ci.enable || !ci.moderationEnable) return null;

    const fileUrl = this._buildFileUrl(fileRow);
    if (!fileUrl) return null;

    // 优先异步审核
    if (ci.moderationAsync) {
      const asyncResult = await ci.moderationImageDetectAsync(fileUrl);
      if (asyncResult) {
        return {
          approved: true, // 异步审核，文件先通过，失败后回调处理
          reason: `CI审核任务已提交: ${asyncResult.jobId}`,
          jobId: asyncResult.jobId,
          source: 'ci_async',
          status: 'pending'
        };
      }
    }

    // 同步审核
    const result = await ci.moderationImageDetect(fileUrl);
    if (result) {
      return {
        approved: result.approved,
        reason: result.reason,
        score: result.score,
        categories: result.categories,
        source: 'ci_sync',
        status: result.status
      };
    }

    return null;
  },

  // 获取 OCR 文字
  async fetchOcrText(fileRow) {
    const ci = await this.getInstance();
    if (!ci.enable || !ci.ocrEnable) return null;

    const fileUrl = this._buildFileUrl(fileRow);
    if (!fileUrl) return null;

    const result = await ci.ocrRecognize(fileUrl);
    if (result && result.fullText) {
      return result.fullText;
    }
    return null;
  },

  _buildFileUrl(fileRow) {
    const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
    const candidate = fileRow.thumbnail_path || fileRow.file_path;
    if (!candidate) return null;

    let abs = toAbsolute(candidate);
    if (!abs) return null;

    // 如果是本地文件，生成 COS key（假设上传到 COS 后会记录 key）
    // 否则直接返回绝对路径的 URL
    const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
    let normalized = candidate.replace(/\\/g, '/');
    if (normalized.startsWith('storage/')) {
      normalized = normalized.substring(8);
    }
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    return `${backendDomain}${normalized}`;
  },

  CiService,

  // 清除配置缓存（供外部调用，如后台更新配置后）
  _clearCache() {
    ciConfigCache = null;
    ciConfigCacheTs = 0;
    _instance = null;
  }
};
