<template>
  <div class="qq-callback-container">
    <div class="callback-content">
      <div class="loading-spinner" v-if="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>正在处理QQ登录...</p>
      </div>
      
      <div class="error-message" v-else-if="error">
        <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="goToLogin">返回登录</el-button>
      </div>
      
      <div class="success-message" v-else-if="success">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <p>QQ登录成功！</p>
        <p>正在跳转...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleCloseFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    // 从URL参数获取授权码
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (!code) {
      throw new Error('授权码缺失')
    }
    
    // 发送授权码到后端
    const response = await api.post('/auth/qq/callback', { code })
    
    if (response.data.success) {
      // 登录成功，保存用户信息
      const { token, user, settings } = response.data
      
      authStore.token = token
      authStore.user = user
      // QQ登录默认使用localStorage（相当于记住我）
      localStorage.setItem('token', token)
      localStorage.setItem('rememberMe', 'true')
      
      // 保存用户设置
      if (settings) {
        localStorage.setItem('userSettings', JSON.stringify(settings))
      }
      
      success.value = true
      ElMessage.success('QQ登录成功！')
      
      // 延迟跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      throw new Error(response.data.message || 'QQ登录失败')
    }
  } catch (err: any) {
    error.value = err.message || 'QQ登录失败，请重试'
    loading.value = false
  }
})

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.qq-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.loading-spinner {
  .el-icon {
    font-size: 48px;
    color: #667eea;
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
}

.error-message {
  .error-icon {
    font-size: 48px;
    color: #f56c6c;
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    margin: 0 0 16px 0;
  }
}

.success-message {
  .success-icon {
    font-size: 48px;
    color: #67c23a;
    margin-bottom: 16px;
  }
  
  p {
    color: #666;
    font-size: 16px;
    margin: 0 0 8px 0;
    
    &:last-child {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>






