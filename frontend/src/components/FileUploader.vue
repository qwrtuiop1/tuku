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
          <span class="tip-item">支持图片、HEIC/HEIF 和 MP4/MOV 视频</span>
          <span class="tip-item">单个文件最大{{ maxFileSizeMB }}MB</span>
          <span class="tip-item">同名"图片+短视频"将自动识别为实况图（长按预览）</span>
          <!-- Android 设备提示 -->
          <span v-if="isDeviceAndroid" class="tip-item tip-android">
            <el-icon><Monitor /></el-icon>
            Android 设备，已启用 GIF 选择支持
          </span>
          <!-- iOS 16.4+ PhotosPicker 原生实况图入口 -->
          <span v-if="photosPickerSupported" class="tip-item tip-live">
            <el-button
              type="primary"
              size="small"
              link
              :loading="photosPickerLoading"
              @click.stop="openPhotosPicker"
            >
              <el-icon><VideoPlay /></el-icon>
              iOS 原生选择实况图（推荐）
            </el-button>
          </span>
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
      :accept="computedUnifiedAccept"
      style="display: none"
      @change="handleFileSelect"
    />
    <!-- 实况专用选择输入（可一次性选择 HEIC+MOV 或 GIF/WebP） -->
    <input
      ref="liveFileInputRef"
      type="file"
      multiple
      accept=".heic,.heif,.jpg,.jpeg,.mov,.gif,.webp,image/heic,image/heif,image/jpeg,video/quicktime,image/gif,image/webp"
      style="display: none"
      @change="handleLiveSelect"
    />
    <!-- Android 专用输入：显式囊括所有图片类型，解决系统相册过滤 GIF 的问题 -->
    <input
      v-if="isDeviceAndroid"
      ref="androidFileInputRef"
      type="file"
      multiple
      accept="image/*,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif,video/*,.mp4,.mov,.webm,.mkv"
      style="display: none"
      @change="handleAndroidFileSelect"
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

    <!-- 实况上传队列（Live Jobs） -->
    <div v-if="liveJobs.length > 0" class="live-jobs">
      <div class="live-jobs-header">
        <h4>实况处理队列</h4>
      </div>
      <div class="live-jobs-items">
        <div
          v-for="job in liveJobs"
          :key="job.id"
          class="live-job-item"
        >
          <div class="job-info">
            <div class="job-id">任务 {{ job.id }}</div>
            <div class="job-status">{{ statusText(job.status) }}</div>
          </div>
          <el-progress :percentage="Math.max(0, Math.min(100, job.progress || 0))" :stroke-width="6" />
          <div class="job-actions">
            <el-button size="small" type="danger" @click="cancelLiveJob(job.id)">取消</el-button>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Loading,
  VideoPlay,
  Clock,
  Check,
  Close,
  Monitor
} from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'
import { formatFileSize } from '@/utils/helpers'
import api from '@/utils/api'
import { useLivePhotoPicker } from '@/composables/useLivePhotoPicker'
import { useDeviceInfo } from '@/composables/useDeviceInfo'

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
const liveFileInputRef = ref<HTMLInputElement>()
const androidFileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadList = ref<UploadItem[]>([])
const liveJobs = ref<Array<{ id: string, status: string, progress: number, assetId?: number }>>([])
const liveControllers: Record<string, AbortController> = {}
const jobTimers: Record<string, number> = {}

/**
 * iOS 16.4+ PhotosPicker API 专用实况图采集
 * 核心修复：iOS Safari 标准 file input 只返回 HEIC 图片，不返回关联 MOV；
 * PhotosPicker 的 showLivePhotos 选项可以同时获取 Live Photo 的 image + video。
 */
const photosPickerRef = ref<HTMLInputElement>()
const { isSupported: photosPickerSupported, isLoading: photosPickerLoading, openPhotosPicker } = useLivePhotoPicker({
  onPicked: async (results) => {
    for (const result of results) {
      const fd = new FormData()
      fd.append('files', result.imageFile, result.filename)
      if (result.videoBlob) {
        // video Blob 扩展名从 image 名称推断（Live Photo 的 video 通常是 MOV）
        const videoExt = result.filename.replace(/\.[^.]+$/, '.mov')
        fd.append('files', result.videoBlob, videoExt)
      }
      fd.append('pairing_id', result.pairingId)
      if (filesStore.currentFolder) fd.append('folder_id', String(filesStore.currentFolder))
      try {
        const resp = await api.post('/live-media/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const jobId = normalizeJobId(resp.data?.jobId)
        if (jobId) startJobPolling(jobId)
        else ElMessage.warning('后端未返回 jobId，已受理但无法跟踪进度')
      } catch (err: any) {
        ElMessage.error(err.response?.data?.message || '实况图上传失败')
      }
    }
  },
  onError: (msg) => {
    ElMessage.error(msg)
    // PhotosPicker 失败时，回退到标准文件输入
    triggerLiveInput()
  }
})

// 规范化后端返回的 jobId，兼容字符串/数字/对象形态
const normalizeJobId = (raw: any): string | null => {
  if (raw == null) return null
  const t = typeof raw
  if (t === 'string' || t === 'number') return String(raw)
  if (t === 'object') {
    if (raw.id != null) return String(raw.id)
    if (raw.jobId != null) return String(raw.jobId)
    if (raw.value != null) return String(raw.value)
    if (raw.data != null) return normalizeJobId(raw.data)
  }
  return null
}

// 系统设置
const systemSettings = ref({
  maxFileSize: 100, // 默认100MB
  maxUploadFiles: 10, // 默认10个文件
  allowedVideoTypes: ['mp4','webm','mov'] as string[]
})

// 计算属性
const maxFileSizeMB = computed(() => systemSettings.value.maxFileSize)
const maxFileSizeBytes = computed(() => systemSettings.value.maxFileSize * 1024 * 1024)

// 生成 accept 列表
const computedAccept = computed(() => {
  const videoExts = (systemSettings.value.allowedVideoTypes || []).map(v => `.${v}`)
  const parts = ['image/*', 'video/*', ...videoExts, '.heic', '.heif']
  return parts.join(',')
})

const computedVideoAccept = computed(() => {
  const videoExts = (systemSettings.value.allowedVideoTypes || []).map(v => `.${v}`)
  const videoMimes = ['video/*','video/mp4','video/quicktime','video/webm','video/x-matroska','video/x-msvideo']
  return [...videoMimes, ...videoExts]
})

const computedUnifiedAccept = computed(() => {
  // iOS 简化 accept，避免系统相册过滤异常
  if (isDeviceIOS.value) {
    return ['image/*','image/heic','image/heif','video/*','video/quicktime'].join(',')
  }
  // Android：使用 composable 提供的最优 accept，显式包含 image/gif 避免被系统相册过滤
  return getDeviceOptimalAccept()
})

const isMobile = computed(() => /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))
const isIOS = computed(() => /iPhone|iPad|iPod/i.test(navigator.userAgent))

// 设备信息（立即获取，无需等待 onMounted）
const {
  isIOS: isDeviceIOS,
  isAndroid: isDeviceAndroid,
  isMobile: isDeviceMobile,
  isWechat: isDeviceWechat,
  isAndroidQQ: isDeviceAndroidQQ,
  isAndroidWechat: isDeviceAndroidWechat,
  deviceLabel,
  getOptimalAccept: getDeviceOptimalAccept,
  supportsFileSystemAccess,
} = useDeviceInfo()

// 上传统计
const uploadStats = computed(() => {
  const total = uploadList.value.length
  const success = uploadList.value.filter(item => item.status === 'success').length
  const error = uploadList.value.filter(item => item.status === 'error').length
  
  return { total, success, error }
})

// 获取系统设置
const fetchSystemSettings = async () => {
  try {
    const response = await api.get('/system/info')
    const systemInfo = response.data
    
    systemSettings.value = {
      maxFileSize: systemInfo.max_file_size || 100,
      maxUploadFiles: systemInfo.max_upload_files || 10,
      allowedVideoTypes: Array.isArray(systemInfo.allowed_video_types) && systemInfo.allowed_video_types.length
        ? systemInfo.allowed_video_types
        : ['mp4','webm','mov','mkv','m4v','flv','wmv','mpeg','mpg','3gp','ts','m2ts','ogv']
    }
  } catch (error) {
    // 使用默认值
    systemSettings.value = {
      maxFileSize: 100,
      maxUploadFiles: 10
    }
  }
}

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
  const maxSize = maxFileSizeBytes.value
  // 基础图片类型 + HEIC/HEIF
  const imageTypes = [
    'image/jpeg','image/png','image/gif','image/webp','image/svg+xml','image/heic','image/heif'
  ]
  // 将允许的视频扩展映射为常见MIME
  const extToMime: Record<string,string[]> = {
    mp4: ['video/mp4','video/x-m4v'],
    m4v: ['video/x-m4v','video/mp4'],
    webm: ['video/webm'],
    mov: ['video/quicktime'],
    avi: ['video/x-msvideo'],
    mkv: ['video/x-matroska','video/webm'],
    flv: ['video/x-flv'],
    wmv: ['video/x-ms-wmv'],
    mpeg: ['video/mpeg'],
    mpg: ['video/mpeg'],
    '3gp': ['video/3gpp'],
    ts: ['video/mp2t'],
    m2ts: ['video/mp2t'],
    ogv: ['video/ogg']
  }
  const videoMimes = new Set<string>()
  for (const ext of systemSettings.value.allowedVideoTypes || []) {
    const list = extToMime[ext.toLowerCase()] || []
    for (const m of list) videoMimes.add(m)
  }
  // 兜底允许常见三种
  ;['video/mp4','video/webm','video/quicktime'].forEach(m => videoMimes.add(m))
  const allowedTypes = new Set<string>([...imageTypes, ...Array.from(videoMimes)])
  
  if (file.size > maxSize) {
    ElMessage.error(`文件 ${file.name} 超过${maxFileSizeMB.value}MB限制`)
    return false
  }
  
  if (!allowedTypes.has(file.type)) {
    // iOS/Safari 有时返回空 MIME；安卓相册常把 GIF 等报成 application/octet-stream
    let inferred = file.type
    if (!inferred || inferred === '' || inferred === 'application/octet-stream') {
      const n = (file.name || '').toLowerCase()
      // GIF/WebP 优先识别，确保进入图片通道（而非被误判为不支持）
      if (/\.gif$/i.test(n)) inferred = 'image/gif'
      else if (/\.webp$/i.test(n)) inferred = 'image/webp'
      else if (/\.heic$/i.test(n)) inferred = 'image/heic'
      else if (/\.heif$/i.test(n)) inferred = 'image/heif'
      else if (n.endsWith('.jpg') || n.endsWith('.jpeg')) inferred = 'image/jpeg'
      else if (n.endsWith('.png')) inferred = 'image/png'
      else if (n.endsWith('.mov')) inferred = 'video/quicktime'
      else if (n.endsWith('.mp4') || n.endsWith('.m4v')) inferred = 'video/mp4'
      else if (n.endsWith('.webm')) inferred = 'video/webm'
    }
    if (!inferred || !allowedTypes.has(inferred)) {
      ElMessage.error(`不支持的文件类型: ${inferred || file.type}`)
      return false
    }
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
  // Android：专用 input，避免系统相册过滤 GIF/MOV/WebM 等
  if (isDeviceAndroid.value && androidFileInputRef.value) {
    androidFileInputRef.value.accept = [
      'image/*',           // 覆盖所有标准图片（JPEG/PNG 等）
      'image/gif',         // GIF MIME（某些 Android Chrome 版本需要显式声明）
      'video/*',           // 所有视频
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif',   // 图片扩展
      '.mp4', '.mov', '.webm', '.mkv', '.avi', '.3gp', '.m4v',       // 视频扩展
      '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', '.HEIC', '.HEIF',   // 大写扩展（Android 部分机型的 file.name）
      '.MP4', '.MOV', '.WEBM', '.MKV', '.AVI', '.3GP', '.M4V',      // 大写视频扩展
    ].join(',')
    androidFileInputRef.value.click()
    return
  }
  // iOS/其他：使用统一 accept
  if (fileInputRef.value) {
    fileInputRef.value.accept = computedUnifiedAccept.value
  }
  fileInputRef.value?.click()
}

// 移动端统一入口：直接使用统一 accept 调起一次选择
const triggerImageInput = () => { fileInputRef.value?.click() }
const triggerVideoInput = () => { fileInputRef.value?.click() }

/**
 * Android 专用文件选择处理
 * Android 系统相册在某些版本/浏览器下会默认过滤 GIF，
 * 通过专用的 accept 字符串（显式包含 image/gif）确保 GIF 可选
 */
const handleAndroidFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    // 检测是否选中了 GIF
    const hasGif = files.some(f => /\.(gif)$/i.test(f.name))
    if (hasGif) {
      // Android GIF：静默走普通上传通道，不触发实况逻辑
      await processFiles(files)
    } else {
      await processFiles(files)
    }
  }
  target.value = ''
}

// 触发实况选择
const triggerLiveInput = () => {
  liveFileInputRef.value?.click()
}

// 取消长按入口，统一点击打开文件选择

// 处理文件选择
const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  // iOS 引导：若仅选到 静态图(HEIC/JPEG) 而无 MOV，提示用户补选 MOV（可触发实况输入）
  if (isDeviceIOS.value && files.length > 0) {
    const names = files.map(f => (f.name || '').toLowerCase())
    const hasHeicOrJpeg = names.some(n => n.endsWith('.heic') || n.endsWith('.heif') || n.endsWith('.jpg') || n.endsWith('.jpeg'))
    const hasMov = names.some(n => n.endsWith('.mov'))
    if (hasHeicOrJpeg && !hasMov) {
      try {
        await ElMessageBox.confirm('检测到选择了 HEIC 图片，是否继续选择对应的实况视频（MOV）以形成实况？', '提示', { type: 'info', confirmButtonText: '去选择', cancelButtonText: '先上传图片' })
        triggerLiveInput()
      } catch {}
    }
  }
  await processFiles(files)
  
  // 清空input值，允许重复选择相同文件
  target.value = ''
}

// 处理实况选择（整批发送到 /live-media/upload）
const handleLiveSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files.length) return
  try {
    isUploading.value = true
    uploadProgress.value = 0
    const formData = new FormData()
    for (const f of files) formData.append('files', f)
    // 传递当前文件夹ID到后端用于实况归属
    if (filesStore.currentFolder) formData.append('folder_id', String(filesStore.currentFolder))
    const resp = await api.post('/live-media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (pe) => { if (pe.total) uploadProgress.value = Math.round((pe.loaded * 100) / pe.total) }
    })
    const jobId = normalizeJobId(resp.data?.jobId)
    if (jobId) {
      ElMessage.success('实况上传已受理，开始处理...')
      startJobPolling(jobId)
    } else {
      ElMessage.warning('后端未返回 jobId，已受理但无法跟踪进度')
      emit('upload-success')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '实况上传失败')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    target.value = ''
  }
}

// 批量创建 live 任务（支持显式 pairingId）
const createLiveJob = async (batch: File[], pairingId?: string) => {
  try {
    const fd = new FormData()
    for (const f of batch) fd.append('files', f)
    if (filesStore.currentFolder) fd.append('folder_id', String(filesStore.currentFolder))
    // 显式配对 ID（PhotosPicker 专用，优先于文件名匹配）
    if (pairingId) fd.append('pairing_id', pairingId)
    const controller = new AbortController()
    const resp = await api.post('/live-media/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal: controller.signal
    })
    const jobId = normalizeJobId(resp.data?.jobId)
    if (jobId) { liveControllers[jobId] = controller; startJobPolling(jobId) }
    else ElMessage.warning('后端未返回 jobId，已受理但无法跟踪进度')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '实况任务创建失败')
  }
}

const startJobPolling = (jobId: string) => {
  liveJobs.value.push({ id: jobId, status: 'queued', progress: 0 })
  if (jobTimers[jobId]) {
    window.clearInterval(jobTimers[jobId])
    delete jobTimers[jobId]
  }
  const jobIdEncoded = encodeURIComponent(String(jobId))
  jobTimers[jobId] = window.setInterval(async () => {
    try {
      const { data } = await api.get(`/live-media/jobs/${jobIdEncoded}`)
      const idx = liveJobs.value.findIndex(j => j.id === jobId)
      if (idx !== -1) liveJobs.value[idx] = { id: data.id, status: data.status, progress: data.progress || 0, assetId: data.assetId }
      if (data.status === 'completed') {
        window.clearInterval(jobTimers[jobId])
        delete jobTimers[jobId]
        ElMessage.success('实况处理完成')
        emit('upload-success')
      } else if (data.status === 'failed') {
        window.clearInterval(jobTimers[jobId])
        delete jobTimers[jobId]
        ElMessage.error('实况处理失败')
      }
    } catch {}
  }, 1200)
}

const cancelLiveJob = async (jobId: string) => {
  try {
    const c = liveControllers[jobId]
    if (c) { try { c.abort() } catch {} delete liveControllers[jobId] }
    await api.delete(`/live-media/jobs/${encodeURIComponent(jobId)}`)
    const idx = liveJobs.value.findIndex(j => j.id === jobId)
    if (idx !== -1) liveJobs.value.splice(idx, 1)
    ElMessage.success('已取消')
    emit('upload-success')
  } catch (e:any) {
    ElMessage.error(e.response?.data?.message || '取消失败')
  }
}

// 处理文件（混合多选：普通与实况并行）
const processFiles = async (files: File[]) => {
  if (files.length === 0) return
  
  // 验证文件
  const validFiles = files.filter(validateFile)
  if (validFiles.length === 0) return
  
  // 分组
  const heics: File[] = []
  const movs: File[] = []
  const anims: File[] = [] // gif/webp
  const mayJpgs: File[] = []
  const others: File[] = []
  for (const f of validFiles) {
    const name = f.name.toLowerCase()
    if (name.endsWith('.heic')) heics.push(f)
    else if (name.endsWith('.mov')) movs.push(f)
    else if (name.endsWith('.gif') || name.endsWith('.webp')) anims.push(f)
    else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mayJpgs.push(f)
    else others.push(f)
  }
  
  const toBase = (n: string) => n.replace(/\.[^.]+$/, '').toLowerCase()
  const movMap = new Map<string, File>()
  movs.forEach(m => movMap.set(toBase(m.name), m))

  // heic+mov 配对并发起 live 任务
  const usedMovs = new Set<string>()
  for (const h of heics) {
    const base = toBase(h.name)
    const m = movMap.get(base)
    if (m) {
      await createLiveJob([h, m])
      usedMovs.add(m.name)
    } else {
      others.push(h)
    }
  }
  // 未配对 mov 走普通上传
  movs.forEach(m => { if (!usedMovs.has(m.name)) others.push(m) })

  // 动图单文件直接走普通上传通道，由后端根据 magic bytes 识别类型
  // 注意：不要调用 createLiveJob，否则会触发不必要的转码
  for (const a of anims) {
    const preview = await createFilePreview(a)
    const uploadItem: UploadItem = {
      id: generateId(),
      file: a,
      preview,
      progress: 0,
      status: 'pending'
    }
    ;(uploadItem as any).liveBasename = a.name.replace(/\.[^.]+$/, '')
    uploadList.value.push(uploadItem)
  }

  // JPG Motion Photo 轻量检测：读首尾各 256KB，命中关键字则走 live
  for (const jpg of mayJpgs) {
    const isMotion = await detectMotionPhoto(jpg)
    if (isMotion) await createLiveJob([jpg])
    else others.push(jpg)
  }

  // 普通文件加入队列
  for (const file of others) {
    const base = file.name.replace(/\.[^.]+$/, '')
    const preview = await createFilePreview(file)
    const uploadItem: UploadItem = {
      id: generateId(),
      file,
      preview,
      progress: 0,
      status: 'pending'
    }
    ;(uploadItem as any).liveBasename = base
    uploadList.value.push(uploadItem)
  }
  
  // 开始普通上传
  await startUpload()
}

async function detectMotionPhoto(file: File): Promise<boolean> {
  // 更稳健的检测：在文件头、尾以及中部多点采样查找 'ftyp' 或常见标记
  const decoder = new TextDecoder()
  const readChunk = (start: number, length: number) => new Promise<ArrayBuffer>((resolve, reject) => {
    const blob = file.slice(start, Math.min(file.size, start + length))
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as ArrayBuffer)
    fr.onerror = reject
    fr.readAsArrayBuffer(blob)
  })

  const sampleSize = 512 * 1024 // 512KB 采样块
  const positions: number[] = [
    0, // 文件头
    Math.max(0, Math.floor(file.size * 0.25) - sampleSize / 2),
    Math.max(0, Math.floor(file.size * 0.5) - sampleSize / 2),
    Math.max(0, Math.floor(file.size * 0.75) - sampleSize / 2),
    Math.max(0, file.size - sampleSize) // 文件尾
  ]

  try {
    for (const pos of positions) {
      const buf = await readChunk(pos, sampleSize)
      const text = decoder.decode(new Uint8Array(buf))
      if (/G(Camera|Image)|MicroVideo|MotionPhoto/i.test(text)) return true
      if (text.indexOf('ftyp') !== -1) return true // MP4 box 标记
    }
  } catch (_) {
    // 忽略读取失败，按未检测到处理
  }
  return false
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
    // 传递实况图配对信息（普通通道保留兼容）
    const isImage = item.file.type.startsWith('image/')
    const isVideo = item.file.type.startsWith('video/')
    if ((item as any).liveBasename && (isImage || isVideo)) {
      formData.append('live_basename', (item as any).liveBasename)
      formData.append('live_role', isImage ? 'image' : (isVideo ? 'video' : ''))
    }
    
    // 如果有当前文件夹，添加到表单数据
    if (filesStore.currentFolder) {
      formData.append('folder_id', filesStore.currentFolder.toString())
    }
    
    // 直接调用API上传
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

const statusText = (s: string) => {
  if (s === 'queued') return '排队中'
  if (s === 'processing') return '处理中'
  if (s === 'completed') return '已完成'
  if (s === 'failed') return '失败'
  return s
}

// 清空上传列表
const clearUploadList = () => {
  uploadList.value = []
}

// 生命周期
onMounted(() => {
  fetchSystemSettings()
})
</script>

<style lang="scss" scoped>
.file-uploader {
  .drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    padding: 60px 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(55,65,81,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
      opacity: 0.3;
    }
    
    &:hover {
      border-color: #374151;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(55, 65, 81, 0.15);
    }
    
    &.is-dragover {
      border-color: #111827;
      background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
      transform: scale(1.02);
      box-shadow: 0 12px 30px rgba(55, 65, 81, 0.2);
      
      &::before {
        opacity: 0.5;
      }
    }
    
    &.is-uploading {
      border-color: #6b7280;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    }
  }
  
  .drop-content {
    position: relative;
    z-index: 1;
    
    .upload-icon {
      font-size: 64px;
      color: #374151;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    .upload-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .upload-subtitle {
      font-size: 16px;
      color: #6b7280;
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
        color: #374151;
        padding: 8px 16px;
        background: rgba(55, 65, 81, 0.1);
        border-radius: 20px;
        font-weight: 500;
        border: 1px solid rgba(55, 65, 81, 0.2);
      }

      .tip-android {
        background: rgba(61, 194, 89, 0.12);
        color: #1a7a35;
        border-color: rgba(61, 194, 89, 0.3);
      }
    }
  }
  
  .uploading-content {
    position: relative;
    z-index: 1;
    
    .loading-icon {
      font-size: 64px;
      color: #374151;
      margin-bottom: 20px;
      animation: spin 1s linear infinite;
    }
    
    .uploading-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
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
          background: rgba(55, 65, 81, 0.1);
        }
        
        .el-progress-bar__inner {
          border-radius: 10px;
          background: linear-gradient(135deg, #374151, #111827);
        }
      }
      
      .progress-text {
        font-size: 16px;
        font-weight: 700;
        color: #374151;
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

.live-jobs {
  margin-top: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  .live-jobs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #2c3e50;
    }
  }

  .live-jobs-items {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .live-job-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid #eef2f7;
      border-radius: 10px;
      background: #fafbfc;

      .job-info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .job-id { font-weight: 600; color: #374151; }
        .job-status { font-size: 12px; color: #6b7280; }
      }
    }
  }
}

.live-upload-helper {
  margin-top: 12px;
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
