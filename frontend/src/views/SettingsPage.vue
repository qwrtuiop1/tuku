<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">系统设置</h1>
          <p class="page-subtitle">配置系统参数和功能选项</p>
        </div>
        <div class="header-actions">
          <el-button @click="refreshSettings" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="settings-content">
      <el-row :gutter="24">
        <!-- 左侧设置分类 -->
        <el-col :xs="24" :sm="6" :md="6" :lg="6" :xl="6">
          <el-card class="settings-nav-card">
            <el-menu
              v-model="activeTab"
              class="settings-menu"
              @select="handleTabSelect"
            >
              <el-menu-item index="general">
                <el-icon><Setting /></el-icon>
                <span>常规设置</span>
              </el-menu-item>
              <el-menu-item index="storage">
                <el-icon><Folder /></el-icon>
                <span>存储设置</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </el-menu-item>
              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>
              <el-menu-item index="appearance">
                <el-icon><Monitor /></el-icon>
                <span>外观设置</span>
              </el-menu-item>
              <el-menu-item index="integration">
                <el-icon><Connection /></el-icon>
                <span>第三方集成</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧设置内容 -->
        <el-col :xs="24" :sm="18" :md="18" :lg="18" :xl="18">
          <el-card class="settings-panel-card">
            <!-- 常规设置 -->
            <div v-if="activeTab === 'general'" class="settings-section">
              <div class="section-header">
                <h3>常规设置</h3>
                <p>配置系统基本参数</p>
              </div>
              
              <el-form :model="generalSettings" :rules="generalRules" ref="generalFormRef" label-width="120px" class="settings-form">
                <el-form-item label="系统名称" prop="systemName">
                  <el-input v-model="generalSettings.systemName" placeholder="请输入系统名称" />
                </el-form-item>
                
                <el-form-item label="系统描述" prop="systemDescription">
                  <el-input 
                    v-model="generalSettings.systemDescription" 
                    type="textarea"
                    :rows="3"
                    placeholder="请输入系统描述"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveGeneralSettings" :loading="saving">
                    <el-icon><Check /></el-icon>
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 存储设置 -->
            <div v-if="activeTab === 'storage'" class="settings-section">
              <div class="section-header">
                <h3>存储设置</h3>
                <p>配置文件存储相关参数</p>
              </div>
              
              <el-form :model="storageSettings" :rules="storageRules" ref="storageFormRef" label-width="120px" class="settings-form">
                <el-form-item label="最大文件大小" prop="maxFileSize">
                  <el-input-number 
                    v-model="storageSettings.maxFileSize" 
                    :min="1" 
                    :max="1000"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">MB</span>
                  <span class="form-description">单个文件上传的最大大小限制</span>
                </el-form-item>
                
                <el-form-item label="单次上传文件数" prop="maxUploadFiles">
                  <el-input-number 
                    v-model="storageSettings.maxUploadFiles" 
                    :min="1" 
                    :max="50"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">个</span>
                  <span class="form-description">单次最多可以上传的文件数量</span>
                </el-form-item>
                
                <el-form-item label="允许的图片类型">
                  <el-checkbox-group v-model="storageSettings.allowedImageTypes">
                    <el-checkbox label="jpg">JPG</el-checkbox>
                    <el-checkbox label="jpeg">JPEG</el-checkbox>
                    <el-checkbox label="png">PNG</el-checkbox>
                    <el-checkbox label="gif">GIF</el-checkbox>
                    <el-checkbox label="webp">WebP</el-checkbox>
                    <el-checkbox label="svg">SVG</el-checkbox>
                  </el-checkbox-group>
                  <div class="form-description">选择允许上传的图片格式</div>
                </el-form-item>
                
                <el-form-item label="允许的视频类型">
                  <el-checkbox-group v-model="storageSettings.allowedVideoTypes">
                    <el-checkbox label="mp4">MP4</el-checkbox>
                    <el-checkbox label="webm">WebM</el-checkbox>
                    <el-checkbox label="mov">MOV</el-checkbox>
                    <el-checkbox label="avi">AVI</el-checkbox>
                    <el-checkbox label="mkv">MKV</el-checkbox>
                  </el-checkbox-group>
                  <div class="form-description">选择允许上传的视频格式</div>
                </el-form-item>
                
                <el-form-item label="缩略图尺寸" prop="thumbnailSize">
                  <el-input-number 
                    v-model="storageSettings.thumbnailSize" 
                    :min="100" 
                    :max="1000"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">px</span>
                  <span class="form-description">生成缩略图的尺寸</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveStorageSettings" :loading="saving">
                    <el-icon><Check /></el-icon>
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeTab === 'security'" class="settings-section">
              <div class="section-header">
                <h3>安全设置</h3>
                <p>配置系统安全相关参数</p>
              </div>
              
              <el-form :model="securitySettings" :rules="securityRules" ref="securityFormRef" label-width="120px" class="settings-form">
                <el-form-item label="密码最小长度" prop="minPasswordLength">
                  <el-input-number 
                    v-model="securitySettings.minPasswordLength" 
                    :min="6" 
                    :max="20"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">位</span>
                  <span class="form-description">用户密码的最小长度要求</span>
                </el-form-item>
                
                <el-form-item label="登录失败锁定">
                  <el-switch 
                    v-model="securitySettings.enableLoginLock"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-description">登录失败次数过多时锁定账户</span>
                </el-form-item>
                
                <el-form-item label="最大失败次数" prop="maxLoginAttempts" v-if="securitySettings.enableLoginLock">
                  <el-input-number 
                    v-model="securitySettings.maxLoginAttempts" 
                    :min="3" 
                    :max="10"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">次</span>
                  <span class="form-description">达到此次数后锁定账户</span>
                </el-form-item>
                
                <el-form-item label="锁定时间" prop="lockoutDuration" v-if="securitySettings.enableLoginLock">
                  <el-input-number 
                    v-model="securitySettings.lockoutDuration" 
                    :min="5" 
                    :max="60"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">分钟</span>
                  <span class="form-description">账户锁定的持续时间</span>
                </el-form-item>
                
                <el-form-item label="会话超时时间" prop="sessionTimeout">
                  <el-input-number 
                    v-model="securitySettings.sessionTimeout" 
                    :min="30" 
                    :max="1440"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">分钟</span>
                  <span class="form-description">用户会话的超时时间</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveSecuritySettings" :loading="saving">
                    <el-icon><Check /></el-icon>
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeTab === 'notification'" class="settings-section">
              <div class="section-header">
                <h3>通知设置</h3>
                <p>配置系统通知相关参数</p>
              </div>
              
              <el-form :model="notificationSettings" ref="notificationFormRef" label-width="120px" class="settings-form">
                <el-form-item label="邮件通知">
                  <el-switch 
                    v-model="notificationSettings.enableEmailNotification"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-description">是否启用邮件通知功能</span>
                </el-form-item>
                
                <el-form-item label="SMTP服务器" prop="smtpHost" v-if="notificationSettings.enableEmailNotification">
                  <el-input v-model="notificationSettings.smtpHost" placeholder="请输入SMTP服务器地址" />
                </el-form-item>
                
                <el-form-item label="SMTP端口" prop="smtpPort" v-if="notificationSettings.enableEmailNotification">
                  <el-input-number 
                    v-model="notificationSettings.smtpPort" 
                    :min="1" 
                    :max="65535"
                    controls-position="right"
                    style="width: 200px"
                  />
                </el-form-item>
                
                <el-form-item label="发件人邮箱" prop="senderEmail" v-if="notificationSettings.enableEmailNotification">
                  <el-input v-model="notificationSettings.senderEmail" placeholder="请输入发件人邮箱" />
                </el-form-item>
                
                <el-form-item label="系统通知">
                  <el-switch 
                    v-model="notificationSettings.enableSystemNotification"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-description">是否在系统内显示通知</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveNotificationSettings" :loading="saving">
                    <el-icon><Check /></el-icon>
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 外观设置 -->
            <div v-if="activeTab === 'appearance'" class="settings-section">
              <div class="section-header">
                <h3>外观设置</h3>
                <p>配置系统界面外观</p>
              </div>
              
              <el-form :model="appearanceSettings" ref="appearanceFormRef" label-width="120px" class="settings-form">
                <el-form-item label="主题模式">
                  <el-radio-group v-model="appearanceSettings.themeMode">
                    <el-radio label="light">浅色模式</el-radio>
                    <el-radio label="dark">深色模式</el-radio>
                    <el-radio label="auto">跟随系统</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="主色调">
                  <el-color-picker v-model="appearanceSettings.primaryColor" />
                  <span class="form-description">系统的主色调</span>
                </el-form-item>
                
                <el-form-item label="侧边栏宽度">
                  <el-slider 
                    v-model="appearanceSettings.sidebarWidth" 
                    :min="200" 
                    :max="300"
                    show-input
                    style="width: 300px"
                  />
                  <span class="form-description">侧边栏的宽度</span>
                </el-form-item>
                
                <el-form-item label="页面动画">
                  <el-switch 
                    v-model="appearanceSettings.enableAnimation"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-description">是否启用页面切换动画</span>
                </el-form-item>
                
                <el-form-item label="系统Logo">
                  <el-input 
                    v-model="appearanceSettings.logoUrl" 
                    placeholder="请输入Logo URL"
                    clearable
                  />
                  <span class="form-description">系统Logo的URL地址</span>
                </el-form-item>
                
                <el-form-item label="网站图标">
                  <el-input 
                    v-model="appearanceSettings.faviconUrl" 
                    placeholder="请输入Favicon URL"
                    clearable
                  />
                  <span class="form-description">网站图标的URL地址</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveAppearanceSettings" :loading="saving">
                    <el-icon><Check /></el-icon>
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 第三方集成设置 -->
            <div v-if="activeTab === 'integration'" class="settings-section integration-section">
              <div class="section-header">
                <h3>第三方集成</h3>
                <p>配置第三方登录和集成服务</p>
              </div>
              
              <el-form :model="integrationSettings" ref="integrationFormRef" label-width="140px" class="settings-form">
                <!-- QQ登录设置 -->
                <el-divider content-position="left">
                  <el-icon><Connection /></el-icon>
                  QQ登录集成
                </el-divider>
                
                <el-form-item label="启用QQ登录">
                  <el-switch 
                    v-model="integrationSettings.qqLoginEnabled"
                    active-text="开启"
                    inactive-text="关闭"
                    @change="handleQQLoginToggle"
                  />
                  <span class="form-description">允许用户使用QQ账号登录系统</span>
                </el-form-item>
                
                <el-form-item 
                  label="QQ应用ID" 
                  prop="qqAppId"
                  :rules="[{ required: integrationSettings.qqLoginEnabled, message: 'QQ应用ID不能为空', trigger: 'blur' }]"
                >
                  <el-input 
                    v-model="integrationSettings.qqAppId" 
                    placeholder="请输入QQ应用ID"
                    :disabled="!integrationSettings.qqLoginEnabled"
                    clearable
                  />
                  <div class="form-description">
                    <el-link type="primary" href="https://connect.qq.com/" target="_blank">
                      获取QQ应用ID
                    </el-link>
                  </div>
                </el-form-item>
                
                <el-form-item 
                  label="QQ应用密钥" 
                  prop="qqAppKey"
                  :rules="[{ required: integrationSettings.qqLoginEnabled, message: 'QQ应用密钥不能为空', trigger: 'blur' }]"
                >
                  <el-input 
                    v-model="integrationSettings.qqAppKey" 
                    type="password"
                    placeholder="请输入QQ应用密钥"
                    :disabled="!integrationSettings.qqLoginEnabled"
                    show-password
                    clearable
                  />
                  <div class="form-description">QQ应用的密钥，用于验证应用身份</div>
                </el-form-item>
                
                <el-form-item v-if="integrationSettings.qqLoginEnabled">
                  <el-alert
                    title="QQ登录配置说明"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>1. 在QQ互联平台创建应用并获取App ID和App Key</p>
                      <p>2. 设置回调地址为：<code>{{ getCallbackUrl('qq') }}</code></p>
                      <p>3. 确保应用状态为"已上线"</p>
                    </template>
                  </el-alert>
                </el-form-item>

                <!-- 微信登录设置 -->
                <el-divider content-position="left">
                  <el-icon><Connection /></el-icon>
                  微信登录集成
                </el-divider>
                
                <el-form-item label="启用微信登录">
                  <el-switch 
                    v-model="integrationSettings.wechatLoginEnabled"
                    active-text="开启"
                    inactive-text="关闭"
                    @change="handleWechatLoginToggle"
                  />
                  <span class="form-description">允许用户使用微信账号登录系统</span>
                </el-form-item>
                
                <el-form-item 
                  label="微信应用ID" 
                  prop="wechatAppId"
                  :rules="[{ required: integrationSettings.wechatLoginEnabled, message: '微信应用ID不能为空', trigger: 'blur' }]"
                >
                  <el-input 
                    v-model="integrationSettings.wechatAppId" 
                    placeholder="请输入微信应用ID"
                    :disabled="!integrationSettings.wechatLoginEnabled"
                    clearable
                  />
                  <div class="form-description">
                    <el-link type="primary" href="https://developers.weixin.qq.com/" target="_blank">
                      获取微信应用ID
                    </el-link>
                  </div>
                </el-form-item>
                
                <el-form-item 
                  label="微信应用密钥" 
                  prop="wechatAppSecret"
                  :rules="[{ required: integrationSettings.wechatLoginEnabled, message: '微信应用密钥不能为空', trigger: 'blur' }]"
                >
                  <el-input 
                    v-model="integrationSettings.wechatAppSecret" 
                    type="password"
                    placeholder="请输入微信应用密钥"
                    :disabled="!integrationSettings.wechatLoginEnabled"
                    show-password
                    clearable
                  />
                  <div class="form-description">微信应用的密钥，用于验证应用身份</div>
                </el-form-item>
                
                <el-form-item v-if="integrationSettings.wechatLoginEnabled">
                  <el-alert
                    title="微信登录配置说明"
                    type="info"
                    :closable="false"
                    show-icon
                  >
                    <template #default>
                      <p>1. 在微信开放平台创建网站应用</p>
                      <p>2. 设置回调地址为：<code>{{ getCallbackUrl('wechat') }}</code></p>
                      <p>3. 确保应用已通过审核</p>
                    </template>
                  </el-alert>
                </el-form-item>

                <!-- 测试连接 -->
                <el-divider content-position="left">
                  <el-icon><Tools /></el-icon>
                  连接测试
                </el-divider>
                
                <el-form-item label="测试连接">
                  <el-button 
                    type="success" 
                    @click="testQQConnection"
                    :disabled="!integrationSettings.qqLoginEnabled || !integrationSettings.qqAppId"
                    :loading="testingQQ"
                  >
                    <el-icon><Connection /></el-icon>
                    测试QQ连接
                  </el-button>
                  
                  <el-button 
                    type="success" 
                    @click="testWechatConnection"
                    :disabled="!integrationSettings.wechatLoginEnabled || !integrationSettings.wechatAppId"
                    :loading="testingWechat"
                    style="margin-left: 12px"
                  >
                    <el-icon><Connection /></el-icon>
                    测试微信连接
                  </el-button>
                  
                  <div class="form-description">测试第三方登录配置是否正确</div>
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="saveIntegrationSettings" 
                    :loading="saving"
                    :disabled="!hasIntegrationChanges"
                  >
                    <el-icon><Check /></el-icon>
                    {{ hasIntegrationChanges ? '保存设置' : '已保存' }}
                  </el-button>
                  
                  <el-button 
                    @click="resetIntegrationSettings" 
                    style="margin-left: 12px"
                    :disabled="!hasIntegrationChanges"
                  >
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                  
                  <div v-if="hasIntegrationChanges" class="form-description" style="margin-top: 8px; color: #e6a23c;">
                    <el-icon><Warning /></el-icon>
                    检测到未保存的更改
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Refresh,
  Setting,
  Folder,
  Lock,
  Bell,
  Monitor,
  Check,
  Connection,
  Tools,
  Warning
} from '@element-plus/icons-vue'
import api from '@/utils/api'

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('general')
const generalFormRef = ref<FormInstance>()
const storageFormRef = ref<FormInstance>()
const securityFormRef = ref<FormInstance>()
const notificationFormRef = ref<FormInstance>()
const appearanceFormRef = ref<FormInstance>()
const integrationFormRef = ref<FormInstance>()

// 测试连接状态
const testingQQ = ref(false)
const testingWechat = ref(false)

// 常规设置
const generalSettings = reactive({
  systemName: '',
  systemDescription: ''
})

// 存储设置
const storageSettings = reactive({
  maxFileSize: 100,
  maxUploadFiles: 10,
  allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  allowedVideoTypes: ['mp4', 'webm', 'mov'],
  thumbnailSize: 300
})

// 安全设置
const securitySettings = reactive({
  minPasswordLength: 6,
  enableLoginLock: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 120
})

// 通知设置
const notificationSettings = reactive({
  enableEmailNotification: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  senderEmail: '',
  senderName: '图库系统',
  enableSystemNotification: true
})

// 外观设置
const appearanceSettings = reactive({
  themeMode: 'light',
  primaryColor: '#409EFF',
  sidebarWidth: 240,
  enableAnimation: true,
  logoUrl: '',
  faviconUrl: ''
})

// 第三方集成设置
const integrationSettings = reactive({
  qqLoginEnabled: false,
  qqAppId: '',
  qqAppKey: '',
  wechatLoginEnabled: false,
  wechatAppId: '',
  wechatAppSecret: ''
})

// 保存状态跟踪
const lastSavedSettings = ref({
  qqLoginEnabled: false,
  wechatLoginEnabled: false,
  qqAppId: '',
  wechatAppId: ''
})

// 检查设置是否有变化
const hasIntegrationChanges = computed(() => {
  return (
    integrationSettings.qqLoginEnabled !== lastSavedSettings.value.qqLoginEnabled ||
    integrationSettings.wechatLoginEnabled !== lastSavedSettings.value.wechatLoginEnabled ||
    integrationSettings.qqAppId !== lastSavedSettings.value.qqAppId ||
    integrationSettings.wechatAppId !== lastSavedSettings.value.wechatAppId
  )
})

// 表单验证规则
const generalRules: FormRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { max: 50, message: '系统名称长度不能超过 50 个字符', trigger: 'blur' }
  ],
  systemDescription: [
    { max: 200, message: '系统描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

const storageRules: FormRules = {
  maxFileSize: [
    { required: true, message: '请输入最大文件大小', trigger: 'blur' }
  ],
  maxUploadFiles: [
    { required: true, message: '请输入最大上传文件数', trigger: 'blur' }
  ],
  thumbnailSize: [
    { required: true, message: '请输入缩略图尺寸', trigger: 'blur' }
  ]
}

const securityRules: FormRules = {
  minPasswordLength: [
    { required: true, message: '请输入密码最小长度', trigger: 'blur' }
  ],
  maxLoginAttempts: [
    { required: true, message: '请输入最大失败次数', trigger: 'blur' }
  ],
  lockoutDuration: [
    { required: true, message: '请输入锁定时间', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' }
  ]
}

// 方法
const handleTabSelect = (index: string) => {
  activeTab.value = index
}

const refreshSettings = async () => {
  loading.value = true
  try {
    await fetchSettings()
    ElMessage.success('设置已刷新')
  } catch (error) {
    ElMessage.error('刷新设置失败')
  } finally {
    loading.value = false
  }
}

const fetchSettings = async () => {
  try {
    const response = await api.get('/admin/settings')
    const settings = response.data.settings || {}
    
    // 更新常规设置
    generalSettings.systemName = settings.system_name?.value || '图库系统'
    generalSettings.systemDescription = settings.system_description?.value || ''
    
    // 更新存储设置
    storageSettings.maxFileSize = parseInt(settings.max_file_size?.value) || 100
    storageSettings.maxUploadFiles = parseInt(settings.max_upload_files?.value) || 10
    storageSettings.allowedImageTypes = settings.allowed_image_types?.value?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'webp']
    storageSettings.allowedVideoTypes = settings.allowed_video_types?.value?.split(',') || ['mp4', 'webm', 'mov']
    storageSettings.thumbnailSize = parseInt(settings.thumbnail_size?.value) || 300
    
    // 更新安全设置
    securitySettings.minPasswordLength = parseInt(settings.min_password_length?.value) || 6
    securitySettings.enableLoginLock = settings.enable_login_lock?.value === 'true'
    securitySettings.maxLoginAttempts = parseInt(settings.max_login_attempts?.value) || 5
    securitySettings.lockoutDuration = parseInt(settings.lockout_duration?.value) || 15
    securitySettings.sessionTimeout = parseInt(settings.session_timeout?.value) || 120
    
    // 更新通知设置
    notificationSettings.enableEmailNotification = settings.enable_email_notification?.value === 'true'
    notificationSettings.smtpHost = settings.smtp_host?.value || ''
    notificationSettings.smtpPort = parseInt(settings.smtp_port?.value) || 587
    notificationSettings.smtpUsername = settings.smtp_username?.value || ''
    notificationSettings.smtpPassword = settings.smtp_password?.value || ''
    notificationSettings.senderEmail = settings.sender_email?.value || ''
    notificationSettings.senderName = settings.sender_name?.value || '图库系统'
    notificationSettings.enableSystemNotification = settings.enable_system_notification?.value === 'true'
    
    // 更新外观设置
    appearanceSettings.themeMode = settings.theme_mode?.value || 'light'
    appearanceSettings.primaryColor = settings.primary_color?.value || '#409EFF'
    appearanceSettings.sidebarWidth = parseInt(settings.sidebar_width?.value) || 240
    appearanceSettings.enableAnimation = settings.enable_animation?.value === 'true'
    appearanceSettings.logoUrl = settings.logo_url?.value || ''
    appearanceSettings.faviconUrl = settings.favicon_url?.value || ''
    
    // 更新第三方集成设置
    integrationSettings.qqLoginEnabled = settings.qq_login_enabled?.value === 'true'
    integrationSettings.qqAppId = settings.qq_app_id?.value || ''
    integrationSettings.qqAppKey = settings.qq_app_key?.value || ''
    integrationSettings.wechatLoginEnabled = settings.wechat_login_enabled?.value === 'true'
    integrationSettings.wechatAppId = settings.wechat_app_id?.value || ''
    integrationSettings.wechatAppSecret = settings.wechat_app_secret?.value || ''
    
    // 更新保存状态
    lastSavedSettings.value = {
      qqLoginEnabled: integrationSettings.qqLoginEnabled,
      wechatLoginEnabled: integrationSettings.wechatLoginEnabled,
      qqAppId: integrationSettings.qqAppId,
      wechatAppId: integrationSettings.wechatAppId
    }
    
  } catch (error) {
    throw error
  }
}

const saveGeneralSettings = async () => {
  if (!generalFormRef.value) return
  
  try {
    await generalFormRef.value.validate()
    saving.value = true
    
    const settings = {
      system_name: generalSettings.systemName,
      system_description: generalSettings.systemDescription
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('常规设置保存成功')
  } catch (error) {
    ElMessage.error('保存常规设置失败')
  } finally {
    saving.value = false
  }
}

const saveStorageSettings = async () => {
  if (!storageFormRef.value) return
  
  try {
    await storageFormRef.value.validate()
    saving.value = true
    
    const settings = {
      max_file_size: storageSettings.maxFileSize.toString(),
      max_upload_files: storageSettings.maxUploadFiles.toString(),
      allowed_image_types: storageSettings.allowedImageTypes.join(','),
      allowed_video_types: storageSettings.allowedVideoTypes.join(','),
      thumbnail_size: storageSettings.thumbnailSize.toString()
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('存储设置保存成功')
  } catch (error) {
    ElMessage.error('保存存储设置失败')
  } finally {
    saving.value = false
  }
}

const saveSecuritySettings = async () => {
  if (!securityFormRef.value) return
  
  try {
    await securityFormRef.value.validate()
    saving.value = true
    
    const settings = {
      min_password_length: securitySettings.minPasswordLength.toString(),
      enable_login_lock: securitySettings.enableLoginLock.toString(),
      max_login_attempts: securitySettings.maxLoginAttempts.toString(),
      lockout_duration: securitySettings.lockoutDuration.toString(),
      session_timeout: securitySettings.sessionTimeout.toString()
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('安全设置保存成功')
  } catch (error) {
    ElMessage.error('保存安全设置失败')
  } finally {
    saving.value = false
  }
}

const saveNotificationSettings = async () => {
  try {
    saving.value = true
    
    const settings = {
      enable_email_notification: notificationSettings.enableEmailNotification.toString(),
      smtp_host: notificationSettings.smtpHost,
      smtp_port: notificationSettings.smtpPort.toString(),
      smtp_username: notificationSettings.smtpUsername,
      smtp_password: notificationSettings.smtpPassword,
      sender_email: notificationSettings.senderEmail,
      sender_name: notificationSettings.senderName,
      enable_system_notification: notificationSettings.enableSystemNotification.toString()
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    ElMessage.error('保存通知设置失败')
  } finally {
    saving.value = false
  }
}

const saveAppearanceSettings = async () => {
  try {
    saving.value = true
    
    const settings = {
      theme_mode: appearanceSettings.themeMode,
      primary_color: appearanceSettings.primaryColor,
      sidebar_width: appearanceSettings.sidebarWidth.toString(),
      enable_animation: appearanceSettings.enableAnimation.toString(),
      logo_url: appearanceSettings.logoUrl,
      favicon_url: appearanceSettings.faviconUrl
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('外观设置保存成功')
  } catch (error) {
    ElMessage.error('保存外观设置失败')
  } finally {
    saving.value = false
  }
}

const saveIntegrationSettings = async () => {
  if (!integrationFormRef.value) return
  
  try {
    await integrationFormRef.value.validate()
    
    // 检查是否有启用的服务需要确认
    const enabledServices = []
    if (integrationSettings.qqLoginEnabled) enabledServices.push('QQ登录')
    if (integrationSettings.wechatLoginEnabled) enabledServices.push('微信登录')
    
    // 如果有启用的服务，显示确认对话框
    if (enabledServices.length > 0) {
      const { ElMessageBox } = await import('element-plus')
      await ElMessageBox.confirm(
        `确定要启用 ${enabledServices.join('、')} 吗？\n\n启用后用户将可以使用这些第三方账号登录系统。`,
        '确认启用第三方登录',
        {
          confirmButtonText: '确定启用',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: false
        }
      )
    }
    
    saving.value = true
    
    // 构建设置对象
    const settings: Record<string, string> = {
      qq_login_enabled: integrationSettings.qqLoginEnabled.toString(),
      wechat_login_enabled: integrationSettings.wechatLoginEnabled.toString()
    }
    
    // 只有当启用时才保存相关配置
    if (integrationSettings.qqLoginEnabled) {
      settings.qq_app_id = integrationSettings.qqAppId
      settings.qq_app_key = integrationSettings.qqAppKey
    } else {
      // 如果禁用，清空相关配置
      settings.qq_app_id = ''
      settings.qq_app_key = ''
    }
    
    if (integrationSettings.wechatLoginEnabled) {
      settings.wechat_app_id = integrationSettings.wechatAppId
      settings.wechat_app_secret = integrationSettings.wechatAppSecret
    } else {
      // 如果禁用，清空相关配置
      settings.wechat_app_id = ''
      settings.wechat_app_secret = ''
    }
    
    console.log('保存第三方集成设置:', settings)
    
    const response = await api.put('/admin/settings', { settings })
    
    if (response.data.success !== false) {
      ElMessage.success('第三方集成设置保存成功')
      
      // 更新保存状态
      lastSavedSettings.value = {
        qqLoginEnabled: integrationSettings.qqLoginEnabled,
        wechatLoginEnabled: integrationSettings.wechatLoginEnabled,
        qqAppId: integrationSettings.qqAppId,
        wechatAppId: integrationSettings.wechatAppId
      }
      
      // 记录保存的设置项
      if (enabledServices.length > 0) {
        ElMessage.info(`已启用: ${enabledServices.join('、')}`)
      } else {
        ElMessage.info('所有第三方登录服务已禁用')
      }
    } else {
      ElMessage.error(response.data.message || '保存第三方集成设置失败')
    }
  } catch (error: any) {
    console.error('保存第三方集成设置失败:', error)
    
    // 如果是用户取消确认对话框，不显示错误
    if (error === 'cancel') {
      return
    }
    
    if (error.response?.data?.errors) {
      // 显示具体的验证错误
      const errors = error.response.data.errors
      ElMessage.error(`设置验证失败: ${errors.join(', ')}`)
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('保存第三方集成设置失败，请检查网络连接')
    }
  } finally {
    saving.value = false
  }
}

// 处理QQ登录开关变化
const handleQQLoginToggle = (value: boolean) => {
  if (!value) {
    integrationSettings.qqAppId = ''
    integrationSettings.qqAppKey = ''
  }
}

// 处理微信登录开关变化
const handleWechatLoginToggle = (value: boolean) => {
  if (!value) {
    integrationSettings.wechatAppId = ''
    integrationSettings.wechatAppSecret = ''
  }
}

// 获取回调URL
const getCallbackUrl = (type: string) => {
  const baseUrl = window.location.origin
  return `${baseUrl}/api/auth/${type}/callback`
}

// 测试QQ连接
const testQQConnection = async () => {
  if (!integrationSettings.qqAppId) {
    ElMessage.warning('请先填写QQ应用ID')
    return
  }
  
  testingQQ.value = true
  try {
    const response = await api.post('/admin/test-connection', {
      type: 'qq',
      appId: integrationSettings.qqAppId,
      appKey: integrationSettings.qqAppKey
    })
    
    if (response.data.success) {
      ElMessage.success('QQ连接测试成功')
    } else {
      ElMessage.error(response.data.message || 'QQ连接测试失败')
    }
  } catch (error) {
    ElMessage.error('QQ连接测试失败，请检查配置')
  } finally {
    testingQQ.value = false
  }
}

// 测试微信连接
const testWechatConnection = async () => {
  if (!integrationSettings.wechatAppId) {
    ElMessage.warning('请先填写微信应用ID')
    return
  }
  
  testingWechat.value = true
  try {
    const response = await api.post('/admin/test-connection', {
      type: 'wechat',
      appId: integrationSettings.wechatAppId,
      appSecret: integrationSettings.wechatAppSecret
    })
    
    if (response.data.success) {
      ElMessage.success('微信连接测试成功')
    } else {
      ElMessage.error(response.data.message || '微信连接测试失败')
    }
  } catch (error) {
    ElMessage.error('微信连接测试失败，请检查配置')
  } finally {
    testingWechat.value = false
  }
}

// 重置第三方集成设置
const resetIntegrationSettings = () => {
  integrationSettings.qqLoginEnabled = false
  integrationSettings.qqAppId = ''
  integrationSettings.qqAppKey = ''
  integrationSettings.wechatLoginEnabled = false
  integrationSettings.wechatAppId = ''
  integrationSettings.wechatAppSecret = ''
  ElMessage.info('第三方集成设置已重置')
}

// 生命周期
onMounted(() => {
  fetchSettings()
})
</script>

<style lang="scss" scoped>
.settings-page {
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

.settings-content {
  .settings-nav-card {
    .settings-menu {
      border: none;
      
      :deep(.el-menu-item) {
        height: 48px;
        line-height: 48px;
        margin-bottom: 4px;
        border-radius: 8px;
        
        &.is-active {
          background-color: #ecf5ff;
          color: #409eff;
        }
        
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
  
  .settings-panel-card {
    .settings-section {
      .section-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e4e7ed;
        
        h3 {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        p {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }
      
      .settings-form {
        max-width: 600px;
        
        .form-unit {
          margin-left: 8px;
          color: #909399;
          font-size: 14px;
        }
        
        .form-description {
          margin-left: 8px;
          color: #909399;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .el-divider {
          margin: 32px 0 24px 0;
          
          .el-divider__text {
            font-weight: 600;
            color: #606266;
            background-color: #f5f7fa;
            padding: 0 16px;
          }
        }
        
        .el-alert {
          margin-top: 12px;
          
          code {
            background-color: #f4f4f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #e6a23c;
          }
          
          p {
            margin: 4px 0;
            line-height: 1.5;
          }
        }
        
        .el-button {
          margin-right: 12px;
          
          &:last-child {
            margin-right: 0;
          }
        }
      }
      
      // 第三方集成特殊样式
      &.integration-section {
        .integration-card {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: #fafafa;
          
          &.qq-card {
            border-left: 4px solid #12b7f5;
          }
          
          &.wechat-card {
            border-left: 4px solid #07c160;
          }
          
          .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            
            .card-icon {
              width: 32px;
              height: 32px;
              margin-right: 12px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              
              &.qq-icon {
                background: linear-gradient(135deg, #12b7f5, #0ea5e9);
              }
              
              &.wechat-icon {
                background: linear-gradient(135deg, #07c160, #06ad56);
              }
            }
            
            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin: 0;
            }
          }
          
          .status-indicator {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            
            &.enabled {
              background-color: #f0f9ff;
              color: #0369a1;
              border: 1px solid #bae6fd;
            }
            
            &.disabled {
              background-color: #fef2f2;
              color: #dc2626;
              border: 1px solid #fecaca;
            }
          }
        }
        
        .test-section {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-top: 24px;
          
          .test-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            
            .el-icon {
              margin-right: 8px;
              color: #3b82f6;
            }
          }
          
          .test-buttons {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
  
  .settings-content {
    .settings-nav-card {
      margin-bottom: 16px;
      
      .settings-menu {
        :deep(.el-menu-item) {
          height: 40px;
          line-height: 40px;
        }
      }
    }
  }
}
</style>
