const axios = require('axios')

class EPassService {
  constructor() {
    this.clientId = process.env.EPASS_CLIENT_ID || 'euser-gallery'
    this.clientSecret = process.env.EPASS_CLIENT_SECRET || ''
    this.userinfoUrl = 'https://accountapi.emoera.com/api/oauth2/userinfo'
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
    const { data } = await axios.get(url, { timeout: 15000 })
    if (data?.code !== 200 || !data?.data) {
      throw new Error(data?.message || '获取EPass用户信息失败')
    }
    const u = data.data
    return {
      epassId: u.id,
      username: u.username || '',
      avatar: u.avatar || '',
      email: u.email || '',
      raw: u
    }
  }
}

module.exports = new EPassService()


