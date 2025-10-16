const crypto = require('crypto')

// 验证码存储（生产环境建议使用Redis）
const verificationCodes = new Map()

// 验证码配置
const CODE_CONFIG = {
  LENGTH: 6,                    // 验证码长度
  EXPIRE_TIME: 5 * 60 * 1000,  // 5分钟有效期
  MAX_ATTEMPTS: 3,              // 最大尝试次数
  RATE_LIMIT: 60 * 1000,       // 1分钟发送间隔
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10分钟清理间隔
  MAX_CODES_PER_EMAIL: 3        // 每个邮箱最多同时存在3个验证码
}

// 生成安全的6位数字验证码
const generateCode = () => {
  // 使用加密安全的随机数生成器
  const randomBytes = crypto.randomBytes(4)
  const randomNumber = randomBytes.readUInt32BE(0)
  
  // 确保生成6位数字（100000-999999）
  const code = (100000 + (randomNumber % 900000)).toString()
  
  // 添加额外的随机性检查
  if (code.length !== 6) {
    // 如果长度不对，使用备用方法
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
  
  return code
}

// 生成验证码ID（用于追踪）
const generateCodeId = () => {
  return crypto.randomUUID()
}

// 生成验证码并存储
const createVerificationCode = (email, type = 'change_email', userId = null) => {
  const code = generateCode()
  const codeId = generateCodeId()
  const key = `${email}_${type}`
  const now = Date.now()
  const expiresAt = now + CODE_CONFIG.EXPIRE_TIME
  
  // 检查该邮箱是否已有太多验证码
  const existingCodes = getCodesForEmail(email, type)
  if (existingCodes.length >= CODE_CONFIG.MAX_CODES_PER_EMAIL) {
    // 删除最旧的验证码
    const oldestCode = existingCodes.reduce((oldest, current) => 
      current.createdAt < oldest.createdAt ? current : oldest
    )
    verificationCodes.delete(`${email}_${type}_${oldestCode.codeId}`)
  }
  
  // 存储验证码信息
  const codeData = {
    codeId,
    code,
    email,
    type,
    userId, // 绑定用户ID
    expiresAt,
    createdAt: now,
    attempts: 0,
    maxAttempts: CODE_CONFIG.MAX_ATTEMPTS,
    used: false,
    ipAddress: null,
    userAgent: null,
    ownershipVerified: false // 所有权验证状态
  }
  
  verificationCodes.set(`${key}_${codeId}`, codeData)
  
  // 清理过期验证码
  cleanupExpiredCodes()
  
  return code
}

// 获取指定邮箱的所有验证码
const getCodesForEmail = (email, type) => {
  const codes = []
  const prefix = `${email}_${type}_`
  
  for (const [key, value] of verificationCodes.entries()) {
    if (key.startsWith(prefix)) {
      codes.push({ ...value, key })
    }
  }
  
  return codes
}

// 验证验证码
const verifyCode = (email, code, type = 'change_email', options = {}) => {
  const { ipAddress, userAgent, userId, username } = options
  const now = Date.now()
  
  // 获取该邮箱的所有验证码
  const codes = getCodesForEmail(email, type)
  
  if (codes.length === 0) {
    return { valid: false, message: '验证码不存在或已过期' }
  }
  
  // 查找匹配的验证码
  let matchedCode = null
  let matchedKey = null
  
  for (const codeData of codes) {
    if (codeData.code === code && !codeData.used) {
      matchedCode = codeData
      matchedKey = codeData.key
      break
    }
  }
  
  if (!matchedCode) {
    // 增加所有验证码的尝试次数
    codes.forEach(codeData => {
      const currentData = verificationCodes.get(codeData.key)
      if (currentData) {
        currentData.attempts++
        verificationCodes.set(codeData.key, currentData)
      }
    })
    
    return { valid: false, message: '验证码错误' }
  }
  
  // 检查验证码是否过期
  if (now > matchedCode.expiresAt) {
    verificationCodes.delete(matchedKey)
    return { valid: false, message: '验证码已过期' }
  }
  
  // 检查是否超过最大尝试次数
  if (matchedCode.attempts >= matchedCode.maxAttempts) {
    verificationCodes.delete(matchedKey)
    return { valid: false, message: '验证码尝试次数过多，已失效' }
  }
  
  // 检查是否已被使用
  if (matchedCode.used) {
    return { valid: false, message: '验证码已被使用' }
  }
  
  // 用户所有权验证（如果提供了userId或username）
  if (userId !== undefined || username !== undefined) {
    const ownershipValid = verifyCodeOwnership(matchedCode, { userId, username, email })
    if (!ownershipValid.valid) {
      matchedCode.attempts++
      verificationCodes.set(matchedKey, matchedCode)
      return { valid: false, message: ownershipValid.message }
    }
    matchedCode.ownershipVerified = true
  }
  
  // 验证成功，标记为已使用并记录使用信息
  matchedCode.used = true
  matchedCode.usedAt = now
  matchedCode.ipAddress = ipAddress
  matchedCode.userAgent = userAgent
  matchedCode.verifiedBy = { userId, username, email }
  
  verificationCodes.set(matchedKey, matchedCode)
  
  // 清理该邮箱的其他验证码（防止重复使用）
  codes.forEach(codeData => {
    if (codeData.key !== matchedKey) {
      verificationCodes.delete(codeData.key)
    }
  })
  
  return { 
    valid: true, 
    message: '验证码正确',
    codeId: matchedCode.codeId,
    expiresAt: matchedCode.expiresAt,
    ownershipVerified: matchedCode.ownershipVerified
  }
}

// 验证验证码所有权
const verifyCodeOwnership = (codeData, verificationInfo) => {
  const { userId, username, email } = verificationInfo
  
  // 如果验证码绑定了用户ID，检查是否匹配
  if (codeData.userId && userId !== undefined) {
    if (codeData.userId !== userId) {
      return { 
        valid: false, 
        message: '验证码不属于当前用户，无法使用' 
      }
    }
  }
  
  // 对于忘记密码场景，需要验证用户名和邮箱的匹配
  if (codeData.type === 'forgot_password') {
    if (username && email) {
      // 这里需要查询数据库验证用户名和邮箱是否匹配
      // 由于这是服务层，我们返回一个标记，让调用方进行数据库验证
      return { 
        valid: true, 
        message: '需要数据库验证用户名和邮箱匹配',
        requiresDbVerification: true
      }
    }
  }
  
  // 对于更改邮箱场景，验证码只能由邮箱所有者使用
  if (codeData.type === 'change_email') {
    if (codeData.email !== email) {
      return { 
        valid: false, 
        message: '验证码只能由邮箱所有者使用' 
      }
    }
  }
  
  // 对于注册验证场景，验证码只能用于指定邮箱
  if (codeData.type === 'verify_email') {
    if (codeData.email !== email) {
      return { 
        valid: false, 
        message: '验证码只能用于指定邮箱' 
      }
    }
  }
  
  return { valid: true, message: '所有权验证通过' }
}

// 获取用户的所有验证码
const getCodesForUser = (userId, type) => {
  const codes = []
  
  for (const [key, value] of verificationCodes.entries()) {
    if (value.userId === userId && value.type === type) {
      codes.push({ ...value, key })
    }
  }
  
  return codes
}

// 清理用户的所有验证码
const clearCodesForUser = (userId, type) => {
  const codes = getCodesForUser(userId, type)
  codes.forEach(codeData => {
    verificationCodes.delete(codeData.key)
  })
  
  return codes.length
}

// 检查发送频率限制
const checkRateLimit = (email, type = 'change_email') => {
  const key = `${email}_${type}_rate`
  const now = Date.now()
  const lastSent = verificationCodes.get(key)
  
  if (lastSent && (now - lastSent) < CODE_CONFIG.RATE_LIMIT) {
    const remainingTime = Math.ceil((CODE_CONFIG.RATE_LIMIT - (now - lastSent)) / 1000)
    return { allowed: false, remainingTime }
  }
  
  // 记录发送时间
  verificationCodes.set(key, now)
  return { allowed: true }
}

// 清理过期验证码
const cleanupExpiredCodes = () => {
  const now = Date.now()
  const keysToDelete = []
  
  for (const [key, value] of verificationCodes.entries()) {
    // 清理过期的验证码
    if (value.expiresAt && now > value.expiresAt) {
      keysToDelete.push(key)
    }
    
    // 清理过期的频率限制记录
    if (typeof value === 'number' && now - value > CODE_CONFIG.RATE_LIMIT) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => verificationCodes.delete(key))
  
  if (keysToDelete.length > 0) {
    console.log(`清理了 ${keysToDelete.length} 个过期的验证码记录`)
  }
}

// 获取验证码统计信息
const getCodeStats = (email, type) => {
  const codes = getCodesForEmail(email, type)
  const now = Date.now()
  
  const stats = {
    total: codes.length,
    active: codes.filter(code => !code.used && now < code.expiresAt).length,
    expired: codes.filter(code => now >= code.expiresAt).length,
    used: codes.filter(code => code.used).length,
    maxAttemptsReached: codes.filter(code => code.attempts >= code.maxAttempts).length
  }
  
  return stats
}

// 手动清理指定邮箱的所有验证码
const clearCodesForEmail = (email, type) => {
  const codes = getCodesForEmail(email, type)
  codes.forEach(codeData => {
    verificationCodes.delete(codeData.key)
  })
  
  // 清理频率限制记录
  verificationCodes.delete(`${email}_${type}_rate`)
  
  return codes.length
}

// 设置定期清理任务
let cleanupInterval = null

const startCleanupTask = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = setInterval(() => {
    cleanupExpiredCodes()
  }, CODE_CONFIG.CLEANUP_INTERVAL)
  
  console.log('验证码清理任务已启动')
}

const stopCleanupTask = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
    console.log('验证码清理任务已停止')
  }
}

module.exports = {
  createVerificationCode,
  verifyCode,
  checkRateLimit,
  getCodeStats,
  clearCodesForEmail,
  cleanupExpiredCodes,
  startCleanupTask,
  stopCleanupTask,
  verifyCodeOwnership,
  getCodesForUser,
  clearCodesForUser,
  CODE_CONFIG
}

