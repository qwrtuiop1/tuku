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
          <el-button
            size="small"
            :type="onlyLive ? 'primary' : ''"
            class="filter-live-btn"
            @click="toggleOnlyLive"
            round
          >
            仅实况
          </el-button>
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
      
      <!-- 视图区域带淡入淡出，避免切换文件夹时残影 -->
      <!-- 网格视图（实况专用） -->
      <transition name="fade-fast" mode="out-in" v-else-if="viewMode === 'grid' && onlyLive">
      <div class="file-grid" :key="`live-${filesStore.currentFolder || 'root'}`">
        <div 
          v-for="asset in filteredLiveAssets" 
          :key="asset.id"
          class="file-card"
          :class="{ 'selected': selectedFiles.includes(asset.id), 'is-live': true }"
          @contextmenu.prevent="showCardActions({ id: asset.id, isFolder: false, isLive: true })"
          :data-item-id="asset.id"
        >
          <div class="card-checkbox" @click.stop @touchstart.stop @touchend.stop>
            <el-checkbox 
              :model-value="selectedFiles.includes(asset.id)"
              @change="() => toggleFileSelection(asset.id)"
              @click.stop
            />
          </div>
          <div class="card-thumbnail" @click="openLivePreview(asset)">
            <LiveMediaCard :asset="asset" :autoplay="true" @bg-theme="(t)=>setLiveTheme(asset.id, t)" />
          </div>
          <div class="card-info" :class="liveTheme[asset.id] === 'light' ? 'theme-light' : 'theme-dark'">
            <div class="file-name">{{ asset.kind }}</div>
            <div class="file-meta">
              <span>
                {{ asset.duration_ms ? Math.round(asset.duration_ms/1000) + 's' : '实况' }}
                <template v-if="getLiveCreatedAt(asset)"> • {{ formatTime(getLiveCreatedAt(asset)!) }}</template>
              </span>
            </div>
          </div>
          <div class="card-actions" @touchstart.stop @touchmove.stop @touchend.stop>
            <el-button type="text" size="small" @click.stop="openLivePreview(asset)" class="action-btn">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </el-button>
            <el-button type="text" size="small" @click.stop="downloadLiveOriginal(asset)" class="action-btn">
              <el-icon><Download /></el-icon>
              <span>下载原件</span>
            </el-button>
            <el-button type="text" size="small" @click.stop="deleteLiveAsset(asset.id)" class="action-btn danger">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </div>
        </div>
      </div>
      </transition>

      <!-- 网格视图（常规文件 + 实况资源） -->
      <transition name="fade-fast" mode="out-in" v-else-if="viewMode === 'grid'">
      <div class="file-grid" :key="`grid-${filesStore.currentFolder || 'root'}`">
        <div 
          v-for="item in paginatedFiles" 
          :key="item.id"
          class="file-card"
          :class="{ 
            'selected': selectedFiles.includes(item.id),
            'folder-card': item.isFolder,
            'long-pressed': longPressedCards.has(item.id),
            'is-live': item.isLive
          }"
          @click="handleGridCardClick(item, $event)"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="(event) => handleTouchEnd(event, item)"
          @contextmenu.prevent="showCardActions(item)"
          @mousedown="(event) => handleMouseDown(event, item)"
          @mouseup="(event) => handleMouseUp(event, item)"
          @mouseleave="(event) => { handleMouseLeave(event, item); hideQuickPreview() }"
          @mouseenter="!item.isFolder && !item.isLive && showQuickPreview(item, $event)"
          :data-item-id="item.id"
        >
          <div class="card-checkbox" @click.stop @touchstart.stop @touchend.stop>
            <el-checkbox 
              :model-value="selectedFiles.includes(item.id)"
              @change="() => toggleFileSelection(item.id)"
              @click.stop
            />
          </div>
          
          <div class="card-thumbnail">
            <!-- 文件夹图标 -->
            <div v-if="item.isFolder" class="folder-thumbnail">
              <el-icon class="folder-icon"><Folder /></el-icon>
            </div>
            <!-- 文件缩略图 -->
            <template v-else>
              <LiveMediaCard v-if="item.isLive" :asset="item.liveAsset" :autoplay="true" @bg-theme="(t)=>setLiveTheme(item.liveAsset.id, t)" />
            <FileThumbnail 
              v-else
              :file="item" 
              size="medium"
              @click="(file) => handleFileClick(file)"
            />
              
            </template>
          </div>
          
          <div class="card-info" :class="item.isLive ? (liveTheme[item.liveAsset.id] === 'light' ? 'theme-light' : 'theme-dark') : ''">
            <div class="file-name" :title="item.original_name">
              {{ item.isLive ? (item.liveAsset?.kind || '实况') : item.original_name }}
            </div>
            <div class="file-meta">
              <span v-if="item.isFolder">文件夹</span>
              <span v-else-if="item.isLive">
                {{ item.liveAsset?.duration_ms ? Math.round(item.liveAsset.duration_ms/1000) + 's' : '实况' }}
                <template v-if="item.liveAsset?.created_at"> • {{ formatTime(item.liveAsset.created_at) }}</template>
              </span>
              <span v-else>{{ formatFileSize(item.file_size) }} • {{ formatTime(item.created_at) }}</span>
            </div>
          </div>
          
          <div class="card-actions" @touchstart.stop @touchmove.stop @touchend.stop>
            <el-button v-if="!item.isFolder && !item.isLive" type="text" size="small" @click.stop="downloadFile(item)" class="action-btn">
              <el-icon><Download /></el-icon>
              <span>下载</span>
            </el-button>
            <el-button v-else-if="item.isLive" type="text" size="small" @click.stop="downloadLiveOriginal(item.liveAsset)" class="action-btn">
              <el-icon><Download /></el-icon>
              <span>下载原件</span>
            </el-button>
            <el-button v-if="systemStore.sharingEnabled && !item.isFolder && !item.isLive" type="text" size="small" @click.stop="shareFileAction(item)" class="action-btn">
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
      </transition>
      
      <!-- 列表视图 -->
      <transition name="fade-fast" mode="out-in" v-else-if="viewMode === 'list'">
      <div class="file-list" :key="`list-${filesStore.currentFolder || 'root'}`">
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
                <el-tag v-if="!row.isFolder && row.file_type==='image' && row.live_video_id" size="small" type="info" class="live-inline-tag">LIVE</el-tag>
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
                <el-button v-if="systemStore.sharingEnabled && !row.isFolder" type="text" size="small" @click="shareFileAction(row)" class="action-btn">
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
      </transition>
      
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

      <!-- Live 全屏 -->
      <LiveMediaFullscreen 
        v-if="showLiveFullscreen" 
        v-model:visible="showLiveFullscreen" 
        :asset="currentLiveAsset!" 
      />
      <LiveMediaPreview 
        v-if="showLivePreview" 
        v-model="showLivePreview" 
        :asset="currentLiveAsset!"
        @fullscreen="openLiveFullscreen"
      />

      <!-- 右键菜单已移除 -->

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

    <!-- 文件夹详情对话框 -->
    <FolderDetailsDialog
      v-model="showFolderDetailsDialog"
      :folder="folderDetails"
      :files-count="folderFilesCount"
      :subfolders-count="folderSubfoldersCount"
      :total-size="folderTotalSize"
      :path="folderPath"
      @enter="handleEnterFolderFromDetails"
      @rename="(f:any)=>renameItem({ ...f, isFolder: true })"
      @delete="(id?:number)=> id && deleteItem({ id, isFolder: true })"
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
              <el-button @click="copyShareUrl" :disabled="!canCopyShare">复制</el-button>
            </template>
          </el-input>
          <div v-if="shareStatus && shareStatus.status !== 'approved'" class="review-status">
            <div class="status-row">
              <span class="label">审核状态：</span>
              <span class="value" :class="shareStatus.status">{{ shareStatusText }}</span>
            </div>
            <el-progress :percentage="shareStatus.review_progress || 0" :stroke-width="8" :show-text="true" />
            <div v-if="shareStatus.review_reason" class="reason">{{ shareStatus.review_reason }}</div>
          </div>
        </div>
        
        <div class="share-options">
          <div class="share-row">
            <el-checkbox v-model="shareOptions.allowDownload">允许下载</el-checkbox>
            <el-checkbox v-model="shareOptions.allowPreview">允许预览</el-checkbox>
          </div>
          <div class="share-row">
            <span class="ttl-label">生存时间</span>
            <el-select v-model="shareOptions.ttlPreset" placeholder="请选择">
              <el-option label="1 小时" :value="'1h'" />
              <el-option label="24 小时" :value="'24h'" />
              <el-option label="7 天" :value="'7d'" />
              <el-option label="自定义(小时)" :value="'custom'" />
              <el-option label="永不过期" :value="'never'" />
            </el-select>
            <el-input-number v-if="shareOptions.ttlPreset==='custom'" v-model="shareOptions.ttlHours" :min="1" :max="24*365" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showShareDialog = false">取消</el-button>
        <el-button type="primary" @click="generateShareLink" :loading="shareCreating">{{ shareStatus ? '重新提交' : '生成链接' }}</el-button>
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
import { ref, reactive, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
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
import { useSystemStore } from '@/stores/system'
import { formatFileSize, formatTime, getFilePreviewUrl, downloadFile as downloadFileUtil, copyToClipboard } from '@/utils/helpers'
import FileUploader from '@/components/FileUploader.vue'
import FilePreview from '@/components/FilePreview.vue'
import FileThumbnail from '@/components/FileThumbnail.vue'
import EnhancedPreviewDialog from '@/components/EnhancedPreviewDialog.vue'
import FolderDetailsDialog from '@/components/FolderDetailsDialog.vue'
import QuickPreview from '@/components/QuickPreview.vue'
import LiveMediaCard from '@/components/LiveMediaCard.vue'
import LiveMediaFullscreen from '@/components/LiveMediaFullscreen.vue'
import LiveMediaPreview from '@/components/LiveMediaPreview.vue'
import api from '@/utils/api'
import type { LiveMediaAsset } from '@/utils/liveMedia'

const router = useRouter()
const systemStore = useSystemStore()
onMounted(() => { if (!systemStore.loaded) systemStore.loadShareStatus() })
const filesStore = useFilesStore()
const authStore = useAuthStore()

// 响应式数据
const showUploadDialog = ref(false)
const showCreateFolderDialog = ref(false)
const showPreviewDialog = ref(false)
const showShareDialog = ref(false)
const previewFile = ref<any | undefined>(undefined)
const previewFileIndex = ref(0)
const shareFile = ref<any | null>(null)
const quickPreviewFile = ref(null)
const showQuickPreviewDialog = ref(false)
const quickPreviewTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const shareUrl = ref('')
const contextFile = ref<any | null>(null)
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const folderFormRef = ref<InstanceType<typeof ElForm>>()
const sortBy = ref('name')
const sortOrder = ref('asc')
const selectedFiles = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// 文件夹详情
const showFolderDetailsDialog = ref(false)
const folderDetails = ref<any>(null)
const folderFilesCount = computed(() => {
  if (!folderDetails.value) return null
  if (filesStore.currentFolder === folderDetails.value.id) {
    return filesStore.files.length
  }
  return null
})
const folderSubfoldersCount = computed(() => {
  if (!folderDetails.value) return null
  if (filesStore.currentFolder === folderDetails.value.id) {
    return filesStore.folders.length
  }
  return null
})
const folderTotalSize = computed(() => {
  if (!folderDetails.value) return null
  if (filesStore.currentFolder === folderDetails.value.id) {
    return filesStore.files.reduce((sum, f) => sum + (f.file_size || 0), 0)
  }
  return null
})

const openFolderDetails = async (folder: any) => {
  folderDetails.value = folder
  try {
    const path = await filesStore.fetchFolderPath(folder.id)
    folderPath.value = path
  } catch {}
  showFolderDetailsDialog.value = true
  showContextMenu.value = false
}

const handleEnterFolderFromDetails = async (folderId?: number) => {
  if (!folderId) return
  filesStore.currentFolder = folderId
  await updateFolderPath(folderId)
  await filesStore.fetchFiles(1)
  await filesStore.fetchFolders()
  showFolderDetailsDialog.value = false
}

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
const onlyLive = ref(false)
const liveAssets = ref<LiveMediaAsset[]>([])
const showLiveFullscreen = ref(false)
const currentLiveAsset = ref<LiveMediaAsset | null>(null)
const showLivePreview = ref(false)
const liveTheme = ref<Record<number, 'light' | 'dark'>>({})
const setLiveTheme = (id: number, t: 'light' | 'dark') => { liveTheme.value[id] = t }

// 关键词解析：支持中文/英文类型关键字
const parseTypeKeywords = (q: string) => {
  const s = q.trim().toLowerCase()
  const isImage = /^(.*)(图片|图像|image|img|photo|jpeg|jpg|png|gif|webp)(.*)$/.test(s)
  const isVideo = /^(.*)(视频|video|mp4|webm|mov|avi)(.*)$/.test(s)
  const isLive  = /^(.*)(实况|live\s?photo|live|动图|motion)(.*)$/.test(s)
  return { isImage, isVideo, isLive }
}

// 文件过滤（名称匹配 或 类型关键字匹配）
const filteredFiles = computed(() => {
  let files = filesStore.files
  const q = searchQuery.value.trim().toLowerCase()
  const { isImage, isVideo } = parseTypeKeywords(q)

  if (q) {
    files = files.filter(file => {
      const nameMatch = (file.original_name || '').toLowerCase().includes(q)
      const typeMatch = (isImage && file.file_type === 'image') || (isVideo && file.file_type === 'video')
      return nameMatch || typeMatch
    })
  }
  if (onlyLive.value) {
    // 仅展示实况对应的源图片（若有标记）
    files = files.filter((f: any) => !f.isFolder && f.file_type === 'image' && f.live_video_id)
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

// 实况过滤（名称/类型关键字）
const filteredLiveAssets = computed(() => {
  const list = liveAssets.value || []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  const { isLive, isImage, isVideo } = parseTypeKeywords(q)
  return list.filter(a => {
    const name = (a.kind || '实况').toLowerCase()
    const nameMatch = name.includes(q)
    const typeMatch = isLive || false // 关键词命中"实况/动图/live/motion"则匹配
    // 若用户搜"图片/视频"，不强行包含实况，除非名称本身命中
    if (isImage || isVideo) {
      return nameMatch
    }
    return nameMatch || typeMatch
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

  // 合并当前文件夹的实况（仅普通视图时，且 liveAssets 已按当前文件夹查询）
  if (!onlyLive.value && filteredLiveAssets.value && filteredLiveAssets.value.length > 0) {
    for (const asset of filteredLiveAssets.value) {
      items.push({
        id: `live_${asset.id}`,
        isFolder: false,
        isLive: true,
        liveAsset: asset,
        original_name: asset.kind || '实况',
        file_size: 0,
        file_type: 'live'
      } as any)
    }
  }

  
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
  // 同步刷新实况资源，确保普通视图合并区也更新
  fetchLiveAssets()
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
  // 预清空 + 打开加载态，旧内容立即消失
  filesStore.loading = true
  filesStore.files = [] as any
  filesStore.folders = [] as any
  filesStore.currentFolder = folderId
  await updateFolderPath(folderId)
  await Promise.all([
    filesStore.fetchFiles(1),
    filesStore.fetchFolders()
  ])
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
  if (isMobile.value) return 1500 // 移动端1.5秒
  if (isTablet.value) return 1500 // 平板1.5秒
  return 1000 // 桌面端1秒
}

// 移动端长按功能
const longPressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
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
  
  // 移动端：保留长按显示操作按钮
  if (isMobile.value) {
    longPressedCards.value.add(item.id)
    startAutoResetTimer()
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
        const allItems = [
          ...(filesStore.folders as any[]).map(folder => ({
            ...folder,
            isFolder: true,
            original_name: folder.folder_name
          })),
          ...(filesStore.files as any[]).map(file => ({
            ...file,
            isFolder: false
          }))
        ] as any[]
        const numericId = Number(itemId)
        const item = allItems.find((item: any) => item.id === numericId)
        if (item) {
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
const autoResetTimer = ref<ReturnType<typeof setTimeout> | null>(null)

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

// 全局点击/触摸：点击卡片以外或非操作区时，立即隐藏操作区（移动端与桌面端一致）
const handleGlobalPointerDown = (event: Event) => {
  const target = event.target as HTMLElement
  // 如果没有任何卡片处于长按显示状态，跳过
  if (!longPressedCards.value || longPressedCards.value.size === 0) return
  // 在操作按钮区域内点击时，不隐藏
  if (target.closest('.card-actions')) return
  // 其余任意位置点击，立即隐藏
  resetLongPressState()
}

onMounted(() => {
  document.addEventListener('mousedown', handleGlobalPointerDown)
  document.addEventListener('touchstart', handleGlobalPointerDown, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleGlobalPointerDown)
  document.removeEventListener('touchstart', handleGlobalPointerDown)
})

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
    // 删除文件或实况
    if ((item as any).isLive && (item as any).liveAsset?.id) {
      await deleteLiveAsset((item as any).liveAsset.id)
    } else {
    deleteFile(item)
    }
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

const toggleFileSelection = (fileId: any, event?: Event) => {
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
const rightClickTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const rightClickDelay = 500 // 右键长按延迟时间

const handleMouseDown = (event: MouseEvent, item: any) => {
  // 桌面端不再通过长按显示操作按钮
  // 只通过右键显示
  return
}

const handleMouseUp = (event: MouseEvent, item: any) => {
  // 桌面端不再需要清理长按定时器
  return
}

const handleMouseLeave = (event: MouseEvent, item: any) => {
  // 桌面端不再需要清理长按定时器
  return
}

const showCardActions = (item: any) => {
  // 仅桌面端通过右键触发
  if (isMobile.value) return
  longPressedCards.value.clear()
  longPressedCards.value.add(item.id)
  startAutoResetTimer()
}

// 右键菜单功能移除

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
  if (!systemStore.sharingEnabled) {
    ElMessage.error('分享功能已关闭')
    return
  }
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
    if ((file as any).isLive) {
      const asset = (file as any).liveAsset as LiveMediaAsset | undefined
      if (asset) {
        downloadLiveOriginal(asset)
        return
      }
      ElMessage.warning('该资源当前不支持直接下载')
      return
    }
    downloadFileUtil(file.id, file.original_name)
    ElMessage.success('开始下载文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 下载实况"原件"
const downloadLiveOriginal = async (asset: LiveMediaAsset) => {
  try {
    // iOS Live Photo：分别下载原图与原视频
    if (asset.kind === 'live_photo') {
      await downloadFromApi(`/live-media/${asset.id}/original-image`, `live_${asset.id}`)
      await downloadFromApi(`/live-media/${asset.id}/original-video`, `live_${asset.id}`)
      ElMessage.success('已开始下载原件（图像与视频）')
      return
    }
    // Android Motion Photo / GIF / WebP：下载原始图像容器
    await downloadFromApi(`/live-media/${asset.id}/original`, `${asset.kind}_${asset.id}`)
    ElMessage.success('已开始下载原件')
  } catch (_) {
    ElMessage.error('原件下载失败')
  }
}

const downloadFromApi = async (endpoint: string, basename: string) => {
  const res = await api.get(endpoint, { responseType: 'blob', timeout: 600000 })
  const contentType = res.headers['content-type'] || ''
  const disposition = res.headers['content-disposition'] || ''
  let filename = basename
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition)
  if (match) {
    filename = decodeURIComponent(match[1] || match[2] || basename)
  } else {
    const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('heic') ? 'heic' : contentType.includes('gif') ? 'gif' : contentType.includes('webp') ? 'webp' : contentType.includes('quicktime') ? 'mov' : ''
    filename = ext ? `${basename}.${ext}` : basename
  }
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const shareFileAction = (file: any) => {
  if (!systemStore.sharingEnabled) {
    ElMessage.error('分享功能已关闭')
    return
  }
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
    
    if ((file as any).isLive && (file as any).liveAsset?.id) {
      await deleteLiveAsset((file as any).liveAsset.id)
    } else {
    await filesStore.deleteFile(file.id)
    }
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
    // 仅实况视图：批量删除实况资源
    if (onlyLive.value) {
      for (const idStr of selectedFiles.value) {
        try { 
          // 从 live_xxx 格式中提取数字ID
          const id = typeof idStr === 'string' && idStr.startsWith('live_') 
            ? parseInt(idStr.replace('live_', '')) 
            : parseInt(idStr)
          await api.delete(`/live-media/${id}`)
          // 立即从本地数组中移除
          const index = liveAssets.value.findIndex(a => a.id === id)
          if (index !== -1) {
            liveAssets.value.splice(index, 1)
          }
        } catch {}
      }
      ElMessage.success(`成功删除 ${selectedFiles.value.length} 个实况`)
      selectedFiles.value = []
      return
    }

    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个项目吗？`,
      '批量删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
  // 分别处理文件/文件夹/实况
    const filesToDelete = []
    const foldersToDelete = []
  const liveToDelete: number[] = []
    
  // 获取所有项目信息（含合并的实况项）
    const allItems = [
      ...(filesStore.folders as any[]).map(folder => ({
        ...folder,
        isFolder: true,
        original_name: folder.folder_name,
        file_size: 0,
        file_type: 'folder'
      })),
      ...(filesStore.files as any[]).map(file => ({
        ...file,
        isFolder: false
      }))
    ] as any[]
    
    // 分类选中的项目
    for (const itemId of selectedFiles.value) {
    // 识别实况ID
    if (typeof itemId === 'string' && itemId.startsWith('live_')) {
      const numId = parseInt(itemId.replace('live_', ''))
      if (!Number.isNaN(numId)) liveToDelete.push(numId)
      continue
    }
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
    
  // 删除实况
  for (const liveId of liveToDelete) {
    try { await api.delete(`/live-media/${liveId}`) } catch {}
  }
  const totalCount = filesToDelete.length + foldersToDelete.length + liveToDelete.length
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
const generateShareLink = async () => {
  if (!systemStore.sharingEnabled) {
    ElMessage.error('分享功能已关闭')
    return
  }
  if (!shareFile.value) return
  try {
    shareCreating.value = true
    shareUrl.value = ''
    shareStatus.value = null
    shareToken.value = null
    let expireInHours: number | null = null
    if (shareOptions.ttlPreset === '1h') expireInHours = 1
    else if (shareOptions.ttlPreset === '24h') expireInHours = 24
    else if (shareOptions.ttlPreset === '7d') expireInHours = 24*7
    else if (shareOptions.ttlPreset === 'custom') expireInHours = Math.max(1, Number(shareOptions.ttlHours || 0))
    else if (shareOptions.ttlPreset === 'never') expireInHours = null
    const { data } = await api.post('/share', {
      file_id: shareFile.value.id,
      allowPreview: !!shareOptions.allowPreview,
      allowDownload: !!shareOptions.allowDownload,
      expireInHours
    })
    if (data && data.success && data.token) {
      shareToken.value = data.token
      shareStatus.value = { status: data.status || 'pending_review', review_progress: data.review_progress || 0 }
      startSharePolling()
      ElMessage.success('已提交审核，请稍候...')
    } else {
      ElMessage.error('生成分享链接失败')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || '生成分享链接失败'
    ElMessage.error(msg)
  } finally {
    shareCreating.value = false
  }
}

function startSharePolling() {
  if (!shareToken.value) return
  stopSharePolling()
  sharePoller = setInterval(async () => {
    try {
      const { data } = await api.get(`/share/${shareToken.value}/status`)
      shareStatus.value = { status: data.status, review_progress: data.review_progress || 0, review_reason: data.review_reason }
      if (data.status === 'approved') {
        const baseUrl = window.location.origin
        shareUrl.value = `${baseUrl}/share/${shareToken.value}`
        stopSharePolling()
        ElMessage.success('审核通过，分享链接已生成')
      } else if (data.status === 'rejected') {
        stopSharePolling()
        ElMessage.error(data.review_reason || '审核未通过')
      }
    } catch (_) {}
  }, 1000)
}
function stopSharePolling() { if (sharePoller) { clearInterval(sharePoller); sharePoller = null } }
// 关闭弹窗时停止轮询
watch(showShareDialog, (v) => { if (!v) { stopSharePolling() } })

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
  // 恢复仅实况筛选
  try { const v = localStorage.getItem('onlyLive'); if (v !== null) onlyLive.value = v === '1' } catch {}
  
  // 监听用户设置变化
  window.addEventListener('preferencesUpdated', loadViewSettings)
  // 首屏无论是否仅实况，都拉取一次当前上下文的实况资源
  fetchLiveAssets()
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

// 拉取实况资源
const fetchLiveAssets = async () => {
  try {
    const params: any = { page: 1, limit: 60 }
    if (!onlyLive.value && filesStore.currentFolder) params.folder_id = filesStore.currentFolder
    if (onlyLive.value && filesStore.currentFolder) params.folder_id = filesStore.currentFolder
    const { data } = await api.get('/live-media', { params })
    liveAssets.value = data.items || []
  } catch (e) {
    liveAssets.value = []
  }
}

// 监听"仅实况"切换
watch(onlyLive, async (val) => {
  // 切换筛选时，同步刷新实况数据（当前文件夹上下文）
  await fetchLiveAssets()
  try { localStorage.setItem('onlyLive', val ? '1' : '0') } catch {}
})

// 当前文件夹变化时刷新实况（用于普通视图合并展示该文件夹内实况）
watch(() => filesStore.currentFolder, async () => {
  await fetchLiveAssets()
})

const openLiveFullscreen = (asset: LiveMediaAsset) => {
  currentLiveAsset.value = asset
  showLiveFullscreen.value = true
}

const openLivePreview = (asset: LiveMediaAsset) => {
  currentLiveAsset.value = asset
  showLivePreview.value = true
}

const getLiveCreatedAt = (asset: any): string | null => {
  return asset?.created_at || null
}

const toggleOnlyLive = () => {
  onlyLive.value = !onlyLive.value
}

  // 新增：常规视图点击卡片时，识别实况资源并打开预览
  const handleGridCardClick = (item: any, event?: Event) => {
    if (item?.isLive && item?.liveAsset) {
      openLivePreview(item.liveAsset as LiveMediaAsset)
      return
    }
    if (!isMobile.value) handleItemClick(item, event as any)
  }

// 删除单个实况
const deleteLiveAsset = async (assetId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该实况吗？', '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await api.delete(`/live-media/${assetId}`)
    // 立即从本地数组中移除，实现即时更新
    const index = liveAssets.value.findIndex(a => a.id === assetId)
    if (index !== -1) {
      liveAssets.value.splice(index, 1)
    }
    // 清理选中状态（合并视图下实况项的 id 形如 `live_12`）
    const selectedKey = `live_${assetId}`
    const selIndex = selectedFiles.value.indexOf(selectedKey as any)
    if (selIndex !== -1) {
      selectedFiles.value.splice(selIndex, 1)
    }
    // 保险刷新一次实况数据，确保与后端完全同步并触发所有依赖计算
    await fetchLiveAssets()
    ElMessage.success('实况已删除')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

// 恢复模板依赖的状态
const folderPath = ref<Array<{ id: number, name: string }>>([])
const shareOptions = reactive({
  allowDownload: true as boolean,
  allowPreview: true as boolean,
  ttlPreset: '24h' as '1h' | '24h' | '7d' | 'custom' | 'never',
  ttlHours: 24 as number
})
const filteredFolders = computed(() => {
  let folders = filesStore.folders
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    folders = folders.filter(folder => (folder.folder_name || '').toLowerCase().includes(q))
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

// 新建/重命名文件夹表单
const folderForm = reactive({ name: '' })
const folderRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { min: 1, max: 50, message: '文件夹名称长度应在1-50个字符之间', trigger: 'blur' }
  ]
}

const shareCreating = ref(false)
const shareToken = ref<string | null>(null)
const shareStatus = ref<{ status: string, review_progress: number, review_reason?: string } | null>(null)
let sharePoller: any = null
const canCopyShare = computed(() => !!shareUrl.value && !!shareStatus.value && shareStatus.value.status === 'approved')
const shareStatusText = computed(() => {
  if (!shareStatus.value) return ''
  const s = shareStatus.value.status
  return s === 'pending_review' ? '审核中' : s === 'approved' ? '已通过' : s === 'rejected' ? '未通过' : s
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
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  max-width: calc(100vw - 400px); // 限制宽度与内容区域一致
  margin-left: auto;
  margin-right: auto;
  
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
        background: #000000;
        border: none;
        color: #ffffff;
        
        &:hover {
          background: #374151;
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
        border: 1px solid #d1d5db;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #9ca3af;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        &.is-focus {
          border-color: #000000;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
      }
    }
    
    .sort-dropdown {
      .sort-btn {
        height: 32px;
        padding: 0 12px;
        border-radius: 10px;
        font-weight: 500;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        color: #374151;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f3f4f6;
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
          background: #000000;
          border: none;
          color: #ffffff;
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
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  
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
      background: #000000;
      border: none;
      color: #ffffff;
      
      &:hover {
        background: #374151;
      }
    }
    
    .mobile-folder-btn {
      background: #f9fafb;
      border: 1px solid #d1d5db;
      color: #374151;
      
      &:hover {
        background: #f3f4f6;
      }
    }
    
    .mobile-refresh-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      padding: 0;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      color: #374151;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f3f4f6;
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
        border: 1px solid #d1d5db;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #9ca3af;
        }
        
        &.is-focus {
          border-color: #000000;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
      }
    }
    
    .mobile-sort-dropdown {
      .mobile-sort-btn {
        width: 36px;
        height: 32px;
        border-radius: 10px;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        color: #374151;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f3f4f6;
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
          background: #000000;
          border: none;
          color: #ffffff;
        }
      }
    }
  }
  
  .mobile-batch-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 12px 16px;
    margin-top: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .batch-info {
      font-size: 14px;
      color: #374151;
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
  background: #000000;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid #374151;
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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
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
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 优化阴影
  border: 1px solid #e5e7eb; // 优化边框
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
      color: #9ca3af;
      margin-bottom: 3px;
    }
    
    .empty-title {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1px;
    }
    
    .empty-description {
      font-size: 9px;
      color: #6b7280;
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
    color: #374151;
    margin-bottom: 4px;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 10px;
    color: #6b7280;
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
    &.is-live { position: relative; }
    // 统一信息区高度，实况使用占位与之对齐
    --info-height: 56px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative; // 添加相对定位，以便card-actions绝对定位
    
    &:hover {
      border-color: #000000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    
    &.folder-card {
      border: none;
      
      &:hover {
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    position: relative;
    height: 120px;
    background: #f9fafb;
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
      background: #6b7280;
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
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
      min-height: var(--info-height);
    
    .file-name {
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    }
    
    .file-meta {
      font-size: 12px;
      color: #f3f4f6;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .live-badge {
      position: absolute;
      left: 8px;
      bottom: 8px;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      letter-spacing: 1px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }

    // 占位条：不再需要
    .card-info-spacer.live-spacer { display: none; }

    // 操作按钮层级高于任何缩略图覆盖元素/角标
    .card-actions { position: relative; z-index: 5; }
  }

// 移除实况覆盖层

  // 亮色主题（背景偏亮时使用深色文字）
.card-info.theme-light {
    background: rgba(255,255,255,0.28);
    border-color: rgba(255,255,255,0.4);
    .file-name { color: #111827; text-shadow: none; }
    .file-meta { color: #374151; text-shadow: none; }
  }
.card-info.theme-dark {
    // 保持默认深色文字样式
  }
}

.file-list {
  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .file-type-icon {
      color: #374151;
    }
    .live-inline-tag {
      height: 18px;
      line-height: 18px;
      padding: 0 6px;
      border-radius: 9px;
      font-size: 10px;
      color: #fff;
      background: #4b5563;
      border: none;
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
  
  // 视图切换淡入淡出，减少切换文件夹的残影
  .fade-fast-enter-active, .fade-fast-leave-active { transition: opacity .12s ease; }
  .fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }
  
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
          color: #374151;
        }
        
        &.el-button--primary {
          background: #000000;
          color: white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
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
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
    
    .batch-info {
      font-size: 14px;
      color: #374151;
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
  
  // 桌面端：不通过 hover 显示操作按钮
  // 只能通过右键 (long-pressed 类) 显示
  @media (hover: hover) and (pointer: fine) {
    .file-card:hover .card-actions { 
      opacity: 0 !important; 
      visibility: hidden !important; 
      pointer-events: none !important; 
    }
    .file-card.long-pressed .card-actions { 
      opacity: 1 !important; 
      visibility: visible !important; 
      pointer-events: auto !important; 
    }
  }
  
  // 移动端：触摸时也不显示操作按钮
  // 只能通过长按1秒 (long-pressed 类) 显示
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
      border: none;
      
      &:hover {
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      color: #374151;
    }
    
    .folder-icon {
      font-size: 18px;
      color: #6b7280;
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
      color: #6b7280;
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
  z-index: 9;
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

// 桌面端和移动端：都不通过 hover 或 active 显示操作按钮
// 只能通过右键（桌面端）或长按1秒（移动端）显示

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
  
  // 移动端：使用卡片内操作层，不使用 context-menu
  .context-menu { display: none !important; }
  .file-card.long-pressed .card-actions { opacity: 1; visibility: visible; pointer-events: auto; }
  
  // 移动端：不通过 hover 或 active 显示操作按钮，只通过长按1秒
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
      border-bottom: 1px solid #e5e7eb !important;
      margin-bottom: 0 !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #111827 !important;
      }
      
      .el-dialog__headerbtn {
        top: 20px !important;
        right: 20px !important;
        width: 32px !important;
        height: 32px !important;
        
        .el-dialog__close {
          font-size: 18px !important;
          color: #6b7280 !important;
          
          &:hover {
            color: #374151 !important;
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
              border: 2px solid #e5e7eb !important;
              background-color: #f9fafb !important;
              color: #111827 !important;
              
              &:focus {
                border-color: #374151 !important;
                box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1) !important;
                background-color: #ffffff !important;
              }
              
              &::placeholder {
                color: #9ca3af !important;
              }
            }
          }
        }
      }
    }
    
    .el-dialog__footer {
      padding: 0 20px 20px 20px !important;
      border-top: 1px solid #e5e7eb !important;
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
            background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
            border: none !important;
            color: #ffffff !important;
            
            &:hover {
              background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 25px rgba(55, 65, 81, 0.3) !important;
            }
          }
          
          &:not(.el-button--primary) {
            background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%) !important;
            border: 1px solid #d1d5db !important;
            color: #374151 !important;
            
            &:hover {
              background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%) !important;
              border-color: #9ca3af !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 4px 15px rgba(55, 65, 81, 0.1) !important;
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

// 全局Element Plus组件样式覆盖 - 新建文件夹对话框
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
  border: none !important;
  color: #ffffff !important;
  
  &:hover {
    background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
  }
  
  &:active {
    background: linear-gradient(135deg, #000000 0%, #111827 100%) !important;
  }
}

:deep(.el-button--default) {
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%) !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  
  &:hover {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%) !important;
    border-color: #9ca3af !important;
  }
  
  &:active {
    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%) !important;
  }
}

:deep(.el-input__wrapper) {
  background-color: #f9fafb !important;
  border: 1px solid #e5e7eb !important;
  color: #111827 !important;
  
  &:hover {
    border-color: #9ca3af !important;
  }
  
  &.is-focus {
    border-color: #374151 !important;
    box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1) !important;
    background-color: #ffffff !important;
  }
}

:deep(.el-input__inner) {
  color: #111827 !important;
  
  &::placeholder {
    color: #9ca3af !important;
  }
}

:deep(.el-form-item__label) {
  color: #374151 !important;
  
  &.is-required::before {
    color: #6b7280 !important;
  }
}

// 在移动端/平板：仅长按显示操作按钮，并以2列栅格布局显示，按钮等分5:5
@media (max-width: 1023px) {
  .file-card .card-actions {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 两列，5:5 等分 */
    gap: 6px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .file-card .card-actions .action-btn {
    width: 100%;
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 禁用 hover/active 触发，只有 long-pressed 才显示 */
  .file-card:hover .card-actions,
  .file-card:active .card-actions {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  .file-card.long-pressed .card-actions {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
}

/* 审核状态样式 */
.review-status { margin-top: 8px; }
.review-status .status-row { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 6px; }
.review-status .status-row .label { color: #6b7280; }
.review-status .status-row .value { font-weight: 600; }
.review-status .status-row .value.pending_review { color: #8a8a8a; }
.review-status .status-row .value.approved { color: #16a34a; }
.review-status .status-row .value.rejected { color: #dc2626; }
</style>