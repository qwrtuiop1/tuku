<template>
  <el-dialog
    v-model="visible"
    title="文件夹详情"
    :width="isMobile ? '92%' : '640px'"
    :append-to-body="true"
    class="folder-details-dialog"
  >
    <div class="details-body">
      <div class="summary">
        <div class="folder-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="meta">
          <div class="name" :title="folder?.folder_name">{{ folder?.folder_name }}</div>
          <div class="path" v-if="path && path.length">
            <span v-for="(p, i) in path" :key="p.id" class="crumb">
              <span class="crumb-name">{{ p.name }}</span>
              <span v-if="i < path.length - 1" class="sep">/</span>
            </span>
          </div>
          <div class="created" v-if="folder?.created_at">创建时间：{{ new Date(folder.created_at).toLocaleString() }}</div>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="label">子文件夹</div>
          <div class="value">{{ subfoldersCount ?? '—' }}</div>
        </div>
        <div class="stat">
          <div class="label">文件数</div>
          <div class="value">{{ filesCount ?? '—' }}</div>
        </div>
        <div class="stat">
          <div class="label">大小</div>
          <div class="value">{{ totalSizeText }}</div>
        </div>
      </div>

      <div class="actions">
        <el-button class="gray-btn" @click="$emit('enter', folder?.id)">
          <el-icon><FolderOpened /></el-icon>
          进入
        </el-button>
        <el-button class="gray-btn" @click="$emit('rename', folder)">
          <el-icon><Edit /></el-icon>
          重命名
        </el-button>
        <el-button class="gray-btn danger" @click="$emit('delete', folder?.id)">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder as FolderIcon, FolderOpened, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  folder?: { id: number; folder_name: string; created_at?: string }
  filesCount?: number | null
  subfoldersCount?: number | null
  totalSize?: number | null
  path?: Array<{ id: number; name: string }>
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean]; enter: [number?]; rename: [any]; delete: [number?] }>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const isMobile = computed(() => window.innerWidth <= 768)

const formatSize = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) return '—'
  const units = ['B','KB','MB','GB','TB']
  let i = 0
  let num = bytes
  while (num >= 1024 && i < units.length - 1) { num /= 1024; i++ }
  return `${num.toFixed(2)} ${units[i]}`
}

const totalSizeText = computed(() => formatSize(props.totalSize ?? null))
</script>

<style scoped lang="scss">
.folder-details-dialog :deep(.el-dialog) {
  border-radius: 14px;
}

.folder-details-dialog :deep(.el-dialog__header) {
  padding: 16px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.details-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items: center;
}

.folder-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
}

.meta .name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.meta .path {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
.crumb .sep { margin: 0 4px; color: #9ca3af; }

.meta .created {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat { 
  background: #ffffff; 
  border: 1px solid #e5e7eb; 
  border-radius: 10px; 
  padding: 12px; 
}
.stat .label { font-size: 12px; color: #6b7280; }
.stat .value { font-size: 16px; color: #111827; font-weight: 700; margin-top: 6px; }

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.gray-btn { background: #fff; color: #111827; border: 1px solid #e5e7eb; }
.gray-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
.gray-btn.danger { color: #b91c1c; border-color: #fca5a5; }
.gray-btn.danger:hover { background: #fef2f2; border-color: #ef4444; }

@media (max-width: 480px) {
  .stats { grid-template-columns: 1fr; }
  .actions { grid-template-columns: 1fr; }
}
</style>


