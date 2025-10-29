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

    <GlassConfirmModal
      :visible="showConfirm"
      title="是否注册并登录？"
      :message="'检测到该 QQ 尚未在本站注册。是否立即注册并登录？'"
      confirm-text="注册并登录"
      cancel-text="取消"
      :avatar="profile.avatar"
      provider-name="QQ"
      @confirm="confirmRegister"
      @cancel="cancelRegister"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleCloseFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/api'
import GlassConfirmModal from '@/components/GlassConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const showConfirm = ref(false)
const tempToken = ref('')
const profile = ref<{ avatar?: string }>({})

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
    // 如果 state=bind，则走绑定流程
    const payload: any = { code }
    if (state) payload.state = state
    const response = await api.post('/auth/qq/callback', payload)
    
    if (response.data.success) {
      // 首次登录需确认注册（兼容旧字段 signup_required）
      if (response.data.needs_confirm || response.data.signup_required) {
        const t = response.data.tempToken
        const avatar = response.data.profile?.avatar || response.data.qq?.avatar || ''
        router.replace({ name: 'SignupConfirm', query: { provider: 'qq', token: t, avatar } })
        return
      }
      // 标记需要刷新绑定状态
      try { sessionStorage.setItem('bindingsRefresh', '1') } catch {}
      // 绑定流程仅提示成功并回到设置页
      if (state === 'bind') {
        success.value = true
        ElMessage.success('QQ绑定成功，正在返回...')
        setTimeout(() => { router.push('/user-center') }, 1000)
        return
      }
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

const confirmRegister = async () => {
  try {
    const resp = await api.post('/auth/qq/confirm-register', { tempToken: tempToken.value })
    if (!resp.data?.success) throw new Error(resp.data?.message || '注册失败')
    const { token, user, settings } = resp.data
    const authStore = useAuthStore()
    authStore.token = token
    authStore.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('rememberMe', 'true')
    if (settings) localStorage.setItem('userSettings', JSON.stringify(settings))
    ElMessage.success('已注册并登录')
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.message || '注册失败，请重试')
    router.push('/login')
  }
}

const cancelRegister = () => {
  ElMessage.info('已取消注册')
  router.push('/login')
}
</script>

<style scoped>
/***** 统一入场动效（QQCallback） *****/
.qq-callback-container { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; }
.callback-content { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 60ms; }
.loading-spinner, .error-message, .success-message { will-change: opacity, transform; animation: rowFadeIn var(--anim-duration-fast) var(--anim-ease-decelerate) both; }

@keyframes blockFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardRise { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes rowFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .qq-callback-container *, .qq-callback-container :deep(*) { animation: none !important; transition: none !important; }
}

/* 原样式 */
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






