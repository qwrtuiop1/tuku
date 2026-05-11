<template>
  <div class="album-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.push('/albums')" text>
          <el-icon><ArrowLeft /></el-icon>
          返回相册
        </el-button>
        <div class="album-title">
          <h1>{{ album?.album_name || '加载中...' }}</h1>
          <p v-if="album?.album_description">{{ album.album_description }}</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="showAddFilesDialog = true">
          <el-icon><Plus /></el-icon>
          添加文件
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <el-icon class="empty-icon"><Picture /></el-icon>
      <h3>相册为空</h3>
      <p>添加文件到此相册</p>
    </div>

    <div v-else class="file-grid">
      <div v-for="file in files" :key="file.id" class="file-card" @click="previewFile(file)">
        <div class="card-thumbnail">
          <img v-if="file.thumbnail_url" :src="file.thumbnail_url" class="thumb-img" />
          <img v-else-if="file.file_url" :src="file.file_url" class="thumb-img" />
          <div v-else class="thumb-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </div>
        <div class="card-info">
          <div class="file-name" :title="file.original_name">{{ file.original_name }}</div>
        </div>
        <div class="card-actions" @click.stop>
          <el-button size="small" type="danger" @click="removeFile(file.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddFilesDialog" title="添加文件到相册" width="80%" top="5vh">
      <div class="add-files-toolbar">
        <el-input v-model="searchQuery" placeholder="搜索文件..." clearable size="small" style="width: 300px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button size="small" @click="loadAllFiles">刷新</el-button>
      </div>
      <div class="file-picker-grid">
        <div
          v-for="file in allFiles"
          :key="file.id"
          class="picker-card"
          :class="{ selected: selectedFileIds.includes(file.id) }"
          @click="toggleFileSelect(file.id)"
        >
          <img v-if="file.thumbnail_url" :src="file.thumbnail_url" class="picker-img" />
          <div v-else class="picker-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
          <div v-if="selectedFileIds.includes(file.id)" class="selected-badge">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="selected-count">已选择 {{ selectedFileIds.length }} 个文件</span>
        <el-button @click="showAddFilesDialog = false">取消</el-button>
        <el-button type="primary" @click="addSelectedFiles" :loading="adding">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, Picture, Loading, Search, Check } from '@element-plus/icons-vue'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const files = ref<any[]>([])
const album = ref<any>(null)
const showAddFilesDialog = ref(false)
const allFiles = ref<any[]>([])
const selectedFileIds = ref<number[]>([])
const searchQuery = ref('')
const adding = ref(false)
const pagination = reactive({ page: 1, limit: 50, total: 0, pages: 0 })

const filteredFiles = computed(() => {
  if (!searchQuery.value) return allFiles.value
  const q = searchQuery.value.toLowerCase()
  return allFiles.value.filter(f => f.original_name?.toLowerCase().includes(q))
})

function previewFile(file: any) {
  // preview logic placeholder
}

async function loadAlbumFiles(page = 1) {
  loading.value = true
  try {
    const resp = await api.get(`/albums/${route.params.id}/files`, { params: { page, limit: 50 } })
    files.value = resp.data.files || []
    album.value = resp.data.album
    Object.assign(pagination, resp.data.pagination)
  } catch {
    ElMessage.error('加载相册失败')
  } finally {
    loading.value = false
  }
}

async function loadAllFiles() {
  try {
    const resp = await api.get('/files', { params: { limit: 200, folder_id: '' } })
    allFiles.value = resp.data.files || []
    selectedFileIds.value = []
  } catch {
    ElMessage.error('加载文件失败')
  }
}

function toggleFileSelect(id: number) {
  const idx = selectedFileIds.value.indexOf(id)
  if (idx === -1) selectedFileIds.value.push(id)
  else selectedFileIds.value.splice(idx, 1)
}

async function addSelectedFiles() {
  if (selectedFileIds.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }
  adding.value = true
  try {
    await api.post(`/albums/${route.params.id}/files`, { file_ids: selectedFileIds.value })
    ElMessage.success('已添加文件到相册')
    showAddFilesDialog.value = false
    await loadAlbumFiles()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '添加失败')
  } finally {
    adding.value = false
  }
}

async function removeFile(fileId: number) {
  try {
    await api.delete(`/albums/${route.params.id}/files/${fileId}`)
    ElMessage.success('已从相册移除')
    files.value = files.value.filter(f => f.id !== fileId)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '移除失败')
  }
}

onMounted(() => {
  loadAlbumFiles()
})
</script>

<style lang="scss" scoped>
.album-detail-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  .album-title {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 8px 0 4px;
    }

    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;

  .is-loading {
    font-size: 40px;
    color: #409eff;
  }

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

.file-grid,
.file-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.file-card,
.picker-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-thumbnail,
  .thumb-img,
  .picker-img {
    height: 140px;
    width: 100%;
    object-fit: cover;
  }

  .thumb-placeholder,
  .picker-placeholder {
    height: 140px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d1d5db;
    font-size: 48px;
  }

  .card-info {
    padding: 10px;

    .file-name {
      font-size: 12px;
      color: #374151;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .card-actions {
    padding: 0 10px 10px;
  }
}

.picker-card.selected {
  border: 2px solid #409eff;
}

.selected-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #409eff;
  color: #fff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.add-files-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.selected-count {
  margin-right: auto;
  color: #6b7280;
  font-size: 14px;
}
</style>
