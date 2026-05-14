<template>
  <div class="main-layout">
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
          <img src="/logo.png" alt="图库系统" class="logo-image" />
          <span v-if="!sidebarCollapsed" class="logo-text">图库系统</span>
        </div>
        <el-button
          v-if="!sidebarCollapsed"
          type="text"
          class="collapse-btn"
          @click="toggleSidebar"
        >
          <el-icon>
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
          
          <!-- 个人资料 -->
          <el-menu-item index="/user-center">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>

          <!-- 通知管理 -->
          <el-menu-item index="/notifications">
            <el-icon><Bell /></el-icon>
            <span>通知管理</span>
          </el-menu-item>

          <!-- 回收站 -->
          <el-menu-item index="/recycle-bin">
            <el-icon><Delete /></el-icon>
            <span>回收站</span>
          </el-menu-item>

          <!-- 管理员专用菜单 -->
          <el-menu-item v-if="authStore.isAdmin" index="/admin">
            <el-icon><Setting /></el-icon>
            <span>管理中心</span>
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
        
        <el-dropdown @command="handleUserCommand" placement="top-end">
          <el-button type="text" class="user-menu-btn" :class="{ collapsed: sidebarCollapsed }">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="help">
                <el-icon><QuestionFilled /></el-icon>
                帮助中心
              </el-dropdown-item>
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
          <el-dropdown v-if="!isMobile" @command="handleUserCommand" placement="bottom-end" @visible-change="handleDesktopUserMenuVisibleChange">
            <div class="desktop-user-info">
              <el-avatar :size="32" :src="authStore.user?.avatar_url">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ authStore.user?.username }}</div>
                <div class="user-role">{{ authStore.user?.role === 'admin' ? '管理员' : '用户' }}</div>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="authStore.isAdmin" command="notifications">
                  <el-icon><Bell /></el-icon>
                  通知
                </el-dropdown-item>
                <el-dropdown-item command="help">
                  <el-icon><QuestionFilled /></el-icon>
                  帮助中心
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
                <el-dropdown-item v-if="authStore.isAdmin" command="notifications">
                  <el-icon><Bell /></el-icon>
                  通知
                </el-dropdown-item>
                <el-dropdown-item command="help">
                  <el-icon><QuestionFilled /></el-icon>
                  帮助中心
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
          <transition name="page-slide" mode="out-in" :duration="animationEnabled ? 300 : 0">
            <div v-if="Component" class="page-wrapper">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 通知悬浮窗：批量展示与详情 -->
    <el-dialog
      v-model="notificationsDialogVisible"
      title="通知中心"
      :width="isMobile ? 'calc(100vw - 24px)' : 'min(820px, calc(100vw - 48px))'"
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
            <div class="list-title-row">
              <h3 class="list-title">通知列表</h3>
              <span class="notification-count">{{ allNotifications.length }} 条通知</span>
            </div>
            <p class="list-subtitle">系统消息与账户提醒</p>
          </div>
          
          <el-scrollbar class="notifications-scrollbar">
            <div v-if="allNotifications.length === 0" class="empty-list">
              <el-icon class="empty-icon"><Bell /></el-icon>
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
                <div v-if="n.content" class="notification-summary-text">{{ n.content }}</div>
                <div class="notification-meta">
                  <span class="notification-type">{{ getNotificationTypeText(n.notification_type) }}</span>
                  <span :class="['notification-priority', `priority-${n.priority}`]">{{ getPriorityText(n.priority) }}</span>
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
                <span :class="['detail-priority', `priority-${detailNotification.priority}`]">
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
            <el-icon class="empty-icon"><Document /></el-icon>
            <h3 class="empty-title">选择通知查看详情</h3>
            <p class="empty-description">点击左侧通知列表中的任意一条通知，即可查看详细内容</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 移动端通知详情弹窗 -->
    <el-drawer
      v-model="mobileNotificationDetailVisible"
      direction="btt"
      size="70%"
      :show-close="false"
      class="mobile-notification-drawer"
    >
      <template #header>
        <div class="mobile-detail-header">
          <h3 class="mobile-detail-title">{{ detailNotification?.title || '通知详情' }}</h3>
          <el-button text @click="mobileNotificationDetailVisible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <div v-if="detailNotification" class="mobile-detail-content">
        <div class="mobile-detail-badges">
          <span class="detail-type">{{ getNotificationTypeText(detailNotification.notification_type) }}</span>
          <span :class="['detail-priority', `priority-${detailNotification.priority}`]">
            {{ getPriorityText(detailNotification.priority) }}
          </span>
          <span v-if="detailNotification.is_read" class="read-badge">已读</span>
          <span v-else class="unread-badge">未读</span>
        </div>
        <div class="mobile-detail-body">
          <div class="detail-text">{{ detailNotification.content || '暂无内容' }}</div>
        </div>
        <div class="mobile-detail-footer">
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
            <el-button type="primary" size="small" plain @click="markNotificationAsUnread(detailNotification.id)">
              标记未读
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 移动端底部 Dock 导航栏 -->
    <div v-if="isMobile" class="mobile-bottom-nav">
      <!-- 椭圆玻璃指示器：通过 absolute 定位 + left transition 实现丝滑滑动 -->
      <div class="nav-indicator" :style="indicatorStyle"></div>
      <div class="nav-items">
        <div
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="$router.push(item.path)"
        >
          <el-icon class="nav-icon"><component :is="iconMap[item.iconKey]" /></el-icon>
          <span class="nav-text">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import {
  Fold,
  Expand,
  House,
  Folder,
  Setting,
  MoreFilled,
  Menu,
  User,
  Bell,
  Delete,
  SwitchButton,
  ArrowDown,
  UserFilled,
  Monitor,
  Document,
  Tools,
  Close,
  Grid,
  List,
  QuestionFilled,
  Close
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { formatFileSize, getStorageUsageColor, formatPercentage } from '@/utils/helpers'

// Apple Dock 图标映射（静态对象，无法用动态字符串查找组件）
const iconMap: Record<string, any> = {
  Folder,
  House,
  Setting,
  User,
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const isDragging = ref(false)
const isDevelopment = ref(process.env.NODE_ENV === 'development')
const animationEnabled = ref(true) // 页面动画控制
const mobileUserMenuVisible = ref(false) // 移动端用户菜单显示状态

// 全局通知相关
const globalNotifications = ref([])
const allNotifications = ref([])
const notificationCheckInterval = ref(null)
const notificationsDialogVisible = ref(false)
const detailNotification = ref<any>(null)
const mobileNotificationDetailVisible = ref(false)
const eventSource = ref<EventSource | null>(null)
const configVersion = ref<string | null>(null)
let configPoller: any = null

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

// Apple Dock 导航配置
const navItems = computed(() => {
  const items = [
    { path: '/', label: '文件', iconKey: 'Folder' },
    { path: '/dashboard', label: '仪表盘', iconKey: 'House' },
    { path: '/user-center', label: '我的', iconKey: 'User' },
  ]
  if (authStore.user?.role === 'admin') {
    items.splice(2, 0, { path: '/admin', label: '管理', iconKey: 'Setting' })
  }
  return items
})

const activeIndex = computed(() => {
  const idx = navItems.value.findIndex(item => isActive(item.path))
  return idx >= 0 ? idx : 0
})

const indicatorStyle = computed(() => {
  const itemWidth = 100 / navItems.value.length
  const left = activeIndex.value * itemWidth + itemWidth / 2
  return {
    width: `${itemWidth - 12}%`,
    left: `${left}%`,
  }
})

const isActive = (path: string) => route.path === path

// 面包屑导航
const breadcrumbs = computed(() => {
  const breadcrumbMap: Record<string, { name: string; path: string }> = {
    '/': { name: '文件管理', path: '/' },
    '/dashboard': { name: '仪表盘', path: '/dashboard' },
    '/admin': { name: '管理控制台', path: '/admin' },
    '/user-center': { name: '个人资料', path: '/user-center' },
    '/settings': { name: '系统设置', path: '/settings' },
    '/help': { name: '帮助中心', path: '/help' }
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
    case 'help':
      router.push('/help')
      break
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
const handleMobileUserMenuVisibleChange = async (visible: boolean) => {
  mobileUserMenuVisible.value = visible
  if (visible) {
    try { await authStore.checkAuth() } catch {}
  }
}

// 桌面端用户菜单显示状态变化（用于实时刷新用户用量等信息）
const handleDesktopUserMenuVisibleChange = async (visible: boolean) => {
  if (visible) {
    try { await authStore.checkAuth() } catch {}
  }
}

// 触摸手势处理
const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isDragging.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isMobile.value) return
  
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

// 监听路由变化，更新面包屑
watch(route, () => {
  // 路由变化时的处理逻辑
}, { immediate: true })

// 监听窗口大小变化
const handleResize = () => {
  checkScreenSize()
}

// 获取系统设置
const fetchSystemSettings = async () => {
  try {
    // 使用公共接口获取系统信息，而不是管理员接口
    const response = await api.get('/system/info')
    const systemInfo = response.data
    // 保存配置版本并缓存到 sessionStorage
    if (systemInfo?.config_version) {
      const prev = sessionStorage.getItem('config_version')
      configVersion.value = String(systemInfo.config_version)
      sessionStorage.setItem('config_version', configVersion.value)
      if (prev && prev !== configVersion.value) {
        window.location.reload()
      }
    }
    
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
  if (!authStore.user) return

  try {
    const response = await api.get('/auth/notifications/all')
    if (response.data.success) {
      allNotifications.value = response.data.notifications || []
    } else {
      ElMessage.error('获取通知失败: ' + response.data.message)
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // 用户未登录，静默忽略
    } else if (error.response?.status === 404) {
      ElMessage.error('通知服务暂不可用')
    } else {
      ElMessage.error('获取通知失败，请稍后重试')
    }
  }
}

// 全局通知相关方法
const fetchGlobalNotifications = async () => {
  if (!authStore.user) return

  try {
    const response = await api.get('/auth/notifications/unread')
    if (response.data.success) {
      globalNotifications.value = response.data.notifications || []
    }
  } catch (error: any) {
    // 静默处理网络错误
  }
}

const markNotificationAsRead = async (notificationId: number) => {
  try {
    await api.put(`/auth/notifications/${notificationId}/read`)

    // 从全局通知列表中移除
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notificationId)

    // 更新当前详情通知状态
    if (detailNotification.value && detailNotification.value.id === notificationId) {
      detailNotification.value = {
        ...detailNotification.value,
        is_read: 1,
        read_at: new Date().toISOString()
      }
    }

    ElMessage.success('通知已标记为已读')
  } catch (error) {
    ElMessage.error('标记通知为已读失败')
  }
}

const markNotificationAsUnread = async (notificationId: number) => {
  try {
    await api.put(`/auth/notifications/${notificationId}/unread`)

    // 更新当前详情通知状态
    if (detailNotification.value && detailNotification.value.id === notificationId) {
      detailNotification.value = {
        ...detailNotification.value,
        is_read: 0,
        read_at: null
      }
    }

    ElMessage.success('通知已标记为未读')
  } catch (error) {
    ElMessage.error('标记通知为未读失败')
  }
}

const closeNotification = (notificationId: number) => {
  // 从全局通知列表中移除
  globalNotifications.value = globalNotifications.value.filter(n => n.id !== notificationId)

  // 如果当前显示的是这个通知的详情，则关闭详情面板
  if (detailNotification.value && detailNotification.value.id === notificationId) {
    detailNotification.value = null
    // 移动端关闭抽屉
    if (isMobile.value) {
      mobileNotificationDetailVisible.value = false
    }
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
  
  const p = globalNotifications.value.reduce((max, n:any) => {
    const rank = ({ low: 1, normal: 2, high: 3, urgent: 4 } as any)[n.priority] || 2
    return rank > max ? rank : max
  }, 0)
  return p === 4 ? 'priority-urgent' : p === 3 ? 'priority-high' : p === 2 ? 'priority-normal' : 'priority-low'
})

// 对话框事件处理
const onDialogOpened = () => {
}

const onDialogClosed = () => {
  detailNotification.value = null
}

// 关闭通知对话框
const closeNotificationsDialog = () => {
  notificationsDialogVisible.value = false
  detailNotification.value = null
}

// 打开通知详情悬浮窗
const openNotificationDetail = async (n: any) => {
  detailNotification.value = n

  if (!n.is_read) {
    const notificationId = n.id
    const now = new Date().toISOString()

    // 立即更新本地状态（乐观更新）
    const notificationIndex = allNotifications.value.findIndex(notif => notif.id === notificationId)
    if (notificationIndex !== -1) {
      allNotifications.value[notificationIndex] = {
        ...allNotifications.value[notificationIndex],
        is_read: 1,
        read_at: now
      }
    }

    // 从全局通知中移除
    const globalIndex = globalNotifications.value.findIndex(notif => notif.id === notificationId)
    if (globalIndex !== -1) {
      globalNotifications.value.splice(globalIndex, 1)
    }

    // 调用API标记已读
    try {
      await api.put(`/auth/notifications/${notificationId}/read`)
    } catch (error: any) {
      // API失败时回滚本地状态
      if (notificationIndex !== -1) {
        allNotifications.value[notificationIndex] = {
          ...allNotifications.value[notificationIndex],
          is_read: 0,
          read_at: null
        }
        if (globalIndex === -1) {
          globalNotifications.value.push(n)
        }
      }
    }
  }

  // 移动端打开抽屉，桌面端打开对话框
  if (isMobile.value) {
    mobileNotificationDetailVisible.value = true
  } else {
    if (!notificationsDialogVisible.value) {
      notificationsDialogVisible.value = true
    }
  }
}

// 打开通知对话框
const openNotificationsDialog = async () => {
  notificationsDialogVisible.value = true
  await fetchAllNotifications() // 获取所有通知
}

const startNotificationPolling = () => {
  // 每10秒检查一次新通知
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
  
  eventSource.value = new EventSource(`${api.defaults.baseURL}/auth/notifications/stream?token=${encodeURIComponent(token)}`)

  eventSource.value.onmessage = () => {}

  eventSource.value.addEventListener('notification:new', () => {
    fetchGlobalNotifications()
  })

  eventSource.value.onerror = () => {
    eventSource.value?.close()
    setTimeout(setupSSE, 5000)
  }
}

const closeSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
}

// 生命周期
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', handleResize)
  
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
  startNotificationPolling()
  setupSSE() // 建立 SSE 连接
  
  // 添加全局事件监听
  window.addEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
  // 启动配置版本轮询（30秒）
  configPoller = setInterval(fetchSystemSettings, 30000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
  
  // 停止通知轮询
  stopNotificationPolling()
  
  // 关闭 SSE 连接
  closeSSE()
  if (configPoller) { clearInterval(configPoller); configPoller = null }
  
  // 移除触摸事件监听
  if (isMobile.value) {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  position: relative;
  touch-action: pan-y pinch-zoom; // 允许垂直滚动和缩放，限制水平滚动
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
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  
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
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  .logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
    transition: all 0.3s ease;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
    transition: all 0.3s ease;
  }
}

.collapse-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #6f6f6f; /* 基础灰色 */
  
  :deep(.el-icon) {
    color: currentColor; /* 图标随文字颜色 */
    font-size: 16px;
  }
  
  &:hover {
    background: #f5f5f5;
    color: #1f1f1f;
  }
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  
  :deep(.el-menu) {
    border-right: none;
    /* 灰阶主题 - 侧边栏菜单 */
    --sb-bg: #ffffff;
    --sb-text: #1f1f1f;
    --sb-muted: #6f6f6f;
    --sb-border: #e5e5e5;
    --sb-hover-bg: #f5f5f5;
    --sb-active-bg: #ededed;
    --sb-active-text: #000000;
    background-color: var(--sb-bg) !important;
    color: var(--sb-text) !important;
    
    .el-menu-item {
      height: 48px;
      line-height: 48px;
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
      color: var(--sb-text) !important;
      
      .el-icon { color: var(--sb-muted) !important; }
      
      &:hover {
        background: var(--sb-hover-bg) !important;
        color: var(--sb-text) !important;
        transform: translateX(4px);
      }
      
      &.is-active {
        background: var(--sb-active-bg) !important;
        color: var(--sb-active-text) !important;
        box-shadow: none !important;
        
        .el-icon {
          color: var(--sb-active-text) !important;
        }
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  gap: 12px;

  &.collapsed {
    justify-content: center;
    padding: 8px;
    gap: 8px;
  }
}

.help-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
  white-space: nowrap;

  &:hover {
    color: #409eff;
  }

  .el-icon {
    font-size: 16px;
  }

  &.collapsed {
    justify-content: center;
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
  transition: all 0.3s ease;
  color: #6f6f6f; /* 基础灰色 */
  
  :deep(.el-icon) {
    color: currentColor; /* 图标随文字颜色 */
  }
  
  &:hover {
    background: #f5f5f5;
    color: #1f1f1f;
  }
  
  :deep(.el-icon) {
    font-size: 16px;
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
  overflow-x: hidden;
  overflow-y: auto;
  transition: padding-left 0.3s ease, padding-right 0.3s ease;
  background: #f7f7f7; // 灰阶背景
  
  // 当侧边栏折叠时调整margin
  &.sidebar-collapsed {
    /* 留空，具体在各断点中用 padding 调整左右留白 */
  }
}

.top-header {
  height: 60px;
  width: 100%;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
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

.breadcrumb-nav {
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #7f8c8d;
      font-weight: 500;
      
      &:hover {
        color: #667eea;
      }
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
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
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
  color: #6f6f6f;
  
  &:hover {
    background: #f5f5f5;
    color: #1f1f1f;
  }
  
  :deep(.el-avatar) {
    --el-avatar-size: 32px; // 增大头像尺寸
  }
}

.page-content {
  flex: 1;
  padding: 16px 0; // 只保留上下内边距，移除左右内边距，让页面组件自己控制
  overflow: visible;
  background: transparent; // 移除背景色，由main-content提供
}

.page-wrapper {
  width: 100%;
  min-height: 100%;
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

// Apple 玻璃质感 Dock 导航栏
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0);

  .nav-indicator {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 44px;
    background: rgba(255, 255, 255, 0.62);
    border-radius: 22px;
    box-shadow:
      0 0 0 0.5px rgba(255, 255, 255, 0.48),
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    transition: left 0.42s cubic-bezier(0.32, 0.72, 0, 1);
    pointer-events: none;
  }

  .nav-items {
    display: flex;
    position: relative;
    margin: 8px 12px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.36);
    border-radius: 28px;
    border: 0.5px solid rgba(255, 255, 255, 0.5);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.1),
      0 8px 40px rgba(0, 0, 0, 0.06),
      inset 0 0.5px 0 rgba(255, 255, 255, 0.7),
      inset 0 -0.5px 0 rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 5px 4px;
      cursor: pointer;
      border-radius: 20px;
      transition: opacity 0.2s ease;
      position: relative;
      z-index: 1;

      .nav-icon {
        font-size: 22px;
        color: rgba(60, 60, 67, 0.55);
        transition: color 0.2s ease, transform 0.2s ease;
      }

      .nav-text {
        font-size: 10px;
        font-weight: 500;
        color: rgba(60, 60, 67, 0.55);
        transition: color 0.2s ease;
        letter-spacing: 0.01em;
      }

      &.active {
        .nav-icon {
          color: #007AFF;
          transform: scale(1.05);
        }
        .nav-text {
          color: #007AFF;
          font-weight: 600;
        }
      }

      &:not(.active):hover {
        .nav-icon {
          color: rgba(0, 122, 255, 0.7);
        }
        .nav-text {
          color: rgba(0, 122, 255, 0.7);
        }
      }
    }
  }
}

// 桌面端默认样式 (1200px+)
@media (min-width: 1200px) {
  .main-content {
    padding-left: 220px;
    padding-right: 220px; // 右留白与左留白完全相同
    margin-left: 0;
    margin-right: 0; // 移除外边距以让滚动条在最右侧
    
    &.sidebar-collapsed {
      padding-left: 84px;
      padding-right: 84px; // 右留白与左留白完全相同
      margin-left: 0;
      margin-right: 0; // 移除外边距以让滚动条在最右侧
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
    width: 100%;
    max-width: none;
    border-radius: 0;
  }
}

// 响应式设计 - 使用精确断点，避免重叠
// 超大屏 (1920px+)
@media (min-width: 1920px) {
  .main-content {
    padding-left: 250px;
    padding-right: 250px; // 右留白与左留白完全相同
    margin-left: 0;
    margin-right: 0; // 移除外边距以让滚动条在最右侧
    
    &.sidebar-collapsed {
      padding-left: 110px;
      padding-right: 110px; // 右留白与左留白完全相同
      margin-left: 0;
      margin-right: 0; // 移除外边距以让滚动条在最右侧
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
    width: 100%;
    height: 70px;
    padding: 0 32px;
    border-radius: 0;
  }
}

// 大屏桌面 (1440px - 1919px)
@media (min-width: 1440px) and (max-width: 1919px) {
  .main-content {
    padding-left: 235px;
    padding-right: 235px; // 右留白与左留白完全相同
    margin-left: 0;
    margin-right: 0; // 移除外边距以让滚动条在最右侧
    
    &.sidebar-collapsed {
      padding-left: 95px;
      padding-right: 95px; // 右留白与左留白完全相同
      margin-left: 0;
      margin-right: 0; // 移除外边距以让滚动条在最右侧
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
    width: 100%;
    height: 65px;
    padding: 0 28px;
    border-radius: 0;
  }
}

// 桌面端 (1200px - 1439px)
@media (min-width: 1200px) and (max-width: 1439px) {
  .main-content {
    padding-left: 220px;
    padding-right: 220px; // 右留白与左留白完全相同
    margin-left: 0;
    margin-right: 0; // 移除外边距以让滚动条在最右侧
    
    &.sidebar-collapsed {
      padding-left: 84px;
      padding-right: 84px; // 右留白与左留白完全相同
      margin-left: 0;
      margin-right: 0; // 移除外边距以让滚动条在最右侧
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
    width: 100%;
    max-width: none;
    height: 60px;
    padding: 0 24px;
    border-radius: 0;
  }
}

// 平板横屏/小屏笔记本 (1024px - 1199px)
@media (min-width: 1024px) and (max-width: 1199px) {
  .main-content {
    padding-left: 195px;
    padding-right: 195px; // 右留白与左留白完全相同
    margin-left: 0;
    margin-right: 0; // 移除外边距以让滚动条在最右侧
    
    &.sidebar-collapsed {
      padding-left: 79px;
      padding-right: 79px; // 右留白与左留白完全相同
      margin-left: 0;
      margin-right: 0; // 移除外边距以让滚动条在最右侧
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
    width: 100%;
    max-width: none;
    height: 58px;
    padding: 0 20px;
    border-radius: 0;
  }
  
  .storage-info {
    min-width: 180px;
  }
}

// 平板竖屏 (768px - 1023px)
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    padding-left: 195px;
    padding-right: 195px;
    margin-left: 0;
    margin-right: 0;

    &.sidebar-collapsed {
      padding-left: 79px;
      padding-right: 79px;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .sidebar {
    width: 180px;
    position: relative;
    height: auto;

    &.collapsed {
      width: 64px;
    }
  }

  .top-header {
    width: 100%;
    max-width: none;
    height: 58px;
    padding: 0 16px;
    border-radius: 0;
    justify-content: space-between;
    align-items: center;
  }

  .page-content {
    padding: 0;
  }

  .storage-info {
    min-width: 140px;
  }

  // 隐藏移动端遮罩层和底部 Dock
  .mobile-overlay {
    display: none;
  }

  .mobile-bottom-nav {
    display: none;
  }

  // 移除底部导航栏预留空间
  .page-content {
    padding-bottom: 0;
  }

  .header-left {
    gap: 10px;
    flex: 0 0 auto;
    justify-content: flex-start;
  }

  .header-right {
    gap: 10px;
    flex: 0 0 auto;
    justify-content: flex-end;
  }

  .sidebar-footer {
    .user-info {
      display: none;
    }
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
    justify-content: space-between; // 左右分布
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 8px;
    flex: 0 0 auto;
    justify-content: flex-start;
    
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
    flex: 0 0 auto;
    justify-content: flex-end;
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
  
  // 移动端底部 Dock 导航栏
  .mobile-bottom-nav {
    display: block;
  }

  // 为底部导航栏预留空间
  .page-content {
    padding-bottom: 88px;
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
    justify-content: space-between; // 左右分布
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 6px;
    flex: 0 0 auto;
    justify-content: flex-start;
    
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
    flex: 0 0 auto;
    justify-content: flex-end;
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
  
  // 移动端底部 Dock 导航栏
  .mobile-bottom-nav {
    display: block;
  }

  // 为底部导航栏预留空间
  .page-content {
    padding-bottom: 88px;
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
    justify-content: space-between; // 左右分布
    align-items: center; // 垂直居中
  }
  
  .page-content {
    padding: 0; // 移动端完全移除内边距
  }
  
  .header-left {
    gap: 6px;
    flex: 0 0 auto;
    justify-content: flex-start;
  }
  
  .header-right {
    gap: 6px;
    flex: 0 0 auto;
    justify-content: flex-end;
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
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.page-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
  will-change: transform, opacity;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.page-wrapper {
  will-change: auto;
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
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    background: #ffffff;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    background: #ffffff;
    border-bottom: 1px solid #ebeef5;
  }
  
  :deep(.el-dialog__title) {
    color: #303133;
    font-weight: 600;
    font-size: 17px;
  }
  
  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
    
    &:hover .el-dialog__close {
      color: #409eff;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
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
        
        // 移动端隐藏内容摘要
        .notification-summary-text {
          display: none;
        }
      }
    }
  }
}

// 通知中心最终样式覆盖
.notifications-dialog {
  :deep(.el-dialog) {
    max-height: min(88vh, 720px);
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  }

  :deep(.el-dialog__header) {
    min-height: 68px;
    padding: 20px 28px;
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
    color: #0f172a;

    &::before {
      display: none;
    }

    .el-dialog__title {
      color: #0f172a;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0;
    }

    .el-dialog__headerbtn {
      top: 18px;
      right: 20px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f8fafc;
      color: #64748b;

      &:hover {
        background: #eef2ff;
        color: #2563eb;
        transform: none;
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
    border-radius: 0;
    background: #f8fafc;
  }
}

.notifications-dialog-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 480px;
  max-height: calc(85vh - 60px);
  overflow: hidden;
}

.notifications-list-panel {
  min-width: 0;
  padding: 0 !important;
  border-right: 1px solid #ebeef5;
  background: #ffffff;

  .list-header {
    padding: 20px;
    border-bottom: 1px solid #f5f7fa;
    background: #ffffff;
  }

  .list-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .list-title {
    margin: 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }

  .list-subtitle {
    margin: 6px 0 0;
    color: #909399;
    font-size: 12px;
  }

  .notification-count {
    padding: 3px 10px;
    border-radius: 10px;
    background: #f4f4f5;
    color: #606266;
    font-size: 12px;
    font-weight: 500;
  }

  .notifications-scrollbar,
  .el-scrollbar {
    flex: 1;
    height: auto !important;
    min-height: 0;
  }

  .notifications-scrollbar {
    padding: 12px;
  }

  .empty-list {
    min-height: 280px;
    padding: 40px 20px;

    .empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      color: #c0c4cc;
      font-size: 48px;
    }
  }

  .notification-item {
    display: flex;
    gap: 12px;
    min-width: 0;
    margin: 0 0 8px;
    padding: 14px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      border-color: #d9ecff;
    }

    &.is-read {
      opacity: 0.6;
    }

    .notification-content {
      min-width: 0;
      flex: 1;
    }

    .notification-title {
      margin: 0 0 4px;
      color: #303133;
      font-size: 14px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notification-summary-text {
      margin: 0 0 8px;
      color: #909399;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notification-meta {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }

    .notification-type,
    .notification-priority,
    .read-badge {
      padding: 2px 8px;
      border-radius: 4px;
      background: #f4f4f5;
      color: #606266;
    }

    .notification-time {
      color: #c0c4cc;
      font-size: 12px;
      margin-top: 6px;
    }

    .notification-indicator {
      flex-shrink: 0;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #409eff;
    }
  }
}

.notifications-detail-panel {
  min-width: 0;
  min-height: 0;
  padding: 0 !important;
  background: #ffffff;

  .detail-content {
    min-height: 100%;
    padding: 24px;
  }

  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .detail-title {
    margin: 0 0 12px;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  .detail-badges {
    display: flex;
    gap: 8px;

    span {
      padding: 3px 10px;
      border-radius: 4px;
      background: #f4f4f5;
      color: #606266;
      font-size: 12px;
    }
  }

  .detail-body {
    flex: 1;
    margin-bottom: 20px;
  }

  .detail-text {
    min-height: 160px;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fafafa;
    color: #606266;
    font-size: 14px;
    line-height: 1.8;
  }

  .detail-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }

  .detail-time {
    color: #909399;
    font-size: 13px;
  }

  .detail-actions {
    display: flex;
    gap: 10px;
  }

  .detail-empty {
    min-height: 100%;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .detail-empty .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    color: #c0c4cc;
    font-size: 64px;
  }

  .detail-empty .empty-title {
    margin: 0 0 8px;
    color: #606266;
    font-size: 16px;
    font-weight: 500;
  }

  .detail-empty .empty-description {
    color: #909399;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .notifications-dialog {
    :deep(.el-dialog) {
      width: calc(100vw - 24px) !important;
      max-height: calc(100dvh - 24px);
      margin: 12px auto;
    }

    :deep(.el-dialog__header) {
      min-height: 58px;
      padding: 16px 20px;

      .el-dialog__title {
        font-size: 17px;
      }
    }
  }

  .notifications-dialog-body {
    grid-template-columns: 1fr;
    grid-template-rows: 230px minmax(0, 1fr);
    min-height: calc(100dvh - 96px);
    max-height: calc(100dvh - 82px);
  }

  .notifications-list-panel {
    border-right: none;
    border-bottom: 1px solid #ebeef5;

    .list-header {
      padding: 14px 16px 12px;
    }

    .notifications-scrollbar {
      padding: 8px;
    }
  }

  .notifications-detail-panel {
    min-height: 0;

    .detail-content {
      padding: 18px;
    }

    .detail-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .detail-actions {
      width: 100%;

      .el-button {
        flex: 1 1 0;
      }
    }
  }
}

@media (max-width: 480px) {
  .notifications-dialog-body {
    grid-template-rows: 210px minmax(0, 1fr);
  }

  .notifications-list-panel .notification-item {
    padding: 12px 12px 12px 14px;
  }

  .notifications-detail-panel {
    .detail-title {
      font-size: 18px;
    }

    .detail-text {
      min-height: 120px;
    }
  }
}

// 移动端通知详情抽屉样式
.mobile-notification-drawer {
  :deep(.el-drawer) {
    border-radius: 16px 16px 0 0;
    max-height: 80vh;
  }

  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .mobile-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .mobile-detail-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.el-drawer__body) {
    padding: 20px;
    overflow-y: auto;
  }

  .mobile-detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .mobile-detail-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .mobile-detail-body {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;

      .detail-text {
        color: #606266;
        font-size: 15px;
        line-height: 1.7;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }

    .mobile-detail-footer {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .detail-time {
        color: #909399;
        font-size: 13px;
      }

      .detail-actions {
        display: flex;
        gap: 12px;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
