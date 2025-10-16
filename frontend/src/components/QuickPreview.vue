<template>
  <div class="quick-preview" :class="{ 'visible': isVisible }">
    <!-- 图片快速预览 -->
    <div v-if="file.file_type === 'image'" class="image-quick-preview">
      <img
        :src="getFilePreviewUrl(file.id)"
        :alt="file.original_name"
        class="quick-image"
        @load="onImageLoad"
        @error="onImageError"
      />
      
      <div class="quick-info">
        <div class="file-name">{{ file.original_name }}</div>
        <div class="file-details">
          {{ file.width }} × {{ file.height }} • {{ formatFileSize(file.file_size) }}
        </div>
      </div>
    </div>
    
    <!-- 视频快速预览 -->
    <div v-else-if="file.file_type === 'video'" class="video-quick-preview">
      <div class="video-poster">
        <img
          v-if="file.thumbnail_path"
          :src="getFilePreviewUrl(file.id)"
          :alt="file.original_name"
          class="quick-image"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div v-else class="video-placeholder">
          <el-icon class="video-icon"><VideoPlay /></el-icon>
        </div>
        
        <div class="play-overlay">
          <el-icon class="play-icon"><VideoPlay /></el-icon>
        </div>
        
        <div v-if="file.duration" class="duration-badge">
          {{ formatDuration(file.duration) }}
        </div>
      </div>
      
      <div class="quick-info">
        <div class="file-name">{{ file.original_name }}</div>
        <div class="file-details">
          {{ formatDuration(file.duration) }} • {{ formatFileSize(file.file_size) }}
        </div>
      </div>
    </div>
    
    <!-- 未知文件类型 -->
    <div v-else class="unknown-quick-preview">
      <el-icon class="unknown-icon"><Document /></el-icon>
      <div class="quick-info">
        <div class="file-name">{{ file.original_name }}</div>
        <div class="file-details">{{ formatFileSize(file.file_size) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Picture, VideoPlay, Document } from '@element-plus/icons-vue'
import { getFilePreviewUrl, formatFileSize } from '@/utils/helpers'

interface FileItem {
  id: number
  filename: string
  original_name: string
  file_type: 'image' | 'video'
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
  file: FileItem
  visible?: boolean
}>()

// 响应式数据
const loading = ref(true)
const hasError = ref(false)

// 计算属性
const isVisible = computed(() => props.visible || false)

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
  hasError.value = false
}

// 图片加载错误
const onImageError = () => {
  loading.value = false
  hasError.value = true
}
</script>

<style lang="scss" scoped>
.quick-preview {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
}

.image-quick-preview,
.video-quick-preview {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.quick-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.video-poster {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  
  .video-icon {
    font-size: 24px;
    color: #909399;
  }
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  .play-icon {
    font-size: 16px;
  }
}

.duration-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.quick-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  
  .file-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
    word-break: break-all;
    line-height: 1.2;
  }
  
  .file-details {
    font-size: 12px;
    color: #909399;
    line-height: 1.2;
  }
}

.unknown-quick-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  
  .unknown-icon {
    font-size: 32px;
    color: #c0c4cc;
    flex-shrink: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quick-preview {
    left: -10px;
    right: -10px;
  }
  
  .image-quick-preview,
  .video-quick-preview {
    padding: 8px;
    gap: 8px;
  }
  
  .quick-image,
  .video-poster {
    width: 60px;
    height: 60px;
  }
  
  .play-overlay {
    width: 24px;
    height: 24px;
    
    .play-icon {
      font-size: 12px;
    }
  }
  
  .quick-info {
    .file-name {
      font-size: 12px;
    }
    
    .file-details {
      font-size: 11px;
    }
  }
  
  .unknown-quick-preview {
    padding: 8px;
    gap: 8px;
    
    .unknown-icon {
      font-size: 24px;
    }
  }
}
</style>



