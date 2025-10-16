<template>
  <div class="file-preview">
    <!-- 图片预览 - 直接显示，不等待加载状态 -->
    <div v-if="file.file_type === 'image'" class="image-preview">
      <div class="preview-image-container">
        <img
          :src="getFilePreviewUrl(file.id)"
          :alt="file.original_name"
          class="preview-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        
        <!-- 加载状态覆盖层 -->
        <div v-if="loading" class="loading-overlay">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载预览...</p>
        </div>
      </div>
      
      <!-- 图片信息 -->
      <div class="image-info">
        <h3>{{ file.original_name }}</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">文件大小:</span>
            <span class="value">{{ formatFileSize(file.file_size) }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件类型:</span>
            <span class="value">{{ file.mime_type }}</span>
          </div>
          <div class="info-item">
            <span class="label">上传时间:</span>
            <span class="value">{{ formatTime(file.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 视频预览 -->
    <div v-else-if="file.file_type === 'video'" class="video-preview">
      <VideoPlayer 
        :video="file"
        @close="$emit('close')"
        @load="handleVideoLoad"
        @error="handleVideoError"
      />
    </div>
    
    <div v-else class="unknown-preview">
      <el-icon class="unknown-icon"><Document /></el-icon>
      <h3>不支持的文件类型</h3>
      <p>无法预览此类型的文件</p>
    </div>
    
    <!-- 操作按钮 -->
    <div class="preview-actions">
      <el-button type="primary" @click="downloadFile">
        <el-icon><Download /></el-icon>
        下载
      </el-button>
      <el-button @click="copyFileUrl">
        <el-icon><Link /></el-icon>
        复制链接
      </el-button>
      <el-button type="danger" @click="deleteFile">
        <el-icon><Delete /></el-icon>
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Download,
  Link,
  Delete,
  Loading,
  ZoomIn,
  ZoomOut,
  FullScreen,
  Share
} from '@element-plus/icons-vue'
import { formatFileSize, formatTime, getFilePreviewUrl, downloadFile as downloadFileUtil, copyToClipboard } from '@/utils/helpers'
import { useFilesStore } from '@/stores/files'
import { ref, onMounted, onUnmounted } from 'vue'
import ImageViewer from './ImageViewer.vue'
import VideoPlayer from './VideoPlayer.vue'

interface FileItem {
  id: number
  filename: string
  original_name: string
  file_type: 'image' | 'video'
  file_size: number
  file_path: string
  thumbnail_path?: string
  folder_id?: number
  mime_type: string
  width?: number
  height?: number
  duration?: number
  created_at: string
  folder_name?: string
}

const props = defineProps<{
  file: FileItem
}>()

const filesStore = useFilesStore()

// 响应式数据
const loading = ref(true)
const isZoomed = ref(false)
const videoElement = ref<HTMLVideoElement>()

// 格式化时长
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '未知'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 图片加载完成
const onImageLoad = () => {
  loading.value = false
}

// 图片加载错误
const onImageError = () => {
  loading.value = false
  ElMessage.error('图片加载失败')
}

// 视频开始加载
const onVideoLoadStart = () => {
}

// 视频元数据加载完成
const onVideoLoaded = () => {
  loading.value = false
}

// 视频加载错误
const onVideoError = () => {
  loading.value = false
  ElMessage.error('视频加载失败')
}

// 处理子组件的加载状态变化
const handleImageLoad = () => {
  loading.value = false
}

const handleImageError = () => {
  loading.value = false
}

const handleVideoLoad = () => {
  loading.value = false
}

const handleVideoError = () => {
  loading.value = false
}

// 视频播放
const onVideoPlay = () => {
}

// 视频暂停
const onVideoPause = () => {
}

// 切换图片缩放
const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
}

// 全屏查看图片
const openFullscreen = () => {
  const img = document.querySelector('.preview-image') as HTMLImageElement
  if (img) {
    if (img.requestFullscreen) {
      img.requestFullscreen()
    } else if ((img as any).webkitRequestFullscreen) {
      (img as any).webkitRequestFullscreen()
    } else if ((img as any).msRequestFullscreen) {
      (img as any).msRequestFullscreen()
    }
  }
}

// 切换视频全屏
const toggleFullscreen = () => {
  const video = videoElement.value
  if (video) {
    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen()
    }
  }
}

// 在新窗口打开
const openInNewWindow = () => {
  const url = getFilePreviewUrl(props.file.id)
  window.open(url, '_blank')
}

// 下载文件
const downloadFile = () => {
  try {
    downloadFileUtil(props.file.id, props.file.original_name)
    ElMessage.success('开始下载文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 复制文件链接
const copyFileUrl = async () => {
  const url = `${window.location.origin}${getFilePreviewUrl(props.file.id)}`
  const success = await copyToClipboard(url)
  
  if (success) {
    ElMessage.success('链接已复制到剪贴板')
  } else {
    ElMessage.error('复制失败')
  }
}

// 删除文件
const deleteFile = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${props.file.original_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await filesStore.deleteFile(props.file.id)
    ElMessage.success('文件删除成功')
    
    // 触发父组件刷新
    emit('file-deleted', props.file.id)
  } catch (error) {
    // 用户取消或删除失败
  }
}

const emit = defineEmits<{
  'file-deleted': [fileId: number]
  'close': []
}>()

// 生命周期
onMounted(() => {
  // 初始化加载状态
  loading.value = true
})

onUnmounted(() => {
  // 清理资源
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.src = ''
  }
})
</script>

<style lang="scss" scoped>
.file-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// 图片预览样式
.image-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
  
  .preview-image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #000;
    overflow: hidden;
    
    .preview-image {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      transition: opacity 0.3s ease;
      
      &.loading {
        opacity: 0.7;
      }
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      backdrop-filter: blur(4px);
      
      .loading-icon {
        font-size: 32px;
        color: #409eff;
        animation: spin 1s linear infinite;
        margin-bottom: 12px;
      }
      
      p {
        font-size: 14px;
        margin: 0;
        font-weight: 500;
      }
    }
  }
  
  .image-info {
    padding: 20px;
    background: white;
    border-top: 1px solid #e4e7ed;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
      word-break: break-all;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .label {
          font-size: 14px;
          color: #909399;
          font-weight: 500;
        }
        
        .value {
          font-size: 14px;
          color: #303133;
          text-align: right;
          word-break: break-all;
        }
      }
    }
  }
}

// 加载状态
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  .loading-icon {
    font-size: 48px;
    color: #409eff;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
    color: #606266;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-preview,
.video-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// 信息面板样式现在由专门的组件处理

.unknown-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  .unknown-icon {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 20px;
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #909399;
  }
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: stretch; // 改为stretch确保所有按钮高度一致
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  
  // 确保按钮之间没有左边距
  .el-button + .el-button {
    margin-left: 0px;
  }
  
  .el-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 10px 16px;
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 40px; // 确保所有按钮高度一致
    flex: 0 0 auto; // 防止按钮被拉伸或压缩
    width: auto; // 让按钮根据内容自动调整宽度
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      }
    }
    
    &.el-button--danger {
      background: rgba(245, 108, 108, 0.1);
      border-color: rgba(245, 108, 108, 0.3);
      color: #f56c6c;
      
      &:hover {
        background: rgba(245, 108, 108, 0.2);
        border-color: #f56c6c;
        color: #f56c6c;
        box-shadow: 0 4px 16px rgba(245, 108, 108, 0.2);
      }
    }
    
    .el-icon {
      font-size: 16px;
      margin-right: 6px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    
    span {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    
    // 确保Element Plus按钮内容居中对齐
    :deep(.el-button__inner) {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      height: 100%;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .image-preview {
    .preview-image-container {
      .preview-image {
        max-width: 90%;
        max-height: 80%;
      }
    }
    
    .image-info {
      padding: 16px;
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .file-preview {
    border-radius: 12px;
    
    .preview-actions {
      flex-direction: column;
      padding: 16px;
      gap: 8px;
      align-items: stretch;
      
      .el-button {
        width: 100%;
        height: 40px;
        font-size: 14px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          margin-right: 4px;
          font-size: 14px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        span {
          font-size: 14px;
          font-weight: 500;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        :deep(.el-button__inner) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  
  .loading-state {
    .loading-icon {
      font-size: 36px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .unknown-preview {
    .unknown-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    h3 {
      font-size: 16px;
      margin-bottom: 6px;
    }
    
    p {
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .file-preview {
    border-radius: 8px;
    
    .preview-actions {
      padding: 12px;
      gap: 6px;
      align-items: stretch;
      
      .el-button {
        height: 36px;
        font-size: 13px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          margin-right: 4px;
          font-size: 13px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        span {
          font-size: 13px;
          font-weight: 500;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        :deep(.el-button__inner) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  
  .loading-state {
    .loading-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 13px;
    }
  }
  
  .unknown-preview {
    .unknown-icon {
      font-size: 40px;
      margin-bottom: 8px;
    }
    
    h3 {
      font-size: 15px;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 12px;
    }
  }
}

@media (max-width: 320px) {
  .file-preview {
    .preview-actions {
      padding: 8px;
      align-items: stretch;
      
      .el-button {
        height: 32px;
        font-size: 12px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          margin-right: 3px;
          font-size: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        span {
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        :deep(.el-button__inner) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>


