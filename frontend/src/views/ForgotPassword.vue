<template>
  <div class="forgot-password-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><View /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
      </div>
    </div>

    <div class="forgot-password-content">
      <div class="forgot-password-box">
        <!-- 步骤指示器 -->
        <div class="steps-indicator">
          <div class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">输入邮箱</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">验证身份</div>
          </div>
          <div class="step-line" :class="{ active: currentStep > 2 }"></div>
          <div class="step-item" :class="{ active: currentStep >= 3 }">
            <div class="step-number">3</div>
            <div class="step-label">重置密码</div>
          </div>
        </div>

        <!-- 步骤1: 输入邮箱 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-header">
            <div class="header-icon">
              <el-icon><Message /></el-icon>
            </div>
            <h1 class="step-title">找回密码</h1>
            <p class="step-subtitle">输入您的邮箱地址，我们将发送验证码</p>
          </div>
          
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            class="step-form"
            @submit.prevent="handleEmailSubmit"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入注册时的邮箱地址"
                size="large"
                :prefix-icon="Message"
                clearable
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="step-button"
                :loading="loading"
                @click="handleEmailSubmit"
              >
                <el-icon v-if="!loading"><Right /></el-icon>
                {{ loading ? '发送中...' : '下一步' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 验证身份 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-header">
            <div class="header-icon">
              <el-icon><User /></el-icon>
            </div>
            <h1 class="step-title">验证身份</h1>
            <p class="step-subtitle">请输入用户名和邮箱验证码</p>
          </div>
          
          <el-form
            ref="verifyFormRef"
            :model="verifyForm"
            :rules="verifyRules"
            class="step-form"
            @submit.prevent="handleVerifySubmit"
          >
            <el-form-item prop="username">
              <el-input
                v-model="verifyForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
                clearable
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="emailCode">
              <div class="email-code-group">
                <el-input
                  v-model="verifyForm.emailCode"
                  placeholder="请输入6位验证码"
                  size="large"
                  :prefix-icon="Lock"
                  maxlength="6"
                  class="custom-input code-input"
                />
                <el-button 
                  type="primary" 
                  size="large"
                  :disabled="emailCodeCooldown > 0"
                  @click="sendEmailCode"
                  class="send-code-btn"
                >
                  {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item>
              <div class="step-actions">
                <el-button size="large" @click="prevStep">
                  <el-icon><ArrowLeft /></el-icon>
                  上一步
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  class="step-button"
                  :loading="loading"
                  @click="handleVerifySubmit"
                >
                  <el-icon v-if="!loading"><Right /></el-icon>
                  {{ loading ? '验证中...' : '下一步' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤3: 重置密码 -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="step-header">
            <div class="header-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <h1 class="step-title">重置密码</h1>
            <p class="step-subtitle">请输入您的新密码</p>
          </div>
          
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            class="step-form"
            @submit.prevent="handlePasswordSubmit"
          >
            <el-form-item prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                class="custom-input"
                @keyup.enter="handlePasswordSubmit"
              />
            </el-form-item>
            
            <el-form-item>
              <div class="step-actions">
                <el-button size="large" @click="prevStep">
                  <el-icon><ArrowLeft /></el-icon>
                  上一步
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  class="step-button"
                  :loading="loading"
                  :disabled="!canSubmitNewPassword"
                  @click="handlePasswordSubmit"
                >
                  <el-icon v-if="!loading"><Check /></el-icon>
                  {{ loading ? '重置中...' : '完成重置' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="forgot-password-footer">
          <p class="login-link">
            记起密码了？
            <router-link to="/login" class="link">
              <el-icon><User /></el-icon>
              返回登录
            </router-link>
          </p>
        </div>
      </div>
      
      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="panel-content">
          <h2 class="panel-title">密码重置说明</h2>
          <div class="instruction-list">
            <div class="instruction-item">
              <el-icon class="instruction-icon"><Message /></el-icon>
              <div class="instruction-content">
                <h3>邮箱验证</h3>
                <p>验证码将发送到您注册时使用的邮箱地址</p>
              </div>
            </div>
            <div class="instruction-item">
              <el-icon class="instruction-icon"><User /></el-icon>
              <div class="instruction-content">
                <h3>身份确认</h3>
                <p>用户名和邮箱必须属于同一个账户</p>
              </div>
            </div>
            <div class="instruction-item">
              <el-icon class="instruction-icon"><Lock /></el-icon>
              <div class="instruction-content">
                <h3>密码安全</h3>
                <p>
                  新密码不能与原密码相同；
                  {{ passwordHintsStep1 }}
                </p>
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
  View, 
  ArrowLeft,
  Check
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { isValidEmail } from '@/utils/helpers'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

// 移动端检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 步骤管理
const currentStep = ref(1)
const loading = ref(false)

// 表单引用
const emailFormRef = ref<FormInstance>()
const verifyFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 表单数据
const emailForm = reactive({
  email: ''
})

const verifyForm = reactive({
  username: '',
  emailCode: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 邮箱验证码相关
const emailCodeCooldown = ref(0)
const emailCodeTimer = ref<number | null>(null)

// 密码要求
const passwordRequirements = ref<string>('')
const resetToken = ref<string>('')
const passwordPolicy = ref<{ minLength: number; complexity: string } | null>(null)
const passwordHintsStep1 = computed(() => {
  if (!passwordPolicy.value) return '长度至少 6 位'
  const parts: string[] = []
  parts.push(`长度至少 ${passwordPolicy.value.minLength || 6} 位`)
  if (passwordPolicy.value.complexity === 'medium') parts.push('需包含字母和数字')
  if (passwordPolicy.value.complexity === 'high') parts.push('需包含大小写字母、数字和符号')
  return parts.join('；')
})
const passwordHintsStep2 = passwordHintsStep1

// 验证规则
const validateEmail = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!isValidEmail(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const validateUsername = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能少于3位'))
  } else {
    callback()
  }
}

const validateEmailCode = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else if (value.length !== 6) {
    callback(new Error('验证码必须是6位数字'))
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码只能包含数字'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const emailRules: FormRules = {
  email: [{ validator: validateEmail, trigger: 'blur' }]
}

const verifyRules: FormRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  emailCode: [{ validator: validateEmailCode, trigger: 'blur' }]
}

// GeeTest v4 人机验证（bind 模式）
type AnyFn = (...args: any[]) => any
const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js'
const geetestCaptchaId = (((import.meta as any).env?.VITE_GEETEST_CAPTCHA_ID as string) || '7922d406fb215d02770d5a4cd71af066')
const geetestReady = ref(false)
let geetestHandler: any = null
const geetestMaxWaitMs = 12000

const loadScriptOnce = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
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
        try {
          if (geetestHandler?.onReady) geetestHandler.onReady(() => console.log('[GeeTest] ready'))
          if (geetestHandler?.onSuccess) geetestHandler.onSuccess(() => console.log('[GeeTest] success'))
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

const runHumanVerification = async (): Promise<boolean> => {
  if (!geetestCaptchaId) return true
  const ok = await ensureGeetest()
  if (!ok || !geetestHandler) return false
  return new Promise<boolean>((resolve) => {
    let settled = false
    let popupShown = false
    try { ElMessage({ type: 'info', message: '正在拉起人机验证...', duration: 1200 }) } catch {}
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
      try { /* bind 模式直接弹出 */ } catch {}
      if (geetestHandler.showCaptcha) geetestHandler.showCaptcha()
      else if (geetestHandler.showBox) geetestHandler.showBox()
      else onSuccess()
    }
    try { showIt() } catch {}
    if (geetestHandler.onReady) geetestHandler.onReady(() => { popupShown = true; showIt() })
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

const passwordRules: FormRules = {
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

// 步骤1: 处理邮箱提交
const handleEmailSubmit = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    loading.value = true
    
    // 检查邮箱是否存在
    const response = await api.post('/auth/check-email', { email: emailForm.email })
    
    if (response.data.exists) {
      currentStep.value = 2
      ElMessage.success('邮箱验证成功，请继续下一步')
    } else {
      ElMessage.error('该邮箱地址未注册')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '邮箱验证失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  try {
    // 人机验证
    const humanOk = await runHumanVerification()
    if (!humanOk) {
      ElMessage.error('请先完成人机验证')
      return
    }
    await api.post('/auth/send-email-code', {
      email: emailForm.email,
      type: 'forgot_password'
    })
    
    ElMessage.success('验证码已发送到您的邮箱')
    startEmailCodeCooldown()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '发送验证码失败'
    ElMessage.error(errorMessage)
  }
}

// 开始验证码冷却
const startEmailCodeCooldown = () => {
  emailCodeCooldown.value = 60
  emailCodeTimer.value = window.setInterval(() => {
    emailCodeCooldown.value--
    if (emailCodeCooldown.value <= 0) {
      clearInterval(emailCodeTimer.value!)
      emailCodeTimer.value = null
    }
  }, 1000)
}

// 步骤2: 处理身份验证
const handleVerifySubmit = async () => {
  if (!verifyFormRef.value) return
  try {
    await verifyFormRef.value.validate()
    loading.value = true
    const response = await api.post('/auth/verify-forgot-password', {
      username: verifyForm.username,
      email: emailForm.email,
      emailCode: verifyForm.emailCode
    })
    if (response.data.valid) {
      resetToken.value = response.data.resetToken || ''
      passwordRequirements.value = response.data.passwordRequirements || ''
      passwordPolicy.value = response.data.passwordPolicy || null
      currentStep.value = 3
      ElMessage.success('身份验证成功，请设置新密码')
    } else {
      ElMessage.error(response.data.message || '用户名、邮箱或验证码不正确')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '身份验证失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 步骤3: 处理密码重置
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
    loading.value = true
    const checkResponse = await api.post('/auth/check-password-same', {
      username: verifyForm.username,
      email: emailForm.email,
      newPassword: passwordForm.newPassword
    })
    if (checkResponse.data.isSame) {
      ElMessage.error('新密码不能与原密码相同，请重新设置')
      return
    }
    const payload: any = {
      username: verifyForm.username,
      email: emailForm.email,
      newPassword: passwordForm.newPassword
    }
    if (resetToken.value) payload.resetToken = resetToken.value
    // 兼容旧流程：无 resetToken 再带验证码
    if (!resetToken.value) payload.emailCode = verifyForm.emailCode
    const resetResponse = await api.post('/auth/reset-password-new', payload)
    if (resetResponse.data.success) {
      ElMessage.success({ message: '密码重置成功！2秒后自动跳转到登录页面', duration: 2000, showClose: false })
      clearTimers()
      setTimeout(() => { router.push('/login') }, 2000)
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '密码重置失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const canSubmitNewPassword = computed(() => {
  if (!passwordPolicy.value) return passwordForm.newPassword?.length >= 6 && passwordForm.newPassword === passwordForm.confirmPassword
  const min = passwordPolicy.value.minLength || 6
  const okLen = (passwordForm.newPassword || '').length >= min
  const complexity = passwordPolicy.value.complexity || 'low'
  const pwd = passwordForm.newPassword || ''
  let okComplex = true
  if (complexity === 'medium') okComplex = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)
  if (complexity === 'high') okComplex = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  const same = pwd === passwordForm.confirmPassword
  return okLen && okComplex && same
})

// 上一步
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToLogin = () => {
  router.push('/login')
}

// 清理定时器
const clearTimers = () => {
  if (emailCodeTimer.value) {
    clearInterval(emailCodeTimer.value)
    emailCodeTimer.value = null
  }
}

onMounted(() => {
  // 页面初始化
  // 预加载极验，避免首次点击时未就绪
  ensureGeetest().catch(() => {})
  // 拉取密码策略，供步骤1/2展示动态密码要求
  api.get('/auth/password-policy').then((res: any) => {
    if (res?.data?.success) {
      passwordRequirements.value = res.data.passwordRequirements || ''
      passwordPolicy.value = res.data.passwordPolicy || null
    }
  }).catch(() => {})
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style lang="scss" scoped>
.forgot-password-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  overflow-x: hidden; // 只隐藏水平滚动，允许垂直滚动
}

.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
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
}

.forgot-password-content {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 20px;
  gap: 60px;
}

.forgot-password-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 14px 28px rgba(17, 24, 39, 0.08);
  animation: slideUp 0.8s ease-out;
}

// 步骤指示器样式
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 20px 0;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f3f4f6;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .step-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    &.active {
      .step-number {
        background: linear-gradient(135deg, #374151, #111827);
        color: #ffffff;
      }
      
      .step-label {
        color: #111827;
        font-weight: 600;
      }
    }
    
    &.completed {
      .step-number {
        background: #111827;
        color: #ffffff;
      }
      
      .step-label {
        color: #111827;
        font-weight: 600;
      }
    }
  }
  
  .step-line {
    width: 40px;
    height: 2px;
    background: #e5e7eb;
    margin: 0 16px;
    transition: background 0.3s ease;
    
    &.active {
      background: linear-gradient(135deg, #374151, #111827);
    }
  }
}

// 步骤内容样式
.step-content {
  .step-header {
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
    
    .step-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .step-subtitle {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
  }
  
  .step-form {
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .custom-input {
      :deep(.el-input__wrapper) {
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        padding: 0 16px !important;
        box-sizing: border-box !important;
        
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
        box-sizing: border-box !important;
      }
      
      // 强制覆盖Element Plus的所有相关类
      &.el-input--large {
        :deep(.el-input__wrapper) {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
        }
        
        :deep(.el-input__inner) {
          height: 48px !important;
          line-height: 48px !important;
        }
      }
    }
    
    .email-code-group {
      display: flex;
      gap: 12px;
      align-items: stretch;
      
      .code-input {
        flex: 1;
        
        // 确保输入框高度与按钮一致
        :deep(.el-input__wrapper) {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          padding: 0 16px !important;
          box-sizing: border-box !important;
        }
        
        :deep(.el-input__inner) {
          height: 48px !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
      }
      
      .send-code-btn {
        min-width: 120px;
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        background: linear-gradient(135deg, #374151, #111827);
        border: 1px solid #111827;
        color: #ffffff;
        transition: all 0.3s ease;
        padding: 0 !important;
        line-height: 48px !important;
        box-sizing: border-box !important;
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(17, 24, 39, 0.18);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        // 强制覆盖Element Plus样式
        &.el-button {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
        
        &.el-button--large {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
        
        &.el-button--primary {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
      }
    }
    
    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 20px; // 添加左右内边距，确保按钮不贴边
      gap: 20px; // 添加按钮之间的空隙
      
      .el-button {
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 140px !important;
        min-width: 140px !important;
        max-width: 140px !important;
        padding: 0 !important;
        line-height: 48px !important;
        box-sizing: border-box !important;
        
        // 强制覆盖Element Plus的所有相关类
        &.el-button--large {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          width: 140px !important;
          min-width: 140px !important;
          max-width: 140px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
        
        &.el-button--primary {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          width: 140px !important;
          min-width: 140px !important;
          max-width: 140px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
        
        &.el-button--text {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          width: 140px !important;
          min-width: 140px !important;
          max-width: 140px !important;
          padding: 0 !important;
          line-height: 48px !important;
          box-sizing: border-box !important;
        }
        
        &:not(.el-button--primary) {
          background: #ffffff;
          border-color: #e5e7eb;
          color: #374151;
          margin-right: auto; // 左对齐
          order: 1; // 确保在左边
          
          &:hover {
            background: #f9fafb;
            transform: translateY(-1px);
          }
        }
        
        &.el-button--primary {
          background: linear-gradient(135deg, #374151, #111827);
          border: 1px solid #111827;
          color: #ffffff;
          margin-left: auto; // 右对齐
          order: 2; // 确保在右边
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 24px rgba(17, 24, 39, 0.18);
          }
        }
      }
    }
  }
}

.step-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #374151, #111827);
  border: 1px solid #111827;
  color: #ffffff;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(17, 24, 39, 0.18);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  :deep(.el-icon) {
    margin-right: 8px;
  }
}


.forgot-password-footer {
  text-align: center;
  margin-top: 24px;
  
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
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.06);
  backdrop-filter: blur(8px);
  animation: slideUp 0.8s ease-out 0.2s both;
  
  .panel-content {
    .panel-title {
      color: #111827;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .instruction-list {
      .instruction-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .instruction-icon {
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
        
        .instruction-content {
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
  .forgot-password-content {
    gap: 40px;
  }
  
  .forgot-password-box {
    max-width: 400px;
  }
  
  .info-panel {
    max-width: 380px;
  }
}

@media (max-width: 1024px) {
  .forgot-password-content {
    flex-direction: column;
    gap: 40px;
    padding: 80px 20px 20px;
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
}

@media (max-width: 768px) {
  .forgot-password-container {
    min-height: 100vh; // 移动端保持最小视口高度
    height: auto; // 移动端高度自适应内容
    overflow-y: auto; // 确保可以垂直滚动
    overflow-x: hidden; // 隐藏水平滚动
  }
  
  .top-nav {
    padding: 16px 0;
    
    .nav-content {
      padding: 0 16px;
    }
    
    .nav-logo {
      .logo-icon {
        font-size: 20px;
      }
      
      .logo-text {
        font-size: 18px;
      }
    }
    
    .nav-actions {
      .el-button {
        font-size: 14px;
        padding: 8px 12px;
      }
    }
  }
  
  .forgot-password-content {
    padding: 80px 20px 60px; // 增加底部内边距
    gap: 30px;
    min-height: auto; // 移动端不强制最小高度
    align-items: flex-start; // 移动端顶部对齐而不是居中
    flex-direction: column-reverse; // 移动端将info-panel放在下面
    padding-bottom: 80px; // 额外增加底部间距，确保内容完全显示
  }
  
  .forgot-password-box {
    padding: 30px 20px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
  
  .forgot-password-header {
    margin-bottom: 24px;
    
    .header-icon {
      width: 50px;
      height: 50px;
      font-size: 20px;
      border-radius: 14px;
    }
    
    .forgot-password-title {
      font-size: 24px;
      margin-bottom: 6px;
    }
    
    .forgot-password-subtitle {
      font-size: 13px;
      line-height: 1.4;
    }
  }
  
  .forgot-password-form {
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
  }
  
  .forgot-password-button {
    height: 44px;
    font-size: 15px;
    border-radius: 10px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
    }
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
    
    .panel-content {
      .panel-title {
        font-size: 20px;
        margin-bottom: 24px;
        line-height: 1.3;
      }
      
      .instruction-list {
        .instruction-item {
          gap: 12px;
          margin-bottom: 20px;
          
          .instruction-icon {
            width: 35px;
            height: 35px;
            font-size: 16px;
            border-radius: 10px;
          }
          
          .instruction-content {
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
  
  .forgot-password-footer {
    .login-link {
      font-size: 13px;
      line-height: 1.4;
      
      .link {
        font-weight: 600;
      }
    }
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
        padding: 6px 10px;
      }
    }
  }
  
  .forgot-password-content {
    padding: 60px 16px 16px;
    gap: 24px;
  }
  
  .forgot-password-box {
    padding: 24px 16px;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
  
  .forgot-password-header {
    margin-bottom: 20px;
    
    .header-icon {
      width: 45px;
      height: 45px;
      font-size: 18px;
      border-radius: 12px;
    }
    
    .forgot-password-title {
      font-size: 22px;
      margin-bottom: 4px;
    }
    
    .forgot-password-subtitle {
      font-size: 12px;
      line-height: 1.3;
    }
  }
  
  .forgot-password-form {
    .el-form-item {
      margin-bottom: 16px;
    }
    
    .custom-input {
      :deep(.el-input__wrapper) {
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.18);
        }
        
        &.is-focus {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.12);
        }
      }
    }
  }
  
  .forgot-password-button {
    height: 42px;
    font-size: 14px;
    border-radius: 8px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(102, 126, 234, 0.3);
    }
  }
  
  .info-panel {
    padding: 24px 16px;
    border-radius: 16px;
    
    .panel-content {
      .panel-title {
        font-size: 18px;
        margin-bottom: 20px;
        line-height: 1.2;
      }
      
      .instruction-list {
        .instruction-item {
          gap: 10px;
          margin-bottom: 16px;
          
          .instruction-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
            border-radius: 8px;
          }
          
          .instruction-content {
            h3 {
              font-size: 14px;
              margin-bottom: 2px;
            }
            
            p {
              font-size: 12px;
              line-height: 1.3;
            }
          }
        }
      }
    }
  }
  
  .forgot-password-footer {
    .login-link {
      font-size: 12px;
      line-height: 1.3;
      
      .link {
        font-weight: 600;
      }
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
  
  .forgot-password-content {
    padding: 50px 12px 12px;
    gap: 20px;
  }
  
  .forgot-password-box {
    padding: 20px 12px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  }
  
  .forgot-password-header {
    margin-bottom: 16px;
    
    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
      border-radius: 10px;
    }
    
    .forgot-password-title {
      font-size: 20px;
      margin-bottom: 3px;
    }
    
    .forgot-password-subtitle {
      font-size: 11px;
      line-height: 1.2;
    }
  }
  
  .forgot-password-form {
    .el-form-item {
      margin-bottom: 14px;
    }
    
    .custom-input {
      :deep(.el-input__wrapper) {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        
        &:hover {
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.15);
        }
        
        &.is-focus {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
      }
    }
  }
  
  .forgot-password-button {
    height: 40px;
    font-size: 13px;
    border-radius: 6px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
    }
  }
  
  .info-panel {
    padding: 20px 12px;
    border-radius: 12px;
    
    .panel-content {
      .panel-title {
        font-size: 16px;
        margin-bottom: 16px;
        line-height: 1.1;
      }
      
      .instruction-list {
        .instruction-item {
          gap: 8px;
          margin-bottom: 12px;
          
          .instruction-icon {
            width: 28px;
            height: 28px;
            font-size: 12px;
            border-radius: 6px;
          }
          
          .instruction-content {
            h3 {
              font-size: 13px;
              margin-bottom: 1px;
            }
            
            p {
              font-size: 11px;
              line-height: 1.2;
            }
          }
        }
      }
    }
  }
  
  .forgot-password-footer {
    .login-link {
      font-size: 11px;
      line-height: 1.2;
      
      .link {
        font-weight: 600;
      }
    }
  }
}

// 暗色主题
:global(.dark) {
  .forgot-password-container {
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
  
  .forgot-password-box {
    background: rgba(45, 45, 45, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .forgot-password-header {
      .forgot-password-title {
        color: #ffffff;
      }
      
      .forgot-password-subtitle {
        color: #a0a0a0;
      }
    }
    
    .forgot-password-form {
      .custom-input {
        :deep(.el-input__wrapper) {
          background: rgba(45, 45, 45, 0.9);
          border-color: #404040;
          
          .el-input__inner {
            color: #ffffff;
          }
        }
      }
    }
    
    .forgot-password-footer {
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
      
      .instruction-list {
        .instruction-item {
          .instruction-icon {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
          
          .instruction-content {
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

/* 页面与步骤错峰入场（ForgotPassword） */
.forgot-password-container {
  .top-nav { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; }
  .forgot-password-content { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 40ms; }
  .forgot-password-box { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 80ms; }
  .info-panel { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 120ms; }

  .steps-indicator .step-item { will-change: opacity, transform; animation: listRise var(--anim-duration-base) var(--anim-ease-decelerate) both; }
  .steps-indicator .step-item:nth-child(1) { animation-delay: 0ms; }
  .steps-indicator .step-item:nth-child(2) { animation-delay: 30ms; }
  .steps-indicator .step-item:nth-child(3) { animation-delay: 60ms; }

  .step-form .el-form-item { will-change: opacity, transform; animation: rowFadeIn var(--anim-duration-fast) var(--anim-ease-decelerate) both; }
}

@keyframes blockFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardRise { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes listRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rowFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .forgot-password-container :deep(*),
  .forgot-password-container * { animation: none !important; transition: none !important; }
}
</style>
