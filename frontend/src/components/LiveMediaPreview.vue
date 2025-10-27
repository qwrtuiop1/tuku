<template>
  <el-dialog v-model="visible" :title="'实况预览'" width="70%" :close-on-click-modal="false">
    <div class="preview-body">
      <div class="player-col">
        <LiveMediaPlayer ref="playerRef" :asset="asset" :autoplay="true" />
      </div>
      <div class="info-col">
        <div class="row"><span class="label">类型</span><span class="value">{{ asset.kind }}</span></div>
        <div class="row"><span class="label">分辨率</span><span class="value">{{ asset.width || '-' }} × {{ asset.height || '-' }}</span></div>
        <div class="row"><span class="label">时长</span><span class="value">{{ (asset.duration_ms || 0) / 1000 }}s</span></div>
        <div class="row"><span class="label">FPS</span><span class="value">{{ asset.fps || '-' }}</span></div>
        <div class="actions">
          <div class="action-item">
            <el-button class="btn-once" @click="playOnce" type="default">查看动图</el-button>
          </div>
          <div class="action-item">
            <el-button class="btn-fullscreen" @click="openFullscreen" type="default">全屏播放</el-button>
          </div>
          <div class="action-item">
            <el-button class="btn-download" :loading="downloading" :disabled="downloading" @click="downloadAnimated" type="default">
              <template v-if="!downloading">下载动图</template>
              <template v-else>下载中 {{ progress >= 0 ? progress + '%' : '' }}</template>
            </el-button>
          </div>
          <div class="action-item" v-if="systemStore.sharingEnabled">
            <el-button class="btn-share" @click="shareAnimated" type="default">分享动图</el-button>
          </div>
        </div>
        <div v-if="downloading" class="progress-row">
          <el-progress :percentage="progress >= 0 ? progress : 0" :indeterminate="progress < 0" :stroke-width="6" />
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores/system'
import LiveMediaPlayer from '@/components/LiveMediaPlayer.vue'
import type { LiveMediaAsset } from '@/utils/liveMedia'
import api from '@/utils/api'
import { pickBestSource } from '@/utils/liveMedia'

const props = defineProps<{ modelValue: boolean, asset: LiveMediaAsset }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], fullscreen: [LiveMediaAsset] }>()

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

const openFullscreen = () => emit('fullscreen', props.asset)
const playerRef = ref<InstanceType<typeof LiveMediaPlayer> | null>(null)
const playOnce = () => playerRef.value?.playOnce && (playerRef.value as any).playOnce()

// 下载动图：
// - motion_photo / animated: 下载原始容器（JPG/GIF/WEBP）
// - live_photo: 优先下载原始视频（MOV）
const downloadAnimated = async () => {
  try {
    downloading.value = true
    progress.value = 0
    const asset = props.asset
    const endpoint = asset.kind === 'live_photo'
      ? `/live-media/${asset.id}/original-video`
      : `/live-media/${asset.id}/original`
    const res: any = await api.get(endpoint, { responseType: 'blob', timeout: 600000, onDownloadProgress: (evt: any) => {
      if (evt && evt.total) {
        progress.value = Math.round((evt.loaded / evt.total) * 100)
      } else {
        progress.value = -1
      }
    } })
    const disposition = res.headers?.['content-disposition'] || ''
    let filename = `live_${asset.id}`
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
    if (match) {
      filename = decodeURIComponent(match[1] || match[2] || filename)
    }
    const blob = res.data as Blob
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    ElMessage.success('开始下载动图')
  } catch (e) {
    ElMessage.error('动图下载失败')
  } finally {
    downloading.value = false
    setTimeout(() => { progress.value = 0 }, 300)
  }
}

// 复制动图分享链接：视频播放完后回落为静态图片
const shareAnimated = async () => {
  try {
    const chosen = pickBestSource(props.asset)
    const mp4 = encodeURIComponent(chosen?.type === 'video/mp4' ? chosen.src : '')
    const webm = encodeURIComponent(chosen?.type === 'video/webm' ? chosen.src : '')
    const poster = encodeURIComponent(props.asset.poster_url || '')
    const link = `${window.location.origin}/live-share?mp4=${mp4}&webm=${webm}&poster=${poster}`
    await navigator.clipboard.writeText(link)
    ElMessage.success('动图链接已复制')
  } catch (_) {
    ElMessage.error('复制失败')
  }
}

const downloading = ref(false)
const progress = ref(0)
const systemStore = useSystemStore()
</script>

<style scoped>
.preview-body { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.player-col { background: #000; border-radius: 8px; overflow: hidden; }
.info-col { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; justify-content: space-between; }
.label { color: #909399; }
.value { color: #303133; }
.actions { margin-top: 12px; display: flex; gap: 10px; }
.action-item { display: flex; flex: 1; }
.action-item :deep(.el-button) { width: 100%; }
/* 黑白灰配色 */
.btn-once { background: #4b5563; color: #fff; border: none; }
.btn-once:hover { filter: brightness(1.05); }
.btn-fullscreen { background: #111; color: #fff; border: none; }
.btn-fullscreen:hover { filter: brightness(1.05); }
.btn-download { background: #374151; color: #fff; border: none; }
.btn-download:hover { filter: brightness(1.05); }

@media (max-width: 768px) {
  .preview-body { grid-template-columns: 1fr; }
  .actions { flex-direction: column; }
}
</style>




