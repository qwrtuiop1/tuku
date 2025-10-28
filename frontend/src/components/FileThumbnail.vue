<template>
  <div class="file-thumbnail" :class="{ 'loading': loading, 'error': hasError }">
    <!-- 图片缩略图 -->
    <div v-if="file.file_type === 'image'" class="image-thumbnail">
      <img
        v-if="!hasError"
        :src="thumbnailUrl"
        :alt="file.original_name"
        class="thumbnail-image"
        loading="lazy"
        decoding="async"
        @load="onImageLoad"
        @error="onImageError"
        @click="$emit('click', file)"
      />
      <div v-else class="error-placeholder">
        <el-icon class="error-icon"><Picture /></el-icon>
        <span class="error-text">加载失败</span>
      </div>
      
      <!-- 图片类型标识 -->
      <div class="file-type-badge image-badge">
        <el-icon><Picture /></el-icon>
      </div>
      
      <!-- 加载遮罩 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
      </div>
    </div>
    
    <!-- 视频缩略图 -->
    <div v-else-if="file.file_type === 'video'" class="video-thumbnail">
      <div class="video-poster" @click="$emit('click', file)">
        <img
          v-if="file.thumbnail_path && !hasError"
          :src="thumbnailUrl"
          :alt="file.original_name"
          class="thumbnail-image"
          loading="lazy"
          decoding="async"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div v-else class="video-placeholder">
          <el-icon class="video-icon"><VideoPlay /></el-icon>
        </div>
        
        <!-- 播放按钮 -->
        <div class="play-button">
          <el-icon><VideoPlay /></el-icon>
        </div>
        
        <!-- 视频时长 -->
        <div v-if="file.duration" class="duration-badge">
          {{ formatDuration(file.duration) }}
        </div>
      </div>
      
      <!-- 视频类型标识 -->
      <div class="file-type-badge video-badge">
        <el-icon><VideoPlay /></el-icon>
      </div>
      
      <!-- 加载遮罩 -->
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
      </div>
    </div>
    
    <!-- 未知文件类型 -->
    <div v-else class="unknown-thumbnail" @click="$emit('click', file)">
      <el-icon class="unknown-icon"><Document /></el-icon>
      <div class="file-type-badge unknown-badge">
        <el-icon><Document /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Picture, VideoPlay, Document, Loading } from '@element-plus/icons-vue'
import { getCachedImageUrl } from '@/utils/helpers'

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
}

const props = defineProps<{
  file: FileItem
  size?: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  click: [file: FileItem]
}>()

// 响应式数据
const loading = ref(true)
const hasError = ref(false)
const retryCount = ref(0)
const maxRetries = 2 // 缩略图重试次数较少
const thumbnailUrl = ref<string>('')

// 格式化时长
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 初始化缩略图URL
const initializeThumbnailUrl = async () => {
  try {
    loading.value = true
    hasError.value = false
    retryCount.value = 0
    
    const url = await getCachedImageUrl(props.file.id)
    thumbnailUrl.value = url
    
    // 如果URL设置成功，等待图片加载
    if (url) {
      // 不立即设置loading为false，等待图片的onload事件
      return
    } else {
      loading.value = false
      hasError.value = true
    }
  } catch (error) {
    console.warn('获取缩略图URL失败:', error)
    loading.value = false
    hasError.value = true
  }
}

// 图片加载完成
const onImageLoad = (event: Event) => {
  loading.value = false
  hasError.value = false
  retryCount.value = 0 // 重置重试计数
  
  // 检测图片宽高比并添加相应的数据属性
  const img = event.target as HTMLImageElement
  if (img) {
    const aspectRatio = img.naturalWidth / img.naturalHeight
    
    // 移除之前的宽高比类
    img.removeAttribute('data-aspect-ratio')
    
    // 根据宽高比添加相应的数据属性
    if (aspectRatio > 1.5) {
      img.setAttribute('data-aspect-ratio', 'landscape')
    } else if (aspectRatio < 0.67) {
      img.setAttribute('data-aspect-ratio', 'portrait')
    } else {
      img.setAttribute('data-aspect-ratio', 'square')
    }
  }
}

// 图片加载错误
const onImageError = (event: Event) => {
  retryCount.value++
  
  if (retryCount.value <= maxRetries) {
    // 重试加载
    console.warn(`缩略图加载失败，正在重试 (${retryCount.value}/${maxRetries}):`, props.file.original_name)
    
    setTimeout(() => {
      const img = event.target as HTMLImageElement
      if (img) {
        // 添加时间戳防止缓存，并添加随机参数避免HTTP2问题
        const originalSrc = img.src
        const separator = originalSrc.includes('?') ? '&' : '?'
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(7)
        img.src = originalSrc + separator + `retry=${timestamp}&r=${random}`
      }
    }, 1000 * retryCount.value) // 递增延迟
  } else {
    // 重试次数用完，显示错误
    loading.value = false
    hasError.value = true
    
    // 检查是否是认证问题
    const img = event.target as HTMLImageElement
    if (img && img.src.includes('token=null')) {
      console.error('缩略图加载失败：认证token无效', props.file.original_name)
    } else {
      console.error('缩略图加载失败，重试次数已用完:', props.file.original_name)
    }
  }
}

// 初始化
onMounted(() => {
  // 初始化缩略图URL
  initializeThumbnailUrl()
  
  // 如果没有缩略图，直接显示为加载完成
  if (!props.file.thumbnail_path && props.file.file_type === 'video') {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.file-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.loading {
    .loading-overlay {
      opacity: 1;
    }
  }
  
  &.error {
    .error-placeholder {
      opacity: 1;
    }
  }
}

.image-thumbnail,
.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain; // 改为contain以完整显示长图片
  display: block;
  background: #f5f7fa; // 添加背景色填充空白区域
  min-height: 120px; // 设置最小高度防止空白
  min-width: 120px; // 设置最小宽度防止空白
  
  // 长图片特殊处理
  &[data-aspect-ratio="portrait"] {
    // 竖图：保持宽度填满，高度自适应
    width: 100%;
    height: auto;
    max-height: 100%;
  }
  
  &[data-aspect-ratio="landscape"] {
    // 横图：保持高度填满，宽度自适应
    width: auto;
    height: 100%;
    max-width: 100%;
  }
  
  &[data-aspect-ratio="square"] {
    // 正方形图片：保持原有样式
    width: 100%;
    height: 100%;
  }
  
  // 确保图片在加载时可见
  &:not([src]) {
    display: none;
  }
}

.video-poster {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  
  .video-icon {
    font-size: 48px;
    color: #909399;
  }
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.file-type-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  top: auto;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  background: #000000; // 黑底
  
  &.image-badge {
    background: #000000; // 黑底
  }
  
  &.video-badge {
    background: #000000; // 黑底
  }
  
  &.unknown-badge {
    background: rgba(144, 147, 153, 0.9);
  }
}

.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .error-icon {
    font-size: 32px;
    color: #c0c4cc;
    margin-bottom: 8px;
  }
  
  .error-text {
    font-size: 12px;
    color: #909399;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(245, 247, 250, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  .loading-icon {
    font-size: 24px;
    color: #409eff;
    animation: spin 1s linear infinite;
  }
}

.unknown-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  
  .unknown-icon {
    font-size: 48px;
    color: #c0c4cc;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 尺寸变体
.file-thumbnail {
  &.size-small {
    min-height: 120px;
  }
  
  &.size-medium {
    min-height: 180px;
  }
  
  &.size-large {
    min-height: 240px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .file-thumbnail {
    &:hover {
      transform: none;
    }
  }
  
  .play-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .duration-badge {
    font-size: 11px;
    padding: 1px 4px;
  }
  
  .file-type-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>


















