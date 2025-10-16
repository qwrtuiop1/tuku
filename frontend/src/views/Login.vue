<template>
  <div class="login-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
        <div class="nav-actions">
          <el-button type="text" @click="goToRegister">
            <el-icon><UserFilled /></el-icon>
            注册
          </el-button>
        </div>
      </div>
    </div>

    <div class="login-content">
      <div class="login-box">
        <div class="login-header">
          <div class="header-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <h1 class="login-title">欢迎回来</h1>
          <p class="login-subtitle">登录您的账户以继续使用图库系统</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名或邮箱"
              size="large"
              :prefix-icon="User"
              clearable
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item class="remember-row">
            <div class="remember-forgot-container">
              <el-checkbox v-model="rememberMe" class="remember-checkbox">
                <span class="remember-text">记住我</span>
                <span class="remember-hint">（30天内免登录）</span>
              </el-checkbox>
              <el-button type="text" class="forgot-password" @click="goToForgotPassword">
                忘记密码？
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="authStore.loading"
              @click="handleLogin"
            >
              <el-icon v-if="!authStore.loading"><Right /></el-icon>
              {{ authStore.loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-divider">
          <span class="divider-text">或</span>
        </div>
        
        <div class="social-login">
          <el-button class="social-btn qq-btn" @click="handleQQLogin">
            <el-icon><User /></el-icon>
            QQ登录
          </el-button>
          <el-button class="social-btn wechat-btn" @click="handleWeChatLogin">
            <el-icon><User /></el-icon>
            微信登录
          </el-button>
        </div>
        
        <div class="login-footer">
          <p class="register-link">
            还没有账户？
            <router-link to="/register" class="link">
              <el-icon><UserFilled /></el-icon>
              立即注册
            </router-link>
          </p>
        </div>
      </div>
      
      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <div class="panel-content">
          <h2 class="panel-title">为什么选择图库系统？</h2>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon class="feature-icon"><Upload /></el-icon>
              <div class="feature-content">
                <h3>快速上传</h3>
                <p>支持拖拽上传，批量处理，让文件管理更高效</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><View /></el-icon>
              <div class="feature-content">
                <h3>在线预览</h3>
                <p>图片、视频在线预览，无需下载即可查看</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Platform /></el-icon>
              <div class="feature-content">
                <h3>安全可靠</h3>
                <p>企业级安全防护，保护您的文件隐私</p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  User, 
  Lock, 
  Right, 
  UserFilled, 
  Upload, 
  View, 
  QuestionFilled,
  InfoFilled,
  StarFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

// 移动端检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: ''
})

const rememberMe = ref(localStorage.getItem('rememberMe') === 'true')

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    const success = await authStore.login({
      ...loginForm,
      rememberMe: rememberMe.value
    })
    
    if (success) {
      router.push('/')
    }
  } catch (error) {
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

// QQ登录处理
const handleQQLogin = async () => {
  try {
    console.log('开始获取QQ授权URL...')
    // 获取QQ授权URL
    const response = await api.get('/auth/qq/auth')
    console.log('QQ授权URL响应:', response.data)
    
    if (response.data.success) {
      console.log('跳转到QQ授权页面:', response.data.authUrl)
      // 跳转到QQ授权页面
      window.location.href = response.data.authUrl
    } else {
      console.error('QQ授权URL获取失败:', response.data.message)
      ElMessage.error(`QQ登录服务暂不可用: ${response.data.message}`)
    }
  } catch (error) {
    console.error('QQ登录请求失败:', error)
    
    // 提供更详细的错误信息
    if (error.code === 'ERR_NETWORK') {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else if (error.response?.status === 404) {
      ElMessage.error('QQ登录接口不存在')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请联系管理员')
    } else {
      ElMessage.error(`QQ登录失败: ${error.message || '请重试'}`)
    }
  }
}

// 微信登录处理（暂未实现）
const handleWeChatLogin = () => {
  ElMessage.info('微信登录功能开发中...')
}

onMounted(() => {
  // 用户引导功能已移除
})
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.login-content {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 20px;
  gap: 60px;
  overflow-y: auto; // 确保可以垂直滚动
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease-out;
}

.login-header {
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
  
  .login-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  .login-subtitle {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .custom-input {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
      transition: all 0.3s ease;
      padding: 12px 16px;
      
      &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }
      
      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }
  }
  
  .remember-row {
    margin-bottom: 24px;
    
    .remember-forgot-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    .remember-checkbox {
      :deep(.el-checkbox__label) {
        color: #7f8c8d;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .remember-text {
        font-weight: 500;
      }
      
      .remember-hint {
        color: #95a5a6;
        font-size: 12px;
        font-weight: 400;
      }
    }
    
    .forgot-password {
      color: #667eea;
      font-size: 14px;
      padding: 0;
      
      &:hover {
        color: #764ba2;
      }
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  :deep(.el-icon) {
    margin-right: 8px;
  }
}

.login-divider {
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

.social-login {
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

.login-footer {
  text-align: center;
  
  .register-link {
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
    
    .feature-list {
      .feature-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .feature-icon {
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
        
        .feature-content {
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
  .login-content {
    gap: 40px;
  }
  
  .login-box {
    max-width: 400px;
  }
  
  .info-panel {
    max-width: 380px;
  }
}

@media (max-width: 1024px) {
  .login-content {
    flex-direction: column; // 移动端垂直布局
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
  
  .login-content {
    flex-direction: column; // 移动端垂直布局
    padding: 80px 20px 20px;
    gap: 30px;
    min-height: auto; // 移动端不强制最小高度
    align-items: flex-start; // 移动端顶部对齐而不是居中
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
  
  .login-box {
    padding: 30px 20px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
  
  .login-header {
    margin-bottom: 24px;
    
    .header-icon {
      width: 50px;
      height: 50px;
      font-size: 20px;
      border-radius: 14px;
    }
    
    .login-title {
      font-size: 24px;
      margin-bottom: 6px;
    }
    
    .login-subtitle {
      font-size: 13px;
      line-height: 1.4;
    }
  }
  
  .login-form {
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
    
    .remember-row {
      margin-bottom: 20px;
      
      .remember-forgot-container {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      
      .remember-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 13px;
          line-height: 1.4;
        }
      }
      
      .forgot-password {
        font-size: 13px;
        align-self: flex-end;
      }
    }
  }
  
  .login-button {
    height: 44px;
    font-size: 15px;
    border-radius: 10px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
    }
  }
  
  .login-divider {
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
      
      .feature-list {
        .feature-item {
          gap: 12px;
          margin-bottom: 20px;
          
          .feature-icon {
            width: 35px;
            height: 35px;
            font-size: 16px;
            border-radius: 10px;
          }
          
          .feature-content {
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
  
  .social-login {
    flex-direction: column;
    gap: 10px;
    
    .social-btn {
      height: 40px;
      min-height: 40px;
      max-height: 40px;
      width: 100%;
      min-width: 0;
      font-size: 14px;
      border-radius: 10px;
      box-sizing: border-box;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
  
  .login-footer {
    .register-link {
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
  
  .login-content {
    flex-direction: column; // 小屏幕移动端垂直布局
    padding: 60px 16px 16px;
    gap: 24px;
    min-height: auto; // 移动端不强制最小高度
    align-items: flex-start; // 移动端顶部对齐而不是居中
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
  
  .login-box {
    padding: 24px 16px;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
  
  .login-header {
    margin-bottom: 20px;
    
    .header-icon {
      width: 45px;
      height: 45px;
      font-size: 18px;
      border-radius: 12px;
    }
    
    .login-title {
      font-size: 22px;
      margin-bottom: 4px;
    }
    
    .login-subtitle {
      font-size: 12px;
      line-height: 1.3;
    }
  }
  
  .login-form {
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
    
    .remember-row {
      margin-bottom: 18px;
      
      .remember-forgot-container {
        gap: 8px;
      }
      
      .remember-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 12px;
          line-height: 1.3;
        }
      }
      
      .forgot-password {
        font-size: 12px;
      }
    }
  }
  
  .login-button {
    height: 42px;
    font-size: 14px;
    border-radius: 8px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 14px rgba(102, 126, 234, 0.3);
    }
  }
  
  .login-divider {
    margin: 18px 0;
    
    .divider-text {
      font-size: 12px;
      padding: 0 10px;
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
      
      .feature-list {
        .feature-item {
          gap: 10px;
          margin-bottom: 16px;
          
          .feature-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
            border-radius: 8px;
          }
          
          .feature-content {
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
  
  .social-login {
    gap: 8px;
    
    .social-btn {
      height: 38px;
      min-height: 38px;
      max-height: 38px;
      width: 100%;
      min-width: 0;
      font-size: 13px;
      box-sizing: border-box;
      border-radius: 8px;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
  
  .login-footer {
    .register-link {
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
  
  .login-content {
    flex-direction: column; // 超小屏幕移动端垂直布局
    padding: 50px 12px 12px;
    gap: 20px;
    min-height: auto; // 移动端不强制最小高度
    align-items: flex-start; // 移动端顶部对齐而不是居中
  }
  
  .info-panel {
    display: none; // 移动端隐藏info-panel
  }
  
  .login-box {
    padding: 20px 12px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  }
  
  .login-header {
    margin-bottom: 16px;
    
    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
      border-radius: 10px;
    }
    
    .login-title {
      font-size: 20px;
      margin-bottom: 3px;
    }
    
    .login-subtitle {
      font-size: 11px;
      line-height: 1.2;
    }
  }
  
  .login-form {
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
    
    .remember-row {
      margin-bottom: 16px;
      
      .remember-forgot-container {
        gap: 6px;
      }
      
      .remember-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 11px;
          line-height: 1.2;
        }
      }
      
      .forgot-password {
        font-size: 11px;
      }
    }
  }
  
  .login-button {
    height: 40px;
    font-size: 13px;
    border-radius: 6px;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
    }
  }
  
  .login-divider {
    margin: 16px 0;
    
    .divider-text {
      font-size: 11px;
      padding: 0 8px;
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
      
      .feature-list {
        .feature-item {
          gap: 8px;
          margin-bottom: 12px;
          
          .feature-icon {
            width: 28px;
            height: 28px;
            font-size: 12px;
            border-radius: 6px;
          }
          
          .feature-content {
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
  
  .social-login {
    gap: 6px;
    
    .social-btn {
      height: 36px;
      min-height: 36px;
      max-height: 36px;
      width: 100%;
      min-width: 0;
      font-size: 12px;
      border-radius: 6px;
      box-sizing: border-box;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }
  
  .login-footer {
    .register-link {
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
  .login-container {
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
  
  .login-box {
    background: rgba(45, 45, 45, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .login-header {
      .login-title {
        color: #ffffff;
      }
      
      .login-subtitle {
        color: #a0a0a0;
      }
    }
    
    .login-form {
      .custom-input {
        :deep(.el-input__wrapper) {
          background: rgba(45, 45, 45, 0.9);
          border-color: #404040;
          
          .el-input__inner {
            color: #ffffff;
          }
        }
      }
      
      .remember-row {
        .remember-checkbox {
          :deep(.el-checkbox__label) {
            color: #a0a0a0;
          }
        }
        
        .forgot-password {
          color: #667eea;
        }
      }
    }
    
    .login-divider {
      .divider-text {
        background: rgba(45, 45, 45, 0.95);
        color: #a0a0a0;
      }
    }
    
    .social-login {
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
    
    .login-footer {
      .register-link {
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
      
      .feature-list {
        .feature-item {
          .feature-icon {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
          
          .feature-content {
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
