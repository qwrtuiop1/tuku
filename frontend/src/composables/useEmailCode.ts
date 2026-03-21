import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

type CodeType = 'verify_email' | 'change_email' | 'forgot_password' | 'password_change'

interface UseEmailCodeOptions {
  runHuman?: () => Promise<boolean>
  defaultCooldownSeconds?: number
}

export function useEmailCode(options?: UseEmailCodeOptions) {
  const isSending = ref(false)
  const emailCodeCooldown = ref(0)
  let cooldownTimer: NodeJS.Timeout | null = null

  const startEmailCodeCooldown = (seconds = options?.defaultCooldownSeconds ?? 60) => {
    if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null }
    emailCodeCooldown.value = seconds
    cooldownTimer = setInterval(() => {
      emailCodeCooldown.value--
      if (emailCodeCooldown.value <= 0) {
        if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null }
        emailCodeCooldown.value = 0
      }
    }, 1000)
  }

  const clearEmailCodeCooldown = () => {
    if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null }
    emailCodeCooldown.value = 0
  }

  // 内置 GeeTest v4（仅在未提供外部 runHuman 时使用）
  const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js'
  const geetestCaptchaId = (((import.meta as any).env?.VITE_GEETEST_CAPTCHA_ID as string) || '30d77075542cc161d6518051a937b9a0')
  let geetestHandler: any = null
  const geetestReady = ref(false)
  const geetestMaxWaitMs = 12000

  const loadScriptOnce = (src: string) => new Promise<void>((resolve, reject) => {
    const exists = Array.from(document.scripts).some(s => s.src === src)
    if (exists) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('geetest script load failed'))
    document.head.appendChild(s)
  })

  const ensureGeetest = async (): Promise<boolean> => {
    if (!geetestCaptchaId) return false
    if (geetestReady.value && geetestHandler) return true
    await loadScriptOnce(geetestScriptUrl)
    const initGeetest4: any = (window as any).initGeetest4
    if (!initGeetest4) return false
    return await new Promise<boolean>((resolve) => {
      try {
        initGeetest4({ captchaId: geetestCaptchaId, product: 'bind', language: 'zho', timeout: 15000 }, (handler: any) => {
          geetestHandler = handler
          geetestReady.value = !!handler
          try { geetestHandler?.onReady?.(() => {}) } catch {}
          resolve(geetestReady.value)
        })
      } catch {
        resolve(false)
      }
    })
  }

  const internalRunHuman = async (): Promise<boolean> => {
    if (!geetestCaptchaId) return true
    const ok = await ensureGeetest()
    if (!ok || !geetestHandler) return false
    return await new Promise<boolean>((resolve) => {
      let settled = false
      const onSuccess = async () => {
        if (settled) return
        settled = true
        try {
          const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null
          if (!validate) { ElMessage.error('请完成人机验证'); return resolve(false) }
          const { lot_number, captcha_output, pass_token, gen_time } = validate
          const resp = await api.post('/auth/captcha/validate', {
            lot_number, captcha_output, pass_token, gen_time, captcha_id: geetestCaptchaId
          })
          if (resp?.data?.success || resp?.data?.result === 'success') return resolve(true)
          ElMessage.error(resp?.data?.message || '人机验证失败')
          resolve(false)
        } catch {
          ElMessage.error('人机验证服务异常，请稍后重试')
          resolve(false)
        }
      }
      try {
        geetestHandler?.onSuccess?.(onSuccess)
        geetestHandler?.onError?.(() => { if (!settled) { settled = true; ElMessage.error('人机验证出错'); resolve(false) } })
        geetestHandler?.onClose?.(() => { if (!settled) { settled = true; ElMessage.warning('请先完成人机验证'); resolve(false) } })
        if (geetestHandler.showCaptcha) geetestHandler.showCaptcha()
        else if (geetestHandler.showBox) geetestHandler.showBox()
        setTimeout(() => { if (!settled) { settled = true; ElMessage.warning('验证超时，请重试'); resolve(false) } }, geetestMaxWaitMs)
      } catch {
        resolve(false)
      }
    })
  }

  const runHuman = async () => {
    if (options?.runHuman) return await options.runHuman()
    return await internalRunHuman()
  }

  const sendEmailCodeWithHuman = async (email: string, type: CodeType): Promise<boolean> => {
    if (!email) { ElMessage.warning('请先输入邮箱'); return false }
    const humanOk = await runHuman()
    if (!humanOk) return false
    try {
      isSending.value = true
      const resp = await api.post('/auth/send-email-code', { email, type })
      if (resp.data?.success) {
        ElMessage.success('验证码已发送到邮箱')
        startEmailCodeCooldown(60)
        return true
      }
      ElMessage.error(resp.data?.message || '发送失败')
      return false
    } catch (e: any) {
      if (e?.response?.status === 429) {
        ElMessage.error('操作过于频繁，请稍后再试')
        startEmailCodeCooldown(60)
      } else {
        ElMessage.error(e?.response?.data?.message || '发送失败')
      }
      return false
    } finally {
      isSending.value = false
    }
  }

  return {
    // state
    isSending,
    emailCodeCooldown,
    // actions
    startEmailCodeCooldown,
    clearEmailCodeCooldown,
    sendEmailCodeWithHuman,
    runHuman,
  }
}


