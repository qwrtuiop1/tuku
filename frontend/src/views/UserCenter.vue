<template>
  <div class="user-center-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">个人设置</h1>
          <p class="page-subtitle">管理您的个人信息和系统设置</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="saveAllSettings" :loading="saving">
            <el-icon><Check /></el-icon>
            保存更改
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="user-center-content">
      <el-row :gutter="24">
        <!-- 左侧：用户信息和快捷设置 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
          <!-- 用户信息卡片 -->
          <el-card class="user-info-card">
            <div class="user-avatar-section">
              <div class="avatar-container">
                <el-avatar 
                  :size="100" 
                  :src="userInfo.avatar_url"
                  class="user-avatar"
                  @error="handleAvatarError"
                >
                  {{ userInfo.username?.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="avatar-overlay">
                  <el-upload
                    :action="uploadAction"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :on-success="handleAvatarSuccess"
                    :on-error="handleAvatarError"
                    accept="image/*"
                  >
                    <el-button type="primary" size="small" circle>
                      <el-icon><Camera /></el-icon>
                    </el-button>
                  </el-upload>
                </div>
              </div>
              
              <div class="user-basic-info">
                <h3 class="username">{{ userInfo.username }}</h3>
                <p class="user-role">
                  <el-tag :type="authStore.isAdmin ? 'danger' : 'primary'">
                    {{ authStore.isAdmin ? '管理员' : '普通用户' }}
                  </el-tag>
                </p>
                <p class="user-email">{{ userInfo.email }}</p>
              </div>
            </div>
          </el-card>

          <!-- 存储使用情况 -->
          <el-card class="storage-card">
            <div class="storage-header">
              <h4>存储使用情况</h4>
              <el-button 
                type="text" 
                size="small" 
                @click="refreshStorageInfo"
                :loading="refreshingStorage"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
            
            <div class="storage-progress">
              <el-progress 
                :percentage="storagePercentage" 
                :color="storageColor"
                :stroke-width="8"
              >
                <template #default="{ percentage }">
                  {{ formatPercentage(percentage) }}
                </template>
              </el-progress>
              <div class="storage-info">
                <span class="used">{{ formatFileSize(userInfo.used_storage) }}</span>
                <span class="total">/ {{ formatFileSize(userInfo.storage_limit) }}</span>
              </div>
            </div>

            <div class="storage-details">
              <div class="storage-item">
                <span class="label">图片文件</span>
                <span class="value">{{ formatFileSize(storageDetails.imageSize) }}</span>
              </div>
              <div class="storage-item">
                <span class="label">视频文件</span>
                <span class="value">{{ formatFileSize(storageDetails.videoSize) }}</span>
              </div>
              <div class="storage-item">
                <span class="label">其他文件</span>
                <span class="value">{{ formatFileSize(storageDetails.otherSize) }}</span>
              </div>
            </div>

            <div class="storage-actions">
              <div class="action-button-wrapper">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showStorageCleanup = true"
                  :disabled="storagePercentage < 80"
                >
                  <el-icon><Delete /></el-icon>
                  清理存储
                </el-button>
              </div>
              <div class="action-button-wrapper">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="showStorageDetails = true"
                >
                  详细分析
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 快捷设置 -->
          <el-card class="quick-settings-card">
            <div class="quick-settings-header">
              <h4>快捷设置</h4>
            </div>
            
            <div class="quick-settings">
              <div class="setting-item">
                <span class="setting-label">自动刷新</span>
                <div class="setting-control">
                <el-switch 
                    v-model="quickSettings.autoRefresh" 
                    :disabled="refreshingStorage"
                  />
                  <span class="setting-status" v-if="quickSettings.autoRefresh">
                    {{ refreshIntervalTime / 1000 }}秒
                  </span>
              </div>
              </div>
              
              <div class="setting-item">
                <span class="setting-label">通知提醒</span>
                <div class="setting-control">
                  <el-switch 
                    v-model="quickSettings.notifications"
                    :disabled="!notificationSupported"
                  />
                  <span class="setting-status" v-if="!notificationSupported">
                    不支持
                  </span>
                  <span class="setting-status" v-else-if="notificationPermission === 'denied'">
                    已拒绝
                  </span>
                  <span class="setting-status success" v-else-if="notificationPermission === 'granted'">
                    已开启
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：详细设置 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
          <el-card class="settings-card">
            <el-tabs v-model="activeTab" class="settings-tabs">
              <!-- 个人信息 -->
              <el-tab-pane label="个人信息" name="profile">
                <div class="profile-section">
                  <h4>基本信息</h4>
                <el-form
                  ref="profileFormRef"
                  :model="profileForm"
                  :rules="profileRules"
                  label-width="100px"
                  class="profile-form"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input 
                      v-model="profileForm.username" 
                      placeholder="请输入用户名"
                      :disabled="true"
                    />
                    <div class="form-hint">用户名不可修改</div>
                  </el-form-item>

                  <el-form-item label="邮箱地址" prop="email">
                    <el-input 
                      v-model="profileForm.email" 
                      placeholder="请输入邮箱地址"
                    />
                      <div class="form-hint">用于接收系统通知和找回密码</div>
                  </el-form-item>

                  <el-form-item label="昵称" prop="display_name">
                    <el-input 
                      v-model="profileForm.display_name" 
                      placeholder="请输入昵称"
                    />
                      <div class="form-hint">在其他用户面前显示的名称</div>
                  </el-form-item>

                  <el-form-item label="个人简介" prop="bio">
                    <el-input 
                      v-model="profileForm.bio" 
                      type="textarea"
                      :rows="3"
                      placeholder="介绍一下自己..."
                      maxlength="200"
                      show-word-limit
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button 
                      type="primary" 
                      @click="saveProfile" 
                      :loading="saving"
                    >
                      保存个人信息
                    </el-button>
                  </el-form-item>

                    <el-form-item label="注册时间">
                      <el-input 
                        :value="formatDate(userInfo.created_at)" 
                        disabled
                    />
                  </el-form-item>
                </el-form>
                </div>

                <div class="profile-section">
                  <h4>账户统计</h4>
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <div class="stat-card">
                        <div class="stat-number">{{ userStats.totalFiles }}</div>
                        <div class="stat-label">文件总数</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-card">
                        <div class="stat-number">{{ userStats.totalFolders }}</div>
                        <div class="stat-label">文件夹数</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-card">
                        <div class="stat-number">{{ userStats.loginCount }}</div>
                        <div class="stat-label">登录次数</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-tab-pane>

              <!-- 安全设置 -->
              <el-tab-pane label="安全设置" name="security">
                <div class="security-section">
                  <h4>密码安全</h4>
                  <el-form
                    ref="passwordFormRef"
                    :model="passwordForm"
                    :rules="passwordRules"
                    label-width="100px"
                    class="password-form"
                  >
                    <el-form-item label="新密码" prop="newPassword">
                      <el-input 
                        v-model="passwordForm.newPassword" 
                        type="password"
                        placeholder="请输入新密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item label="确认密码" prop="confirmPassword">
                      <el-input 
                        v-model="passwordForm.confirmPassword" 
                        type="password"
                        placeholder="请再次输入新密码"
                        show-password
                      />
                    </el-form-item>

                    <el-form-item label="邮箱验证码" prop="emailCode">
                      <div class="verification-code-input">
                        <el-input 
                          v-model="passwordForm.emailCode" 
                          placeholder="请输入邮箱验证码"
                          maxlength="6"
                        />
                        <el-button 
                          type="primary" 
                          :disabled="codeCountdown > 0 || !userInfo.email"
                          @click="sendEmailCode"
                          :loading="sendingCode"
                          class="send-code-btn"
                        >
                          {{ codeCountdown > 0 ? `${codeCountdown}秒后重发` : '发送验证码' }}
                        </el-button>
                      </div>
                      <div class="form-hint">
                        验证码将发送到您的邮箱：{{ userInfo.email }}
                      </div>
                    </el-form-item>

                    <el-form-item>
                      <div class="password-actions">
                      <el-button type="primary" @click="changePassword" :loading="changingPassword">
                        修改密码
                      </el-button>
                        <el-button type="text" class="forgot-password" @click="goToForgotPassword">
                          忘记密码？
                        </el-button>
                      </div>
                      <div class="form-hint">
                        如果忘记当前密码，可以通过邮箱验证重置密码
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <!-- 偏好设置 -->
              <el-tab-pane label="偏好设置" name="preferences">
                <div class="preferences-section">
                  <h4>界面设置</h4>
                  <el-form label-width="100px" class="preferences-form">
                    <el-form-item label="默认视图">
                      <el-radio-group v-model="preferences.defaultView">
                        <el-radio label="grid">网格视图</el-radio>
                        <el-radio label="list">列表视图</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item>
                      <el-button 
                        type="primary" 
                        @click="savePreferences" 
                        :loading="saving"
                      >
                        保存界面设置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>

                <div class="preferences-section">
                  <h4>通知设置</h4>
                  <el-form label-width="100px" class="preferences-form">
                    <el-form-item label="邮件通知">
                      <el-switch v-model="preferences.emailNotifications" />
                    </el-form-item>

                    <el-form-item label="存储警告">
                      <el-switch v-model="preferences.storageWarnings" />
                    </el-form-item>

                    <el-form-item label="安全提醒">
                      <el-switch v-model="preferences.securityAlerts" />
                    </el-form-item>

                    <el-form-item>
                      <el-button 
                        type="primary" 
                        @click="saveNotificationSettings" 
                        :loading="saving"
                      >
                        保存通知设置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 存储详情对话框 -->
    <el-dialog
      v-model="showStorageDetails"
      title="存储详细分析"
      width="600px"
    >
      <div class="storage-analysis">
        <div class="analysis-section">
          <h4>文件类型分布</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="type-card">
                <div class="type-icon image">📷</div>
                <div class="type-info">
                  <div class="type-name">图片</div>
                  <div class="type-size">{{ formatFileSize(storageDetails.imageSize) }}</div>
                  <div class="type-count">{{ storageDetails.imageCount }} 个文件</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="type-card">
                <div class="type-icon video">🎥</div>
                <div class="type-info">
                  <div class="type-name">视频</div>
                  <div class="type-size">{{ formatFileSize(storageDetails.videoSize) }}</div>
                  <div class="type-count">{{ storageDetails.videoCount }} 个文件</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="type-card">
                <div class="type-icon other">📄</div>
                <div class="type-info">
                  <div class="type-name">其他</div>
                  <div class="type-size">{{ formatFileSize(storageDetails.otherSize) }}</div>
                  <div class="type-count">{{ storageDetails.otherCount }} 个文件</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="analysis-section">
          <h4>存储建议</h4>
          <div class="storage-suggestions">
            <div v-if="storagePercentage >= 90" class="suggestion warning">
              <el-icon><Warning /></el-icon>
              <span>存储空间严重不足，建议立即清理文件</span>
            </div>
            <div v-else-if="storagePercentage >= 80" class="suggestion caution">
              <el-icon><InfoFilled /></el-icon>
              <span>存储空间使用率较高，建议适当清理</span>
            </div>
            <div v-else class="suggestion good">
              <el-icon><SuccessFilled /></el-icon>
              <span>存储空间使用正常</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 存储清理对话框 -->
    <el-dialog
      v-model="showStorageCleanup"
      title="存储清理"
      width="500px"
    >
      <div class="storage-cleanup">
        <p>选择要清理的内容：</p>
        <el-checkbox-group v-model="cleanupOptions">
          <el-checkbox label="duplicates">重复文件</el-checkbox>
          <el-checkbox label="temp">临时文件</el-checkbox>
          <el-checkbox label="large">大文件（>10MB）</el-checkbox>
          <el-checkbox label="old">30天前的文件</el-checkbox>
        </el-checkbox-group>
        
        <div class="cleanup-preview">
          <p>预计可释放空间：<strong>{{ formatFileSize(estimatedCleanup) }}</strong></p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showStorageCleanup = false">取消</el-button>
        <el-button type="primary" @click="performCleanup" :loading="cleaning">
          开始清理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Check,
  Camera,
  Refresh,
  Delete,
  Warning,
  InfoFilled,
  SuccessFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { formatFileSize, formatPercentage } from '@/utils/helpers'
import api from '@/utils/api'

const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('profile')
const saving = ref(false)
const changingPassword = ref(false)
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 验证码相关
const sendingCode = ref(false)
const codeCountdown = ref(0)
const countdownTimer = ref<NodeJS.Timeout | null>(null)

// 存储相关
const refreshingStorage = ref(false)
const showStorageDetails = ref(false)
const showStorageCleanup = ref(false)
const cleaning = ref(false)
const cleanupOptions = ref<string[]>([])

// 存储详情
const storageDetails = reactive({
  imageSize: 0,
  videoSize: 0,
  otherSize: 0,
  imageCount: 0,
  videoCount: 0,
  otherCount: 0
})

// 用户信息
const userInfo = reactive({
  username: '',
  email: '',
  display_name: '',
  bio: '',
  avatar_url: '',
  used_storage: 0,
  storage_limit: 0,
  created_at: '',
  last_login: ''
})

// 用户统计
const userStats = reactive({
  totalFiles: 0,
  totalFolders: 0,
  loginCount: 0
})

// 表单数据
const profileForm = reactive({
  username: '',
  email: '',
  display_name: '',
  bio: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
  emailCode: ''
})

const preferences = reactive({
  defaultView: 'grid',
  emailNotifications: true,
  storageWarnings: true,
  securityAlerts: true
})

const quickSettings = reactive({
  autoRefresh: true,
  notifications: true
})

// 自动刷新相关
const refreshInterval = ref<NodeJS.Timeout | null>(null)
const refreshIntervalTime = ref(30000) // 30秒

// 通知相关
const notificationPermission = ref<NotificationPermission>('default')
const notificationSupported = ref(false)

// 自动刷新功能
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  if (quickSettings.autoRefresh) {
    refreshInterval.value = setInterval(() => {
      refreshStorageInfo(false) // 自动刷新时不显示成功提示
      loadUserStats()
      // 移除成功提示，只保留错误提示
    }, refreshIntervalTime.value)
  }
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 通知功能
const checkNotificationSupport = () => {
  notificationSupported.value = 'Notification' in window
  if (notificationSupported.value) {
    notificationPermission.value = Notification.permission
  }
}

const requestNotificationPermission = async () => {
  if (!notificationSupported.value) {
    ElMessage.warning('您的浏览器不支持通知功能')
    return false
  }
  
  if (Notification.permission === 'granted') {
    notificationPermission.value = 'granted'
    return true
  }
  
  if (Notification.permission === 'denied') {
    notificationPermission.value = 'denied'
    ElMessage.error('通知权限已被拒绝，请在浏览器设置中手动开启')
    return false
  }
  
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    
    if (permission === 'granted') {
      ElMessage.success('通知权限已开启')
      return true
    } else {
      ElMessage.warning('通知权限被拒绝')
      return false
    }
  } catch (error) {
    ElMessage.error('请求通知权限失败')
    notificationPermission.value = 'denied'
    return false
  }
}

const showNotification = (title: string, options?: NotificationOptions) => {
  if (!notificationSupported.value || Notification.permission !== 'granted') {
    return
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
    
    // 5秒后自动关闭
    setTimeout(() => {
      notification.close()
    }, 5000)
    
    return notification
  } catch (error) {
    console.error('显示通知失败:', error)
  }
}

// 加载保存的设置
const loadQuickSettings = () => {
  try {
    const saved = localStorage.getItem('quickSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      quickSettings.autoRefresh = settings.autoRefresh ?? true
      quickSettings.notifications = settings.notifications ?? true
    }
  } catch (error) {
    console.error('加载快捷设置失败:', error)
  }
}

// 加载用户偏好设置
const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      const userPrefs = JSON.parse(saved)
      preferences.defaultView = userPrefs.defaultView ?? 'grid'
    }
  } catch (error) {
    console.error('加载用户偏好设置失败:', error)
  }
}

// 从服务器加载用户设置
const loadUserSettingsFromServer = async () => {
  try {
    // 加载个人信息
    const profileResponse = await api.get('/auth/profile')
    if (profileResponse.data.success) {
      const profileData = profileResponse.data.data
      
      // 更新profileForm（用于表单）
      profileForm.email = profileData.email || ''
      profileForm.display_name = profileData.display_name || ''
      profileForm.bio = profileData.bio || ''
      
      // 同时更新userInfo（用于显示）
      userInfo.email = profileData.email || ''
      userInfo.display_name = profileData.display_name || ''
      userInfo.bio = profileData.bio || ''
      userInfo.username = profileData.username || ''
      userInfo.created_at = profileData.created_at || ''
    }
    
    // 加载界面设置
    const preferencesResponse = await api.get('/auth/preferences')
    if (preferencesResponse.data.success) {
      const prefsData = preferencesResponse.data.data
      preferences.defaultView = prefsData.defaultView || 'grid'
    }
    
    // 加载通知设置
    const notificationResponse = await api.get('/auth/notification-settings')
    if (notificationResponse.data.success) {
      const notifData = notificationResponse.data.data
      preferences.emailNotifications = notifData.emailNotifications ?? true
      preferences.storageWarnings = notifData.storageWarnings ?? true
      preferences.securityAlerts = notifData.securityAlerts ?? true
    }
    
    console.log('用户设置已从服务器同步')
  } catch (error: any) {
    console.error('从服务器加载用户设置失败:', error)
    
    // 如果服务器加载失败，使用本地存储的默认值
    if (error.response?.status === 401) {
      ElMessage.warning('登录已过期，使用本地设置')
    } else {
      ElMessage.warning('无法连接到服务器，使用本地设置')
    }
  }
}

// 加载通知设置
const loadNotificationSettings = () => {
  try {
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      const notifSettings = JSON.parse(saved)
      preferences.emailNotifications = notifSettings.emailNotifications ?? true
      preferences.storageWarnings = notifSettings.storageWarnings ?? true
      preferences.securityAlerts = notifSettings.securityAlerts ?? true
    }
  } catch (error) {
    console.error('加载通知设置失败:', error)
  }
}

// 初始化通知功能
// 监听通知权限变化
const handlePermissionChange = () => {
  if (notificationSupported.value) {
    notificationPermission.value = Notification.permission
    // 如果权限被拒绝，自动关闭开关
    if (Notification.permission === 'denied') {
      quickSettings.notifications = false
      localStorage.setItem('quickSettings', JSON.stringify(quickSettings))
    }
  }
}

const initNotifications = async () => {
  checkNotificationSupport()
  
  // 监听权限变化
  if (notificationSupported.value) {
    // 监听权限变化事件（如果浏览器支持）
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then((result) => {
        result.addEventListener('change', handlePermissionChange)
      }).catch(() => {
        // 如果查询失败，使用轮询方式检查权限变化
        setInterval(() => {
          if (Notification.permission !== notificationPermission.value) {
            handlePermissionChange()
          }
        }, 1000)
      })
    } else {
      // 如果不支持permissions API，使用轮询方式
      setInterval(() => {
        if (Notification.permission !== notificationPermission.value) {
          handlePermissionChange()
        }
      }, 1000)
    }
  }
  
  if (quickSettings.notifications && notificationSupported.value) {
    await requestNotificationPermission()
  }
}

// 添加存储警告通知
const checkStorageWarning = () => {
  if (quickSettings.notifications && storagePercentage.value >= 80) {
    showNotification('存储空间警告', {
      body: `您的存储空间已使用 ${storagePercentage.value}%，建议及时清理`,
      tag: 'storage-warning'
    })
  }
}

// 监听设置变化
watch(() => quickSettings.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
  
  // 保存到本地存储
  localStorage.setItem('quickSettings', JSON.stringify(quickSettings))
})

watch(() => quickSettings.notifications, async (newValue) => {
  if (newValue) {
    const granted = await requestNotificationPermission()
    if (!granted) {
      quickSettings.notifications = false
    }
  }
  
  // 保存到本地存储
  localStorage.setItem('quickSettings', JSON.stringify(quickSettings))
})

// 存储使用百分比
const storagePercentage = computed(() => {
  if (!userInfo.storage_limit || userInfo.storage_limit === 0) return 0
  if (!userInfo.used_storage || userInfo.used_storage === 0) return 0
  
  const percentage = Math.round((userInfo.used_storage / userInfo.storage_limit) * 100)
  console.log('存储计算:', {
    used_storage: userInfo.used_storage,
    storage_limit: userInfo.storage_limit,
    percentage: percentage
  })
  
  return percentage
})

const storageColor = computed(() => {
  const percentage = storagePercentage.value
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
})

const uploadAction = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
  return `${baseUrl}/api/avatars/upload`
})
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

// 表单验证规则
const profileRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  display_name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: '昵称只能包含中文、字母、数字、下划线和空格', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码只能包含数字', trigger: 'blur' }
  ]
}

// 方法
const loadUserInfo = async () => {
  try {
    const response = await api.get('/auth/me')
    const userData = response.data.user
    
    // 调试：打印用户数据
    console.log('用户数据:', userData)
    console.log('created_at:', userData.created_at)
    console.log('avatar_url原始:', userData.avatar_url)
    console.log('used_storage:', userData.used_storage)
    console.log('storage_limit:', userData.storage_limit)
    
    // 后端已经返回完整URL，直接使用
    let avatarUrl = userData.avatar_url || ''
    console.log('avatar_url处理后:', avatarUrl)
    
    Object.assign(userInfo, {
      username: userData.username,
      email: userData.email,
      display_name: userData.display_name || userData.username,
      bio: userData.bio || '',
      avatar_url: avatarUrl,
      used_storage: userData.used_storage || 0,
      storage_limit: userData.storage_limit || 0,
      created_at: userData.created_at || new Date().toISOString(),
      last_login: userData.last_login || ''
    })
    
    Object.assign(profileForm, {
      username: userData.username,
      email: userData.email,
      display_name: userData.display_name || userData.username,
      bio: userData.bio || ''
    })
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

const loadUserStats = async () => {
  try {
    const response = await api.get('/auth/stats')
    const stats = response.data.data // 后端返回的是 { success: true, data: {...} }
    
    Object.assign(userStats, {
      totalFiles: stats.totalFiles || 0,
      totalFolders: stats.totalFolders || 0,
      loginCount: stats.loginCount || 0
    })
  } catch (error) {
    console.error('加载用户统计失败:', error)
    // 不显示错误消息，因为这是可选功能
  }
}

const refreshStorageInfo = async (showSuccessMessage = true) => {
  try {
    refreshingStorage.value = true
    await loadUserInfo()
    await loadStorageDetails()
    if (showSuccessMessage) {
      ElMessage.success('存储信息已刷新')
    }
  } catch (error) {
    console.error('刷新存储信息失败:', error)
    ElMessage.error('刷新存储信息失败')
  } finally {
    refreshingStorage.value = false
  }
}

const loadStorageDetails = async () => {
  try {
    const response = await api.get('/files/storage-details')
    const details = response.data.data // 后端返回的是 { success: true, data: {...} }
    
    Object.assign(storageDetails, {
      imageSize: details.imageSize || 0,
      videoSize: details.videoSize || 0,
      otherSize: details.otherSize || 0,
      imageCount: details.imageCount || 0,
      videoCount: details.videoCount || 0,
      otherCount: details.otherCount || 0
    })
  } catch (error) {
    console.error('加载存储详情失败:', error)
    // 不显示错误消息，因为这是可选功能
  }
}

const performCleanup = async () => {
  if (cleanupOptions.value.length === 0) {
    ElMessage.warning('请选择要清理的内容')
    return
  }
  
  try {
    cleaning.value = true
    
    await api.post('/files/cleanup', {
      options: cleanupOptions.value
    })
    
    ElMessage.success('存储清理完成')
    showStorageCleanup.value = false
    cleanupOptions.value = []
    
    // 刷新存储信息
    await refreshStorageInfo()
  } catch (error) {
    console.error('存储清理失败:', error)
    ElMessage.error('存储清理失败')
  } finally {
    cleaning.value = false
  }
}

const estimatedCleanup = computed(() => {
  // 简单的估算逻辑
  let estimated = 0
  if (cleanupOptions.value && cleanupOptions.value.includes('duplicates')) estimated += (storageDetails.imageSize || 0) * 0.1
  if (cleanupOptions.value && cleanupOptions.value.includes('temp')) estimated += 50 * 1024 * 1024 // 50MB
  if (cleanupOptions.value && cleanupOptions.value.includes('large')) estimated += (storageDetails.videoSize || 0) * 0.2
  if (cleanupOptions.value && cleanupOptions.value.includes('old')) estimated += (storageDetails.otherSize || 0) * 0.3
  return estimated
})

// 保存个人信息
const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  // 验证设置数据
  if (!validateSettings('profile')) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    const updateData = {
      email: profileForm.email,
      display_name: profileForm.display_name,
      bio: profileForm.bio
    }
    
    // 调用API保存个人信息
    const response = await api.put('/auth/profile', updateData)
    
    if (response.data.success) {
      ElMessage.success('个人信息保存成功')
    
    // 更新本地用户信息
    authStore.updateUser(updateData)
      
      // 更新本地存储
      localStorage.setItem('userProfile', JSON.stringify(updateData))
      
      // 重新加载用户信息以确保数据同步
      await loadUserInfo()
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存个人信息失败:', error)
    
    if (error.response?.status === 400) {
      ElMessage.error(error.response.data.message || '数据验证失败')
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 可以在这里触发重新登录逻辑
    } else if (error.response?.status === 409) {
      ElMessage.error('邮箱已被其他用户使用')
    } else {
      ElMessage.error('保存个人信息失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

// 保存偏好设置
const savePreferences = async () => {
  // 验证设置数据
  if (!validateSettings('preferences')) return
  
  try {
    saving.value = true
    
    const updateData = {
      defaultView: preferences.defaultView
    }
    
    // 调用API保存界面设置
    const response = await api.put('/auth/preferences', updateData)
    
    if (response.data.success) {
      ElMessage.success('界面设置保存成功')
      
      // 保存到本地存储
      localStorage.setItem('userPreferences', JSON.stringify(updateData))
      
      // 更新全局状态（如果有的话）
      if (window.userPreferences) {
        window.userPreferences.defaultView = preferences.defaultView
      }
      
      // 触发视图更新事件
      window.dispatchEvent(new CustomEvent('preferencesUpdated', {
        detail: { defaultView: preferences.defaultView }
      }))
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存界面设置失败:', error)
    
    if (error.response?.status === 400) {
      ElMessage.error('设置数据无效')
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error('保存界面设置失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  // 验证设置数据
  if (!validateSettings('notifications')) return
  
  try {
    saving.value = true
    
    const updateData = {
      emailNotifications: preferences.emailNotifications,
      storageWarnings: preferences.storageWarnings,
      securityAlerts: preferences.securityAlerts
    }
    
    // 调用API保存通知设置
    const response = await api.put('/auth/notification-settings', updateData)
    
    if (response.data.success) {
      ElMessage.success('通知设置保存成功')
      
      // 保存到本地存储
      localStorage.setItem('notificationSettings', JSON.stringify(updateData))
      
      // 更新全局状态
      if (window.notificationSettings) {
        Object.assign(window.notificationSettings, updateData)
      }
      
      // 触发通知设置更新事件
      window.dispatchEvent(new CustomEvent('notificationSettingsUpdated', {
        detail: updateData
      }))
      
      // 如果启用了存储警告，立即检查一次
      if (preferences.storageWarnings) {
        checkStorageWarning()
      }
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存通知设置失败:', error)
    
    if (error.response?.status === 400) {
      ElMessage.error('通知设置数据无效')
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error('保存通知设置失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!userInfo.email) {
    ElMessage.error('请先设置邮箱地址')
    return
  }
  
  try {
    sendingCode.value = true
    
    await api.post('/auth/send-verification-code', {
      email: userInfo.email,
      type: 'password_change'
    })
    
    ElMessage.success('验证码已发送到您的邮箱')
    
    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  codeCountdown.value = 60
  
  countdownTimer.value = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer.value!)
      countdownTimer.value = null
    }
  }, 1000)
}

// 清理倒计时
const clearCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  codeCountdown.value = 0
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    await api.put('/auth/password', {
      new_password: passwordForm.newPassword,
      email_code: passwordForm.emailCode
    })
    
    ElMessage.success('密码修改成功')
    
    // 清空表单
    Object.assign(passwordForm, {
      newPassword: '',
      confirmPassword: '',
      emailCode: ''
    })
    passwordFormRef.value.resetFields()
    
    // 清理倒计时
    clearCountdown()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

// 头像上传
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response: any) => {
  // 后端返回的格式是 { success: true, message: '...', data: { url: '...' } }
  if (response && response.success && response.data && response.data.url) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'
    const avatarUrl = baseUrl + response.data.url + '?t=' + Date.now()
    
    userInfo.avatar_url = avatarUrl
    authStore.updateUser({ avatar_url: avatarUrl })
    ElMessage.success(response.message || '头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 头像加载错误处理
const handleAvatarError = (event: Event) => {
  console.error('头像加载失败:', event)
  console.log('头像URL:', userInfo.avatar_url)
  ElMessage.warning('头像加载失败，将显示默认头像')
}

// 格式化日期（默认北京时间）
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '暂无数据'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '无效日期'
    
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai', // 默认北京时间
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return '日期格式错误'
  }
}

// 保存所有设置
const saveAllSettings = async () => {
  try {
    saving.value = true
    
    // 保存个人信息
    if (profileFormRef.value) {
      await saveProfile()
    }
    
    // 保存界面设置
    await savePreferences()
    
    // 保存通知设置
    await saveNotificationSettings()
    
    ElMessage.success('所有设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 验证设置数据
const validateSettings = (type: 'profile' | 'preferences' | 'notifications') => {
  switch (type) {
    case 'profile':
      if (!profileForm.email || !profileForm.email.includes('@')) {
        ElMessage.error('请输入有效的邮箱地址')
        return false
      }
      if (profileForm.display_name && profileForm.display_name.length > 50) {
        ElMessage.error('昵称不能超过50个字符')
        return false
      }
      if (profileForm.bio && profileForm.bio.length > 200) {
        ElMessage.error('个人简介不能超过200个字符')
        return false
      }
      return true
      
    case 'preferences':
      if (!['grid', 'list'].includes(preferences.defaultView)) {
        ElMessage.error('默认视图设置无效')
        return false
      }
      return true
      
    case 'notifications':
      if (typeof preferences.emailNotifications !== 'boolean' ||
          typeof preferences.storageWarnings !== 'boolean' ||
          typeof preferences.securityAlerts !== 'boolean') {
        ElMessage.error('通知设置数据无效')
        return false
      }
      return true
      
    default:
      return false
  }
}

// 跳转到忘记密码页面
const goToForgotPassword = () => {
  ElMessageBox.confirm(
    '您将跳转到忘记密码页面，通过邮箱验证来重置密码。是否继续？',
    '确认跳转',
    {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'info',
      customClass: 'custom-message-box'
    }
  ).then(() => {
    router.push('/forgot-password')
  }).catch(() => {
    // 用户取消，不执行任何操作
  })
}

// 生命周期
onMounted(async () => {
  console.log('UserCenter组件开始加载...')
  
  try {
    // 先加载用户基本信息（头像、存储等）
    console.log('1. 加载用户基本信息...')
    await loadUserInfo()
    
    // 然后加载用户设置（个人资料、偏好等）
    console.log('2. 加载用户设置...')
    await loadUserSettingsFromServer()
    
    // 加载本地设置作为备用
    console.log('3. 加载本地设置...')
    loadQuickSettings()
    loadUserPreferences()
    loadNotificationSettings()
    
    // 初始化通知功能
    console.log('4. 初始化通知功能...')
    await initNotifications()
    
    // 加载其他数据
    console.log('5. 加载用户统计...')
    await loadUserStats()
    console.log('6. 加载存储详情...')
    await loadStorageDetails()
    
    // 启动自动刷新（如果启用）
    if (quickSettings.autoRefresh) {
      console.log('7. 启动自动刷新...')
      startAutoRefresh()
    }
    
    // 检查存储警告
    console.log('8. 检查存储警告...')
    checkStorageWarning()
    
    console.log('UserCenter组件加载完成!')
  } catch (error) {
    console.error('UserCenter组件加载失败:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  }
})

onUnmounted(() => {
  // 清理自动刷新定时器
  stopAutoRefresh()
  
  // 清理验证码倒计时
  clearCountdown()
})
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.user-center-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .page-subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

.user-center-content {
  .user-info-card {
    margin-bottom: 24px;
    
    .user-avatar-section {
      text-align: center;
      
      .avatar-container {
        position: relative;
        display: inline-block;
        margin-bottom: 20px;
        
        .user-avatar {
          border: 4px solid #e4e7ed;
          transition: all 0.3s ease;
        }
        
        .avatar-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          .el-button {
            background: rgba(0, 0, 0, 0.7);
            border: none;
            color: white;
            
            &:hover {
              background: rgba(0, 0, 0, 0.8);
            }
          }
        }
        
        &:hover .avatar-overlay {
          opacity: 1;
        }
      }
      
      .user-basic-info {
        .username {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        .user-role {
          margin: 0 0 8px 0;
        }
        
        .user-email {
          font-size: 14px;
          color: #606266;
          margin: 0;
        }
      }
    }
  }
  
  .storage-card {
    margin-bottom: 24px;
    
    .storage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }
    }
    
    .storage-progress {
      margin-bottom: 16px;
      
      .storage-info {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 14px;
        
        .used {
          color: #303133;
          font-weight: 600;
        }
        
        .total {
          color: #909399;
        }
      }
    }

    .storage-details {
      margin-bottom: 16px;
      
      .storage-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .label {
          font-size: 14px;
          color: #606266;
        }
        
        .value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }

    .storage-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      justify-content: center;
      
      .action-button-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        
        .el-button {
          width: 100%;
          min-height: 36px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          
          .el-icon {
            margin-right: 6px;
            flex-shrink: 0;
            width: 16px;
            height: 16px;
          }
          
          span {
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          &.el-button--primary {
            order: 1;
            background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
            border: none;
            color: #ffffff;
            
            &:not(.is-disabled):hover {
              background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%);
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
            
            &.is-disabled {
              background: #c0c4cc;
              color: #ffffff;
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
          }
          
          &.el-button--text {
            order: 2;
            color: #409eff;
            border: 1px solid #409eff;
            background: transparent;
            
            &:hover {
              background: #409eff;
              color: #ffffff;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }
    }
  }
  
  .quick-settings-card {
    .quick-settings-header {
      margin-bottom: 16px;
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }
    }
    
    .quick-settings {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }
        
        .setting-label {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
        
        .setting-control {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .setting-status {
            font-size: 11px;
            color: #909399;
            padding: 2px 6px;
            border-radius: 4px;
            background: #f5f7fa;
            
            &.success {
              color: #67c23a;
              background: #f0f9ff;
            }
          }
        }
      }
    }
  }
  
  .settings-card {
    .settings-tabs {
      :deep(.el-tabs__content) {
        padding: 24px 0;
      }
    }
    
    .profile-form,
    .password-form,
    .preferences-form {
      max-width: 500px;
      
      .form-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
    
    .security-section,
    .preferences-section,
    .profile-section {
      margin-bottom: 32px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
      }
      
      .password-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .el-button {
          height: 40px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &.el-button--primary {
            background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
            border: none;
            
            &:hover {
              background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
            }
          }
        }
        
        .forgot-password {
          color: #667eea;
          font-size: 14px;
          padding: 0;
          
          &:hover {
            color: #764ba2;
          }
        }
      }
      
      .verification-code-input {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .el-input {
          flex: 1;
        }
        
        .send-code-btn {
          flex-shrink: 0;
          min-width: 120px;
          height: 40px;
          font-size: 13px;
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .stat-card {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

// 对话框样式
.storage-analysis {
  .analysis-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }
  }

  .type-card {
    text-align: center;
    padding: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafafa;
    
    .type-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .type-info {
      .type-name {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .type-size {
        font-size: 16px;
        font-weight: 600;
        color: #409eff;
        margin-bottom: 4px;
      }
      
      .type-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .storage-suggestions {
    .suggestion {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.warning {
        background: #fef0f0;
        border: 1px solid #fbc4c4;
        color: #f56c6c;
      }
      
      &.caution {
        background: #fdf6ec;
        border: 1px solid #f5dab1;
        color: #e6a23c;
      }
      
      &.good {
        background: #f0f9ff;
        border: 1px solid #b3d8ff;
        color: #67c23a;
      }
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

.storage-cleanup {
  .cleanup-preview {
    margin-top: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    
    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
      
      strong {
        color: #409eff;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-center-page {
    padding: 12px;
  }
  
  .page-header {
    margin-bottom: 16px;
    
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .header-left {
        .page-title {
          font-size: 24px;
        }
        
        .page-subtitle {
          font-size: 13px;
        }
      }
      
      .header-actions {
        width: 100%;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }

  .user-center-content {
    .el-row {
      margin: 0 !important;
      
      .el-col {
        padding: 0 !important;
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    // 用户信息卡片移动端优化
    .user-info-card {
      margin-bottom: 16px;
      
      .user-avatar-section {
        .avatar-container {
          margin-bottom: 16px;
          
          .user-avatar {
            width: 80px !important;
            height: 80px !important;
            font-size: 32px;
          }
          
          .avatar-overlay {
            .el-button {
              width: 28px;
              height: 28px;
            }
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 16px;
            margin-bottom: 6px;
          }
          
          .user-role {
            margin-bottom: 6px;
            
            .el-tag {
              font-size: 12px;
              padding: 2px 8px;
            }
          }
          
          .user-email {
            font-size: 13px;
            word-break: break-all;
          }
        }
      }
    }

    // 存储卡片移动端优化
    .storage-card {
      margin-bottom: 16px;
      
      .storage-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        
        h4 {
          font-size: 15px;
        }
        
        .el-button {
          align-self: flex-end;
          font-size: 12px;
          padding: 4px 8px;
        }
      }
      
      .storage-progress {
        margin-bottom: 12px;
        
        .el-progress {
          :deep(.el-progress__text) {
            font-size: 12px;
          }
        }
        
        .storage-info {
          font-size: 13px;
          margin-top: 6px;
        }
      }

      .storage-details {
        margin-bottom: 12px;
        
        .storage-item {
          padding: 6px 0;
          
          .label {
            font-size: 13px;
          }
          
          .value {
            font-size: 13px;
          }
        }
      }

      .storage-actions {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
        
        .el-button {
          width: 100%;
          font-size: 13px;
          min-height: 36px;
          padding: 8px 16px;
          border-radius: 6px;
          
          &.el-button--primary {
            order: 1;
            background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
            border: none;
            
            &:not(.is-disabled):hover {
              background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%);
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
            
            &.is-disabled {
              background: #c0c4cc;
              color: #ffffff;
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
          }
          
          &.el-button--text {
            order: 2;
            color: #409eff;
            border: 1px solid #409eff;
            background: transparent;
            
            &:hover {
              background: #409eff;
              color: #ffffff;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }
    }

    // 快捷设置卡片移动端优化
    .quick-settings-card {
      .quick-settings-header {
        margin-bottom: 12px;
        
        h4 {
          font-size: 15px;
        }
      }
      
      .quick-settings {
        .setting-item {
          margin-bottom: 10px;
          
          .setting-label {
            font-size: 13px;
          }
          
          .el-switch {
            :deep(.el-switch__core) {
              width: 40px;
              height: 20px;
            }
          }
        }
      }
    }

    // 设置卡片移动端优化
    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__content) {
          padding: 16px 0;
        }
        
        :deep(.el-tabs__nav-wrap) {
          padding: 0 12px;
        }
        
        :deep(.el-tabs__item) {
          font-size: 14px;
          padding: 0 12px;
        }
      }
      
      .profile-form,
      .password-form,
      .preferences-form {
        max-width: 100%;
        
        :deep(.el-form-item__label) {
          font-size: 13px;
          width: 80px !important;
        }
        
        :deep(.el-input__inner) {
          font-size: 14px;
        }
        
        :deep(.el-textarea__inner) {
          font-size: 14px;
        }
        
        .form-hint {
          font-size: 11px;
          margin-top: 2px;
        }
      }
      
      .profile-section,
      .security-section,
      .preferences-section {
        margin-bottom: 24px;
        
        h4 {
          font-size: 15px;
          margin-bottom: 12px;
        }
        
        .password-actions {
          gap: 12px;
          
          .el-button {
            height: 36px;
            font-size: 13px;
          }
          
          .forgot-password {
            font-size: 13px;
          }
        }
        
        .verification-code-input {
          gap: 10px;
          
          .send-code-btn {
            min-width: 110px;
            height: 36px;
            font-size: 12px;
          }
        }
      }

      // 统计卡片移动端优化
      .stat-card {
        padding: 16px 12px;
        
        .stat-number {
          font-size: 20px;
          margin-bottom: 6px;
        }
        
        .stat-label {
          font-size: 12px;
        }
      }
    }
  }

  // 对话框移动端优化
  :deep(.el-dialog) {
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 100vh !important;
    border-radius: 0 !important;
    
    .el-dialog__header {
      padding: 16px 20px 0 20px;
      
      .el-dialog__title {
        font-size: 16px;
      }
    }
    
    .el-dialog__body {
      padding: 16px 20px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
    }
    
    .el-dialog__footer {
      padding: 0 20px 16px 20px;
    }
  }

  // 存储分析对话框移动端优化
  .storage-analysis {
    .analysis-section {
      margin-bottom: 20px;
      
      h4 {
        font-size: 15px;
        margin-bottom: 12px;
      }
    }

    .type-card {
      padding: 12px;
      margin-bottom: 8px;
      
      .type-icon {
        font-size: 24px;
        margin-bottom: 6px;
      }
      
      .type-info {
        .type-name {
          font-size: 13px;
          margin-bottom: 3px;
        }
        
        .type-size {
          font-size: 14px;
          margin-bottom: 3px;
        }
        
        .type-count {
          font-size: 11px;
        }
      }
    }

    .storage-suggestions {
      .suggestion {
        padding: 10px;
        margin-bottom: 6px;
        
        span {
          font-size: 13px;
        }
        
        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }

  // 存储清理对话框移动端优化
  .storage-cleanup {
    .cleanup-preview {
      margin-top: 12px;
      padding: 10px;
      
      p {
        font-size: 13px;
      }
    }
    
    :deep(.el-checkbox-group) {
      .el-checkbox {
        margin-bottom: 8px;
        
        .el-checkbox__label {
          font-size: 13px;
        }
      }
    }
  }
}

// 平板端响应式设计
@media (min-width: 769px) and (max-width: 1024px) {
  .user-center-page {
    padding: 20px;
  }
  
  .page-header {
    margin-bottom: 20px;
    
    .header-content {
      .header-left {
        .page-title {
          font-size: 26px;
        }
        
        .page-subtitle {
          font-size: 14px;
        }
      }
    }
  }

  .user-center-content {
    .el-row {
      .el-col {
        margin-bottom: 20px;
      }
    }

    // 用户信息卡片平板端优化
    .user-info-card {
      margin-bottom: 20px;
      
      .user-avatar-section {
        .avatar-container {
          margin-bottom: 18px;
          
          .user-avatar {
            width: 90px !important;
            height: 90px !important;
            font-size: 36px;
          }
          
          .avatar-overlay {
            .el-button {
              width: 30px;
              height: 30px;
            }
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 17px;
            margin-bottom: 7px;
          }
          
          .user-role {
            margin-bottom: 7px;
            
            .el-tag {
              font-size: 13px;
              padding: 3px 10px;
            }
          }
          
          .user-email {
            font-size: 14px;
          }
        }
      }
    }

    // 存储卡片平板端优化
    .storage-card {
      margin-bottom: 20px;
      
      .storage-header {
        margin-bottom: 16px;
        
        h4 {
          font-size: 16px;
        }
        
        .el-button {
          font-size: 13px;
          padding: 6px 12px;
        }
      }
      
      .storage-progress {
        margin-bottom: 14px;
        
        .el-progress {
          :deep(.el-progress__text) {
            font-size: 13px;
          }
        }
        
        .storage-info {
          font-size: 14px;
          margin-top: 7px;
        }
      }

      .storage-details {
        margin-bottom: 14px;
        
        .storage-item {
          padding: 7px 0;
          
          .label {
            font-size: 14px;
          }
          
          .value {
            font-size: 14px;
          }
        }
      }

      .storage-actions {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
        justify-content: center;
        
        .action-button-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          
          .el-button {
            width: 100%;
            font-size: 13px;
            padding: 8px 16px;
            min-height: 32px;
            border-radius: 6px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            
            .el-icon {
              margin-right: 6px;
              flex-shrink: 0;
              width: 16px;
              height: 16px;
            }
            
            span {
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            &.el-button--primary {
              order: 1;
              background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
              border: none;
              color: #ffffff;
              
              &:not(.is-disabled):hover {
                background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              }
              
              &.is-disabled {
                background: #c0c4cc;
                color: #ffffff;
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }
            }
            
            &.el-button--text {
              order: 2;
              color: #409eff;
              border: 1px solid #409eff;
              background: transparent;
              
              &:hover {
                background: #409eff;
                color: #ffffff;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              }
            }
          }
        }
      }
    }

    // 快捷设置卡片平板端优化
    .quick-settings-card {
      .quick-settings-header {
        margin-bottom: 14px;
        
        h4 {
          font-size: 16px;
        }
      }
      
      .quick-settings {
        .setting-item {
          margin-bottom: 11px;
          
          .setting-label {
            font-size: 14px;
          }
          
          .el-switch {
            :deep(.el-switch__core) {
              width: 44px;
              height: 22px;
            }
          }
        }
      }
    }

    // 设置卡片平板端优化
    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__content) {
          padding: 20px 0;
        }
        
        :deep(.el-tabs__item) {
          font-size: 15px;
          padding: 0 16px;
        }
      }
      
      .profile-form,
      .password-form,
      .preferences-form {
        max-width: 100%;
        
        :deep(.el-form-item__label) {
          font-size: 14px;
          width: 90px !important;
        }
        
        :deep(.el-input__inner) {
          font-size: 14px;
        }
        
        :deep(.el-textarea__inner) {
          font-size: 14px;
        }
        
        .form-hint {
          font-size: 12px;
          margin-top: 3px;
        }
      }
      
      .profile-section,
      .security-section,
      .preferences-section {
        margin-bottom: 28px;
        
        h4 {
          font-size: 16px;
          margin-bottom: 14px;
        }
        
        .password-actions {
          gap: 18px;
          
          .el-button {
            height: 42px;
            font-size: 15px;
          }
          
          .forgot-password {
            font-size: 15px;
          }
        }
        
        .verification-code-input {
          gap: 14px;
          
          .send-code-btn {
            min-width: 130px;
            height: 42px;
            font-size: 14px;
          }
        }
      }

      // 统计卡片平板端优化
      .stat-card {
        padding: 18px 14px;
        
        .stat-number {
          font-size: 22px;
          margin-bottom: 7px;
        }
        
        .stat-label {
          font-size: 13px;
        }
      }
    }
  }

  // 对话框平板端优化
  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 600px !important;
    
    .el-dialog__header {
      padding: 20px 24px 0 24px;
      
      .el-dialog__title {
        font-size: 17px;
      }
    }
    
    .el-dialog__body {
      padding: 20px 24px;
    }
    
    .el-dialog__footer {
      padding: 0 24px 20px 24px;
    }
  }

  // 存储分析对话框平板端优化
  .storage-analysis {
    .analysis-section {
      margin-bottom: 22px;
      
      h4 {
        font-size: 16px;
        margin-bottom: 14px;
      }
    }

    .type-card {
      padding: 14px;
      
      .type-icon {
        font-size: 28px;
        margin-bottom: 7px;
      }
      
      .type-info {
        .type-name {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .type-size {
          font-size: 15px;
          margin-bottom: 4px;
        }
        
        .type-count {
          font-size: 12px;
        }
      }
    }

    .storage-suggestions {
      .suggestion {
        padding: 11px;
        margin-bottom: 7px;
        
        span {
          font-size: 14px;
        }
        
        .el-icon {
          margin-right: 7px;
        }
      }
    }
  }

  // 存储清理对话框平板端优化
  .storage-cleanup {
    .cleanup-preview {
      margin-top: 14px;
      padding: 11px;
      
      p {
        font-size: 14px;
      }
    }
    
    :deep(.el-checkbox-group) {
      .el-checkbox {
        margin-bottom: 10px;
        
        .el-checkbox__label {
          font-size: 14px;
        }
      }
    }
  }
}

// 桌面端响应式设计
@media (min-width: 1025px) {
  .user-center-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 24px;
    
    .header-content {
      .header-left {
        .page-title {
          font-size: 28px;
        }
        
        .page-subtitle {
          font-size: 14px;
        }
      }
      
      .header-actions {
        .el-button {
          padding: 10px 20px;
          font-size: 14px;
        }
      }
    }
  }

  .user-center-content {
    .el-row {
      .el-col {
        margin-bottom: 24px;
      }
    }

    // 用户信息卡片桌面端优化
    .user-info-card {
      margin-bottom: 24px;
      
      .user-avatar-section {
        .avatar-container {
          margin-bottom: 20px;
          
          .user-avatar {
            width: 100px !important;
            height: 100px !important;
            font-size: 40px;
            transition: all 0.3s ease;
            
            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          }
          
          .avatar-overlay {
            .el-button {
              width: 32px;
              height: 32px;
              transition: all 0.3s ease;
              
              &:hover {
                transform: scale(1.1);
              }
            }
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 18px;
            margin-bottom: 8px;
            transition: color 0.3s ease;
            
            &:hover {
              color: #409eff;
            }
          }
          
          .user-role {
            margin-bottom: 8px;
            
            .el-tag {
              font-size: 13px;
              padding: 4px 12px;
              transition: all 0.3s ease;
              
              &:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
            }
          }
          
          .user-email {
            font-size: 14px;
            transition: color 0.3s ease;
            
            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }

    // 存储卡片桌面端优化
    .storage-card {
      margin-bottom: 24px;
      
      .storage-header {
        margin-bottom: 16px;
        
        h4 {
          font-size: 16px;
        }
        
        .el-button {
          font-size: 13px;
          padding: 6px 12px;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }
      }
      
      .storage-progress {
        margin-bottom: 16px;
        
        .el-progress {
          :deep(.el-progress__text) {
            font-size: 13px;
            font-weight: 600;
          }
          
          :deep(.el-progress-bar__outer) {
            transition: all 0.3s ease;
          }
          
          :deep(.el-progress-bar__inner) {
            transition: all 0.3s ease;
          }
        }
        
        .storage-info {
          font-size: 14px;
          margin-top: 8px;
          
          .used {
            transition: color 0.3s ease;
          }
        }
      }

      .storage-details {
        margin-bottom: 16px;
        
        .storage-item {
          padding: 8px 0;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f8f9fa;
            border-radius: 4px;
            padding-left: 8px;
            padding-right: 8px;
          }
          
          .label {
            font-size: 14px;
          }
          
          .value {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }

      .storage-actions {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        justify-content: center;
        
        .action-button-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          
          .el-button {
            width: 100%;
            font-size: 13px;
            padding: 8px 16px;
            min-height: 32px;
            border-radius: 6px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            
            .el-icon {
              margin-right: 6px;
              flex-shrink: 0;
              width: 16px;
              height: 16px;
            }
            
            span {
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            &.el-button--primary {
              order: 1;
              background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
              border: none;
              color: #ffffff;
              
              &:not(.is-disabled):hover {
                background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              }
              
              &.is-disabled {
                background: #c0c4cc;
                color: #ffffff;
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }
            }
            
            &.el-button--text {
              order: 2;
              color: #409eff;
              border: 1px solid #409eff;
              background: transparent;
              
              &:hover {
                background: #409eff;
                color: #ffffff;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
              }
            }
          }
        }
      }
    }

    // 快捷设置卡片桌面端优化
    .quick-settings-card {
      .quick-settings-header {
        margin-bottom: 16px;
        
        h4 {
          font-size: 16px;
        }
      }
      
      .quick-settings {
        .setting-item {
          margin-bottom: 12px;
          padding: 8px 0;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f8f9fa;
            border-radius: 6px;
            padding-left: 8px;
            padding-right: 8px;
          }
          
          .setting-label {
            font-size: 14px;
            transition: color 0.3s ease;
          }
          
          .el-switch {
            :deep(.el-switch__core) {
              width: 48px;
              height: 24px;
              transition: all 0.3s ease;
            }
          }
        }
      }
    }

    // 设置卡片桌面端优化
    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__content) {
          padding: 24px 0;
        }
        
        :deep(.el-tabs__item) {
          font-size: 15px;
          padding: 0 20px;
          transition: all 0.3s ease;
          
          &:hover {
            color: #409eff;
          }
        }
        
        :deep(.el-tabs__active-bar) {
          transition: all 0.3s ease;
        }
      }
      
      .profile-form,
      .password-form,
      .preferences-form {
        max-width: 100%;
        
        :deep(.el-form-item__label) {
          font-size: 14px;
          width: 100px !important;
        }
        
        :deep(.el-input__inner) {
          font-size: 14px;
          transition: all 0.3s ease;
          
          &:focus {
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }
        
        :deep(.el-textarea__inner) {
          font-size: 14px;
          transition: all 0.3s ease;
          
          &:focus {
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }
        
        .form-hint {
          font-size: 12px;
          margin-top: 4px;
        }
      }
      
      .profile-section,
      .security-section,
      .preferences-section {
        margin-bottom: 32px;
        
        h4 {
          font-size: 16px;
          margin-bottom: 16px;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 30px;
            height: 2px;
            background: linear-gradient(90deg, #409eff, #67c23a);
            border-radius: 1px;
          }
        }
      }

      // 统计卡片桌面端优化
      .stat-card {
        padding: 20px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .stat-number {
          font-size: 24px;
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }
        
        .stat-label {
          font-size: 14px;
          transition: color 0.3s ease;
        }
      }
    }
  }

  // 对话框桌面端优化
  :deep(.el-dialog) {
    width: 50% !important;
    max-width: 600px !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    
    .el-dialog__header {
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid #f0f0f0;
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
      }
      
      .el-dialog__headerbtn {
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }
    }
    
    .el-dialog__body {
      padding: 24px;
    }
    
    .el-dialog__footer {
      padding: 0 24px 24px 24px;
      border-top: 1px solid #f0f0f0;
      
      .el-button {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  // 存储分析对话框桌面端优化
  .storage-analysis {
    .analysis-section {
      margin-bottom: 24px;
      
      h4 {
        font-size: 16px;
        margin-bottom: 16px;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(90deg, #409eff, #67c23a);
          border-radius: 1px;
        }
      }
    }

    .type-card {
      padding: 16px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
      }
      
      .type-icon {
        font-size: 32px;
        margin-bottom: 8px;
        transition: transform 0.3s ease;
      }
      
      .type-info {
        .type-name {
          font-size: 14px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .type-size {
          font-size: 16px;
          margin-bottom: 4px;
          font-weight: 600;
          color: #409eff;
        }
        
        .type-count {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .storage-suggestions {
      .suggestion {
        padding: 12px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        span {
          font-size: 14px;
        }
        
        .el-icon {
          margin-right: 8px;
          transition: transform 0.3s ease;
        }
      }
    }
  }

  // 存储清理对话框桌面端优化
  .storage-cleanup {
    .cleanup-preview {
      margin-top: 16px;
      padding: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      }
      
      p {
        font-size: 14px;
        
        strong {
          color: #409eff;
          transition: color 0.3s ease;
        }
      }
    }
    
    :deep(.el-checkbox-group) {
      .el-checkbox {
        margin-bottom: 12px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateX(4px);
        }
        
        .el-checkbox__label {
          font-size: 14px;
          transition: color 0.3s ease;
        }
      }
    }
  }
}

// 超小屏幕优化 (小于480px)
@media (max-width: 480px) {
  .user-center-page {
    padding: 8px;
  }
  
  .page-header {
    margin-bottom: 12px;
    
    .header-content {
      .header-left {
        .page-title {
          font-size: 20px;
        }
        
        .page-subtitle {
          font-size: 12px;
        }
      }
    }
  }

  .user-center-content {
    .user-info-card {
      .user-avatar-section {
        .avatar-container {
          .user-avatar {
            width: 60px !important;
            height: 60px !important;
            font-size: 24px;
          }
          
          .avatar-overlay {
            .el-button {
              width: 24px;
              height: 24px;
            }
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 14px;
          }
          
          .user-email {
            font-size: 12px;
          }
        }
      }
    }

    .storage-card {
      .storage-header {
        h4 {
          font-size: 14px;
        }
      }
      
      .storage-progress {
        .el-progress {
          :deep(.el-progress__text) {
            font-size: 11px;
          }
        }
      }

      .storage-actions {
        flex-direction: column;
        gap: 6px;
        
        .el-button {
          width: 100%;
          font-size: 12px;
          min-height: 32px;
          padding: 6px 12px;
          border-radius: 4px;
          
          &.el-button--primary {
            background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
            border: none;
            
            &.is-disabled {
              background: #c0c4cc;
              color: #ffffff;
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
          
          &.el-button--text {
            color: #409eff;
            border: 1px solid #409eff;
            background: transparent;
          }
        }
      }
    }

    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__item) {
          font-size: 13px;
          padding: 0 8px;
        }
      }
      
      .profile-form,
      .password-form,
      .preferences-form {
        :deep(.el-form-item__label) {
          font-size: 12px;
          width: 70px !important;
        }
      }
    }
  }

  // 超小屏幕对话框优化
  :deep(.el-dialog) {
    .el-dialog__header {
      padding: 12px 16px 0 16px;
      
      .el-dialog__title {
        font-size: 14px;
      }
    }
    
    .el-dialog__body {
      padding: 12px 16px;
    }
    
    .el-dialog__footer {
      padding: 0 16px 12px 16px;
    }
  }
}

// 超大屏幕优化 (大于1400px)
@media (min-width: 1400px) {
  .user-center-page {
    max-width: 1600px;
    padding: 32px;
  }
  
  .page-header {
    margin-bottom: 32px;
    
    .header-content {
      .header-left {
        .page-title {
          font-size: 32px;
        }
        
        .page-subtitle {
          font-size: 16px;
        }
      }
    }
  }

  .user-center-content {
    .el-row {
      .el-col {
        margin-bottom: 32px;
      }
    }

    .user-info-card {
      margin-bottom: 32px;
      
      .user-avatar-section {
        .avatar-container {
          margin-bottom: 24px;
          
          .user-avatar {
            width: 120px !important;
            height: 120px !important;
            font-size: 48px;
          }
          
          .avatar-overlay {
            .el-button {
              width: 36px;
              height: 36px;
            }
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 20px;
            margin-bottom: 10px;
          }
          
          .user-email {
            font-size: 16px;
          }
        }
      }
    }

    .storage-card {
      margin-bottom: 32px;
      
      .storage-header {
        margin-bottom: 20px;
        
        h4 {
          font-size: 18px;
        }
      }
      
      .storage-progress {
        margin-bottom: 20px;
        
        .el-progress {
          :deep(.el-progress__text) {
            font-size: 15px;
          }
        }
      }
    }

    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__content) {
          padding: 32px 0;
        }
        
        :deep(.el-tabs__item) {
          font-size: 16px;
          padding: 0 24px;
        }
      }
      
      .profile-form,
      .password-form,
      .preferences-form {
        :deep(.el-form-item__label) {
          font-size: 15px;
          width: 120px !important;
        }
        
        :deep(.el-input__inner) {
          font-size: 15px;
        }
        
        :deep(.el-textarea__inner) {
          font-size: 15px;
        }
      }
      
      .profile-section,
      .security-section,
      .preferences-section {
        margin-bottom: 40px;
        
        h4 {
          font-size: 18px;
          margin-bottom: 20px;
        }
      }

      .stat-card {
        padding: 24px;
        
        .stat-number {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .stat-label {
          font-size: 16px;
        }
      }
    }
  }

  // 超大屏幕对话框优化
  :deep(.el-dialog) {
    width: 40% !important;
    max-width: 800px !important;
    
    .el-dialog__header {
      padding: 32px 32px 0 32px;
      
      .el-dialog__title {
        font-size: 20px;
      }
    }
    
    .el-dialog__body {
      padding: 32px;
    }
    
    .el-dialog__footer {
      padding: 0 32px 32px 32px;
    }
  }
}

// 横屏模式优化
@media (orientation: landscape) and (max-height: 600px) {
  .user-center-page {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 16px;
    
    .header-content {
      .header-left {
        .page-title {
          font-size: 22px;
        }
      }
    }
  }

  .user-center-content {
    .user-info-card {
      .user-avatar-section {
        .avatar-container {
          margin-bottom: 12px;
          
          .user-avatar {
            width: 70px !important;
            height: 70px !important;
            font-size: 28px;
          }
        }
        
        .user-basic-info {
          .username {
            font-size: 15px;
            margin-bottom: 4px;
          }
          
          .user-email {
            font-size: 12px;
          }
        }
      }
    }

    .storage-card {
      .storage-progress {
        margin-bottom: 10px;
      }
      
      .storage-details {
        margin-bottom: 10px;
        
        .storage-item {
          padding: 4px 0;
        }
      }

      .storage-actions {
        flex-direction: column;
        gap: 4px;
        align-items: stretch;
        justify-content: center;
        
        .action-button-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          
          .el-button {
            width: 100%;
            font-size: 12px;
            min-height: 28px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            
            .el-icon {
              margin-right: 4px;
              flex-shrink: 0;
              width: 14px;
              height: 14px;
            }
            
            span {
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            &.el-button--primary {
              order: 1;
              background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
              border: none;
              color: #ffffff;
              
              &.is-disabled {
                background: #c0c4cc;
                color: #ffffff;
                opacity: 0.6;
                cursor: not-allowed;
              }
            }
            
            &.el-button--text {
              order: 2;
              color: #409eff;
              border: 1px solid #409eff;
              background: transparent;
            }
          }
        }
      }
    }

    .settings-card {
      .settings-tabs {
        :deep(.el-tabs__content) {
          padding: 12px 0;
        }
      }
      
      .profile-section,
      .security-section,
      .preferences-section {
        margin-bottom: 20px;
        
        h4 {
          margin-bottom: 10px;
        }
        
        .password-actions {
          gap: 10px;
          
          .el-button {
            height: 32px;
            font-size: 12px;
          }
          
          .forgot-password {
            font-size: 12px;
          }
        }
        
        .verification-code-input {
          gap: 8px;
          
          .send-code-btn {
            min-width: 100px;
            height: 32px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>


