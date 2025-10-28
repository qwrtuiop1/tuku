<template>
  <div class="epass-callback-container">
    <div class="callback-content">
      <div class="loading-spinner" v-if="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>正在处理E通行证登录...</p>
      </div>
      
      <div class="error-message" v-else-if="error">
        <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="goToLogin">返回登录</el-button>
      </div>
      
      <div class="success-message" v-else-if="success">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <p>E通行证登录成功！</p>
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
    // 解析URL hash参数：#access_token=...&token_type=Bearer&expires_in=3600&state=...
    const hash = window.location.hash?.replace(/^#/, '') || ''
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const state = params.get('state') || ''
    const err = params.get('error')
    
    if (err) {
      throw new Error(`授权失败：${err}`)
    }
    if (!accessToken) {
      throw new Error('缺少access_token')
    }
    // 校验state
    const savedState = sessionStorage.getItem('epass_state') || ''
    if (savedState && state && savedState !== state) {
      throw new Error('状态校验失败，请重试')
    }
    
    // 发送到后端验证并换取本站JWT
    const response = await api.post('/auth/epass/callback', { accessToken, state })
    
    if (response.data.success) {
      if (response.data.signup_required) {
        const { tempToken, epass } = response.data
        const q = new URLSearchParams()
        q.set('token', tempToken)
        if (epass?.username) q.set('nickname', epass.username)
        if (epass?.avatar) q.set('avatar', epass.avatar)
        if (epass?.email) q.set('email', epass.email)
        router.push(`/auth/epass/signup?${q.toString()}`)
        return
      }
      // 标记绑定状态刷新
      try { sessionStorage.setItem('bindingsRefresh', '1') } catch {}
      if (state === 'bind') {
        success.value = true
        ElMessage.success('E通行证绑定成功，正在返回...')
        setTimeout(() => { router.push('/user-center') }, 1000)
        return
      }
      // 登录成功
      const { token, user, settings } = response.data
      authStore.token = token
      authStore.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('rememberMe', 'true')
      if (settings) localStorage.setItem('userSettings', JSON.stringify(settings))
      success.value = true
      ElMessage.success('登录成功！')
      setTimeout(() => { router.push('/') }, 1200)
    } else {
      throw new Error(response.data.message || '登录失败')
    }
  } catch (e: any) {
    error.value = e?.message || 'E通行证登录失败，请重试'
  } finally {
    loading.value = false
  }
})

const goToLogin = () => { router.push('/login') }
</script>

<style scoped>
.epass-callback-container { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; }
.callback-content { will-change: opacity, transform; animation: cardRise var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 60ms; }
.loading-spinner, .error-message, .success-message { will-change: opacity, transform; animation: rowFadeIn var(--anim-duration-fast) var(--anim-ease-decelerate) both; }

.epass-callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
}

.callback-content {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.is-loading { font-size: 32px; color: #4f46e5; }
.error-icon { font-size: 32px; color: #ef4444; }
.success-icon { font-size: 32px; color: #10b981; }

@keyframes blockFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardRise { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes rowFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .epass-callback-container *, .epass-callback-container :deep(*) { animation: none !important; transition: none !important; }
}
</style>


