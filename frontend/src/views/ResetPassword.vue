<template>
  <div class="reset-password-container">
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
            返回登录
          </el-button>
        </div>
      </div>
    </div>

    <div class="reset-password-content">
      <div class="reset-password-box">
        <div class="reset-password-header">
          <div class="header-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <h1 class="reset-password-title">重置密码</h1>
          <p class="reset-password-subtitle">请输入您的新密码</p>
        </div>
        
        <el-form
          ref="resetPasswordFormRef"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          class="reset-password-form"
          @submit.prevent="handleResetPassword"
        >
          <el-form-item prop="password">
            <el-input
              v-model="resetPasswordForm.password"
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
              v-model="resetPasswordForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              class="custom-input"
              @keyup.enter="handleResetPassword"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="reset-password-button"
              :loading="loading"
              @click="handleResetPassword"
            >
              <el-icon v-if="!loading"><Right /></el-icon>
              {{ loading ? '重置中...' : '重置密码' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="reset-password-footer">
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
          <h2 class="panel-title">密码安全提示</h2>
          <div class="security-list">
            <div class="security-item">
              <el-icon class="security-icon"><Lock /></el-icon>
              <div class="security-content">
                <h3>密码强度</h3>
                <p>建议使用包含字母、数字和特殊字符的强密码</p>
              </div>
            </div>
            <div class="security-item">
              <el-icon class="security-icon"><Key /></el-icon>
              <div class="security-content">
                <h3>密码长度</h3>
                <p>密码长度至少6位，建议8位以上</p>
              </div>
            </div>
            <div class="security-item">
              <el-icon class="security-icon"><InfoFilled /></el-icon>
              <div class="security-content">
                <h3>安全提醒</h3>
                <p>请妥善保管您的密码，不要与他人分享</p>
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  User, 
  Lock, 
  Right, 
  Picture, 
  InfoFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 移动端检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const resetPasswordFormRef = ref<FormInstance>()
const resetPasswordForm = reactive({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const validatePassword = (rule: any, value: string, callback: Function) => {
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
  } else if (value !== resetPasswordForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetPasswordRules: FormRules = {
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleResetPassword = async () => {
  if (!resetPasswordFormRef.value) return
  
  try {
    await resetPasswordFormRef.value.validate()
    loading.value = true
    
    // 获取重置token
    const token = route.query.token as string
    if (!token) {
      ElMessage.error('重置链接无效')
      return
    }
    
    // 调用重置密码API
    const success = await authStore.resetPassword(token, resetPasswordForm.password)
    
    if (success) {
      ElMessage.success({
        message: '密码重置成功！2秒后自动跳转到登录页面',
        duration: 2000,
        showClose: false
      })
      
      // 重置成功后跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error: any) {
    console.error('重置密码失败:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  // 检查重置token
  const token = route.query.token as string
  if (!token) {
    ElMessage.error('重置链接无效')
    router.push('/forgot-password')
  }
})
</script>

<style lang="scss" scoped>
.reset-password-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
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

.reset-password-content {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 20px;
  gap: 60px;
}

.reset-password-box {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.8s ease-out;
}

.reset-password-header {
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
  
  .reset-password-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  .reset-password-subtitle {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
}

.reset-password-form {
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
}

.reset-password-button {
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

.reset-password-footer {
  text-align: center;
  margin-top: 24px;
  
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
    
    .security-list {
      .security-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .security-icon {
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
        
        .security-content {
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
  overflow: hidden;
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
  .reset-password-content {
    gap: 40px;
  }
  
  .reset-password-box {
    max-width: 400px;
  }
  
  .info-panel {
    max-width: 380px;
  }
}

@media (max-width: 1024px) {
  .reset-password-content {
    flex-direction: column;
    gap: 40px;
    padding: 80px 20px 20px;
  }
  
  .info-panel {
    max-width: 420px;
    order: -1;
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
  
  .reset-password-content {
    padding: 80px 20px 20px;
    gap: 30px;
  }
  
  .reset-password-box {
    padding: 30px 20px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
  
  .reset-password-header {
    margin-bottom: 24px;
    
    .header-icon {
      width: 50px;
      height: 50px;
      font-size: 20px;
      border-radius: 14px;
    }
    
    .reset-password-title {
      font-size: 24px;
      margin-bottom: 6px;
    }
    
    .reset-password-subtitle {
      font-size: 13px;
      line-height: 1.4;
    }
  }
  
  .reset-password-form {
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
  
  .reset-password-button {
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
    padding: 30px 20px;
    border-radius: 20px;
    
    .panel-content {
      .panel-title {
        font-size: 20px;
        margin-bottom: 24px;
        line-height: 1.3;
      }
      
      .security-list {
        .security-item {
          gap: 12px;
          margin-bottom: 20px;
          
          .security-icon {
            width: 35px;
            height: 35px;
            font-size: 16px;
            border-radius: 10px;
          }
          
          .security-content {
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
  
  .reset-password-footer {
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
  
  .reset-password-content {
    padding: 60px 16px 16px;
    gap: 24px;
  }
  
  .reset-password-box {
    padding: 24px 16px;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
  
  .reset-password-header {
    margin-bottom: 20px;
    
    .header-icon {
      width: 45px;
      height: 45px;
      font-size: 18px;
      border-radius: 12px;
    }
    
    .reset-password-title {
      font-size: 22px;
      margin-bottom: 4px;
    }
    
    .reset-password-subtitle {
      font-size: 12px;
      line-height: 1.3;
    }
  }
  
  .reset-password-form {
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
  
  .reset-password-button {
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
      
      .security-list {
        .security-item {
          gap: 10px;
          margin-bottom: 16px;
          
          .security-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
            border-radius: 8px;
          }
          
          .security-content {
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
  
  .reset-password-footer {
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
  
  .reset-password-content {
    padding: 50px 12px 12px;
    gap: 20px;
  }
  
  .reset-password-box {
    padding: 20px 12px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  }
  
  .reset-password-header {
    margin-bottom: 16px;
    
    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
      border-radius: 10px;
    }
    
    .reset-password-title {
      font-size: 20px;
      margin-bottom: 3px;
    }
    
    .reset-password-subtitle {
      font-size: 11px;
      line-height: 1.2;
    }
  }
  
  .reset-password-form {
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
  
  .reset-password-button {
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
      
      .security-list {
        .security-item {
          gap: 8px;
          margin-bottom: 12px;
          
          .security-icon {
            width: 28px;
            height: 28px;
            font-size: 12px;
            border-radius: 6px;
          }
          
          .security-content {
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
  
  .reset-password-footer {
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
  .reset-password-container {
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
  
  .reset-password-box {
    background: rgba(45, 45, 45, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .reset-password-header {
      .reset-password-title {
        color: #ffffff;
      }
      
      .reset-password-subtitle {
        color: #a0a0a0;
      }
    }
    
    .reset-password-form {
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
    
    .reset-password-footer {
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
      
      .security-list {
        .security-item {
          .security-icon {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
          }
          
          .security-content {
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
