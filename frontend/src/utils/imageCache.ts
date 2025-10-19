// 图片缓存服务
interface CacheItem {
  url: string
  blob: Blob
  timestamp: number
  fileId: number
}

class ImageCacheService {
  private cache = new Map<string, CacheItem>()
  private readonly MAX_CACHE_SIZE = 50 // 最大缓存数量
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24小时过期

  // 生成缓存键
  private getCacheKey(fileId: number, token: string): string {
    return `${fileId}_${token.slice(-8)}` // 使用文件ID和token后8位
  }

  // 检查缓存是否存在且有效
  hasCache(fileId: number, token: string): boolean {
    const key = this.getCacheKey(fileId, token)
    const item = this.cache.get(key)
    
    if (!item) return false
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  // 获取缓存的图片URL
  getCacheUrl(fileId: number, token: string): string | null {
    const key = this.getCacheKey(fileId, token)
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
      this.cache.delete(key)
      return null
    }
    
    return item.url
  }

  // 缓存图片
  async cacheImage(fileId: number, token: string, imageUrl: string): Promise<void> {
    try {
      // 检查是否已缓存
      if (this.hasCache(fileId, token)) {
        return
      }

      // 清理过期缓存
      this.cleanExpiredCache()

      // 如果缓存已满，删除最旧的
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.removeOldestCache()
      }

      // 获取图片数据，添加重试机制
      let response: Response | null = null
      let lastError: Error | null = null
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
              'Accept': 'image/*'
            },
            // 添加超时控制
            signal: AbortSignal.timeout(10000) // 10秒超时
          })
          
          if (response.ok) {
            break
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (error) {
          lastError = error as Error
          console.warn(`图片缓存尝试 ${attempt}/3 失败:`, error)
          
          if (attempt < 3) {
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('图片获取失败')
      }

      const blob = await response.blob()
      
      // 检查blob是否有效
      if (blob.size === 0) {
        throw new Error('图片数据为空')
      }
      
      const url = URL.createObjectURL(blob)

      const key = this.getCacheKey(fileId, token)
      this.cache.set(key, {
        url,
        blob,
        timestamp: Date.now(),
        fileId
      })

      console.log(`图片已缓存: ${fileId}`)
    } catch (error) {
      console.warn('图片缓存失败:', error)
      // 不抛出错误，避免影响正常显示
    }
  }

  // 清理过期缓存
  private cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.CACHE_EXPIRY) {
        URL.revokeObjectURL(item.url)
        this.cache.delete(key)
      }
    }
  }

  // 删除最旧的缓存
  private removeOldestCache(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      const item = this.cache.get(oldestKey)
      if (item) {
        URL.revokeObjectURL(item.url)
        this.cache.delete(oldestKey)
      }
    }
  }

  // 清除所有缓存
  clearCache(): void {
    for (const item of this.cache.values()) {
      URL.revokeObjectURL(item.url)
    }
    this.cache.clear()
  }

  // 获取缓存统计信息
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    }
  }
}

// 导出单例实例
export const imageCache = new ImageCacheService()

// 导出类型
export type { CacheItem }
