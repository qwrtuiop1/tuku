const axios = require('axios')
const crypto = require('crypto')

class GeetestService {
  constructor() {
    this.captchaId = process.env.GEETEST_CAPTCHA_ID || ''
    this.captchaKey = process.env.GEETEST_CAPTCHA_KEY || ''
    this.validateUrl = 'https://gcaptcha4.geetest.com/validate'
  }

  isConfigured() {
    return !!(this.captchaId && this.captchaKey)
  }
  isOfflineAllowed() {
    return String(process.env.GEETEST_OFFLINE_ALLOW || '').toLowerCase() === 'true'
  }

  // v4 二次校验
  async validateSecondary(payload) {
    if (!this.isConfigured()) {
      throw new Error('Geetest 未配置')
    }

    const { lot_number, captcha_output, pass_token, gen_time } = payload || {}
    if (!lot_number || !captcha_output || !pass_token || !gen_time) {
      // 离线放行（可配置）
      if (this.isOfflineAllowed()) {
        return { success: true, result: 'success', reason: 'offline_skip_no_params' }
      }
      return { success: false, result: 'fail', reason: 'missing_params' }
    }

    try {
      // v4 规范：服务端使用 captcha_key 对 lot_number 做 HMAC-SHA256 生成签名
      const serverSignToken = crypto
        .createHmac('sha256', this.captchaKey)
        .update(String(lot_number), 'utf8')
        .digest('hex')

      const form = new URLSearchParams({
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
        sign_token: serverSignToken,
        captcha_id: this.captchaId
      })

      const resp = await axios.post(this.validateUrl, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000
      })

      // 期望返回 { result: 'success' | 'fail', ... }
      const data = resp.data || {}
      const ok = data.result === 'success'
      return { success: ok, ...data }
    } catch (e) {
      if (this.isOfflineAllowed()) {
        return { success: true, result: 'success', reason: 'offline_pass_request_error' }
      }
      return { success: false, result: 'fail', reason: 'request_error', error: e.message }
    }
  }
}

module.exports = new GeetestService()


