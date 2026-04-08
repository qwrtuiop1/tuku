/**
 * 腾讯云 COS STS 临时密钥服务
 * 用于生成多用户隔离的临时访问凭证
 *
 * 简化模式：使用永久密钥直接签名，前端通过此凭证上传
 *
 * 文档: https://cloud.tencent.com/document/product/参考
 */

const crypto = require('crypto');

// STS 配置（环境变量）
function getStsConfig() {
  return {
    secretId: process.env.CI_SECRET_ID || '',
    secretKey: process.env.CI_SECRET_KEY || '',
    bucket: process.env.CI_BUCKET || '',
    region: process.env.CI_REGION || 'ap-guangzhou',
    durationSeconds: parseInt(process.env.COS_STS_DURATION || '7200', 10)
  };
}

/**
 * 生成临时凭证
 * 使用永久密钥直接签名，前端通过此凭证上传到 COS
 *
 * @param {Object} options 配置选项
 * @param {string} options.userId 用户ID
 * @param {Array} options.allowActions 允许的操作列表
 * @param {number} options.durationSeconds 有效期（秒）
 * @returns {Object} 临时凭证
 */
function generateTempCredential(options = {}) {
  const {
    userId = 'default',
    allowActions = ['cos:PutObject', 'cos:GetObject', 'cos:DeleteObject', 'cos:HeadObject'],
    durationSeconds = 7200
  } = options;

  const config = getStsConfig();

  if (!config.secretId || !config.secretKey) {
    throw new Error('CI_SECRET_ID 和 CI_SECRET_KEY 必须配置');
  }

  // 构建资源路径
  const resourcePath = `users/user_${userId}`;

  // 有效期
  const now = Math.floor(Date.now() / 1000);
  const expiredTime = now + durationSeconds;

  return {
    // 凭证信息
    tmpSecretId: config.secretId,
    tmpSecretKey: config.secretKey,
    sessionToken: '', // 简化模式下为空

    // 有效期
    expiredTime,
    startTime: now,

    // COS 配置
    bucket: config.bucket,
    region: config.region,

    // 路径限制
    uploadPath: resourcePath,
    allowPrefix: `${resourcePath}/*`,

    // 允许的操作
    allowActions
  };
}

/**
 * 生成访问签名 URL
 * 用于私有读写桶的文件访问
 *
 * @param {string} cosKey COS 对象路径
 * @param {number} expiresIn 有效期（秒）
 * @returns {string} 带签名的访问 URL
 */
function generateSignedUrl(cosKey, expiresIn = 7200) {
  const config = getStsConfig();

  if (!config.secretId || !config.secretKey) {
    throw new Error('CI_SECRET_ID 和 CI_SECRET_KEY 必须配置');
  }

  const expiredTime = Math.floor(Date.now() / 1000) + expiresIn;
  const signTime = `${Math.floor(Date.now() / 1000)}-${expiredTime}`;

  // URL 签名算法
  const urlString = `GET\n/${cosKey}\n\nhost=${config.bucket}.cos.${config.region}.myqcloud.com\n`;
  const signature = crypto.createHmac('sha1', config.secretKey)
    .update(urlString)
    .digest('hex');

  const signParams = [
    `q-sign-algorithm=sha1`,
    `q-ak=${config.secretId}`,
    `q-sign-time=${signTime}`,
    `q-key-time=${signTime}`,
    `q-header-list=host`,
    `q-url-param-list=`,
    `q-signature=${signature}`
  ].join('&');

  return `https://${config.bucket}.cos.${config.region}.myqcloud.com/${cosKey}?${signParams}`;
}

/**
 * 验证 COS Key 是否属于指定用户
 * 用于安全检查，确保用户只能操作自己的文件
 *
 * @param {string} cosKey COS 对象路径
 * @param {string} userId 用户ID
 * @returns {boolean} 是否合法
 */
function validateCosKey(cosKey, userId) {
  if (!cosKey || !userId) return false;

  // 标准化路径
  const normalizedKey = cosKey.replace(/^\/+/, '');

  // 检查是否匹配用户目录
  const expectedPrefix = `users/user_${userId}`;
  return normalizedKey.startsWith(expectedPrefix + '/') || normalizedKey === expectedPrefix;
}

/**
 * 获取 COS 配置信息
 */
function getCosConfig() {
  const config = getStsConfig();

  return {
    bucket: config.bucket,
    region: config.region,
    host: `https://${config.bucket}.cos.${config.region}.myqcloud.com`,
    enable: !!(config.secretId && config.secretKey)
  };
}

module.exports = {
  getStsConfig,
  generateTempCredential,
  generateSignedUrl,
  validateCosKey,
  getCosConfig
};
