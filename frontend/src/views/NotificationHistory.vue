<template>
  <div class="notification-history-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">通知管理</h1>
          <p class="page-subtitle">查看和管理系统通知记录</p>
        </div>
        <div class="header-actions">
          <!-- 桌面端按钮组（平板及以下用下拉菜单，避免顶栏挤爆） -->
          <div class="desktop-actions" v-show="!isNarrowLayout">
            <el-button type="primary" @click="showCreateNotificationDialog">
              <el-icon><Plus /></el-icon>
              编辑通知
            </el-button>
            <el-button @click="refreshNotifications" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button @click="markAllAsRead" :disabled="!hasUnreadNotifications">
              <el-icon><Check /></el-icon>
              全部标记为已读
            </el-button>
            <el-button @click="cleanExpiredNotifications" type="danger">
              <el-icon><Delete /></el-icon>
              清理过期通知
            </el-button>
          </div>
          
          <!-- 平板/移动端下拉菜单 -->
          <div class="mobile-actions" v-show="isNarrowLayout">
            <el-dropdown @command="handleMobileAction" placement="bottom-end">
              <el-button type="primary" size="small">
                <el-icon><MoreFilled /></el-icon>
                操作
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="create">
                    <el-icon><Plus /></el-icon>
                    编辑通知
                  </el-dropdown-item>
                  <el-dropdown-item command="refresh">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-dropdown-item>
                  <el-dropdown-item command="markAll" :disabled="!hasUnreadNotifications">
                    <el-icon><Check /></el-icon>
                    全部标记为已读
                  </el-dropdown-item>
                  <el-dropdown-item command="clean" divided>
                    <el-icon><Delete /></el-icon>
                    清理过期通知
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <!-- 桌面端筛选布局 -->
        <div class="desktop-filter">
          <div class="filter-content">
            <div class="filter-left">
              <el-select v-model="filters.type" placeholder="通知类型" clearable @change="handleFilterChange">
                <el-option label="全部" value="" />
                <el-option label="登录通知" value="login" />
                <el-option label="文件上传通知" value="upload" />
                <el-option label="存储空间警告" value="storage_warning" />
                <el-option label="安全提醒" value="security_alert" />
                <el-option label="系统维护通知" value="maintenance" />
                <el-option label="邮件通知" value="email" />
                <el-option label="系统通知" value="system" />
              </el-select>
              
              <el-select v-model="filters.status" placeholder="状态" clearable @change="handleFilterChange">
                <el-option label="全部" value="" />
                <el-option label="未读" value="unread" />
                <el-option label="已读" value="read" />
              </el-select>
              
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleFilterChange"
              />
            </div>
            
            <div class="filter-right">
              <el-input
                v-model="filters.keyword"
                placeholder="搜索通知内容"
                clearable
                @input="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        
        <!-- 移动端筛选布局 -->
        <div class="mobile-filter">
          <div class="mobile-filter-row">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索通知内容"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="mobile-filter-row">
            <el-select v-model="filters.type" placeholder="通知类型" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="登录通知" value="login" />
              <el-option label="文件上传通知" value="upload" />
              <el-option label="存储空间警告" value="storage_warning" />
              <el-option label="安全提醒" value="security_alert" />
              <el-option label="系统维护通知" value="maintenance" />
              <el-option label="邮件通知" value="email" />
              <el-option label="系统通知" value="system" />
            </el-select>
            
            <el-select v-model="filters.status" placeholder="状态" clearable @change="handleFilterChange">
              <el-option label="全部" value="" />
              <el-option label="未读" value="unread" />
              <el-option label="已读" value="read" />
            </el-select>
          </div>
          
          <div class="mobile-filter-row">
            <el-date-picker
              v-model="filters.startDate"
              type="date"
              placeholder="开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
              style="width: 100%"
            />
          </div>
          
          <div class="mobile-filter-row">
            <el-date-picker
              v-model="filters.endDate"
              type="date"
              placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
              style="width: 100%"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-section">
      <el-card class="notifications-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="card-title">通知列表</span>
            </div>
            <div class="header-stats">
              <el-tag type="info" size="small">总计: {{ totalCount }}</el-tag>
              <el-tag type="warning" size="small" v-if="unreadCount > 0">未读: {{ unreadCount }}</el-tag>
            </div>
          </div>
        </template>

        <div class="notifications-list" v-loading="loading">
          <div v-if="notifications.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无通知记录" />
          </div>
          
          <div v-else class="notification-items">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="['notification-item', { 'unread': !notification.is_read }]"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                <el-icon :class="getNotificationIcon(notification.notification_type)">
                  <component :is="getNotificationIconComponent(notification.notification_type)" />
                </el-icon>
              </div>
              
              <div class="notification-content">
                <div class="notification-header">
                  <h4 class="notification-title">{{ notification.title }}</h4>
                  <div class="notification-meta">
                    <el-tag :type="getNotificationTypeTag(notification.notification_type)" size="small">
                      {{ getNotificationTypeName(notification.notification_type) }}
                    </el-tag>
                    <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                  </div>
                </div>
                
                <div class="notification-body">
                  <p class="notification-text">{{ notification.content }}</p>
                </div>
                
                <div class="notification-footer">
                  <div class="notification-user">
                    <el-icon><User /></el-icon>
                    <span>{{ notification.username }}</span>
                  </div>
                  
                  <div class="notification-status">
                    <el-tag v-if="!notification.is_read" type="warning" size="small">未读</el-tag>
                    <el-tag v-else type="success" size="small">已读</el-tag>
                    <span v-if="notification.read_at" class="read-time">
                      阅读时间: {{ formatTime(notification.read_at) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="notification-actions">
                <el-button
                  type="text"
                  size="small"
                  @click.stop="showEditNotificationDialog(notification)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="!notification.is_read"
                  type="primary"
                  size="small"
                  @click.stop="markAsRead(notification.id)"
                >
                  标记已读
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteNotification(notification.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-section" v-if="totalCount > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知编辑对话框 -->
    <el-dialog
      v-model="notificationDialogVisible"
      :title="isEditing ? '编辑通知' : '创建通知'"
      :width="dialogWidth"
      :close-on-click-modal="false"
      class="notification-dialog"
      :append-to-body="true"
    >
      <el-form
        ref="notificationFormRef"
        :model="notificationForm"
        :rules="notificationRules"
        label-width="100px"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="notificationForm.title"
            placeholder="请输入通知标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="notificationForm.type" placeholder="请选择通知类型">
            <el-option label="系统通知" value="system" />
            <el-option label="维护通知" value="maintenance" />
            <el-option label="安全提醒" value="security_alert" />
            <el-option label="存储警告" value="storage_warning" />
            <el-option label="邮件通知" value="email" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="notificationForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>

        <el-form-item label="发送时间" prop="sendAt">
          <el-date-picker
            v-model="notificationForm.sendAt"
            type="datetime"
            placeholder="选择发送时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="删除时间" prop="deleteAt">
          <el-date-picker
            v-model="notificationForm.deleteAt"
            type="datetime"
            placeholder="选择删除时间（可选）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="发送范围">
          <el-radio-group v-model="notificationForm.target">
            <el-radio label="all">所有用户</el-radio>
            <el-radio label="admin">仅管理员</el-radio>
            <el-radio label="user">仅普通用户</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-button-group">
            <div class="dialog-button-item">
              <el-button @click="notificationDialogVisible = false">取消</el-button>
            </div>
            <div class="dialog-button-item">
              <el-button type="primary" @click="saveNotification" :loading="saving">
                {{ isEditing ? '更新' : '创建' }}
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      :width="dialogWidth"
      :close-on-click-modal="false"
      class="notification-detail-dialog"
      :append-to-body="true"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-header">
          <h3>{{ selectedNotification.title }}</h3>
          <div class="detail-meta">
            <el-tag :type="getNotificationTypeTag(selectedNotification.notification_type)">
              {{ getNotificationTypeName(selectedNotification.notification_type) }}
            </el-tag>
            <span class="detail-time">{{ formatTime(selectedNotification.created_at) }}</span>
          </div>
        </div>
        
        <div class="detail-content">
          <p>{{ selectedNotification.content }}</p>
        </div>
        
        <div class="detail-footer">
          <div class="detail-user">
            <el-icon><User /></el-icon>
            <span>用户: {{ selectedNotification.username }}</span>
          </div>
          <div class="detail-status">
            <el-tag v-if="!selectedNotification.is_read" type="warning">未读</el-tag>
            <el-tag v-else type="success">已读</el-tag>
            <span v-if="selectedNotification.read_at" class="read-time">
              阅读时间: {{ formatTime(selectedNotification.read_at) }}
            </span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-button-group">
            <el-button @click="detailDialogVisible = false" size="default">
              关闭
            </el-button>
            <el-button
              v-if="selectedNotification && !selectedNotification.is_read"
              type="primary"
              @click="markAsRead(selectedNotification.id)"
              size="default"
            >
              标记已读
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Check,
  Delete,
  Search,
  User,
  Bell,
  Message,
  Warning,
  InfoFilled,
  Success,
  Lock,
  Upload,
  Tools,
  Plus,
  MoreFilled
} from '@element-plus/icons-vue'
import api from '@/utils/api'

// 响应式数据
const loading = ref(false)
const saving = ref(false)

// 响应式断点：<768 手机；<1024 平板（与筛选区、顶栏操作一致）
const isMobile = ref(false)
const isNarrowLayout = ref(false)

const dialogWidth = computed(() => {
  if (isMobile.value) return '95%'
  if (isNarrowLayout.value) return '92%'
  return '600px'
})

const checkScreenSize = () => {
  const w = window.innerWidth
  isMobile.value = w < 768
  isNarrowLayout.value = w < 1024
}

// 移动端操作处理
const handleMobileAction = (command: string) => {
  switch (command) {
    case 'create':
      showCreateNotificationDialog()
      break
    case 'refresh':
      refreshNotifications()
      break
    case 'markAll':
      markAllAsRead()
      break
    case 'clean':
      cleanExpiredNotifications()
      break
  }
}
const notifications = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const detailDialogVisible = ref(false)
const selectedNotification = ref(null)

// 通知编辑相关
const notificationDialogVisible = ref(false)
const isEditing = ref(false)
const notificationFormRef = ref()
const notificationForm = reactive({
  id: null,
  title: '',
  content: '',
  type: 'system',
  priority: 'normal',
  sendAt: '',
  deleteAt: '',
  target: 'all'
})

const notificationRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在1到100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 1, max: 500, message: '内容长度在1到500个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  sendAt: [
    { required: true, message: '请选择发送时间', trigger: 'change' }
  ]
}

// 筛选条件
const filters = reactive({
  type: '',
  status: '',
  dateRange: null, // 桌面端仍使用范围
  startDate: '',   // 移动端开始日期
  endDate: '',     // 移动端结束日期
  keyword: ''
})

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const hasUnreadNotifications = computed(() => {
  return unreadCount.value > 0
})

// 方法
const fetchNotifications = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    }
    
  if (filters.type) params.type = filters.type
  if (filters.status) params.status = filters.status
  if (filters.keyword) params.keyword = filters.keyword
  // 桌面端范围优先
  if (filters.dateRange && Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  } else {
    // 其次使用移动端的单独开始/结束日期
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
  }
    
    const response = await api.get('/admin/notifications', { params })
    notifications.value = response.data.notifications
    totalCount.value = response.data.total
  } catch (error) {
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const refreshNotifications = () => {
  fetchNotifications()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchNotifications()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchNotifications()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchNotifications()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchNotifications()
}

const handleNotificationClick = (notification: any) => {
  selectedNotification.value = notification
  detailDialogVisible.value = true
  
  // 如果未读，自动标记为已读
  if (!notification.is_read) {
    markAsRead(notification.id)
  }
}

const markAsRead = async (notificationId: number) => {
  try {
    await api.put(`/auth/notifications/${notificationId}/read`)
    
    // 更新本地状态
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.is_read = true
      notification.read_at = new Date().toISOString()
    }
    
    ElMessage.success('通知已标记为已读')
  } catch (error) {
    ElMessage.error('标记通知为已读失败')
  }
}

const markAllAsRead = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将所有未读通知标记为已读吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量标记为已读
    const unreadNotifications = notifications.value.filter(n => !n.is_read)
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
    
    ElMessage.success('所有通知已标记为已读')
  } catch (error) {
    // 用户取消操作
  }
}

const deleteNotification = async (notificationId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await api.delete(`/admin/notifications/${notificationId}`)
    
    // 从列表中移除
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
      totalCount.value--
    }
    
    ElMessage.success('通知已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除通知失败')
    }
  }
}

const cleanExpiredNotifications = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理过期通知吗？此操作将删除超过保留期限的通知记录。',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await api.delete('/admin/notifications/cleanup')
    
    ElMessage.success(response.data.message)
    fetchNotifications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理过期通知失败')
    }
  }
}

// 工具方法
const getNotificationIcon = (type: string) => {
  const iconMap = {
    login: 'login-icon',
    upload: 'upload-icon',
    storage_warning: 'warning-icon',
    security_alert: 'security-icon',
    maintenance: 'maintenance-icon',
    email: 'email-icon',
    system: 'system-icon'
  }
  return iconMap[type] || 'default-icon'
}

const getNotificationIconComponent = (type: string) => {
  const iconMap = {
    login: User,
    upload: Upload,
    storage_warning: Warning,
    security_alert: Lock,
    maintenance: Tools,
    email: Message,
    system: Bell
  }
  return iconMap[type] || InfoFilled
}

const getNotificationTypeName = (type: string) => {
  const nameMap = {
    login: '登录通知',
    upload: '文件上传通知',
    storage_warning: '存储空间警告',
    security_alert: '安全提醒',
    maintenance: '系统维护通知',
    email: '邮件通知',
    system: '系统通知'
  }
  return nameMap[type] || '未知类型'
}

const getNotificationTypeTag = (type: string) => {
  const tagMap = {
    login: 'primary',
    upload: 'success',
    storage_warning: 'warning',
    security_alert: 'danger',
    maintenance: 'info',
    email: 'primary',
    system: 'info'
  }
  return tagMap[type] || 'info'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 通知编辑相关方法
const showCreateNotificationDialog = () => {
  isEditing.value = false
  resetNotificationForm()
  notificationDialogVisible.value = true
}

const showEditNotificationDialog = (notification: any) => {
  isEditing.value = true
  notificationForm.id = notification.id
  notificationForm.title = notification.title
  notificationForm.content = notification.content
  notificationForm.type = notification.notification_type
  notificationForm.priority = notification.priority || 'normal'
  notificationForm.sendAt = notification.send_at
  notificationForm.deleteAt = notification.delete_at
  notificationForm.target = notification.target || 'all'
  notificationDialogVisible.value = true
}

const resetNotificationForm = () => {
  notificationForm.id = null
  notificationForm.title = ''
  notificationForm.content = ''
  notificationForm.type = 'system'
  notificationForm.priority = 'normal'
  notificationForm.sendAt = ''
  notificationForm.deleteAt = ''
  notificationForm.target = 'all'
}

const saveNotification = async () => {
  if (!notificationFormRef.value) return
  
  try {
    await notificationFormRef.value.validate()
    saving.value = true
    
    const data = {
      title: notificationForm.title,
      content: notificationForm.content,
      notification_type: notificationForm.type,
      priority: notificationForm.priority,
      send_at: notificationForm.sendAt,
      delete_at: notificationForm.deleteAt || null,
      target: notificationForm.target
    }
    
    if (isEditing.value) {
      await api.put(`/admin/notifications/${notificationForm.id}`, data)
      ElMessage.success('通知更新成功')
    } else {
      await api.post('/admin/notifications', data)
      ElMessage.success('通知创建成功')
    }
    
    notificationDialogVisible.value = false
    fetchNotifications()
  } catch (error) {
    ElMessage.error(isEditing.value ? '更新通知失败' : '创建通知失败')
  } finally {
    saving.value = false
  }
}

// 生命周期
onMounted(() => {
  checkScreenSize()
  fetchNotifications()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped lang="scss">
// 全局Element Plus组件样式覆盖 - 确保所有组件使用灰白黑三色
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
  border: none !important;
  color: white !important;
  
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
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #6b7280 0%, #374151 100%) !important;
  border: none !important;
  color: white !important;
  
  &:hover {
    background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
  }
}

:deep(.el-button--text) {
  color: #374151 !important;
  
  &:hover {
    color: #111827 !important;
    background-color: #f3f4f6 !important;
  }
}

:deep(.el-tag--info) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

:deep(.el-tag--warning) {
  background-color: #e5e7eb !important;
  color: #111827 !important;
  border-color: #9ca3af !important;
}

:deep(.el-tag--success) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

:deep(.el-tag--danger) {
  background-color: #d1d5db !important;
  color: #111827 !important;
  border-color: #6b7280 !important;
}

:deep(.el-input__wrapper) {
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  
  &:hover {
    border-color: #9ca3af !important;
  }
  
  &.is-focus {
    border-color: #374151 !important;
    box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1) !important;
  }
}

:deep(.el-select__wrapper) {
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  
  &:hover {
    border-color: #9ca3af !important;
  }
  
  &.is-focus {
    border-color: #374151 !important;
    box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1) !important;
  }
}

:deep(.el-date-editor) {
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  
  &:hover {
    border-color: #9ca3af !important;
  }
  
  &.is-focus {
    border-color: #374151 !important;
    box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1) !important;
  }
}

:deep(.el-radio-group) {
  .el-radio {
    color: #374151 !important;
    
    .el-radio__input {
      .el-radio__inner {
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
        
        &:hover {
          border-color: #9ca3af !important;
        }
      }
      
      &.is-checked .el-radio__inner {
        background-color: #374151 !important;
        border-color: #374151 !important;
        
        &::after {
          background-color: #ffffff !important;
        }
      }
    }
    
    .el-radio__label {
      color: #374151 !important;
    }
    
    &:hover .el-radio__label {
      color: #111827 !important;
    }
  }
}

:deep(.el-textarea__inner) {
  background-color: #ffffff !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  
  &:hover {
    border-color: #9ca3af !important;
  }
  
  &:focus {
    border-color: #374151 !important;
    box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.1) !important;
  }
  
  &::placeholder {
    color: #9ca3af !important;
  }
}

:deep(.el-input__count) {
  color: #6b7280 !important;
  background-color: #f9fafb !important;
}

:deep(.el-form-item__label) {
  color: #374151 !important;
  font-weight: 500 !important;
}

:deep(.el-form-item.is-required .el-form-item__label::before) {
  color: #6b7280 !important;
}

:deep(.el-select-dropdown) {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}

:deep(.el-select-dropdown__item) {
  color: #374151 !important;
  background-color: #ffffff !important;
  
  &:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
  }
  
  &.is-selected {
    background-color: #e5e7eb !important;
    color: #111827 !important;
    font-weight: 500 !important;
  }
  
  &.is-disabled {
    color: #9ca3af !important;
    background-color: #f9fafb !important;
  }
}

:deep(.el-select-dropdown__empty) {
  color: #6b7280 !important;
  background-color: #f9fafb !important;
}

:deep(.el-select-dropdown__loading) {
  color: #6b7280 !important;
  background-color: #f9fafb !important;
}

:deep(.el-picker-panel) {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}

:deep(.el-picker-panel__body) {
  background-color: #ffffff !important;
}

:deep(.el-date-table td) {
  color: #374151 !important;
  
  &:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
  }
  
  &.is-selected {
    background-color: #374151 !important;
    color: #ffffff !important;
  }
  
  &.is-today {
    color: #111827 !important;
    font-weight: 600 !important;
  }
  
  &.is-disabled {
    color: #9ca3af !important;
    background-color: #f9fafb !important;
  }
}

:deep(.el-time-panel) {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
}

:deep(.el-time-spinner__item) {
  color: #374151 !important;
  
  &:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
  }
  
  &.is-active {
    background-color: #374151 !important;
    color: #ffffff !important;
  }
  
  &.is-disabled {
    color: #9ca3af !important;
    background-color: #f9fafb !important;
  }
}

.notification-history-page {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 16px;
  }
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 8px 0;
      }
      
      .page-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;

      .desktop-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: flex-end;
      }

      .mobile-actions {
        margin-left: auto;
      }
    }
  }

  // 平板/手机：顶栏纵向排列（操作区由 v-show 切换桌面按钮 / 下拉）
  @media (max-width: 1023px) {
    margin-bottom: 16px;

    .header-content {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    .header-left {
      .page-title {
        font-size: 24px;
      }

      .page-subtitle {
        font-size: 13px;
      }
    }
  }
}

.filter-section {
  margin-bottom: 24px;
  
  .filter-card {
    .desktop-filter {
      .filter-content {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 12px 16px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;

        .filter-left {
          display: flex;
          flex: 1 1 auto;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          min-width: 0;

          :deep(.el-select) {
            width: 160px;
            max-width: 100%;
          }

          :deep(.el-date-editor) {
            flex: 1 1 260px;
            min-width: 0;
            max-width: 100%;
          }
        }

        .filter-right {
          flex: 1 1 220px;
          min-width: 0;
          max-width: 100%;

          .search-input {
            width: 100%;
            max-width: 100%;
          }
        }
      }
    }
    
    .mobile-filter {
      display: none;
      
      .mobile-filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-select {
          flex: 1 1 160px;
          min-width: 0;
        }

        .el-input {
          width: 100%;
          min-width: 0;
        }
      }
    }
  }

  // 平板及以下：使用纵向筛选，避免一行挤爆
  @media (max-width: 1023px) {
    margin-bottom: 16px;

    .filter-card {
      overflow: hidden;

      .desktop-filter {
        display: none;
      }

      .mobile-filter {
        display: block;
      }
    }
  }
}

.notifications-section {
  .notifications-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
      }
      
      .header-stats {
        display: flex;
        gap: 8px;
      }
    }
    
    // 移动端适配
    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .header-stats {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
    
    .notifications-list {
      .empty-state {
        padding: 40px 0;
        text-align: center;
      }
      
      .notification-items {
        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 12px;
          background: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          
          // 移动端适配
          @media (max-width: 768px) {
            padding: 12px;
            margin-bottom: 8px;
          }
          
          &:hover {
            border-color: #374151;
            box-shadow: 0 2px 8px rgba(55, 65, 81, 0.1);
          }
          
          &.unread {
            border-left: 4px solid #374151;
            background: #f9fafb;
          }
          
          .notification-icon {
            margin-right: 16px;
            margin-top: 4px;
            
            .el-icon {
              font-size: 20px;
              color: #374151;
            }
            
            // 移动端适配
            @media (max-width: 768px) {
              margin-right: 12px;
              
              .el-icon {
                font-size: 18px;
              }
            }
          }
          
          .notification-content {
            flex: 1;
            
            .notification-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
              
              .notification-title {
                font-size: 16px;
                font-weight: 500;
                color: #111827;
                margin: 0;
                
                // 移动端适配
                @media (max-width: 768px) {
                  font-size: 15px;
                }
              }
              
              .notification-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .notification-time {
                  font-size: 12px;
                  color: #6b7280;
                }
              }
            }
            
            .notification-body {
              margin-bottom: 12px;
              
              .notification-text {
                font-size: 14px;
                color: #374151;
                line-height: 1.5;
                margin: 0;
              }
            }
            
            .notification-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              
              // 移动端适配
              @media (max-width: 768px) {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
              }
              
              .notification-user {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #6b7280;
              }
              
              .notification-status {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .read-time {
                  font-size: 12px;
                  color: #6b7280;
                }
              }
            }
          }
          
          .notification-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-left: 16px;
          }
        }
      }
    }
    
    .pagination-section {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }
}

// 通知详情对话框样式
.notification-detail-dialog {
  .el-dialog {
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    margin: 0 auto;
    max-height: 90vh;
    overflow: hidden;
    
    .el-dialog__header {
      background: linear-gradient(135deg, #374151 0%, #111827 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      padding: 20px 24px;
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: white;
      }
      
      .el-dialog__headerbtn {
        .el-dialog__close {
          color: white;
          font-size: 18px;
          
          &:hover {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 24px;
      background: #f9fafb;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }
    
    .el-dialog__footer {
      background: white;
      border-radius: 0 0 12px 12px;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }
  }
  
  // 移动端适配
  @media (max-width: 768px) {
    .el-dialog {
      margin: 5vh auto;
      max-height: 90vh;
      width: 95% !important;
      
      .el-dialog__header {
        padding: 16px 20px;
        
        .el-dialog__title {
          font-size: 16px;
        }
        
        .el-dialog__headerbtn {
          .el-dialog__close {
            font-size: 16px;
          }
        }
      }
      
      .el-dialog__body {
        padding: 16px;
        max-height: calc(90vh - 120px);
      }
      
      .el-dialog__footer {
        padding: 12px 16px;
      }
    }
  }
  
  // 小屏幕适配
  @media (max-width: 480px) {
    .el-dialog {
      margin: 2vh auto;
      width: 98% !important;
      max-height: 96vh;
      
      .el-dialog__header {
        padding: 12px 16px;
        
        .el-dialog__title {
          font-size: 15px;
        }
      }
      
      .el-dialog__body {
        padding: 12px;
        max-height: calc(96vh - 100px);
      }
      
      .el-dialog__footer {
        padding: 10px 12px;
      }
    }
  }
}

.notification-detail {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .detail-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
    
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 16px 0;
      line-height: 1.3;
      background: linear-gradient(135deg, #111827 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .detail-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      
      .detail-time {
        font-size: 14px;
        color: #6b7280;
        background: #f3f4f6;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 500;
      }
    }
  }
  
  .detail-content {
    margin-bottom: 24px;
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #374151;
    
    p {
      font-size: 15px;
      color: #374151;
      line-height: 1.7;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
  
  .detail-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    margin: -20px -20px -20px -20px;
    padding: 20px;
    border-radius: 0 0 8px 8px;
    
    .detail-user {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;
      background: white;
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .el-icon {
        color: #374151;
        font-size: 16px;
      }
    }
    
    .detail-status {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .read-time {
        font-size: 13px;
        color: #374151;
        background: rgba(55, 65, 81, 0.1);
        padding: 6px 10px;
        border-radius: 6px;
        font-weight: 500;
      }
    }
  }
  
  // 移动端适配
  @media (max-width: 768px) {
    padding: 16px;
    
    .detail-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      
      h3 {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .detail-meta {
        gap: 8px;
        
        .detail-time {
          font-size: 13px;
          padding: 5px 10px;
        }
      }
    }
    
    .detail-content {
      margin-bottom: 20px;
      padding: 12px;
      
      p {
        font-size: 14px;
        line-height: 1.6;
      }
    }
    
    .detail-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin: -16px -16px -16px -16px;
      padding: 16px;
      
      .detail-user {
        font-size: 13px;
        padding: 6px 10px;
        
        .el-icon {
          font-size: 14px;
        }
      }
      
      .detail-status {
        align-self: flex-end;
        
        .read-time {
          font-size: 12px;
          padding: 5px 8px;
        }
      }
    }
  }
  
  // 小屏幕适配
  @media (max-width: 480px) {
    padding: 12px;
    
    .detail-header {
      margin-bottom: 12px;
      padding-bottom: 10px;
      
      h3 {
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      .detail-meta {
        gap: 6px;
        
        .detail-time {
          font-size: 12px;
          padding: 4px 8px;
        }
      }
    }
    
    .detail-content {
      margin-bottom: 16px;
      padding: 10px;
      
      p {
        font-size: 13px;
        line-height: 1.5;
      }
    }
    
    .detail-footer {
      margin: -12px -12px -12px -12px;
      padding: 12px;
      gap: 10px;
      
      .detail-user {
        font-size: 12px;
        padding: 5px 8px;
        
        .el-icon {
          font-size: 13px;
        }
      }
      
      .detail-status {
        .read-time {
          font-size: 11px;
          padding: 4px 6px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  
  .dialog-button-group {
    display: flex;
    gap: 12px;
    align-items: center;
    
    .dialog-button-item {
      .el-button {
        min-width: 80px;
        font-weight: 500;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
    
    // 移动端适配
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
      width: 100%;
      
      .dialog-button-item {
        width: 100%;
        
        .el-button {
          width: 100%;
          min-width: auto;
          padding: 12px 20px;
          font-size: 14px;
        }
      }
    }
    
    // 小屏幕适配
    @media (max-width: 480px) {
      gap: 8px;
      
      .dialog-button-item {
        .el-button {
          padding: 10px 16px;
          font-size: 13px;
        }
      }
    }
  }
}

// 通知对话框响应式样式
.notification-dialog {
  .el-dialog__body {
    // 移动端适配
    @media (max-width: 768px) {
      padding: 16px;
    }
  }
  
  .el-form {
    // 移动端适配
    @media (max-width: 768px) {
      .el-form-item {
        margin-bottom: 16px;
        
        .el-form-item__label {
          font-size: 14px;
        }
      }
    }
  }
}

// 日期时间选择器移动端优化
:deep(.el-picker-panel) {
  // 移动端适配
  @media (max-width: 768px) {
    width: 100% !important;
    max-width: 100vw;
    margin: 0;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    box-sizing: border-box;
    overflow-x: hidden;
    
    .el-picker-panel__body-wrapper {
      max-height: 70vh;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      box-sizing: border-box;
    }
    
    .el-picker-panel__body {
      padding: 8px 8px 8px 16px;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
    }
    
    // 时间选择器优化
    .el-time-panel {
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
      
      .el-time-panel__content {
        display: flex;
        justify-content: space-between;
        padding: 0 4px 0 12px;
        box-sizing: border-box;
        
        .el-time-spinner {
          flex: 1;
          min-width: 0;
          margin: 0 1px;
          max-width: calc(33.333% - 2px);
          box-sizing: border-box;
          
          .el-scrollbar {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            
            .el-scrollbar__wrap {
              max-height: 180px;
              width: 100%;
              box-sizing: border-box;
            }
            
            .el-scrollbar__view {
              max-height: 180px;
              width: 100%;
              box-sizing: border-box;
              
              .el-time-spinner__list {
                padding: 0;
                width: 100%;
                box-sizing: border-box;
                
                .el-time-spinner__item {
                  padding: 6px 2px;
                  font-size: 13px;
                  text-align: center;
                  min-height: 30px;
                  line-height: 18px;
                  width: 100%;
                  box-sizing: border-box;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }
      
      .el-time-panel__footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 4px 8px 16px;
        box-sizing: border-box;
        
        .el-time-panel__btn {
          flex: 1;
          margin: 0 4px;
          padding: 8px 12px;
          font-size: 14px;
          min-height: 36px;
        }
      }
    }
    
    // 日期选择器优化
    .el-date-picker__time-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      padding-left: 8px;
      
      .el-date-picker__editor-wrap {
        width: 100%;
        
        .el-input {
          width: 100%;
        }
      }
    }
    
    .el-date-picker__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 8px 8px 16px;
      
      .el-date-picker__prev-btn,
      .el-date-picker__next-btn {
        display: flex;
        gap: 4px;
        
        .el-picker-panel__icon-btn {
          padding: 4px;
          font-size: 12px;
        }
      }
      
      .el-date-picker__header-label {
        font-size: 14px;
        padding: 4px 8px;
      }
    }
    
    .el-picker-panel__content {
      .el-date-table {
        width: 100%;
        font-size: 12px;
        
        th, td {
          padding: 4px;
          height: 32px;
          
          .el-date-table-cell {
            height: 24px;
            line-height: 24px;
            
            .el-date-table-cell__text {
              font-size: 12px;
            }
          }
        }
      }
    }
    
    .el-picker-panel__footer {
      display: flex;
      justify-content: space-between;
      padding: 8px 8px 8px 16px;
      
      .el-picker-panel__link-btn {
        flex: 1;
        margin: 0 4px;
        font-size: 12px;
      }
    }
  }
}

// 日期范围选择器移动端优化
:deep(.el-date-range-picker) {
  @media (max-width: 768px) {
    width: 100% !important;
    max-width: 100vw;
    
    .el-picker-panel__body {
      display: flex;
      flex-direction: column;
      
      .el-picker-panel__content {
        width: 100%;
        
        .el-date-table {
          width: 100%;
          font-size: 11px;
          
          th, td {
            padding: 2px;
            height: 28px;
            
            .el-date-table-cell {
              height: 20px;
              line-height: 20px;
              
              .el-date-table-cell__text {
                font-size: 11px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .notification-history-page {
    .page-header {
      .header-content {
        .header-actions {
          flex-wrap: wrap;
          gap: 8px;
        }
      }
    }
    
    .filter-section {
      .filter-card {
        .filter-content {
          .filter-left {
            flex-wrap: wrap;
            gap: 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .notification-history-page {
    .page-header {
      .header-content {
        .header-left {
          .page-title {
            font-size: 24px;
          }
          
          .page-subtitle {
            font-size: 13px;
          }
        }
        
        .header-actions {
          .el-button {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      }
    }
    
    .filter-section {
      .filter-card {
        .filter-content {
          .filter-left {
            gap: 8px;
            
            .el-select,
            .el-date-picker {
              min-width: 140px;
            }
          }
          
          .filter-right {
            .search-input {
              width: 250px;
            }
          }
        }
      }
    }
    
    .notifications-section {
      .notifications-card {
        .notifications-list {
          .notification-items {
            .notification-item {
              padding: 12px;
              
              .notification-content {
                .notification-header {
                  .notification-title {
                    font-size: 15px;
                  }
                  
                  .notification-meta {
                    gap: 6px;
                    
                    .notification-time {
                      font-size: 11px;
                    }
                  }
                }
                
                .notification-body {
                  .notification-text {
                    font-size: 13px;
                  }
                }
                
                .notification-footer {
                  .notification-user {
                    font-size: 11px;
                  }
                  
                  .notification-status {
                    .read-time {
                      font-size: 10px;
                    }
                  }
                }
              }
              
              .notification-actions {
                .el-button {
                  font-size: 12px;
                  padding: 4px 8px;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .notification-history-page {
    padding: 16px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      
      .header-left {
        .page-title {
          font-size: 22px;
        }
        
        .page-subtitle {
          font-size: 12px;
        }
      }
      
      .header-actions {
        width: 100%;
        justify-content: flex-end;
        flex-wrap: wrap;
        
        .el-button {
          flex: 1;
          min-width: 100px;
          font-size: 12px;
          padding: 6px 10px;
        }
      }
    }
  }
  
  .filter-section {
    .filter-card {
      .filter-content {
        flex-direction: column;
        gap: 16px;
        
        .filter-left {
          flex-wrap: wrap;
          gap: 8px;
          
          .el-select,
          .el-date-picker {
            min-width: 120px;
            flex: 1;
          }
        }
        
        .filter-right {
          width: 100%;
          
          .search-input {
            width: 100%;
          }
        }
      }
    }
  }
  
  .notifications-section {
    .notifications-card {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        
        .header-stats {
          align-self: flex-end;
        }
      }
      
      .notifications-list {
        .notification-items {
          .notification-item {
            flex-direction: column;
            padding: 12px;
            
            .notification-icon {
              margin-right: 0;
              margin-bottom: 8px;
              align-self: flex-start;
              
              .el-icon {
                font-size: 18px;
              }
            }
            
            .notification-content {
              width: 100%;
              
              .notification-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
                
                .notification-title {
                  font-size: 14px;
                }
                
                .notification-meta {
                  align-self: flex-end;
                  
                  .notification-time {
                    font-size: 10px;
                  }
                }
              }
              
              .notification-body {
                margin-bottom: 8px;
                
                .notification-text {
                  font-size: 12px;
                  line-height: 1.4;
                }
              }
              
              .notification-footer {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
                
                .notification-user {
                  font-size: 10px;
                }
                
                .notification-status {
                  align-self: flex-end;
                  
                  .read-time {
                    font-size: 9px;
                  }
                }
              }
            }
            
            .notification-actions {
              margin-left: 0;
              margin-top: 12px;
              flex-direction: row;
              justify-content: flex-end;
              width: 100%;
              
              .el-button {
                flex: 1;
                font-size: 11px;
                padding: 6px 8px;
              }
            }
          }
        }
      }
      
      .pagination-section {
        .el-pagination {
          :deep(.el-pagination__sizes),
          :deep(.el-pagination__jump) {
            display: none;
          }
        }
      }
    }
  }
  
  .notification-detail {
    .detail-header {
      margin-bottom: 16px;
      
      h3 {
        font-size: 16px;
      }
      
      .detail-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        
        .detail-time {
          font-size: 12px;
        }
      }
    }
    
    .detail-content {
      margin-bottom: 16px;
      
      p {
        font-size: 13px;
        line-height: 1.5;
      }
    }
    
    .detail-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      
      .detail-user {
        font-size: 13px;
      }
      
      .detail-status {
        align-self: flex-end;
        
        .read-time {
          font-size: 11px;
        }
      }
    }
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 8px;
    
    .el-button {
      width: 100%;
    }
  }
}

@media (max-width: 576px) {
  .notification-history-page {
    padding: 12px;
  }
  
  .page-header {
    .header-content {
      .header-left {
        .page-title {
          font-size: 20px;
        }
        
        .page-subtitle {
          font-size: 11px;
        }
      }
      
      .header-actions {
        flex-direction: column;
        gap: 8px;
        
        .el-button {
          width: 100%;
          font-size: 13px;
          padding: 8px 12px;
        }
      }
    }
  }
  
  .filter-section {
    .filter-card {
      .filter-content {
        .filter-left {
          .el-select,
          .el-date-picker {
            min-width: 100px;
          }
        }
      }
    }
  }
  
  .notifications-section {
    .notifications-card {
      .card-header {
        .header-stats {
          .el-tag {
            font-size: 11px;
            padding: 2px 6px;
          }
        }
      }
      
      .notifications-list {
        .notification-items {
          .notification-item {
            padding: 10px;
            
            .notification-content {
              .notification-header {
                .notification-title {
                  font-size: 13px;
                }
                
                .notification-meta {
                  .notification-time {
                    font-size: 9px;
                  }
                }
              }
              
              .notification-body {
                .notification-text {
                  font-size: 11px;
                }
              }
              
              .notification-footer {
                .notification-user {
                  font-size: 9px;
                }
                
                .notification-status {
                  .read-time {
                    font-size: 8px;
                  }
                }
              }
            }
            
            .notification-actions {
              .el-button {
                font-size: 10px;
                padding: 4px 6px;
              }
            }
          }
        }
      }
    }
  }
  
  .notification-detail {
    .detail-header {
      margin-bottom: 12px;
      
      h3 {
        font-size: 15px;
      }
      
      .detail-meta {
        .detail-time {
          font-size: 11px;
        }
      }
    }
    
    .detail-content {
      margin-bottom: 12px;
      
      p {
        font-size: 12px;
      }
    }
    
    .detail-footer {
      .detail-user {
        font-size: 12px;
      }
      
      .detail-status {
        .read-time {
          font-size: 10px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .notification-history-page {
    padding: 8px;
  }
  
  .page-header {
    .header-content {
      .header-left {
        .page-title {
          font-size: 18px;
        }
        
        .page-subtitle {
          font-size: 10px;
        }
      }
    }
  }
  
  .filter-section {
    .filter-card {
      .filter-content {
        .filter-left {
          .el-select,
          .el-date-picker {
            min-width: 80px;
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .notifications-section {
    .notifications-card {
      .notifications-list {
        .notification-items {
          .notification-item {
            padding: 8px;
            
            .notification-content {
              .notification-header {
                .notification-title {
                  font-size: 12px;
                }
              }
              
              .notification-body {
                .notification-text {
                  font-size: 10px;
                }
              }
            }
            
            .notification-actions {
              .el-button {
                font-size: 9px;
                padding: 3px 5px;
              }
            }
          }
        }
      }
    }
  }
}

// 横屏模式优化
@media (max-height: 600px) and (orientation: landscape) {
  .notification-history-page {
    .page-header {
      .header-content {
        flex-direction: row;
        align-items: center;
        
        .header-actions {
          width: auto;
          flex-direction: row;
        }
      }
    }
    
    .filter-section {
      .filter-card {
        .filter-content {
          flex-direction: row;
          
          .filter-left {
            flex: 1;
          }
          
          .filter-right {
            width: auto;
            
            .search-input {
              width: 200px;
            }
          }
        }
      }
    }
    
    .notifications-section {
      .notifications-card {
        .notifications-list {
          .notification-items {
            .notification-item {
              padding: 8px;
              
              .notification-content {
                .notification-header {
                  .notification-title {
                    font-size: 13px;
                  }
                }
                
                .notification-body {
                  .notification-text {
                    font-size: 11px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 高分辨率屏幕优化
@media (min-width: 1920px) {
  .notification-history-page {
    max-width: 1600px;
    margin: 0 auto;
    
    .page-header {
      .header-content {
        .header-left {
          .page-title {
            font-size: 32px;
          }
          
          .page-subtitle {
            font-size: 16px;
          }
        }
        
        .header-actions {
          .el-button {
            font-size: 15px;
            padding: 12px 20px;
          }
        }
      }
    }
    
    .filter-section {
      .filter-card {
        .filter-content {
          .filter-left {
            gap: 20px;
            
            .el-select,
            .el-date-picker {
              min-width: 180px;
            }
          }
          
          .filter-right {
            .search-input {
              width: 400px;
            }
          }
        }
      }
    }
    
    .notifications-section {
      .notifications-card {
        .notifications-list {
          .notification-items {
            .notification-item {
              padding: 24px;
              
              .notification-icon {
                .el-icon {
                  font-size: 24px;
                }
              }
              
              .notification-content {
                .notification-header {
                  .notification-title {
                    font-size: 18px;
                  }
                  
                  .notification-meta {
                    .notification-time {
                      font-size: 14px;
                    }
                  }
                }
                
                .notification-body {
                  .notification-text {
                    font-size: 16px;
                  }
                }
                
                .notification-footer {
                  .notification-user {
                    font-size: 14px;
                  }
                  
                  .notification-status {
                    .read-time {
                      font-size: 12px;
                    }
                  }
                }
              }
              
              .notification-actions {
                .el-button {
                  font-size: 14px;
                  padding: 8px 16px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
