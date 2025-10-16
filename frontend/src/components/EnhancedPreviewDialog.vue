<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    :close-on-click-modal="true"
    :show-close="true"
    class="enhanced-preview-dialog"
    @close="handleClose"
  >
    <!-- 文件导航栏 -->
    <div v-if="hasMultipleFiles" class="file-navigation">
      <el-button 
        @click="previousFile" 
        :disabled="currentIndex === 0"
        size="small"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一个
      </el-button>
      
      <div class="file-counter">
        <span class="current-number">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total-number">{{ files.length }}</span>
      </div>
      
      <el-button 
        @click="nextFile" 
        :disabled="currentIndex === files.length - 1"
        size="small"
      >
        下一个
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    
    <!-- 预览内容 -->
    <div class="preview-content">
      <FilePreview 
        v-if="currentFile"
        :file="currentFile"
        @file-deleted="handleFileDeleted"
        @close="handleClose"
      />
    </div>
    
    <!-- 底部操作栏 -->
    <div class="preview-footer">
      <div class="file-info">
        <span class="file-name">{{ currentFile?.original_name }}</span>
        <span class="file-size">{{ formatFileSize(currentFile?.file_size || 0) }}</span>
      </div>
      
      <div class="footer-actions">
        <el-button @click="downloadCurrentFile">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
        <el-button @click="shareCurrentFile">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button @click="openInNewWindow">
          <el-icon><Link /></el-icon>
          新窗口
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Download, Share, Link } from '@element-plus/icons-vue'
import FilePreview from './FilePreview.vue'
import { formatFileSize, getFilePreviewUrl, downloadFile as downloadFileUtil } from '@/utils/helpers'

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
  modelValue: boolean
  file?: FileItem
  files?: FileItem[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'file-deleted': [fileId: number]
  'file-change': [file: FileItem, index: number]
}>()

// 响应式数据
const currentIndex = ref(0)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const files = computed(() => {
  if (props.files && props.files.length > 0) {
    return props.files
  }
  return props.file ? [props.file] : []
})

const currentFile = computed(() => {
  const file = files.value[currentIndex.value] || null
  return file
})

const hasMultipleFiles = computed(() => files.value.length > 1)

const dialogTitle = computed(() => {
  return '文件预览'
})

// 方法
const handleClose = () => {
  visible.value = false
}

const previousFile = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('file-change', currentFile.value, currentIndex.value)
  }
}

const nextFile = () => {
  if (currentIndex.value < files.value.length - 1) {
    currentIndex.value++
    emit('file-change', currentFile.value, currentIndex.value)
  }
}

const downloadCurrentFile = () => {
  if (currentFile.value) {
    try {
      downloadFileUtil(currentFile.value.id, currentFile.value.original_name)
      ElMessage.success('开始下载文件')
    } catch (error) {
      ElMessage.error('下载失败')
    }
  }
}

const shareCurrentFile = () => {
  if (currentFile.value) {
    const url = `${window.location.origin}${getFilePreviewUrl(currentFile.value.id)}`
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  }
}

const openInNewWindow = () => {
  if (currentFile.value) {
    const url = getFilePreviewUrl(currentFile.value.id)
    window.open(url, '_blank')
  }
}

const handleFileDeleted = (fileId: number) => {
  emit('file-deleted', fileId)
  
  // 如果删除的是当前文件，切换到下一个文件
  if (currentFile.value?.id === fileId) {
    if (files.value.length > 1) {
      if (currentIndex.value < files.value.length - 1) {
        // 切换到下一个文件
        nextFile()
      } else if (currentIndex.value > 0) {
        // 切换到上一个文件
        previousFile()
      } else {
        // 没有其他文件，关闭对话框
        handleClose()
      }
    } else {
      // 只有一个文件，关闭对话框
      handleClose()
    }
  }
}

// 监听初始索引变化
watch(() => props.initialIndex, (newIndex) => {
  if (newIndex !== undefined && newIndex >= 0 && newIndex < files.value.length) {
    currentIndex.value = newIndex
  }
}, { immediate: true })

// 监听文件变化
watch(() => props.file, (newFile) => {
  if (newFile && files.value.length > 0) {
    const index = files.value.findIndex(f => f.id === newFile.id)
    if (index !== -1) {
      currentIndex.value = index
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.enhanced-preview-dialog {
  :deep(.el-dialog) {
    height: 90vh;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(228, 231, 237, 0.6);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
    backdrop-filter: blur(8px);
    border-radius: 16px 16px 0 0;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .el-dialog__headerbtn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(245, 108, 108, 0.1);
        border-color: #f56c6c;
        transform: scale(1.05);
        
        .el-icon {
          color: #f56c6c;
        }
      }
      
      .el-icon {
        font-size: 18px;
        color: #606266;
        transition: all 0.3s ease;
      }
    }
  }
  
  :deep(.el-dialog__body) {
    flex: 1;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: transparent;
  }
  
  :deep(.el-dialog__footer) {
    display: none;
  }
}

.file-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: transparent;
  border-bottom: 1px solid #e9ecef;
  
  .el-button {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
    transition: all 0.2s ease;
    background: transparent;
    border: 1px solid #d1d5db;
    height: 28px;
    min-width: 60px;
    
    &:hover:not(.is-disabled) {
      background: #f3f4f6;
      border-color: #9ca3af;
      color: #374151;
    }
    
    &.is-disabled {
      background: transparent;
      border-color: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
    }
    
    .el-icon {
      font-size: 12px;
      margin: 0 1px;
    }
  }
  
  .file-counter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    background: transparent;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 8px;
    height: 28px;
    min-width: 60px;
    
    .current-number {
      color: #1f2937;
      font-weight: 600;
    }
    
    .separator {
      color: #6b7280;
      margin: 0 1px;
    }
    
    .total-number {
      color: #4b5563;
    }
  }
}

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-top: 1px solid rgba(228, 231, 237, 0.6);
  backdrop-filter: blur(8px);
  
  .file-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
    
    .file-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      max-width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .file-size {
      font-size: 13px;
      color: #909399;
      font-weight: 500;
    }
  }
  
  .footer-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    
    .el-button {
      padding: 10px 16px;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
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
      
      .el-icon {
        font-size: 16px;
        margin-right: 6px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-preview-dialog {
    :deep(.el-dialog) {
      width: 95%;
      height: 95vh;
      max-height: 95vh;
      border-radius: 12px;
    }
    
    :deep(.el-dialog__header) {
      padding: 16px 20px;
      border-radius: 12px 12px 0 0;
      
      .el-dialog__title {
        font-size: 16px;
      }
      
      .el-dialog__headerbtn {
        width: 36px;
        height: 36px;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
  
  .file-navigation {
    padding: 12px 20px;
    
    .el-button {
      padding: 6px 12px;
      font-size: 13px;
      border-radius: 10px;
      
      .el-icon {
        font-size: 14px;
        margin: 0 3px;
      }
    }
    
    .file-counter {
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 10px;
      gap: 3px;
      
      .current-number {
        font-size: 16px;
      }
      
      .separator {
        margin: 0 1px;
      }
      
      .counter-label {
        font-size: 12px;
        margin-left: 2px;
      }
    }
  }
  
  .preview-footer {
    padding: 12px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .file-info {
      text-align: center;
      
      .file-name {
        font-size: 15px;
        max-width: 100%;
      }
      
      .file-size {
        font-size: 12px;
      }
    }
    
    .footer-actions {
      justify-content: center;
      gap: 8px;
      
      .el-button {
        flex: 1;
        padding: 8px 12px;
        font-size: 13px;
        border-radius: 10px;
        
        .el-icon {
          font-size: 14px;
          margin-right: 4px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .enhanced-preview-dialog {
    :deep(.el-dialog) {
      width: 98%;
      height: 98vh;
      max-height: 98vh;
      border-radius: 8px;
    }
    
    :deep(.el-dialog__header) {
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
      
      .el-dialog__title {
        font-size: 15px;
      }
      
      .el-dialog__headerbtn {
        width: 32px;
        height: 32px;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
  
  .file-navigation {
    padding: 10px 16px;
    
    .el-button {
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 8px;
      
      .el-icon {
        font-size: 12px;
        margin: 0 2px;
      }
    }
    
    .file-counter {
      font-size: 13px;
      padding: 5px 10px;
      border-radius: 8px;
      gap: 2px;
      
      .current-number {
        font-size: 15px;
      }
      
      .separator {
        margin: 0 1px;
      }
      
      .counter-label {
        font-size: 11px;
        margin-left: 2px;
      }
    }
  }
  
  .preview-footer {
    padding: 10px 16px;
    gap: 12px;
    
    .file-info {
      .file-name {
        font-size: 14px;
      }
      
      .file-size {
        font-size: 11px;
      }
    }
    
    .footer-actions {
      gap: 6px;
      
      .el-button {
        padding: 6px 10px;
        font-size: 12px;
        border-radius: 8px;
        
        .el-icon {
          font-size: 12px;
          margin-right: 3px;
        }
      }
    }
  }
}

@media (max-width: 320px) {
  .enhanced-preview-dialog {
    :deep(.el-dialog) {
      width: 100%;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }
    
    :deep(.el-dialog__header) {
      padding: 10px 12px;
      border-radius: 0;
      
      .el-dialog__title {
        font-size: 14px;
      }
      
      .el-dialog__headerbtn {
        width: 28px;
        height: 28px;
        
        .el-icon {
          font-size: 12px;
        }
      }
    }
  }
  
  .file-navigation {
    padding: 8px 12px;
    
    .el-button {
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 6px;
      
      .el-icon {
        font-size: 10px;
        margin: 0 1px;
      }
    }
    
    .file-counter {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
      gap: 1px;
      
      .current-number {
        font-size: 14px;
      }
      
      .separator {
        margin: 0 1px;
      }
      
      .counter-label {
        font-size: 10px;
        margin-left: 1px;
      }
    }
  }
  
  .preview-footer {
    padding: 8px 12px;
    gap: 10px;
    
    .file-info {
      .file-name {
        font-size: 13px;
      }
      
      .file-size {
        font-size: 10px;
      }
    }
    
    .footer-actions {
      gap: 4px;
      
      .el-button {
        padding: 5px 8px;
        font-size: 11px;
        border-radius: 6px;
        
        .el-icon {
          font-size: 10px;
          margin-right: 2px;
        }
      }
    }
  }
}
</style>



