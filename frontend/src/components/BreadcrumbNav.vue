<template>
  <div class="breadcrumb-nav">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>
        <el-button type="text" @click="$emit('go-root')" class="breadcrumb-btn">
          <el-icon><House /></el-icon>
          根目录
        </el-button>
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-for="(folder, index) in path"
        :key="folder.id"
      >
        <el-button
          v-if="index < path.length - 1"
          type="text"
          @click="$emit('go-folder', folder.id)"
          class="breadcrumb-btn"
        >
          {{ folder.name }}
        </el-button>
        <span v-else class="current-folder">{{ folder.name }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { House } from '@element-plus/icons-vue'

interface BreadcrumbItem { id: number; name: string }

defineProps<{ path: BreadcrumbItem[] }>()
defineEmits<{
  'go-root': []
  'go-folder': [id: number]
}>()
</script>

<style scoped lang="scss">
.breadcrumb-nav {
  background: #000000;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid #374151;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
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

      &:last-child .el-breadcrumb__inner {
        color: white;
        font-weight: 600;
      }
    }

    .el-breadcrumb__separator {
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
      margin: 0 6px;
    }
  }

  .breadcrumb-btn {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s ease;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;

    .el-icon {
      font-size: 14px;
    }

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
  }

  .current-folder {
    color: white;
    font-weight: 600;
    font-size: 14px;
    padding: 4px 8px;
  }
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 12px 16px;

    :deep(.el-breadcrumb) {
      .el-breadcrumb__inner,
      .breadcrumb-btn,
      .current-folder {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .breadcrumb-nav {
    padding: 8px 12px;
    border-radius: 10px;

    :deep(.el-breadcrumb) {
      .el-breadcrumb__inner,
      .breadcrumb-btn,
      .current-folder {
        font-size: 11px;
      }

      .el-breadcrumb__separator {
        margin: 0 3px;
        font-size: 10px;
      }
    }
  }
}
</style>