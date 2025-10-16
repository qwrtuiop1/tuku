<template>
  <div class="maintenance-page">
    <div class="maintenance-container">
      <div class="maintenance-icon">
        <el-icon size="80" color="#409eff">
          <Tools />
        </el-icon>
      </div>
      
      <h1 class="maintenance-title">系统维护中</h1>
      
      <p class="maintenance-description">
        系统正在进行维护升级，暂时无法提供服务
      </p>
      
      <div class="maintenance-info">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>维护信息</span>
            </div>
          </template>
          
          <div class="info-content">
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>预计维护时间：{{ maintenanceTime }}</span>
            </div>
            
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>维护说明：{{ maintenanceMessage }}</span>
            </div>
            
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>如有紧急事务，请联系管理员</span>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="maintenance-actions">
        <el-button type="primary" @click="refreshPage" :loading="refreshing">
          <el-icon><Refresh /></el-icon>
          刷新页面
        </el-button>
        
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
      
      <div class="maintenance-footer">
        <p>感谢您的耐心等待</p>
        <p class="copyright">{{ systemName }} © {{ currentYear }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Tools, InfoFilled, Clock, Message, Phone, Refresh, Back } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const refreshing = ref(false)
const maintenanceTime = ref('2-4小时')
const maintenanceMessage = ref('系统升级优化，提升用户体验')
const systemName = ref('图库系统')
const currentYear = new Date().getFullYear()

// 刷新页面
const refreshPage = async () => {
  refreshing.value = true
  try {
    // 等待1秒后刷新
    await new Promise(resolve => setTimeout(resolve, 1000))
    window.location.reload()
  } catch (error) {
    ElMessage.error('刷新失败')
    refreshing.value = false
  }
}

// 返回上页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 获取维护信息
const fetchMaintenanceInfo = async () => {
  try {
    // 这里可以从API获取维护信息
    // const response = await api.get('/maintenance/info')
    // maintenanceTime.value = response.data.time
    // maintenanceMessage.value = response.data.message
  } catch (error) {
    console.error('获取维护信息失败:', error)
  }
}

onMounted(() => {
  fetchMaintenanceInfo()
})
</script>

<style scoped lang="scss">
.maintenance-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.maintenance-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.maintenance-icon {
  margin-bottom: 30px;
  
  .el-icon {
    animation: pulse 2s infinite;
  }
}

.maintenance-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.maintenance-description {
  font-size: 1.2rem;
  color: #606266;
  margin-bottom: 40px;
  line-height: 1.6;
}

.maintenance-info {
  margin-bottom: 40px;
  
  .info-card {
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #409eff;
      
      .el-icon {
        font-size: 18px;
      }
    }
    
    .info-content {
      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .el-icon {
          color: #409eff;
          font-size: 16px;
        }
        
        span {
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
}

.maintenance-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
  
  .el-button {
    height: 45px;
    padding: 0 30px;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #409eff, #337ecc);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #337ecc, #2b6cb0);
      }
    }
  }
}

.maintenance-footer {
  p {
    margin: 5px 0;
    color: #909399;
    font-size: 14px;
  }
  
  .copyright {
    font-size: 12px;
    opacity: 0.8;
  }
}

// 动画
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .maintenance-container {
    padding: 30px 20px;
  }
  
  .maintenance-title {
    font-size: 2rem;
  }
  
  .maintenance-description {
    font-size: 1rem;
  }
  
  .maintenance-actions {
    flex-direction: column;
    align-items: center;
    
    .el-button {
      width: 200px;
    }
  }
}
</style>





