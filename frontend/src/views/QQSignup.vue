<template>
  <div class="login-container qq-signup">
    <!-- 顶部导航（与登录一致风格） -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
      </div>
    </div>

    <div class="login-content">
      <div class="login-box signup-card">
      <div class="qq-profile" v-if="qq.nickname || qq.avatar">
        <el-avatar :size="56" :src="qq.avatar">Q</el-avatar>
        <div class="qq-info">
          <div class="title">QQ 用户注册</div>
          <div class="sub">欢迎，{{ qq.nickname || 'QQ用户' }}</div>
        </div>
      </div>

        <div class="form-inner">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <div class="row-inline">
            <el-input v-model="form.username" placeholder="请输入用户名，支持中文" />
            <el-button v-if="qq.nickname" @click="useQQNickname" class="use-qq-btn" type="default">使用QQ昵称</el-button>
          </div>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" show-password type="password" placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" show-password type="password" placeholder="再次输入密码" />
        </el-form-item>
        <el-form-item label="绑定邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="emailCode">
          <div class="row-inline code-row">
            <el-input v-model="form.emailCode" maxlength="6" placeholder="6位验证码" />
            <el-button class="send-code-btn" :loading="sending" @click="sendCode">发送验证码</el-button>
          </div>
        </el-form-item>
        <el-form-item prop="agree">
          <el-checkbox v-model="form.agree" class="agreement-checkbox">
            我已阅读并同意
            <el-button type="text" class="terms-link" @click="openTerms">《用户协议》</el-button>
            和
            <el-button type="text" class="terms-link" @click="openPrivacy">《隐私政策》</el-button>
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">完成注册</el-button>
        </el-form-item>
        </el-form>
        </div>
      </div>

      <!-- 右侧信息面板（复用登录布局） -->
      <div class="info-panel">
        <div class="panel-content">
          <h2 class="panel-title">完善账户信息</h2>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon class="feature-icon"><Upload /></el-icon>
              <div class="feature-content">
                <h3>绑定邮箱</h3>
                <p>用于找回密码与安全通知，请确保可用</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><View /></el-icon>
              <div class="feature-content">
                <h3>强密码</h3>
                <p>建议至少 8 位，混合字母数字，提升安全性</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Platform /></el-icon>
              <div class="feature-content">
                <h3>协议与隐私</h3>
                <p>注册前请认真阅读并同意相关条款</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰（与登录同风格） -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { useEmailCode } from '@/composables/useEmailCode'
import { Picture, Upload, View, Platform } from '@element-plus/icons-vue'

const formRef = ref()
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
  agree: false
})
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度2-20个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: '仅限中文/字母/数字/下划线/空格', trigger: 'blur' }
  ],
  password: [ { required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' } ],
  confirmPassword: [ { validator: (_: any, v: string, cb: any) => { v !== form.value.password ? cb(new Error('两次密码不一致')) : cb() }, trigger: 'blur' } ],
  email: [ { required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' } ],
  emailCode: [ { required: true, message: '请输入验证码', trigger: 'blur' }, { min: 6, max: 6, message: '6位验证码', trigger: 'blur' } ],
  agree: [ { validator: (_: any, v: boolean, cb: any) => { !v ? cb(new Error('请先同意协议')) : cb() }, trigger: 'change' } ]
}

// GeeTest v4（bind 模式）集成 - 提前定义，供组合函数使用
const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js'
const geetestCaptchaId = (((import.meta as any).env?.VITE_GEETEST_CAPTCHA_ID as string) || '7922d406fb215d02770d5a4cd71af066')
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
      initGeetest4({
        captchaId: geetestCaptchaId,
        product: 'bind',
        language: 'zho',
        mask: { outside: true, bgColor: '#0000004d' },
        timeout: 15000
      }, (handler: any) => {
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

const verifyHuman = async (): Promise<boolean> => {
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
        
        // 添加调试信息
        console.log('GeeTest验证参数:', validate)
        
        const { lot_number, captcha_output, pass_token, gen_time } = validate
        
        // 检查必要参数是否存在
        if (!lot_number || !captcha_output || !pass_token || !gen_time) {
          console.error('验证码参数缺失:', { lot_number, captcha_output, pass_token, gen_time })
          ElMessage.error('验证码参数不完整，请重新验证')
          return resolve(false)
        }
        
        const resp = await api.post('/auth/captcha/validate', {
          lot_number, captcha_output, pass_token, gen_time, captcha_id: geetestCaptchaId
        })
        
        console.log('验证码验证响应:', resp.data)
        
        if (resp?.data?.success || resp?.data?.result === 'success') return resolve(true)
        ElMessage.error(resp?.data?.message || resp?.data?.reason || '人机验证失败')
        resolve(false)
      } catch (e: any) {
        console.error('验证码验证异常:', e)
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

const sending = ref(false)
const { emailCodeCooldown, startEmailCodeCooldown, sendEmailCodeWithHuman } = useEmailCode({ defaultCooldownSeconds: 60, runHuman: verifyHuman })
const submitting = ref(false)
const tempToken = ref('')
const qq = ref({ nickname: '', avatar: '' })

onMounted(() => {
  const url = new URL(window.location.href)
  tempToken.value = url.searchParams.get('token') || ''
  qq.value.nickname = url.searchParams.get('nickname') || ''
  qq.value.avatar = url.searchParams.get('avatar') || ''
})

const useQQNickname = () => {
  if (qq.value.nickname) form.value.username = qq.value.nickname
}

const sendCode = async () => {
  if (!form.value.email) { ElMessage.warning('请先填写邮箱'); return }
  try {
    sending.value = true
    const ok = await sendEmailCodeWithHuman(form.value.email, 'verify_email')
    if (ok) startEmailCodeCooldown(60)
  } finally { sending.value = false }
}

const submit = async () => {
  try {
    await (formRef.value as any).validate()
  } catch { return }
  try {
    submitting.value = true
    const res = await api.post('/auth/qq/complete-signup', {
      tempToken: tempToken.value,
      username: form.value.username,
      password: form.value.password,
      email: form.value.email,
      emailCode: form.value.emailCode,
      acceptAgreements: form.value.agree
    })
    if (res.data?.success) {
      localStorage.setItem('token', res.data.token)
      ElMessage.success('注册并登录成功，正在跳转...')
      setTimeout(() => { window.location.href = '/' }, 800)
    } else {
      ElMessage.error(res.data?.message || '提交失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '提交失败')
  } finally { submitting.value = false }
}

const openTerms = () => { window.open('/terms', '_blank') }
const openPrivacy = () => { window.open('/privacy', '_blank') }
</script>

<style scoped>
/* 复用登录页整体布局类名，采用黑白灰+浮动装饰 */
.login-container { min-height: 100vh; display:flex; flex-direction:column; position:relative; background: linear-gradient(135deg, #0f1115 0%, #141820 100%); }
.top-nav { padding: 16px 24px; }
.nav-content { display:flex; align-items:center; justify-content:space-between; }
.nav-logo { display:flex; align-items:center; gap:10px; color:#e5e7eb; }
.logo-icon { color:#e5e7eb; font-size:20px; }
.logo-text { font-weight:600; letter-spacing:0.5px; }

.login-content { display:flex; align-items:center; justify-content:center; gap:24px; max-width:1200px; width:100%; margin: 24px auto; padding: 0 16px; min-height: calc(100vh - 120px); }
.login-box { width: clamp(420px, 40%, 620px); flex: 0 0 auto; background: rgba(17,19,23,0.98); border:1px solid #272b34; border-radius:16px; padding:24px; color:#e5e7eb; box-shadow: 0 14px 38px rgba(0,0,0,0.35); }
.form-inner { width: 100%; max-width: 520px; margin: 0 auto; }
.form-inner :deep(.el-form-item__content) { width: 100%; }
.form-inner :deep(.el-input),
.form-inner :deep(.el-input__wrapper) { width: 100%; }
.signup-card :deep(.el-form-item__label) { color:#9ca3af; }
.info-panel { display:none; }
@media (min-width: 1024px) { .info-panel { display:block; flex: 0 0 380px; }
  .panel-content { background:#111317; border:1px solid #1f232b; border-radius:16px; padding:24px; color:#e5e7eb; height:100%; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
  .panel-title { margin:0 0 8px 0; font-weight:600; }
  .feature-list { display:flex; flex-direction:column; gap:16px; }
  .feature-item { display:flex; gap:12px; align-items:flex-start; }
  .feature-icon { color:#9ca3af; }
}

.qq-profile { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.qq-info .title { font-size:20px; font-weight:600; color:#f3f4f6; }
.qq-info .sub { font-size:13px; color:#9ca3af; }
.row-inline { display:flex; gap:8px; align-items:center; width:100%; }
.code-row > :deep(.el-input) { flex: 1 1 auto; }
/* 统一两个按钮的样式与尺寸 */
.send-code-btn,
.use-qq-btn {
  flex: 0 0 128px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #2a2f3a;
  background: #0f1115;
  color: #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}
.send-code-btn:hover,
.use-qq-btn:hover {
  border-color: #343a46;
  background: #131721;
}
.send-code-btn:focus,
.use-qq-btn:focus { outline: none; }
.agreement-checkbox { color:#9ca3af; padding: 0; margin: 0; line-height: 1.2; font-size: 13px; }
.agreement-checkbox :deep(.el-checkbox__input) { margin-right: 6px; }
.agreement-checkbox :deep(.el-checkbox__label) { padding-left: 0; }
.terms-link { padding:0; margin: 0 2px; }

.bg-decoration { position:fixed; inset:0; pointer-events:none; }
.floating-shape { position:absolute; width:220px; height:220px; border-radius:50%; filter: blur(40px); opacity:0.15; animation: float 10s ease-in-out infinite; }
.shape-1 { background:#6366f1; top:8%; left:6%; }
.shape-2 { background:#22d3ee; bottom:10%; right:8%; animation-delay: -2s; }
.shape-3 { background:#10b981; top:50%; right:20%; animation-delay: -4s; }
.shape-4 { background:#f59e0b; bottom:22%; left:18%; animation-delay: -6s; }
@keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-12px) } 100% { transform: translateY(0) } }

/* 响应式（以登录页为模板） */
@media (max-width: 1280px) {
  .login-content { gap: 20px; padding: 0 12px; }
  .login-box { flex-basis: 560px; }
  .form-inner { max-width: 500px; }
}
@media (max-width: 1024px) {
  .login-content { flex-direction: column; align-items: center; gap: 16px; }
  .login-box { flex-basis: auto; width: 100%; max-width: 720px; }
  .form-inner { width: 85%; max-width: 560px; }
  .info-panel { display: none !important; }
  .floating-shape { width: 180px; height: 180px; filter: blur(36px); }
}
@media (max-width: 768px) {
  .top-nav { padding: 12px 14px; }
  .login-content { margin: 16px auto; padding: 0 10px; }
  .login-box { padding: 18px; border-radius: 14px; }
  .form-inner { width: 100%; max-width: 100%; }
  .qq-profile .title { font-size: 18px; }
  .qq-profile .sub { font-size: 12px; }
  .row-inline { gap: 6px; }
  .agreement-checkbox { font-size: 12px; }
  .terms-link { margin: 0 1px; }
  .send-code-btn, .use-qq-btn { flex-basis: 120px; height: 34px; font-size: 13px; }
  .floating-shape { width: 150px; height: 150px; filter: blur(32px); opacity: 0.12; }
}
@media (max-width: 480px) {
  .login-box { padding: 14px; border-radius: 12px; }
  .form-inner { max-width: 100%; }
  .send-code-btn, .use-qq-btn { flex-basis: 112px; height: 32px; font-size: 12px; padding: 0 10px; }
  .row-inline { gap: 6px; }
  .agreement-checkbox { font-size: 12px; line-height: 1.15; }
  .agreement-checkbox :deep(.el-checkbox__input) { margin-right: 4px; }
  .logo-text { display: none; }
  .floating-shape { display: none; }
}
</style>


