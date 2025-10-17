<template>
  <div class="files-page">
    <!-- 桌面端工具栏 -->
    <div class="desktop-toolbar">
      <div class="unified-toolbar">
        <!-- 主要操作 -->
        <div class="toolbar-main">
          <el-button type="primary" @click="showUploadDialog = true" class="action-btn">
            <el-icon><Upload /></el-icon>
            <span>上传</span>
          </el-button>
          <el-button @click="showCreateFolderDialog = true" class="action-btn">
            <el-icon><FolderAdd /></el-icon>
            <span>新建</span>
          </el-button>
          <el-button @click="refreshFiles" class="action-btn">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
        
        <!-- 搜索和筛选 -->
        <div class="toolbar-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文件..."
            clearable
            @input="handleSearch"
            size="small"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-dropdown @command="handleSortChange" class="sort-dropdown">
            <el-button size="small" class="sort-btn">
              <el-icon><Sort /></el-icon>
              <span>排序</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="name">按名称</el-dropdown-item>
                <el-dropdown-item command="size">按大小</el-dropdown-item>
                <el-dropdown-item command="date">按时间</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 视图和批量操作 -->
        <div class="toolbar-actions">
          <!-- 视图切换 -->
          <el-button-group class="view-toggle">
            <el-tooltip content="网格视图" placement="bottom">
              <el-button 
                :type="viewMode === 'grid' ? 'primary' : ''" 
                @click="viewMode = 'grid'"
                size="small"
                class="view-btn"
              >
                <el-icon><Grid /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="列表视图" placement="bottom">
              <el-button 
                :type="viewMode === 'list' ? 'primary' : ''" 
                @click="viewMode = 'list'"
                size="small"
                class="view-btn"
              >
                <el-icon><List /></el-icon>
              </el-button>
            </el-tooltip>
          </el-button-group>
          
          <!-- 批量操作 -->
          <el-button-group v-if="selectedFiles.length > 0" class="batch-actions">
            <el-button @click="batchDownload" size="small" class="batch-btn">
              <el-icon><Download /></el-icon>
              <span>下载</span>
            </el-button>
            <el-button @click="batchDelete" size="small" type="danger" class="batch-btn">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 移动端工具栏 -->
    <div class="mobile-toolbar">
      <!-- 主要操作区域 -->
      <div class="mobile-actions">
        <el-button type="primary" @click="showUploadDialog = true" class="mobile-upload-btn">
          <el-icon><Upload /></el-icon>
          <span>上传</span>
        </el-button>
        <el-button @click="showCreateFolderDialog = true" class="mobile-folder-btn">
          <el-icon><FolderAdd /></el-icon>
          <span>新建</span>
        </el-button>
        <el-button @click="refreshFiles" class="mobile-refresh-btn">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
      
      <!-- 搜索和控制区域 -->
      <div class="mobile-controls">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文件..."
          clearable
          @input="handleSearch"
          size="small"
          class="mobile-search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-dropdown @command="handleSortChange" class="mobile-sort-dropdown">
          <el-button size="small" class="mobile-sort-btn">
            <el-icon><Sort /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="name">按名称</el-dropdown-item>
              <el-dropdown-item command="size">按大小</el-dropdown-item>
              <el-dropdown-item command="date">按时间</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button-group class="mobile-view-toggle">
          <el-button 
            :type="viewMode === 'grid' ? 'primary' : ''" 
            @click="viewMode = 'grid'"
            size="small"
            class="mobile-view-btn"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            @click="viewMode = 'list'"
            size="small"
            class="mobile-view-btn"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <!-- 批量操作区域 -->
      <div v-if="selectedFiles.length > 0" class="mobile-batch-bar">
        <div class="batch-info">
          已选择 {{ selectedFiles.length }} 个项目
        </div>
        <div class="batch-actions-mobile">
          <el-button @click="batchDownload" size="small" class="mobile-batch-btn">
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button @click="batchDelete" size="small" type="danger" class="mobile-batch-btn">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    </div>

    <!-- 面包屑导航 -->
    <div v-if="filesStore.currentFolder" class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <el-button type="text" @click="goToRootFolder" class="breadcrumb-btn">
            <el-icon><House /></el-icon>
            根目录
          </el-button>
        </el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(folder, index) in folderPath" 
          :key="folder.id"
        >
          <el-button 
            v-if="index < folderPath.length - 1"
            type="text" 
            @click="goToFolder(folder.id)" 
            class="breadcrumb-btn"
          >
            {{ folder.name }}
          </el-button>
          <span v-else class="current-folder">{{ folder.name }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 文件内容区域 -->
    <div class="file-content">
      <!-- 空状态 -->
      <div v-if="allItems.length === 0 && !filesStore.loading" class="empty-state">
        <div class="empty-content">
          <el-icon class="empty-icon"><Picture /></el-icon>
          <h3 class="empty-title">暂无文件</h3>
          <p class="empty-description">上传您的第一张图片或视频开始使用</p>
          <el-button type="primary" @click="showUploadDialog = true">
            <el-icon><Upload /></el-icon>
            <span>上传文件</span>
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-else-if="filesStore.loading" class="loading-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p class="loading-text">正在加载文件...</p>
      </div>
      
      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="file-grid">
        <div 
          v-for="item in paginatedFiles" 
          :key="item.id"
          class="file-card"
          :class="{ 
            'selected': selectedFiles.includes(item.id),
            'folder-card': item.isFolder,
            'long-pressed': longPressedCards.has(item.id)
          }"
          @click="!isMobile && handleItemClick(item, $event)"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="(event) => handleTouchEnd(event, item)"
          @contextmenu="handleContextMenu($event, item)"
          @mousedown="(event) => handleMouseDown(event, item)"
          @mouseup="(event) => handleMouseUp(event, item)"
          @mouseleave="(event) => { handleMouseLeave(event, item); hideQuickPreview() }"
          @mouseenter="!item.isFolder && showQuickPreview(item, $event)"
        >
          <div class="card-checkbox" @click.stop @touchstart.stop @touchend.stop>
            <el-checkbox 
              :model-value="selectedFiles.includes(item.id)"
              @change="(checked) => toggleFileSelection(item.id, $event)"
              @click.stop
            />
          </div>
          
          <div class="card-thumbnail">
            <!-- 文件夹图标 -->
            <div v-if="item.isFolder" class="folder-thumbnail">
              <el-icon class="folder-icon"><Folder /></el-icon>
            </div>
            <!-- 文件缩略图 -->
            <FileThumbnail 
              v-else
              :file="item" 
              size="medium"
              @click="(file) => handleFileClick(file)"
            />
          </div>
          
          <div class="card-info">
            <div class="file-name" :title="item.original_name">
              {{ item.original_name }}
            </div>
            <div class="file-meta">
              <span v-if="item.isFolder">文件夹</span>
              <span v-else>{{ formatFileSize(item.file_size) }} • {{ formatTime(item.created_at) }}</span>
            </div>
          </div>
          
          <div class="card-actions" @touchstart.stop @touchmove.stop @touchend.stop>
            <el-button v-if="!item.isFolder" type="text" size="small" @click.stop="downloadFile(item)" class="action-btn">
              <el-icon><Download /></el-icon>
              <span>下载</span>
            </el-button>
            <el-button v-if="!item.isFolder" type="text" size="small" @click.stop="shareFileAction(item)" class="action-btn">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </el-button>
            <el-button type="text" size="small" @click.stop="renameItem(item)" class="action-btn">
              <el-icon><Edit /></el-icon>
              <span>重命名</span>
            </el-button>
            <el-button type="text" size="small" @click.stop="deleteItem(item)" class="action-btn danger">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-else-if="viewMode === 'list'" class="file-list">
        <el-table 
          :data="paginatedFiles" 
          @row-click="handleItemClick"
          @selection-change="handleSelectionChange"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="original_name" label="名称" min-width="200">
            <template #default="{ row }">
              <div class="file-name-cell">
                <el-icon class="file-type-icon">
                  <Folder v-if="row.isFolder" />
                  <Picture v-else-if="row.file_type === 'image'" />
                  <VideoPlay v-else />
                </el-icon>
                <span>{{ row.original_name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="file_size" label="大小" width="120">
            <template #default="{ row }">
              <span v-if="row.isFolder">-</span>
              <span v-else>{{ formatFileSize(row.file_size) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.created_at) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="file-actions">
                <el-button v-if="!row.isFolder" type="text" size="small" @click="downloadFile(row)" class="action-btn">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button v-if="!row.isFolder" type="text" size="small" @click="shareFileAction(row)" class="action-btn">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
                <el-button type="text" size="small" @click="renameItem(row)" class="action-btn">
                  <el-icon><Edit /></el-icon>
                  重命名
                </el-button>
                <el-button type="text" size="small" @click="deleteItem(row)" class="action-btn danger">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div v-if="allItems.length > 0 && totalPages > 1" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="allItems.length"
          layout="prev, pager, next, total"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 快速预览 -->
    <QuickPreview
      v-if="quickPreviewFile"
      :file="quickPreviewFile"
      :visible="showQuickPreviewDialog"
    />

    <!-- 右键菜单 -->
    <div 
      v-if="showContextMenu" 
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
      @click.stop
    >
      <!-- 文件操作 -->
      <template v-if="contextFile && !contextFile.isFolder">
      <div class="context-menu-item" @click="previewContextFile">
        <el-icon><View /></el-icon>
        预览
      </div>
      <div class="context-menu-item" @click="downloadContextFile">
        <el-icon><Download /></el-icon>
        下载
      </div>
      <div class="context-menu-item" @click="shareContextFile">
        <el-icon><Share /></el-icon>
        分享
      </div>
      <div class="context-menu-item" @click="copyFileUrl">
        <el-icon><Link /></el-icon>
        复制链接
      </div>
      <div class="context-menu-divider"></div>
        <div class="context-menu-item" @click="renameContextItem">
          <el-icon><Edit /></el-icon>
          重命名
        </div>
      <div class="context-menu-item danger" @click="deleteContextFile">
        <el-icon><Delete /></el-icon>
        删除
      </div>
      </template>
      
      <!-- 文件夹操作 -->
      <template v-else-if="contextFile && contextFile.isFolder">
        <div class="context-menu-item" @click="enterContextFolder">
          <el-icon><FolderOpened /></el-icon>
          进入文件夹
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" @click="renameContextItem">
          <el-icon><Edit /></el-icon>
          重命名
        </div>
        <div class="context-menu-item danger" @click="deleteContextFile">
          <el-icon><Delete /></el-icon>
          删除
        </div>
      </template>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文件"
      :width="isMobile ? '95%' : '600px'"
      :close-on-click-modal="false"
      :class="{ 'mobile-upload-dialog': isMobile }"
      :modal-class="isMobile ? 'mobile-modal' : ''"
    >
      <FileUploader @upload-success="handleUploadSuccess" />
    </el-dialog>

    <!-- 增强预览对话框 -->
    <EnhancedPreviewDialog
      v-model="showPreviewDialog"
      :file="previewFile"
      :files="filteredFiles"
      :initial-index="previewFileIndex"
      @file-deleted="handleFileDeleted"
      @file-change="handlePreviewFileChange"
      @touchstart="handlePreviewTouchStart"
      @touchend="handlePreviewTouchEnd"
      @touchmove="handlePreviewTouchMove"
    />

    <!-- 分享对话框 -->
    <el-dialog
      v-model="showShareDialog"
      title="分享文件"
      width="500px"
    >
      <div class="share-content">
        <div class="share-info">
          <h4>{{ shareFile?.original_name }}</h4>
          <p>文件大小: {{ formatFileSize(shareFile?.file_size || 0) }}</p>
        </div>
        
        <div class="share-link">
          <el-input
            v-model="shareUrl"
            readonly
            placeholder="生成分享链接..."
          >
            <template #append>
              <el-button @click="copyShareUrl">复制</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="share-options">
          <el-checkbox v-model="shareOptions.allowDownload">允许下载</el-checkbox>
          <el-checkbox v-model="shareOptions.allowPreview">允许预览</el-checkbox>
          <el-checkbox v-model="shareOptions.expireIn24h">24小时后过期</el-checkbox>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showShareDialog = false">取消</el-button>
        <el-button type="primary" @click="generateShareLink">生成链接</el-button>
      </template>
    </el-dialog>

    <!-- 创建文件夹对话框 -->
    <el-dialog
      v-model="showCreateFolderDialog"
      title="新建文件夹"
      :width="isMobile ? '90%' : '400px'"
      :class="{ 'mobile-folder-dialog': isMobile }"
      :modal-class="isMobile ? 'mobile-modal' : ''"
    >
      <el-form :model="folderForm" :rules="folderRules" ref="folderFormRef">
        <el-form-item prop="name">
          <el-input
            v-model="folderForm.name"
            placeholder="请输入文件夹名称"
            @keyup.enter="createFolder"
            :class="{ 'mobile-input': isMobile }"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div :class="{ 'mobile-footer': isMobile }">
          <el-button @click="showCreateFolderDialog = false" :class="{ 'mobile-btn': isMobile }">取消</el-button>
          <el-button type="primary" @click="createFolder" :class="{ 'mobile-btn': isMobile }">创建</el-button>
        </div>
      </template>
    </el-dialog>
    
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import {
  Upload,
  FolderAdd,
  Delete,
  Search,
  Grid,
  List,
  House,
  Folder,
  Picture,
  VideoPlay,
  View,
  Download,
  Link,
  Refresh,
  Setting,
  Share,
  Sort,
  Close,
  Edit,
  QuestionFilled,
  InfoFilled,
  StarFilled,
  Document
} from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'
import { useAuthStore } from '@/stores/auth'
import { formatFileSize, formatTime, getFilePreviewUrl, downloadFile as downloadFileUtil, copyToClipboard } from '@/utils/helpers'
import FileUploader from '@/components/FileUploader.vue'
import FilePreview from '@/components/FilePreview.vue'
import FileThumbnail from '@/components/FileThumbnail.vue'
import EnhancedPreviewDialog from '@/components/EnhancedPreviewDialog.vue'
import QuickPreview from '@/components/QuickPreview.vue'

const router = useRouter()
const filesStore = useFilesStore()
const authStore = useAuthStore()

// 响应式数据
const showUploadDialog = ref(false)
const showCreateFolderDialog = ref(false)
const showPreviewDialog = ref(false)
const showShareDialog = ref(false)
const previewFile = ref(null)
const previewFileIndex = ref(0)
const shareFile = ref(null)
const quickPreviewFile = ref(null)
const showQuickPreviewDialog = ref(false)
const quickPreviewTimer = ref(null)
const shareUrl = ref('')
const contextFile = ref(null)
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const folderFormRef = ref<InstanceType<typeof ElForm>>()
const sortBy = ref('name')
const sortOrder = ref('asc')
const selectedFiles = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid')

// 加载用户视图设置
const loadViewSettings = () => {
  try {
    const savedView = localStorage.getItem('userPreferences')
    if (savedView) {
      const preferences = JSON.parse(savedView)
      if (preferences.defaultView && ['grid', 'list'].includes(preferences.defaultView)) {
        viewMode.value = preferences.defaultView
      }
    }
  } catch (error) {
  }
}

// 搜索
const searchQuery = ref('')

// 文件夹路径
const folderPath = ref<Array<{id: number, name: string}>>([])

// 文件夹表单
const folderForm = reactive({
  name: ''
})

const folderRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { min: 1, max: 50, message: '文件夹名称长度应在1-50个字符之间', trigger: 'blur' }
  ]
}

// 分享选项
const shareOptions = reactive({
  allowDownload: true,
  allowPreview: true,
  expireIn24h: false
})

// 计算属性
const filteredFiles = computed(() => {
  let files = filesStore.files
  
  if (searchQuery.value) {
    files = files.filter(file => 
      file.original_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return files.sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc' 
        ? a.original_name.localeCompare(b.original_name)
        : b.original_name.localeCompare(a.original_name)
    } else if (sortBy.value === 'size') {
      return sortOrder.value === 'asc' 
        ? a.file_size - b.file_size
        : b.file_size - a.file_size
    } else if (sortBy.value === 'date') {
      return sortOrder.value === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })
})

// 过滤文件夹
const filteredFolders = computed(() => {
  let folders = filesStore.folders
  
  if (searchQuery.value) {
    folders = folders.filter(folder => 
      folder.folder_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return folders.sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc' 
        ? a.folder_name.localeCompare(b.folder_name)
        : b.folder_name.localeCompare(a.folder_name)
    } else if (sortBy.value === 'date') {
      return sortOrder.value === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })
})

// 合并文件夹和文件
const allItems = computed(() => {
  const items = []
  
  // 添加文件夹（标记为文件夹类型）
  filteredFolders.value.forEach(folder => {
    items.push({
      ...folder,
      isFolder: true,
      original_name: folder.folder_name,
      file_size: 0,
      file_type: 'folder'
    })
  })
  
  // 添加文件
  filteredFiles.value.forEach(file => {
    items.push({
      ...file,
      isFolder: false
    })
  })
  
  // 重新排序
  return items.sort((a, b) => {
    // 文件夹优先显示
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc' 
        ? a.original_name.localeCompare(b.original_name)
        : b.original_name.localeCompare(a.original_name)
    } else if (sortBy.value === 'size') {
      return sortOrder.value === 'asc' 
        ? a.file_size - b.file_size
        : b.file_size - a.file_size
    } else if (sortBy.value === 'date') {
      return sortOrder.value === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })
})

const totalPages = computed(() => {
  return Math.ceil(allItems.value.length / pageSize.value)
})

// 响应式检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allItems.value.slice(start, end)
})

// 方法
const refreshFiles = () => {
  filesStore.fetchFiles(1)
  filesStore.fetchFolders()
  ElMessage.success('文件列表已刷新')
}

const goToAdmin = () => {
  router.push('/admin')
}

const goToRootFolder = () => {
  filesStore.currentFolder = null
  folderPath.value = []
  filesStore.fetchFiles(1)
  filesStore.fetchFolders()
  ElMessage.info('已返回根目录')
}

const goToFolder = async (folderId: number) => {
  filesStore.currentFolder = folderId
  await updateFolderPath(folderId)
  filesStore.fetchFiles(1)
  filesStore.fetchFolders()
}

const updateFolderPath = async (folderId: number) => {
  try {
    const path = await filesStore.fetchFolderPath(folderId)
    folderPath.value = path
    
    // 重置长按状态，确保返回时按钮回到初始状态
    resetLongPressState()
  } catch (error) {
    folderPath.value = []
  }
}

// 移动端触摸手势支持
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)

// 响应式操作逻辑适配
const isTablet = ref(false)
const isDesktop = ref(false)

// 检测屏幕尺寸
const checkScreenSize = () => {
  const width = window.innerWidth
  isTablet.value = width > 768 && width <= 1024
  isDesktop.value = width > 1024
}

// 监听窗口大小变化
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 根据屏幕尺寸调整长按延迟
const getLongPressDelay = () => {
  if (isMobile.value) return 2000 // 移动端2秒
  if (isTablet.value) return 1500 // 平板1.5秒
  return 1000 // 桌面端1秒
}

// 移动端长按功能
const longPressTimer = ref<NodeJS.Timeout | null>(null)
const longPressDelay = ref(800) // 动态长按延迟时间
const isLongPressing = ref(false) // 长按状态标识
const longPressItem = ref<any>(null) // 长按的项目
const touchMoved = ref(false) // 触摸是否移动
const touchThreshold = 15 // 触摸移动阈值（像素）
const longPressedCards = ref<Set<number>>(new Set()) // 长按的卡片ID集合

const handleLongPress = (item: any) => {
  // 设置长按状态
  isLongPressing.value = true
  longPressItem.value = item
  
  // 在移动端，只显示统一的 context-menu
  if (isMobile.value) {
    // 移动端统一使用 context-menu
    handleContextMenu(new MouseEvent('contextmenu'), item)
    ElMessage.info('长按触发菜单')
  } else {
    // 桌面端显示 card-actions 和 context-menu
  if (item.isFolder) {
      longPressedCards.value.add(item.id)
      startAutoResetTimer()
    }
    handleContextMenu(new MouseEvent('contextmenu'), item)
    ElMessage.info('长按触发上下文菜单')
  }
  
  // 设置长按状态重置定时器
  setTimeout(() => {
    isLongPressing.value = false
    longPressItem.value = null
  }, 200) // 200ms后重置状态
}

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
  touchStartTime.value = Date.now()
  
  // 重置状态
  touchMoved.value = false
  isLongPressing.value = false
  longPressItem.value = null
  
  // 清除之前的长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  // 检查是否点击了checkbox区域或操作按钮区域
  const target = event.target as HTMLElement
  if (target.closest('.card-checkbox') || target.closest('.card-actions')) {
    // 如果点击的是checkbox或操作按钮，不设置长按定时器
    return
  }
  
  // 设置长按定时器，时间到达后直接显示菜单
  longPressTimer.value = setTimeout(() => {
    // 只有在没有移动的情况下才触发长按
    if (!touchMoved.value) {
      const currentItem = event.target as HTMLElement
      const fileCard = currentItem.closest('.file-card')
      if (fileCard) {
        const itemId = fileCard.getAttribute('data-item-id')
        // 根据itemId找到对应的item
        const allItems = filesStore.folders.map(folder => ({
          ...folder,
          isFolder: true,
          original_name: folder.folder_name
        })).concat(filesStore.files.map(file => ({
          ...file,
          isFolder: false
        })))
        
        const item = allItems.find(item => item.id == itemId)
        if (item) {
          // 直接显示菜单，不等松手
          handleLongPress(item)
        }
      }
    }
  }, getLongPressDelay())
}

// 触摸移动检测
const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length > 0) {
    const touchCurrentX = event.touches[0].clientX
    const touchCurrentY = event.touches[0].clientY
    
    const deltaX = Math.abs(touchCurrentX - touchStartX.value)
    const deltaY = Math.abs(touchCurrentY - touchStartY.value)
    
    // 如果移动距离超过阈值，标记为移动
    if (deltaX > touchThreshold || deltaY > touchThreshold) {
      touchMoved.value = true
      
      // 如果正在长按，取消长按
      if (isLongPressing.value) {
        isLongPressing.value = false
        longPressItem.value = null
      }
      
      // 清除长按定时器
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }
  }
}

// 移动端双击放大功能
const lastTapTime = ref(0)
const tapCount = ref(0)

const handleDoubleTap = (item: any) => {
  const currentTime = Date.now()
  const tapLength = currentTime - lastTapTime.value
  
  if (tapLength < 500 && tapLength > 0) {
    // 双击事件
    tapCount.value++
    if (tapCount.value === 2) {
      // 双击图片文件时放大预览
      if (!item.isFolder && (item.file_type === 'image' || item.file_type === 'video')) {
        handleFileClick(item)
      }
      // 双击预览图片时重置缩放
      if (showPreviewDialog.value && previewFile.value) {
        resetZoom()
      }
      tapCount.value = 0
    }
  } else {
    tapCount.value = 1
  }
  
  lastTapTime.value = currentTime
}

const handleTouchEnd = (event: TouchEvent, item: any) => {
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  const touchEndX = event.changedTouches[0].clientX
  const touchEndY = event.changedTouches[0].clientY
  const touchEndTime = Date.now()
  
  const deltaX = Math.abs(touchEndX - touchStartX.value)
  const deltaY = Math.abs(touchEndY - touchStartY.value)
  const deltaTime = touchEndTime - touchStartTime.value
  
  // 如果已经触发了长按菜单，不处理点击事件
  if (isLongPressing.value) {
    // 清除长按定时器
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
    return
  }
  
  // 判断是否为点击（移动距离小于阈值，时间小于300ms）
  if (deltaX < touchThreshold && deltaY < touchThreshold && deltaTime < 300 && !touchMoved.value) {
    // 检查是否点击了checkbox区域或操作按钮区域
    const target = event.target as HTMLElement
    if (target.closest('.card-checkbox') || target.closest('.card-actions')) {
      // 如果点击的是checkbox或操作按钮，不处理点击事件
      return
    }
    
    // 先处理双击检测
    handleDoubleTap(item)
    
    // 延迟执行单击，避免与双击冲突
    setTimeout(() => {
      if (tapCount.value === 1) {
        handleItemClick(item, event)
        tapCount.value = 0
      }
    }, 300)
  }
  
  // 重置状态
  touchMoved.value = false
}

// 移动端滑动切换功能
const swipeThreshold = 50 // 滑动阈值
const swipeStartX = ref(0)
const swipeStartY = ref(0)

const handleSwipeStart = (event: TouchEvent) => {
  swipeStartX.value = event.touches[0].clientX
  swipeStartY.value = event.touches[0].clientY
}

const handleSwipeEnd = (event: TouchEvent) => {
  const swipeEndX = event.changedTouches[0].clientX
  const swipeEndY = event.changedTouches[0].clientY
  
  const deltaX = swipeEndX - swipeStartX.value
  const deltaY = swipeEndY - swipeStartY.value
  
  // 判断是否为水平滑动
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
    if (deltaX > 0) {
      // 向右滑动 - 上一张
      if (showPreviewDialog.value && previewFile.value) {
        const imageFiles = filesStore.files.filter(f => f.file_type === 'image')
        const currentIndex = imageFiles.findIndex(f => f.id === previewFile.value.id)
        if (currentIndex > 0) {
          previewFile.value = imageFiles[currentIndex - 1]
          previewFileIndex.value = currentIndex - 1
        }
      }
    } else {
      // 向左滑动 - 下一张
      if (showPreviewDialog.value && previewFile.value) {
        const imageFiles = filesStore.files.filter(f => f.file_type === 'image')
        const currentIndex = imageFiles.findIndex(f => f.id === previewFile.value.id)
        if (currentIndex < imageFiles.length - 1) {
          previewFile.value = imageFiles[currentIndex + 1]
          previewFileIndex.value = currentIndex + 1
        }
      }
    }
  }
}

// 移动端图片缩放功能
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const lastDistance = ref(0)
const lastScale = ref(1)

const handlePinchStart = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    lastDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    lastScale.value = scale.value
  }
}

const handlePinchMove = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    const scaleChange = currentDistance / lastDistance.value
    scale.value = Math.max(0.5, Math.min(3, lastScale.value * scaleChange))
  }
}

const handlePinchEnd = () => {
  lastDistance.value = 0
  lastScale.value = scale.value
}

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// 预览对话框触摸事件处理
const handlePreviewTouchStart = (event: TouchEvent) => {
  handleSwipeStart(event)
  handlePinchStart(event)
}

const handlePreviewTouchMove = (event: TouchEvent) => {
  handlePinchMove(event)
}

const handlePreviewTouchEnd = (event: TouchEvent) => {
  handleSwipeEnd(event)
  handlePinchEnd()
}

const handleFileClick = (file: any) => {
  if (file.file_type === 'image') {
    // 图片文件 - 显示预览对话框
    const imageFiles = filesStore.files.filter(f => f.file_type === 'image')
    const index = imageFiles.findIndex(f => f.id === file.id)
    
    if (index !== -1) {
      previewFile.value = imageFiles[index]
      previewFileIndex.value = index
      showPreviewDialog.value = true
    }
  } else if (file.file_type === 'video') {
    // 视频文件 - 显示预览对话框
    const videoFiles = filesStore.files.filter(f => f.file_type === 'video')
    const index = videoFiles.findIndex(f => f.id === file.id)
    
    if (index !== -1) {
      previewFile.value = videoFiles[index]
      previewFileIndex.value = index
      showPreviewDialog.value = true
    }
  } else {
    // 其他文件类型 - 下载
    downloadFile(file)
  }
}

const resetLongPressState = () => {
  // 重置长按状态
  isLongPressing.value = false
  longPressItem.value = null
  longPressedCards.value.clear()
  
  // 清除长按定时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 自动重置长按状态的定时器
const autoResetTimer = ref<NodeJS.Timeout | null>(null)

const startAutoResetTimer = () => {
  // 清除之前的定时器
  if (autoResetTimer.value) {
    clearTimeout(autoResetTimer.value)
  }
  
  // 设置5秒后自动重置长按状态
  autoResetTimer.value = setTimeout(() => {
    resetLongPressState()
  }, 5000)
}

const handleItemClick = async (item: any, event?: Event) => {
  // 如果点击的是checkbox区域，不处理点击事件
  if (event && (event.target as HTMLElement).closest('.card-checkbox')) {
    return
  }
  
  if (item.isFolder) {
    // 重置长按状态
    resetLongPressState()
    
    // 处理文件夹点击 - 只进入文件夹，不显示操作选项
    filesStore.currentFolder = item.id
    await updateFolderPath(item.id)
    await filesStore.fetchFiles(1)
    await filesStore.fetchFolders() // 刷新文件夹列表
    ElMessage.info(`进入文件夹: ${item.folder_name}`)
  } else {
    // 处理文件点击 - 预览文件
    handleFileClick(item)
  }
}

// 重命名文件或文件夹
const renameItem = async (item: any) => {
  try {
    const currentName = item.isFolder ? item.folder_name : item.original_name
    const itemType = item.isFolder ? '文件夹' : '文件'
    
    const { value: newName } = await ElMessageBox.prompt(
      `请输入新的${itemType}名称`,
      `重命名${itemType}`,
      {
        confirmButtonText: '重命名',
        cancelButtonText: '取消',
        inputValue: currentName,
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: `${itemType}名称长度应在1-100个字符之间`
      }
    )
    
    if (newName && newName !== currentName) {
      if (item.isFolder) {
        // 重命名文件夹
        await filesStore.renameFolder(item.id, newName)
        ElMessage.success('文件夹重命名成功')
      } else {
        // 重命名文件
        await filesStore.renameFile(item.id, newName)
        ElMessage.success('文件重命名成功')
      }
      refreshFiles()
    }
  } catch (error) {
    // 用户取消或重命名失败
  }
}

const deleteItem = async (item: any) => {
  if (item.isFolder) {
    // 删除文件夹
    try {
      await ElMessageBox.confirm(
        `确定要删除文件夹 "${item.folder_name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      await filesStore.deleteFolder(item.id)
      ElMessage.success('文件夹删除成功')
      
      // 刷新文件列表以确保数据同步
      await filesStore.fetchFiles(1)
      await filesStore.fetchFolders()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.response?.data?.message || '删除文件夹失败')
      }
    }
  } else {
    // 删除文件
    deleteFile(item)
  }
}

const handleUploadSuccess = () => {
  showUploadDialog.value = false
  refreshFiles()
}

const handleFileDeleted = (fileId: number) => {
  showPreviewDialog.value = false
  refreshFiles()
}

const handlePreviewFileChange = (file: any, index: number) => {
  previewFile.value = file
  previewFileIndex.value = index
}

// 快速预览
const showQuickPreview = (file: any, event: MouseEvent) => {
  // 清除之前的定时器
  if (quickPreviewTimer.value) {
    clearTimeout(quickPreviewTimer.value)
  }
  
  // 延迟显示快速预览
  quickPreviewTimer.value = setTimeout(() => {
    quickPreviewFile.value = file
    showQuickPreviewDialog.value = true
  }, 500)
}

const hideQuickPreview = () => {
  if (quickPreviewTimer.value) {
    clearTimeout(quickPreviewTimer.value)
    quickPreviewTimer.value = null
  }
  showQuickPreviewDialog.value = false
  quickPreviewFile.value = null
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSortChange = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleSelectionChange = (selection: any[]) => {
  selectedFiles.value = selection.map(item => item.id)
}

const toggleFileSelection = (fileId: number, event?: Event) => {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  const index = selectedFiles.value.indexOf(fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

const getRowClassName = ({ row }: { row: any }) => {
  return selectedFiles.value.includes(row.id) ? 'selected-row' : ''
}

// 桌面端鼠标事件处理
const rightClickTimer = ref<NodeJS.Timeout | null>(null)
const rightClickDelay = 500 // 右键长按延迟时间

const handleMouseDown = (event: MouseEvent, item: any) => {
  // 只处理左键
  if (event.button !== 0) return
  
  // 检查是否点击了checkbox区域或操作按钮区域
  const target = event.target as HTMLElement
  if (target.closest('.card-checkbox') || target.closest('.card-actions')) {
    return
  }
  
  // 设置鼠标按下定时器
  rightClickTimer.value = setTimeout(() => {
    // 长按显示操作按钮（仅对文件夹）
    if (item.isFolder) {
      longPressedCards.value.add(item.id)
      startAutoResetTimer()
    }
  }, getLongPressDelay())
}

const handleMouseUp = (event: MouseEvent, item: any) => {
  // 清除长按定时器
  if (rightClickTimer.value) {
    clearTimeout(rightClickTimer.value)
    rightClickTimer.value = null
  }
}

const handleMouseLeave = (event: MouseEvent, item: any) => {
  // 鼠标离开时清除长按定时器
  if (rightClickTimer.value) {
    clearTimeout(rightClickTimer.value)
    rightClickTimer.value = null
  }
}

const handleContextMenu = (event: MouseEvent, file: any) => {
  event.preventDefault()
  
  // 如果是文件夹，添加到长按卡片集合中
  if (file.isFolder) {
    longPressedCards.value.add(file.id)
    // 启动自动重置定时器
    startAutoResetTimer()
  }
  
  contextFile.value = file
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

const previewContextFile = () => {
  if (contextFile.value) {
    previewFile.value = contextFile.value
    showPreviewDialog.value = true
  }
  showContextMenu.value = false
}

const downloadContextFile = () => {
  if (contextFile.value) {
    downloadFile(contextFile.value)
  }
  showContextMenu.value = false
}


const renameContextItem = () => {
  if (contextFile.value) {
    renameItem(contextFile.value)
  }
  showContextMenu.value = false
}

const deleteContextFile = () => {
  if (contextFile.value) {
    deleteItem(contextFile.value)
  }
  showContextMenu.value = false
}

const enterContextFolder = async () => {
  if (contextFile.value && contextFile.value.isFolder) {
    filesStore.currentFolder = contextFile.value.id
    await updateFolderPath(contextFile.value.id)
    await filesStore.fetchFiles(1)
    await filesStore.fetchFolders()
    // 移除重复的提示消息，因为handleItemClick已经显示了
    // ElMessage.info(`进入文件夹: ${contextFile.value.folder_name}`)
  }
  showContextMenu.value = false
}

const shareContextFile = () => {
  if (contextFile.value) {
    shareFile.value = contextFile.value
    showShareDialog.value = true
  }
  showContextMenu.value = false
}

const copyFileUrl = async () => {
  if (contextFile.value) {
    const url = `${window.location.origin}${getFilePreviewUrl(contextFile.value.id)}`
    const success = await copyToClipboard(url)
    
    if (success) {
      ElMessage.success('链接已复制到剪贴板')
    } else {
      ElMessage.error('复制失败')
    }
  }
  showContextMenu.value = false
}

// 文件操作
const downloadFile = (file: any) => {
  try {
    downloadFileUtil(file.id, file.original_name)
    ElMessage.success('开始下载文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const shareFileAction = (file: any) => {
  shareFile.value = file
  showShareDialog.value = true
}

const deleteFile = async (file: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.original_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await filesStore.deleteFile(file.id)
    ElMessage.success('文件删除成功')
    
    // 刷新文件列表以确保数据同步
    await filesStore.fetchFiles(1)
    await filesStore.fetchFolders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 清除选择
const clearSelection = () => {
  selectedFiles.value = []
}

// 批量操作
const batchDownload = () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要下载的项目')
    return
  }
  
  ElMessage.info(`开始下载 ${selectedFiles.value.length} 个项目`)
  // 这里可以实现批量下载逻辑
}

const batchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要删除的项目')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个项目吗？`,
      '批量删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 分别处理文件和文件夹
    const filesToDelete = []
    const foldersToDelete = []
    
    // 获取所有项目信息
    const allItems = filesStore.folders.map(folder => ({
      ...folder,
      isFolder: true,
      original_name: folder.folder_name,
      file_size: 0,
      file_type: 'folder'
    })).concat(filesStore.files.map(file => ({
      ...file,
      isFolder: false
    })))
    
    // 分类选中的项目
    for (const itemId of selectedFiles.value) {
      const item = allItems.find(item => item.id === itemId)
      if (item) {
        if (item.isFolder) {
          foldersToDelete.push(item)
        } else {
          filesToDelete.push(item)
        }
      }
    }
    
    // 删除文件夹
    for (const folder of foldersToDelete) {
      await filesStore.deleteFolder(folder.id)
    }
    
    // 删除文件
    for (const file of filesToDelete) {
      await filesStore.deleteFile(file.id)
    }
    
    const totalCount = filesToDelete.length + foldersToDelete.length
    ElMessage.success(`成功删除 ${totalCount} 个项目`)
    selectedFiles.value = []
    
    // 刷新文件列表以确保数据同步
    await filesStore.fetchFiles(1)
    await filesStore.fetchFolders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 分享功能
const generateShareLink = () => {
  if (!shareFile.value) return
  
  // 生成分享链接
  const baseUrl = window.location.origin
  const shareId = Math.random().toString(36).substr(2, 9)
  shareUrl.value = `${baseUrl}/share/${shareId}`
  
  ElMessage.success('分享链接已生成')
}

const copyShareUrl = async () => {
  if (shareUrl.value) {
    const success = await copyToClipboard(shareUrl.value)
    
    if (success) {
      ElMessage.success('分享链接已复制到剪贴板')
    } else {
      ElMessage.error('复制失败')
    }
  }
}

// 文件夹操作
const createFolder = async () => {
  if (!folderFormRef.value) return
  
  try {
    await folderFormRef.value.validate()
    await filesStore.createFolder(folderForm.name, filesStore.currentFolder || undefined)
    ElMessage.success('文件夹创建成功')
    showCreateFolderDialog.value = false
    folderForm.name = ''
    refreshFiles()
  } catch (error) {
    // 用户取消或创建失败
  }
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 点击外部关闭右键菜单
const handleClickOutside = () => {
  showContextMenu.value = false
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + 1: 网格视图
  if ((event.ctrlKey || event.metaKey) && event.key === '1') {
    event.preventDefault()
    viewMode.value = 'grid'
    ElMessage.success('已切换到网格视图')
  }
  // Ctrl/Cmd + 2: 列表视图
  else if ((event.ctrlKey || event.metaKey) && event.key === '2') {
    event.preventDefault()
    viewMode.value = 'list'
    ElMessage.success('已切换到列表视图')
  }
}

onMounted(() => {
  filesStore.fetchFiles(1)
  filesStore.fetchFolders()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  
  // 加载用户视图设置
  loadViewSettings()
  
  // 监听用户设置变化
  window.addEventListener('preferencesUpdated', loadViewSettings)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  
  // 移除用户设置变化监听器
  window.removeEventListener('preferencesUpdated', loadViewSettings)
  
  // 清理快速预览定时器
  if (quickPreviewTimer.value) {
    clearTimeout(quickPreviewTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.files-page {
  display: block;
  background: transparent; // 透明背景，由父级提供
  padding: 24px; // 统一设置所有方向的内边距，确保左右一致
  border-radius: 16px; // 添加圆角
}

// 桌面端工具栏样式
.desktop-toolbar {
  display: block;
}

.unified-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  margin-bottom: 8px;
  max-width: calc(100vw - 400px); // 限制宽度与内容区域一致
  margin-left: auto;
  margin-right: auto;
  backdrop-filter: blur(10px);
  
  .toolbar-main {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .action-btn {
      height: 40px;
      padding: 0 16px;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        
        &:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
      }
    }
  }
  
  .toolbar-search {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    max-width: 400px;
    
    .search-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: rgba(102, 126, 234, 0.4);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        }
      }
    }
    
    .sort-dropdown {
      .sort-btn {
        height: 32px;
        padding: 0 12px;
        border-radius: 10px;
        font-weight: 500;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        color: #667eea;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-1px);
        }
      }
    }
  }
  
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .view-toggle {
      .view-btn {
        width: 36px;
        height: 32px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
        
        &.el-button--primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }
      }
    }
    
    .batch-actions {
      .batch-btn {
        height: 32px;
        padding: 0 12px;
        border-radius: 10px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}

// 移动端工具栏样式
.mobile-toolbar {
  display: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  margin-bottom: 8px;
  backdrop-filter: blur(10px);
  
  .mobile-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    
    .mobile-upload-btn,
    .mobile-folder-btn {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    .mobile-upload-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      }
    }
    
    .mobile-folder-btn {
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      color: #667eea;
      
      &:hover {
        background: rgba(102, 126, 234, 0.2);
      }
    }
    
    .mobile-refresh-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      padding: 0;
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      color: #667eea;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
      }
    }
  }
  
  .mobile-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .mobile-search-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: rgba(102, 126, 234, 0.4);
        }
        
        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        }
      }
    }
    
    .mobile-sort-dropdown {
      .mobile-sort-btn {
        width: 36px;
        height: 32px;
        border-radius: 10px;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        color: #667eea;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-1px);
        }
      }
    }
    
    .mobile-view-toggle {
      .mobile-view-btn {
        width: 36px;
        height: 32px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
        
        &.el-button--primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }
      }
    }
  }
  
  .mobile-batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    padding: 12px 16px;
    margin-top: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    
    .batch-info {
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
    }
    
    .batch-actions-mobile {
      display: flex;
      gap: 8px;
      
      .mobile-batch-btn {
        width: 36px;
        height: 32px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}

.breadcrumb-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 12px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  // 添加光泽效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 3s infinite;
  }
  
  :deep(.el-breadcrumb) {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    
    .el-breadcrumb__item {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      
      .el-breadcrumb__inner {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        font-size: 14px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        
        &:hover {
          color: white;
          transform: translateY(-1px);
        }
      }
      
      .el-breadcrumb__separator {
        color: rgba(255, 255, 255, 0.7);
        margin: 0 8px;
        font-weight: 600;
        flex-shrink: 0;
      }
    }
  }
  
  .breadcrumb-btn {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    height: auto;
    line-height: 1.2;
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
  }
  
  .current-folder {
    color: white;
    font-weight: 600;
    font-size: 14px;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    height: auto;
    line-height: 1.2;
  }
}

// 光泽动画
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 移动端响应式支持
@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 12px;
    
    .breadcrumb-btn {
      font-size: 13px;
      padding: 3px 6px;
      display: flex;
      align-items: center;
      height: auto;
      line-height: 1.2;
      
      .el-icon {
        font-size: 14px;
        margin-right: 4px;
        display: flex;
        align-items: center;
      }
    }
    
    .current-folder {
      font-size: 13px;
      padding: 3px 8px;
      display: flex;
      align-items: center;
      height: auto;
      line-height: 1.2;
    }
    
    :deep(.el-breadcrumb) {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      
      .el-breadcrumb__item {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        
        .el-breadcrumb__inner {
          font-size: 13px;
          display: flex;
          align-items: center;
        }
        
        .el-breadcrumb__separator {
          margin: 0 6px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.file-content {
  background: white;
  border-radius: 16px; // 增加圆角
  padding: 20px; // 统一设置所有方向的内边距
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); // 优化阴影
  border: 1px solid rgba(102, 126, 234, 0.1); // 优化边框
  overflow: hidden;
  position: relative;
  margin-top: 8px; // 与工具栏的间距
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  
  .empty-content {
    text-align: center;
    max-width: 180px;
    
    .empty-icon {
      font-size: 24px;
      color: #c0c4cc;
      margin-bottom: 3px;
    }
    
    .empty-title {
      font-size: 12px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 1px;
    }
    
    .empty-description {
      font-size: 9px;
      color: #909399;
      margin-bottom: 4px;
      line-height: 1.1;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  
  .loading-icon {
    font-size: 16px;
    color: #409eff;
    margin-bottom: 4px;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 10px;
    color: #606266;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 添加动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 工具栏动画
.unified-toolbar,
.mobile-toolbar {
  animation: fadeInUp 0.6s ease-out;
  
  .action-btn,
  .mobile-upload-btn,
  .mobile-folder-btn {
    &:active {
      animation: pulse 0.2s ease-in-out;
    }
  }
}

// 搜索框聚焦效果
.search-input,
.mobile-search-input {
  :deep(.el-input__wrapper) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-1px);
    }
    
    &.is-focus {
      transform: translateY(-2px);
    }
  }
}

// 按钮组悬停效果
.view-toggle,
.mobile-view-toggle {
  .view-btn,
  .mobile-view-btn {
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
  }
}

// 批量操作栏动画
.mobile-batch-bar {
  animation: slideInDown 0.4s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式动画优化
@media (prefers-reduced-motion: reduce) {
  .unified-toolbar,
  .mobile-toolbar,
  .mobile-batch-bar {
    animation: none;
  }
  
  .action-btn,
  .mobile-upload-btn,
  .mobile-folder-btn,
  .search-input,
  .mobile-search-input,
  .view-btn,
  .mobile-view-btn {
    &:hover,
    &:active,
    &:focus {
      transform: none;
    }
  }
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  justify-content: start;
}

  .file-card {
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative; // 添加相对定位，以便card-actions绝对定位
    
    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
    }
    
    &.folder-card {
      border-color: #ffa500;
      
      &:hover {
        border-color: #ff8c00;
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.15);
      }
      
      // 文件夹默认不显示操作按钮
      .card-actions {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        display: flex; // 保持flex布局，但不可见
      }
      
      // 文件夹长按时显示操作按钮
      &.long-pressed .card-actions {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
    }
  
  .card-thumbnail {
    height: 120px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .folder-thumbnail {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffa500, #ff8c00);
      border-radius: 8px;
      
      .folder-icon {
        font-size: 48px;
        color: white;
      }
    }
    
    // 缩略图样式现在由 FileThumbnail 组件处理
  }
  
  .card-info {
    padding: 12px;
    
    .file-name {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-meta {
      font-size: 12px;
      color: #909399;
    }
  }
}

.file-list {
  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .file-type-icon {
      color: #667eea;
    }
  }
}

// 移动端专用样式
.mobile-top-bar {
  display: none;
}

.mobile-batch-bar {
  display: none;
}

.desktop-toolbar {
  display: flex;
}

// 响应式设计 - 使用精确断点，避免重叠
// 超大屏 (1920px+)
@media (min-width: 1920px) {
  .files-page {
    padding: 32px; // 超大屏使用更大的内边距
  }
  
  .unified-toolbar {
    padding: 16px 20px;
    gap: 20px;
    max-width: calc(100vw - 440px); // 与内容区域宽度一致
    
    .toolbar-main .action-btn {
      height: 44px;
      padding: 0 20px;
      font-size: 15px;
    }
    
    .toolbar-search .sort-btn {
      height: 36px;
      padding: 0 16px;
    }
    
    .toolbar-actions .view-btn {
      width: 40px;
      height: 36px;
    }
  }
  
  .empty-state {
    padding: 10px 6px;
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .card-thumbnail {
    height: 140px;
  }
}

// 大屏桌面 (1440px - 1919px)
@media (min-width: 1440px) and (max-width: 1919px) {
  .files-page {
    padding: 28px; // 大屏桌面使用适中的内边距
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 18px;
  }
  
  .card-thumbnail {
    height: 130px;
  }
}

// 桌面端 (1200px - 1439px)
@media (min-width: 1200px) and (max-width: 1439px) {
  .files-page {
    padding: 24px; // 桌面端使用标准内边距
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .card-thumbnail {
    height: 120px;
    
  }
}

// 平板横屏/小屏笔记本 (1024px - 1199px)
@media (min-width: 1024px) and (max-width: 1199px) {
  .files-page {
    padding: 20px; // 平板横屏使用较小的内边距
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }
  
  .card-thumbnail {
    height: 110px;
  }
}

// 平板竖屏 (768px - 1023px)
@media (min-width: 768px) and (max-width: 1023px) {
  .files-page {
    padding: 16px; // 平板竖屏使用统一的内边距
  }
  
  .desktop-toolbar {
    display: block;
  }
  
  .mobile-toolbar {
    display: none;
  }
  
  .unified-toolbar {
    padding: 12px 16px;
    gap: 12px;
    margin-bottom: 12px;
    
    .toolbar-main .action-btn {
      height: 36px;
      padding: 0 12px;
      font-size: 13px;
    }
    
    .toolbar-search {
      max-width: 250px;
      
      .sort-btn {
        height: 28px;
        padding: 0 10px;
        font-size: 12px;
      }
    }
    
    .toolbar-actions .view-btn {
      width: 32px;
      height: 28px;
    }
  }
  
  .file-content {
    padding: 16px; // 平板竖屏使用统一的内边距
    margin-top: 8px;
  }
  
  .file-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    justify-content: start;
  }
  
  .file-card {
    .card-thumbnail {
      height: 100px; // 减少缩略图高度
    }
    
    .card-info {
      padding: 6px; // 减少信息区域内边距
      
      .file-name {
        font-size: 12px; // 减少字体大小
      }
      
      .file-meta {
        font-size: 10px; // 减少字体大小
      }
    }
    
    .card-actions {
      .action-btn {
        padding: 2px; // 减少操作按钮内边距
        
        :deep(.el-icon) {
          font-size: 12px; // 减少图标大小
        }
      }
    }
  }
  
  .unified-toolbar {
    padding: 10px 12px;
    gap: 12px;
    max-width: calc(100vw - 420px); // 与内容区域宽度一致
    
    .toolbar-main .action-btn {
      height: 36px;
      padding: 0 12px;
      font-size: 13px;
    }
    
    .toolbar-search {
      max-width: 300px;
      
      .sort-btn {
        height: 28px;
        padding: 0 10px;
        font-size: 12px;
      }
    }
    
    .toolbar-actions .view-btn {
      width: 32px;
      height: 28px;
    }
  }
  
  .empty-state {
    padding: 6px 3px;
    
    .empty-content {
      .empty-icon {
        font-size: 20px;
      }
      
      .empty-title {
        font-size: 11px;
      }
      
      .empty-description {
        font-size: 8px;
      }
    }
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .card-thumbnail {
    height: 100px;
    
    .file-icon {
      font-size: 24px;
    }
  }
  
  .card-info {
    padding: 8px;
    
    .file-name {
      font-size: 13px;
      line-height: 1.3;
    }
    
    .file-meta {
      font-size: 11px;
      margin-top: 2px;
    }
  }
}

// 大屏手机 (480px - 767px)
@media (min-width: 480px) and (max-width: 767px) {
  .files-page {
    padding: 12px; // 大屏手机使用统一的内边距
  }
  
  .desktop-toolbar {
    display: none;
  }
  
  .mobile-toolbar {
    display: block;
    padding: 6px 0; // 只保留上下内边距，移除左右内边距
    
    .mobile-actions {
      margin-bottom: 10px;
      
      .mobile-upload-btn,
      .mobile-folder-btn {
        height: 40px;
        font-size: 13px;
      }
      
      .mobile-refresh-btn {
        width: 40px;
        height: 40px;
      }
    }
    
    .mobile-controls {
      gap: 6px;
      
      .mobile-sort-btn,
      .mobile-view-btn {
        width: 32px;
        height: 28px;
      }
    }
    
    .mobile-batch-bar {
      padding: 10px 12px;
      margin-top: 10px;
      
      .batch-info {
        font-size: 13px;
      }
      
      .mobile-batch-btn {
        width: 32px;
        height: 28px;
      }
    }
  }
  
  .file-content {
    padding: 12px; // 大屏手机使用统一的内边距
    margin-top: 6px;
  }
  
  .empty-state {
    padding: 4px 2px;
    
    .empty-content {
      .empty-icon {
        font-size: 18px;
      }
      
      .empty-title {
        font-size: 10px;
      }
      
      .empty-description {
        font-size: 7px;
      }
    }
  }
  
  // 隐藏桌面端工具栏，显示移动端工具栏
  .desktop-toolbar {
    display: none;
  }
  
  .mobile-top-bar {
    display: block;
    background: #ffffff;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }
  
  .mobile-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    
    .mobile-upload-btn,
    .mobile-folder-btn {
      flex: 1;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
    }
    
    .mobile-refresh-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      padding: 0;
    }
  }
  
  .mobile-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .mobile-search-input {
      flex: 1;
    }
    
    .mobile-sort-dropdown,
    .mobile-view-toggle {
      flex-shrink: 0;
    }
    
    .mobile-view-toggle {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      background: white;
      border: 1px solid #e4e7ed;
      
      :deep(.el-button) {
        border: none;
        border-radius: 0;
        background: transparent;
        color: #606266;
        font-size: 14px;
        padding: 6px 10px;
        transition: all 0.2s ease;
        
        &:first-child {
          border-top-left-radius: 7px;
          border-bottom-left-radius: 7px;
        }
        
        &:last-child {
          border-top-right-radius: 7px;
          border-bottom-right-radius: 7px;
        }
        
        &:hover:not(.el-button--primary) {
          background: #f5f7fa;
          color: #409eff;
        }
        
        &.el-button--primary {
          background: linear-gradient(135deg, #409eff, #36cfc9);
          color: white;
          box-shadow: 0 1px 4px rgba(64, 158, 255, 0.3);
        }
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
  
  .mobile-batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
    
    .batch-info {
      font-size: 14px;
      color: #0369a1;
      font-weight: 500;
    }
    
    .batch-actions-mobile {
      display: flex;
      gap: 8px;
    }
  }
  
  .file-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    justify-content: start;
  }
  
  .file-card {
    .card-thumbnail {
      height: 80px; // 进一步减少缩略图高度
    }
    
    .card-info {
      padding: 4px; // 进一步减少信息区域内边距
      
      .file-name {
        font-size: 11px; // 进一步减少字体大小
      }
      
      .file-meta {
        font-size: 9px; // 进一步减少字体大小
      }
    }
    
    .card-actions {
      .action-btn {
        padding: 1px; // 进一步减少操作按钮内边距
        
        :deep(.el-icon) {
          font-size: 10px; // 进一步减少图标大小
        }
      }
    }
  }
  
  .file-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .card-thumbnail {
    height: 100px;
    
    .file-icon {
      font-size: 24px;
    }
  }
  
  .card-info {
    padding: 8px;
    
    .file-name {
      font-size: 13px;
      line-height: 1.3;
    }
    
    .file-meta {
      font-size: 11px;
      margin-top: 2px;
    }
  }
  
  .card-checkbox {
    top: 8px;
    left: 8px;
  }
  
  .card-actions {
    opacity: 0;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
  }
  
  // 移动端悬停时显示操作按钮
  .file-card:hover .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  // 移动端触摸时显示操作按钮
  .file-card:active .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

// 小屏手机 (320px - 479px)
@media (min-width: 320px) and (max-width: 479px) {
  .files-page {
    padding: 8px; // 小屏手机使用最小的内边距
  }
  
  .desktop-toolbar {
    display: none;
  }
  
  .mobile-toolbar {
    display: block;
    padding: 8px 0; // 只保留上下内边距，移除左右内边距
    
    .mobile-actions {
      margin-bottom: 8px;
      gap: 6px;
      
      .mobile-upload-btn,
      .mobile-folder-btn {
        height: 36px;
        font-size: 12px;
        border-radius: 10px;
      }
      
      .mobile-refresh-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }
    }
    
    .mobile-controls {
      gap: 4px;
      
      .mobile-sort-btn,
      .mobile-view-btn {
        width: 28px;
        height: 26px;
        border-radius: 6px;
      }
    }
    
    .mobile-batch-bar {
      padding: 8px 10px;
      margin-top: 8px;
      border-radius: 10px;
      
      .batch-info {
        font-size: 12px;
      }
      
      .mobile-batch-btn {
        width: 28px;
        height: 26px;
        border-radius: 6px;
      }
    }
  }
  
  .file-content {
    padding: 8px; // 小屏手机使用最小的内边距
    margin-top: 4px;
  }
  
  .file-grid {
    gap: 4px; // 最小网格间距
    
    .file-card {
      .card-thumbnail {
        height: 70px; // 最小缩略图高度
      }
      
      .card-info {
        padding: 3px; // 最小信息区域内边距
        
        .file-name {
          font-size: 10px; // 最小字体大小
        }
        
        .file-meta {
          font-size: 8px; // 最小字体大小
        }
      }
      
      .card-actions {
        .action-btn {
          padding: 1px; // 最小操作按钮内边距
          
          :deep(.el-icon) {
            font-size: 9px; // 最小图标大小
          }
        }
      }
    }
  }
  
  .file-card {
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .card-thumbnail {
    height: 80px;
    
    .file-icon {
      font-size: 20px;
    }
  }
  
  .card-info {
    padding: 6px;
    
    .file-name {
      font-size: 12px;
      line-height: 1.2;
    }
    
    .file-meta {
      font-size: 10px;
      margin-top: 2px;
    }
  }
  
  .card-checkbox {
    top: 6px;
    left: 6px;
  }
  
  .card-actions {
    opacity: 0;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
  }
  
  // 移动端悬停时显示操作按钮
  .file-card:hover .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  // 移动端触摸时显示操作按钮
  .file-card:active .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

// 超小屏手机 (0px - 319px)
@media (max-width: 319px) {
  .files-page {
    padding: 6px; // 超小屏手机使用最小的内边距
  }
  
  // 隐藏桌面端工具栏，显示移动端工具栏
  .desktop-toolbar {
    display: none;
  }
  
  .mobile-top-bar {
    display: block;
    background: #ffffff;
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 8px;
  }
  
  .mobile-actions {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    
    .mobile-upload-btn,
    .mobile-folder-btn {
      flex: 1;
      height: 32px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 13px;
    }
    
    .mobile-refresh-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      padding: 0;
    }
  }
  
  .mobile-controls {
    display: flex;
    gap: 4px;
    align-items: center;
    
    .mobile-search-input {
      flex: 1;
    }
    
    .mobile-sort-dropdown,
    .mobile-view-toggle {
      flex-shrink: 0;
    }
  }
  
  .mobile-batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 8px;
    margin-top: 8px;
    
    .batch-info {
      font-size: 12px;
      color: #0369a1;
      font-weight: 500;
    }
    
    .batch-actions-mobile {
      display: flex;
      gap: 4px;
    }
  }
  
  .file-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    justify-content: start;
  }
  
  .file-card {
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
    min-height: 90px;
    cursor: pointer;
    position: relative;
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.folder-card {
      border-color: #ffa500;
      
      &:hover {
        border-color: #ff8c00;
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.15);
      }
      
      // 文件夹默认不显示操作按钮
      .card-actions {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        display: flex; // 保持flex布局，但不可见
      }
      
      // 文件夹长按时显示操作按钮
      &.long-pressed .card-actions {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
    }
  }
  
  .card-thumbnail {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 6px 6px 0 0;
    overflow: hidden;
    
    .file-icon {
      font-size: 18px;
      color: #606266;
    }
    
    .folder-icon {
      font-size: 18px;
      color: #ffa500;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px 6px 0 0;
    }
  }
  
  .card-info {
    padding: 4px 3px;
    
    .file-name {
      font-size: 9px;
      font-weight: 500;
      line-height: 1.2;
      margin-bottom: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    
    .file-meta {
      font-size: 7px;
      color: #909399;
      line-height: 1.2;
      margin-top: 1px;
    }
  }
  
  .card-checkbox {
    top: 3px;
    left: 3px;
    
    :deep(.el-checkbox) {
      .el-checkbox__input {
        .el-checkbox__inner {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
      }
    }
  }
  
  .card-actions {
    opacity: 0;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
  }
  
  // 移动端悬停时显示操作按钮
  .file-card:hover .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  // 移动端触摸时显示操作按钮
  .file-card:active .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

// 文件操作按钮样式 - 两行两排布局
.file-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;
  width: 100%;
  max-width: 200px;
  
  .action-btn {
    padding: 6px 8px;
    font-size: 11px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    
    &:hover {
      background: #f5f7fa;
      color: #409eff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }
    
    &.danger:hover {
      background: #fef0f0;
      color: #f56c6c;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
    }
    
    .el-icon {
      margin-right: 3px;
      font-size: 11px;
    }
    
    span {
      font-size: 11px;
      font-weight: 500;
    }
  }
}

// 卡片操作按钮样式 - 美化版本
.card-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  
  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    max-width: 120px;
    min-height: 32px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #606266;
    text-align: center;
    
    &:hover {
      background: rgba(255, 255, 255, 1);
      border-color: #409eff;
      color: #409eff;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    &.danger {
      color: #f56c6c;
      border-color: rgba(245, 108, 108, 0.3);
      
      &:hover {
        background: rgba(245, 108, 108, 0.1);
        border-color: #f56c6c;
        color: #f56c6c;
        box-shadow: 0 4px 16px rgba(245, 108, 108, 0.2);
      }
    }
    
    .el-icon {
      font-size: 14px;
      transition: all 0.3s ease;
      flex-shrink: 0;
      margin: 0;
    }
    
    span {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
      margin: 0;
      line-height: 1;
    }
    
    // 确保Element Plus按钮内容居中对齐
    :deep(.el-button__inner) {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
    }
  }
}

// 文件卡片悬停时显示操作按钮
.file-card:hover .card-actions {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

// 移动端触摸时显示操作按钮
.file-card:active .card-actions {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

// 移动端文件操作按钮优化
@media (max-width: 768px) {
  .file-actions {
    gap: 4px;
    max-width: 160px;
    
    .action-btn {
      padding: 4px 6px;
      font-size: 10px;
      min-height: 24px;
      
      .el-icon {
        margin-right: 2px;
        font-size: 10px;
      }
      
      span {
        font-size: 10px;
      }
    }
  }
  
  .card-actions {
    display: none !important; // 在移动端完全隐藏card-actions
  }
  
  // 移动端统一使用context-menu
  .context-menu {
    position: fixed;
    z-index: 9999;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 0;
    min-width: 160px;
    max-width: 200px;
    
    .context-menu-item {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }
      
      &.danger {
        color: #f56c6c;
        
        &:hover {
          background: rgba(245, 108, 108, 0.1);
          color: #f56c6c;
        }
      }
      
      .el-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
    }
    
    .context-menu-divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.1);
      margin: 4px 0;
    }
  }
  
  // 移动端悬停时显示操作按钮
  .file-card:hover .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  // 移动端触摸时显示操作按钮
  .file-card:active .card-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

@media (max-width: 480px) {
  .file-actions {
    gap: 3px;
    max-width: 140px;
    
    .action-btn {
      padding: 3px 4px;
      font-size: 9px;
      min-height: 22px;
      
      .el-icon {
        margin-right: 2px;
        font-size: 9px;
      }
      
      span {
        font-size: 9px;
      }
    }
  }
  
  .card-actions {
    gap: 4px;
    padding: 6px;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
    backdrop-filter: blur(6px);
    border-radius: 6px;
    flex-direction: row;
    
    .action-btn {
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 500;
      min-height: 24px;
      width: 100%;
      max-width: 80px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-align: center;
      
      &:hover {
        background: rgba(255, 255, 255, 1);
        border-color: #409eff;
        color: #409eff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }
      
      &.danger:hover {
        background: rgba(245, 108, 108, 0.1);
        border-color: #f56c6c;
        color: #f56c6c;
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
      }
      
      .el-icon {
        font-size: 10px;
        flex-shrink: 0;
        margin: 0;
      }
      
      span {
        font-size: 10px;
        font-weight: 500;
        flex-shrink: 0;
        margin: 0;
        line-height: 1;
      }
      
      // 确保Element Plus按钮内容居中对齐
      :deep(.el-button__inner) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        width: 100%;
      }
    }
  }
}

// 移动端对话框优化
.mobile-upload-dialog {
  :deep(.el-dialog) {
    margin: 2vh auto !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    
    .el-dialog__header {
      padding: 20px 20px 0 20px !important;
      border-bottom: 1px solid #f0f0f0 !important;
      margin-bottom: 0 !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #2c3e50 !important;
      }
      
      .el-dialog__headerbtn {
        top: 20px !important;
        right: 20px !important;
        width: 32px !important;
        height: 32px !important;
        
        .el-dialog__close {
          font-size: 18px !important;
          color: #909399 !important;
          
          &:hover {
            color: #409eff !important;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 20px !important;
      max-height: 70vh !important;
      overflow-y: auto !important;
    }
  }
}

.mobile-folder-dialog {
  :deep(.el-dialog) {
    margin: 5vh auto !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    
    .el-dialog__header {
      padding: 20px 20px 0 20px !important;
      border-bottom: 1px solid #f0f0f0 !important;
      margin-bottom: 0 !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #2c3e50 !important;
      }
      
      .el-dialog__headerbtn {
        top: 20px !important;
        right: 20px !important;
        width: 32px !important;
        height: 32px !important;
        
        .el-dialog__close {
          font-size: 18px !important;
          color: #909399 !important;
          
          &:hover {
            color: #409eff !important;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 20px !important;
      
      .el-form {
        .el-form-item {
          margin-bottom: 0 !important;
          
          .mobile-input {
            :deep(.el-input__inner) {
              height: 48px !important;
              font-size: 16px !important;
              border-radius: 12px !important;
              padding: 0 16px !important;
              border: 2px solid #e9ecef !important;
              
              &:focus {
                border-color: #667eea !important;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
              }
            }
          }
        }
      }
    }
    
    .el-dialog__footer {
      padding: 0 20px 20px 20px !important;
      border-top: 1px solid #f0f0f0 !important;
      margin-top: 0 !important;
      
      .mobile-footer {
        display: flex !important;
        gap: 12px !important;
        justify-content: flex-end !important;
        
        .mobile-btn {
          height: 44px !important;
          border-radius: 10px !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          min-width: 80px !important;
          
          &.el-button--primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
            
            &:hover {
              background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
            }
          }
          
          &:not(.el-button--primary) {
            background: #f8f9fa !important;
            border: 1px solid #e9ecef !important;
            color: #495057 !important;
            
            &:hover {
              background: #e9ecef !important;
              border-color: #dee2e6 !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            }
          }
        }
      }
    }
  }
}

.mobile-modal {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px) !important;
}

// 超小屏幕优化
@media (max-width: 480px) {
  .mobile-upload-dialog {
    :deep(.el-dialog) {
      margin: 1vh auto !important;
      border-radius: 12px !important;
      
      .el-dialog__header {
        padding: 16px 16px 0 16px !important;
        
        .el-dialog__title {
          font-size: 16px !important;
        }
        
        .el-dialog__headerbtn {
          top: 16px !important;
          right: 16px !important;
          width: 28px !important;
          height: 28px !important;
          
          .el-dialog__close {
            font-size: 16px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 16px !important;
        max-height: 75vh !important;
      }
    }
  }
  
  .mobile-folder-dialog {
    :deep(.el-dialog) {
      margin: 3vh auto !important;
      border-radius: 12px !important;
      
      .el-dialog__header {
        padding: 16px 16px 0 16px !important;
        
        .el-dialog__title {
          font-size: 16px !important;
        }
        
        .el-dialog__headerbtn {
          top: 16px !important;
          right: 16px !important;
          width: 28px !important;
          height: 28px !important;
          
          .el-dialog__close {
            font-size: 16px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 16px !important;
        
        .el-form {
          .el-form-item {
            .mobile-input {
              :deep(.el-input__inner) {
                height: 44px !important;
                font-size: 15px !important;
                border-radius: 10px !important;
                padding: 0 14px !important;
              }
            }
          }
        }
      }
      
      .el-dialog__footer {
        padding: 0 16px 16px 16px !important;
        
        .mobile-footer {
          gap: 10px !important;
          
          .mobile-btn {
            height: 40px !important;
            border-radius: 8px !important;
            font-size: 15px !important;
            min-width: 70px !important;
          }
        }
      }
    }
  }
}

@media (max-width: 320px) {
  .mobile-upload-dialog {
    :deep(.el-dialog) {
      margin: 0.5vh auto !important;
      border-radius: 8px !important;
      
      .el-dialog__header {
        padding: 12px 12px 0 12px !important;
        
        .el-dialog__title {
          font-size: 15px !important;
        }
        
        .el-dialog__headerbtn {
          top: 12px !important;
          right: 12px !important;
          width: 24px !important;
          height: 24px !important;
          
          .el-dialog__close {
            font-size: 14px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 12px !important;
        max-height: 80vh !important;
      }
    }
  }
  
  .mobile-folder-dialog {
    :deep(.el-dialog) {
      margin: 2vh auto !important;
      border-radius: 8px !important;
      
      .el-dialog__header {
        padding: 12px 12px 0 12px !important;
        
        .el-dialog__title {
          font-size: 15px !important;
        }
        
        .el-dialog__headerbtn {
          top: 12px !important;
          right: 12px !important;
          width: 24px !important;
          height: 24px !important;
          
          .el-dialog__close {
            font-size: 14px !important;
          }
        }
      }
      
      .el-dialog__body {
        padding: 12px !important;
        
        .el-form {
          .el-form-item {
            .mobile-input {
              :deep(.el-input__inner) {
                height: 40px !important;
                font-size: 14px !important;
                border-radius: 8px !important;
                padding: 0 12px !important;
              }
            }
          }
        }
      }
      
      .el-dialog__footer {
        padding: 0 12px 12px 12px !important;
        
        .mobile-footer {
          gap: 8px !important;
          
          .mobile-btn {
            height: 36px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            min-width: 60px !important;
          }
        }
      }
    }
  }
}

// 移动端触摸优化
@media (max-width: 768px) {
  .file-card {
    // 触摸反馈优化
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    
    // 增加触摸区域
    .card-thumbnail {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    
    // 优化复选框触摸
    .card-checkbox {
      :deep(.el-checkbox__input) {
        .el-checkbox__inner {
          width: 18px;
          height: 18px;
        }
      }
    }
  }
  
  // 优化按钮触摸
  .action-btn {
    min-height: 44px; // 确保触摸区域足够大
    min-width: 44px;
    -webkit-tap-highlight-color: transparent;
  }
  
  // 优化移动端工具栏按钮
  .mobile-upload-btn,
  .mobile-folder-btn,
  .mobile-refresh-btn {
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>