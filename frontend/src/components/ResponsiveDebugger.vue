<template>
  <div v-if="showDebugger" class="responsive-debugger">
    <div class="debug-info">
      <div class="debug-item">
        <span class="debug-label">屏幕宽度:</span>
        <span class="debug-value">{{ screenWidth }}px</span>
      </div>
      <div class="debug-item">
        <span class="debug-label">当前断点:</span>
        <span class="debug-value" :class="currentBreakpoint">{{ currentBreakpoint }}</span>
      </div>
      <div class="debug-item">
        <span class="debug-label">设备类型:</span>
        <span class="debug-value">{{ deviceType }}</span>
      </div>
      <div class="debug-item">
        <span class="debug-label">侧边栏状态:</span>
        <span class="debug-value">{{ sidebarCollapsed ? '收起' : '展开' }}</span>
      </div>
    </div>
    <div class="debug-actions">
      <el-button size="small" @click="toggleDebugger">隐藏调试</el-button>
      <el-button size="small" @click="refreshInfo">刷新信息</el-button>
    </div>
  </div>
  <div v-else class="debug-toggle">
    <el-button size="small" @click="toggleDebugger">显示调试信息</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showDebugger = ref(false)
const screenWidth = ref(0)

// 计算当前断点
const currentBreakpoint = computed(() => {
  const width = screenWidth.value
  if (width >= 1920) return 'xxxl'
  if (width >= 1440) return 'xxl'
  if (width >= 1200) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 768) return 'md'
  if (width >= 480) return 'sm'
  if (width >= 320) return 'xs'
  return 'xxs'
})

// 计算设备类型
const deviceType = computed(() => {
  const width = screenWidth.value
  if (width >= 1200) return '桌面端'
  if (width >= 768) return '平板端'
  if (width >= 480) return '大屏手机'
  if (width >= 320) return '小屏手机'
  return '超小屏手机'
})

// 侧边栏状态（从父组件获取）
const sidebarCollapsed = ref(false)

// 更新屏幕信息
const updateScreenInfo = () => {
  screenWidth.value = window.innerWidth
}

// 切换调试器显示
const toggleDebugger = () => {
  showDebugger.value = !showDebugger.value
}

// 刷新信息
const refreshInfo = () => {
  updateScreenInfo()
}

// 监听窗口大小变化
const handleResize = () => {
  updateScreenInfo()
}

onMounted(() => {
  updateScreenInfo()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.responsive-debugger {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
  min-width: 200px;
  backdrop-filter: blur(10px);
  
  .debug-info {
    margin-bottom: 12px;
  }
  
  .debug-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .debug-label {
      color: #ccc;
    }
    
    .debug-value {
      font-weight: 600;
      
      &.xxxl { color: #ff6b6b; }
      &.xxl { color: #4ecdc4; }
      &.xl { color: #45b7d1; }
      &.lg { color: #96ceb4; }
      &.md { color: #feca57; }
      &.sm { color: #ff9ff3; }
      &.xs { color: #54a0ff; }
      &.xxs { color: #5f27cd; }
    }
  }
  
  .debug-actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      font-size: 11px;
      padding: 4px 8px;
    }
  }
}

.debug-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  
  .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

// 响应式调试器自身也要适配
@media (max-width: 480px) {
  .responsive-debugger {
    top: 10px;
    right: 10px;
    padding: 12px;
    min-width: 160px;
    font-size: 11px;
    
    .debug-actions {
      flex-direction: column;
      gap: 4px;
    }
  }
  
  .debug-toggle {
    top: 10px;
    right: 10px;
    
    .el-button {
      font-size: 11px;
      padding: 4px 8px;
    }
  }
}
</style>












