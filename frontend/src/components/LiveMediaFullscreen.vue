<template>
  <div class="live-media-fullscreen" v-if="visible" @click.self="close">
    <video
      v-if="source"
      ref="videoRef"
      class="player"
      :src="source.src"
      :poster="asset.poster_url || undefined"
      playsinline
      controls
      :loop="asset.loopable ?? true"
    />
    <img v-else-if="asset.poster_url" :src="asset.poster_url" class="fallback" :alt="asset.kind" />
    <button class="close-btn" @click.stop="close">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { LiveMediaAsset } from '@/utils/liveMedia'
import { pickBestSource } from '@/utils/liveMedia'

const props = defineProps<{ visible: boolean, asset: LiveMediaAsset }>()
const emit = defineEmits<{ 'update:visible': [boolean] }>()

const videoRef = ref<HTMLVideoElement>()
const source = pickBestSource(props.asset)

const close = () => emit('update:visible', false)

const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
onMounted(() => document.addEventListener('keydown', handleKey))
onUnmounted(() => document.removeEventListener('keydown', handleKey))

watch(() => props.asset, () => {
  if (videoRef.value) { videoRef.value.pause(); videoRef.value.load() }
})
</script>

<style scoped>
.live-media-fullscreen { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.player { max-width: 100vw; max-height: 100vh; }
.fallback { max-width: 100vw; max-height: 100vh; }
.close-btn { position: absolute; right: 16px; top: 16px; width: 36px; height: 36px; border-radius: 18px; border: none; background: rgba(255,255,255,0.2); color: #fff; font-size: 20px; cursor: pointer; }
</style>












