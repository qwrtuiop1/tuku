<template>
  <div class="live-media-card" @mouseenter="onHover(true)" @mouseleave="onHover(false)" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <div class="poster-wrapper">
      <img v-if="asset.poster_url" :src="posterSrc" class="poster" :alt="label" @load="onPosterLoad" />
      <video v-if="inView && previewing && source" ref="videoRef" class="preview" :src="source.src" muted playsinline :loop="isLooping" :poster="asset.poster_url" @ended="handleEnded"></video>
      <div class="badge">LIVE</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { LiveMediaAsset } from '@/utils/liveMedia'
import { pickBestSource, prefersReducedMotion } from '@/utils/liveMedia'

const props = defineProps<{ asset: LiveMediaAsset, autoplay?: boolean }>()

const previewing = ref(false)
const videoRef = ref<HTMLVideoElement>()
const source = pickBestSource(props.asset)
const label = `${props.asset.kind}`
const isLooping = ref(false)
const posterTs = ref(0)
const posterSrc = computed(() => {
  if (!props.asset.poster_url) return ''
  const sep = props.asset.poster_url.includes('?') ? '&' : '?'
  return `${props.asset.poster_url}${sep}t=${posterTs.value}`
})
const emit = defineEmits<{ 'bg-theme': ['light' | 'dark'] }>()

let hoverTimer: number | null = null
const onHover = (enter: boolean) => {
  if (prefersReducedMotion()) return
  if (enter) {
    hoverTimer = window.setTimeout(() => startPreview(), 300)
  } else {
    stopPreview()
    if (hoverTimer) { window.clearTimeout(hoverTimer); hoverTimer = null }
  }
}

const startPreview = () => {
  if (!source) return
  previewing.value = true
  requestAnimationFrame(() => videoRef.value?.play().catch(() => {}))
}

const stopPreview = () => {
  previewing.value = false
  isLooping.value = false
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  posterTs.value = Date.now()
}

const handleEnded = () => {
  if (!isLooping.value) {
    stopPreview()
  }
}

const onPosterLoad = (e: Event) => {
  try {
    const img = e.target as HTMLImageElement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = 16, h = 16
    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    let sum = 0, count = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // perceived brightness
      const y = 0.299 * r + 0.587 * g + 0.114 * b
      sum += y; count++
    }
    const avg = sum / count
    emit('bg-theme', avg > 160 ? 'light' : 'dark')
  } catch {}
}

let longPressTimer: number | null = null
let touching = false
const onTouchStart = () => {
  if (prefersReducedMotion()) return
  touching = true
  // 立即播放一遍（不循环）
  isLooping.value = false
  startPreview()
  // 长按 1 秒切换为循环，直到松手
  longPressTimer = window.setTimeout(() => {
    if (touching && videoRef.value) {
      isLooping.value = true
      try {
        if ((videoRef.value.currentTime || 0) >= (videoRef.value.duration || Infinity)) {
          videoRef.value.currentTime = 0
        }
        videoRef.value.play().catch(() => {})
      } catch {}
    }
  }, 1000)
}
const onTouchEnd = () => {
  touching = false
  if (longPressTimer) { window.clearTimeout(longPressTimer); longPressTimer = null }
  stopPreview()
}

// 懒加载：仅在视口内才允许预览
const inView = ref(false)
let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      inView.value = entry.isIntersecting
      if (!inView.value) {
        stopPreview()
      } else {
        if (props.autoplay && !prefersReducedMotion()) startPreview()
      }
    })
  }, { rootMargin: '100px' })
  const el = (document.currentScript as any)?.closest?.('.live-media-card') || null
  // 保险：直接观察组件根节点
  const root = document.querySelector('.live-media-card:last-child')
  const target = (root as Element) || undefined
  try { observer.observe((target as Element) || (document.querySelector('.live-media-card') as Element)) } catch {}
})
onUnmounted(() => { stopPreview(); if (observer) observer.disconnect() })
</script>

<style scoped>
.live-media-card { position: relative; height: 100%; }
.poster-wrapper { position: relative; overflow: hidden; border-radius: 8px; height: 100%; }
.poster { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; pointer-events: none; }
.badge { position: absolute; left: 8px; bottom: 8px; background: rgba(0,0,0,0.75); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; letter-spacing: 1px; z-index: 2; pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
@media (max-width: 768px) {
  .badge { left: 0; right: auto; bottom: 0; top: auto; padding: 0; border-radius: 0; }
}
</style>


