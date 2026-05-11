<template>
  <el-dialog
    v-model="dialogVisible"
    title="分享文件"
    width="500px"
  >
    <div class="share-content">
      <div class="share-info">
        <h4>{{ file?.original_name }}</h4>
        <p>文件大小: {{ formatFileSize(file?.file_size || 0) }}</p>
      </div>

      <div class="share-link">
        <el-input :model-value="shareUrl" readonly placeholder="生成分享链接...">
          <template #append>
            <el-button @click="copyShareUrl" :disabled="!canCopyShare">复制</el-button>
          </template>
        </el-input>
        <div v-if="shareStatus && shareStatus.status !== 'approved'" class="review-status">
          <div class="status-row">
            <span class="label">审核状态：</span>
            <span class="value" :class="shareStatus.status">{{ shareStatusText }}</span>
          </div>
          <el-progress
            :percentage="shareStatus.review_progress || 0"
            :stroke-width="8"
            :show-text="true"
          />
          <div v-if="shareStatus.review_reason" class="reason">
            {{ shareStatus.review_reason }}
          </div>
        </div>
      </div>

      <div class="share-options">
        <div class="share-row">
          <el-checkbox v-model="options.allowDownload">允许下载</el-checkbox>
          <el-checkbox v-model="options.allowPreview">允许预览</el-checkbox>
        </div>
        <div class="share-row">
          <span class="ttl-label">生存时间</span>
          <el-select v-model="options.ttlPreset" placeholder="请选择">
            <el-option label="1 小时" value="1h" />
            <el-option label="24 小时" value="24h" />
            <el-option label="7 天" value="7d" />
            <el-option label="自定义(小时)" value="custom" />
            <el-option label="永不过期" value="never" />
          </el-select>
          <el-input-number
            v-if="options.ttlPreset === 'custom'"
            v-model="options.ttlHours"
            :min="1"
            :max="24 * 365"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="$emit('generate')"
        :loading="loading"
      >{{ shareStatus ? '重新提交' : '生成链接' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { formatFileSize } from '@/utils/helpers'

interface ShareStatus {
  status: string
  review_progress?: number
  review_reason?: string
}

interface ShareOptions {
  allowDownload: boolean
  allowPreview: boolean
  ttlPreset: string
  ttlHours: number
}

const props = defineProps<{
  modelValue: boolean
  file: { original_name?: string; file_size?: number } | null
  shareUrl: string
  shareStatus: ShareStatus | null
  loading: boolean
  options: ShareOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'generate': []
  'copy': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const canCopyShare = computed(() => !!props.shareUrl)

const shareStatusText = computed(() => {
  const s = props.shareStatus?.status
  if (s === 'pending') return '审核中'
  if (s === 'reviewing') return 'AI审核中'
  if (s === 'approved') return '已通过'
  if (s === 'rejected') return '未通过'
  return s || ''
})

const copyShareUrl = async () => {
  if (!props.shareUrl) return
  try {
    await navigator.clipboard.writeText(props.shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
    emit('copy')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped lang="scss">
.share-content {
  .share-info {
    margin-bottom: 20px;
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }
  }

  .share-link {
    margin-bottom: 20px;
    .review-status {
      margin-top: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
      .status-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        .label { font-size: 13px; color: #374151; }
        .value {
          font-size: 13px;
          font-weight: 600;
          &.pending, &.reviewing { color: #f59e0b; }
          &.approved { color: #16a34a; }
          &.rejected { color: #dc2626; }
        }
      }
      .reason {
        margin-top: 8px;
        font-size: 12px;
        color: #dc2626;
      }
    }
  }

  .share-options {
    .share-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;

      .ttl-label {
        font-size: 13px;
        color: #374151;
        white-space: nowrap;
      }

      .el-select {
        flex: 1;
        min-width: 140px;
      }
    }
  }
}

@media (max-width: 480px) {
  .share-content {
    .share-options .share-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      .el-select, .el-input-number { width: 100%; }
    }
  }
}
</style>
