<template>
  <div class="albums-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">我的相册</h1>
          <p class="page-subtitle">整理您的图片收藏</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建相册
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <div v-else-if="albums.length === 0" class="empty-state">
      <el-icon class="empty-icon"><Picture /></el-icon>
      <h3>暂无相册</h3>
      <p>创建第一个相册来整理您的图片</p>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建相册
      </el-button>
    </div>

    <div v-else class="album-grid">
      <div v-for="album in albums" :key="album.id" class="album-card" @click="goToAlbum(album.id)">
        <div class="album-cover">
          <img v-if="album.cover_url" :src="album.cover_url" class="cover-img" />
          <div v-else class="cover-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </div>
        <div class="album-info">
          <div class="album-name">{{ album.album_name }}</div>
          <div class="album-meta">{{ album.file_count }} 个文件</div>
        </div>
        <div class="album-actions" @click.stop>
          <el-button size="small" type="primary" @click="editAlbum(album)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button size="small" type="danger" @click="deleteAlbum(album.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="showCreateDialog" :title="editingAlbum ? '编辑相册' : '新建相册'" width="450px">
      <el-form :model="albumForm" label-width="80px">
        <el-form-item label="相册名称">
          <el-input v-model="albumForm.album_name" placeholder="输入相册名称" />
        </el-form-item>
        <el-form-item label="相册描述">
          <el-input v-model="albumForm.album_description" type="textarea" :rows="3" placeholder="可选描述" />
        </el-form-item>
        <el-form-item label="公开相册">
          <el-switch v-model="albumForm.is_public" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAlbum" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Picture, Loading } from '@element-plus/icons-vue'
import api from '@/utils/api'

const router = useRouter()
const loading = ref(false)
const albums = ref<any[]>([])
const showCreateDialog = ref(false)
const editingAlbum = ref<any>(null)
const saving = ref(false)
const albumForm = reactive({
  album_name: '',
  album_description: '',
  is_public: false
})

function goToAlbum(id: number) {
  router.push(`/albums/${id}`)
}

async function loadAlbums() {
  loading.value = true
  try {
    const resp = await api.get('/albums')
    albums.value = resp.data.albums || []
  } catch {
    ElMessage.error('加载相册失败')
  } finally {
    loading.value = false
  }
}

function editAlbum(album: any) {
  editingAlbum.value = album
  albumForm.album_name = album.album_name
  albumForm.album_description = album.album_description || ''
  albumForm.is_public = !!album.is_public
  showCreateDialog.value = true
}

async function saveAlbum() {
  if (!albumForm.album_name.trim()) {
    ElMessage.warning('请输入相册名称')
    return
  }
  saving.value = true
  try {
    if (editingAlbum.value) {
      await api.put(`/albums/${editingAlbum.value.id}`, albumForm)
      ElMessage.success('相册已更新')
    } else {
      await api.post('/albums', albumForm)
      ElMessage.success('相册创建成功')
    }
    showCreateDialog.value = false
    editingAlbum.value = null
    albumForm.album_name = ''
    albumForm.album_description = ''
    albumForm.is_public = false
    await loadAlbums()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteAlbum(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除此相册吗？', '确认删除', { type: 'warning' })
    await api.delete(`/albums/${id}`)
    ElMessage.success('相册已删除')
    await loadAlbums()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '删除失败')
  }
}

onMounted(() => loadAlbums())
</script>

<style lang="scss" scoped>
.albums-page {
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
}

.loading-state {
  text-align: center;
  padding: 60px;

  .is-loading {
    font-size: 40px;
    color: #409eff;
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
    margin: 0 0 16px;
  }
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.album-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .album-cover {
    height: 180px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      color: #d1d5db;
      font-size: 64px;
    }
  }

  .album-info {
    padding: 14px;

    .album-name {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .album-meta {
      font-size: 12px;
      color: #9ca3af;
    }
  }

  .album-actions {
    display: flex;
    gap: 8px;
    padding: 0 14px 14px;
  }
}
</style>
