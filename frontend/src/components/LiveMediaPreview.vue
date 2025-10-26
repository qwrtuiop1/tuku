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
import LiveMediaPlayer from '@/components/LiveMediaPlayer.vue'
import type { LiveMediaAsset } from '@/utils/liveMedia'

const props = defineProps<{ modelValue: boolean, asset: LiveMediaAsset }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], fullscreen: [LiveMediaAsset] }>()

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

const openFullscreen = () => emit('fullscreen', props.asset)
const playerRef = ref<InstanceType<typeof LiveMediaPlayer> | null>(null)
const playOnce = () => playerRef.value?.playOnce && (playerRef.value as any).playOnce()
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

@media (max-width: 768px) {
  .preview-body { grid-template-columns: 1fr; }
  .actions { flex-direction: column; }
}
</style>




