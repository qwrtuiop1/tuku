<template>
  <el-dialog
    v-model="dialogVisible"
    title="新建文件夹"
    :width="isMobile ? '90%' : '400px'"
    :class="{ 'mobile-folder-dialog': isMobile }"
    :modal-class="isMobile ? 'mobile-modal' : ''"
  >
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入文件夹名称"
          @keyup.enter="handleCreate"
          :class="{ 'mobile-input': isMobile }"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div :class="{ 'mobile-footer': isMobile }">
        <el-button
          @click="dialogVisible = false"
          :class="{ 'mobile-btn': isMobile }"
        >取消</el-button>
        <el-button
          type="primary"
          @click="handleCreate"
          :class="{ 'mobile-btn': isMobile }"
          :loading="loading"
        >创建</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useFilesStore } from '@/stores/files'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': [id: number]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const filesStore = useFilesStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = ref({ name: '' })

const isMobile = computed(() => window.innerWidth <= 768)

const rules: FormRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { min: 1, max: 100, message: '文件夹名称不能超过100个字符', trigger: 'blur' },
  ],
}

watch(dialogVisible, (v) => {
  if (v) form.value.name = ''
})

const handleCreate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await filesStore.createFolder(form.value.name)
    ElMessage.success('文件夹创建成功')
    emit('created')
    dialogVisible.value = false
  } catch {
    ElMessage.error('创建文件夹失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
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

        .el-dialog__close {
          color: #6b7280 !important;
          &:hover { color: #374151 !important; }
        }
      }
    }

    .el-dialog__body {
      padding: 20px !important;

      .el-form-item {
        margin-bottom: 0 !important;

        .mobile-input :deep(.el-input__inner) {
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
        }
      }
    }

    .el-dialog__footer {
      padding: 16px 20px !important;
      border-top: 1px solid #e5e7eb !important;
      background: #f9fafb !important;

      .mobile-footer {
        display: flex;
        gap: 12px;
        flex-direction: row !important;
        justify-content: flex-end !important;

        .mobile-btn {
          flex: 1;
          height: 44px;
          font-size: 15px;
          border-radius: 10px;
        }
      }
    }
  }
}
</style>
