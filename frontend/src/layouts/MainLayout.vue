<template>
  <div class="main-layout anim-root">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !sidebarCollapsed" 
      class="mobile-overlay"
      @click="closeSidebar"
    ></div>
    
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 
      collapsed: sidebarCollapsed,
      'mobile-sidebar': isMobile,
      'mobile-open': isMobile && !sidebarCollapsed
    }">
      <div class="sidebar-header">
        <div class="logo" @click="expandSidebar">
          <img src="/logo.png" alt="图库系统" class="logo-image" loading="lazy" decoding="async" />
          <span v-if="!sidebarCollapsed" class="logo-text">图库系统</span>
        </div>
        <el-button
          v-if="!sidebarCollapsed"
          type="text"
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <el-icon v-if="isMobile" class="tri-icon">
            <svg viewBox="0 0 1024 1024" aria-hidden="true">
              <!-- 三条菜单横线：黑色 -->
              <rect x="128" y="192" width="768" height="80" rx="16" ry="16" fill="#111827" />
              <rect x="128" y="472" width="512" height="80" rx="16" ry="16" fill="#111827" />
              <rect x="128" y="752" width="768" height="80" rx="16" ry="16" fill="#111827" />
              <!-- 左侧折叠箭头：灰色，白描边 -->
              <polygon points="320,384 128,512 320,640" fill="#6B7280" stroke="#FFFFFF" stroke-width="24" stroke-linejoin="round" />
            </svg>
          </el-icon>
          <el-icon v-else>
            <Fold />
          </el-icon>
        </el-button>
      </div>
      
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          router
          @select="handleMenuSelect"
        >
          <!-- 所有用户通用菜单 -->
          <el-menu-item index="/">
            <el-icon><Folder /></el-icon>
            <span>文件管理</span>
          </el-menu-item>
          
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <!-- 管理员也显示个人设置（在管理中心之上） -->
          <el-menu-item v-if="authStore.isAdmin" index="/user-center">
            <el-icon><User /></el-icon>
            <span>个人设置</span>
          </el-menu-item>
          
          <!-- 管理员专用菜单 -->
          <el-menu-item v-if="authStore.isAdmin" index="/admin">
            <el-icon><Setting /></el-icon>
            <span>管理中心</span>
          </el-menu-item>
          
          <!-- 普通用户菜单 -->
          <el-menu-item v-if="!authStore.isAdmin" index="/user-center">
            <el-icon><User /></el-icon>
            <span>个人设置</span>
          </el-menu-item>
        </el-menu>
      </nav>
      
      <div class="sidebar-footer" :class="{ collapsed: sidebarCollapsed }">
        <div class="user-info" :class="{ collapsed: sidebarCollapsed }">
          <el-avatar :size="32" :src="authStore.user?.avatar_url">
            {{ authStore.user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div v-if="!sidebarCollapsed" class="user-details">
            <div class="username">{{ authStore.user?.username }}</div>
            <div class="user-role">{{ authStore.user?.role === 'admin' ? '管理员' : '用户' }}</div>
          </div>
        </div>
        
        <el-dropdown @command="handleUserCommand" placement="top-end" popper-class="user-menu-popper">
          <el-button type="text" class="user-menu-btn" :class="{ collapsed: sidebarCollapsed }">
            <el-icon v-if="isMobile" class="tri-icon">
              <svg viewBox="0 0 1024 1024" aria-hidden="true">
                <!-- 三个圆点：黑、深灰、白(灰描边) -->
                <circle cx="352" cy="512" r="64" fill="#111827" />
                <circle cx="512" cy="512" r="64" fill="#6B7280" />
                <circle cx="672" cy="512" r="64" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="20" />
              </svg>
            </el-icon>
            <el-icon v-else><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="authStore.isAdmin" command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <!-- 移动端菜单按钮 -->
          <el-button
            v-if="isMobile"
            type="text"
            class="mobile-menu-btn"
            @click="toggleSidebar"
          >
            <el-icon class="tri-grid-icon">
              <svg viewBox="0 0 1024 1024" aria-hidden="true">
                <rect x="160" y="160" width="320" height="320" fill="#111827" rx="24" ry="24" />
                <rect x="544" y="160" width="320" height="320" fill="#6B7280" rx="24" ry="24" />
                <rect x="160" y="544" width="320" height="320" fill="#9CA3AF" rx="24" ry="24" />
                <rect x="544" y="544" width="320" height="320" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="24" rx="24" ry="24" />
              </svg>
            </el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb-nav">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 存储使用情况 -->
          <div class="storage-info" :class="{ 'mobile-hidden': isMobile }">
            <el-progress
              :percentage="authStore.storageUsage"
              :color="getStorageColor(authStore.storageUsage)"
              :stroke-width="6"
              :show-text="false"
              class="storage-progress"
            />
            <span class="storage-text">
              {{ formatFileSize(authStore.user?.used_storage || 0) }} / 
              {{ formatFileSize(authStore.user?.storage_limit || 0) }}
            </span>
          </div>
          
          <!-- 移动端存储信息 -->
          <div v-if="isMobile" class="mobile-storage">
            <el-tooltip :content="`存储使用: ${formatPercentage(authStore.storageUsage)}`" placement="bottom">
              <el-progress
                :percentage="authStore.storageUsage"
                :color="getStorageColor(authStore.storageUsage)"
                :stroke-width="12"
                :show-text="false"
                class="mobile-storage-progress"
              />
            </el-tooltip>
          </div>
          
          <!-- 桌面端用户头像和菜单 -->
          <el-dropdown v-if="!isMobile" @command="handleUserCommand" placement="bottom-end" popper-class="user-menu-popper">
            <div class="desktop-user-info">
              <el-avatar :size="32" :src="authStore.user?.avatar_url">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ authStore.user?.username }}</div>
                <div class="user-role">{{ authStore.user?.role === 'admin' ? '管理员' : '用户' }}</div>
              </div>
              <el-icon class="dropdown-arrow" v-if="!isMobile"><ArrowDown /></el-icon>
              <el-icon class="dropdown-arrow tri-icon" v-else>
                <svg viewBox="0 0 1024 1024" aria-hidden="true">
                  <!-- 四格：黑/深灰/中灰/白描边 -->
                  <rect x="160" y="160" width="320" height="320" fill="#111827" rx="24" ry="24" />
                  <rect x="544" y="160" width="320" height="320" fill="#6B7280" rx="24" ry="24" />
                  <rect x="160" y="544" width="320" height="320" fill="#9CA3AF" rx="24" ry="24" />
                  <rect x="544" y="544" width="320" height="320" fill="#FFFFFF" stroke="#9CA3AF" stroke-width="24" rx="24" ry="24" />
                </svg>
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="authStore.isAdmin" command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 移动端用户菜单 -->
          <el-dropdown 
            v-if="isMobile" 
            @command="handleUserCommand" 
            placement="bottom-end"
            popper-class="user-menu-popper"
            :visible="mobileUserMenuVisible"
            @visible-change="handleMobileUserMenuVisibleChange"
          >
            <el-button type="text" class="mobile-user-btn" @click="toggleMobileUserMenu">
              <el-avatar :size="24" :src="authStore.user?.avatar_url">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="authStore.isAdmin" command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 顶部通知横条（紧贴头部下方） -->
      <div class="global-notifications banner" v-if="hasUnreadNotifications">
        <div class="notification-summary" :class="highestPriorityClass" @click="openNotificationsDialog">
          <span class="summary-text">有 {{ unreadNotificationCount }} 条通知</span>
          <el-icon class="summary-arrow"><ArrowDown /></el-icon>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <KeepAlive>
          <transition name="page-slide" mode="out-in" :duration="animationEnabled ? 300 : 0">
            <div v-if="Component" class="page-wrapper">
              <component :is="Component" />
            </div>
          </transition>
          </KeepAlive>
        </router-view>
      </main>
    </div>
    
    <!-- 通知悬浮窗：批量展示与详情 -->
    <el-dialog
      v-model="notificationsDialogVisible"
      title="通知"
      :width="isMobile ? '95%' : '700px'"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      :append-to-body="true"
      class="notifications-dialog"
      @opened="onDialogOpened"
      @closed="onDialogClosed"
    >
      <div class="notifications-dialog-body">
        <!-- 通知列表面板 -->
        <div class="notifications-list-panel">
          <div class="list-header">
            <h3 class="list-title">通知列表</h3>
            <span class="notification-count">{{ allNotifications.length }} 条通知</span>
          </div>
          
          <el-scrollbar class="notifications-scrollbar">
            <div v-if="allNotifications.length === 0" class="empty-list">
              <div class="empty-icon">📭</div>
              <p class="empty-text">暂无通知</p>
            </div>
            <div
              v-for="n in allNotifications"
              :key="n.id"
              :class="['notification-item', `priority-${n.priority}`, { 
                active: detailNotification && detailNotification.id === n.id, 
                'is-read': n.is_read 
              }]"
              @click="openNotificationDetail(n)"
            >
              <div class="notification-content">
                <div class="notification-title">{{ n.title || '无标题' }}</div>
                <div class="notification-meta">
                  <span class="notification-type">{{ getNotificationTypeText(n.notification_type) }}</span>
                  <span class="notification-priority priority-{{ n.priority }}">{{ getPriorityText(n.priority) }}</span>
                  <span v-if="n.is_read" class="read-badge">已读</span>
                </div>
                <div class="notification-time">{{ formatDateTime(n.created_at) }}</div>
              </div>
              <div class="notification-indicator">
                <div v-if="!n.is_read" class="unread-dot"></div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        
        <!-- 通知详情面板 -->
        <div class="notifications-detail-panel">
          <div v-if="detailNotification" class="detail-content">
            <div class="detail-header">
              <h3 class="detail-title">{{ detailNotification.title || '无标题' }}</h3>
              <div class="detail-badges">
                <span class="detail-type">{{ getNotificationTypeText(detailNotification.notification_type) }}</span>
                <span class="detail-priority priority-{{ detailNotification.priority }}">
                  {{ getPriorityText(detailNotification.priority) }}
                </span>
                <span v-if="detailNotification.is_read" class="read-badge">已读</span>
                <span v-else class="unread-badge">未读</span>
              </div>
            </div>
            
            <div class="detail-body">
              <div class="detail-text">{{ detailNotification.content || '暂无内容' }}</div>
            </div>
            
            <div class="detail-footer">
              <div class="detail-time">
                <i class="el-icon-time"></i>
                {{ formatDateTime(detailNotification.created_at) }}
                <span v-if="detailNotification.read_at" class="read-time">
                  · 已读于 {{ formatDateTime(detailNotification.read_at) }}
                </span>
              </div>
              <div class="detail-actions">
                <el-button 
                  v-if="!detailNotification.is_read"
                  type="primary" 
                  size="small" 
                  @click="markNotificationAsRead(detailNotification.id)"
                >
                  标记为已读
                </el-button>
                <el-button size="small" @click="closeNotification(detailNotification.id)">
                  关闭
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-else class="detail-empty">
            <div class="empty-icon">👆</div>
            <h3 class="empty-title">选择通知查看详情</h3>
            <p class="empty-description">点击左侧通知列表中的任意一条通知，即可查看详细内容</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 移动端底部导航栏 -->
    <div v-if="isMobile" class="mobile-bottom-nav">
      <div class="nav-items">
        <div 
          class="nav-item" 
          :class="{ active: $route.path === '/' }"
          @click="$router.push('/')"
        >
          <el-icon class="nav-icon"><Folder /></el-icon>
          <span class="nav-text">文件</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: $route.path === '/dashboard' }"
          @click="$router.push('/dashboard')"
        >
          <el-icon class="nav-icon"><House /></el-icon>
          <span class="nav-text">仪表盘</span>
        </div>
        
        <div 
          v-if="authStore.user?.role === 'admin'"
          class="nav-item" 
          :class="{ active: $route.path === '/admin' }"
          @click="$router.push('/admin')"
        >
          <el-icon class="nav-icon"><Setting /></el-icon>
          <span class="nav-text">管理</span>
        </div>
        
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import {
  Fold,
  House,
  Folder,
  Setting,
  MoreFilled,
  User,
  SwitchButton,
  ArrowDown,
  Bell
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { formatFileSize, getStorageUsageColor, formatPercentage } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isDragging = ref(false)
const isDevelopment = ref(process.env.NODE_ENV === 'development')
const devLog = (...args: any[]) => { if (isDevelopment.value) { console.log(...args) } }
const animationEnabled = ref(true) // 页面动画控制
const mobileUserMenuVisible = ref(false) // 移动端用户菜单显示状态

// 通知类型定义
interface NotificationItem {
  id: number
  title?: string
  content?: string
  priority: 'low' | 'normal' | 'high' | 'urgent' | string
  notification_type: string
  is_read: boolean | number
  created_at: string
  read_at?: string | null
}

// 全局通知相关
const globalNotifications = ref<NotificationItem[]>([])
const allNotifications = ref<NotificationItem[]>([])
const notificationCheckInterval = ref<ReturnType<typeof setInterval> | null>(null)
const notificationsDialogVisible = ref(false)
const detailNotification = ref<NotificationItem | null>(null)
const eventSource = ref<EventSource | null>(null)
const sseConnected = ref(false)
let notificationsAbortController: AbortController | null = null

// 检测屏幕尺寸
const checkScreenSize = () => {
  const width = window.innerWidth
  // 使用更精确的断点判断
  isMobile.value = width < 768
  // 根据屏幕尺寸决定侧边栏状态
  if (width < 768) {
    // 移动端默认收起侧边栏
    sidebarCollapsed.value = true
  } else if (width < 1024) {
    // 平板端默认收起侧边栏
    sidebarCollapsed.value = true
  } else {
    // 桌面端保持展开状态
    sidebarCollapsed.value = false
  }
}

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑导航
const breadcrumbs = computed(() => {
  const breadcrumbMap: Record<string, { name: string; path: string }> = {
    '/': { name: '文件管理', path: '/' },
    '/dashboard': { name: '仪表盘', path: '/dashboard' },
    '/admin': { name: '管理控制台', path: '/admin' },
    '/settings': { name: '系统设置', path: '/settings' },
    '/user-center': { name: '个人设置', path: '/user-center' }
  }
  
  return breadcrumbMap[route.path] ? [breadcrumbMap[route.path]] : []
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 展开侧边栏
const expandSidebar = () => {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
  }
}

// 关闭侧边栏（移动端）
const closeSidebar = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}


// 获取存储使用颜色
const getStorageColor = (percentage: number) => {
  return getStorageUsageColor(percentage)
}

// 处理菜单选择
const handleMenuSelect = () => {
  // 移动端选择菜单后自动关闭侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

// 处理用户菜单命令
const handleUserCommand = async (command: string) => {
  // 关闭移动端用户菜单
  mobileUserMenuVisible.value = false
  
  switch (command) {
    case 'settings':
      if (authStore.isAdmin) {
        router.push('/settings')
      } else {
        ElMessage.warning('需要管理员权限')
      }
      break
    case 'notifications':
      if (authStore.isAdmin) {
        router.push('/notifications')
      } else {
        ElMessage.warning('需要管理员权限')
      }
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        authStore.logout()
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}

// 切换移动端用户菜单
const toggleMobileUserMenu = () => {
  mobileUserMenuVisible.value = !mobileUserMenuVisible.value
}

// 处理移动端用户菜单显示状态变化
const handleMobileUserMenuVisibleChange = (visible: boolean) => {
  mobileUserMenuVisible.value = visible
}

// 触摸手势处理
const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  
  if (!e.touches || e.touches.length === 0) return
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isDragging.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value) return
  
  if (!e.touches || e.touches.length === 0) return
  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY
  const deltaX = touchX - touchStartX.value
  const deltaY = touchY - touchStartY.value
  
  // 检测是否为水平滑动
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isDragging.value = true
    // 使用passive: true时不能调用preventDefault，改用CSS touch-action
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (!isMobile.value || !isDragging.value) return
  
  if (!e.changedTouches || e.changedTouches.length === 0) return
  const touchX = e.changedTouches[0].clientX
  const deltaX = touchX - touchStartX.value
  
  // 从左边缘向右滑动打开侧边栏
  if (deltaX > 50 && touchStartX.value < 20) {
    sidebarCollapsed.value = false
  }
  // 从右向左滑动关闭侧边栏
  else if (deltaX < -50 && sidebarCollapsed.value === false) {
    sidebarCollapsed.value = true
  }
  
  isDragging.value = false
}

// 已移除无效的路由 watcher，避免不必要的回调

// 监听窗口大小变化（防抖）
let resizeTimeout: number | null = null
const handleResize = () => {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
  checkScreenSize()
    // 根据 isMobile 动态挂载/卸载触摸事件
    if (isMobile.value) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    } else {
      document.removeEventListener('touchstart', handleTouchStart as EventListener)
      document.removeEventListener('touchmove', handleTouchMove as EventListener)
      document.removeEventListener('touchend', handleTouchEnd as EventListener)
    }
    resizeTimeout = null
  }, 150)
}

// 获取系统设置
const fetchSystemSettings = async () => {
  try {
    // 使用公共接口获取系统信息，而不是管理员接口
    await api.get('/system/info')
    
    // 使用默认动画设置，因为公共接口不包含动画设置
    animationEnabled.value = true
  } catch (error) {
    // 如果获取失败，使用默认值
    // 获取系统设置失败，使用默认动画设置
    animationEnabled.value = true
  }
}

// 监听系统设置变化
const handleSystemSettingsChange = (event: CustomEvent) => {
  const settings = event.detail
  if (settings.enable_animation !== undefined) {
    animationEnabled.value = settings.enable_animation
  }
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 小于1天
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 超过7天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取通知类型文本
const getNotificationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'system': '系统通知',
    'maintenance': '系统维护',
    'security_alert': '安全提醒',
    'storage_warning': '存储警告',
    'email': '邮件通知',
    'user': '用户通知'
  }
  return typeMap[type] || type || '未知类型'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'low': '低',
    'normal': '普通',
    'high': '高',
    'urgent': '紧急'
  }
  return priorityMap[priority] || priority || '普通'
}

// 获取所有通知（包括已读的）
const fetchAllNotifications = async () => {
  if (!authStore.user) {
    console.log('用户未登录，跳过获取通知')
    return
  }
  
  try {
    notificationsAbortController?.abort()
    notificationsAbortController = new AbortController()
    devLog('开始获取所有通知...')
    devLog('API基础URL:', api.defaults.baseURL)
    devLog('用户信息:', authStore.user)
    
    const response = await api.get('/auth/notifications/all', { signal: notificationsAbortController.signal as any })
    devLog('获取所有通知响应:', response.data)
    
    if (response.data.success) {
      allNotifications.value = response.data.notifications || []
      devLog('设置allNotifications:', allNotifications.value.length, '条通知')
      devLog('通知详情:', allNotifications.value)
    } else {
      console.error('获取通知失败:', response.data.message)
      ElMessage.error('获取通知失败: ' + response.data.message)
    }
  } catch (error: any) {
    console.error('获取所有通知失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    })
    
    if (error.response?.status === 401) {
      console.log('用户未授权，可能需要重新登录')
    } else if (error.response?.status === 404) {
      console.log('通知接口不存在')
      ElMessage.error('通知服务暂不可用')
    } else {
      ElMessage.error('获取通知失败，请稍后重试')
    }
  }
}

// 全局通知相关方法
const fetchGlobalNotifications = async () => {
  if (!authStore.user) {
    console.log('用户未登录，跳过获取全局通知')
    return
  }
  
  try {
    notificationsAbortController?.abort()
    notificationsAbortController = new AbortController()
    devLog('开始获取全局通知...')
    const response = await api.get('/auth/notifications/unread', { signal: notificationsAbortController.signal as any })
    devLog('获取全局通知响应:', response.data)
    
    if (response.data.success) {
      // 只显示未读通知
      globalNotifications.value = response.data.notifications || []
      console.log('设置globalNotifications:', globalNotifications.value.length, '条未读通知')
    } else {
      console.error('获取全局通知失败:', response.data.message)
    }
  } catch (error: any) {
    console.error('获取全局通知失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
  }
}

const markNotificationAsRead = async (notificationId: number) => {
  try {
    await api.put(`/auth/notifications/${notificationId}/read`)
    
    // 从全局通知列表中移除
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notificationId)
    
    ElMessage.success('通知已标记为已读')
  } catch (error) {
    ElMessage.error('标记通知为已读失败')
  }
}

const closeNotification = (notificationId: number) => {
  // 从全局通知列表中移除
  globalNotifications.value = globalNotifications.value.filter(n => n.id !== notificationId)
  
  // 如果当前显示的是这个通知的详情，则关闭详情面板
  if (detailNotification.value && detailNotification.value.id === notificationId) {
    detailNotification.value = null
  }
  
  // 如果所有通知都已关闭，关闭整个对话框
  if (globalNotifications.value.length === 0) {
    closeNotificationsDialog()
  }
}

// 计算未读通知数量
const unreadNotificationCount = computed(() => {
  return globalNotifications.value.length
})

// 计算是否有未读通知
const hasUnreadNotifications = computed(() => {
  return unreadNotificationCount.value > 0
})

// 计算最高优先级用于汇总横条颜色
const highestPriorityClass = computed(() => {
  if (globalNotifications.value.length === 0) return ''
  
  const p = globalNotifications.value.reduce((max, n: NotificationItem) => {
    const rank = ({ low: 1, normal: 2, high: 3, urgent: 4 } as any)[n.priority] || 2
    return rank > max ? rank : max
  }, 0)
  return p === 4 ? 'priority-urgent' : p === 3 ? 'priority-high' : p === 2 ? 'priority-normal' : 'priority-low'
})

// 对话框事件处理
const onDialogOpened = () => { devLog('对话框已打开') }

const onDialogClosed = () => { devLog('对话框已关闭'); detailNotification.value = null }

// 关闭通知对话框
const closeNotificationsDialog = () => {
  notificationsDialogVisible.value = false
  detailNotification.value = null
}

// 打开通知详情悬浮窗
const openNotificationDetail = async (n: NotificationItem) => {
  devLog('打开通知详情:', n)
  devLog('当前allNotifications数量:', allNotifications.value.length)
  devLog('当前notificationsDialogVisible:', notificationsDialogVisible.value)
  
  detailNotification.value = n
  
  // 如果通知未读，自动标记为已读
  if (!n.is_read) {
    try {
      devLog('自动标记通知为已读:', n.id)
      await api.put(`/auth/notifications/${n.id}/read`)
      
      // 更新本地状态
      n.is_read = 1
      n.read_at = new Date().toISOString()
      
      // 更新allNotifications中的状态
      const notificationIndex = allNotifications.value.findIndex(notif => notif.id === n.id)
      if (notificationIndex !== -1) {
        allNotifications.value[notificationIndex].is_read = 1
        allNotifications.value[notificationIndex].read_at = n.read_at
      }
      
      // 从全局未读通知列表中移除
      globalNotifications.value = globalNotifications.value.filter(notif => notif.id !== n.id)
      
      devLog('通知已自动标记为已读')
      
      // 触发响应式更新
      allNotifications.value = [...allNotifications.value]
      globalNotifications.value = [...globalNotifications.value]
      
    } catch (error: any) {
      console.error('自动标记通知为已读失败:', error)
      // 即使标记失败，仍然显示详情
    }
  }
  
  // 确保对话框是打开的
  if (!notificationsDialogVisible.value) {
    notificationsDialogVisible.value = true
  }
  
  devLog('设置后detailNotification:', detailNotification.value)
  devLog('设置后notificationsDialogVisible:', notificationsDialogVisible.value)
}

// 打开通知对话框
const openNotificationsDialog = async () => {
  notificationsDialogVisible.value = true
  await fetchAllNotifications() // 获取所有通知
}

const startNotificationPolling = () => {
  if (notificationCheckInterval.value || sseConnected.value) return
  // 每10秒检查一次新通知（SSE 断开时后备）
  notificationCheckInterval.value = setInterval(() => {
    fetchGlobalNotifications()
  }, 10000)
}

const stopNotificationPolling = () => {
  if (notificationCheckInterval.value) {
    clearInterval(notificationCheckInterval.value)
    notificationCheckInterval.value = null
  }
}

// SSE 连接管理
const setupSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
  }
  
  const token = localStorage.getItem('token')
  if (!token) return
  
  // 使用查询参数传递令牌，避免在浏览器 EventSource 中使用不受支持的 headers 选项
  const streamUrl = new URL(`${api.defaults.baseURL}/auth/notifications/stream`)
  streamUrl.searchParams.set('token', token)
  eventSource.value = new EventSource(streamUrl.toString())

  eventSource.value.addEventListener('open', () => {
    sseConnected.value = true
    devLog('SSE 连接已建立')
    // SSE 在线时停止轮询
    stopNotificationPolling()
  })

  eventSource.value.onmessage = (event) => {
    devLog('SSE message:', event.data)
  }

  eventSource.value.addEventListener('notification:new', (event) => {
    devLog('New notification via SSE:', event.data)
    fetchGlobalNotifications() // 收到新通知事件后立即刷新
  })

  eventSource.value.onerror = (error) => {
    console.error('SSE Error:', error)
    sseConnected.value = false
    eventSource.value?.close()
    // SSE 异常时启动轮询作为后备
    startNotificationPolling()
    // 尝试延时重连
    setTimeout(setupSSE, 5000)
  }
}

const closeSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  sseConnected.value = false
}

// 页面可见性变化：隐藏时暂停、显示时恢复
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopNotificationPolling()
    notificationsAbortController?.abort()
    closeSSE()
  } else {
    fetchGlobalNotifications()
    setupSSE()
    if (!sseConnected.value) startNotificationPolling()
  }
}

// 生命周期
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 添加触摸事件监听
  if (isMobile.value) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
  
  // 获取系统设置
  fetchSystemSettings()
  
  // 初始化全局通知
  fetchGlobalNotifications()
  setupSSE() // 建立 SSE 连接
  if (!sseConnected.value) startNotificationPolling()
  
  // 添加全局事件监听
  window.addEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
  
  // 停止通知轮询
  stopNotificationPolling()
  
  // 关闭 SSE 连接
  closeSSE()
  
  // 中止未完成的通知请求
  notificationsAbortController?.abort()
  
  // 移除触摸事件监听
  if (isMobile.value) {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style lang="scss" scoped>
.anim-root {
  --anim-duration-fast: 120ms;
  --anim-duration-base: 200ms;
  --anim-duration-slow: 280ms;
  --anim-ease-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --anim-ease-entrance: cubic-bezier(0.2, 0.8, 0.2, 1);
  --anim-ease-exit: cubic-bezier(0.4, 0, 0.2, 1);
  --elevation-1: 0 1px 3px rgba(0, 0, 0, 0.06);
  --elevation-2: 0 2px 8px rgba(0, 0, 0, 0.10);
  --hover-bg: rgba(17, 24, 39, 0.06);
  --press-scale: 0.98;
}
.main-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  position: relative;
  touch-action: pan-y pinch-zoom; // 允许垂直滚动和缩放，限制水平滚动
  view-transition-name: page;
  :deep(.top-header) { view-transition-name: vt-header; }
  :deep(.sidebar) { view-transition-name: vt-sidebar; }
  :deep(.page-content) { view-transition-name: vt-content; }
}

// 用户菜单黑白灰风格
:deep(.user-menu-popper) {
  .el-dropdown-menu {
    padding: 6px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
  }
  .el-dropdown-menu__item {
    color: #111827;
    border-radius: 8px;
    transition: background 0.2s ease;
    &:hover { background: #f5f5f5; color: #111827; }
    &.is-disabled { color: #9ca3af; }
  }
  .el-dropdown-menu__item--divided { margin-top: 6px; border-top: 1px solid #eee; }
  .el-icon { color: #6b7280; }
}

// 移动端遮罩层
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.sidebar {
  width: 200px; // 增加侧边栏宽度
  background: #ffffff;
  border-right: 1px solid #e5e7eb; // 更中性灰
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  
  &.collapsed {
    width: 64px;
    
    .sidebar-header {
      justify-content: center;
      padding: 0 8px;
    }
    
    .logo {
      justify-content: center;
      padding: 8px;
      width: 48px;
      height: 48px;
      
      .logo-image {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }
    
    .sidebar-nav {
      :deep(.el-menu) {
        .el-menu-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 4px 8px;
          width: 48px;
          height: 48px;
          
          .el-icon {
            margin-right: 0;
            font-size: 18px;
          }
          
          span {
            display: none;
          }
        }
      }
    }
  }
  
  &.mobile-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
  
  &:hover {
    background: var(--hover-bg);
  }
  &:active { transform: scale(var(--press-scale)); }
  
  .logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
    transition: transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    transition: color var(--anim-duration-fast) var(--anim-ease-standard);
  }
}

.collapse-btn {
  padding: 8px;
  border-radius: 8px;
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
  color: #374151;
  
  &:hover {
    background: var(--hover-bg);
    color: #111827;
  }
  &:active { transform: scale(var(--press-scale)); }
  
  :deep(.el-icon) {
    font-size: 16px;
    color: inherit;
  }
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  
  :deep(.el-menu) {
    border-right: none;
    
    .el-menu-item {
      height: 48px;
      line-height: 48px;
      margin: 4px 8px;
      border-radius: 8px;
      transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                  color var(--anim-duration-fast) var(--anim-ease-standard),
                  transform var(--anim-duration-fast) var(--anim-ease-standard);
      color: #374151;
      
      &:hover {
        background: #f3f4f6;
        color: #111827;
      }
      
      &.is-active {
        background: #111827;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        
        .el-icon {
          color: white;
        }
      }
    }

    // 菜单项内图标继承文字颜色
    .el-menu-item .el-icon { color: inherit; }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  
  &.collapsed {
    justify-content: center;
    padding: 8px;
    gap: 8px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  
  &.collapsed {
    flex: none;
    justify-content: center;
    
    .el-avatar {
      width: 32px;
      height: 32px;
    }
    
    .user-details {
      display: none;
    }
  }
}

.user-details {
  .username {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .user-role {
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
  }
}

.user-menu-btn {
  padding: 8px;
  border-radius: 8px;
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
  color: #374151;
  
  &:hover {
    background: var(--hover-bg);
    color: #111827;
  }
  &:active { transform: scale(var(--press-scale)); }
  
  :deep(.el-icon) {
    font-size: 16px;
    color: inherit;
  }
  
  &.collapsed {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  background: #f5f7fa; // 添加背景色
  
  // 当侧边栏折叠时调整margin
  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.top-header {
  height: 60px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0; // 允许内容收缩
}

  .mobile-menu-btn {
    padding: 12px; // 增加内边距
    border-radius: 12px; // 增加圆角
    transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
    color: #374151;
    
    &:hover {
      background: var(--hover-bg);
      color: #111827;
    }
    &:active { transform: scale(var(--press-scale)); }
    
    :deep(.el-icon) {
      font-size: 24px; // 增大图标
      color: inherit;
    }

    .tri-grid-icon svg { width: 20px; height: 20px; display: block; }
  }

.breadcrumb-nav {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #7f8c8d;
      font-weight: 500;
      transition: color var(--anim-duration-fast) var(--anim-ease-standard);
      &:hover { color: #111827; }
    }
    
    &:last-child .el-breadcrumb__inner {
      color: #2c3e50;
      font-weight: 600;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0; // 防止右侧内容被压缩
  min-width: 0; // 允许内容收缩
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  flex-shrink: 0; // 防止存储信息被压缩
  
  &.mobile-hidden {
    display: none;
  }
}

.storage-progress {
  flex: 1;
  
  :deep(.el-progress-bar__outer) {
    border-radius: 12px; // 增大圆角
    background: rgba(102, 126, 234, 0.08); // 更淡的背景
    height: 8px; // 增加高度
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); // 添加内阴影
    overflow: hidden; // 确保圆角效果
  }
  
  :deep(.el-progress-bar__inner) {
    border-radius: 12px; // 增大圆角
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); // 更丰富的渐变
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); // 添加阴影效果
    position: relative;
    overflow: hidden;
    
    // 添加光泽效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 2s infinite;
    }
  }
  
  :deep(.el-progress__text) {
    font-size: 13px; // 增大字体
    font-weight: 600; // 增加字重
    color: #667eea; // 使用主题色
    margin-left: 8px; // 增加间距
  }
}

// 光泽动画
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.storage-text {
  font-size: 12px;
  color: #7f8c8d;
  white-space: nowrap;
  font-weight: 500;
}

.mobile-storage {
  .mobile-storage-progress {
    width: 48px; // 统一宽度，与其他移动端按钮一致
    height: 48px; // 设置总高度，与其他移动端按钮一致
    
    :deep(.el-progress-bar__outer) {
      border-radius: 12px; // 增大圆角
      background: rgba(102, 126, 234, 0.08); // 更淡的背景
      height: 12px !important; // 强制设置高度，覆盖Element Plus默认样式
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); // 添加内阴影
      overflow: hidden; // 确保圆角效果
    }
    
    :deep(.el-progress-bar__inner) {
      border-radius: 12px; // 增大圆角
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); // 更丰富的渐变
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); // 添加阴影效果
      position: relative;
      overflow: hidden;
      
      // 添加光泽效果
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 2s infinite;
      }
    }
  }
}

.theme-toggle {
  padding: 12px; // 增加内边距
  border-radius: 12px; // 增加圆角
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  
  :deep(.el-icon) {
    font-size: 20px; // 增大图标
  }
}

.desktop-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard);
  cursor: pointer;
  
  &:hover {
    background: var(--hover-bg);
  }
  
  .user-details {
    .username {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.2;
    }
    
    .user-role {
      font-size: 12px;
      color: #7f8c8d;
      font-weight: 500;
      line-height: 1.2;
    }
  }
  
  .dropdown-arrow {
    font-size: 12px;
    color: #7f8c8d;
    transition: transform 0.3s ease;
  }
  
  &:hover .dropdown-arrow {
    transform: rotate(180deg);
  }
}

.mobile-user-btn {
  padding: 12px; // 增加内边距
  border-radius: 12px; // 增加圆角
  transition: all 0.3s ease;
  color: #374151;
  
  &:hover {
    background: rgba(17, 24, 39, 0.06);
  }
  
  :deep(.el-avatar) {
    --el-avatar-size: 32px; // 增大头像尺寸
  }
}

.page-content {
  flex: 1;
  padding: 16px 0; // 只保留上下内边距，移除左右内边距，让页面组件自己控制
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  background: transparent; // 移除背景色，由main-content提供
  // 优化渲染：仅在需要时渲染可见内容
  content-visibility: auto;
  contain-intrinsic-size: 600px;
}

.page-wrapper {
  width: 100%;
  min-height: 100%;
  // 避免深层次布局影响，提高复合层性能
  contain: content;
}

// 移动端遮罩层
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
  display: none; // 默认隐藏
}

// 移动端底部导航栏
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e4e7ed;
  display: none; // 默认隐藏
  z-index: 1000;
  
  .nav-items {
    display: flex;
    height: 100%;
    
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #374151;
      
      &:hover { background: var(--hover-bg); color: #111827; }
      &:active { transform: scale(var(--press-scale)); }
      &.active {
        color: #111827;
        background: #f3f4f6;
      }
      
      .nav-icon {
        font-size: 20px;
        margin-bottom: 2px;
        color: inherit;
      }
      
      .nav-text {
        font-size: 10px;
        font-weight: 500;
        line-height: 1;
      }
    }
  }
}

// 桌面端默认样式 (1200px+)
@media (min-width: 1200px) {
  .main-content {
    margin-left: 0;
    margin-right: 0; // 让滚动条贴右侧
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 0;
      margin-right: 0; // 让滚动条贴右侧
      padding-left: 0px;
      padding-right: 0px; // 移除右边距，保持左右一致
    }
  }
  
  .sidebar {
    width: 200px;
    position: relative;
    height: auto;
    
    &.collapsed {
      width: 64px;
    }
  }
  
  .top-header {
    // 取消限宽与居中，使用父级左右 margin 实现等距
    border-radius: 0 0 16px 16px; // 添加圆角
  }
}

// 响应式设计 - 使用精确断点，避免重叠
// 超大屏 (1920px+)
@media (min-width: 1920px) {
  .main-content {
    margin-left: 0;
    margin-right: 0; // 让滚动条贴右侧
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 0;
      margin-right: 0; // 让滚动条贴右侧
      padding-left: 0px;
      padding-right: 0px; // 移除右边距，保持左右一致
    }
  }
  
  .sidebar {
    width: 220px;
    
    &.collapsed {
      width: 80px;
    }
  }
  
  .page-content {
    padding: 20px 0; // 只保留上下内边距，移除左右内边距
  }
  
  .top-header {
    height: 70px;
    padding: 0 32px;
    border-radius: 0 0 20px 20px; // 更大的圆角
  }
  
  // 使用内部 padding 形成左右空白，同时保持滚动条在最右侧
  .page-content { padding-left: 250px; padding-right: 250px; }
  .main-content.sidebar-collapsed .page-content { padding-left: 110px; padding-right: 110px; }
  .top-header { padding-left: calc(250px + 32px); padding-right: calc(250px + 32px); }
  .main-content.sidebar-collapsed .top-header { padding-left: calc(110px + 32px); padding-right: calc(110px + 32px); }
}

// 大屏桌面 (1440px - 1919px)
@media (min-width: 1440px) and (max-width: 1919px) {
  .main-content {
    margin-left: 0;
    margin-right: 0; // 让滚动条贴右侧
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 0;
      margin-right: 0; // 让滚动条贴右侧
      padding-left: 0px;
      padding-right: 0px; // 移除右边距，保持左右一致
    }
  }
  
  .sidebar {
    width: 210px;
    
    &.collapsed {
      width: 70px;
    }
  }
  
  .page-content {
    padding: 18px 0; // 只保留上下内边距，移除左右内边距
  }
  
  .top-header {
    height: 65px;
    padding: 0 28px;
    border-radius: 0 0 18px 18px; // 适中的圆角
  }
  
  // 使用内部 padding 形成左右空白，同时保持滚动条在最右侧
  .page-content { padding-left: 235px; padding-right: 235px; }
  .main-content.sidebar-collapsed .page-content { padding-left: 95px; padding-right: 95px; }
  .top-header { padding-left: calc(235px + 28px); padding-right: calc(235px + 28px); }
  .main-content.sidebar-collapsed .top-header { padding-left: calc(95px + 28px); padding-right: calc(95px + 28px); }
}

// 桌面端 (1200px - 1439px)
@media (min-width: 1200px) and (max-width: 1439px) {
  .main-content {
    margin-left: 0;
    margin-right: 0; // 让滚动条贴右侧
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 0;
      margin-right: 0; // 让滚动条贴右侧
      padding-left: 0px;
      padding-right: 0px; // 移除右边距，保持左右一致
    }
  }
  
  .sidebar {
    width: 200px;
    
    &.collapsed {
      width: 64px;
    }
  }
  
  .page-content {
    padding: 16px 0; // 只保留上下内边距，移除左右内边距
  }
  
  .top-header {
    height: 60px;
    padding: 0 24px;
    border-radius: 0 0 16px 16px; // 标准圆角
  }
  
  // 使用内部 padding 形成左右空白，同时保持滚动条在最右侧
  .page-content { padding-left: 220px; padding-right: 220px; }
  .main-content.sidebar-collapsed .page-content { padding-left: 84px; padding-right: 84px; }
  .top-header { padding-left: calc(220px + 24px); padding-right: calc(220px + 24px); }
  .main-content.sidebar-collapsed .top-header { padding-left: calc(84px + 24px); padding-right: calc(84px + 24px); }
}

// 平板横屏/小屏笔记本 (1024px - 1199px)
@media (min-width: 1024px) and (max-width: 1199px) {
  .main-content {
    margin-left: 195px;
    margin-right: 195px; // 右边距与左边距完全相同
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 79px;
      margin-right: 79px; // 右边距与左边距完全相同
      padding-left: 0px;
      padding-right: 0px; // 移除右边距，保持左右一致
    }
  }
  
  .sidebar {
    width: 180px;
    
    &.collapsed {
      width: 64px;
    }
  }
  
  .page-content {
    padding: 14px 0; // 只保留上下内边距，移除左右内边距
  }
  
  .top-header {
    height: 58px;
    padding: 0 20px;
    max-width: calc(100vw - 360px); // 与内容区域宽度一致
    border-radius: 0 0 14px 14px; // 较小的圆角
  }
  
  .storage-info {
    min-width: 180px;
  }
}

// 平板竖屏 (768px - 1023px)
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    margin-left: 0 !important; // 强制移除左边距
    padding-right: 0; // 明确移除右边距
    padding-left: 0; // 移除左边距
    
    &.sidebar-collapsed {
      margin-left: 0 !important; // 强制移除折叠状态的左边距
      padding-right: 0 !important; // 强制移除折叠状态的右边距
    }
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -200px; // 默认隐藏
    width: 200px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.mobile-open {
      left: 0; // 显示时滑入
    }
    
    &.collapsed {
      width: 200px; // 平板端不折叠
    }
  }
  
  .top-header {
    height: 64px; // 增加高度
    padding: 0 16px;
    max-width: 100vw; // 全宽
    border-radius: 0; // 移除圆角
    justify-content: center; // 移动端居中显示
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .storage-info {
    min-width: 160px; // 减少最小宽度
  }
  
  // 移动端遮罩层
  .mobile-overlay {
    display: block;
  }
  
  // 移动端底部导航栏
  .mobile-bottom-nav {
    display: block;
  }
  
  // 为底部导航栏预留空间
  .page-content {
    padding-bottom: 60px;
  }
  
  .header-left {
    gap: 12px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .header-right {
    gap: 12px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .storage-info {
    min-width: 150px;
  }
}

// 大屏手机 (480px - 767px)
@media (min-width: 480px) and (max-width: 767px) {
  .main-content {
    margin-left: 0 !important; // 强制移除左边距
    padding-right: 0; // 明确移除右边距
    padding-left: 0; // 移除左边距
    
    &.sidebar-collapsed {
      margin-left: 0 !important; // 强制移除折叠状态的左边距
      padding-right: 0 !important; // 强制移除折叠状态的右边距
    }
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.mobile-open {
      left: 0;
    }
  }
  
  .top-header {
    padding: 0 16px;
    height: 64px; // 增加高度
    max-width: 100vw;
    border-radius: 0;
    justify-content: center; // 移动端居中显示
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 8px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
    
  .breadcrumb-nav {
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        font-size: 16px; // 增大字体
        font-weight: 600; // 增加字重
      }
    }
  }
  }
  
  .header-right {
    gap: 8px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .storage-info {
    min-width: 120px;
    
    .storage-text {
      font-size: 10px;
    }
    
    .storage-progress {
      :deep(.el-progress-bar__outer) {
        height: 6px; // 增加高度
        border-radius: 10px; // 增加圆角
        background: rgba(102, 126, 234, 0.08); // 更淡的背景
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); // 添加内阴影
      }
      
      :deep(.el-progress-bar__inner) {
        border-radius: 10px; // 增加圆角
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); // 更丰富的渐变
        box-shadow: 0 1px 4px rgba(102, 126, 234, 0.3); // 添加阴影效果
      }
    }
  }
  
  .mobile-overlay {
    display: block;
  }
  
  // 移动端底部导航栏
  .mobile-bottom-nav {
    display: block;
  }
  
  // 为底部导航栏预留空间
  .page-content {
    padding-bottom: 60px;
  }
  
  .breadcrumb-nav {
    :deep(.el-breadcrumb__item) {
      &:not(:last-child) {
        display: none;
      }
    }
  }
  
  .sidebar {
    width: 280px;
    
    &.mobile-sidebar {
      width: 280px;
    }
  }
  
  .sidebar-header {
    height: 56px;
    padding: 0 20px;
  }
  
  .sidebar-nav {
    :deep(.el-menu) {
      .el-menu-item {
        display: flex;
        align-items: center;
        height: 52px;
        line-height: 52px;
        margin: 6px 12px;
        font-size: 16px;
        
        .el-icon {
          font-size: 20px;
          margin-right: 12px;
        }
      }
    }
  }
  
  .sidebar-footer {
    padding: 20px;
    padding-bottom: 80px; // 为底部导航栏预留空间
  }
  
  .user-details {
    .username {
      font-size: 16px;
    }
    
    .user-role {
      font-size: 14px;
    }
  }
}

// 小屏手机 (320px - 479px)
@media (min-width: 320px) and (max-width: 479px) {
  .main-content {
    margin-left: 0 !important; // 强制移除左边距
    padding-right: 0; // 明确移除右边距
    padding-left: 0; // 移除左边距
    
    &.sidebar-collapsed {
      margin-left: 0 !important; // 强制移除折叠状态的左边距
      padding-right: 0 !important; // 强制移除折叠状态的右边距
    }
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.mobile-open {
      left: 0;
    }
  }
  
  .top-header {
    padding: 0 12px;
    height: 60px; // 增加高度
    max-width: 100vw;
    border-radius: 0;
    justify-content: center; // 移动端居中显示
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 6px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
    
    .breadcrumb-nav {
      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          font-size: 11px;
        }
      }
    }
  }
  
  .header-right {
    gap: 6px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .storage-info {
    min-width: 100px;
    
    .storage-text {
      font-size: 9px;
    }
    
    .storage-progress {
      :deep(.el-progress-bar__outer) {
        height: 5px; // 增加高度
        border-radius: 8px; // 增加圆角
        background: rgba(102, 126, 234, 0.08); // 更淡的背景
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); // 添加内阴影
      }
      
      :deep(.el-progress-bar__inner) {
        border-radius: 8px; // 增加圆角
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); // 更丰富的渐变
        box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3); // 添加阴影效果
      }
    }
  }
  
  .mobile-overlay {
    display: block;
  }
  
  // 移动端底部导航栏
  .mobile-bottom-nav {
    display: block;
  }
  
  // 为底部导航栏预留空间
  .page-content {
    padding-bottom: 60px;
  }
  
  .breadcrumb-nav {
    :deep(.el-breadcrumb__item) {
      &:not(:last-child) {
        display: none;
      }
    }
  }
  
  .sidebar {
    width: 260px;
    
    &.mobile-sidebar {
      width: 260px;
    }
  }
  
  .sidebar-header {
    height: 52px;
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .sidebar-nav {
    :deep(.el-menu) {
      .el-menu-item {
        display: flex;
        align-items: center;
        height: 48px;
        line-height: 48px;
        margin: 4px 8px;
        font-size: 15px;
        
        .el-icon {
          font-size: 18px;
          margin-right: 10px;
        }
      }
    }
  }
  
  .sidebar-footer {
    padding: 16px;
    padding-bottom: 76px; // 为底部导航栏预留空间
  }
  
  .mobile-storage {
    .mobile-storage-progress {
      width: 48px; // 统一宽度，与其他移动端按钮一致
    }
  }
}

// 超小屏手机 (0px - 319px)
@media (max-width: 319px) {
  .main-content {
    margin-left: 0 !important; // 强制移除左边距
    padding-right: 0; // 明确移除右边距
    padding-left: 0; // 移除左边距
    
    &.sidebar-collapsed {
      margin-left: 0 !important; // 强制移除折叠状态的左边距
      padding-right: 0 !important; // 强制移除折叠状态的右边距
    }
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.mobile-open {
      left: 0;
    }
  }
  
  .top-header {
    padding: 0 8px;
    height: 56px; // 增加高度
    max-width: 100vw;
    border-radius: 0;
    justify-content: center; // 移动端居中显示
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 6px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .header-right {
    gap: 6px;
    flex: 1; // 占用剩余空间
    justify-content: center; // 居中显示
  }
  
  .breadcrumb-nav {
    :deep(.el-breadcrumb__item) {
      &:not(:last-child) {
        display: none;
      }
    }
  }
  
  .sidebar {
    width: 240px;
    
    &.mobile-sidebar {
      width: 240px;
    }
  }
  
  .sidebar-header {
    height: 48px;
    padding: 0 12px;
  }
  
  .logo-text {
    font-size: 14px;
  }
  
  .sidebar-nav {
    :deep(.el-menu) {
      .el-menu-item {
        display: flex;
        align-items: center;
        height: 44px;
        line-height: 44px;
        margin: 2px 6px;
        font-size: 14px;
        
        .el-icon {
          font-size: 16px;
          margin-right: 8px;
        }
      }
    }
  }
  
  .sidebar-footer {
    padding: 12px;
    padding-bottom: 72px; // 为底部导航栏预留空间
  }
  
  .mobile-storage {
    .mobile-storage-progress {
      width: 48px; // 统一宽度，与其他移动端按钮一致
    }
  }
}

// 页面切换动画 - 优化性能
.page-slide-enter-active {
  transition: transform var(--anim-duration-base) var(--anim-ease-standard),
              opacity var(--anim-duration-base) var(--anim-ease-standard);
  will-change: transform, opacity;
}

.page-slide-leave-active {
  transition: transform var(--anim-duration-fast) var(--anim-ease-exit),
              opacity var(--anim-duration-fast) var(--anim-ease-exit);
  will-change: transform, opacity;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.page-wrapper {
  will-change: auto;
}

// 系统减少动态偏好支持
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  .page-slide-enter-from, .page-slide-leave-to {
    transform: none !important;
    opacity: 1 !important;
  }
}

// 滚动条样式
:deep(.el-scrollbar__bar) {
  &.is-vertical {
    right: 2px;
    width: 6px;
  }
  
  &.is-horizontal {
    bottom: 2px;
    height: 6px;
  }
}

// 现代设备特殊断点
// iPhone 14 Pro Max (430px)
@media (max-width: 430px) and (min-width: 390px) {
  .mobile-bottom-nav {
    .nav-items {
      .nav-item {
        .nav-icon {
          font-size: 18px;
        }
        
        .nav-text {
          font-size: 9px;
        }
      }
    }
  }
}

// iPhone 14 Pro (393px)
@media (max-width: 393px) and (min-width: 375px) {
  .mobile-bottom-nav {
    .nav-items {
      .nav-item {
        .nav-icon {
          font-size: 17px;
        }
        
        .nav-text {
          font-size: 8px;
        }
      }
    }
  }
}

// iPhone SE (375px)
@media (max-width: 375px) and (min-width: 320px) {
  .mobile-bottom-nav {
    .nav-items {
      .nav-item {
        .nav-icon {
          font-size: 16px;
        }
        
        .nav-text {
          font-size: 8px;
        }
      }
    }
  }
}

// 横屏模式优化
@media (max-height: 500px) and (orientation: landscape) {
  .mobile-bottom-nav {
    height: 50px;
    
    .nav-items {
      .nav-item {
        padding: 2px 4px;
        
        .nav-icon {
          font-size: 16px;
          margin-bottom: 1px;
        }
        
        .nav-text {
          font-size: 8px;
        }
      }
    }
  }
  
  .page-content {
    padding-bottom: 50px;
  }
  
  .top-header {
    height: 48px;
  }
}

:deep(.el-scrollbar__thumb) {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
  
  &:hover {
    background: rgba(102, 126, 234, 0.5);
  }
}

// 全局通知样式
.global-notifications {
  &.banner {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 8px 24px;
    background: transparent;
  }

  .notification-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fefefe;
    border-radius: 6px;
    padding: 8px 12px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    cursor: pointer;
    border-left: 4px solid #409EFF;
    .summary-text { font-size: 13px; color: #303133; font-weight: 600; }
    .summary-arrow { color: #909399; }
    &.priority-low { border-left-color: #909399; }
    &.priority-normal { border-left-color: #409EFF; }
    &.priority-high { border-left-color: #E6A23C; }
    &.priority-urgent { border-left-color: #F56C6C; }
  }
  
  .notification-item {
    background: #fefefe;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    margin-bottom: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-left: 4px solid #409EFF;
    
    &:hover { background: #fafcff; }
    
    &.priority-low {
      border-left-color: #909399;
    }
    
    &.priority-normal {
      border-left-color: #409EFF;
    }
    
    &.priority-high {
      border-left-color: #E6A23C;
    }
    
    &.priority-urgent {
      border-left-color: #F56C6C;
      animation: urgentPulse 2s infinite;
    }
    
    .notification-content {
      flex: 1;
      
      .notification-title { font-weight: 600; font-size: 13px; color: #303133; margin-bottom: 2px; }
      
      .notification-message { font-size: 12px; color: #606266; line-height: 1.4; }
    }
    
    .notification-actions {
      margin-left: 12px;
    }
  }
}

// 通知对话框样式
.notifications-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }
  
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px 16px 0 0;
    padding: 24px 28px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
      pointer-events: none;
    }
    
    .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }
    
    .el-dialog__headerbtn {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 0 0 16px 16px;
  }
}

.notifications-dialog-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 500px;
  background: #f8fafc;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    min-height: 400px;
  }
}

.notifications-list-panel {
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 200px;
  }
  .list-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    
    .list-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 8px 0;
    }
    
    .notification-count {
      font-size: 12px;
      color: #64748b;
      background: #e2e8f0;
      padding: 4px 8px;
      border-radius: 12px;
    }
  }
  
  .notifications-scrollbar {
    flex: 1;
    padding: 8px;
    
    :deep(.el-scrollbar__view) {
      padding: 0;
    }
  }
  
  .empty-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #64748b;
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    
    .empty-text {
      font-size: 14px;
      margin: 0;
    }
  }
  
  .notification-item {
    background: white;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 4px solid #e2e8f0;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 100%);
      border-radius: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    
    &:hover {
      background: #f8fafc;
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
      
      &::before {
        opacity: 1;
      }
    }
    
    &.active {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left-color: #3b82f6;
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
      transform: translateY(-1px);
      
      &::before {
        opacity: 0.5;
      }
    }
    
    &.is-read {
      opacity: 0.7;
      
      .notification-title {
        color: #64748b;
      }
      
      .notification-meta {
        color: #94a3b8;
      }
    }
    
    &.priority-low {
      border-left-color: #94a3b8;
      
      &:hover {
        border-left-color: #64748b;
      }
    }
    
    &.priority-normal {
      border-left-color: #3b82f6;
      
      &:hover {
        border-left-color: #2563eb;
      }
    }
    
    &.priority-high {
      border-left-color: #f59e0b;
      
      &:hover {
        border-left-color: #d97706;
      }
    }
    
    &.priority-urgent {
      border-left-color: #ef4444;
      animation: urgentPulse 2s infinite;
      
      &:hover {
        border-left-color: #dc2626;
      }
    }
    
    .notification-content {
      flex: 1;
      
      .notification-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .notification-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        font-size: 12px;
        
        .notification-type {
          background: #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .notification-priority {
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          
          &.priority-low {
            background: #f1f5f9;
            color: #64748b;
          }
          
          &.priority-normal {
            background: #dbeafe;
            color: #1d4ed8;
          }
          
          &.priority-high {
            background: #fef3c7;
            color: #d97706;
          }
          
          &.priority-urgent {
            background: #fee2e2;
            color: #dc2626;
          }
        }
        
        .read-badge {
          background: #dcfce7;
          color: #16a34a;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
      }
      
      .notification-time {
        font-size: 11px;
        color: #94a3b8;
      }
    }
    
    .notification-indicator {
      position: absolute;
      top: 16px;
      right: 16px;
      
      .unread-dot {
        width: 8px;
        height: 8px;
        background: #ef4444;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
  }
}
.notifications-detail-panel {
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 16px 0;
  box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.05);
  
  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 28px;
    
    .detail-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      
      .detail-title {
        font-size: 22px;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 16px 0;
        line-height: 1.3;
        background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .detail-badges {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        
        .detail-type {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          color: #475569;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .detail-priority {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          
          &.priority-low {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #64748b;
          }
          
          &.priority-normal {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1d4ed8;
          }
          
          &.priority-high {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #d97706;
          }
          
          &.priority-urgent {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #dc2626;
          }
        }
        
        .read-badge {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #16a34a;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .unread-badge {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    .detail-body {
      flex: 1;
      margin-bottom: 24px;
      
      .detail-text {
        font-size: 16px;
        color: #374151;
        line-height: 1.7;
        white-space: pre-wrap;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
        }
      }
    }
    
    .detail-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      
      .detail-time {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #64748b;
        background: #f8fafc;
        padding: 8px 12px;
        border-radius: 8px;
        
        i {
          font-size: 16px;
          color: #94a3b8;
        }
        
        .read-time {
          color: #16a34a;
          font-weight: 500;
        }
      }
      
      .detail-actions {
        display: flex;
        gap: 10px;
        
        .el-button {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }
  
  .detail-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #64748b;
    text-align: center;
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.6;
    }
    
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px 0;
    }
    
    .empty-description {
      font-size: 14px;
      margin: 0;
      max-width: 280px;
      line-height: 1.5;
    }
  }
}

// 动画效果
@keyframes urgentPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.notifications-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.notifications-dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 400px;
}

.notifications-list-panel {
  border-right: 1px solid #e4e7ed;
  padding-right: 16px;
  
  .el-scrollbar {
    height: 400px;
  }
}

.dialog-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  border-left: 4px solid #409EFF;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f9ff;
    transform: translateX(2px);
  }
  
  &.priority-low { 
    border-left-color: #909399; 
    &:hover { background: #f8f9fa; }
  }
  &.priority-normal { 
    border-left-color: #409EFF; 
    &:hover { background: #f5f9ff; }
  }
  &.priority-high { 
    border-left-color: #E6A23C; 
    &:hover { background: #fdf6ec; }
  }
  &.priority-urgent { 
    border-left-color: #F56C6C; 
    &:hover { background: #fef0f0; }
    animation: urgentPulse 2s infinite;
  }
  
  &.active { 
    background: #e6f7ff; 
    border-left-width: 6px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }
  
  &.is-read { 
    opacity: 0.7;
    background: #f8f9fa;
    .title { color: #909399; }
    .meta { color: #c0c4cc; }
  }
  
  .title { 
    font-weight: 600; 
    font-size: 14px; 
    color: #303133; 
    margin-bottom: 6px; 
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: box;
    line-clamp: 2;
    overflow: hidden;
  }
  
  .meta { 
    font-size: 12px; 
    color: #909399; 
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .read-status { 
    color: #67c23a; 
    font-weight: 500; 
    background: rgba(103, 194, 58, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
  }
}

.notifications-detail-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  
  .detail-title { 
    font-size: 18px; 
    font-weight: 700; 
    margin-bottom: 12px; 
    color: #303133;
    line-height: 1.4;
  }
  
  .detail-content { 
    font-size: 14px; 
    color: #606266; 
    line-height: 1.6; 
    white-space: pre-wrap; 
    flex: 1;
    margin-bottom: 16px;
  }
  
  .detail-meta { 
    margin-bottom: 16px; 
    display: flex; 
    flex-wrap: wrap; 
    gap: 16px; 
    font-size: 12px; 
    color: #909399;
    
    span {
      background: #f5f7fa;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .read-status { 
      color: #67c23a; 
      font-weight: 500; 
      background: rgba(103, 194, 58, 0.1);
    }
  }
  
  .detail-actions { 
    display: flex; 
    gap: 12px; 
    margin-top: auto;
  }
  
  &.empty { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    color: #909399;
    font-size: 14px;
    background: #f8f9fa;
    border: 2px dashed #e4e7ed;
  }
}

@keyframes urgentPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
  }
  50% {
    box-shadow: 0 4px 16px rgba(245, 108, 108, 0.4);
  }
}

// 移动端响应式优化
@media (max-width: 768px) {
  .notifications-dialog {
    :deep(.el-dialog) {
      margin: 10px;
      width: calc(100% - 20px);
      max-height: calc(100vh - 20px);
    }
    
    :deep(.el-dialog__header) {
      padding: 16px 20px;
      
      .el-dialog__title {
        font-size: 16px;
      }
    }
  }
  
  .notifications-dialog-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    min-height: calc(100vh - 120px);
  }
  
  .notifications-list-panel {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 250px;
    
    .list-header {
      padding: 16px 20px 12px;
      
      .list-title {
        font-size: 14px;
      }
      
      .notification-count {
        font-size: 11px;
        padding: 3px 6px;
      }
    }
    
    .notifications-scrollbar {
      padding: 4px;
    }
    
    .notification-item {
      padding: 12px;
      
      .notification-content {
        .notification-title {
          font-size: 13px;
        }
        
        .notification-meta {
          font-size: 11px;
        }
        
        .notification-time {
          font-size: 10px;
        }
      }
    }
  }
  
  .notifications-detail-panel {
    .detail-content {
      padding: 16px;
      
      .detail-header {
        margin-bottom: 16px;
        
        .detail-title {
          font-size: 16px;
        }
        
        .detail-badges {
          gap: 6px;
          
          .detail-type,
          .detail-priority,
          .read-badge {
            font-size: 11px;
            padding: 3px 6px;
          }
        }
      }
      
      .detail-body {
        margin-bottom: 16px;
        
        .detail-text {
          font-size: 14px;
          padding: 12px;
        }
      }
      
      .detail-footer {
        padding-top: 12px;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .detail-time {
          font-size: 12px;
        }
        
        .detail-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
    
    .detail-empty {
      padding: 20px;
      
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .empty-title {
        font-size: 16px;
      }
      
      .empty-description {
        font-size: 13px;
        max-width: 240px;
      }
    }
  }
}

@media (max-width: 480px) {
  .notifications-dialog-body {
    min-height: 450px;
  }
  
  .notifications-list-panel {
    .el-scrollbar {
      height: 150px;
    }
  }
  
  .notifications-detail-panel {
    min-height: 250px;
    padding: 12px;
    
    .detail-title {
      font-size: 15px;
    }
    
    .detail-content {
      font-size: 12px;
    }
  }
  
  .dialog-item {
    padding: 8px 10px;
    margin-bottom: 6px;
    
    .title {
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .meta {
      font-size: 10px;
    }
  }
}

// 移动端通知样式调整
@media (max-width: 768px) {
  .global-notifications {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    
    .notification-item {
      padding: 12px;
      
      .notification-content {
        .notification-title {
          font-size: 13px;
        }
        
        .notification-message {
          font-size: 12px;
        }
      }
    }
  }
}

/* 全局交互动效覆盖（布局内生效） */
.main-layout.anim-root :deep(.el-button),
.main-layout.anim-root :deep(.el-link),
.main-layout.anim-root :deep(.el-menu-item),
.main-layout.anim-root :deep(.el-breadcrumb__inner),
.main-layout.anim-root :deep(.el-dropdown-menu__item),
.main-layout.anim-root :deep(.el-tabs__item) {
  transition: background var(--anim-duration-fast) var(--anim-ease-standard),
              color var(--anim-duration-fast) var(--anim-ease-standard),
              transform var(--anim-duration-fast) var(--anim-ease-standard),
              box-shadow var(--anim-duration-fast) var(--anim-ease-standard);
}

.main-layout.anim-root :deep(.el-button:active),
.main-layout.anim-root :deep(.el-link:active),
.main-layout.anim-root :deep(.el-menu-item:active),
.main-layout.anim-root :deep(.el-breadcrumb__inner:active),
.main-layout.anim-root :deep(.el-dropdown-menu__item:active),
.main-layout.anim-root :deep(.el-tabs__item:active) {
  transform: scale(var(--press-scale));
}

/* 轻量 Hover 背景（黑白灰） */
.main-layout.anim-root :deep(.el-menu-item:hover),
.main-layout.anim-root :deep(.el-dropdown-menu__item:hover),
.main-layout.anim-root :deep(.el-tabs__item:hover),
.main-layout.anim-root :deep(.el-breadcrumb__inner:hover) {
  background: var(--hover-bg);
  color: #111827;
}

/* 页面容器可见性优化 */
.main-layout .page-content { content-visibility: auto; contain-intrinsic-size: 1200px; }

/* 无障碍：减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .main-layout.anim-root { scroll-behavior: auto !important; }
  .main-layout.anim-root :deep(*) { animation: none !important; transition: none !important; }
}

/* reduced-motion 变量级降级：将动效时长/阴影归零，禁用平滑滚动 */
@media (prefers-reduced-motion: reduce) {
  .main-layout.anim-root {
    --anim-duration-fast: 0s;
    --anim-duration-base: 0s;
    --anim-duration-slow: 0s;
    --hover-shadow: none;
    --press-shadow: none;
    scroll-behavior: auto;
  }
}

/* 全局表格动效统一（头/行/分页） */
.main-layout.anim-root {
  :deep(.el-table__header th) {
    transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-table__header th:hover) { background: var(--hover-bg); }

  :deep(.el-table__row) {
    transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard),
                box-shadow var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-table__row:hover) {
    background: var(--hover-bg);
    transform: translateY(-1px);
    box-shadow: var(--hover-shadow);
  }

  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next),
  :deep(.el-pagination .el-pager li) {
    transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-pagination .el-pager li:hover),
  :deep(.el-pagination .btn-prev:hover),
  :deep(.el-pagination .btn-next:hover) { background: var(--hover-bg); }
  :deep(.el-pagination .el-pager li:active),
  :deep(.el-pagination .btn-prev:active),
  :deep(.el-pagination .btn-next:active) { transform: scale(var(--press-scale)); }
}

/* 全局弹层/下拉/提示/通知/对话框 动效统一 */
.main-layout.anim-root {
  /* Overlay 轻淡入 */
  :deep(.el-overlay) {
    animation: overlayFade var(--anim-duration-base) var(--anim-ease-decelerate) both;
    will-change: opacity;
  }

  /* Dialog 弹出缩放 */
  :deep(.el-dialog) {
    animation: popFadeScale var(--anim-duration-base) var(--anim-ease-decelerate) both;
    transform-origin: center top;
    will-change: opacity, transform;
  }

  /* Popper 系列（下拉/选择/菜单/提示） */
  :deep(.el-popper) {
    animation: popFadeScale var(--anim-duration-fast) var(--anim-ease-decelerate) both;
    will-change: opacity, transform;
  }

  /* Message/Notification 轻入场 */
  :deep(.el-message),
  :deep(.el-notification) {
    animation: overlayFade var(--anim-duration-base) var(--anim-ease-decelerate) both;
    will-change: opacity;
  }
}

@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes popFadeScale { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* 全局表单/标签微动效、抽屉/折叠、通知列表项 */
.main-layout.anim-root {
  /* 表单控件 */
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select .el-input__wrapper),
  :deep(.el-switch),
  :deep(.el-checkbox),
  :deep(.el-radio) {
    transition: box-shadow var(--anim-duration-base) var(--anim-ease-standard),
                border-color var(--anim-duration-base) var(--anim-ease-standard),
                background var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard);
  }

  /* 标签/徽章 */
  :deep(.el-tag),
  :deep(.el-badge) {
    transition: background var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-tag:hover) { transform: translateY(-1px); }

  /* 抽屉/折叠 */
  :deep(.el-drawer) { 
    animation: panelSlide var(--anim-duration-base) var(--anim-ease-decelerate) both; 
    will-change: transform, opacity; 
  }
  :deep(.el-collapse-item__wrap) {
    transition: height var(--anim-duration-base) var(--anim-ease-decelerate),
                opacity var(--anim-duration-base) var(--anim-ease-decelerate);
  }

  /* 通知列表项（统一轻量入场） */
  :deep(.notification-list .notification-item),
  :deep(.noti-list .noti-item) {
    animation: rowFadeIn var(--anim-duration-fast) var(--anim-ease-decelerate) both;
    will-change: opacity, transform;
  }
}

@keyframes panelSlide { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }

/* 全局 Tabs/Progress/Steps 动效统一 */
.main-layout.anim-root {
  /* Tabs */
  :deep(.el-tabs__item) {
    transition: color var(--anim-duration-fast) var(--anim-ease-standard),
                background var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-tabs__item:hover) { background: var(--hover-bg); }
  :deep(.el-tabs__item:active) { transform: scale(var(--press-scale)); }
  :deep(.el-tabs__active-bar) {
    transition: transform var(--anim-duration-base) var(--anim-ease-decelerate),
                width var(--anim-duration-base) var(--anim-ease-decelerate);
  }

  /* Progress */
  :deep(.el-progress-bar__inner) {
    transition: width var(--anim-duration-slow) var(--anim-ease-decelerate),
                background var(--anim-duration-fast) var(--anim-ease-standard);
  }

  /* Steps */
  :deep(.el-steps),
  :deep(.el-step) { will-change: opacity, transform; }
  :deep(.el-step__head),
  :deep(.el-step__main) {
    transition: color var(--anim-duration-fast) var(--anim-ease-standard),
                background var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-step.is-process .el-step__head) { transform: translateY(-1px); }
}

/* 全局：骨架屏/空状态/表单报错 动效统一 */
.main-layout.anim-root {
  /* 骨架屏闪烁（细腻） */
  :deep(.el-skeleton__item),
  :deep(.el-skeleton) {
    animation: shimmer 1.6s linear infinite;
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
    background-size: 400% 100%;
  }

  /* 空状态淡入 */
  :deep(.el-empty),
  :deep(.empty-state) {
    animation: overlayFade var(--anim-duration-base) var(--anim-ease-decelerate) both;
  }

  /* 表单报错：轻微抖动+颜色过渡 */
  :deep(.el-form-item.is-error .el-input__wrapper),
  :deep(.el-form-item.is-error .el-textarea__inner) {
    transition: border-color var(--anim-duration-fast) var(--anim-ease-standard),
                box-shadow var(--anim-duration-fast) var(--anim-ease-standard),
                background var(--anim-duration-fast) var(--anim-ease-standard);
    animation: subtleShake var(--anim-duration-base) var(--anim-ease-accelerate);
  }
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

@keyframes subtleShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-1px); }
  40% { transform: translateX(1px); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

/* 移动端底部导航、对话框内部分区、面包屑微互动 */
.main-layout.anim-root {
  /* 底部导航：激活指示与错峰入场 */
  :deep(.mobile-bottom-nav) {
    .nav-item { 
      will-change: opacity, transform; 
      animation: rowFadeIn var(--anim-duration-fast) var(--anim-ease-decelerate) both; 
      transition: color var(--anim-duration-fast) var(--anim-ease-standard),
                  background var(--anim-duration-fast) var(--anim-ease-standard),
                  transform var(--anim-duration-fast) var(--anim-ease-standard);
    }
    .nav-item:nth-child(1) { animation-delay: 0ms; }
    .nav-item:nth-child(2) { animation-delay: 30ms; }
    .nav-item:nth-child(3) { animation-delay: 60ms; }
    .nav-item:nth-child(4) { animation-delay: 90ms; }

    .nav-item.is-active {
      color: #111827;
      position: relative;
    }
    .nav-item.is-active::after {
      content: '';
      position: absolute; left: 50%; bottom: -2px; transform: translateX(-50%);
      width: 24px; height: 3px; border-radius: 2px; background: #111827;
      animation: overlayFade var(--anim-duration-base) var(--anim-ease-decelerate) both;
    }
  }

  /* 对话框内部：头/体/脚 分区错峰 */
  :deep(.el-dialog__header) { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; }
  :deep(.el-dialog__body) { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 60ms; }
  :deep(.el-dialog__footer) { will-change: opacity, transform; animation: blockFadeUp var(--anim-duration-base) var(--anim-ease-decelerate) both; animation-delay: 100ms; }

  /* 面包屑：悬停与当前项微互动 */
  :deep(.el-breadcrumb__inner) {
    transition: color var(--anim-duration-fast) var(--anim-ease-standard),
                background var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-breadcrumb__inner:hover) { background: var(--hover-bg); transform: translateY(-1px); }
  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) { font-weight: 600; color: #111827; }
}

/* 全局细节动效：focus 可见态、Popper箭头、Loading遮罩、Tag关闭、表格排序指示 */
.main-layout.anim-root {
  /* Focus-visible 可见态统一（键盘导航友好） */
  :deep(.el-button:focus-visible),
  :deep(.el-link:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.12);
    transition: box-shadow var(--anim-duration-base) var(--anim-ease-standard);
  }

  /* Popper 箭头淡入 */
  :deep(.el-popper__arrow)::before {
    transition: opacity var(--anim-duration-fast) var(--anim-ease-standard),
                transform var(--anim-duration-fast) var(--anim-ease-standard);
  }

  /* Loading 遮罩与 Spinner */
  :deep(.el-loading-mask) {
    animation: overlayFade var(--anim-duration-base) var(--anim-ease-decelerate) both;
  }
  :deep(.el-loading-spinner) {
    animation: spin var(--anim-duration-slow) linear infinite;
    will-change: transform;
  }

  /* Tag 关闭按钮微动效 */
  :deep(.el-tag .el-tag__close) {
    transition: transform var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard);
  }
  :deep(.el-tag .el-tag__close:hover) { transform: scale(1.1); }

  /* 表格排序指示轻微过渡 */
  :deep(.caret-wrapper),
  :deep(.sort-caret) {
    transition: transform var(--anim-duration-fast) var(--anim-ease-standard),
                opacity var(--anim-duration-fast) var(--anim-ease-standard),
                color var(--anim-duration-fast) var(--anim-ease-standard);
  }
}

/* 触控设备 hover 降级：移除位移与阴影，保留颜色反馈 */
@media (hover: none) {
  .main-layout.anim-root {
    :deep(.el-button:hover),
    :deep(.el-link:hover),
    :deep(.el-menu-item:hover),
    :deep(.el-dropdown-menu__item:hover),
    :deep(.el-tabs__item:hover),
    :deep(.el-breadcrumb__inner:hover),
    :deep(.el-table__row:hover),
    :deep(.file-list-row:hover),
    :deep(.mobile-bottom-nav .nav-item:hover) {
      transform: none !important;
      box-shadow: none !important;
      background: var(--hover-bg);
    }
  }
}

/* View Transitions（渐隐/显）- 渐进增强 */
:global(::view-transition-old(page)) {
  animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both;
}
:global(::view-transition-new(page)) {
  animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both;
}
@keyframes vtFadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes vtFadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  :global(::view-transition-old(page)),
  :global(::view-transition-new(page)) { animation: none !important; }
}

/* 命名 View Transitions：头部/侧栏/内容 分区 */
:global(::view-transition-old(vt-header)) { animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-header)) { animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }
:global(::view-transition-old(vt-sidebar)) { animation: vtSlideLeftOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-sidebar)) { animation: vtSlideLeftIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }
:global(::view-transition-old(vt-content)) { animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-content)) { animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }

@keyframes vtSlideLeftOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-6px); } }
@keyframes vtSlideLeftIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }

@media (prefers-reduced-motion: reduce) {
  :global(::view-transition-old(vt-header)),
  :global(::view-transition-new(vt-header)),
  :global(::view-transition-old(vt-sidebar)),
  :global(::view-transition-new(vt-sidebar)),
  :global(::view-transition-old(vt-content)),
  :global(::view-transition-new(vt-content)) { animation: none !important; }
}

/* 共享元素 View Transitions：头像/用户名 */
.main-layout.anim-root {
  /* 常见上下文中的头像与用户名 */
  :deep(.desktop-user-info .el-avatar),
  :deep(.user-avatar .el-avatar),
  :deep(.profile-avatar),
  :deep(.el-avatar.user-avatar) {
    view-transition-name: vt-avatar;
  }
  :deep(.desktop-user-info .username),
  :deep(.user-basic-info .username) {
    view-transition-name: vt-username;
  }
}

:global(::view-transition-old(vt-avatar)) { animation: vtScaleOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-avatar)) { animation: vtScaleIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }
:global(::view-transition-old(vt-username)) { animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-username)) { animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }

@keyframes vtScaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.98); } }
@keyframes vtScaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

/* 统计与进度：命名 View Transitions */
.main-layout.anim-root {
  /* 顶部存储信息（若存在） */
  :deep(.storage-info .storage-progress .el-progress-bar__inner) { view-transition-name: vt-storage-bar; }
  :deep(.storage-info .storage-text),
  :deep(.storage-info .storage-percent) { view-transition-name: vt-storage-text; }
}
:global(::view-transition-old(vt-storage-bar)) { animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-storage-bar)) { animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }
:global(::view-transition-old(vt-storage-text)) { animation: vtFadeOut var(--anim-duration-fast) var(--anim-ease-accelerate) both; }
:global(::view-transition-new(vt-storage-text)) { animation: vtFadeIn var(--anim-duration-base) var(--anim-ease-decelerate) both; }

</style>
