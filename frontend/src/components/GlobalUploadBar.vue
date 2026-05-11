<template>
  <transition name="slide-up">
    <div
      v-if="!showUploadDialog && globalBarVisible"
      class="global-upload-bar"
    >
      <div class="gub-header">
        <span class="gub-title">
          <el-icon class="gub-icon"><Upload /></el-icon>
          {{ filesStore.uploadStats.error > 0
            ? `完成 · ${filesStore.uploadStats.success} 成功，${filesStore.uploadStats.error} 失败`
            : filesStore.uploadItems.every(i => i.status === 'success')
              ? `已完成 · ${filesStore.uploadStats.success} 个文件`
              : `上传中 · ${filesStore.uploadStats.success}/${filesStore.uploadItems.length} 完成` }}
        </span>
        <el-button size="small" type="text" @click="$emit('openUpload')"
          >查看详情</el-button
        >
      </div>
      <el-progress
        :percentage="globalUploadPercent"
        :stroke-width="4"
        :show-text="false"
        :color="globalUploadColor"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'

defineProps<{ showUploadDialog: boolean }>()
defineEmits<{ openUpload: [] }>()

const filesStore = useFilesStore()

const globalUploadPercent = computed(() => {
  const items = filesStore.uploadItems
  if (!items.length) return 0
  const done = items.filter(
    i => i.status === 'success' || i.status === 'error' || i.status === 'canceled',
  ).length
  return Math.round((done / items.length) * 100)
})

const globalUploadColor = computed(() => {
  const items = filesStore.uploadItems
  if (!items.length) return '#667eea'
  if (items.every(i => i.status === 'success')) return '#16a34a'
  if (items.some(i => i.status === 'error')) return '#dc2626'
  return '#2563eb'
})

const globalBarVisible = ref(false)
let globalBarTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => filesStore.uploadItems,
  (items) => {
    if (!items.length) { globalBarVisible.value = false; return }
    const allDone = items.every(
      i => i.status === 'success' || i.status === 'error' || i.status === 'canceled',
    )
    const hasError = items.some(i => i.status === 'error')
    if (allDone) {
      if (!hasError) {
        if (globalBarTimer) clearTimeout(globalBarTimer)
        globalBarTimer = setTimeout(() => { globalBarVisible.value = false }, 2000)
      } else {
        globalBarVisible.value = true
      }
    } else {
      if (globalBarTimer) { clearTimeout(globalBarTimer); globalBarTimer = null }
      globalBarVisible.value = true
    }
  },
  { deep: true },
)
</script>

<style scoped lang="scss">
.global-upload-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .gub-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .gub-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  .gub-icon {
    font-size: 16px;
    color: #2563eb;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
