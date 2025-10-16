import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  storage_limit: number
  used_storage: number
  avatar_url?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const storageUsage = computed(() => {
    if (!user.value) return 0
    return (user.value.used_storage / user.value.storage_limit) * 100
  })

  // 登录
  const login = async (credentials: { username: string; password: string }) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data
      
      // 处理头像URL，确保是完整的URL
      if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
        userData.avatar_url = baseUrl + userData.avatar_url
      }
      
      token.value = newToken
      user.value = userData
      localStorage.setItem('token', newToken)
      
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      const errorData = error.response?.data
      
      // 处理账户被禁用的情况
      if (errorData?.code === 'ACCOUNT_DISABLED') {
        ElMessage.error({
          message: '账户已被禁用，请联系管理员',
          duration: 5000,
          showClose: true
        })
      } else {
        ElMessage.error(errorData?.message || '登录失败')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: { username: string; email: string; password: string }) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', userData)
      const { token: newToken, user: userInfo } = response.data
      
      // 处理头像URL，确保是完整的URL
      if (userInfo.avatar_url && !userInfo.avatar_url.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
        userInfo.avatar_url = baseUrl + userInfo.avatar_url
      }
      
      token.value = newToken
      user.value = userInfo
      localStorage.setItem('token', newToken)
      
      ElMessage.success('注册成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '注册失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = (showMessage = true) => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    if (showMessage) {
      ElMessage.success('已登出')
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.get('/auth/me')
      const userData = response.data.user
      
      // 处理头像URL，确保是完整的URL
      if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
        userData.avatar_url = baseUrl + userData.avatar_url
      }
      
      user.value = userData
      return true
    } catch (error: any) {
      const errorData = error.response?.data
      
      // 处理账户被禁用的情况
      if (errorData?.code === 'ACCOUNT_DISABLED') {
        ElMessage.error({
          message: '账户已被禁用，请联系管理员',
          duration: 5000,
          showClose: true
        })
      }
      
      // 清除认证信息（不显示登出消息）
      logout(false)
      return false
    }
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  // 忘记密码
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      loading.value = true
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        ElMessage.success('重置链接已发送到您的邮箱')
        return true
      } else {
        ElMessage.error(response.data.message || '发送失败')
        return false
      }
    } catch (error: any) {
      const errorData = error.response?.data
      ElMessage.error(errorData?.message || '发送失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 重置密码
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      loading.value = true
      const response = await api.post('/auth/reset-password', { 
        token, 
        password: newPassword 
      })
      
      if (response.data.success) {
        return true
      } else {
        ElMessage.error(response.data.message || '重置失败')
        return false
      }
    } catch (error: any) {
      const errorData = error.response?.data
      ElMessage.error(errorData?.message || '重置失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    storageUsage,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    forgotPassword,
    resetPassword
  }
})


