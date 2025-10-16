import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1秒
  retryDelayMultiplier: 2 // 每次重试延迟翻倍
}

// 重试函数
const retryRequest = async (config: any, retryCount = 0): Promise<any> => {
  try {
    return await axios(config)
  } catch (error: any) {
    if (error.response?.status === 429 && retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryDelayMultiplier, retryCount)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(config, retryCount + 1)
    }
    throw error
  }
}

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'https://tukubackend.vtart.cn/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 优先从localStorage获取token，然后从sessionStorage获取
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const { response, config } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          const authStore = useAuthStore()
          authStore.logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 400:
          // 客户端错误
          ElMessage.error(data.message || '请求失败')
          break
        case 403:
          // 检查是否是账户被禁用
          if (data.code === 'ACCOUNT_DISABLED') {
            // 不显示错误信息，让登录页面处理
            // 不调用logout，避免显示"已登出"
          } else {
            ElMessage.error(data.message || '权限不足')
          }
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 422:
          // 验证错误
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: any) => {
              ElMessage.error(err.msg || err.message)
            })
          } else {
            ElMessage.error(data.message || '数据验证失败')
          }
          break
        case 429:
          // 请求过于频繁，尝试重试
          try {
            return await retryRequest(config)
          } catch (retryError) {
            ElMessage.warning({
              message: '请求过于频繁，请稍后再试',
              duration: 3000,
              showClose: true
            })
          }
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时')
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败')
    } else {
      ElMessage.error('请求失败')
    }
    
    return Promise.reject(error)
  }
)

export default api


