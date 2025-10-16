import { ref, computed, readonly, Ref } from 'vue'
export const breakpoints = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1200,
  xl: 1920
} as const

// 媒体查询工具
export const mediaQueries = {
  xs: `@media (max-width: ${breakpoints.xs}px)`,
  sm: `@media (max-width: ${breakpoints.sm}px)`,
  md: `@media (max-width: ${breakpoints.md}px)`,
  lg: `@media (max-width: ${breakpoints.lg}px)`,
  xl: `@media (max-width: ${breakpoints.xl}px)`,
  xsUp: `@media (min-width: ${breakpoints.xs + 1}px)`,
  smUp: `@media (min-width: ${breakpoints.sm + 1}px)`,
  mdUp: `@media (min-width: ${breakpoints.md + 1}px)`,
  lgUp: `@media (min-width: ${breakpoints.lg + 1}px)`,
  xlUp: `@media (min-width: ${breakpoints.xl + 1}px)`
} as const

// 检测当前屏幕尺寸
export const getCurrentBreakpoint = (): keyof typeof breakpoints => {
  const width = window.innerWidth
  
  if (width <= breakpoints.xs) return 'xs'
  if (width <= breakpoints.sm) return 'sm'
  if (width <= breakpoints.md) return 'md'
  if (width <= breakpoints.lg) return 'lg'
  return 'xl'
}

// 检测是否为移动设备
export const isMobile = (): boolean => {
  return window.innerWidth <= breakpoints.sm
}

// 检测是否为平板设备
export const isTablet = (): boolean => {
  return window.innerWidth > breakpoints.sm && window.innerWidth <= breakpoints.md
}

// 检测是否为桌面设备
export const isDesktop = (): boolean => {
  return window.innerWidth > breakpoints.md
}

// 响应式监听器
export const useResponsive = () => {
  const currentBreakpoint = ref(getCurrentBreakpoint())
  
  const updateBreakpoint = () => {
    currentBreakpoint.value = getCurrentBreakpoint()
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateBreakpoint)
  }
  
  return {
    currentBreakpoint: readonly(currentBreakpoint),
    isMobile: computed(() => isMobile()),
    isTablet: computed(() => isTablet()),
    isDesktop: computed(() => isDesktop())
  }
}

// 动画工具
export const animations = {
  // 淡入动画
  fadeIn: {
    enter: {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    enterActive: {
      transition: 'all 0.3s ease-out'
    },
    enterTo: {
      opacity: 1,
      transform: 'translateY(0)'
    },
    leave: {
      opacity: 1,
      transform: 'translateY(0)'
    },
    leaveActive: {
      transition: 'all 0.3s ease-in'
    },
    leaveTo: {
      opacity: 0,
      transform: 'translateY(-20px)'
    }
  },
  
  // 滑入动画
  slideIn: {
    enter: {
      transform: 'translateX(-100%)'
    },
    enterActive: {
      transition: 'transform 0.3s ease-out'
    },
    enterTo: {
      transform: 'translateX(0)'
    },
    leave: {
      transform: 'translateX(0)'
    },
    leaveActive: {
      transition: 'transform 0.3s ease-in'
    },
    leaveTo: {
      transform: 'translateX(100%)'
    }
  },
  
  // 缩放动画
  scaleIn: {
    enter: {
      opacity: 0,
      transform: 'scale(0.8)'
    },
    enterActive: {
      transition: 'all 0.3s ease-out'
    },
    enterTo: {
      opacity: 1,
      transform: 'scale(1)'
    },
    leave: {
      opacity: 1,
      transform: 'scale(1)'
    },
    leaveActive: {
      transition: 'all 0.3s ease-in'
    },
    leaveTo: {
      opacity: 0,
      transform: 'scale(0.8)'
    }
  }
}

// 懒加载工具
export const useLazyLoad = (options: IntersectionObserverInit = {}) => {
  const target = ref<HTMLElement>()
  const isIntersecting = ref(false)
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isIntersecting.value = entry.isIntersecting
      })
    },
    {
      threshold: 0.1,
      ...options
    }
  )
  
  if (typeof window !== 'undefined') {
    if (target.value) {
      observer.observe(target.value)
    }
  }
  
  return {
    target,
    isIntersecting: readonly(isIntersecting)
  }
}

// 虚拟滚动工具
export const useVirtualScroll = (
  items: Ref<any[]>,
  itemHeight: number,
  containerHeight: number
) => {
  const scrollTop = ref(0)
  const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
  const endIndex = computed(() => 
    Math.min(
      startIndex.value + Math.ceil(containerHeight / itemHeight) + 1,
      items.value.length
    )
  )
  
  const visibleItems = computed(() => 
    items.value.slice(startIndex.value, endIndex.value)
  )
  
  const totalHeight = computed(() => items.value.length * itemHeight)
  
  const offsetY = computed(() => startIndex.value * itemHeight)
  
  return {
    scrollTop,
    visibleItems,
    totalHeight,
    offsetY
  }
}

// 性能优化工具
export const performance = {
  // 防抖
  debounce: <T extends (...args: any[]) => any>(
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
  },
  
  // 节流
  throttle: <T extends (...args: any[]) => any>(
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
  },
  
  // 请求缓存
  createCache: <T>(maxSize: number = 100) => {
    const cache = new Map<string, T>()
    
    return {
      get: (key: string): T | undefined => {
        const value = cache.get(key)
        if (value) {
          // 重新设置以更新访问顺序
          cache.delete(key)
          cache.set(key, value)
        }
        return value
      },
      
      set: (key: string, value: T): void => {
        if (cache.size >= maxSize) {
          // 删除最旧的项
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
        cache.set(key, value)
      },
      
      clear: (): void => {
        cache.clear()
      },
      
      size: (): number => cache.size
    }
  }
}

// 主题工具
export const theme = {
  // 检测系统主题
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  },
  
  // 切换主题
  toggleTheme: (): 'light' | 'dark' => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
    
    return newTheme
  },
  
  // 设置主题
  setTheme: (theme: 'light' | 'dark'): void => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  },
  
  // 获取当前主题
  getCurrentTheme: (): 'light' | 'dark' => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme as 'light' | 'dark'
    }
    return theme.getSystemTheme()
  }
}
