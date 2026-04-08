<template>
  <div class="file-uploader">
    <!-- 拖拽上传区域 -->
    <div
      ref="dropZoneRef"
      class="drop-zone"
      :class="{ 'is-dragover': isDragOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <div class="drop-content">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <h3 class="upload-title">拖拽文件到此处上传</h3>
        <p class="upload-subtitle">或点击选择文件</p>
        <div class="upload-tips">
          <span class="tip-item">支持图片、HEIC/HEIF 和 MP4/MOV 视频</span>
          <span class="tip-item">单个文件最大{{ maxFileSizeMB }}MB</span>
        </div>
      </div>
    </div>

    <!-- 文件选择输入（所有设备统一 accept） -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="computedUnifiedAccept"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 上传队列（store 全局状态，弹窗关闭后继续显示） -->
    <div v-if="uploadItems.length > 0" class="upload-list">
      <div class="upload-list-header">
        <h4>上传队列</h4>
        <span class="stats-summary">
          <span class="s-total">{{ uploadStats.total }}</span> 个文件 ·
          <span class="s-done">{{ uploadStats.success }}</span> 成功 ·
          <span class="s-err">{{ uploadStats.error }}</span> 失败
        </span>
        <el-button type="text" @click="clearUploadItems">清空</el-button>
      </div>

      <div class="upload-items">
        <div
          v-for="item in uploadItems"
          :key="item.id"
          class="upload-item"
          :class="[item.status, `type-${item.fileCategory}`]"
        >
          <!-- 缩略图 / 图标 -->
          <div class="item-thumb">
            <img v-if="item.preview" :src="item.preview" class="thumb-img" />
            <div v-else class="thumb-icon" :class="item.fileCategory">
              <el-icon
                ><VideoPlay
                  v-if="item.fileCategory === 'video'"
                /><Document v-else
              /></el-icon>
              <span v-if="item.fileCategory === 'animated'" class="live-badge"
                >GIF</span
              >
            </div>
          </div>

          <!-- 信息 -->
          <div class="item-info">
            <div class="item-name">{{ item.file.name }}</div>
            <div class="item-meta">
              <span class="item-size">{{ formatSize(item.file.size) }}</span>
              <span
                v-if="item.fileCategory === 'animated'"
                class="tag tag-animated"
                >动图</span
              >
              <span
                v-else-if="item.fileCategory === 'video'"
                class="tag tag-video"
                >视频</span
              >
              <span
                v-else-if="item.fileCategory === 'image'"
                class="tag tag-image"
                >图片</span
              >
              <span v-if="item.status === 'detecting'" class="tag tag-detecting"
                >识别中</span
              >
            </div>
            <div
              v-if="item.status === 'uploading' || item.status === 'detecting'"
              class="item-progress"
            >
              <el-progress
                :percentage="item.progress"
                :stroke-width="4"
                :show-text="false"
                :color="progressColor(item.fileCategory)"
              />
            </div>
            <div v-if="item.status === 'error'" class="item-error">
              {{ item.error }}
            </div>
          </div>

          <!-- 状态图标 -->
          <div class="item-status">
            <el-icon v-if="item.status === 'pending'" class="ic ic-pending"
              ><Clock
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'detecting'"
              class="ic ic-detecting"
              ><Loading
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'uploading'"
              class="ic ic-uploading"
              ><Loading
            /></el-icon>
            <el-icon v-else-if="item.status === 'success'" class="ic ic-success"
              ><Check
            /></el-icon>
            <el-icon v-else-if="item.status === 'error'" class="ic ic-error"
              ><Close
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'canceled'"
              class="ic ic-canceled"
              ><Close
            /></el-icon>
          </div>

          <!-- 操作 -->
          <div class="item-actions">
            <el-button
              v-if="item.status === 'error'"
              type="text"
              size="small"
              @click="retryUploadItem(item.id)"
              >重试</el-button
            >
            <el-button
              type="text"
              size="small"
              class="rm-btn"
              @click="removeUploadItem(item.id)"
              >移除</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Upload,
  Loading,
  VideoPlay,
  Clock,
  Check,
  Close,
  Document,
} from "@element-plus/icons-vue";
import { useFilesStore } from "@/stores/files";
import { formatFileSize } from "@/utils/helpers";

const emit = defineEmits<{ "upload-success": [] }>();
const filesStore = useFilesStore();

// ── 上传队列状态（来自 store）─────────────────────────────────────
const uploadItems = computed(() => filesStore.uploadItems);
const uploadStats = computed(() => filesStore.uploadStats);
const maxFileSizeMB = computed(() => filesStore.systemSettings.maxFileSize);

// ── accept ────────────────────────────────────────────────────────
const computedUnifiedAccept = computed(() => {
  // 全类型支持
  const imageExts = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".heic",
    ".heif",
    ".bmp",
  ];
  const videoExts = [".mp4", ".webm", ".mov", ".mkv", ".avi", ".3gp", ".m4v"];
  return [
    "image/*",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
    "video/*",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    ...imageExts,
    ...videoExts,
    ...imageExts.map((e) => e.toUpperCase()),
    ...videoExts.map((e) => e.toUpperCase()),
  ].join(",");
});

// ── refs ─────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);

// ── 触发选择 ────────────────────────────────────────────────────
const triggerFileInput = () => {
  if (fileInputRef.value)
    fileInputRef.value.accept = computedUnifiedAccept.value;
  fileInputRef.value?.click();
};

// ── 文件选择处理 ─────────────────────────────────────────────────
const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  target.value = "";
  if (!files.length) return;

  // 添文件到上传队列
  filesStore.addFiles(files);
};

// ── 拖拽 ────────────────────────────────────────────────────────
const handleDragOver = () => {
  isDragOver.value = true;
};
const handleDragLeave = () => {
  isDragOver.value = false;
};
const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  if (!files.length) return;
  filesStore.addFiles(files);
};

// ── 工具函数 ────────────────────────────────────────────────────
const formatSize = (bytes: number) => formatFileSize(bytes);

const progressColor = (cat: string) => {
  if (cat === "animated") return "#f59e0b";
  if (cat === "video") return "#0ea5e9";
  return "#667eea";
};

function normalizeJobId(raw: any): string | null {
  if (raw == null) return null;
  if (typeof raw === "string" || typeof raw === "number") return String(raw);
  if (typeof raw === "object") {
    if (raw.id != null) return String(raw.id);
    if (raw.jobId != null) return String(raw.jobId);
  }
  return null;
}

// ── 队列操作（代理到 store）──────────────────────────────────────
const removeUploadItem = (id: string) => {
  filesStore.cancelUploadItem(id);
  filesStore.removeUploadItem(id);
};
const clearUploadItems = () => filesStore.clearUploadItems();
const retryUploadItem = (id: string) => filesStore.retryUploadItem(id);

// ── 初始化 ─────────────────────────────────────────────────────
onMounted(() => {
  filesStore.fetchSystemSettings();
  // 获取 COS 配置（用于前端直传）
  filesStore.fetchCosConfig();
});
</script>

<style lang="scss" scoped>
.file-uploader {
  .drop-zone {
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    padding: 48px 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    &:hover {
      border-color: #374151;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }
    &.is-dragover {
      border-color: #111827;
      transform: scale(1.01);
      background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    }
  }
  .drop-content {
    .upload-icon {
      font-size: 56px;
      color: #374151;
      margin-bottom: 16px;
      animation: float 3s ease-in-out infinite;
    }
    .upload-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    .upload-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin-bottom: 20px;
    }
  }
  .upload-tips {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    .tip-item {
      font-size: 12px;
      color: #374151;
      padding: 5px 12px;
      background: rgba(55, 65, 81, 0.08);
      border-radius: 20px;
      border: 1px solid rgba(55, 65, 81, 0.15);
    }
  }
}

.upload-list {
  margin-top: 24px;
  .upload-list-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 10px;
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .stats-summary {
      font-size: 13px;
      color: #6b7280;
      flex: 1;
    }
    .s-done {
      color: #16a34a;
      font-weight: 600;
    }
    .s-err {
      color: #dc2626;
      font-weight: 600;
    }
    .el-button {
      color: #667eea;
      font-weight: 600;
    }
  }
  .upload-items {
    max-height: 380px;
    overflow-y: auto;
    padding: 6px 0;
  }
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 6px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-left: 3px solid #d1d5db;
  transition: all 0.2s;
  &:hover {
    background: #f8f9fa;
  }
  &.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
    border-left-color: #16a34a;
  }
  &.error {
    background: #fef2f2;
    border-color: #fecaca;
    border-left-color: #dc2626;
  }
  &.uploading {
    background: #eff6ff;
    border-color: #bfdbfe;
    border-left-color: #2563eb;
  }
  &.type-image {
    border-left-color: #667eea;
  }
  &.type-video {
    border-left-color: #0ea5e9;
  }
  &.type-animated {
    border-left-color: #f59e0b;
  }

  .item-thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f4f6;
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumb-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
      position: relative;
      &.image {
        background: linear-gradient(135deg, #667eea, #764ba2);
      }
      &.video {
        background: linear-gradient(135deg, #0ea5e9, #06b6d4);
      }
      &.animated {
        background: linear-gradient(135deg, #f59e0b, #f97316);
      }
      &.unknown {
        background: #9ca3af;
      }
      .live-badge {
        position: absolute;
        bottom: 1px;
        right: 2px;
        font-size: 7px;
        font-weight: 700;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        padding: 0 3px;
        border-radius: 3px;
        letter-spacing: 0.5px;
      }
    }
  }

  .item-info {
    flex: 1;
    min-width: 0;
    .item-name {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .item-size {
      font-size: 11px;
      color: #9ca3af;
    }
    .tag {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .tag-image {
      background: rgba(102, 126, 234, 0.12);
      color: #4338ca;
    }
    .tag-video {
      background: rgba(14, 165, 233, 0.12);
      color: #0284c7;
    }
    .tag-animated {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
    }
    .tag-detecting {
      background: rgba(139, 92, 246, 0.12);
      color: #7c3aed;
    }
    .item-progress {
      margin-top: 5px;
    }
    .item-error {
      font-size: 11px;
      color: #dc2626;
      margin-top: 2px;
    }
  }

  .item-status {
    .ic {
      font-size: 20px;
    }
    .ic-pending {
      color: #9ca3af;
    }
    .ic-detecting,
    .ic-uploading {
      color: #2563eb;
      animation: spin 1s linear infinite;
    }
    .ic-success {
      color: #16a34a;
    }
    .ic-error {
      color: #dc2626;
    }
    .ic-canceled {
      color: #9ca3af;
    }
  }

  .item-actions {
    .el-button {
      font-size: 12px;
      font-weight: 600;
    }
    .rm-btn {
      color: #9ca3af;
      &:hover {
        color: #dc2626;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 600px) {
  .file-uploader .drop-zone {
    padding: 36px 20px;
  }
  .file-uploader .upload-title {
    font-size: 18px;
  }
  .file-uploader .upload-tips {
    flex-direction: column;
    align-items: center;
  }
  .upload-item {
    gap: 8px;
  }
}
</style>
