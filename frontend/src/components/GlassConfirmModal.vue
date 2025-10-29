<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="glass-modal-overlay"
      @click.self="handleCancel"
    >
      <div
        ref="cardRef"
        class="glass-modal-card"
        :class="{ 'shrink-out': shrinkOut }"
        :style="cardStyle"
      >
        <div class="modal-header">
          <div class="avatar" v-if="avatar">
            <img :src="avatar" alt="avatar" />
          </div>
          <div class="title-group">
            <h3 class="title">{{ title }}</h3>
            <p class="subtitle" v-if="providerName">第三方：{{ providerName }}</p>
          </div>
        </div>
        <div class="modal-body">
          <p class="message">{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="handleCancel" @mousemove="trackMouse">{{ cancelText }}</button>
          <button class="btn btn-solid" @click="handleConfirm" @mousemove="trackMouse">
            <span class="btn-label">{{ confirmText }}</span>
            <span class="ripple" :style="rippleStyle"></span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
  </template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  avatar: { type: String, default: '' },
  providerName: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const cardRef = ref<HTMLElement | null>(null)
const shrinkOut = ref(false)
const origin = ref({ x: 0.5, y: 0.5 })
const ripple = ref({ x: 0.5, y: 0.5 })

const cardStyle = computed(() => ({
  transformOrigin: `${(origin.value.x * 100).toFixed(2)}% ${(origin.value.y * 100).toFixed(2)}%`
}))

const rippleStyle = computed(() => ({
  left: `${(ripple.value.x * 100).toFixed(2)}%`,
  top: `${(ripple.value.y * 100).toFixed(2)}%`
}))

const trackMouse = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  ripple.value = { x, y }
}

const handleConfirm = (e: MouseEvent) => {
  setOrigin(e)
  // 播放扩散与收拢
  shrinkOut.value = true
  emit('confirm')
  // 自动关闭（与父层异步处理并行）
}

const handleCancel = (e?: MouseEvent) => {
  if (e) setOrigin(e)
  emit('cancel')
}

function setOrigin(e: MouseEvent) {
  const rect = cardRef.value?.getBoundingClientRect()
  if (!rect) return
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  origin.value = { x, y }
}

watch(() => props.visible, (v) => {
  if (!v) shrinkOut.value = false
})
</script>

<style scoped>
.glass-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.glass-modal-card {
  width: min(92vw, 420px);
  color: #111;
  background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(245,246,248,0.72));
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6);
  backdrop-filter: blur(18px) saturate(1.1);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  padding: 18px 18px 16px;
  transform: translateZ(0);
  will-change: transform, opacity;
  animation: modalIn 260ms cubic-bezier(.2,.9,.2,1) both;
}

.glass-modal-card.shrink-out {
  animation: modalOut 320ms cubic-bezier(.2,.9,.2,1) both;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

.title-group { display: flex; flex-direction: column; gap: 2px; }
.title { margin: 0; font-weight: 650; font-size: 18px; color: #0f172a; }
.subtitle { margin: 0; font-size: 12px; color: #6b7280; }

.modal-body { padding: 10px 2px 2px; }
.message { margin: 0; font-size: 14px; color: #374151; line-height: 1.6; }

.modal-actions { margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px; }

.btn {
  position: relative;
  appearance: none;
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: box-shadow 180ms ease, transform 120ms ease, background 180ms ease;
  outline: none;
}

.btn-ghost {
  background: rgba(17,17,17,0.04);
  color: #111827;
}
.btn-ghost:hover { box-shadow: 0 0 0 3px rgba(17,24,39,0.08) inset; }

.btn-solid {
  background: linear-gradient(180deg, #f3f4f6, #e5e7eb);
  color: #111827;
  box-shadow: 0 10px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7);
}
.btn-solid:hover {
  box-shadow: 0 0 0 2px rgba(17,24,39,0.08) inset, 0 12px 26px rgba(0,0,0,0.16);
}
.btn-solid:active { transform: translateY(0.5px) scale(0.998); }

.btn .ripple {
  position: absolute;
  width: 14px; height: 14px;
  background: radial-gradient(circle, rgba(17,24,39,0.18), rgba(17,24,39,0) 70%);
  border-radius: 999px;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.6);
  opacity: 0;
  transition: transform 380ms ease, opacity 420ms ease;
}
.btn:hover .ripple { opacity: 1; }
.btn:active .ripple { transform: translate(-50%, -50%) scale(1.6); opacity: 0.28; }

@keyframes modalIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes modalOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.86); }
}

@media (prefers-reduced-motion: reduce) {
  .glass-modal-card, .btn .ripple { animation: none !important; transition: none !important; }
}
</style>


