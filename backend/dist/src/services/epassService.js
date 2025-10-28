const axios = require('axios')

class EPassService {
  constructor() {
    // 使用环境变量，若未配置则回退到提供的默认值，避免生产因缺省报500
    this.clientId = process.env.EPASS_CLIENT_ID || 'euser-gallery'
    this.clientSecret = process.env.EPASS_CLIENT_SECRET || '431b48012c774f789229fda207b47e4d'
    this.userinfoUrl = process.env.EPASS_USERINFO_URL || 'https://accountapi.emoera.com/api/oauth2/userinfo'
  }

  validateConfig() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('EPass 配置不完整，请配置 EPASS_CLIENT_ID 与 EPASS_CLIENT_SECRET')
    }
    return true
  }

  async getUserInfo(accessToken) {
    this.validateConfig()
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      access_token: accessToken
    })
    const url = `${this.userinfoUrl}?${params.toString()}`
    try {
      const { data } = await axios.get(url, { timeout: 15000 })
      if (data?.code !== 200 || !data?.data) {
        const msg = data?.message || '获取EPass用户信息失败'
        throw new Error(msg)
      }
      const u = data.data
      return {
        epassId: u.id,
        username: u.username || '',
        avatar: u.avatar || '',
        email: u.email || '',
        raw: u
      }
    } catch (err) {
      // 规范化错误，包含上下文，便于日志排查
      const message = err?.response?.data?.message || err?.message || 'EPass用户信息请求失败'
      const status = err?.response?.status
      const detail = typeof err?.response?.data === 'object' ? JSON.stringify(err.response.data) : ''
      throw new Error(`[EPassUserInfoError${status ? ' ' + status : ''}] ${message}${detail ? ' - ' + detail : ''}`)
    }
  }
}

module.exports = new EPassService()


