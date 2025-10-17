// 格式化文件大小
export const formatFileSize = (bytes: number | null | undefined): string => {
  // 处理各种无效值情况
  if (bytes === null || bytes === undefined || bytes === '' || isNaN(Number(bytes))) {
    return '0 B'
  }
  
  const numBytes = Number(bytes)
  if (numBytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}

// 获取文件类型图标
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'Picture'
  } else if (mimeType.startsWith('video/')) {
    return 'VideoPlay'
  } else {
    return 'Document'
  }
}

// 获取文件预览URL
export const getFilePreviewUrl = (fileId: number): string => {
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
  return `${baseUrl}/api/files/preview/${fileId}?token=${token}`
}

// 下载文件
export const downloadFile = (fileId: number, filename: string) => {
  const url = getFilePreviewUrl(fileId)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 生成随机ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// 验证邮箱格式
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证用户名格式
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// 格式化百分比（不四舍五入，只显示小数点后2位）
export const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) return '0.00%'
  if (value === 0) return '0.00%'
  
  // 使用Math.floor来截断而不是四舍五入
  const truncated = Math.floor(value * 100) / 100
  return truncated.toFixed(2) + '%'
}

// 获取存储使用百分比
export const getStorageUsagePercent = (used: number, total: number): number => {
  if (isNaN(used) || isNaN(total) || total === 0) return 0
  if (used === 0) return 0
  return Math.round((used / total) * 100)
}

// 获取存储使用状态颜色
export const getStorageUsageColor = (percent: number): string => {
  if (percent < 70) return '#67c23a'
  if (percent < 90) return '#e6a23c'
  return '#f56c6c'
}




