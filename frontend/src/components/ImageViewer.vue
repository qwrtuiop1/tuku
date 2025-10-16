<template>
  <div class="image-viewer" :class="{ 'fullscreen': isFullscreen }">
    <!-- 图片容器 -->
    <div class="image-container" @click="handleContainerClick">
      <img
        ref="imageRef"
        :src="imageUrl"
        :alt="imageName"
        class="viewer-image"
        :class="{ 
          'zoom-in': isZoomed,
          'panning': isPanning
        }"
        :style="imageStyle"
        @load="onImageLoad"
        @error="onImageError"
        @mousedown="startPan"
        @mousemove="handlePan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @wheel="handleWheel"
      />
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载图片...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="hasError" class="error-overlay">
        <el-icon class="error-icon"><Picture /></el-icon>
        <p>图片加载失败</p>
        <el-button @click="retryLoad">重试</el-button>
      </div>
    </div>
    
    <!-- 工具栏 -->
    <div class="viewer-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-tooltip content="放大" placement="top">
            <el-button @click="zoomIn" :disabled="zoomLevel >= maxZoom">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="缩小" placement="top">
            <el-button @click="zoomOut" :disabled="zoomLevel <= minZoom">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="适应窗口" placement="top">
            <el-button @click="fitToWindow">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="实际大小" placement="top">
            <el-button @click="actualSize">
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
      
      <div class="toolbar-center">
        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        <span class="image-info">{{ imageName }}</span>
      </div>
      
      <div class="toolbar-right">
        <el-button-group>
          <el-tooltip content="全屏" placement="top">
            <el-button @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="在新窗口打开" placement="top">
            <el-button @click="openInNewWindow">
              <el-icon><Share /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下载" placement="top">
            <el-button @click="downloadImage">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
    
    <!-- 导航按钮 -->
    <div v-if="hasMultipleImages" class="navigation-buttons">
      <el-button 
        class="nav-button prev" 
        @click="previousImage"
        :disabled="currentIndex === 0"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <el-button 
        class="nav-button next" 
        @click="nextImage"
        :disabled="currentIndex === images.length - 1"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Picture,
  ZoomIn,
  ZoomOut,
  FullScreen,
  View,
  Share,
  Download,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { getFilePreviewUrl, downloadFile as downloadFileUtil } from '@/utils/helpers'

interface ImageItem {
  id: number
  filename: string
  original_name: string
  file_type: 'image'
  file_size: number
  file_path: string
  thumbnail_path?: string
  mime_type: string
  width?: number
  height?: number
  created_at: string
}

const props = defineProps<{
  image: ImageItem
  images?: ImageItem[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  close: []
  'image-change': [image: ImageItem, index: number]
  load: []
  error: []
}>()

// 响应式数据
const loading = ref(true)
const hasError = ref(false)
const isFullscreen = ref(false)
const isZoomed = ref(false)
const isPanning = ref(false)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const lastPanX = ref(0)
const lastPanY = ref(0)
const imageRef = ref<HTMLImageElement>()

// 常量
const minZoom = 0.1
const maxZoom = 5
const zoomStep = 0.1

// 计算属性
const imageUrl = computed(() => getFilePreviewUrl(props.image.id))
const imageName = computed(() => props.image.original_name)
const hasMultipleImages = computed(() => props.images && props.images.length > 1)
const currentIndex = computed(() => {
  if (!props.images) return 0
  return props.images.findIndex(img => img.id === props.image.id)
})

const imageStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoomLevel.value})`,
  cursor: isPanning.value ? 'grabbing' : (zoomLevel.value > 1 ? 'grab' : 'default')
}))

// 方法
const onImageLoad = () => {
  loading.value = false
  hasError.value = false
  resetView()
  emit('load') // 发送加载完成事件
}

const onImageError = () => {
  loading.value = false
  hasError.value = true
  emit('error') // 发送加载错误事件
}

const retryLoad = () => {
  loading.value = true
  hasError.value = false
  if (imageRef.value) {
    imageRef.value.src = imageUrl.value + '?t=' + Date.now()
  }
}

const resetView = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
  isZoomed.value = false
}

const zoomIn = () => {
  if (zoomLevel.value < maxZoom) {
    zoomLevel.value = Math.min(zoomLevel.value + zoomStep, maxZoom)
    isZoomed.value = zoomLevel.value > 1
  }
}

const zoomOut = () => {
  if (zoomLevel.value > minZoom) {
    zoomLevel.value = Math.max(zoomLevel.value - zoomStep, minZoom)
    isZoomed.value = zoomLevel.value > 1
    if (zoomLevel.value === 1) {
      panX.value = 0
      panY.value = 0
    }
  }
}

const fitToWindow = () => {
  resetView()
  // 计算适合窗口的缩放比例
  if (imageRef.value && props.image.width && props.image.height) {
    const container = imageRef.value.parentElement
    if (container) {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const scaleX = containerWidth / props.image.width
      const scaleY = containerHeight / props.image.height
      zoomLevel.value = Math.min(scaleX, scaleY, 1)
    }
  }
}

const actualSize = () => {
  resetView()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const openInNewWindow = () => {
  window.open(imageUrl.value, '_blank')
}

const downloadImage = () => {
  try {
    downloadFileUtil(props.image.id, props.image.original_name)
    ElMessage.success('开始下载图片')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleContainerClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const startPan = (event: MouseEvent) => {
  if (zoomLevel.value > 1) {
    isPanning.value = true
    lastPanX.value = event.clientX
    lastPanY.value = event.clientY
    event.preventDefault()
  }
}

const handlePan = (event: MouseEvent) => {
  if (isPanning.value) {
    const deltaX = event.clientX - lastPanX.value
    const deltaY = event.clientY - lastPanY.value
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastPanX.value = event.clientX
    lastPanY.value = event.clientY
  }
}

const endPan = () => {
  isPanning.value = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -zoomStep : zoomStep
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta))
  
  if (newZoom !== zoomLevel.value) {
    zoomLevel.value = newZoom
    isZoomed.value = zoomLevel.value > 1
  }
}

const previousImage = () => {
  if (props.images && currentIndex.value > 0) {
    const prevImage = props.images[currentIndex.value - 1]
    emit('image-change', prevImage, currentIndex.value - 1)
  }
}

const nextImage = () => {
  if (props.images && currentIndex.value < props.images.length - 1) {
    const nextImage = props.images[currentIndex.value + 1]
    emit('image-change', nextImage, currentIndex.value + 1)
  }
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      emit('close')
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      fitToWindow()
      break
    case 'ArrowLeft':
      if (hasMultipleImages.value) previousImage()
      break
    case 'ArrowRight':
      if (hasMultipleImages.value) nextImage()
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
  }
}

// 监听图片变化
watch(() => props.image, () => {
  loading.value = true
  hasError.value = false
  resetView()
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
})
</script>

<style lang="scss" scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  
  &.fullscreen {
    background: #000;
  }
}

.image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: default;
}

.viewer-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  transition: transform 0.3s ease;
  user-select: none;
  
  &.zoom-in {
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
  }
  
  &.panning {
    cursor: grabbing;
  }
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

.viewer-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
  }
  
  .toolbar-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .zoom-level {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .image-info {
      font-size: 12px;
      color: #ccc;
      max-width: 300px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  
  .el-button {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}

.navigation-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
  
  .nav-button {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #d1d5db;
    color: #374151;
    pointer-events: auto;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #9ca3af;
      color: #1f2937;
    }
    
    &:disabled {
      background: #f9fafb;
      border-color: #e5e7eb;
      color: #9ca3af;
      opacity: 0.6;
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .viewer-toolbar {
    height: 50px;
    padding: 0 12px;
    
    .toolbar-center {
      .image-info {
        max-width: 200px;
        font-size: 11px;
      }
    }
    
    .el-button {
      padding: 6px;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
  
  .navigation-buttons {
    .nav-button {
      width: 36px;
      height: 36px;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
  
  .viewer-image {
    max-width: 95vw;
    max-height: 70vh;
  }
}
</style>



