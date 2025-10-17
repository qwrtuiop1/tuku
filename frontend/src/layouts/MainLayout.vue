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
        
        <el-dropdown @command="handleUserCommand" placement="top-end">
          <el-button type="text" class="user-menu-btn" :class="{ collapsed: sidebarCollapsed }">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
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
          <!-- 移动端菜单按钮 -->
          <el-button
            v-if="isMobile"
            type="text"
            class="mobile-menu-btn"
            @click="toggleSidebar"
          >
            <el-icon><Menu /></el-icon>
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
          <el-dropdown v-if="!isMobile" @command="handleUserCommand" placement="bottom-end">
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
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
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
          
          <!-- 移动端用户菜单 -->
          <el-dropdown v-if="isMobile" @command="handleUserCommand" placement="bottom-end">
            <el-button type="text" class="mobile-user-btn">
              <el-avatar :size="24" :src="authStore.user?.avatar_url">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
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
      </header>
      
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
        
        <div 
          class="nav-item" 
          :class="{ active: $route.path === '/profile' }"
          @click="$router.push('/profile')"
        >
          <el-icon class="nav-icon"><User /></el-icon>
          <span class="nav-text">我的</span>
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
  Picture,
  Fold,
  Expand,
  House,
  Folder,
  Setting,
  MoreFilled,
  Menu,
  User,
  SwitchButton,
  ArrowDown,
  UserFilled,
  Monitor,
  Document,
  Tools
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
const animationEnabled = ref(true) // 页面动画控制

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
    '/profile': { name: '个人资料', path: '/profile' },
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
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      if (authStore.isAdmin) {
        router.push('/settings')
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
    const response = await api.get('/admin/settings')
    const settings = response.data.settings || {}
    
    // 更新动画设置
    animationEnabled.value = settings.enable_animation?.value !== 'false'
  } catch (error) {
    // 如果获取失败，使用默认值
    console.warn('获取系统设置失败，使用默认动画设置')
  }
}

// 监听系统设置变化
const handleSystemSettingsChange = (event: CustomEvent) => {
  const settings = event.detail
  if (settings.enable_animation !== undefined) {
    animationEnabled.value = settings.enable_animation
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
  
  // 添加全局事件监听
  window.addEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('system-settings-changed', handleSystemSettingsChange as EventListener)
  
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
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  
  :deep(.el-icon) {
    font-size: 16px;
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
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
        color: #667eea;
        transform: translateX(4px);
      }
      
      &.is-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        
        .el-icon {
          color: white;
        }
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  
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
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
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
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    
    :deep(.el-icon) {
      font-size: 24px; // 增大图标
    }
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
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  :deep(.el-avatar) {
    --el-avatar-size: 32px; // 增大头像尺寸
  }
}

.page-content {
  flex: 1;
  padding: 16px 0; // 只保留上下内边距，移除左右内边距，让页面组件自己控制
  overflow-y: auto;
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
      
      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
      
      &.active {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
      }
      
      .nav-icon {
        font-size: 20px;
        margin-bottom: 2px;
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
    margin-left: 220px;
    margin-right: 220px; // 右边距与左边距完全相同
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 84px;
      margin-right: 84px; // 右边距与左边距完全相同
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
    max-width: calc(100vw - 400px); // 限制宽度与内容区域一致
    margin: 0 auto; // 居中显示
    border-radius: 0 0 16px 16px; // 添加圆角
  }
}

// 响应式设计 - 使用精确断点，避免重叠
// 超大屏 (1920px+)
@media (min-width: 1920px) {
  .main-content {
    margin-left: 250px;
    margin-right: 250px; // 右边距与左边距完全相同
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 110px;
      margin-right: 110px; // 右边距与左边距完全相同
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
    max-width: calc(100vw - 440px); // 与内容区域宽度一致
    border-radius: 0 0 20px 20px; // 更大的圆角
  }
}

// 大屏桌面 (1440px - 1919px)
@media (min-width: 1440px) and (max-width: 1919px) {
  .main-content {
    margin-left: 235px;
    margin-right: 235px; // 右边距与左边距完全相同
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 95px;
      margin-right: 95px; // 右边距与左边距完全相同
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
    max-width: calc(100vw - 420px); // 与内容区域宽度一致
    border-radius: 0 0 18px 18px; // 适中的圆角
  }
}

// 桌面端 (1200px - 1439px)
@media (min-width: 1200px) and (max-width: 1439px) {
  .main-content {
    margin-left: 220px;
    margin-right: 220px; // 右边距与左边距完全相同
    padding-left: 0px;
    padding-right: 0px; // 移除右边距，保持左右一致
    
    &.sidebar-collapsed {
      margin-left: 84px;
      margin-right: 84px; // 右边距与左边距完全相同
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
    max-width: calc(100vw - 400px); // 与内容区域宽度一致
    border-radius: 0 0 16px 16px; // 标准圆角
  }
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
</style>
