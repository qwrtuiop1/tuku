import { createRouter, createWebHistory } from 'vue-router'
import Register from '@/views/Register.vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      title: '登录',
      requiresAuth: false,
      transition: 'auth-slide'
    }
  },
  {
    path: '/auth/callback',
    name: 'EPassCallback',
    component: () => import('@/views/EPassCallback.vue'),
    meta: { 
      title: 'E通行证登录回调',
      requiresAuth: false 
    }
  },
  {
    path: '/auth/qq/callback',
    name: 'QQCallback',
    component: () => import('@/views/QQCallback.vue'),
    meta: { 
      title: 'QQ登录回调',
      requiresAuth: false 
    }
  },
  // 兼容QQ互联后台配置的回调地址 /api/auth/qq/callback
  {
    path: '/api/auth/qq/callback',
    name: 'QQCallbackApiAlias',
    component: () => import('@/views/QQCallback.vue'),
    meta: {
      title: 'QQ登录回调',
      requiresAuth: false
    }
  },
  
  {
    path: '/auth/confirm-register',
    name: 'SignupConfirm',
    component: () => import('@/views/SignupConfirm.vue'),
    meta: { 
      title: '注册确认',
      requiresAuth: false 
    }
  },
  
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: '注册',
      requiresAuth: false,
      transition: 'auth-slide'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { 
      title: '忘记密码',
      requiresAuth: false,
      transition: 'auth-slide'
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { 
      title: '重置密码',
      requiresAuth: false 
    }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenancePage.vue'),
    meta: { 
      title: '系统维护',
      requiresAuth: false 
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { 
      title: '图库系统',
      requiresAuth: true 
    },
    children: [
      {
        path: '',
        name: 'Files',
        component: () => import('@/views/Files.vue'),
        meta: { 
          title: '文件管理',
          requiresAuth: true 
        }
      },
      {
        path: '/live-share',
        name: 'LiveShare',
        component: () => import('@/views/LiveShare.vue'),
        meta: {
          title: '动图分享',
          requiresAuth: false
        }
      },
      {
        path: '/share/:token',
        name: 'ShareViewer',
        component: () => import('@/views/ShareViewer.vue'),
        meta: {
          title: '文件分享',
          requiresAuth: false
        }
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { 
          title: '仪表盘',
          requiresAuth: true 
        }
      },
      {
        path: '/admin',
        name: 'AdminCenter',
        component: () => import('@/views/AdminCenter.vue'),
        meta: { 
          title: '管理中心',
          requiresAuth: true,
          requiresAdmin: true 
        }
      },
      {
        path: '/user-center',
        name: 'UserCenter',
        component: () => import('@/views/UserCenter.vue'),
        meta: { 
          title: '个人设置',
          requiresAuth: true 
        }
      },
      
      {
        path: '/settings',
        redirect: { path: '/admin', query: { section: 'settings' } }
      },
      {
        path: '/notifications',
        name: 'NotificationHistory',
        component: () => import('@/views/NotificationHistory.vue'),
        meta: {
          title: '通知管理',
          requiresAuth: true
        }
      },
      {
        path: '/recycle-bin',
        name: 'RecycleBin',
        component: () => import('@/views/RecycleBin.vue'),
        meta: {
          title: '回收站',
          requiresAuth: true
        }
      },
      {
        path: '/albums',
        name: 'Albums',
        component: () => import('@/views/Albums.vue'),
        meta: {
          title: '我的相册',
          requiresAuth: true
        }
      },
      {
        path: '/albums/:id',
        name: 'AlbumDetail',
        component: () => import('@/views/AlbumDetail.vue'),
        meta: {
          title: '相册详情',
          requiresAuth: true
        }
      },
      {
        path: '/help',
        name: 'HelpCenter',
        component: () => import('@/views/HelpCenter.vue'),
        meta: {
          title: '帮助中心',
          requiresAuth: false
        }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { 
      title: '页面不存在',
      requiresAuth: false 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 优化路由切换性能
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 图库系统` : '图库系统'
  
  // 检查维护模式（除了登录、注册、维护页面本身）
  if (!['Login', 'Register', 'Maintenance', 'QQCallback', 'EPassCallback', 'SignupConfirm'].includes(to.name as string)) {
    try {
      // 获取当前token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      // 使用公共接口检查维护模式，而不是管理员接口
      const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
      const maintenanceUrl = baseUrl ? `${baseUrl}/api/system/maintenance-status` : '/api/system/maintenance-status'
      const response = await fetch(maintenanceUrl, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const isMaintenanceMode = data.maintenance_mode === true
        
        if (isMaintenanceMode) {
          // 检查用户是否为管理员
          const authStore = useAuthStore()
          if (!authStore.user || authStore.user.role !== 'admin') {
            next('/maintenance')
            return
          }
        }
      }
    } catch (error) {
      // 如果检查失败，继续正常流程
      // 维护模式检查失败，继续正常路由
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    
    // 检查是否有token
    if (!authStore.token) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    // 检查用户信息是否存在，如果不存在则尝试获取
    if (!authStore.user) {
      try {
        const success = await authStore.checkAuth()
        if (!success) {
          // 如果用户有token但checkAuth失败，可能是网络问题，给用户一个机会
          if (authStore.token) {
            ElMessage.warning('网络连接异常，请稍后重试')
            next('/')
            return
          } else {
            ElMessage.warning('登录已过期，请重新登录')
            next('/login')
            return
          }
        }
      } catch (error) {
        ElMessage.warning('登录验证失败，请重新登录')
        next('/login')
        return
      }
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      const authStore = useAuthStore()
      if (!authStore.user || authStore.user.role !== 'admin') {
        ElMessage.error('需要管理员权限')
        next('/')
        return
      }
    }
  }
  
  // 已登录用户访问登录页面，重定向到首页
  if ((to.name === 'Login' || to.name === 'Register')) {
    const authStore = useAuthStore()
    if (authStore.token && authStore.user) {
      next('/')
      return
    }
  }
  
  // 密码重置页面需要token参数
  if (to.name === 'ResetPassword') {
    const token = to.query.token
    if (!token) {
      ElMessage.error('重置链接无效')
      next('/forgot-password')
      return
    }
  }
  
  next()
})

export default router
