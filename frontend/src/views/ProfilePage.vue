<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">个人资料</h1>
          <p class="page-subtitle">管理您的个人信息和账户设置</p>
        </div>
        <div class="header-actions">
          <el-button @click="refreshProfile" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧个人信息卡片 -->
        <el-col :xs="24" :md="8">
          <el-card class="profile-card">
            <template #header>
              <div class="card-header">
                <span>个人信息</span>
                <el-button type="text" @click="editMode = !editMode">
                  <el-icon><Edit /></el-icon>
                  {{ editMode ? '取消编辑' : '编辑' }}
                </el-button>
              </div>
            </template>
            
            <div class="profile-info">
              <!-- 头像区域 -->
              <div class="avatar-section">
                <el-avatar 
                  :size="120" 
                  :src="profileForm.avatar_url"
                  class="profile-avatar"
                >
                  {{ profileForm.username?.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="avatar-actions">
                  <el-upload
                    class="avatar-uploader"
                    :action="uploadUrl"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :on-progress="handleAvatarProgress"
                    :before-upload="beforeAvatarUpload"
                    :on-error="handleAvatarError"
                    name="avatar"
                    accept="image/*"
                  >
                    <el-button type="primary" size="small" :loading="uploadingAvatar">
                      <el-icon><Upload /></el-icon>
                      {{ uploadingAvatar ? '上传中...' : '更换头像' }}
                    </el-button>
                  </el-upload>
                  
                  <!-- 上传进度 -->
                  <div v-if="uploadingAvatar" class="upload-progress">
                    <el-progress 
                      :percentage="uploadProgress" 
                      :stroke-width="6"
                      :show-text="true"
                      :format="formatProgress"
                    />
                    <div class="progress-text">
                      {{ progressText }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 基本信息 -->
              <div class="basic-info">
                <div class="info-item">
                  <span class="label">用户名</span>
                  <span class="value">{{ profileForm.username }}</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱</span>
                  <span class="value">{{ profileForm.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">角色</span>
                  <el-tag :type="profileForm.role === 'admin' ? 'danger' : 'primary'">
                    {{ profileForm.role === 'admin' ? '管理员' : '用户' }}
                  </el-tag>
                </div>
                <div class="info-item">
                  <span class="label">注册时间</span>
                  <span class="value">{{ formatDate(profileForm.created_at) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧详细信息 -->
        <el-col :xs="24" :md="16">
          <el-card class="details-card">
            <template #header>
              <span>详细信息</span>
            </template>
            
            <el-form 
              :model="profileForm" 
              :rules="profileRules" 
              ref="profileFormRef"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="profileForm.username" 
                  :disabled="!editMode"
                  placeholder="请输入用户名"
                />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="profileForm.email" 
                  :disabled="!editMode"
                  placeholder="请输入新邮箱"
                  class="email-input"
                />
                <!-- 当邮箱地址发生变化时显示验证码区域 -->
                <div v-if="editMode && profileForm.email && profileForm.email !== originalEmail" class="email-verification-section">
                  <div class="verification-header">
                    <span class="verification-title">邮箱验证</span>
                  </div>
                  <div class="verification-input-row">
                    <el-input 
                      v-model="emailCode"
                      placeholder="请输入6位验证码"
                      class="email-code-input"
                      maxlength="6"
                    />
                    <el-button 
                      type="primary" 
                      size="small"
                      :disabled="emailCodeCooldown > 0"
                      @click="sendEmailCode"
                      class="send-code-btn"
                    >
                      {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s` : '发送验证码' }}
                    </el-button>
                  </div>
                  <div v-if="showEmailCodeInput" class="code-tips">
                    <span class="code-timer">验证码有效期：{{ codeExpireTime }}s</span>
                    <el-button type="text" @click="resendEmailCode" :disabled="emailCodeCooldown > 0">
                      {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s后重发` : '重新发送' }}
                    </el-button>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="昵称" prop="nickname">
                <el-input 
                  v-model="profileForm.nickname" 
                  :disabled="!editMode"
                  placeholder="请输入昵称"
                />
              </el-form-item>
              
              <el-form-item label="个人简介" prop="bio">
                <el-input 
                  v-model="profileForm.bio" 
                  :disabled="!editMode"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入个人简介"
                />
              </el-form-item>
              
              <el-form-item label="存储使用" v-if="!editMode">
                <div class="storage-info">
                  <el-progress
                    :percentage="storagePercentage"
                    :color="getStorageColor(storagePercentage)"
                    :stroke-width="8"
                  >
                    <template #default="{ percentage }">
                      {{ formatPercentage(percentage) }}
                    </template>
                  </el-progress>
                  <div class="storage-text">
                    {{ formatFileSize(profileForm.used_storage || 0) }} / {{ formatFileSize(profileForm.storage_limit || 0) }}
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item v-if="editMode">
                <el-button type="primary" @click="saveProfile" :loading="saving">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
                <el-button @click="cancelEdit">
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Refresh,
  Edit,
  Upload,
  Check,
  Close,
  Lock,
  QuestionFilled
} from '@element-plus/icons-vue'
import { formatFileSize, formatPercentage } from '@/utils/helpers'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const editMode = ref(false)
const uploadingAvatar = ref(false)
const uploadProgress = ref(0)
const progressText = ref('')
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 邮箱验证码相关
const originalEmail = ref('')
const emailCode = ref('')
const showEmailCodeInput = ref(false)
const emailCodeCooldown = ref(0)
const codeExpireTime = ref(0)
const emailCodeTimer = ref<NodeJS.Timeout | null>(null)
const codeExpireTimer = ref<NodeJS.Timeout | null>(null)

// 个人信息表单
const profileForm = reactive({
  id: 0,
  username: '',
  email: '',
  nickname: '',
  bio: '',
  avatar_url: '',
  role: '',
  storage_limit: 0,
  used_storage: 0,
  created_at: ''
})

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9_]+$/, 
      message: '用户名只能包含字母、数字和下划线', 
      trigger: 'blur' 
    },
    {
      validator: (rule: any, value: string, callback: any) => {
        // 检查用户名是否包含邮箱格式（包含@符号）
        if (value && value.includes('@')) {
          callback(new Error('用户名不能使用邮箱格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [
    { max: 50, message: '昵称长度不能超过 50 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const storagePercentage = computed(() => {
  if (!profileForm.storage_limit) return 0
  return Math.round((profileForm.used_storage / profileForm.storage_limit) * 100)
})

const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'}/api/files/upload/avatar`
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${authStore.token}`
  }
})

// 邮箱验证码相关方法
const sendEmailCode = async () => {
  if (!profileForm.email || profileForm.email === originalEmail.value) {
    ElMessage.warning('请输入新的邮箱地址')
    return
  }

  try {
    const response = await api.post('/auth/send-email-code', {
      email: profileForm.email,
      type: 'change_email'
    })

    if (response.data.success) {
      ElMessage.success('验证码已发送到您的邮箱')
      showEmailCodeInput.value = true
      startEmailCodeCooldown()
      startCodeExpireTimer()
    } else {
      ElMessage.error(response.data.message || '发送验证码失败')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '发送验证码失败'
    ElMessage.error(errorMessage)
  }
}

const resendEmailCode = async () => {
  if (emailCodeCooldown.value > 0) {
    ElMessage.warning(`请等待 ${emailCodeCooldown.value} 秒后再试`)
    return
  }
  await sendEmailCode()
}

const startEmailCodeCooldown = () => {
  emailCodeCooldown.value = 60 // 1分钟冷却时间
  emailCodeTimer.value = setInterval(() => {
    emailCodeCooldown.value--
    if (emailCodeCooldown.value <= 0) {
      clearInterval(emailCodeTimer.value!)
      emailCodeTimer.value = null
    }
  }, 1000)
}

const startCodeExpireTimer = () => {
  codeExpireTime.value = 300 // 5分钟有效期
  codeExpireTimer.value = setInterval(() => {
    codeExpireTime.value--
    if (codeExpireTime.value <= 0) {
      clearInterval(codeExpireTimer.value!)
      codeExpireTimer.value = null
      showEmailCodeInput.value = false
      emailCode.value = ''
      ElMessage.warning('验证码已过期，请重新发送')
    }
  }, 1000)
}

const clearTimers = () => {
  if (emailCodeTimer.value) {
    clearInterval(emailCodeTimer.value)
    emailCodeTimer.value = null
  }
  if (codeExpireTimer.value) {
    clearInterval(codeExpireTimer.value)
    codeExpireTimer.value = null
  }
}

// 方法
const refreshProfile = async () => {
  loading.value = true
  try {
    await fetchProfile()
    ElMessage.success('个人信息已刷新')
  } catch (error) {
    console.error('刷新个人信息失败:', error)
    ElMessage.error('刷新个人信息失败')
  } finally {
    loading.value = false
  }
}

const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/me')
    const userData = response.data.user
    
    Object.assign(profileForm, {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      nickname: userData.nickname || '',
      bio: userData.bio || '',
      avatar_url: userData.avatar_url ? 
        (userData.avatar_url.startsWith('http') ? userData.avatar_url : 
         `${import.meta.env.VITE_API_BASE_URL || 'https://tukubackend.vtart.cn'}${userData.avatar_url}`) : '',
      role: userData.role,
      storage_limit: userData.storage_limit,
      used_storage: userData.used_storage,
      created_at: userData.created_at
    })
    
    // 保存原始邮箱用于比较
    originalEmail.value = userData.email
  } catch (error) {
    console.error('获取个人信息失败:', error)
    throw error
  }
}

const saveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    // 如果邮箱发生变化，需要验证码
    if (profileForm.email !== originalEmail.value) {
      if (!emailCode.value) {
        ElMessage.warning('请先发送并输入邮箱验证码')
        return
      }
      if (codeExpireTime.value <= 0) {
        ElMessage.warning('验证码已过期，请重新发送')
        return
      }
    }
    
    saving.value = true
    
    const updateData: any = {
      username: profileForm.username,
      nickname: profileForm.nickname,
      bio: profileForm.bio
    }
    
    // 只有当邮箱发生变化且验证码验证通过时，才更新邮箱
    if (profileForm.email !== originalEmail.value) {
      updateData.email = profileForm.email
      updateData.emailCode = emailCode.value
    }
    
    await api.put('/auth/profile', updateData)
    
    ElMessage.success('个人信息保存成功')
    editMode.value = false
    
    // 清理验证码相关状态
    clearTimers()
    showEmailCodeInput.value = false
    emailCode.value = ''
    emailCodeCooldown.value = 0
    codeExpireTime.value = 0
    
    // 更新认证状态
    await authStore.checkAuth()
  } catch (error: any) {
    console.error('保存个人信息失败:', error)
    const errorMessage = error.response?.data?.message || '保存个人信息失败'
    ElMessage.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editMode.value = false
  
  // 清理验证码相关状态
  clearTimers()
  showEmailCodeInput.value = false
  emailCode.value = ''
  emailCodeCooldown.value = 0
  codeExpireTime.value = 0
  
  // 恢复原始邮箱地址
  profileForm.email = originalEmail.value
  
  fetchProfile() // 重新获取数据，取消修改
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    await api.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const handleAvatarSuccess = (response: any) => {
  uploadingAvatar.value = false
  uploadProgress.value = 0
  progressText.value = ''
  
  console.log('头像上传响应:', response) // 调试信息
  
  // 后端返回的格式是 { success: true, message: '...', data: { url: '...' } }
  if (response && response.success && response.data && response.data.url) {
    console.log('头像URL:', response.data.url) // 调试信息
    console.log('更新前头像URL:', profileForm.avatar_url) // 调试信息
    
    // 后端已经返回完整URL，直接使用并添加时间戳防止缓存
    const avatarUrl = response.data.url + '?t=' + Date.now()
    profileForm.avatar_url = avatarUrl
    
    console.log('更新后头像URL:', profileForm.avatar_url) // 调试信息
    
    ElMessage.success(response.message || '头像上传成功')
    
    // 更新认证状态和用户信息
    authStore.updateUser({ avatar_url: avatarUrl })
    
    // 重新获取用户信息以确保数据同步
    fetchProfile()
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const handleAvatarProgress = (event: any) => {
  uploadProgress.value = Math.round(event.percent)
  
  if (event.percent < 100) {
    progressText.value = `上传中... ${uploadProgress.value}%`
  } else {
    progressText.value = '服务器处理中，请稍候...'
    uploadProgress.value = 95 // 上传完成但服务器还在处理
  }
}

const handleAvatarError = (error: any) => {
  uploadingAvatar.value = false
  uploadProgress.value = 0
  progressText.value = ''
  
  console.error('头像上传失败:', error)
  
  // 更详细的错误处理
  if (error.message) {
    if (error.message.includes('Unexpected field')) {
      ElMessage.error('上传字段错误，请重试')
    } else if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，请检查网络连接')
    } else if (error.message.includes('401')) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(`上传失败：${error.message}`)
    }
  } else {
    ElMessage.error('头像上传失败，请重试')
  }
}

const formatProgress = (percentage: number) => {
  return `${percentage}%`
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  
  // 开始上传
  uploadingAvatar.value = true
  uploadProgress.value = 0
  progressText.value = '准备上传...'
  
  // 设置超时处理
  setTimeout(() => {
    if (uploadingAvatar.value && uploadProgress.value < 100) {
      ElMessage.warning('上传时间较长，请耐心等待...')
    }
  }, 10000) // 10秒后提示
  
  setTimeout(() => {
    if (uploadingAvatar.value && uploadProgress.value < 100) {
      uploadingAvatar.value = false
      uploadProgress.value = 0
      progressText.value = ''
      ElMessage.error('上传超时，请重试')
    }
  }, 60000) // 60秒超时
  
  return true
}

const getStorageColor = (percentage: number) => {
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 生命周期
onMounted(() => {
  fetchProfile()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .page-subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

.profile-content {
  .profile-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .profile-info {
      .avatar-section {
        text-align: center;
        margin-bottom: 24px;
        
        .profile-avatar {
          margin-bottom: 16px;
          border: 4px solid #f0f0f0;
        }
        
        .avatar-actions {
          .avatar-uploader {
            :deep(.el-upload) {
              border: none;
            }
          }
          
          .upload-progress {
            margin-top: 12px;
            width: 200px;
            
            .progress-text {
              margin-top: 8px;
              font-size: 12px;
              color: #909399;
              text-align: center;
            }
          }
        }
      }
      
      .basic-info {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .label {
            color: #909399;
            font-size: 14px;
          }
          
          .value {
            color: #303133;
            font-weight: 500;
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .details-card {
    margin-bottom: 24px;
    
    .profile-form {
      .storage-info {
        width: 100%; // 让存储信息区域占满整个表单项内容区域
        
        :deep(.el-progress) {
          width: 100%; // 进度条占满整个宽度
          
          .el-progress-bar__outer {
            border-radius: 12px; // 增大圆角
            background: rgba(102, 126, 234, 0.08); // 更淡的背景
            height: 12px; // 增加高度
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); // 添加内阴影
            overflow: hidden; // 确保圆角效果
          }
          
          .el-progress-bar__inner {
            border-radius: 12px; // 增大圆角
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); // 更丰富的渐变
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); // 添加阴影效果
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
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
              animation: shimmer 2s infinite;
            }
          }
          
          .el-progress__text {
            font-size: 14px; // 增大字体
            font-weight: 600; // 增加字重
            color: #667eea; // 使用主题色
            margin-left: 12px; // 增加间距
          }
        }
        
        .storage-text {
          margin-top: 8px;
          font-size: 12px;
          color: #909399;
          text-align: center;
        }
      }
    }
  }
  
  .password-card {
    .password-form {
      max-width: 500px;
    }
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

// 响应式设计
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
  
  .profile-content {
    .profile-card {
      margin-bottom: 16px;
      
      .profile-info {
        .avatar-section {
          .profile-avatar {
            width: 80px;
            height: 80px;
          }
        }
      }
    }
  }
}

// 邮箱验证码相关样式
.email-input {
  width: 100%;
}

.email-verification-section {
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .verification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
    
    .verification-title {
      font-size: 16px;
      font-weight: 600;
      color: #495057;
      display: flex;
      align-items: center;
      
      &::before {
        content: "🔐";
        margin-right: 8px;
        font-size: 18px;
      }
    }
    
    .send-code-btn {
      min-width: 120px;
      height: 36px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.email-verification-section {
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .verification-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
    
    .verification-title {
      font-size: 16px;
      font-weight: 600;
      color: #495057;
      display: flex;
      align-items: center;
      
      &::before {
        content: "🔐";
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
  
  .verification-input-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .email-code-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        border: 2px solid #e3f2fd;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #bbdefb;
        }
        
        &.is-focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }
      }
      
      :deep(.el-input__inner) {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 2px;
        text-align: center;
      }
    }
    
    .send-code-btn {
      min-width: 120px;
      height: 36px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
  
  .code-tips {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #6c757d;
    
    .code-timer {
      color: #dc3545;
      font-weight: 600;
      display: flex;
      align-items: center;
      
      &::before {
        content: "⏰";
        margin-right: 4px;
      }
    }
    
    .el-button {
      font-size: 12px;
      padding: 4px 8px;
      height: auto;
      
      &:hover {
        color: #409eff;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .email-verification-section {
    padding: 16px;
    margin-top: 12px;
    
    .verification-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      
      .verification-title {
        font-size: 14px;
        justify-content: center;
      }
    }
    
    .verification-input-row {
      flex-direction: column;
      gap: 12px;
      
      .email-code-input {
        :deep(.el-input__inner) {
          font-size: 14px;
          letter-spacing: 1px;
        }
      }
      
      .send-code-btn {
        width: 100%;
        min-width: auto;
      }
    }
    
    .code-tips {
      flex-direction: column;
      gap: 8px;
      align-items: center;
      font-size: 12px;
      
      .code-timer {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .email-verification-section {
    padding: 12px;
    
    .verification-header {
      .verification-title {
        font-size: 13px;
        
        &::before {
          font-size: 16px;
        }
      }
    }
    
    .verification-input-row {
      .email-code-input {
        :deep(.el-input__inner) {
          font-size: 13px;
        }
      }
    }
  }
}

// 忘记密码按钮样式
.forgot-password-btn {
  color: #667eea;
  font-size: 14px;
  padding: 0 8px;
  margin-left: 16px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
  position: relative;
  
  &:hover {
    color: #764ba2;
  }
  
  &:active {
    color: #5a4fcf;
  }
  
  .el-icon {
    margin-right: 4px;
  }
}
</style>
