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
  // 检查token是否有效（未过期）
  const isValidToken = (tokenValue: string, expiryValue: string | null): boolean => {
    if (!tokenValue || !expiryValue) return false
    
    const now = Date.now()
    const expiry = parseInt(expiryValue)
    
    // 如果过期时间小于当前时间，说明已过期
    if (expiry <= now) {
      return false
    }
    
    // 如果token在24小时内过期，提前刷新（可选）
    const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60)
    if (hoursUntilExpiry < 24) {
      console.log('Token将在24小时内过期，建议刷新')
    }
    
    return true
  }

  // 获取有效的token
  const getValidToken = (): string | null => {
    // 优先检查localStorage
    const localToken = localStorage.getItem('token')
    const localExpiry = localStorage.getItem('tokenExpiry')
    
    if (localToken && isValidToken(localToken, localExpiry)) {
      return localToken
    }
    
    // 如果localStorage无效，检查sessionStorage
    const sessionToken = sessionStorage.getItem('token')
    const sessionExpiry = sessionStorage.getItem('tokenExpiry')
    
    if (sessionToken && isValidToken(sessionToken, sessionExpiry)) {
      return sessionToken
    }
    
    // 如果都无效，清除所有存储
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('tokenExpiry')
    
    return null
  }

  // 初始化token
  const token = ref<string | null>(getValidToken())
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const storageUsage = computed(() => {
    if (!user.value) return 0
    return (user.value.used_storage / user.value.storage_limit) * 100
  })

  // 登录
  const login = async (credentials: { username: string; password: string; rememberMe?: boolean }) => {
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
      
      // 根据记住我选项决定存储方式和过期时间
      const now = Date.now()
      const expiryTime = credentials.rememberMe 
        ? now + (30 * 24 * 60 * 60 * 1000) // 30天
        : now + (7 * 24 * 60 * 60 * 1000)   // 7天
      
      if (credentials.rememberMe) {
        // 记住我：使用localStorage，30天过期
        localStorage.setItem('token', newToken)
        localStorage.setItem('tokenExpiry', expiryTime.toString())
        localStorage.setItem('rememberMe', 'true')
        // 清除sessionStorage
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('tokenExpiry')
      } else {
        // 不记住我：使用sessionStorage，7天过期
        sessionStorage.setItem('token', newToken)
        sessionStorage.setItem('tokenExpiry', expiryTime.toString())
        localStorage.removeItem('rememberMe')
        // 清除localStorage中的token
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExpiry')
      }
      
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
    
    // 清除所有存储
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('tokenExpiry')
    
    if (showMessage) {
      ElMessage.success('已登出')
    }
  }

  // 刷新token（如果即将过期）
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    if (!token.value) return false
    
    try {
      // 检查当前token的过期时间
      const localExpiry = localStorage.getItem('tokenExpiry')
      const sessionExpiry = sessionStorage.getItem('tokenExpiry')
      const expiry = localExpiry || sessionExpiry
      
      if (!expiry) return false
      
      const now = Date.now()
      const expiryTime = parseInt(expiry)
      const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60)
      
      // 如果token在24小时内过期，尝试刷新
      if (hoursUntilExpiry < 24 && hoursUntilExpiry > 0) {
        console.log('Token即将过期，尝试刷新...')
        
        const response = await api.post('/auth/refresh', { token: token.value })
        if (response.data.success) {
          const { token: newToken } = response.data
          
          // 更新token和过期时间
          token.value = newToken
          const newExpiryTime = now + (7 * 24 * 60 * 60 * 1000) // 新的7天过期时间
          
          // 根据当前存储方式更新
          if (localStorage.getItem('token')) {
            localStorage.setItem('token', newToken)
            localStorage.setItem('tokenExpiry', newExpiryTime.toString())
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('token', newToken)
            sessionStorage.setItem('tokenExpiry', newExpiryTime.toString())
          }
          
          console.log('Token刷新成功')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Token刷新失败:', error)
      return false
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (!token.value) return false
    
    // 尝试刷新token（如果需要）
    await refreshTokenIfNeeded()
    
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
    refreshTokenIfNeeded,
    updateUser,
    forgotPassword,
    resetPassword
  }
})


