<template>
  <div class="register-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
        <div class="nav-actions">
          <el-button type="text" @click="goToLogin">
            <el-icon><User /></el-icon>
            登录
          </el-button>
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
            <div v-if="registerForm.email" class="email-verification-section">
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
                  class="send-code-btn"
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
            />
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
          <el-button class="social-btn qq-btn">
            <el-icon><User /></el-icon>
            QQ注册
          </el-button>
          <el-button class="social-btn wechat-btn">
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
import { isValidEmail, isValidUsername } from '@/utils/helpers'

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

// 邮箱验证码相关
const emailCode = ref('')
const showEmailCodeInput = ref(false)
const emailCodeCooldown = ref(0)
const codeExpireTime = ref(0)
const emailCodeTimer = ref<NodeJS.Timeout | null>(null)
const codeExpireTimer = ref<NodeJS.Timeout | null>(null)

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

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
    const response = await fetch(`${baseUrl}/api/auth/send-email-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: registerForm.email,
        type: 'verify_email'
      })
    })

    const data = await response.json()

    if (data.success) {
      ElMessage.success('验证码已发送到您的邮箱')
      showEmailCodeInput.value = true
      startEmailCodeCooldown()
      startCodeExpireTimer()
    } else {
      ElMessage.error(data.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
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

// 开始验证码冷却倒计时
const startEmailCodeCooldown = () => {
  emailCodeCooldown.value = 60
  emailCodeTimer.value = setInterval(() => {
    emailCodeCooldown.value--
    if (emailCodeCooldown.value <= 0) {
      clearInterval(emailCodeTimer.value!)
      emailCodeTimer.value = null
    }
  }, 1000)
}

// 开始验证码过期倒计时
const startCodeExpireTimer = () => {
  codeExpireTime.value = 300 // 5分钟
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
  if (emailCodeTimer.value) {
    clearInterval(emailCodeTimer.value)
    emailCodeTimer.value = null
  }
  if (codeExpireTimer.value) {
    clearInterval(codeExpireTimer.value)
    codeExpireTimer.value = null
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
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
    console.error('注册失败:', error)
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  // 用户引导功能已移除
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style lang="scss" scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden; // 只隐藏水平滚动，允许垂直滚动
  overflow-y: visible; // 允许垂直滚动
  height: auto; // 允许高度自适应
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
    justify-content: space-between;
  }
  
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    
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
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.register-content {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 20px;
  gap: 60px;
  height: auto; // 允许高度自适应
  overflow: visible; // 允许滚动
}

.register-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
  }
  
  .register-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  .register-subtitle {
    color: #7f8c8d;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
      transition: all 0.3s ease;
      padding: 12px 16px;
      width: 100%; // 确保包装器宽度为100%
      box-sizing: border-box;
      
      &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
      
      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
        color: #7f8c8d;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .terms-link {
        color: #667eea;
        font-size: 14px;
        padding: 0;
        margin: 0 2px;
        
        &:hover {
          color: #764ba2;
        }
      }
    }
  }
  
  // 邮箱验证码样式
  .email-verification-section {
    margin-top: 16px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.15);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    width: 100%; // 确保与邮箱输入框同宽
    box-sizing: border-box;
    overflow: visible; // 确保验证码区域不影响滚动
    position: relative; // 相对定位，不影响页面布局
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.25);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.15);
    }
    
    .verification-input-row {
      display: flex;
      gap: 16px;
      align-items: stretch; // 统一高度
      margin-bottom: 16px;
      width: 100%; // 确保行宽度为100%
      
      .email-code-input {
        flex: 1;
        width: 100%; // 确保输入框宽度
        
        :deep(.el-input__wrapper) {
          height: 48px !important;
          min-height: 48px !important;
          max-height: 48px !important;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e1e8ed;
          transition: all 0.3s ease;
          padding: 0 16px;
          box-sizing: border-box;
          width: 100%; // 确保包装器宽度
          
          &:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          }
          
          &.is-focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
        min-width: 140px;
        height: 48px !important;
        min-height: 48px !important;
        max-height: 48px !important;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        flex-shrink: 0; // 防止按钮被压缩
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8, #6b46c1);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: #cbd5e0;
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
      color: #7f8c8d;
      padding-top: 8px;
      border-top: 1px solid rgba(102, 126, 234, 0.1);
      width: 100%; // 确保提示区域宽度
      
      .code-timer {
        color: #667eea;
        font-weight: 600;
        font-size: 13px;
      }
      
      .el-button {
        padding: 4px 8px;
        font-size: 13px;
        color: #667eea;
        font-weight: 500;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover:not(:disabled) {
          color: #5a67d8;
          background: rgba(102, 126, 234, 0.1);
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
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
    background: rgba(255, 255, 255, 0.95);
    padding: 0 16px;
    color: #7f8c8d;
    font-size: 14px;
    position: relative;
    z-index: 1;
  }
}

.social-register {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  
  .social-btn {
    flex: 1;
    height: 44px;
    min-height: 44px;
    max-height: 44px;
    width: 100%;
    min-width: 0;
    border-radius: 12px;
    border: 1px solid #e1e8ed;
    background: white;
    color: #7f8c8d;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &:hover {
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-1px);
    }
    
    &.qq-btn:hover {
      background: #12b7f5;
      color: white;
      border-color: #12b7f5;
    }
    
    &.wechat-btn:hover {
      background: #07c160;
      color: white;
      border-color: #07c160;
    }
  }
}

.register-footer {
  text-align: center;
  
  .login-link {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
    
    .link {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      
      &:hover {
        color: #764ba2;
      }
    }
  }
}

.info-panel {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.8s ease-out 0.2s both;
  
  .panel-content {
    .panel-title {
      color: white;
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
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .benefit-content {
          h3 {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          p {
            color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.1);
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
    gap: 40px;
    padding: 80px 20px 20px;
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
}

@media (max-width: 768px) {
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
  
  .register-content {
    padding: 80px 20px 20px;
    gap: 30px;
    min-height: auto; // 移动端允许高度自适应
    align-items: flex-start; // 移动端顶部对齐
    overflow: visible; // 允许滚动
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
    flex-direction: column;
    gap: 10px;
    
    .social-btn {
      height: 40px;
      font-size: 14px;
      border-radius: 10px;
      
      &:hover {
        transform: translateY(-1px);
      }
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
    overflow: visible; // 允许滚动
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
              font-size: 14px;
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
    .social-btn {
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
    .social-btn {
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
</style>
