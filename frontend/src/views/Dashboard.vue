<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <!-- 主要内容区域：左侧欢迎信息 + 右侧操作按钮 -->
      <div class="welcome-main">
        <div class="welcome-header">
          <div class="user-avatar">
            <el-avatar :size="60" :src="authStore.user?.avatar_url">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">
              欢迎回来，{{ authStore.user?.username }}！
            </h1>
            <p class="welcome-subtitle">
              今天是 {{ currentDate }}，让我们开始管理您的文件吧
            </p>
        </div>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="goToFiles" class="action-btn primary">
          <el-icon><FolderOpened /></el-icon>
          浏览文件
        </el-button>
        <el-button size="large" @click="showUploadDialog = true" class="action-btn">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
        <el-button size="large" @click="createNewFolder" class="action-btn">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button 
          v-if="authStore.isAdmin" 
          size="large" 
          @click="goToAdmin" 
          class="action-btn admin-btn"
        >
          <el-icon><Setting /></el-icon>
          管理控制台
        </el-button>
        </div>
      </div>
      
      <!-- 统计数据区域：下方一排显示 -->
      <div class="welcome-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalFiles }}</span>
          <span class="stat-label">总文件数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatFileSize(stats.totalSize) }}</span>
          <span class="stat-label">已使用空间</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ formatPercentage(authStore.storageUsage) }}</span>
          <span class="stat-label">使用率</span>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card image-card">
        <div class="card-header">
          <div class="stat-icon">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-trend">
            <el-icon :class="(Number(stats.changes?.images?.percentage) || 0) >= 0 ? 'trend-up' : 'trend-down'">
              <TrendCharts />
            </el-icon>
            <span class="trend-text" :class="(Number(stats.changes?.images?.percentage) || 0) >= 0 ? 'trend-positive' : 'trend-negative'">
              {{ (Number(stats.changes?.images?.percentage) || 0) >= 0 ? '+' : '' }}{{ (Number(stats.changes?.images?.percentage) || 0).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.imageCount }}</div>
          <div class="stat-label">图片文件</div>
          <div class="stat-detail">{{ formatFileSize(stats.imageSize) }}</div>
        </div>
      </div>
      
      <div class="stat-card video-card">
        <div class="card-header">
          <div class="stat-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-trend">
            <el-icon :class="(Number(stats.changes?.videos?.percentage) || 0) >= 0 ? 'trend-up' : 'trend-down'">
              <TrendCharts />
            </el-icon>
            <span class="trend-text" :class="(Number(stats.changes?.videos?.percentage) || 0) >= 0 ? 'trend-positive' : 'trend-negative'">
              {{ (Number(stats.changes?.videos?.percentage) || 0) >= 0 ? '+' : '' }}{{ (Number(stats.changes?.videos?.percentage) || 0).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.videoCount }}</div>
          <div class="stat-label">视频文件</div>
          <div class="stat-detail">{{ formatFileSize(stats.videoSize) }}</div>
        </div>
      </div>
      
      <div class="stat-card folder-card">
        <div class="card-header">
          <div class="stat-icon">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-trend">
            <el-icon :class="(Number(stats.changes?.folders?.percentage) || 0) >= 0 ? 'trend-up' : 'trend-down'">
              <TrendCharts />
            </el-icon>
            <span class="trend-text" :class="(Number(stats.changes?.folders?.percentage) || 0) >= 0 ? 'trend-positive' : 'trend-negative'">
              {{ (Number(stats.changes?.folders?.percentage) || 0) >= 0 ? '+' : '' }}{{ (Number(stats.changes?.folders?.percentage) || 0).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.folderCount }}</div>
          <div class="stat-label">文件夹</div>
          <div class="stat-detail">{{ stats.totalFiles }} 个文件</div>
        </div>
      </div>
      
      <div class="stat-card storage-card">
        <div class="card-header">
          <div class="stat-icon">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-trend">
            <el-icon :class="(Number(stats.changes?.size?.percentage) || 0) >= 0 ? 'trend-up' : 'trend-down'">
              <TrendCharts />
            </el-icon>
            <span class="trend-text" :class="(Number(stats.changes?.size?.percentage) || 0) >= 0 ? 'trend-positive' : 'trend-negative'">
              {{ (Number(stats.changes?.size?.percentage) || 0) >= 0 ? '+' : '' }}{{ (Number(stats.changes?.size?.percentage) || 0).toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatFileSize(stats.totalSize) }}</div>
          <div class="stat-label">总大小</div>
          <div class="stat-detail">{{ formatPercentage(authStore.storageUsage) }} 使用率</div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 存储使用情况 -->
      <div class="storage-section">
        <el-card class="storage-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon"><PieChart /></el-icon>
                <h3>存储使用情况</h3>
              </div>
              <div class="header-actions">
                <el-button type="text" @click="goToFiles">
                  <el-icon><Setting /></el-icon>
                  管理文件
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="storage-content">
            <div class="storage-overview">
              <div class="storage-info">
                <div class="storage-text">
                  <span class="used">{{ formatFileSize(authStore.user?.used_storage || 0) }}</span>
                  <span class="separator">/</span>
                  <span class="total">{{ formatFileSize(authStore.user?.storage_limit || 0) }}</span>
                </div>
                <div class="storage-percent">
                  {{ formatPercentage(authStore.storageUsage) }} 已使用
                </div>
              </div>
              
              <el-progress
                :percentage="authStore.storageUsage"
                :color="getStorageColor(authStore.storageUsage)"
                :stroke-width="16"
                class="storage-progress"
              >
                <template #default="{ percentage }">
                  {{ formatPercentage(percentage) }}
                </template>
              </el-progress>
            </div>
            
            <div class="storage-breakdown">
              <div class="breakdown-item">
                <div class="breakdown-icon image">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="breakdown-content">
                  <div class="breakdown-label">图片文件</div>
                  <div class="breakdown-value">{{ formatFileSize(stats.imageSize) }}</div>
                </div>
              </div>
              <div class="breakdown-item">
                <div class="breakdown-icon video">
                  <el-icon><VideoPlay /></el-icon>
                </div>
                <div class="breakdown-content">
                  <div class="breakdown-label">视频文件</div>
                  <div class="breakdown-value">{{ formatFileSize(stats.videoSize) }}</div>
                </div>
              </div>
            </div>
            
            <div class="storage-tips">
              <el-alert
                v-if="authStore.storageUsage > 90"
                title="存储空间不足"
                type="warning"
                :closable="false"
                show-icon
              >
                您的存储空间即将用完，请及时清理不需要的文件或联系管理员扩容
              </el-alert>
              <el-alert
                v-else-if="authStore.storageUsage > 70"
                title="存储空间提醒"
                type="info"
                :closable="false"
                show-icon
              >
                您的存储空间已使用 {{ formatPercentage(authStore.storageUsage) }}，建议定期清理文件
              </el-alert>
              <el-alert
                v-else
                title="存储空间充足"
                type="success"
                :closable="false"
                show-icon
              >
                您的存储空间使用正常，还有 {{ formatPercentage(100 - authStore.storageUsage) }} 可用空间
              </el-alert>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 趋势分析 -->
      <div class="trend-section">
        <el-card class="trend-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon"><TrendCharts /></el-icon>
                <h3>趋势分析</h3>
              </div>
              <div class="header-actions">
                <el-button type="text" @click="refreshTrends" :loading="loadingTrends">
                  <el-icon><Refresh /></el-icon>
                  刷新数据
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-if="stats.trends.length > 0" class="trend-charts">
            <div class="chart-container">
              <div class="chart-title">文件数量趋势</div>
              <div class="chart-content">
                <div class="chart-bars">
                  <div 
                    v-for="(trend, index) in stats.trends" 
                    :key="index"
                    class="chart-bar"
                    :style="{ height: getBarHeight(trend.total_files, 'files') + '%' }"
                    :title="`${trend.trend_date}: ${trend.total_files} 个文件`"
                  >
                    <span class="bar-value">{{ trend.total_files }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span 
                    v-for="(trend, index) in stats.trends" 
                    :key="index"
                    class="chart-label"
                  >
                    {{ formatTrendDate(trend.trend_date) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-title">存储使用趋势</div>
              <div class="chart-content">
                <div class="chart-bars">
                  <div 
                    v-for="(trend, index) in stats.trends" 
                    :key="index"
                    class="chart-bar storage-bar"
                    :style="{ height: getBarHeight(trend.total_size, 'size') + '%' }"
                    :title="`${trend.trend_date}: ${formatFileSize(trend.total_size)}`"
                  >
                    <span class="bar-value">{{ formatFileSize(trend.total_size) }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span 
                    v-for="(trend, index) in stats.trends" 
                    :key="index"
                    class="chart-label"
                  >
                    {{ formatTrendDate(trend.trend_date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <el-empty description="暂无趋势数据">
              <el-button type="primary" @click="loadDashboardData">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </el-empty>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card class="actions-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon"><Lightning /></el-icon>
              <h3>快速操作</h3>
            </div>
          </div>
        </template>
        
        <div class="actions-grid">
          <div class="action-item" @click="showUploadDialog = true">
            <div class="action-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">上传文件</span>
              <span class="action-desc">拖拽或点击上传</span>
            </div>
          </div>
          
          <div class="action-item" @click="goToFiles">
            <div class="action-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">浏览文件</span>
              <span class="action-desc">查看所有文件</span>
            </div>
          </div>
          
          <div class="action-item" @click="createNewFolder">
            <div class="action-icon">
              <el-icon><FolderAdd /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">新建文件夹</span>
              <span class="action-desc">整理您的文件</span>
            </div>
          </div>
          
          <div class="action-item" @click="goToFiles">
            <div class="action-icon">
              <el-icon><Search /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">搜索文件</span>
              <span class="action-desc">快速查找文件</span>
            </div>
          </div>
          
          <div class="action-item" @click="goToFiles">
            <div class="action-icon">
              <el-icon><Share /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">分享文件</span>
              <span class="action-desc">生成分享链接</span>
            </div>
          </div>
          
          <div class="action-item" @click="goToFiles">
            <div class="action-icon">
              <el-icon><Download /></el-icon>
            </div>
            <div class="action-content">
              <span class="action-text">批量下载</span>
              <span class="action-desc">下载多个文件</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 文件上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文件"
      :width="isMobile ? '95%' : '600px'"
      :close-on-click-modal="false"
      :class="{ 'mobile-upload-dialog': isMobile }"
      :modal-class="isMobile ? 'mobile-modal' : ''"
    >
      <FileUploader @upload-success="handleUploadSuccess" />
    </el-dialog>
    
    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      title="文件预览"
      width="80%"
      :close-on-click-modal="true"
    >
      <FilePreview v-if="previewFile" :file="previewFile" @file-deleted="handleFileDeleted" />
    </el-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  Upload,
  Picture,
  VideoPlay,
  Folder,
  DataLine,
  FolderAdd,
  Search,
  TrendCharts,
  PieChart,
  Setting,
  Clock,
  View,
  Download,
  Delete,
  Lightning,
  QuestionFilled,
  InfoFilled,
  StarFilled,
  Share
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useFilesStore } from '@/stores/files'
import { formatFileSize, formatTime, getFilePreviewUrl, getStorageUsageColor, formatPercentage } from '@/utils/helpers'
import api from '@/utils/api'
import FileUploader from '@/components/FileUploader.vue'
import FilePreview from '@/components/FilePreview.vue'

const router = useRouter()
const authStore = useAuthStore()
const filesStore = useFilesStore()

const showUploadDialog = ref(false)
const showPreviewDialog = ref(false)
const previewFile = ref(null)
const loadingTrends = ref(false)

// 统计数据
const stats = ref({
  imageCount: 0,
  videoCount: 0,
  folderCount: 0,
  totalFiles: 0,
  totalSize: 0,
  imageSize: 0,
  videoSize: 0,
  changes: {
    files: { value: 0, percentage: 0 },
    size: { value: 0, percentage: 0 },
    images: { value: 0, percentage: 0 },
    videos: { value: 0, percentage: 0 },
    folders: { value: 0, percentage: 0 }
  },
  trends: []
})

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 最近文件
const recentFiles = computed(() => {
  return filesStore.files.slice(0, 6)
})

// 响应式检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 获取存储颜色
const getStorageColor = (percentage: number) => {
  return getStorageUsageColor(percentage)
}

// 跳转到文件管理
const goToFiles = () => {
  router.push('/')
}

// 跳转到管理面板
const goToAdmin = () => {
  router.push('/admin')
}

// 预览文件
const handlePreviewFile = (file: any) => {
  previewFile.value = file
  showPreviewDialog.value = true
}

// 创建新文件夹
const createNewFolder = async () => {
  try {
    const { value: folderName } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间'
    })
    
    if (folderName) {
      await filesStore.createFolder(folderName)
      ElMessage.success('文件夹创建成功')
    }
  } catch (error) {
    // 用户取消或创建失败
  }
}

// 处理上传成功
const handleUploadSuccess = () => {
  showUploadDialog.value = false
  loadDashboardData()
}

// 处理文件删除
const handleFileDeleted = (fileId: number) => {
  showPreviewDialog.value = false
  loadDashboardData()
}

// 下载文件
const downloadFile = (file: any) => {
  try {
    const link = document.createElement('a')
    link.href = getFilePreviewUrl(file.id)
    link.download = file.original_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('开始下载文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 删除文件
const deleteFile = async (file: any) => {
  try {
    await filesStore.deleteFile(file.id)
    ElMessage.success('文件删除成功')
    loadDashboardData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    // 获取用户所有文件的统计信息（包含趋势数据）
    const response = await api.get('/files/stats')
    const data = response.data.data
    
    // 更新统计数据
    stats.value = {
      imageCount: data.image_count || 0,
      videoCount: data.video_count || 0,
      folderCount: data.folder_count || 0,
      totalFiles: data.total_files || 0,
      totalSize: data.total_size || 0,
      imageSize: data.image_size || 0,
      videoSize: data.video_size || 0,
      changes: data.changes || {
        files: { value: 0, percentage: 0 },
        size: { value: 0, percentage: 0 },
        images: { value: 0, percentage: 0 },
        videos: { value: 0, percentage: 0 },
        folders: { value: 0, percentage: 0 }
      },
      trends: data.trends || []
    }
  } catch (error) {
    // 如果API失败，使用本地数据作为备选
    await loadLocalStats()
  }
}

// 备选方案：使用本地数据计算统计
const loadLocalStats = async () => {
  try {
    
    // 获取用户所有文件的统计信息（包含趋势数据）
    const response = await api.get('/files/stats')
    const data = response.data.data
    
    // 更新统计数据
    stats.value = {
      imageCount: data.image_count || 0,
      videoCount: data.video_count || 0,
      folderCount: data.folder_count || 0,
      totalFiles: data.total_files || 0,
      totalSize: data.total_size || 0,
      imageSize: data.image_size || 0,
      videoSize: data.video_size || 0,
      changes: data.changes || {
        files: { value: 0, percentage: 0 },
        size: { value: 0, percentage: 0 },
        images: { value: 0, percentage: 0 },
        videos: { value: 0, percentage: 0 },
        folders: { value: 0, percentage: 0 }
      },
      trends: data.trends || []
    }
    
  } catch (error) {
    
    // 如果连备选方案都失败，使用空数据
    stats.value = {
      imageCount: 0,
      videoCount: 0,
      folderCount: 0,
      totalFiles: 0,
      totalSize: 0,
      imageSize: 0,
      videoSize: 0,
      changes: {
        files: { value: 0, percentage: 0 },
        size: { value: 0, percentage: 0 },
        images: { value: 0, percentage: 0 },
        videos: { value: 0, percentage: 0 },
        folders: { value: 0, percentage: 0 }
      },
      trends: []
    }
  }
}

// 刷新趋势数据
const refreshTrends = async () => {
  loadingTrends.value = true
  try {
    await loadDashboardData()
    ElMessage.success('趋势数据已刷新')
  } catch (error) {
    ElMessage.error('刷新趋势数据失败')
  } finally {
    loadingTrends.value = false
  }
}

// 计算柱状图高度
const getBarHeight = (value, type) => {
  if (!stats.value.trends.length) return 0
  
  const values = stats.value.trends.map(trend => {
    if (type === 'files') return trend.total_files
    if (type === 'size') return trend.total_size
    return 0
  })
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  
  if (maxValue === minValue) return 50 // 如果所有值相同，显示50%高度
  
  return Math.max(10, ((value - minValue) / (maxValue - minValue)) * 80 + 10)
}

// 格式化趋势日期
const formatTrendDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style lang="scss" scoped>
.dashboard {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  padding: 0; // 移除内边距，由MainLayout统一控制
  background: #f5f7fa;
  min-height: 100vh;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 48px;
  color: white;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.4;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }
  
  // 主要内容区域：左右布局
  .welcome-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }
  
  .welcome-header {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
    
    .user-avatar {
      :deep(.el-avatar) {
        border: 4px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }
      }
    }
    
    .welcome-text {
      .welcome-title {
        font-size: 42px;
        font-weight: 900;
        margin-bottom: 12px;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background: linear-gradient(45deg, #ffffff, #f0f8ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
      }
      
      .welcome-subtitle {
        font-size: 20px;
        opacity: 0.95;
        margin: 0;
        font-weight: 500;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        line-height: 1.4;
      }
    }
  }
  
  .welcome-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 16px;
    position: relative;
    z-index: 1;
    align-items: stretch; // 确保所有按钮高度一致
    justify-items: stretch; // 确保所有按钮宽度一致
    
    .action-btn {
      // 统一尺寸设置
      width: 100% !important;
      height: 80px !important;
      min-height: 80px !important;
      max-height: 80px !important;
      border-radius: 20px;
      font-weight: 700;
      padding: 0 !important; // 重置padding，使用flex布局控制间距
      margin: 0 !important; // 重置margin
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 18px;
      line-height: 1.2;
      box-sizing: border-box;
      vertical-align: top; // 确保垂直对齐
      
      // 强制覆盖Element Plus的所有默认样式
      &.el-button {
        width: 100% !important;
        height: 80px !important;
        min-height: 80px !important;
        max-height: 80px !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 18px !important;
        line-height: 1.2 !important;
        border-radius: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      &.el-button--large {
        width: 100% !important;
        height: 80px !important;
        min-height: 80px !important;
        max-height: 80px !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 18px !important;
        line-height: 1.2 !important;
        border-radius: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      &.el-button--primary {
        width: 100% !important;
        height: 80px !important;
        min-height: 80px !important;
        max-height: 80px !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 18px !important;
        line-height: 1.2 !important;
        border-radius: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
      }
      
      &:hover::before {
        left: 100%;
      }
      
      &.primary {
        background: rgba(255, 255, 255, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.4);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
      }
      
      &:not(.primary) {
        background: white;
        color: #667eea;
        border: none;
        
        &:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
      }
      
      &.admin-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border: none;
        
        &:hover {
          background: linear-gradient(135deg, #ff5252, #e53935);
          transform: translateY(-4px) scale(1.02);
        }
      }
      
      // 统一图标样式
      .el-icon {
        font-size: 22px !important;
        flex-shrink: 0;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 22px !important;
        height: 22px !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      // 统一文字样式
      span {
        font-size: 18px !important;
        font-weight: 700 !important;
        white-space: nowrap;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1.2 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      // 确保按钮内容垂直居中
      > * {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  }
  
  // 统计数据区域：下方一排显示
  .welcome-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    position: relative;
    z-index: 1;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      min-width: 140px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: 800;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background: linear-gradient(45deg, #ffffff, #f0f8ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stat-label {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 添加更多动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

// 页面加载动画
.dashboard {
  animation: fadeInUp 0.8s ease-out;
}

.welcome-section {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.stats-grid {
  .stat-card {
    animation: slideInLeft 0.6s ease-out both;
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.4s; }
  }
}

// 按钮点击动画
.action-btn {
  &:active {
    animation: pulse 0.2s ease-in-out;
  }
}

// 统计卡片悬停效果增强
.stat-card {
        &:hover {
    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
    
    .stat-number {
      transform: scale(1.05);
    }
  }
  
  .stat-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .stat-number {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// 加载状态动画
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

// 响应式动画优化
@media (prefers-reduced-motion: reduce) {
  .dashboard,
  .welcome-section,
  .stat-card,
  .action-btn {
    animation: none;
  }
  
  .welcome-section::after {
    animation: none;
  }
  
  .stat-card:hover {
    transform: none;
  }
  
  .action-btn:hover {
    transform: none;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 48px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &.image-card {
    .card-header .stat-icon {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }
  }
  
  &.video-card {
    .card-header .stat-icon {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }
  }
  
  &.folder-card {
    .card-header .stat-icon {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #27ae60;
      background: rgba(39, 174, 96, 0.1);
      padding: 4px 8px;
      border-radius: 12px;
      
      .trend-up {
        font-size: 14px;
      }
    }
  }
  
  .stat-content {
    .stat-number {
      font-size: 32px;
      font-weight: 800;
      color: #2c3e50;
      margin-bottom: 8px;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 15px;
      color: #7f8c8d;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .stat-detail {
      font-size: 13px;
      color: #95a5a6;
      font-weight: 500;
    }
  }
}

.storage-section,
.recent-section,
.quick-actions {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.storage-content {
  .storage-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .storage-text {
    font-size: 16px;
    font-weight: 500;
    
    .used {
      color: #303133;
    }
    
    .separator {
      color: #909399;
      margin: 0 4px;
    }
    
    .total {
      color: #909399;
    }
  }
  
  .storage-percent {
    font-size: 14px;
    color: #909399;
  }
  
  .storage-progress {
    margin-bottom: 16px;
  }
  
  .storage-tips {
    .el-alert {
      border-radius: 12px;
      border: none;
      
      &.el-alert--warning {
        background: linear-gradient(135deg, #ffeaa7, #fab1a0);
        color: #2d3436;
      }
      
      &.el-alert--success {
        background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
        color: #2d3436;
      }
    }
  }
}

.recent-files {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.recent-file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .file-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    
    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .file-icon {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }
    
    .file-type-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #667eea;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 8px;
      font-weight: 600;
    }
  }
  
  .file-info {
    flex: 1;
    min-width: 0;
    
    .file-name {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .file-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }
    
    .file-actions {
      display: flex;
      gap: 4px;
      
      :deep(.el-button) {
        padding: 4px 8px;
        border-radius: 6px;
        
        &:hover {
          color: #667eea;
        }
      }
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .action-icon {
    font-size: 28px;
    color: #667eea;
  }
  
  .action-text {
    font-size: 14px;
    color: #2c3e50;
    font-weight: 600;
    text-align: center;
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  
  :deep(.el-empty) {
    .el-empty__description {
      color: #7f8c8d;
      font-size: 16px;
    }
    
    .el-button {
      border-radius: 8px;
      font-weight: 600;
      
      &.el-button--primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border: none;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }
    }
  }
}

// 响应式设计 - 桌面端优化
@media (min-width: 1440px) {
  .dashboard {
    padding: 0; // 移除内边距，由MainLayout统一控制
    gap: 32px;
  }
  
  .welcome-section {
    padding: 56px;
    
    .welcome-header {
      gap: 32px;
      margin-bottom: 36px;
      
      .welcome-text {
        .welcome-title {
          font-size: 48px;
        }
        
        .welcome-subtitle {
          font-size: 22px;
        }
      }
    }
    
    .welcome-stats {
      gap: 48px;
      margin-top: 40px;
      
      .stat-item {
        padding: 20px 24px;
        
        .stat-value {
          font-size: 32px;
        }
        
        .stat-label {
          font-size: 15px;
        }
      }
    }
    
    .welcome-actions {
      gap: 24px;
      
      .action-btn {
        padding: 20px 32px;
        font-size: 17px;
        
        .el-icon {
          font-size: 20px;
        }
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
}

@media (min-width: 1200px) and (max-width: 1439px) {
  .dashboard {
    padding: 0; // 移除内边距，由MainLayout统一控制
    gap: 28px;
  }
  
  .welcome-section {
    padding: 48px;
    
    .welcome-header {
      gap: 28px;
      margin-bottom: 32px;
      
      .welcome-text {
        .welcome-title {
          font-size: 42px;
        }
        
        .welcome-subtitle {
          font-size: 20px;
        }
      }
    }
    
    .welcome-stats {
      gap: 40px;
      margin-top: 32px;
    }
    
    .welcome-actions {
      gap: 20px;
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) and (max-width: 1199px) {
  .dashboard {
    padding: 0; // 移除内边距，由MainLayout统一控制
    gap: 24px;
  }
  
  .welcome-section {
    padding: 40px;
    
    .welcome-main {
      gap: 32px;
      margin-bottom: 28px;
    }
    
    .welcome-header {
      gap: 24px;
      
      .welcome-text {
        .welcome-title {
          font-size: 36px;
        }
        
        .welcome-subtitle {
          font-size: 18px;
        }
      }
    }
    
    .welcome-actions {
      gap: 16px;
    }
    
    .welcome-stats {
      gap: 32px;
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

// 平板端响应式设计
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard {
    padding: 0; // 移除内边距，由MainLayout统一控制
    gap: 20px;
  }
  
  .welcome-section {
    padding: 32px;
    
    .welcome-main {
      flex-direction: column;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .welcome-header {
      gap: 20px;
      
      .welcome-text {
        .welcome-title {
          font-size: 32px;
        }
        
        .welcome-subtitle {
          font-size: 16px;
        }
      }
    }
    
    .welcome-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      width: 100%;
      
      .action-btn {
        width: 100% !important;
        height: 72px !important;
        min-height: 72px !important;
        max-height: 72px !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 17px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        
        &.el-button,
        &.el-button--large,
        &.el-button--primary {
          width: 100% !important;
          height: 72px !important;
          min-height: 72px !important;
          max-height: 72px !important;
          padding: 0 !important;
          margin: 0 !important;
          font-size: 17px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .el-icon {
          font-size: 20px !important;
          width: 20px !important;
          height: 20px !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        span {
          font-size: 17px !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    }
    
    .welcome-stats {
      gap: 24px;
      
      .stat-item {
        padding: 14px 18px;
        
        .stat-value {
          font-size: 24px;
        }
        
        .stat-label {
          font-size: 13px;
        }
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

// 移动端响应式设计
@media (max-width: 767px) {
  .dashboard {
    padding: 0; // 移除内边距，由MainLayout统一控制
    gap: 20px;
  }
  
  .welcome-section {
    padding: 28px 20px;
    border-radius: 20px;
    
    .welcome-main {
    flex-direction: column;
    gap: 24px;
      margin-bottom: 24px;
    }
    
    .welcome-header {
      flex-direction: column;
      text-align: center;
      gap: 20px;
      
      .user-avatar {
        :deep(.el-avatar) {
          width: 80px;
          height: 80px;
          border-width: 3px;
        }
      }
      
      .welcome-text {
        .welcome-title {
          font-size: 32px;
          line-height: 1.3;
        }
        
        .welcome-subtitle {
          font-size: 16px;
          line-height: 1.5;
        }
      }
    }
    
    .welcome-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      width: 100%;
      
      .action-btn {
        width: 100%;
        height: 68px;
        min-height: 68px;
        max-height: 68px;
        padding: 0;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border-radius: 16px;
        
        &.el-button,
        &.el-button--large,
        &.el-button--primary {
          width: 100%;
          height: 68px;
          min-height: 68px;
          max-height: 68px;
          padding: 0;
          font-size: 16px;
        }
        
        .el-icon {
          font-size: 19px;
          width: 19px;
          height: 19px;
        }
        
        span {
          font-size: 16px;
          font-weight: 700;
        }
      }
    }
    
    .welcome-stats {
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      
      .stat-item {
        padding: 16px 20px;
        min-width: 120px;
        
        .stat-value {
          font-size: 24px;
        }
        
        .stat-label {
          font-size: 12px;
        }
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    
    .stat-card {
      padding: 20px;
      
      .card-header {
        .stat-icon {
          width: 40px;
          height: 40px;
          font-size: 18px;
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 28px;
        }
      }
    }
  }
  
  .main-content {
    gap: 16px;
  }
  
  .storage-section,
  .recent-section {
    .card-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
      
      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
  
  .recent-files {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .recent-file-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    
    .file-thumbnail {
      width: 60px;
      height: 60px;
      margin: 0 auto;
    }
    
    .file-info {
      width: 100%;
      
      .file-actions {
        justify-content: center;
      }
    }
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .action-item {
      padding: 16px;
      
      .action-icon {
        font-size: 24px;
      }
      
      .action-text {
        font-size: 13px;
      }
      
      .action-desc {
        font-size: 11px;
      }
    }
  }
}

// 平板竖屏 (768px以下)
@media (max-width: 768px) {
  .dashboard {
    padding: 0; // 移动端完全移除内边距
    gap: 16px;
  }
  
  .welcome-section {
    padding: 20px 16px;
    border-radius: 16px;
    
    .welcome-main {
      flex-direction: column;
      gap: 20px;
    }
    
    .welcome-header {
      gap: 16px;
      
      .user-avatar {
        :deep(.el-avatar) {
          width: 60px;
          height: 60px;
        }
      }
      
      .welcome-text {
        .welcome-title {
          font-size: 24px;
          line-height: 1.3;
        }
        
        .welcome-subtitle {
          font-size: 14px;
        }
      }
    }
    
    .welcome-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      
      .action-btn {
        height: 44px;
        font-size: 14px;
        
        :deep(.el-icon) {
          font-size: 16px;
        }
      }
    }
  }
  
  .welcome-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .stat-item {
      padding: 16px 12px;
      border-radius: 12px;
      
      .stat-value {
        font-size: 20px;
      }
      
      .stat-label {
        font-size: 12px;
      }
    }
  }
  
  .quick-actions {
    .action-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      
      .action-card {
        padding: 16px;
        border-radius: 12px;
        
        .action-icon {
          font-size: 24px;
        }
        
        .action-title {
          font-size: 14px;
        }
        
        .action-description {
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0; // 移动端完全移除内边距
    gap: 12px;
  }
  
  .welcome-section {
    padding: 20px;
    
    .welcome-header {
      .welcome-text {
        .welcome-title {
          font-size: 24px;
        }
        
        .welcome-subtitle {
          font-size: 14px;
        }
      }
    }
    
    .welcome-stats {
      flex-direction: column;
      gap: 16px;
      
      .stat-item {
        .stat-value {
          font-size: 20px;
        }
        
        .stat-label {
          font-size: 12px;
        }
      }
    }
    
    .welcome-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      
      .action-btn {
        height: 60px;
        padding: 0;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 14px;
        
        &.el-button,
        &.el-button--large,
        &.el-button--primary {
          height: 60px;
          padding: 0;
          font-size: 15px;
        }
        
        .el-icon {
          font-size: 17px;
          width: 17px;
          height: 17px;
        }
        
        span {
          font-size: 15px;
          font-weight: 700;
        }
      }
    }
  }
  
  .stats-grid {
    .stat-card {
      padding: 16px;
      
      .card-header {
        .stat-icon {
          width: 35px;
          height: 35px;
          font-size: 16px;
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 24px;
        }
        
        .stat-label {
          font-size: 13px;
        }
        
        .stat-detail {
          font-size: 11px;
        }
      }
    }
  }
  
  .storage-content {
    .storage-breakdown {
      .breakdown-item {
        flex-direction: column;
        text-align: center;
        gap: 8px;
        
        .breakdown-icon {
          margin: 0 auto;
        }
      }
    }
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    
    .action-item {
      padding: 12px;
      
      .action-icon {
        font-size: 20px;
      }
      
      .action-text {
        font-size: 12px;
      }
      
      .action-desc {
        font-size: 10px;
      }
    }
  }
  
  .quick-actions {
    .actions-card {
      .card-header {
        .header-left {
          .header-icon {
            font-size: 16px;
          }
          
          h3 {
            font-size: 16px;
          }
        }
      }
    }
  }
}

// 小屏手机适配
@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
    gap: 16px;
  }
  
  .welcome-section {
    padding: 20px 16px;
    border-radius: 16px;
    
    .welcome-header {
      gap: 16px;
      
      .user-avatar {
        :deep(.el-avatar) {
          width: 70px;
          height: 70px;
          border-width: 2px;
        }
      }
      
      .welcome-text {
        .welcome-title {
          font-size: 28px;
          line-height: 1.2;
        }
        
        .welcome-subtitle {
          font-size: 14px;
          line-height: 1.4;
        }
      }
    }
    
    .welcome-stats {
      gap: 12px;
      margin-top: 20px;
      
      .stat-item {
        padding: 12px 16px;
        min-width: 100px;
        
        .stat-value {
          font-size: 20px;
        }
        
        .stat-label {
          font-size: 11px;
        }
      }
    }
    
    .welcome-actions {
      gap: 12px;
      
      .action-btn {
        width: 100%;
        height: 48px;
        min-height: 48px;
        max-height: 48px;
        padding: 0;
          font-size: 14px;
        border-radius: 12px;
        
        &.el-button,
        &.el-button--large,
        &.el-button--primary {
          width: 100%;
          height: 48px;
          min-height: 48px;
          max-height: 48px;
          padding: 0;
          font-size: 14px;
        }
        
        .el-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        
        span {
          font-size: 13px;
        }
      }
    }
  }
  
  .stats-grid {
    gap: 12px;
    
    .stat-card {
      padding: 20px;
      border-radius: 16px;
    }
  }
}

// 移动端对话框优化 - 与Files.vue保持一致
.mobile-upload-dialog {
  :deep(.el-dialog) {
    margin: 2vh auto !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    
    .el-dialog__header {
      padding: 20px 20px 0 20px !important;
      border-bottom: 1px solid #f0f0f0 !important;
      margin-bottom: 0 !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #2c3e50 !important;
      }
      
      .el-dialog__headerbtn {
        top: 20px !important;
        right: 20px !important;
        width: 32px !important;
        height: 32px !important;
        
        .el-dialog__close {
          font-size: 18px !important;
          color: #909399 !important;
          
          &:hover {
            color: #409eff !important;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 20px !important;
      max-height: 70vh !important;
      overflow-y: auto !important;
    }
  }
}

.mobile-modal {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px) !important;
}

// 超小屏幕优化
@media (max-width: 480px) {
  .mobile-upload-dialog {
    :deep(.el-dialog) {
      margin: 1vh auto !important;
      border-radius: 12px !important;
      
      .el-dialog__header {
        padding: 16px 16px 0 16px !important;
        
        .el-dialog__title {
          font-size: 16px !important;
        }
        
        .el-dialog__headerbtn {
          top: 16px !important;
          right: 16px !important;
          width: 28px !important;
          height: 28px !important;
          
          .el-dialog__close {
            font-size: 16px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 16px !important;
        max-height: 75vh !important;
      }
    }
  }
}

@media (max-width: 320px) {
  .mobile-upload-dialog {
    :deep(.el-dialog) {
      margin: 0.5vh auto !important;
      border-radius: 8px !important;
      
      .el-dialog__header {
        padding: 12px 12px 0 12px !important;
        
        .el-dialog__title {
          font-size: 15px !important;
        }
        
        .el-dialog__headerbtn {
          top: 12px !important;
          right: 12px !important;
          width: 24px !important;
          height: 24px !important;
          
          .el-dialog__close {
            font-size: 14px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 12px !important;
        max-height: 80vh !important;
      }
    }
  }
}

// 趋势图表样式
.trend-section {
  .trend-card {
    .trend-charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      
      .chart-container {
        .chart-title {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .chart-content {
          .chart-bars {
            display: flex;
            align-items: end;
            justify-content: space-between;
            height: 120px;
            margin-bottom: 12px;
            padding: 0 8px;
            
            .chart-bar {
              flex: 1;
              margin: 0 2px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 4px 4px 0 0;
              position: relative;
              transition: all 0.3s ease;
              cursor: pointer;
              min-height: 20px;
              
              &:hover {
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                transform: scaleY(1.05);
              }
              
              .bar-value {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                font-weight: 600;
                color: #606266;
                white-space: nowrap;
              }
              
              &.storage-bar {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                
                &:hover {
                  background: linear-gradient(135deg, #ee82f0 0%, #f3455a 100%);
                }
              }
            }
          }
          
          .chart-labels {
            display: flex;
            justify-content: space-between;
            
            .chart-label {
              flex: 1;
              text-align: center;
              font-size: 11px;
              color: #909399;
              margin: 0 2px;
            }
          }
        }
      }
    }
  }
}

// 趋势指示器样式
.stat-trend {
  .trend-up {
    color: #67c23a;
  }
  
  .trend-down {
    color: #f56c6c;
  }
  
  .trend-text {
    &.trend-positive {
      color: #67c23a;
    }
    
    &.trend-negative {
      color: #f56c6c;
    }
  }
}

// 移动端趋势图表适配
@media (max-width: 768px) {
  .trend-section {
    .trend-card {
      .trend-charts {
        grid-template-columns: 1fr;
        gap: 16px;
        
        .chart-container {
          .chart-content {
            .chart-bars {
              height: 100px;
              
              .chart-bar {
                .bar-value {
                  font-size: 10px;
                  top: -18px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
