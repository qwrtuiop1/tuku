<template>
  <div class="live-share">
    <div class="player-card" v-if="!disabled">
      <div v-if="!ended" class="video-wrap">
        <video
          ref="videoRef"
          :poster="poster"
          controls
          playsinline
          webkit-playsinline
          :autoplay="true"
          @ended="onEnded"
        >
          <source v-if="mp4" :src="mp4" type="video/mp4" />
          <source v-if="webm" :src="webm" type="video/webm" />
        </video>
      </div>
      <div v-else class="poster-wrap">
        <img :src="poster" alt="poster" />
      </div>
      <div class="actions" v-if="ended">
        <el-button type="primary" @click="replay">查看动图</el-button>
      </div>
      <div class="hint" v-if="!mp4 && !webm && poster">
        当前环境不支持视频播放，已展示静态图。
      </div>
    </div>
    <el-empty v-else description="分享功能已关闭，链接已失效" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/utils/api'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()
const videoRef = ref<HTMLVideoElement | null>(null)
const poster = decodeURIComponent((route.query.poster as string) || '')
const mp4 = decodeURIComponent((route.query.mp4 as string) || '')
const webm = decodeURIComponent((route.query.webm as string) || '')
const ended = ref(false)
let poller: any = null
const disabled = ref(false)

const applyDisabled = () => {
  disabled.value = true
  try { videoRef.value?.pause() } catch {}
}

const checkShareEnabled = async (): Promise<boolean> => {
  try {
    const { data } = await api.get('/system/share-status')
    if (data && data.sharing_enabled === false) {
      applyDisabled()
      ElMessage.error('分享功能已关闭，链接已失效')
      return false
    }
    return true
  } catch (_) {
    return true
  }
}

const onEnded = () => {
  ended.value = true
}

onMounted(async () => {
  const ok = await checkShareEnabled()
  if (!ok) return
  // 若浏览器阻止自动播放，保持控件可手动播放
  const v = videoRef.value
  if (v) {
    v.play().catch(() => {})
  }
  // 轮询分享开关，关闭时立即中止播放并提示
  poller = setInterval(checkShareEnabled, 2000)
})

const replay = async () => {
  ended.value = false
  // 等待 DOM 更新完成，确保视频元素已重新渲染
  await nextTick()
  const v = videoRef.value
  if (v) {
    try { v.pause() } catch {}
    v.currentTime = 0
    v.play().catch(() => {})
  }
}
onUnmounted(() => { if (poller) { clearInterval(poller); poller = null } })
</script>

<style scoped>
.live-share { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f7fa; padding: 24px; }
.player-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; width: 100%; max-width: 640px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.video-wrap, .poster-wrap { width: 100%; display: flex; align-items: center; justify-content: center; }
video { width: 100%; height: auto; max-height: 80vh; object-fit: contain; border-radius: 8px; background: #000; }
.poster-wrap img { width: 100%; height: auto; max-height: 80vh; object-fit: contain; border-radius: 8px; border: 1px solid #eee; }
.actions { margin-top: 10px; display: flex; justify-content: center; }
:deep(.actions .el-button--primary) { background-color: #1f1f1f; border-color: #1f1f1f; color: #ffffff; }
:deep(.actions .el-button--primary:hover),
:deep(.actions .el-button--primary:focus) { background-color: #000000; border-color: #000000; color: #ffffff; }
:deep(.actions .el-button--primary.is-disabled),
:deep(.actions .el-button--primary[disabled]) { background-color: #eaeaea; border-color: #eaeaea; color: #9e9e9e; }
.hint { margin-top: 8px; color: #6b7280; font-size: 12px; text-align: center; }
</style>


