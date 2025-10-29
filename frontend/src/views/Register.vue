<template>
  <div class="register-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
        
      </div>
    </div>

    <div class="register-content">
      <div class="register-box">
        <div class="register-header">
          <div class="header-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h1 class="register-title">创建账户</h1>
          <p class="register-subtitle">注册新账户，开始您的文件管理之旅</p>
        </div>
        
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              size="large"
              :prefix-icon="Message"
              clearable
              class="custom-input"
            />
            <!-- 邮箱验证码区域 -->
            <transition name="fade-up-soft" appear>
            <div v-if="registerForm.email" class="email-verification-section">
              <div id="geetest-box" class="geetest-box"></div>
              <div class="verification-input-row">
                <el-input 
                  v-model="emailCode"
                  placeholder="请输入6位验证码"
                  class="email-code-input"
                  maxlength="6"
                  size="large"
                />
                <el-button 
                  type="primary" 
                  size="large"
                  :disabled="emailCodeCooldown > 0"
                  @click="sendEmailCode"
                  class="send-code-btn same-height"
                >
                  {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s` : '发送验证码' }}
                </el-button>
              </div>
              <div v-if="showEmailCodeInput" class="code-tips">
                <span class="code-timer">验证码有效期：{{ codeExpireTime }}s</span>
                <el-button type="text" @click="resendEmailCode" :disabled="emailCodeCooldown > 0">
                  {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s后重发` : '重新发送' }}
                </el-button>
              </div>
            </div>
            </transition>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
              @input="checkPasswordStrength"
            />
            <!-- 密码强度提示 -->
            <transition name="fade-up-soft" appear>
            <div v-if="registerForm.password" class="password-hint">
              <div class="password-strength">
                <span class="strength-label">密码强度：</span>
                <span :class="['strength-level', passwordStrength.level]">
                  {{ passwordStrength.text }}
                </span>
              </div>
              <div v-if="passwordStrength.hints.length > 0" class="password-requirements">
                <div class="requirement-title">密码要求：</div>
                <ul class="requirement-list">
                  <li v-for="hint in passwordStrength.hints" :key="hint" class="requirement-item">
                    {{ hint }}
                  </li>
                </ul>
              </div>
            </div>
            </transition>
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          
          <el-form-item class="agreement-row">
            <el-checkbox v-model="agreeTerms" class="agreement-checkbox">
              我已阅读并同意
              <el-button type="text" class="terms-link">《用户协议》</el-button>
              和
              <el-button type="text" class="terms-link">《隐私政策》</el-button>
            </el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="authStore.loading"
              :disabled="!agreeTerms"
              @click="handleRegister"
            >
              <el-icon v-if="!authStore.loading"><Right /></el-icon>
              {{ authStore.loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-divider">
          <span class="divider-text">或</span>
        </div>
        
        <div class="social-register">
          <el-button class="social-btn qq-btn" @click="handleQQLogin">
            <el-icon><User /></el-icon>
            QQ注册
          </el-button>
          <el-button class="social-btn wechat-btn" @click="handleEPassLogin">
            <el-icon><User /></el-icon>
            微信注册
          </el-button>
        </div>
        
        <div class="register-footer">
          <p class="login-link">
            已有账户？
            <router-link to="/login" class="link">
              <el-icon><User /></el-icon>
              立即登录
            </router-link>
          </p>
        </div>
      </div>
      
      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="panel-content">
          <h2 class="panel-title">加入图库系统</h2>
          <div class="benefit-list">
            <div class="benefit-item">
              <el-icon class="benefit-icon"><Upload /></el-icon>
              <div class="benefit-content">
                <h3>免费存储空间</h3>
                <p>注册即获得1GB免费存储空间，满足日常使用需求</p>
              </div>
            </div>
            <div class="benefit-item">
              <el-icon class="benefit-icon"><Folder /></el-icon>
              <div class="benefit-content">
                <h3>智能文件管理</h3>
                <p>自动分类整理，快速查找，让文件管理变得简单</p>
              </div>
            </div>
            <div class="benefit-item">
              <el-icon class="benefit-icon"><Link /></el-icon>
              <div class="benefit-content">
                <h3>便捷分享功能</h3>
                <p>一键生成分享链接，轻松与他人分享您的文件</p>
              </div>
            </div>
            <div class="benefit-item">
              <el-icon class="benefit-icon"><Lock /></el-icon>
              <div class="benefit-content">
                <h3>安全保障</h3>
                <p>企业级安全防护，您的文件隐私得到充分保护</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  User, 
  Message, 
  Lock, 
  Right, 
  UserFilled, 
  Upload, 
  Folder,
  Link,
  Picture,
  QuestionFilled,
  InfoFilled,
  StarFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'
import { isValidEmail, isValidUsername } from '@/utils/helpers'
import { useEmailCode } from '@/composables/useEmailCode'

const router = useRouter()
const authStore = useAuthStore()

// 移动端检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const agreeTerms = ref(false)

// 密码强度检查
const passwordStrength = reactive({
  level: 'weak',
  text: '弱',
  hints: [] as string[]
})

// 邮箱验证码相关
const emailCode = ref('')
const showEmailCodeInput = ref(false)
const { emailCodeCooldown, startEmailCodeCooldown, sendEmailCodeWithHuman } = useEmailCode({ defaultCooldownSeconds: 60, runHuman: runHumanVerification })
const codeExpireTime = ref(0)
const codeExpireTimer = ref<NodeJS.Timeout | null>(null)

// GeeTest v4 人机验证
type AnyFn = (...args: any[]) => any
const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js'
const geetestCaptchaId = ((import.meta.env as any).VITE_GEETEST_CAPTCHA_ID as string) || '7922d406fb215d02770d5a4cd71af066'
const geetestReady = ref(false)
let geetestHandler: any = null
const geetestMaxWaitMs = 12000

const loadScriptOnce = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src=\"${src}\"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('geetest script load failed'))
    document.head.appendChild(s)
  })
}

const ensureGeetest = async (): Promise<boolean> => {
  if (!geetestCaptchaId) return false
  if (geetestReady.value && geetestHandler) return true
  await loadScriptOnce(geetestScriptUrl)
  const initGeetest4: AnyFn | undefined = (window as any).initGeetest4
  if (!initGeetest4) return false
  return new Promise<boolean>((resolve) => {
    try {
      initGeetest4({
        captchaId: geetestCaptchaId,
        product: 'bind',
        riskType: 'verify',
        language: 'zho',
        protocol: 'https://',
        timeout: 30000
      }, (handler: any) => {
        geetestHandler = handler
        geetestReady.value = !!handler
        // 调试日志：监听极验事件
        try {
          if (geetestHandler?.onReady) geetestHandler.onReady(() => console.log('[GeeTest] ready'))
          if (geetestHandler?.onSuccess) geetestHandler.onSuccess(() => {
            const v = geetestHandler?.getValidate ? geetestHandler.getValidate() : null
            console.log('[GeeTest] success', v)
          })
          if (geetestHandler?.onError) geetestHandler.onError((err: any) => console.log('[GeeTest] error', err))
          if (geetestHandler?.onClose) geetestHandler.onClose(() => console.log('[GeeTest] close'))
        } catch {}
        
        resolve(geetestReady.value)
      })
    } catch (_) {
      resolve(false)
    }
  })
}

async function runHumanVerification(): Promise<boolean> {
  if (!geetestCaptchaId) return true
  const ok = await ensureGeetest()
  if (!ok || !geetestHandler) return false
  return new Promise<boolean>((resolve) => {
    let settled = false
    let popupShown = false
    // 轻提示：正在拉起
    try { ElMessage.info('正在拉起人机验证...', { duration: 1200 }) } catch {}
    const onSuccess = async () => {
      try {
        const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null
        if (!validate) return resolve(false)
        const { lot_number, captcha_output, pass_token, gen_time } = validate
        const resp = await api.post('/auth/captcha/validate', {
          lot_number,
          captcha_output,
          pass_token,
          gen_time,
          sign_token: validate.sign_token,
          captcha_id: geetestCaptchaId
        })
        settled = true
        resolve(resp.data?.success === true)
      } catch (e) {
        settled = true
        try { ElMessage.error('二次校验失败，请重试') } catch {}
        resolve(false)
      }
    }
    if (geetestHandler.onSuccess) geetestHandler.onSuccess(onSuccess)
    if (geetestHandler.onError) geetestHandler.onError(() => { if (!settled) { settled = true; try { ElMessage.error('人机验证出错，请关闭拦截或更换网络后重试') } catch {}; resolve(false) } })
    if (geetestHandler.onClose) geetestHandler.onClose(() => { if (!settled) { settled = true; try { ElMessage.warning('请先完成人机验证') } catch {}; resolve(false) } })
    const showIt = () => {
      popupShown = true
      if (geetestHandler.showCaptcha) geetestHandler.showCaptcha()
      else if (geetestHandler.showBox) geetestHandler.showBox()
      else onSuccess()
    }
    try { showIt() } catch {}
    if (geetestHandler.onReady) geetestHandler.onReady(() => { popupShown = true; showIt() })
    // 超时兜底
    setTimeout(() => {
      if (!settled) {
        settled = true
        if (!popupShown) {
          try { ElMessage.error('人机验证超时，请重试或检查拦截设置') } catch {}
        }
        resolve(false)
      }
    }, geetestMaxWaitMs)
  })
}

const validateUsername = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!isValidUsername(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线，长度3-20位'))
  } else if (value.includes('@')) {
    callback(new Error('用户名不能使用邮箱格式'))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!isValidEmail(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const validatePassword = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 密码强度检查函数
const checkPasswordStrength = () => {
  const password = registerForm.password
  if (!password) {
    passwordStrength.level = 'weak'
    passwordStrength.text = '弱'
    passwordStrength.hints = []
    return
  }

  const hints: string[] = []
  let score = 0

  // 检查长度
  if (password.length < 6) {
    hints.push('至少6个字符')
  } else {
    score++
  }

  // 检查小写字母
  if (!/[a-z]/.test(password)) {
    hints.push('包含小写字母')
  } else {
    score++
  }

  // 检查大写字母
  if (!/[A-Z]/.test(password)) {
    hints.push('包含大写字母')
  } else {
    score++
  }

  // 检查数字
  if (!/[0-9]/.test(password)) {
    hints.push('包含数字')
  } else {
    score++
  }

  // 检查特殊字符
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    hints.push('包含特殊字符')
  } else {
    score++
  }

  // 设置强度等级
  if (score >= 4) {
    passwordStrength.level = 'strong'
    passwordStrength.text = '强'
  } else if (score >= 2) {
    passwordStrength.level = 'medium'
    passwordStrength.text = '中'
  } else {
    passwordStrength.level = 'weak'
    passwordStrength.text = '弱'
  }

  passwordStrength.hints = hints
}

const registerRules: FormRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  if (!isValidEmail(registerForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  const ok = await sendEmailCodeWithHuman(registerForm.email, 'verify_email')
  if (ok) {
    ElMessage.success('验证码已发送到您的邮箱')
    showEmailCodeInput.value = true
    startEmailCodeCooldown(60)
    startCodeExpireTimer()
  }
}

// 重新发送验证码
const resendEmailCode = async () => {
  if (emailCodeCooldown.value > 0) {
    ElMessage.warning(`请等待 ${emailCodeCooldown.value} 秒后再试`)
    return
  }
  await sendEmailCode()
}

// 开始验证码过期倒计时
const startCodeExpireTimer = () => {
  codeExpireTime.value = 300 // 5分钟
  if (codeExpireTimer.value) { clearInterval(codeExpireTimer.value); codeExpireTimer.value = null }
  codeExpireTimer.value = setInterval(() => {
    codeExpireTime.value--
    if (codeExpireTime.value <= 0) {
      clearInterval(codeExpireTimer.value!)
      codeExpireTimer.value = null
    }
  }, 1000)
}

// 清理定时器
const clearTimers = () => {
  if (codeExpireTimer.value) {
    clearInterval(codeExpireTimer.value)
    codeExpireTimer.value = null
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  // 必须同意《用户协议》《隐私政策》后才允许注册
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意《用户协议》和《隐私政策》')
    return
  }
  
  try {
    await registerFormRef.value.validate()
    
    // 检查邮箱验证码
    if (!emailCode.value) {
      ElMessage.warning('请输入邮箱验证码')
      return
    }
    
    if (codeExpireTime.value <= 0) {
      ElMessage.warning('验证码已过期，请重新发送')
      return
    }
    
    const success = await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      emailCode: emailCode.value
    })
    
    if (success) {
      router.push('/')
    }
  } catch (error) {
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  // 用户引导功能已移除
  // 预加载极验，避免首次点击时未就绪
  ensureGeetest().catch(() => {})
})

onUnmounted(() => {
  clearTimers()
})

// QQ 登录/注册：与登录页逻辑保持一致
const handleQQLogin = async () => {
  try {
    const response = await api.get('/auth/qq/auth')
    if (response.data?.success && response.data.authUrl) {
      window.location.href = response.data.authUrl
    } else {
      ElMessage.error(`QQ登录服务暂不可用${response.data?.message ? '：' + response.data.message : ''}`)
    }
  } catch (error: any) {
    if (error?.code === 'ERR_NETWORK') ElMessage.error('网络连接失败，请检查网络')
    else if (error?.response?.status === 404) ElMessage.error('QQ登录接口不存在')
    else if (error?.response?.status === 500) ElMessage.error('服务器内部错误')
    else ElMessage.error(`QQ登录失败：${error?.message || '请重试'}`)
  }
}

// EPass 登录/注册：与登录页逻辑保持一致
const handleEPassLogin = async () => {
  try {
    const arr = new Uint8Array(16)
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(arr)
    const state = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
    try { sessionStorage.setItem('epass_state', state) } catch {}
    const clientId = 'euser-gallery'
    const redirectUri = `${window.location.origin}/auth/callback`
    const scope = 'read'
    const params = new URLSearchParams({ client_id: clientId, response_type: 'token', redirect_uri: redirectUri, scope, state })
    const authorizeUrl = `https://account.emoera.com/oauth/authorize?${params.toString()}`
    window.location.href = authorizeUrl
  } catch (e: any) {
    ElMessage.error(e?.message || 'E通行证登录初始化失败')
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(1200px 800px at 20% 10%, rgba(255,255,255,0.85), rgba(240,242,245,0.75) 60%, rgba(230,232,236,0.6) 100%),
    linear-gradient(135deg, #fafafa 0%, #eef1f4 100%);
  overflow-x: hidden; // 只隐藏水平滚动，允许垂直滚动
  overflow-y: visible; // 允许垂直滚动
  height: auto; // 允许高度自适应
  // 统一顶部偏移变量（桌面默认）
  --nav-offset: 120px;
}

.top-nav {
  position: fixed; // 固定顶部，避免与内部滚动错位
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 0;
  background: transparent;
  
  .nav-content {
    width: 100%; // 占满视口，消除右侧空白
    max-width: none;
    margin: 0;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  }
  
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #111827;
    
    .logo-icon {
      font-size: 24px;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .nav-actions {
    .el-button {
      color: #374151;
      
      &:hover {
        background: rgba(17, 24, 39, 0.06);
      }
    }
  }
}

.register-content {
  display: grid; // 两列自适应布局
  grid-template-columns: max-content minmax(420px, 520px); // 左随内容宽度，右固定范围
  align-items: start;
  gap: 32px;
  max-width: none; // 取消限宽
  width: 100%;
  margin: 0; // 不再居中包裹
  justify-items: stretch;
  align-content: start;
  justify-content: center; // 居中整个两列块，左右留白一致
  padding: var(--nav-offset) 24px 24px; // 两侧留安全边距
  min-height: 100vh;
  height: 100vh; // 固定视口高度，启用内部滚动容器
  overflow-y: auto; // 允许垂直滚动
  overflow-x: hidden; // 隐藏水平滚动
  -webkit-overflow-scrolling: touch; // 移动端顺滑滚动
  scroll-padding-top: var(--nav-offset); // 使用统一变量
  overscroll-behavior: contain; // 阻止顶部回弹导致内容越界
  box-sizing: border-box; // 防止因内边距导致宽度溢出
}

// 自动滚动的块统一使用同一顶部间距
.register-form .el-form-item,
.register-header,
.register-divider,
.social-register,
.register-footer,
.email-verification-section,
.password-hint,
.register-box {
  scroll-margin-top: var(--nav-offset);
}

.register-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: linear-gradient(180deg, rgba(255,255,255,0.80), rgba(245,246,248,0.72));
  border: 1px solid rgba(17, 17, 17, 0.08);
  backdrop-filter: blur(18px) saturate(1.06);
  -webkit-backdrop-filter: blur(18px) saturate(1.06);
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(17, 24, 39, 0.12), inset 0 1px 0 rgba(255,255,255,0.6);
  animation: slideUp 0.8s ease-out;
  height: auto; // 允许高度自适应
  min-height: auto; // 允许最小高度自适应
  overflow: visible; // 允许内容溢出，不影响滚动
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
  
  .header-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #374151, #111827);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 24px;
  }
  
  .register-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .register-subtitle {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }
}

.register-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .custom-input {
    width: 100%; // 确保输入框宽度为100%
    box-sizing: border-box;
    
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      padding: 12px 16px;
      width: 100%; // 确保包装器宽度为100%
      box-sizing: border-box;
      
      &:hover {
        border-color: #9ca3af;
        box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);
      }
      
      &.is-focus {
        border-color: #111827;
        box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
      }
    }
    
    :deep(.el-input__inner) {
      width: 100%; // 确保输入框内容宽度为100%
      box-sizing: border-box;
    }
  }
  
  .agreement-row {
    margin-bottom: 24px;
    
    .agreement-checkbox {
      :deep(.el-checkbox__label) {
        color: #6b7280;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .terms-link {
        color: #374151;
        font-size: 14px;
        padding: 0;
        margin: 0 2px;
        
        &:hover {
          color: #111827;
        }
      }
    }
  }

  // 密码强度提示样式
  .password-hint {
    margin-top: 8px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 14px;
  }

  .password-strength {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .strength-label {
    color: #666;
    margin-right: 8px;
  }

  .strength-level {
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .strength-level.weak {
    background: #ffebee;
    color: #c62828;
  }

  .strength-level.medium {
    background: #fff3e0;
    color: #ef6c00;
  }

  .strength-level.strong {
    background: #e8f5e8;
    color: #2e7d32;
  }

  .password-requirements {
    margin-top: 8px;
  }

  // 桌面端：密码提示左右布局（左：要求，右：强度）
  @media (min-width: 1024px) {
    .password-hint {
      display: grid;
      grid-template-columns: 1fr auto;
      column-gap: 16px;
      align-items: start;
    }
    .password-requirements {
      margin-top: 0;
    }
    .password-strength {
      margin-bottom: 0;
      justify-content: flex-end;
      text-align: right;
      gap: 8px;
    }
  }

  .requirement-title {
    color: #666;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .requirement-list {
    margin: 0;
    padding-left: 16px;
  }

  .requirement-item {
    color: #999;
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  // 邮箱验证码样式
.email-verification-section {
    margin-top: 16px;
    padding: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(246,247,249,0.78));
  border-radius: 16px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  box-shadow: 0 18px 38px rgba(17,24,39,0.12), inset 0 1px 0 rgba(255,255,255,0.55);
  backdrop-filter: blur(18px) saturate(1.08) contrast(1.02);
    transition: all 0.3s ease;
    width: 100%; // 确保与邮箱输入框同宽
    box-sizing: border-box;
    overflow: visible; // 确保验证码区域不影响滚动
    position: relative; // 相对定位，不影响页面布局
    
    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 6px 25px rgba(17, 24, 39, 0.1);
    }

    .geetest-box {
      min-height: 48px;
      margin-bottom: 12px;
      position: relative;
      z-index: 2;
    }
    
    .verification-input-row {
      display: grid;
      grid-template-columns: 6fr 4fr; // 输入框:按钮 = 6:4
      gap: 12px;
      align-items: stretch; // 统一高度
      margin-bottom: 8px; // 减少下方空白
      width: 100%; // 确保行宽度为100%
      
      .email-code-input {
        width: 100%; // 网格下不依赖 flex:1
        width: 100%; // 确保输入框宽度
        
        :deep(.el-input__wrapper) {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          padding: 0 16px;
          box-sizing: border-box;
          width: 100%; // 确保包装器宽度
          
          &:hover {
            border-color: #9ca3af;
            box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);
          }
          
          &.is-focus {
            border-color: #111827;
            box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
          }
        }
        
        :deep(.el-input__inner) {
          height: 48px !important;
          line-height: 48px !important;
          font-size: 16px;
          font-weight: 500;
          color: #2d3748;
          width: 100%; // 确保输入框内容宽度
        }
      }
      
      .send-code-btn {
        min-width: 0; // 由网格控制宽度
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        transition: box-shadow 200ms ease, transform 140ms ease, background 200ms ease;
        background: linear-gradient(180deg, #f3f4f6, #e5e7eb);
        border: 1px solid rgba(17, 24, 39, 0.18);
        color: #111827;
        box-shadow: 0 4px 15px rgba(17, 24, 39, 0.10);
        flex-shrink: 0; // 兼容性冗余
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          inset: -20%;
          background: radial-gradient(40% 40% at 50% 50%, rgba(255,255,255,.35), rgba(255,255,255,0) 60%);
          opacity: 0;
          transition: opacity .25s ease, transform .25s ease;
        }
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(17,24,39,0.18), 0 0 0 3px rgba(17,24,39,0.06) inset;
          &::before { opacity: .7; transform: scale(1.02); }
          background: linear-gradient(180deg, #f5f6f8, #e8eaee);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: #e5e7eb;
          box-shadow: none;
        }
        
        // 强制覆盖Element Plus样式
        &.el-button--large {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          padding: 0 20px !important;
          line-height: 48px !important;
        }
      }
    }
    
    .code-tips {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #6b7280;
      padding-top: 6px; // 进一步压缩底部空白
      border-top: 1px solid #e5e7eb;
      width: 100%; // 确保提示区域宽度
      
      .code-timer {
        color: #374151;
        font-weight: 600;
        font-size: 13px;
      }
      
      .el-button {
        padding: 4px 8px;
        font-size: 13px;
        color: #374151;
        font-weight: 500;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover:not(:disabled) {
          color: #111827;
          background: rgba(17, 24, 39, 0.06);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(180deg, #f3f4f6, #e5e7eb);
  border: 1px solid rgba(17, 24, 39, 0.18);
  color: #111827;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 32px rgba(17, 24, 39, 0.18), 0 0 0 3px rgba(17,24,39,0.06) inset;
    background: linear-gradient(180deg, #f5f6f8, #e8eaee);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 8px 18px rgba(17, 24, 39, 0.16);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  :deep(.el-icon) {
    margin-right: 8px;
  }
}

.register-divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e8ed;
  }
  
  .divider-text {
    background: #ffffff;
    padding: 0 16px;
    color: #6b7280;
    font-size: 14px;
    position: relative;
    z-index: 1;
  }
}

.social-register {
  display: grid;
  grid-template-columns: 1fr 1fr; // 5:5 等分
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
  
  .social-btn {
    height: 44px;
    min-height: 44px;
    max-height: 44px;
    width: 100%;
    min-width: 0;
    border-radius: 12px;
    border: 1px solid rgba(17, 17, 17, 0.08);
    background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(246,247,249,0.78));
    color: #111827;
    transition: box-shadow 180ms ease, transform 120ms ease, background 180ms ease;
    box-sizing: border-box;
    
    &:hover {
      border-color: rgba(17, 17, 17, 0.14);
      color: #111827;
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(17,24,39,0.14), 0 0 0 2px rgba(17,24,39,0.06) inset;
    }
  }
}

.register-footer {
  text-align: center;
  
  .login-link {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
    
    .link {
      color: #374151;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      
      &:hover {
        color: #111827;
      }
    }
  }
}

.info-panel {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(245,246,248,0.74));
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(17, 24, 39, 0.10), inset 0 1px 0 rgba(255,255,255,0.6);
  backdrop-filter: blur(16px) saturate(1.05);
  position: sticky;
  top: var(--nav-offset); // 使用统一变量
  align-self: flex-start;
  max-height: calc(100vh - var(--nav-offset) - 24px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  animation: slideUp 0.8s ease-out 0.2s both;
  
  .panel-content {
    .panel-title {
      color: #111827;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .benefit-list {
      .benefit-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .benefit-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111827;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .benefit-content {
          h3 {
            color: #111827;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          p {
            color: #374151;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .register-content {
    gap: 28px;
    justify-content: center;
  }
}

@media (max-width: 1024px) {
  .register-content {
    grid-template-columns: 1fr;
    gap: 24px;
    justify-content: stretch; // 单列时铺满
  }
}

@media (max-width: 1024px) {
  .register-container { --nav-offset: 100px; }
  .info-panel { display: none; }
  .register-box,
  .email-verification-section,
  .password-hint {
    scroll-margin-top: 100px;
  }
  .register-form .el-form-item,
  .register-header,
  .register-divider,
  .social-register,
  .register-footer {
    scroll-margin-top: 100px;
  }
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: visible; // 允许背景元素正常显示
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.06);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 5%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 15%;
  animation-delay: 4s;
}

.shape-4 {
  width: 80px;
  height: 80px;
  top: 30%;
  right: 20%;
  animation-delay: 6s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .register-content {
    gap: 40px;
  }
  
  .register-box {
    max-width: 400px;
  }
  
  .info-panel {
    max-width: 380px;
  }
}

@media (max-width: 1024px) {
  .register-content {
    flex-direction: column;
    grid-template-columns: 1fr; // 隐藏右侧信息面板后，使用单列消除右侧空白
    gap: 40px;
    padding: 100px 20px 24px; // 适配平板的顶部空间
    scroll-padding-top: 100px;
    height: auto; // 小屏允许自适应高度
    min-height: 100vh;
    overflow-y: auto;
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
  .register-box,
  .email-verification-section,
  .password-hint {
    scroll-margin-top: 100px;
  }
  .register-form .el-form-item,
  .register-header,
  .register-divider,
  .social-register,
  .register-footer {
    scroll-margin-top: 100px;
  }
}

@media (max-width: 768px) {
  .register-container { --nav-offset: 96px; }
  .top-nav { padding: 16px 0; }
  .top-nav .nav-content { padding: 0 16px; }
  
  .register-content {
    padding: 96px 20px 24px; // 适配手机顶部空间，避免遮挡
    scroll-padding-top: 96px;
    gap: 30px;
    min-height: auto; // 移动端允许高度自适应
    align-items: flex-start; // 移动端顶部对齐
    overflow-y: auto; // 允许滚动
    overflow-x: hidden;
    height: auto; // 高度自适应
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
  
  .register-box {
    padding: 30px 20px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    height: auto; // 移动端允许高度自适应
    overflow: visible; // 允许内容溢出
  }
  
  .register-header {
    margin-bottom: 24px;
    
    .header-icon {
      width: 50px;
      height: 50px;
      font-size: 20px;
      border-radius: 14px;
    }
    
    .register-title {
      font-size: 24px;
      margin-bottom: 6px;
    }
    
    .register-subtitle {
      font-size: 13px;
      line-height: 1.4;
    }
  }
  
  .register-form {
    .el-form-item {
      margin-bottom: 18px;
    }
    
    .custom-input {
      :deep(.el-input__wrapper) {
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 15px;
        
        &:hover {
          box-shadow: 0 3px 10px rgba(102, 126, 234, 0.2);
        }
        
        &.is-focus {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }
      }
    }
    
    // 移动端邮箱验证码样式
    .email-verification-section {
      margin-top: 12px;
      padding: 16px;
      border-radius: 12px;
      
      .verification-input-row {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        
        .email-code-input {
          :deep(.el-input__wrapper) {
            height: 44px !important;
            min-height: 44px !important;
            max-height: 44px !important;
            padding: 0 14px;
            border-radius: 10px;
          }
          
          :deep(.el-input__inner) {
            height: 44px !important;
            line-height: 44px !important;
            font-size: 15px;
          }
        }
        
        .send-code-btn {
          width: 100%;
          min-width: auto;
          height: 44px !important;
          min-height: 44px !important;
          max-height: 44px !important;
          border-radius: 10px;
          font-size: 14px;
          
          &.el-button--large {
            height: 44px !important;
            min-height: 44px !important;
            max-height: 44px !important;
            padding: 0 16px !important;
            line-height: 44px !important;
          }
        }
      }
      
      .code-tips {
        font-size: 12px;
        padding-top: 6px;
        
        .code-timer {
          font-size: 12px;
        }
        
        .el-button {
          font-size: 12px;
          padding: 2px 6px;
        }
      }
    }
    
    .agreement-row {
      margin-bottom: 20px;
      
      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 13px;
          line-height: 1.4;
        }
        
        .terms-link {
          font-size: 13px;
        }
      }
    }
  }
  
  .register-button {
    height: 44px;
    font-size: 15px;
    border-radius: 10px;
    font-weight: 600;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
    }
  }
  
  // 轻柔淡入上移动画（邮箱验证码、密码提示）
  .fade-up-soft-enter-from,
  .fade-up-soft-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
  .fade-up-soft-enter-active,
  .fade-up-soft-leave-active {
    transition: opacity var(--anim-duration-base, 200ms) var(--anim-ease-decelerate, cubic-bezier(0.2, 0, 0, 1)),
                transform var(--anim-duration-base, 200ms) var(--anim-ease-decelerate, cubic-bezier(0.2, 0, 0, 1));
  }
  
  .register-divider {
    margin: 20px 0;
    
    .divider-text {
      font-size: 13px;
      padding: 0 12px;
    }
  }
  
  .info-panel {
    padding: 30px 20px;
    border-radius: 20px;
    
    .panel-content {
      .panel-title {
        font-size: 20px;
        margin-bottom: 24px;
        line-height: 1.3;
      }
      
      .benefit-list {
        .benefit-item {
          gap: 12px;
          margin-bottom: 20px;
          
          .benefit-icon {
            width: 35px;
            height: 35px;
            font-size: 16px;
            border-radius: 10px;
          }
          
          .benefit-content {
            h3 {
              font-size: 15px;
              margin-bottom: 3px;
            }
            
            p {
              font-size: 13px;
              line-height: 1.4;
            }
          }
        }
      }
    }
  }
  
  .floating-shape {
    display: none;
  }
  
  .social-register {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  
  .social-btn-wrapper {
    width: 100%;
  }
  
  .social-btn {
    width: 100%;
    height: 40px;
    font-size: 14px;
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  }

// 桌面端强制 5:5 等分
@media (min-width: 769px) {
  .social-register {
    display: grid;
    grid-template-columns: 1fr 1fr; // 50% : 50%
    align-items: stretch;
  }
  .social-register .social-btn-wrapper,
  .social-register .social-btn {
    width: 100%;
  }
}
  
  .register-footer {
    .login-link {
      font-size: 13px;
      line-height: 1.4;
      
      .link {
        font-weight: 600;
      }
    }
  }
  .register-form .el-form-item,
  .register-header,
  .register-divider,
  .social-register,
  .register-footer {
    scroll-margin-top: 96px;
  }
}

@media (max-width: 480px) {
  .top-nav {
    padding: 12px 0;
    
    .nav-content {
      padding: 0 12px;
    }
    
    .nav-logo {
      .logo-icon {
        font-size: 18px;
      }
      
      .logo-text {
        font-size: 16px;
      }
    }
    
    .nav-actions {
      .el-button {
        font-size: 13px;
        padding: 6px 12px;
      }
    }
  }
  
  .register-content {
    padding: 60px 16px 16px;
    gap: 24px;
    min-height: auto; // 小屏幕允许高度自适应
    align-items: flex-start; // 顶部对齐
    overflow-y: auto; // 允许滚动
    overflow-x: hidden;
    height: auto; // 高度自适应
  }
  
  .register-box {
    padding: 24px 16px;
    height: auto; // 小屏幕允许高度自适应
    overflow: visible; // 允许内容溢出
  }
  
  .register-header {
    margin-bottom: 20px;
    
    .header-icon {
      width: 45px;
      height: 45px;
      font-size: 18px;
    }
    
    .register-title {
      font-size: 22px;
    }
    
    .register-subtitle {
      font-size: 12px;
    }
  }
  
  .register-form {
    .custom-input {
      :deep(.el-input__wrapper) {
        padding: 8px 12px;
      }
    }
    
    .agreement-row {
      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 12px;
        }
        
        .terms-link {
          font-size: 12px;
        }
      }
    }
  }
  
  .register-button {
    height: 42px;
    font-size: 14px;
  }
  
  .info-panel {
    padding: 24px 16px;
    
    .panel-content {
      .panel-title {
        font-size: 18px;
        margin-bottom: 20px;
      }
      
      .benefit-list {
        .benefit-item {
          gap: 10px;
          margin-bottom: 16px;
          
          .benefit-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          .benefit-content {
            h3 {
              font-size: 13px;
            }
            
            p {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
  
  .social-register {
    display: block; // 改为块级容器
    
    .social-btn-wrapper {
      width: 100%;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .social-btn {
      width: 100%;
      height: 38px;
      font-size: 13px;
    }
  }
  
  .register-footer {
    .login-link {
      font-size: 13px;
    }
  }
}

// 超小屏幕适配
@media (max-width: 360px) {
  .top-nav {
    padding: 10px 0;
    
    .nav-content {
      padding: 0 10px;
    }
    
    .nav-logo {
      .logo-icon {
        font-size: 16px;
      }
      
      .logo-text {
        font-size: 14px;
      }
    }
    
    .nav-actions {
      .el-button {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }
  
  .register-content {
    padding: 50px 12px 12px;
    gap: 20px;
    min-height: auto; // 超小屏幕允许高度自适应
    align-items: flex-start; // 顶部对齐
    overflow: visible; // 允许滚动
    height: auto; // 高度自适应
  }
  
  .register-box {
    padding: 20px 12px;
    height: auto; // 超小屏幕允许高度自适应
    overflow: visible; // 允许内容溢出
  }
  
  .register-header {
    margin-bottom: 16px;
    
    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }
    
    .register-title {
      font-size: 20px;
    }
    
    .register-subtitle {
      font-size: 11px;
    }
  }
  
  .register-form {
    .custom-input {
      :deep(.el-input__wrapper) {
        padding: 6px 10px;
      }
    }
    
    .agreement-row {
      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 11px;
        }
        
        .terms-link {
          font-size: 11px;
        }
      }
    }
  }
  
  .register-button {
    height: 40px;
    font-size: 13px;
  }
  
  .info-panel {
    padding: 20px 12px;
    
    .panel-content {
      .panel-title {
        font-size: 16px;
        margin-bottom: 16px;
      }
      
      .benefit-list {
        .benefit-item {
          gap: 8px;
          margin-bottom: 12px;
          
          .benefit-icon {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
          
          .benefit-content {
            h3 {
              font-size: 13px;
            }
            
            p {
              font-size: 11px;
            }
          }
        }
      }
    }
  }
  
  .social-register {
    .social-btn-wrapper {
      margin-bottom: 8px;
    }
    .social-btn {
      width: 100%;
      height: 36px;
      font-size: 12px;
    }
  }
  
  .register-footer {
    .login-link {
      font-size: 12px;
    }
  }
}

// 暗色主题
:global(.dark) {
  .register-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
  
  .top-nav {
    .nav-logo {
      color: #ffffff;
    }
    
    .nav-actions {
      .el-button {
        color: #ffffff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
  
  .register-box {
    background: rgba(45, 45, 45, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .register-header {
      .register-title {
        color: #ffffff;
      }
      
      .register-subtitle {
        color: #a0a0a0;
      }
    }
    
    .register-form {
      .custom-input {
        :deep(.el-input__wrapper) {
          background: rgba(45, 45, 45, 0.9);
          border-color: #404040;
          
          .el-input__inner {
            color: #ffffff;
          }
        }
      }
      
      .agreement-row {
        .agreement-checkbox {
          :deep(.el-checkbox__label) {
            color: #a0a0a0;
          }
          
          .terms-link {
            color: #667eea;
          }
        }
      }
    }
    
    .register-divider {
      .divider-text {
        background: rgba(45, 45, 45, 0.95);
        color: #a0a0a0;
      }
    }
    
    .social-register {
      .social-btn {
        background: rgba(45, 45, 45, 0.9);
        border-color: #404040;
        color: #a0a0a0;
        
        &:hover {
          border-color: #667eea;
          color: #667eea;
        }
      }
    }
    
    .register-footer {
      .login-link {
        color: #a0a0a0;
        
        .link {
          color: #667eea;
        }
      }
    }
  }
  
  .info-panel {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    
    .panel-content {
      .panel-title {
        color: #ffffff;
      }
      
      .benefit-list {
        .benefit-item {
          .benefit-icon {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
          
          .benefit-content {
            h3 {
              color: #ffffff;
            }
            
            p {
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }
      }
    }
  }
}

// 表单微交互（轻量）
.register-form .el-form-item {
  transition: transform 0.2s ease;
}

.register-form .el-form-item:focus-within {
  transform: translateY(-1px);
}

.register-form .custom-input :deep(.el-input__wrapper) {
  background: #ffffff;
}

.register-form .custom-input :deep(.el-input__prefix .el-icon),
.register-form .custom-input :deep(.el-input__suffix .el-icon) {
  color: currentColor; // 跟随文本色
}

/* 动效统一覆盖（使用 MainLayout 提供的全局动效变量） */
.register-box {
  animation-duration: var(--anim-duration-slow);
  animation-timing-function: var(--anim-ease-entrance);
}

.top-nav .nav-actions .el-button {
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
}
.top-nav .nav-actions .el-button:active { transform: scale(var(--press-scale)); }

.register-form .custom-input :deep(.el-input__wrapper) {
  transition: box-shadow var(--anim-duration-base) var(--anim-ease-standard),
              border-color var(--anim-duration-base) var(--anim-ease-standard);
}

.register-button {
  transition: background var(--anim-duration-base) var(--anim-ease-standard),
              box-shadow var(--anim-duration-base) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
}
.register-button:active { transform: scale(var(--press-scale)); }

.social-register .social-btn {
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              border-color var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
}
.social-register .social-btn:active { transform: scale(var(--press-scale)); }

/* 降级：尊重用户减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .register-box { animation: none; }
  .register-button,
  .social-register .social-btn,
  .top-nav .nav-actions .el-button,
  .register-form .custom-input :deep(.el-input__wrapper) {
    transition: none !important;
  }
}

/* 动效变量修正与可见性优化 */
.register-box { animation-timing-function: var(--anim-ease-decelerate) !important; }

.register-content { content-visibility: auto; contain-intrinsic-size: 900px; }

/* 页面与按钮错峰入场（Register） */
.top-nav { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; }
.register-content { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 40ms; }
.register-box { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 80ms; }
.info-panel { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 120ms; }
.social-register .social-btn-wrapper { will-change: opacity, transform; animation: listRise var(--anim-duration-base) var(--anim-ease-decelerate) both; }
.social-register .social-btn-wrapper:nth-child(1) { animation-delay: 0ms; }
.social-register .social-btn-wrapper:nth-child(2) { animation-delay: 40ms; }

@keyframes blockFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardRise { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes listRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .top-nav, .register-content, .register-box, .info-panel, .social-register .social-btn-wrapper { animation: none !important; }
}
</style>
