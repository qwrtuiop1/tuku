<template>
  <div class="share-view">
    <div class="card" v-if="loaded && meta">
      <h2 class="title">{{ meta.file.original_name }}</h2>
      <div class="meta">
        <span>{{ formatFileSize(meta.file.file_size || 0) }}</span>
        <span v-if="meta.file.created_at"> · {{ new Date(meta.file.created_at).toLocaleString() }}</span>
      </div>
      <div class="preview" v-if="meta.allow_preview">
        <img v-if="meta.file.file_type==='image' && previewUrl" :src="previewUrl" alt="preview" />
        <video v-else-if="meta.file.file_type==='video' && streamUrl" ref="videoRef" controls playsinline webkit-playsinline :autoplay="true">
          <source :src="streamUrl" :type="meta.file.mime_type || 'video/mp4'" />
        </video>
      </div>
      <div class="actions">
        <el-button type="primary" :disabled="!meta.allow_download || !downloadUrl" @click="download">下载</el-button>
      </div>
    </div>
    <el-empty v-else-if="loaded" description="分享不存在或已过期" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { formatFileSize } from '@/utils/helpers'

const route = useRoute()
const token = route.params.token as string
const meta = ref<any>(null)
const loaded = ref(false)
const previewUrl = ref<string | null>(null)
const downloadUrl = ref<string | null>(null)
const streamUrl = ref<string | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
let poller: any = null

onMounted(async () => {
  try {
    const { data } = await api.get(`/share/${token}`)
    if (data && data.success) {
      meta.value = data
      const base = (import.meta.env.VITE_API_BASE_URL as string) || window.location.origin
      const toAbs = (u: string | null | undefined) => {
        if (!u) return null
        if (/^https?:\/\//i.test(u)) return u
        return `${base}${u}`
      }
      previewUrl.value = toAbs(data.preview_url)
      downloadUrl.value = toAbs(data.download_url)
      streamUrl.value = toAbs(data.stream_url)
    }
  } catch (_) {
    meta.value = null
  } finally {
    loaded.value = true
  }
  // 轮询分享开关，关闭后立即中断
  poller = setInterval(async () => {
    try {
      const { data } = await api.get('/system/share-status')
      if (data && data.sharing_enabled === false) {
        try { videoRef.value?.pause() } catch {}
        meta.value = null; loaded.value = true
      }
    } catch (_) {}
  }, 5000)
})

const download = () => {
  if (!downloadUrl.value) return
  const a = document.createElement('a')
  a.href = downloadUrl.value
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  a.remove()
  ElMessage.success('开始下载')
}

onUnmounted(() => { if (poller) { clearInterval(poller); poller = null } })
</script>

<style scoped>
.share-view { padding: 24px; display: flex; justify-content: center; }
.card { width: 100%; max-width: 720px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
.title { margin: 0 0 8px; font-size: 18px; }
.meta { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
.preview { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; }
.preview img { max-width: 100%; height: auto; max-height: 80vh; object-fit: contain; border-radius: 8px; border: 1px solid #eee; }
.preview video { max-width: 100%; width: 100%; height: auto; max-height: 80vh; object-fit: contain; border-radius: 8px; background: #000; }
.actions { display: flex; justify-content: center; }
:deep(.actions .el-button--primary) { background-color: #1f1f1f; border-color: #1f1f1f; color: #ffffff; }
:deep(.actions .el-button--primary:hover),
:deep(.actions .el-button--primary:focus) { background-color: #000000; border-color: #000000; color: #ffffff; }
:deep(.actions .el-button--primary.is-disabled),
:deep(.actions .el-button--primary[disabled]) { background-color: #eaeaea; border-color: #eaeaea; color: #9e9e9e; }
.hint { margin-top: 8px; color: #6b7280; font-size: 12px; text-align: center; }
</style>


