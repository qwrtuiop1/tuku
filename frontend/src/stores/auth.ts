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
  nickname?: string
  bio?: string
  created_at?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  
  // 检查JWT token是否有效（解析token检查过期时间）
  const isValidJWTToken = (tokenValue: string): boolean => {
    if (!tokenValue) return false
    
    try {
      // 解析JWT token（不验证签名，只检查过期时间）
      const payload = JSON.parse(atob(tokenValue.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      
      // 如果token过期，返回false
      if (payload.exp && payload.exp < now) {
        return false
      }
      
      return true
    } catch (error) {
      // 如果解析失败，认为token无效
      return false
    }
  }

  // 获取有效的token
  const getValidToken = (): string | null => {
    // 优先检查localStorage
    const localToken = localStorage.getItem('token')
    if (localToken && isValidJWTToken(localToken)) {
      return localToken
    }
    
    // 如果localStorage无效，检查sessionStorage
    const sessionToken = sessionStorage.getItem('token')
    if (sessionToken && isValidJWTToken(sessionToken)) {
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
      
      // 根据记住我选项决定存储方式
      if (credentials.rememberMe) {
        // 记住我：使用localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('rememberMe', 'true')
        // 清除sessionStorage
        sessionStorage.removeItem('token')
      } else {
        // 不记住我：使用sessionStorage
        sessionStorage.setItem('token', newToken)
        localStorage.removeItem('rememberMe')
        // 清除localStorage中的token
        localStorage.removeItem('token')
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
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('token')
    
    if (showMessage) {
      ElMessage.success('已登出')
    }
  }

  // 刷新token（如果即将过期）
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    if (!token.value) return false
    
    try {
      // 检查当前token的过期时间
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const hoursUntilExpiry = (payload.exp - now) / 3600
      
      // 如果token在24小时内过期，尝试刷新
      if (hoursUntilExpiry < 24 && hoursUntilExpiry > 0) {
        // Token即将过期，尝试刷新
        
        const response = await api.post('/auth/refresh', { token: token.value })
        if (response.data.success) {
          const { token: newToken } = response.data
          
          // 更新token
          token.value = newToken
          
          // 根据当前存储方式更新
          if (localStorage.getItem('token')) {
            localStorage.setItem('token', newToken)
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('token', newToken)
          }
          
          // Token刷新成功
          return true
        }
      }
      
      return false
      } catch (error) {
        // Token刷新失败
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


