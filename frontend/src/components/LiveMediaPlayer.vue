<template>
  <div 
    class="live-media-player"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @touchcancel.passive="onTouchEnd"
  >
    <video
      v-if="source && showingVideo"
      ref="videoRef"
      class="player"
      :src="source.src"
      :poster="asset.poster_url || undefined"
      playsinline
      :muted="muted"
      :loop="false"
      @ended="handleEnded"
    />
    <img v-else-if="asset.poster_url" :src="asset.poster_url" class="fallback" :alt="asset.kind" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { LiveMediaAsset } from '@/utils/liveMedia'
import { pickBestSource, prefersReducedMotion } from '@/utils/liveMedia'

const props = defineProps<{ asset: LiveMediaAsset, autoplay?: boolean }>()
const videoRef = ref<HTMLVideoElement>()
const source = pickBestSource(props.asset)
const muted = true
const showingVideo = ref(false)
let touchActive = false
let longPressTimer: number | null = null

const playOnce = () => {
  if (!source) return
  showingVideo.value = true
  requestAnimationFrame(() => {
    if (videoRef.value) {
      videoRef.value.currentTime = 0
      videoRef.value.play().catch(() => {})
    }
  })
}

const handleEnded = () => {
  showingVideo.value = false
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
}

onMounted(() => {
  if (!prefersReducedMotion() && props.autoplay) {
    playOnce()
  }
})

watch(() => props.asset, () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.load()
  }
})

defineExpose({ playOnce })

// Mobile long-press: press 1s to play once; release to stop immediately
const onTouchStart = () => {
  touchActive = true
  if (longPressTimer) { window.clearTimeout(longPressTimer); longPressTimer = null }
  longPressTimer = window.setTimeout(() => {
    if (touchActive) {
      playOnce()
    }
  }, 1000)
}

const onTouchEnd = () => {
  touchActive = false
  if (longPressTimer) { window.clearTimeout(longPressTimer); longPressTimer = null }
  // If playing, stop immediately and restore poster
  if (showingVideo.value) {
    showingVideo.value = false
    if (videoRef.value) {
      try {
        videoRef.value.pause()
        videoRef.value.currentTime = 0
      } catch {}
    }
  }
}

</script>

<style scoped>
.live-media-player { position: relative; width: 100%; }
.player { width: 100%; height: auto; display: block; background: #000; }
.fallback { width: 100%; height: auto; display: block; }

</style>


