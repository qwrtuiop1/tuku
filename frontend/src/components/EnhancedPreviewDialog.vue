<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    :append-to-body="true"
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
    
    <!-- 预览内容 + 详情 -->
    <div class="preview-layout">
      <div class="preview-content" ref="previewContainer">
        <FilePreview 
          v-if="currentFile"
          :key="currentFile?.id || currentIndex"
          :file="currentFile"
          @file-deleted="handleFileDeleted"
          @close="handleClose"
        />
      </div>
      <aside class="details-panel" v-if="currentFile">
        <div class="details-header">
          <div class="details-title">文件详情</div>
          <div class="details-type" :class="currentFile.file_type">{{ currentFile.file_type === 'image' ? '图片' : '视频' }}</div>
        </div>
        <div class="details-list">
          <div class="detail-item">
            <span class="label">名称</span>
            <span class="value" :title="currentFile.original_name">{{ currentFile.original_name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">大小</span>
            <span class="value">{{ formatFileSize(currentFile.file_size || 0) }}</span>
          </div>
          <div class="detail-item" v-if="currentFile.mime_type">
            <span class="label">类型</span>
            <span class="value">{{ currentFile.mime_type }}</span>
          </div>
          <div class="detail-item" v-if="currentFile.file_type==='image' && (currentFile.width || currentFile.height)">
            <span class="label">分辨率</span>
            <span class="value">{{ (currentFile.width||'?') + ' × ' + (currentFile.height||'?') }}</span>
          </div>
          <div class="detail-item" v-if="currentFile.file_type==='video' && currentFile.duration">
            <span class="label">时长</span>
            <span class="value">{{ currentFile.duration }}s</span>
          </div>
          <div class="detail-item" v-if="currentFile.created_at">
            <span class="label">创建时间</span>
            <span class="value">{{ new Date(currentFile.created_at).toLocaleString() }}</span>
          </div>
        </div>
        <div class="details-actions">
          <div class="action-item">
            <el-button @click="downloadCurrentFile" class="gray-btn">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </div>
          <div class="action-item" v-if="systemStore.sharingEnabled">
            <el-button @click="shareCurrentFile" class="gray-btn" :loading="reviewCreating">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
          <div class="action-item">
            <el-button @click="toggleFullscreen" class="gray-btn">
              <el-icon><FullScreen /></el-icon>
              全屏
            </el-button>
          </div>
        </div>
        <div v-if="reviewStatus" class="review-status">
          <div class="row"><span class="label">审核状态</span><span class="value" :class="reviewStatus.status">{{ reviewStatusText }}</span></div>
          <el-progress :percentage="reviewStatus.review_progress || 0" :stroke-width="8" :show-text="true" />
          <div v-if="reviewStatus.review_reason" class="reason">{{ reviewStatus.review_reason }}</div>
          <div v-if="publicShareUrl" class="public-url">{{ publicShareUrl }}</div>
        </div>
      </aside>
    </div>
    
    <!-- 底部信息栏已移除，统一在详情面板展示 -->
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Download, Share, FullScreen } from '@element-plus/icons-vue'
import FilePreview from './FilePreview.vue'
import { formatFileSize, getFilePreviewUrl, downloadFile as downloadFileUtil } from '@/utils/helpers'
import { useSystemStore } from '@/stores/system'
import api from '@/utils/api'

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

// 审核/分享状态
const reviewId = ref<number | null>(null)
const reviewStatus = ref<{ status: string, review_progress: number, review_reason?: string } | null>(null)
const reviewCreating = ref(false)
const publicShareUrl = ref('')
let reviewPoller: any = null
const reviewStatusText = computed(() => {
  if (!reviewStatus.value) return ''
  const s = reviewStatus.value.status
  return s === 'pending_review' ? '审核中' : s === 'approved' ? '已通过' : s === 'rejected' ? '未通过' : s
})

const hasMultipleFiles = computed(() => files.value.length > 1)

const dialogTitle = computed(() => {
  return '文件预览'
})

// 系统设置（分享状态）
const systemStore = useSystemStore()
onMounted(() => { if (!systemStore.loaded) systemStore.loadShareStatus() })

// 方法
const previewContainer = ref<HTMLElement | null>(null)

const toggleFullscreen = () => {
  const el: any = previewContainer.value || document.documentElement
  const isFs: any = (document as any).fullscreenElement || (document as any).webkitFullscreenElement
  if (!isFs) {
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    if (rfs) rfs.call(el)
  } else {
    const exit = (document as any).exitFullscreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen
    if (exit) exit.call(document)
  }
}
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

const shareCurrentFile = async () => {
  if (!currentFile.value) return
  if (!systemStore.sharingEnabled) {
    ElMessage.error('分享功能已关闭')
    return
  }
  try {
    reviewCreating.value = true
    reviewStatus.value = null
    publicShareUrl.value = ''
    // 先发起审核，不立刻拿公开链接
    console.log('[share-debug] submit review', {
      file_id: currentFile.value.id,
      allowPreview: true,
      allowDownload: true
    })
    const { data } = await api.post('/share/review', {
      file_id: currentFile.value.id,
      allowPreview: true,
      allowDownload: true,
      expireInHours: null
    })
    console.log('[share-debug] review created', data)
    if (data && data.success && data.review_id) {
      reviewId.value = data.review_id
      startReviewPolling()
      ElMessage.success('已提交审核，请稍候...')
    } else {
      ElMessage.error('提交审核失败')
    }
  } catch (e:any) {
    ElMessage.error(e?.response?.data?.message || '提交审核失败')
  } finally {
    reviewCreating.value = false
  }
}

function startReviewPolling() {
  if (!reviewId.value) return
  stopReviewPolling()
  reviewPoller = setInterval(async () => {
    try {
      const { data } = await api.get(`/share/review/${reviewId.value}/status`)
      console.log('[share-debug] review status', data)
      if (Array.isArray(data.debug) && data.debug.length) {
        data.debug.forEach((e:any) => console.log('[share-debug] step', e))
      }
      reviewStatus.value = { status: data.status, review_progress: data.review_progress || 0, review_reason: data.review_reason }
      if (data.status === 'approved' && data.share_token) {
        publicShareUrl.value = `${window.location.origin}/share/${data.share_token}`
        stopReviewPolling()
        try { await navigator.clipboard.writeText(publicShareUrl.value); ElMessage.success('审核通过，公开链接已复制') } catch { ElMessage.success('审核通过，请复制公开链接') }
      } else if (data.status === 'rejected') {
        stopReviewPolling()
        ElMessage.error(data.review_reason || '审核未通过')
      }
    } catch (_) {}
  }, 1000)
}
function stopReviewPolling() { if (reviewPoller) { clearInterval(reviewPoller); reviewPoller = null } }
watch(visible, (v) => { if (!v) stopReviewPolling() })


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

.preview-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  height: 100%;
}

.details-panel {
  border-left: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  min-width: 280px;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #ececec;
  background: #ffffff;
}

.details-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.details-type {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.details-list {
  padding: 12px 16px;
  display: grid;
  grid-auto-rows: minmax(20px, auto);
  gap: 10px;
}

.detail-item {
  display: grid;
  grid-template-columns: 84px 1fr;
  align-items: center;
}

.detail-item .label {
  font-size: 12px;
  color: #6b7280;
}

.detail-item .value {
  font-size: 12px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details-actions {
  margin-top: auto;
  padding: 12px 16px;
  border-top: 1px solid #ececec;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  
  /* 统一按钮尺寸与宽度 */
  :deep(.el-button) {
    width: 100%;
    height: 36px;
    border-radius: 8px;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  :deep(.el-button .el-icon) {
    font-size: 14px;
    margin-right: 6px;
  }
}

.gray-btn {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.gray-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
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
  
}

.review-status { margin-top: 10px; }
.review-status .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
.review-status .value.pending_review { color: #8a8a8a; }
.review-status .value.approved { color: #16a34a; }
.review-status .value.rejected { color: #dc2626; }
.public-url { margin-top: 6px; font-size: 12px; color: #111; word-break: break-all; }

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
    
    /* 精简后无操作按钮 */
  }
}

// 平板端响应式 (≤1024px)
@media (max-width: 1024px) {
  .preview-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  
  .details-panel {
    border-left: none;
    border-top: 1px solid #e5e7eb;
    min-width: unset;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .details-header {
    padding: 12px 20px;
  }
  
  .details-title {
    font-size: 13px;
  }
  
  .details-type {
    font-size: 11px;
  }
  
  .details-list {
    padding: 10px 20px;
    gap: 8px;
  }
  
  .detail-item {
    grid-template-columns: 80px 1fr;
  }
  
  .detail-item .label {
    font-size: 11px;
  }
  
  .detail-item .value {
    font-size: 11px;
  }
  
  .details-actions {
    padding: 10px 20px;
    gap: 8px;
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr; /* 保底 */
    
    :deep(.el-button) {
      height: 34px;
      font-size: 13px;
    }
    
    :deep(.el-button .el-icon) {
      font-size: 13px;
      margin-right: 5px;
    }
  }
}

// 小屏幕手机端响应式 (≤480px)
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
  
  .details-panel {
    max-height: 250px;
  }
  
  .details-header {
    padding: 10px 16px;
  }
  
  .details-title {
    font-size: 12px;
  }
  
  .details-type {
    font-size: 10px;
  }
  
  .details-list {
    padding: 8px 16px;
    gap: 6px;
  }
  
  .detail-item {
    grid-template-columns: 70px 1fr;
  }
  
  .detail-item .label {
    font-size: 10px;
  }
  
  .detail-item .value {
    font-size: 10px;
  }
  
  .details-actions {
    padding: 8px 16px;
    gap: 6px;
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr; /* 保底 */
    
    :deep(.el-button) {
      height: 32px;
      font-size: 12px;
    }
    
    :deep(.el-button .el-icon) {
      font-size: 12px;
      margin-right: 4px;
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
  }
}

// 超小屏幕手机端响应式 (≤320px)
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
  
  .details-panel {
    max-height: 200px;
  }
  
  .details-header {
    padding: 8px 12px;
  }
  
  .details-title {
    font-size: 11px;
  }
  
  .details-type {
    font-size: 9px;
  }
  
  .details-list {
    padding: 6px 12px;
    gap: 5px;
  }
  
  .detail-item {
    grid-template-columns: 60px 1fr;
  }
  
  .detail-item .label {
    font-size: 9px;
  }
  
  .detail-item .value {
    font-size: 9px;
  }
  
  .details-actions {
    padding: 6px 12px;
    gap: 4px;
    
    :deep(.el-button) {
      height: 28px;
      font-size: 10px;
    }
    
    :deep(.el-button .el-icon) {
      font-size: 10px;
      margin-right: 3px;
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
  }
}
</style>



