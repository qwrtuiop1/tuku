<template>
  <div class="confirm-container">
    <!-- 复用登录页的顶部导航结构 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <el-icon class="logo-icon"><Picture /></el-icon>
          <span class="logo-text">图库系统</span>
        </div>
      </div>
    </div>

    <div class="confirm-content">
      <div class="confirm-box">
        <div class="confirm-header">
          <div class="header-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h1 class="confirm-title">注册确认</h1>
          <p class="confirm-subtitle">检测到您使用 {{ providerName }} 登录，本账户尚未在本站注册</p>
        </div>

        <div class="profile-preview" v-if="avatar || nickname || email">
          <img v-if="avatar" :src="avatar" alt="avatar" class="avatar" />
          <div class="profile-name" v-if="nickname">{{ nickname }}</div>
          <div class="email" v-if="email">{{ email }}</div>
        </div>

        <div class="confirm-message">
          <p>是否同意并立即注册为新用户，并自动登录？</p>
        </div>

        <div class="confirm-actions">
          <el-button class="cancel-btn" @click="goLogin" :disabled="submitting">取消</el-button>
          <el-button type="primary" class="agree-btn" @click="confirm" :loading="submitting">同意并登录</el-button>
        </div>
      </div>
    </div>

    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, UserFilled } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const provider = ref<string>((route.query.provider as string) || '')
const token = ref<string>((route.query.token as string) || '')
const avatar = ref<string | undefined>((route.query.avatar as string) || undefined)
const nickname = ref<string | undefined>((route.query.nickname as string) || undefined)
const email = ref<string | undefined>((route.query.email as string) || undefined)
const submitting = ref(false)

const providerName = computed(() => provider.value === 'epass' ? 'E通行证' : 'QQ')

onMounted(() => {
  if (!token.value || !provider.value) {
    ElMessage.error('注册确认信息无效，请重新登录')
    router.replace('/login')
  }
})

const confirm = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const endpoint = provider.value === 'epass' ? '/auth/epass/confirm-register' : '/auth/qq/confirm-register'
    const resp = await api.post(endpoint, { tempToken: token.value })
    if (!resp.data?.success) {
      throw new Error(resp.data?.message || '注册失败')
    }
    const { token: jwt, user, settings } = resp.data
    authStore.token = jwt
    authStore.user = user
    localStorage.setItem('token', jwt)
    localStorage.setItem('rememberMe', 'true')
    if (settings) localStorage.setItem('userSettings', JSON.stringify(settings))
    ElMessage.success('已注册并登录')
    router.replace('/')
  } catch (e: any) {
    ElMessage.error(e?.message || '注册失败，请重试')
    router.replace('/login')
  } finally {
    submitting.value = false
  }
}

const goLogin = () => {
  router.replace('/login')
}
</script>

<style scoped>
.confirm-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
}

.top-nav {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.nav-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.nav-logo { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 20px; color: #111111; }
.logo-text { color: #111111; font-size: 16px; font-weight: 600; }

.confirm-content {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}
.confirm-box {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 18px 36px rgba(0,0,0,0.08);
  padding: 28px 28px 24px;
  text-align: center;
}
.confirm-header { margin-bottom: 12px; }
.header-icon { display: flex; justify-content: center; margin-bottom: 8px; }
.header-icon .el-icon { font-size: 28px; color: #222222; }
.confirm-title { margin: 0; font-size: 22px; color: #111111; }
.confirm-subtitle { margin: 6px 0 0; font-size: 14px; color: #6b7280; }
.profile-preview { margin: 12px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb; }
.profile-name { max-width: 100%; font-size: 16px; font-weight: 600; color: #111827; overflow-wrap: anywhere; }
.email { font-size: 13px; color: #4b5563; }
.confirm-message { margin: 10px 0 16px; color: #374151; font-size: 14px; }
.confirm-actions { display: flex; justify-content: center; gap: 12px; }
.cancel-btn { background: transparent; color: #333333; border: 1px solid #d1d5db; }
.cancel-btn:hover { border-color: #6b7280; color: #111111; }
.agree-btn { background: #111111; border-color: #111111; color: #ffffff; }
.agree-btn:hover { background: #000000; border-color: #000000; color: #ffffff; }

.bg-decoration { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.floating-shape { position: absolute; width: 220px; height: 220px; border-radius: 50%; filter: blur(40px); opacity: 0.18; }
.shape-1 { background: #d4d4d4; left: -60px; top: 120px; }
.shape-2 { background: #c4c4c4; right: -70px; bottom: 120px; }
.shape-3 { background: #e5e5e5; left: 40%; bottom: -80px; width: 180px; height: 180px; }
</style>

