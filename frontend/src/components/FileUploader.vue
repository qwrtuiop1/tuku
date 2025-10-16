<template>
  <div class="file-uploader">
    <!-- 拖拽上传区域 -->
    <div
      ref="dropZoneRef"
      class="drop-zone"
      :class="{ 'is-dragover': isDragOver, 'is-uploading': isUploading }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <div v-if="!isUploading" class="drop-content">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <h3 class="upload-title">拖拽文件到此处上传</h3>
        <p class="upload-subtitle">或点击选择文件</p>
        <div class="upload-tips">
          <span class="tip-item">支持图片和视频文件</span>
          <span class="tip-item">单个文件最大100MB</span>
        </div>
      </div>
      
      <div v-else class="uploading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <h3 class="uploading-title">正在上传文件...</h3>
        <div class="upload-progress">
          <el-progress
            :percentage="uploadProgress"
            :stroke-width="8"
            :show-text="false"
          />
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
      </div>
    </div>
    
    <!-- 文件选择输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*,video/*"
      style="display: none"
      @change="handleFileSelect"
    />
    
    <!-- 上传进度列表 -->
    <div v-if="uploadList.length > 0" class="upload-list">
      <div class="upload-list-header">
        <h4>上传队列</h4>
        <el-button type="text" @click="clearUploadList">清空</el-button>
      </div>
      
      <div class="upload-items">
        <div
          v-for="item in uploadList"
          :key="item.id"
          class="upload-item"
          :class="item.status"
        >
          <div class="item-thumbnail">
            <img
              v-if="item.file.type.startsWith('image/')"
              :src="item.preview"
              :alt="item.file.name"
              class="thumbnail-image"
            />
            <div v-else class="file-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
          </div>
          
          <div class="item-info">
            <div class="item-name">{{ item.file.name }}</div>
            <div class="item-size">{{ formatFileSize(item.file.size) }}</div>
            <div class="item-progress">
              <el-progress
                :percentage="item.progress"
                :stroke-width="4"
                :show-text="false"
              />
            </div>
          </div>
          
          <div class="item-status">
            <el-icon v-if="item.status === 'pending'" class="status-icon"><Clock /></el-icon>
            <el-icon v-else-if="item.status === 'uploading'" class="status-icon uploading"><Loading /></el-icon>
            <el-icon v-else-if="item.status === 'success'" class="status-icon success"><Check /></el-icon>
            <el-icon v-else-if="item.status === 'error'" class="status-icon error"><Close /></el-icon>
          </div>
          
          <div class="item-actions">
            <el-button
              v-if="item.status === 'error'"
              type="text"
              size="small"
              @click="retryUpload(item)"
            >
              重试
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="removeFromList(item.id)"
            >
              移除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 上传统计 -->
    <div v-if="uploadStats.total > 0" class="upload-stats">
      <div class="stats-item">
        <span class="stats-label">总计:</span>
        <span class="stats-value">{{ uploadStats.total }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">成功:</span>
        <span class="stats-value success">{{ uploadStats.success }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">失败:</span>
        <span class="stats-value error">{{ uploadStats.error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  Loading,
  VideoPlay,
  Clock,
  Check,
  Close
} from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'
import { formatFileSize } from '@/utils/helpers'
import api from '@/utils/api'

interface UploadItem {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const emit = defineEmits<{
  'upload-success': []
}>()

const filesStore = useFilesStore()

const dropZoneRef = ref<HTMLElement>()
const fileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadList = ref<UploadItem[]>([])

// 上传统计
const uploadStats = computed(() => {
  const total = uploadList.value.length
  const success = uploadList.value.filter(item => item.status === 'success').length
  const error = uploadList.value.filter(item => item.status === 'error').length
  
  return { total, success, error }
})

// 生成唯一ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 创建文件预览
const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      resolve('')
    }
  })
}

// 验证文件
const validateFile = (file: File): boolean => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
  
  if (file.size > maxSize) {
    ElMessage.error(`文件 ${file.name} 超过100MB限制`)
    return false
  }
  
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error(`不支持的文件类型: ${file.type}`)
    return false
  }
  
  return true
}

// 处理拖拽事件
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  await processFiles(files)
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processFiles(files)
  
  // 清空input值，允许重复选择相同文件
  target.value = ''
}

// 处理文件
const processFiles = async (files: File[]) => {
  if (files.length === 0) return
  
  // 验证文件
  const validFiles = files.filter(validateFile)
  if (validFiles.length === 0) return
  
  // 创建上传项目
  for (const file of validFiles) {
    const preview = await createFilePreview(file)
    const uploadItem: UploadItem = {
      id: generateId(),
      file,
      preview,
      progress: 0,
      status: 'pending'
    }
    uploadList.value.push(uploadItem)
  }
  
  // 开始上传
  await startUpload()
}

// 开始上传
const startUpload = async () => {
  const pendingItems = uploadList.value.filter(item => item.status === 'pending')
  
  for (const item of pendingItems) {
    await uploadSingleFile(item)
  }
  
  // 检查是否所有文件都上传完成
  const allCompleted = uploadList.value.every(item => 
    item.status === 'success' || item.status === 'error'
  )
  
  if (allCompleted) {
    const successCount = uploadStats.value.success
    if (successCount > 0) {
      ElMessage.success(`成功上传 ${successCount} 个文件`)
      emit('upload-success')
    }
  }
}

// 上传单个文件
const uploadSingleFile = async (item: UploadItem) => {
  try {
    item.status = 'uploading'
    isUploading.value = true
    
    const formData = new FormData()
    formData.append('file', item.file)
    
    // 如果有当前文件夹，添加到表单数据
    if (filesStore.currentFolder) {
      formData.append('folder_id', filesStore.currentFolder.toString())
    }
    
    // 直接调用API上传，而不是通过store的uploadFiles方法
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          item.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })
    
    item.status = 'success'
    item.progress = 100
    
    // 上传成功后刷新文件列表
    await filesStore.fetchFiles(1)
    
  } catch (error: any) {
    item.status = 'error'
    item.error = error.response?.data?.message || error.message || '上传失败'
  } finally {
    isUploading.value = false
  }
}

// 重试上传
const retryUpload = async (item: UploadItem) => {
  item.status = 'pending'
  item.progress = 0
  item.error = undefined
  await uploadSingleFile(item)
}

// 从列表中移除
const removeFromList = (id: string) => {
  const index = uploadList.value.findIndex(item => item.id === id)
  if (index > -1) {
    uploadList.value.splice(index, 1)
  }
}

// 清空上传列表
const clearUploadList = () => {
  uploadList.value = []
}
</script>

<style lang="scss" scoped>
.file-uploader {
  .drop-zone {
    border: 2px dashed #e4e7ed;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(102,126,234,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
      opacity: 0.3;
    }
    
    &:hover {
      border-color: #667eea;
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }
    
    &.is-dragover {
      border-color: #667eea;
      background: linear-gradient(135deg, #e6f7ff 0%, #d1ecf1 100%);
      transform: scale(1.02);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
      
      &::before {
        opacity: 0.5;
      }
    }
    
    &.is-uploading {
      border-color: #27ae60;
      background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
    }
  }
  
  .drop-content {
    position: relative;
    z-index: 1;
    
    .upload-icon {
      font-size: 64px;
      color: #667eea;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    .upload-title {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 12px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .upload-subtitle {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .upload-tips {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      
      .tip-item {
        font-size: 13px;
        color: #667eea;
        padding: 8px 16px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 20px;
        font-weight: 500;
        border: 1px solid rgba(102, 126, 234, 0.2);
      }
    }
  }
  
  .uploading-content {
    position: relative;
    z-index: 1;
    
    .loading-icon {
      font-size: 64px;
      color: #27ae60;
      margin-bottom: 20px;
      animation: spin 1s linear infinite;
    }
    
    .uploading-title {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 20px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .upload-progress {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 400px;
      margin: 0 auto;
      
      :deep(.el-progress) {
        flex: 1;
        
        .el-progress-bar__outer {
          border-radius: 10px;
          background: rgba(102, 126, 234, 0.1);
        }
        
        .el-progress-bar__inner {
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
      }
      
      .progress-text {
        font-size: 16px;
        font-weight: 700;
        color: #27ae60;
        min-width: 50px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.upload-list {
  margin-top: 32px;
  
  .upload-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    border: 1px solid #e9ecef;
    
    h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    :deep(.el-button) {
      color: #667eea;
      font-weight: 600;
      
      &:hover {
        color: #764ba2;
      }
    }
  }
  
  .upload-items {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
  
  .upload-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #e9ecef;
      transition: all 0.3s ease;
    }
    
    &:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.success {
      background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
      border-color: #27ae60;
      
      &::before {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
      }
    }
    
    &.error {
      background: linear-gradient(135deg, #fef0f0 0%, #ffe8e8 100%);
      border-color: #e74c3c;
      
      &::before {
        background: linear-gradient(135deg, #e74c3c, #ff6b6b);
      }
    }
    
    &.uploading {
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
      border-color: #667eea;
      
      &::before {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
    }
    
    .item-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
      
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
        color: #ffffff;
        font-size: 20px;
      }
    }
    
    .item-info {
      flex: 1;
      min-width: 0;
      
      .item-name {
        font-size: 15px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .item-size {
        font-size: 13px;
        color: #7f8c8d;
        margin-bottom: 10px;
        font-weight: 500;
      }
      
      .item-progress {
        width: 100%;
        
        :deep(.el-progress) {
          .el-progress-bar__outer {
            border-radius: 6px;
            background: rgba(102, 126, 234, 0.1);
          }
          
          .el-progress-bar__inner {
            border-radius: 6px;
            background: linear-gradient(135deg, #667eea, #764ba2);
          }
        }
      }
    }
    
    .item-status {
      .status-icon {
        font-size: 24px;
        
        &.success {
          color: #27ae60;
          animation: pulse 2s ease-in-out infinite;
        }
        
        &.error {
          color: #e74c3c;
        }
        
        &.uploading {
          color: #667eea;
          animation: spin 1s linear infinite;
        }
      }
    }
    
    .item-actions {
      display: flex;
      gap: 8px;
      
      :deep(.el-button) {
        font-weight: 600;
        border-radius: 8px;
        
        &.el-button--text {
          color: #667eea;
          
          &:hover {
            color: #764ba2;
            background: rgba(102, 126, 234, 0.1);
          }
        }
      }
    }
  }
}

.upload-stats {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .stats-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .stats-icon {
      font-size: 20px;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.success {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: #ffffff;
      }
      
      &.error {
        background: linear-gradient(135deg, #e74c3c, #ff6b6b);
        color: #ffffff;
      }
      
      &.pending {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: #ffffff;
      }
    }
    
    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .stats-label {
        font-size: 13px;
        color: #7f8c8d;
        font-weight: 500;
      }
      
      .stats-value {
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        
        &.success {
          color: #27ae60;
        }
        
        &.error {
          color: #e74c3c;
        }
        
        &.pending {
          color: #667eea;
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .file-uploader {
    .drop-zone {
      padding: 40px 20px;
      border-radius: 12px;
      
      .drop-content {
        .upload-icon {
          font-size: 48px;
        }
        
        .upload-title {
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .upload-subtitle {
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .upload-tips {
          flex-direction: column;
          gap: 8px;
          
          .tip-item {
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 6px;
          }
        }
      }
      
      .uploading-content {
        .loading-icon {
          font-size: 40px;
        }
        
        .uploading-title {
          font-size: 16px;
        }
        
        .upload-progress {
          max-width: 300px;
          margin-top: 16px;
          
          .progress-text {
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .upload-list {
    .upload-list-header {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
    
    .upload-item {
      flex-direction: column;
      gap: 12px;
      text-align: center;
      
      .item-thumbnail {
        width: 60px;
        height: 60px;
      }
      
      .item-info {
        width: 100%;
      }
      
      .item-status {
        order: -1;
      }
    }
  }
  
  .upload-stats {
    flex-direction: column;
    gap: 16px;
    
    .stats-item {
      justify-content: center;
    }
  }
}

@media (max-width: 480px) {
  .file-uploader {
    .drop-zone {
      padding: 30px 16px;
      
      .drop-content {
        .upload-icon {
          font-size: 40px;
        }
        
        .upload-title {
          font-size: 18px;
        }
        
        .upload-subtitle {
          font-size: 13px;
        }
      }
      
      .uploading-content {
        .loading-icon {
          font-size: 40px;
        }
        
        .uploading-title {
          font-size: 18px;
        }
      }
    }
  }
  
  .upload-list {
    .upload-item {
      padding: 12px;
      
      .item-thumbnail {
        width: 50px;
        height: 50px;
      }
    }
  }
  
  .upload-stats {
    padding: 16px;
    
    .stats-item {
      padding: 10px 12px;
      
      .stats-icon {
        width: 35px;
        height: 35px;
        font-size: 18px;
      }
      
      .stats-content {
        .stats-value {
          font-size: 16px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .drop-zone {
    padding: 30px 16px;
  }
  
  .upload-tips {
    flex-direction: column;
    gap: 8px;
  }
  
  .upload-stats {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .file-uploader {
    .drop-zone {
      padding: 30px 16px;
      border-radius: 10px;
      
      .drop-content {
        .upload-icon {
          font-size: 40px;
        }
        
        .upload-title {
          font-size: 16px;
          margin-bottom: 6px;
        }
        
        .upload-subtitle {
          font-size: 13px;
          margin-bottom: 12px;
        }
        
        .upload-tips {
          gap: 6px;
          
          .tip-item {
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 4px;
          }
        }
      }
      
      .uploading-content {
        .loading-icon {
          font-size: 32px;
        }
        
        .uploading-title {
          font-size: 14px;
        }
        
        .upload-progress {
          max-width: 250px;
          margin-top: 12px;
          
          .progress-text {
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media (max-width: 320px) {
  .file-uploader {
    .drop-zone {
      padding: 20px 12px;
      border-radius: 8px;
      
      .drop-content {
        .upload-icon {
          font-size: 32px;
        }
        
        .upload-title {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .upload-subtitle {
          font-size: 12px;
          margin-bottom: 8px;
        }
        
        .upload-tips {
          gap: 4px;
          
          .tip-item {
            font-size: 10px;
            padding: 3px 6px;
            border-radius: 3px;
          }
        }
      }
      
      .uploading-content {
        .loading-icon {
          font-size: 28px;
        }
        
        .uploading-title {
          font-size: 13px;
        }
        
        .upload-progress {
          max-width: 200px;
          margin-top: 8px;
          
          .progress-text {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
