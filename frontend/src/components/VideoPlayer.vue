<template>
  <div class="video-player" :class="{ 'fullscreen': isFullscreen }">
    <!-- 视频容器 -->
    <div class="video-container">
      <video
        ref="videoRef"
        :src="videoUrl"
        :poster="posterUrl"
        class="player-video"
        controls
        preload="metadata"
        @loadstart="onLoadStart"
        @loadedmetadata="onLoadedMetadata"
        @canplay="onCanPlay"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @error="onError"
        @timeupdate="onTimeUpdate"
        @volumechange="onVolumeChange"
      >
        您的浏览器不支持视频播放
      </video>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载视频...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="hasError" class="error-overlay">
        <el-icon class="error-icon"><VideoPlay /></el-icon>
        <p>视频加载失败</p>
        <el-button @click="retryLoad">重试</el-button>
      </div>
      
      <!-- 自定义控制栏 -->
      <div v-if="showCustomControls" class="custom-controls">
        <div class="progress-bar">
          <div class="progress-track" @click="seekTo">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
          </div>
        </div>
        
        <div class="controls-bar">
          <div class="controls-left">
            <el-button @click="togglePlay" class="play-button">
              <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
            </el-button>
            
            <div class="time-display">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>
          
          <div class="controls-center">
            <el-slider
              v-model="volume"
              :min="0"
              :max="100"
              :show-tooltip="false"
              class="volume-slider"
              @change="onVolumeChange"
            />
            <el-button @click="toggleMute" class="volume-button">
              <el-icon><Microphone v-if="!isMuted" /><Mute v-else /></el-icon>
            </el-button>
          </div>
          
          <div class="controls-right">
            <el-button @click="toggleFullscreen" class="fullscreen-button">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 视频信息 -->
    <div class="video-info">
      <div class="info-header">
        <h3>{{ videoName }}</h3>
        <el-tag type="primary">视频</el-tag>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <span class="label">文件名:</span>
          <span class="value">{{ videoName }}</span>
        </div>
        <div class="info-item">
          <span class="label">时长:</span>
          <span class="value">{{ formatTime(duration) }}</span>
        </div>
        <div class="info-item">
          <span class="label">文件大小:</span>
          <span class="value">{{ formatFileSize(videoSize) }}</span>
        </div>
        <div class="info-item">
          <span class="label">文件类型:</span>
          <span class="value">{{ mimeType }}</span>
        </div>
        <div class="info-item">
          <span class="label">上传时间:</span>
          <span class="value">{{ formatTime(uploadTime) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="player-actions">
      <el-button type="primary" @click="downloadVideo">
        <el-icon><Download /></el-icon>
        下载视频
      </el-button>
      <el-button @click="openInNewWindow">
        <el-icon><Share /></el-icon>
        在新窗口打开
      </el-button>
      <el-button @click="copyVideoUrl">
        <el-icon><Link /></el-icon>
        复制链接
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  VideoPlay,
  VideoPause,
  FullScreen,
  Download,
  Share,
  Link,
  Microphone,
  Mute
} from '@element-plus/icons-vue'
import { getFilePreviewUrl, downloadFile as downloadFileUtil, copyToClipboard, formatTime, formatFileSize } from '@/utils/helpers'

interface VideoItem {
  id: number
  filename: string
  original_name: string
  file_type: 'video'
  file_size: number
  file_path: string
  thumbnail_path?: string
  mime_type: string
  width?: number
  height?: number
  duration?: number
  created_at: string
}

const props = defineProps<{
  video: VideoItem
  showCustomControls?: boolean
}>()

const emit = defineEmits<{
  close: []
  'video-end': []
  load: []
  error: []
}>()

// 响应式数据
const loading = ref(true)
const hasError = ref(false)
const isFullscreen = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(100)
const progressPercent = ref(0)
const videoRef = ref<HTMLVideoElement>()

// 计算属性
const videoUrl = computed(() => getFilePreviewUrl(props.video.id))
const posterUrl = computed(() => props.video.thumbnail_path ? getFilePreviewUrl(props.video.id) : undefined)
const videoName = computed(() => props.video.original_name)
const videoSize = computed(() => props.video.file_size)
const mimeType = computed(() => props.video.mime_type)
const uploadTime = computed(() => props.video.created_at)

// 方法
const onLoadStart = () => {
  loading.value = true
  hasError.value = false
}

const onLoadedMetadata = () => {
  loading.value = false
  duration.value = videoRef.value?.duration || 0
  emit('load') // 发送加载完成事件
}

const onCanPlay = () => {
  loading.value = false
  emit('load') // 发送加载完成事件
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

const onEnded = () => {
  isPlaying.value = false
  emit('video-end')
}

const onError = () => {
  loading.value = false
  hasError.value = true
  emit('error') // 发送加载错误事件
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    progressPercent.value = (currentTime.value / duration.value) * 100
  }
}

const onVolumeChange = () => {
  if (videoRef.value) {
    videoRef.value.volume = volume.value / 100
    isMuted.value = videoRef.value.muted
  }
}

const retryLoad = () => {
  loading.value = true
  hasError.value = false
  if (videoRef.value) {
    videoRef.value.load()
  }
}

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

const toggleFullscreen = () => {
  if (videoRef.value) {
    if (videoRef.value.requestFullscreen) {
      videoRef.value.requestFullscreen()
    } else if (videoRef.value.webkitRequestFullscreen) {
      videoRef.value.webkitRequestFullscreen()
    } else if (videoRef.value.msRequestFullscreen) {
      videoRef.value.msRequestFullscreen()
    }
  }
}

const seekTo = (event: MouseEvent) => {
  if (videoRef.value && duration.value > 0) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    const newTime = percent * duration.value
    videoRef.value.currentTime = newTime
  }
}

const downloadVideo = () => {
  try {
    downloadFileUtil(props.video.id, props.video.original_name)
    ElMessage.success('开始下载视频')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const openInNewWindow = () => {
  window.open(videoUrl.value, '_blank')
}

const copyVideoUrl = async () => {
  const url = `${window.location.origin}${videoUrl.value}`
  const success = await copyToClipboard(url)
  
  if (success) {
    ElMessage.success('链接已复制到剪贴板')
  } else {
    ElMessage.error('复制失败')
  }
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (!videoRef.value) return
  
  switch (event.key) {
    case ' ':
    case 'Space':
      event.preventDefault()
      togglePlay()
      break
    case 'Escape':
      emit('close')
      break
    case 'ArrowLeft':
      videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10)
      break
    case 'ArrowRight':
      videoRef.value.currentTime = Math.min(duration.value, videoRef.value.currentTime + 10)
      break
    case 'ArrowUp':
      volume.value = Math.min(100, volume.value + 10)
      onVolumeChange()
      break
    case 'ArrowDown':
      volume.value = Math.max(0, volume.value - 10)
      onVolumeChange()
      break
    case 'm':
    case 'M':
      toggleMute()
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
  }
}

// 监听视频变化
watch(() => props.video, () => {
  loading.value = true
  hasError.value = false
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  progressPercent.value = 0
})

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 清理视频资源
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.src = ''
  }
})
</script>

<style lang="scss" scoped>
.video-player {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #000;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
}

.video-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.player-video {
  width: 100%;
  height: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  
  .loading-icon {
    font-size: 48px;
    color: #409eff;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .error-icon {
    font-size: 48px;
    color: #f56c6c;
    margin-bottom: 16px;
  }
  
  p {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
  
  .progress-bar {
    margin-bottom: 16px;
    
    .progress-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      
      .progress-fill {
        height: 100%;
        background: #409eff;
        border-radius: 2px;
        transition: width 0.1s ease;
      }
      
      .progress-handle {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        background: #409eff;
        border-radius: 50%;
        margin-left: -6px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover .progress-handle {
        opacity: 1;
      }
    }
  }
  
  .controls-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    
    .controls-left,
    .controls-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .controls-center {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .volume-slider {
        width: 80px;
      }
    }
    
    .play-button,
    .volume-button,
    .fullscreen-button {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
    
    .time-display {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.video-info {
  padding: 20px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      flex: 1;
      margin-right: 12px;
      word-break: break-all;
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      
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

.player-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #f5f7fa;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .video-info {
    padding: 16px;
    
    .info-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }
  
  .player-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
  
  .custom-controls {
    padding: 12px;
    
    .controls-bar {
      .controls-center {
        .volume-slider {
          width: 60px;
        }
      }
      
      .time-display {
        font-size: 12px;
      }
    }
  }
}
</style>

