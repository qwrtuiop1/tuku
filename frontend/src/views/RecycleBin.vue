<template>
  <div class="recycle-bin-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">回收站</h1>
          <p class="page-subtitle">已删除的文件将在 {{ recycleDays === 0 ? '永久保留' : recycleDays + '天后自动清理' }}</p>
        </div>
        <div class="header-actions">
          <el-button @click="() => loadRecycleBin()" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="restoreAll" :disabled="items.length === 0" type="success">
            <el-icon><RefreshLeft /></el-icon>
            全部恢复
          </el-button>
          <el-button @click="purgeAll" :disabled="items.length === 0" type="danger">
            <el-icon><Delete /></el-icon>
            清空回收站
          </el-button>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <el-card class="filter-card">
        <el-select v-model="selectedItems" multiple placeholder="选择文件" style="width: 100%" :max-collapse-tags="3">
          <el-option
            v-for="item in items"
            :key="item.id"
            :label="item.original_name"
            :value="item.id"
          />
        </el-select>
      </el-card>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>正在加载...</p>
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <el-icon class="empty-icon"><Delete /></el-icon>
      <h3>回收站为空</h3>
      <p>删除的文件会暂时保存在这里</p>
    </div>

    <div v-else class="file-grid">
      <div v-for="item in items" :key="item.id" class="recycle-card">
        <div class="card-thumbnail" @click="toggleSelect(item.id)">
          <el-checkbox :model-value="selectedItems.includes(item.id)" @click.stop />
          <img v-if="item.file_type === 'image'" :src="getThumbUrl(item)" class="thumb-img" />
          <div v-else class="video-thumb">
            <el-icon><VideoCamera /></el-icon>
          </div>
        </div>
        <div class="card-info">
          <div class="file-name" :title="item.original_name">{{ item.original_name }}</div>
          <div class="file-meta">
            <span>{{ formatFileSize(item.file_size) }}</span>
            <span>{{ formatTimeLeft(item.expire_at) }}</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" type="success" @click="restoreItem(item.id)">
            <el-icon><RefreshLeft /></el-icon>
            恢复
          </el-button>
          <el-button size="small" type="danger" @click="deleteItem(item.id)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="pagination.pages > 1" class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="(p) => loadRecycleBin(p)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, RefreshLeft, Delete, Loading, VideoCamera } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { formatFileSize } from '@/utils/helpers'

const loading = ref(false)
const items = ref<any[]>([])
const selectedItems = ref<number[]>([])
const recycleDays = ref(30)
const pagination = reactive({ page: 1, limit: 20, total: 0, pages: 0 })
const backendDomain = import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'

function getThumbUrl(item: any) {
  if (item.thumbnail_path) {
    const normalized = item.thumbnail_path.replace(/\\/g, '/').replace(/^\//, '')
    return `${backendDomain}/uploads/${normalized}`
  }
  return ''
}

function formatTimeLeft(expireAt: string) {
  const now = Date.now()
  const expire = new Date(expireAt).getTime()
  const diff = expire - now
  if (diff <= 0) return '已过期'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return new Date(expireAt).toLocaleDateString()
  if (days === 0) return '今天过期'
  return `${days}天后过期`
}

function toggleSelect(id: number) {
  const idx = selectedItems.value.indexOf(id)
  if (idx === -1) selectedItems.value.push(id)
  else selectedItems.value.splice(idx, 1)
}

async function loadRecycleBin(page = 1) {
  loading.value = true
  try {
    const resp = await api.get('/recycle', { params: { page, limit: 20 } })
    items.value = resp.data.items || []
    Object.assign(pagination, resp.data.pagination)
  } catch {
    ElMessage.error('加载回收站失败')
  } finally {
    loading.value = false
  }
}

async function restoreItem(id: number) {
  try {
    await api.post('/recycle/restore', { file_ids: [id] })
    ElMessage.success('文件已恢复')
    await loadRecycleBin()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '恢复失败')
  }
}

async function deleteItem(id: number) {
  try {
    await ElMessageBox.confirm('确定要彻底删除此文件吗？此操作不可恢复。', '确认删除', { type: 'warning' })
    await api.delete('/recycle', { data: { file_ids: [id] } })
    ElMessage.success('文件已彻底删除')
    await loadRecycleBin(pagination.page)
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '删除失败')
  }
}

async function restoreAll() {
  const ids = selectedItems.value.length > 0 ? selectedItems.value : items.value.map(i => i.id)
  if (ids.length === 0) return
  try {
    await api.post('/recycle/restore', { file_ids: ids })
    ElMessage.success('文件已恢复')
    selectedItems.value = []
    await loadRecycleBin(pagination.page)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '恢复失败')
  }
}

async function purgeAll() {
  try {
    await ElMessageBox.confirm('确定要清空回收站吗？此操作不可恢复。', '确认清空', { type: 'warning' })
    await api.delete('/recycle/purge')
    ElMessage.success('回收站已清空')
    await loadRecycleBin(1)
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '清空失败')
  }
}

async function loadSettings() {
  try {
    const resp = await api.get('/recycle/settings')
    recycleDays.value = resp.data.recycle_days
  } catch {}
}

onMounted(() => {
  loadRecycleBin()
  loadSettings()
})
</script>

<style lang="scss" scoped>
.recycle-bin-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px;
  }

  .page-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.filter-section {
  margin-bottom: 20px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #6b7280;

  .is-loading {
    font-size: 40px;
    color: #409eff;
    margin-bottom: 16px;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    color: #374151;
    margin: 0 0 8px;
  }

  p {
    color: #9ca3af;
    margin: 0;
  }
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.recycle-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-thumbnail {
    position: relative;
    height: 160px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .el-checkbox {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 1;
    }

    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-thumb {
      color: #9ca3af;
      font-size: 48px;
    }
  }

  .card-info {
    padding: 12px;

    .file-name {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }

    .file-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9ca3af;
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
    padding: 0 12px 12px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
