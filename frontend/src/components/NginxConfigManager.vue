<template>
  <div class="nginx-config-manager">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>Nginx配置管理</span>
          <el-tag :type="configStatus?.needsUpdate ? 'warning' : 'success'">
            {{ configStatus?.needsUpdate ? '需要更新' : '配置同步' }}
          </el-tag>
        </div>
      </template>

      <div class="config-content">
        <!-- 配置状态 -->
        <div class="status-section">
          <h4>当前配置状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="数据库设置">
              {{ configStatus?.databaseLimit || 0 }}GB
            </el-descriptions-item>
            <el-descriptions-item label="Nginx限制">
              {{ configStatus?.nginxLimit || 0 }}GB
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="configStatus?.needsUpdate ? 'warning' : 'success'">
                {{ configStatus?.needsUpdate ? '不同步' : '已同步' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后检查">
              {{ formatTime(configStatus?.lastChecked) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 建议配置 -->
        <div class="suggest-section" v-if="suggestConfig">
          <h4>配置建议</h4>
          <el-alert
            :title="suggestConfig.explanation"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button 
            type="primary" 
            @click="refreshStatus"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
            刷新状态
          </el-button>
          
          <el-button 
            type="success" 
            @click="updateConfig"
            :loading="updating"
            :disabled="!configStatus?.needsUpdate"
          >
            <el-icon><Upload /></el-icon>
            更新配置
          </el-button>
          
          <el-button 
            type="warning" 
            @click="forceUpdateConfig"
            :loading="forceUpdating"
          >
            <el-icon><Setting /></el-icon>
            强制更新
          </el-button>
          
          <el-button 
            type="info" 
            @click="testConfig"
            :loading="testing"
          >
            <el-icon><Check /></el-icon>
            测试配置
          </el-button>
        </div>

        <!-- 自动更新设置 -->
        <div class="auto-update-section">
          <h4>自动更新设置</h4>
          <el-switch
            v-model="autoUpdateEnabled"
            active-text="启用自动更新"
            inactive-text="禁用自动更新"
            @change="toggleAutoUpdate"
          />
          <p class="help-text">
            启用后，系统将每5分钟自动检查配置变化并更新Nginx配置
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Upload, Setting, Check } from '@element-plus/icons-vue'
import api from '@/utils/api'

// 响应式数据
const configStatus = ref(null)
const suggestConfig = ref(null)
const loading = ref(false)
const updating = ref(false)
const forceUpdating = ref(false)
const testing = ref(false)
const autoUpdateEnabled = ref(true)

// 获取配置状态
const refreshStatus = async () => {
  loading.value = true
  try {
    const response = await api.get('/nginx-config/status')
    configStatus.value = response.data.data
    
    // 获取建议配置
    const suggestResponse = await api.get('/nginx-config/suggest')
    suggestConfig.value = suggestResponse.data.data
  } catch (error) {
    console.error('获取配置状态失败:', error)
    ElMessage.error('获取配置状态失败')
  } finally {
    loading.value = false
  }
}

// 更新配置
const updateConfig = async () => {
  updating.value = true
  try {
    const response = await api.post('/nginx-config/update')
    ElMessage.success(response.data.message)
    await refreshStatus()
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error('更新配置失败')
  } finally {
    updating.value = false
  }
}

// 强制更新配置
const forceUpdateConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '强制更新将立即应用新的Nginx配置，是否继续？',
      '确认强制更新',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    forceUpdating.value = true
    const response = await api.post('/nginx-config/force-update')
    ElMessage.success(response.data.message)
    await refreshStatus()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('强制更新配置失败:', error)
      ElMessage.error('强制更新配置失败')
    }
  } finally {
    forceUpdating.value = false
  }
}

// 测试配置
const testConfig = async () => {
  testing.value = true
  try {
    const response = await api.post('/nginx-config/test')
    ElMessage.success(response.data.message)
  } catch (error) {
    console.error('测试配置失败:', error)
    ElMessage.error('测试配置失败')
  } finally {
    testing.value = false
  }
}

// 切换自动更新
const toggleAutoUpdate = async () => {
  try {
    // 这里可以添加API调用来控制自动更新
    ElMessage.success(`自动更新已${autoUpdateEnabled.value ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('切换自动更新失败:', error)
    ElMessage.error('切换自动更新失败')
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return '未知'
  return new Date(timeStr).toLocaleString()
}

// 组件挂载时获取状态
onMounted(() => {
  refreshStatus()
})
</script>

<style scoped>
.nginx-config-manager {
  max-width: 800px;
  margin: 0 auto;
}

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-content {
  padding: 20px 0;
}

.status-section,
.suggest-section,
.action-section,
.auto-update-section {
  margin-bottom: 30px;
}

.status-section h4,
.suggest-section h4,
.auto-update-section h4 {
  margin-bottom: 15px;
  color: #303133;
}

.action-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.auto-update-section {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.help-text {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .action-section {
    flex-direction: column;
  }
  
  .action-section .el-button {
    width: 100%;
  }
}
</style>
