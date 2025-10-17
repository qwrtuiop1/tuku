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
      <!-- 移动端布局 -->
      <div class="mobile-settings-layout">
        <!-- 移动端导航 -->
        <div class="mobile-settings-nav">
          <el-tabs 
            v-model="activeTab" 
            @tab-change="handleTabSelect" 
            class="mobile-settings-tabs"
            type="card"
            tab-position="top"
            :stretch="false"
          >
            <el-tab-pane label="常规设置" name="general">
              <template #label>
                <div class="tab-label">
                  <el-icon><Setting /></el-icon>
                  <span>常规设置</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="存储设置" name="storage">
              <template #label>
                <div class="tab-label">
                  <el-icon><Folder /></el-icon>
                  <span>存储设置</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="安全设置" name="security">
              <template #label>
                <div class="tab-label">
                  <el-icon><Lock /></el-icon>
                  <span>安全设置</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="通知设置" name="notification">
              <template #label>
                <div class="tab-label">
                  <el-icon><Bell /></el-icon>
                  <span>通知设置</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="外观设置" name="appearance">
              <template #label>
                <div class="tab-label">
                  <el-icon><Monitor /></el-icon>
                  <span>外观设置</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="第三方集成" name="integration">
              <template #label>
                <div class="tab-label">
                  <el-icon><Connection /></el-icon>
                  <span>第三方集成</span>
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="维护设置" name="maintenance">
              <template #label>
                <div class="tab-label">
                  <el-icon><Tools /></el-icon>
                  <span>维护设置</span>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
          
          <!-- 滑动条指示器 -->
          <div class="scroll-indicator" v-if="showScrollIndicator">
            <div class="scroll-track">
              <div 
                class="scroll-thumb" 
                :style="{ 
                  width: scrollThumbWidth + '%', 
                  transform: 'translateX(' + scrollThumbPosition + '%)' 
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 移动端设置内容 -->
        <div class="mobile-settings-content">
          <el-card class="mobile-settings-card">
            <!-- 常规设置 -->
            <div v-if="activeTab === 'general'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Setting /></el-icon>
                  <span>常规设置</span>
                </div>
                <div class="section-description">配置系统基本参数</div>
              </div>
              
              <el-form :model="generalSettings" :rules="generalRules" ref="generalFormRef" label-position="top" class="mobile-settings-form">
                <div class="form-group">
                  <el-form-item label="系统名称" prop="systemName">
                    <el-input v-model="generalSettings.systemName" placeholder="请输入系统名称" />
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="系统描述" prop="systemDescription">
                    <el-input 
                      v-model="generalSettings.systemDescription" 
                      type="textarea"
                      :rows="4"
                      placeholder="请输入系统描述"
                    />
                  </el-form-item>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveGeneralSettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>

            <!-- 存储设置 -->
            <div v-if="activeTab === 'storage'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Folder /></el-icon>
                  <span>存储设置</span>
                </div>
                <div class="section-description">配置文件存储相关参数</div>
              </div>
              
              <el-form :model="storageSettings" :rules="storageRules" ref="storageFormRef" label-position="top" class="mobile-settings-form">
                <div class="form-group">
                  <el-form-item label="最大文件大小" prop="maxFileSize">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="storageSettings.maxFileSize" 
                        :min="1" 
                        :max="1000"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">MB</span>
                    </div>
                    <div class="field-description">单个文件上传的最大大小限制</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="单次上传文件数" prop="maxUploadFiles">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="storageSettings.maxUploadFiles" 
                        :min="1" 
                        :max="50"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">个</span>
                    </div>
                    <div class="field-description">单次最多可以上传的文件数量</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="允许的图片类型">
                    <el-checkbox-group v-model="storageSettings.allowedImageTypes" class="checkbox-group">
                      <el-checkbox label="jpg">JPG</el-checkbox>
                      <el-checkbox label="jpeg">JPEG</el-checkbox>
                      <el-checkbox label="png">PNG</el-checkbox>
                      <el-checkbox label="gif">GIF</el-checkbox>
                      <el-checkbox label="webp">WebP</el-checkbox>
                      <el-checkbox label="svg">SVG</el-checkbox>
                    </el-checkbox-group>
                    <div class="field-description">选择允许上传的图片格式</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="允许的视频类型">
                    <el-checkbox-group v-model="storageSettings.allowedVideoTypes" class="checkbox-group">
                      <el-checkbox label="mp4">MP4</el-checkbox>
                      <el-checkbox label="webm">WebM</el-checkbox>
                      <el-checkbox label="mov">MOV</el-checkbox>
                      <el-checkbox label="avi">AVI</el-checkbox>
                      <el-checkbox label="mkv">MKV</el-checkbox>
                    </el-checkbox-group>
                    <div class="field-description">选择允许上传的视频格式</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="缩略图尺寸" prop="thumbnailSize">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="storageSettings.thumbnailSize" 
                        :min="100" 
                        :max="1000"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">px</span>
                    </div>
                    <div class="field-description">生成缩略图的尺寸</div>
                  </el-form-item>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveStorageSettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeTab === 'security'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Lock /></el-icon>
                  <span>安全设置</span>
                </div>
                <div class="section-description">配置系统安全相关参数</div>
              </div>
              
              <el-form :model="securitySettings" :rules="securityRules" ref="securityFormRef" label-position="top" class="mobile-settings-form">
                <div class="form-group">
                  <el-form-item label="密码最小长度" prop="minPasswordLength">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="securitySettings.minPasswordLength" 
                        :min="6" 
                        :max="20"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">位</span>
                    </div>
                    <div class="field-description">用户密码的最小长度要求</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="登录失败锁定">
                    <el-switch 
                      v-model="securitySettings.enableLoginLock"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                    <div class="field-description">登录失败次数过多时锁定账户</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="securitySettings.enableLoginLock">
                  <el-form-item label="最大失败次数" prop="maxLoginAttempts">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="securitySettings.maxLoginAttempts" 
                        :min="3" 
                        :max="10"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">次</span>
                    </div>
                    <div class="field-description">达到此次数后锁定账户</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="securitySettings.enableLoginLock">
                  <el-form-item label="锁定时间" prop="lockoutDuration">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="securitySettings.lockoutDuration" 
                        :min="5" 
                        :max="60"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">分钟</span>
                    </div>
                    <div class="field-description">账户锁定的持续时间</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="会话超时时间" prop="sessionTimeout">
                    <div class="input-with-unit">
                      <el-input-number 
                        v-model="securitySettings.sessionTimeout" 
                        :min="30" 
                        :max="1440"
                        controls-position="right"
                        class="number-input"
                      />
                      <span class="unit">分钟</span>
                    </div>
                    <div class="field-description">用户会话的超时时间</div>
                  </el-form-item>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveSecuritySettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeTab === 'notification'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Bell /></el-icon>
                  <span>通知设置</span>
                </div>
                <div class="section-description">配置系统通知相关参数</div>
              </div>
              
              <el-form :model="notificationSettings" ref="notificationFormRef" label-position="top" class="mobile-settings-form">
                <div class="form-group">
                  <el-form-item label="邮件通知">
                    <el-switch 
                      v-model="notificationSettings.enableEmailNotification"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                    <div class="field-description">是否启用邮件通知功能</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="notificationSettings.enableEmailNotification">
                  <el-form-item label="SMTP服务器" prop="smtpHost">
                    <el-input v-model="notificationSettings.smtpHost" placeholder="请输入SMTP服务器地址" />
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="notificationSettings.enableEmailNotification">
                  <el-form-item label="SMTP端口" prop="smtpPort">
                    <el-input-number 
                      v-model="notificationSettings.smtpPort" 
                      :min="1" 
                      :max="65535"
                      controls-position="right"
                      class="number-input"
                    />
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="notificationSettings.enableEmailNotification">
                  <el-form-item label="发件人邮箱" prop="senderEmail">
                    <el-input v-model="notificationSettings.senderEmail" placeholder="请输入发件人邮箱" />
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="系统通知">
                    <el-switch 
                      v-model="notificationSettings.enableSystemNotification"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                    <div class="field-description">是否在系统内显示通知</div>
                  </el-form-item>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveNotificationSettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>

            <!-- 外观设置 -->
            <div v-if="activeTab === 'appearance'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Monitor /></el-icon>
                  <span>外观设置</span>
                </div>
                <div class="section-description">配置系统界面外观和主题</div>
              </div>
              
              <el-form :model="appearanceSettings" ref="appearanceFormRef" label-position="top" class="mobile-settings-form">
                <!-- 主题设置组 -->
                <div class="appearance-group">
                  <div class="group-header">
                    <el-icon class="group-icon"><Brush /></el-icon>
                    <span class="group-title">主题配置</span>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="主题模式">
                      <el-radio-group v-model="appearanceSettings.themeMode" class="radio-group">
                        <el-radio label="light" class="theme-radio">
                          <div class="radio-content">
                            <el-icon class="radio-icon"><Sunny /></el-icon>
                            <span>浅色模式</span>
                          </div>
                        </el-radio>
                        <el-radio label="dark" class="theme-radio">
                          <div class="radio-content">
                            <el-icon class="radio-icon"><Moon /></el-icon>
                            <span>深色模式</span>
                          </div>
                        </el-radio>
                        <el-radio label="auto" class="theme-radio">
                          <div class="radio-content">
                            <el-icon class="radio-icon"><Refresh /></el-icon>
                            <span>跟随系统</span>
                          </div>
                        </el-radio>
                      </el-radio-group>
                      <div class="field-description">选择系统主题模式</div>
                    </el-form-item>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="主色调">
                      <div class="color-picker-wrapper">
                        <el-color-picker v-model="appearanceSettings.primaryColor" />
                        <div class="color-preview">
                          <div class="color-sample" :style="{ backgroundColor: appearanceSettings.primaryColor }"></div>
                          <span class="color-value">{{ appearanceSettings.primaryColor }}</span>
                        </div>
                      </div>
                      <div class="field-description">系统的主色调</div>
                    </el-form-item>
                  </div>
                </div>
                
                <!-- 布局设置组 -->
                <div class="appearance-group">
                  <div class="group-header">
                    <el-icon class="group-icon"><Grid /></el-icon>
                    <span class="group-title">布局配置</span>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="侧边栏宽度">
                      <div class="slider-wrapper">
                        <el-slider 
                          v-model="appearanceSettings.sidebarWidth" 
                          :min="200" 
                          :max="300"
                          show-input
                          class="mobile-slider"
                        />
                      </div>
                      <div class="field-description">侧边栏的宽度（200-300px）</div>
                    </el-form-item>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="页面动画">
                      <div class="switch-wrapper">
                        <el-switch 
                          v-model="appearanceSettings.enableAnimation"
                          active-text="开启"
                          inactive-text="关闭"
                          class="animation-switch"
                        />
                        <div class="switch-description">
                          <el-icon class="switch-icon"><MagicStick /></el-icon>
                          <span>页面切换动画效果</span>
                        </div>
                      </div>
                      <div class="field-description">是否启用页面切换动画</div>
                    </el-form-item>
                  </div>
                </div>
                
                <!-- 品牌设置组 -->
                <div class="appearance-group">
                  <div class="group-header">
                    <el-icon class="group-icon"><Picture /></el-icon>
                    <span class="group-title">品牌配置</span>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="系统Logo">
                      <div class="input-wrapper">
                        <el-input 
                          v-model="appearanceSettings.logoUrl" 
                          placeholder="请输入Logo URL"
                          clearable
                          class="url-input"
                        >
                          <template #prefix>
                            <el-icon><Link /></el-icon>
                          </template>
                        </el-input>
                        <div class="logo-preview" v-if="appearanceSettings.logoUrl">
                          <img :src="appearanceSettings.logoUrl" alt="Logo预览" class="preview-image" />
                        </div>
                      </div>
                      <div class="field-description">系统Logo的URL地址</div>
                    </el-form-item>
                  </div>
                  
                  <div class="form-group">
                    <el-form-item label="网站图标">
                      <div class="input-wrapper">
                        <el-input 
                          v-model="appearanceSettings.faviconUrl" 
                          placeholder="请输入Favicon URL"
                          clearable
                          class="url-input"
                        >
                          <template #prefix>
                            <el-icon><Link /></el-icon>
                          </template>
                        </el-input>
                        <div class="favicon-preview" v-if="appearanceSettings.faviconUrl">
                          <img :src="appearanceSettings.faviconUrl" alt="Favicon预览" class="preview-image" />
                        </div>
                      </div>
                      <div class="field-description">网站图标的URL地址</div>
                    </el-form-item>
                  </div>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveAppearanceSettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>

            <!-- 第三方集成设置 -->
            <div v-if="activeTab === 'integration'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Connection /></el-icon>
                  <span>第三方集成</span>
                </div>
                <div class="section-description">配置第三方登录和集成服务</div>
              </div>
              
              <el-form :model="integrationSettings" ref="integrationFormRef" label-position="top" class="mobile-settings-form">
                <!-- QQ登录集成 -->
                <div class="integration-group">
                  <div class="integration-header">
                    <el-icon class="integration-icon"><Connection /></el-icon>
                    <span>QQ登录集成</span>
                  </div>
                
                  <div class="form-group">
                    <el-form-item label="启用QQ登录">
                      <el-switch 
                        v-model="integrationSettings.qqLoginEnabled"
                        active-text="开启"
                        inactive-text="关闭"
                        @change="handleQQLoginToggle"
                      />
                      <div class="field-description">允许用户使用QQ账号登录系统</div>
                    </el-form-item>
                  </div>
                
                  <div class="form-group" v-if="integrationSettings.qqLoginEnabled">
                    <el-form-item 
                      label="QQ应用ID" 
                      prop="qqAppId"
                      :rules="[{ required: true, message: 'QQ应用ID不能为空', trigger: 'blur' }]"
                    >
                      <el-input 
                        v-model="integrationSettings.qqAppId" 
                        placeholder="请输入QQ应用ID"
                        clearable
                      />
                      <div class="field-description">
                        <el-link type="primary" href="https://connect.qq.com/" target="_blank">
                          获取QQ应用ID
                        </el-link>
                      </div>
                    </el-form-item>
                  </div>
                
                  <div class="form-group" v-if="integrationSettings.qqLoginEnabled">
                    <el-form-item 
                      label="QQ应用密钥" 
                      prop="qqAppKey"
                      :rules="[{ required: true, message: 'QQ应用密钥不能为空', trigger: 'blur' }]"
                    >
                      <el-input 
                        v-model="integrationSettings.qqAppKey" 
                        type="password"
                        placeholder="请输入QQ应用密钥"
                        show-password
                        clearable
                      />
                      <div class="field-description">QQ应用的密钥，用于验证应用身份</div>
                    </el-form-item>
                  </div>
                
                  <div class="form-group" v-if="integrationSettings.qqLoginEnabled">
                    <el-alert
                      title="QQ登录配置说明"
                      type="info"
                      :closable="false"
                      show-icon
                      class="config-alert"
                    >
                      <template #default>
                        <p>1. 在QQ互联平台创建应用并获取App ID和App Key</p>
                        <p>2. 设置回调地址为：<code>{{ getCallbackUrl('qq') }}</code></p>
                        <p>3. 确保应用状态为"已上线"</p>
                      </template>
                    </el-alert>
                  </div>
                </div>

                <!-- 微信登录集成 -->
                <div class="integration-group">
                  <div class="integration-header">
                    <el-icon class="integration-icon"><Connection /></el-icon>
                    <span>微信登录集成</span>
                  </div>
                
                  <div class="form-group">
                    <el-form-item label="启用微信登录">
                      <el-switch 
                        v-model="integrationSettings.wechatLoginEnabled"
                        active-text="开启"
                        inactive-text="关闭"
                        @change="handleWechatLoginToggle"
                      />
                      <div class="field-description">允许用户使用微信账号登录系统</div>
                    </el-form-item>
                  </div>
                
                  <div class="form-group" v-if="integrationSettings.wechatLoginEnabled">
                    <el-form-item 
                      label="微信应用ID" 
                      prop="wechatAppId"
                      :rules="[{ required: true, message: '微信应用ID不能为空', trigger: 'blur' }]"
                    >
                      <el-input 
                        v-model="integrationSettings.wechatAppId" 
                        placeholder="请输入微信应用ID"
                        clearable
                      />
                      <div class="field-description">
                        <el-link type="primary" href="https://developers.weixin.qq.com/" target="_blank">
                          获取微信应用ID
                        </el-link>
                      </div>
                    </el-form-item>
                  </div>
                
                  <div class="form-group" v-if="integrationSettings.wechatLoginEnabled">
                    <el-form-item 
                      label="微信应用密钥" 
                      prop="wechatAppSecret"
                      :rules="[{ required: true, message: '微信应用密钥不能为空', trigger: 'blur' }]"
                    >
                      <el-input 
                        v-model="integrationSettings.wechatAppSecret" 
                        type="password"
                        placeholder="请输入微信应用密钥"
                        show-password
                        clearable
                      />
                      <div class="field-description">微信应用的密钥，用于验证应用身份</div>
                    </el-form-item>
                  </div>
                </div>
                
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
                <div class="form-group">
                  <el-form-item label="测试连接">
                    <div class="test-buttons">
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
                      >
                        <el-icon><Connection /></el-icon>
                        测试微信连接
                      </el-button>
                    </div>
                    <div class="field-description">测试第三方登录配置是否正确</div>
                  </el-form-item>
                </div>
                
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

            <!-- 维护设置 -->
            <div v-if="activeTab === 'maintenance'" class="mobile-settings-section">
              <div class="mobile-section-header">
                <div class="section-title">
                  <el-icon class="section-icon"><Tools /></el-icon>
                  <span>维护设置</span>
                </div>
                <div class="section-description">配置系统维护相关参数</div>
              </div>
              
              <el-form :model="maintenanceSettings" :rules="maintenanceRules" ref="maintenanceFormRef" label-position="top" class="mobile-settings-form">
                <div class="form-group">
                  <el-form-item label="维护模式">
                    <el-switch 
                      v-model="maintenanceSettings.maintenanceMode"
                      active-text="开启"
                      inactive-text="关闭"
                      @change="handleMaintenanceModeToggle"
                    />
                    <div class="field-description">开启后，非管理员用户将无法访问系统</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="maintenanceSettings.maintenanceMode">
                  <el-form-item 
                    label="维护消息" 
                    prop="maintenanceMessage"
                  >
                    <el-input 
                      v-model="maintenanceSettings.maintenanceMessage" 
                      type="textarea"
                      :rows="4"
                      placeholder="请输入维护提示消息"
                      maxlength="500"
                      show-word-limit
                    />
                    <div class="field-description">维护模式下显示给用户的提示信息</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="自动备份">
                    <el-switch 
                      v-model="maintenanceSettings.backupEnabled"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                    <div class="field-description">定期自动备份系统数据</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="maintenanceSettings.backupEnabled">
                  <el-form-item 
                    label="备份频率" 
                    prop="backupFrequency"
                  >
                    <el-select v-model="maintenanceSettings.backupFrequency" placeholder="请选择备份频率">
                      <el-option label="每小时" value="hourly" />
                      <el-option label="每天" value="daily" />
                      <el-option label="每周" value="weekly" />
                    </el-select>
                    <div class="field-description">选择数据备份的频率</div>
                  </el-form-item>
                </div>
                
                <div class="form-group" v-if="maintenanceSettings.backupEnabled">
                  <el-form-item 
                    label="备份保留天数" 
                    prop="backupRetentionDays"
                  >
                    <el-input-number 
                      v-model="maintenanceSettings.backupRetentionDays" 
                      :min="1" 
                      :max="365"
                      controls-position="right"
                    />
                    <div class="field-description">备份文件的保留时间（1-365天）</div>
                  </el-form-item>
                </div>
                
                <div class="form-group">
                  <el-form-item label="自动清理日志">
                    <el-switch 
                      v-model="maintenanceSettings.autoCleanLogs"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                    <div class="field-description">定期清理过期的系统日志</div>
                  </el-form-item>
                </div>
                
                <div class="form-actions">
                  <div class="button-container">
                    <el-button type="primary" @click="saveMaintenanceSettings" :loading="saving" class="save-btn">
                      <el-icon><Check /></el-icon>
                      保存设置
                    </el-button>
                  </div>
                  
                  <div class="button-container">
                    <el-button 
                      type="warning" 
                      @click="testMaintenanceMode"
                      :disabled="!maintenanceSettings.maintenanceMode"
                      class="test-btn"
                    >
                      <el-icon><Tools /></el-icon>
                      测试维护模式
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>
          </el-card>
        </div>
      </div>
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
const maintenanceFormRef = ref<FormInstance>()

// 滑动条相关状态
const showScrollIndicator = ref(false)
const scrollThumbWidth = ref(0)
const scrollThumbPosition = ref(0)

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
  logoUrl: '/logo.png',
  faviconUrl: '/logo.png'
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

// 维护设置
const maintenanceSettings = reactive({
  maintenanceMode: false,
  maintenanceMessage: '',
  backupEnabled: false,
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  autoCleanLogs: false
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

const maintenanceRules: FormRules = {
  maintenanceMessage: [
    { max: 500, message: '维护消息不能超过500个字符', trigger: 'blur' }
  ],
  backupFrequency: [
    { required: true, message: '请选择备份频率', trigger: 'change' }
  ],
  backupRetentionDays: [
    { required: true, message: '请输入备份保留天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '备份保留天数必须在1-365天之间', trigger: 'blur' }
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
    const settings = response.data.settings
    
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
    appearanceSettings.logoUrl = settings.logo_url?.value || '/logo.png'
    appearanceSettings.faviconUrl = settings.favicon_url?.value || '/logo.png'
    
    // 更新第三方集成设置
    integrationSettings.qqLoginEnabled = settings.qq_login_enabled?.value === 'true'
    integrationSettings.qqAppId = settings.qq_app_id?.value || ''
    integrationSettings.qqAppKey = settings.qq_app_key?.value || ''
    integrationSettings.wechatLoginEnabled = settings.wechat_login_enabled?.value === 'true'
    integrationSettings.wechatAppId = settings.wechat_app_id?.value || ''
    integrationSettings.wechatAppSecret = settings.wechat_app_secret?.value || ''
    
    // 更新维护设置
    maintenanceSettings.maintenanceMode = settings.maintenance_mode?.value === 'true'
    maintenanceSettings.maintenanceMessage = settings.maintenance_message?.value || ''
    maintenanceSettings.backupEnabled = settings.backup_enabled?.value === 'true'
    maintenanceSettings.backupFrequency = settings.backup_frequency?.value || 'daily'
    maintenanceSettings.backupRetentionDays = parseInt(settings.backup_retention_days?.value) || 30
    maintenanceSettings.autoCleanLogs = settings.auto_clean_logs?.value === 'true'
    
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
  } catch (error: any) {
    if (error.response?.data?.message) {
      ElMessage.error(`保存失败: ${error.response.data.message}`)
    } else if (error.response?.data?.errors) {
      ElMessage.error(`验证失败: ${error.response.data.errors.join(', ')}`)
    } else {
      ElMessage.error('保存安全设置失败，请检查网络连接')
    }
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
    
    // 保存第三方集成设置
    
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
    // 保存第三方集成设置失败
    
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

// 维护设置相关方法
const handleMaintenanceModeToggle = (value: boolean) => {
  if (value) {
    ElMessage.warning('开启维护模式后，非管理员用户将无法访问系统')
  }
}

const saveMaintenanceSettings = async () => {
  if (!maintenanceFormRef.value) return
  
  try {
    await maintenanceFormRef.value.validate()
    saving.value = true
    
    const settings = {
      maintenance_mode: maintenanceSettings.maintenanceMode.toString(),
      maintenance_message: maintenanceSettings.maintenanceMessage,
      backup_enabled: maintenanceSettings.backupEnabled.toString(),
      backup_frequency: maintenanceSettings.backupFrequency,
      backup_retention_days: maintenanceSettings.backupRetentionDays.toString(),
      auto_clean_logs: maintenanceSettings.autoCleanLogs.toString()
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('维护设置保存成功')
  } catch (error) {
    ElMessage.error('保存维护设置失败')
  } finally {
    saving.value = false
  }
}

const testMaintenanceMode = async () => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm(
      '测试维护模式将模拟非管理员用户的访问体验。确定要继续吗？',
      '测试维护模式',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 在新窗口中打开维护页面
    const maintenanceUrl = `${window.location.origin}/maintenance`
    window.open(maintenanceUrl, '_blank')
    
    ElMessage.success('已在新窗口中打开维护页面')
  } catch (error) {
    // 用户取消
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

// 滑动条相关方法
const updateScrollIndicator = () => {
  const navScroll = document.querySelector('.mobile-settings-tabs .el-tabs__nav-scroll')
  if (!navScroll) return
  
  const nav = navScroll.querySelector('.el-tabs__nav')
  if (!nav) return
  
  const scrollWidth = navScroll.scrollWidth
  const clientWidth = navScroll.clientWidth
  
  // 判断是否需要显示滑动条
  showScrollIndicator.value = scrollWidth > clientWidth
  
  if (showScrollIndicator.value) {
    // 计算滑动条宽度
    scrollThumbWidth.value = Math.max((clientWidth / scrollWidth) * 100, 20)
    
    // 计算滑动条位置
    const scrollLeft = navScroll.scrollLeft
    const maxScrollLeft = scrollWidth - clientWidth
    if (maxScrollLeft > 0) {
      scrollThumbPosition.value = (scrollLeft / maxScrollLeft) * (100 - scrollThumbWidth.value)
    } else {
      scrollThumbPosition.value = 0
    }
  } else {
    // 重置滑动条状态
    scrollThumbWidth.value = 0
    scrollThumbPosition.value = 0
  }
}

const handleTabScroll = () => {
  updateScrollIndicator()
}

// 生命周期
onMounted(() => {
  fetchSettings()
  
  // 延迟更新滑动条，确保DOM已渲染
  setTimeout(() => {
    updateScrollIndicator()
    
    // 监听滚动事件
    const navScroll = document.querySelector('.mobile-settings-tabs .el-tabs__nav-scroll')
    if (navScroll) {
      navScroll.addEventListener('scroll', handleTabScroll)
    }
  }, 100)
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

// ==================== 移动端设置页面样式 ====================
.mobile-settings-layout {
  padding: 0 8px;
  
  .mobile-settings-nav {
    margin-bottom: 20px;
    
    .mobile-settings-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        padding: 0;
        overflow: hidden;
      }
      
      :deep(.el-tabs__nav-wrap) {
        padding: 0;
        overflow: hidden;
        
        &.is-scrollable {
          .el-tabs__nav-prev,
          .el-tabs__nav-next {
            display: none;
          }
        }
      }
      
      :deep(.el-tabs__nav-scroll) {
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
      
      :deep(.el-tabs__nav) {
        display: flex;
        flex-wrap: nowrap;
        gap: 0;
        min-width: max-content;
        padding: 8px 0; // Remove horizontal padding to eliminate right space
        width: 100%; // Ensure full width usage
      }
      
      :deep(.el-tabs__item) {
        flex: 0 0 auto;
        min-width: 100px;
        max-width: 120px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        color: #606266;
        border: none;
        background: transparent;
        transition: all 0.3s ease;
        white-space: nowrap;
        margin-right: 4px;
        
        &:last-child {
          margin-right: 0;
        }
        
        &.is-active {
          background: #f0f9ff;
          color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        }
        
        &:hover {
          background: #f5f7fa;
          color: #409eff;
        }
      }
      
      .tab-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-height: 40px;
        justify-content: center;
        
        .el-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        
        span {
          font-size: 11px;
          line-height: 1.2;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
      }
      
      // 滑动条指示器样式
      .scroll-indicator {
        margin-top: 12px;
        padding: 0 8px;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        
        .scroll-track {
          width: 100%;
          height: 8px;
          background: #e4e7ed;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          border: 1px solid #d3d4d6;
          
          .scroll-thumb {
            height: 100%;
            background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
            border-radius: 4px;
            transition: all 0.3s ease;
            position: absolute;
            top: 0;
            left: 0;
            min-width: 40px;
            box-shadow: 0 2px 4px rgba(64, 158, 255, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.3);
            
            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 2px;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 1px;
            }
          }
        }
      }
    }
  }
  
  .mobile-settings-content {
    padding: 0 16px;
    
    .mobile-settings-card {
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e4e7ed;
      
      :deep(.el-card__body) {
        padding: 20px;
      }
    }
    
    .mobile-settings-section {
      .mobile-section-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f2f5;
        
        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          .section-icon {
            font-size: 20px;
            color: #409eff;
            margin-right: 12px;
          }
          
          span {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .section-description {
          font-size: 14px;
          color: #909399;
          margin-left: 32px;
          line-height: 1.4;
        }
      }
      
      .mobile-settings-form {
        .form-group {
          margin-bottom: 24px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .el-form-item {
            margin-bottom: 0;
            
            :deep(.el-form-item__label) {
              font-size: 15px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 8px;
              line-height: 1.4;
            }
            
            :deep(.el-form-item__content) {
              .el-input {
                :deep(.el-input__wrapper) {
                  border-radius: 12px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                  border: 1px solid #dcdfe6;
                  transition: all 0.3s ease;
                  height: 48px;
                  
                  &:hover {
                    border-color: #c0c4cc;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  
                  &.is-focus {
                    border-color: #409eff;
                    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
                  }
                  
                  .el-input__inner {
                    height: 46px;
                    font-size: 15px;
                    padding: 0 16px;
                    color: #303133;
                    
                    &::placeholder {
                      color: #c0c4cc;
                      font-size: 14px;
                    }
                  }
                }
              }
              
              .el-textarea {
                :deep(.el-textarea__inner) {
                  border-radius: 12px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                  border: 1px solid #dcdfe6;
                  transition: all 0.3s ease;
                  font-size: 15px;
                  padding: 12px 16px;
                  color: #303133;
                  
                  &:hover {
                    border-color: #c0c4cc;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  
                  &:focus {
                    border-color: #409eff;
                    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
                  }
                  
                  &::placeholder {
                    color: #c0c4cc;
                    font-size: 14px;
                  }
                }
              }
              
              .input-with-unit {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .number-input {
                  flex: 1;
                  
                  :deep(.el-input__wrapper) {
                    height: 48px;
                    
                    .el-input__inner {
                      height: 46px;
                      font-size: 15px;
                      text-align: center;
                    }
                  }
                }
                
                .unit {
                  font-size: 14px;
                  color: #909399;
                  font-weight: 500;
                  min-width: 24px;
                }
              }
              
              .checkbox-group {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                
                .el-checkbox {
                  margin-right: 0;
                  
                  :deep(.el-checkbox__label) {
                    font-size: 14px;
                    color: #606266;
                    padding-left: 8px;
                  }
                }
              }
              
              .el-switch {
                :deep(.el-switch__core) {
                  border-radius: 20px;
                  height: 24px;
                  width: 48px;
                  
                  &::after {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                  }
                }
              }
              
              .field-description {
                margin-top: 8px;
                font-size: 13px;
                color: #909399;
                line-height: 1.4;
              }
            }
          }
        }
        
        .form-actions {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #f0f2f5;
          display: flex;
          flex-direction: column;
          gap: 12px; // Add gap between button containers
          
          .button-container {
            width: 100%;
            
            .save-btn {
              width: 100%;
              height: 48px;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 600;
              background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
              border: none;
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
              transition: all 0.3s ease;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
              }
              
              &:active {
                transform: translateY(0);
              }
              
              .el-icon {
                margin-right: 8px;
                font-size: 16px;
              }
            }
            
            .test-btn {
              width: 100%;
              height: 48px;
              border-radius: 12px;
              font-size: 15px;
              font-weight: 600;
              background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
              border: none;
              box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
              transition: all 0.3s ease;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(230, 162, 60, 0.4);
              }
              
              &:active {
                transform: translateY(0);
              }
              
              .el-icon {
                margin-right: 8px;
                font-size: 16px;
              }
            }
          }
        }
      }
    }
    
    // 移动端专用样式
    .radio-group {
      :deep(.el-radio) {
        margin-right: 16px;
        margin-bottom: 8px;
        
        .el-radio__label {
          font-size: 14px;
        }
      }
    }
    
    .color-picker-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px; // Increase gap to prevent button from covering text
      width: 100%; // Ensure full width
      
      :deep(.el-color-picker) {
        align-self: flex-start; // Align to start instead of center
        margin: 0; // Remove any default margins
        
        .el-color-picker__trigger {
          width: 56px; // Further increase size for better touch target
          height: 56px;
          border-radius: 16px; // More rounded corners
          border: 2px solid #e4e7ed;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 8px; // Add bottom margin to create space
          
          &:hover {
            border-color: #409eff;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
          }
          
          &:active {
            transform: scale(0.98);
          }
          
          .el-color-picker__color {
            border-radius: 14px; // Match the trigger border radius
            
            .el-color-picker__color-inner {
              border-radius: 12px; // Inner radius
            }
          }
        }
      }
      
      .field-description {
        margin-top: 8px; // Add top margin for additional spacing
        font-size: 13px;
        color: #909399;
        line-height: 1.5; // Increase line height for better readability
        padding-top: 4px; // Add padding top for extra space
      }
    }
    
    .slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px; // Increase gap between slider and description
      width: 100%; // Ensure full width
      
      :deep(.el-slider) {
        width: 100%; // Ensure slider takes full width
        display: flex;
        flex-direction: column; // Change to vertical layout
        gap: 16px; // Increase gap between runway and input
        
        .el-slider__runway {
          height: 12px; // Further increase height for better visibility
          border-radius: 6px;
          background: #e4e7ed; // Make background more visible
          border: 2px solid #d3d4d6; // Add stronger border
          order: 1; // Ensure runway comes first
          margin-bottom: 12px; // Increase bottom margin
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); // Add inner shadow
        }
        
        .el-slider__bar {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
          box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3); // Add shadow
        }
        
        .el-slider__button {
          width: 32px; // Further increase button size
          height: 32px;
          border: 4px solid #409eff; // Increase border width
          background: #ffffff;
          box-shadow: 0 3px 12px rgba(64, 158, 255, 0.4); // Increase shadow
          transition: all 0.3s ease;
          border-radius: 50%; // Ensure circular shape
          
          &:hover {
            transform: scale(1.15);
            box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
          }
          
          &:active {
            transform: scale(1.05);
          }
        }
        
        .el-slider__input {
          width: 100%; // Make input full width
          margin-left: 0; // Remove left margin
          order: 2; // Ensure input comes second
          display: flex;
          justify-content: center; // Center the input
          
          .el-input-number__controls {
            display: none; // Hide controls for cleaner look
          }
          
          .el-input__wrapper {
            border-radius: 10px; // Increase border radius
            border: 2px solid #e4e7ed; // Increase border width
            transition: all 0.3s ease;
            width: 140px; // Increase input width
            margin: 0 auto; // Center the input
            padding: 8px 12px; // Add padding
            
            &:hover {
              border-color: #409eff;
            }
            
            &:focus-within {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
            }
          }
        }
      }
      
      .field-description {
        margin-top: 12px; // Increase top margin
        font-size: 14px; // Increase font size
        color: #909399;
        line-height: 1.6; // Increase line height
        padding-top: 8px; // Increase padding top
        text-align: center; // Center the text
      }
    }
    
    .integration-group {
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      
      .integration-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e9ecef;
        
        .integration-icon {
          font-size: 18px;
          color: #409eff;
        }
        
        span {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
    
    // 外观设置组样式
    .appearance-group {
      margin-bottom: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 16px;
      border: 1px solid #e4e7ed;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
      }
      
      .group-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e4e7ed;
        
        .group-icon {
          margin-right: 10px;
          font-size: 18px;
          color: #409eff;
          background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .group-title {
          font-size: 16px;
          font-weight: 700;
          color: #303133;
          letter-spacing: 0.5px;
        }
      }
      
      // 主题单选按钮样式
      .theme-radio {
        margin-bottom: 20px; // Further increase bottom margin
        width: 100%; // Ensure full width
        
        :deep(.el-radio__label) {
          padding-left: 8px;
          width: 100%; // Ensure full width
        }
        
        :deep(.el-radio__input) {
          margin-right: 0; // Remove right margin
        }
        
        .radio-content {
          display: flex;
          align-items: center;
          padding: 20px 24px; // Further increase padding
          border-radius: 16px; // Increase border radius
          background: #ffffff;
          border: 2px solid #e4e7ed;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%; // Ensure full width
          min-height: 64px; // Increase minimum height
          margin-top: 8px; // Add top margin
          
          &:hover {
            border-color: #409eff;
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(64, 158, 255, 0.2);
          }
          
          .radio-icon {
            margin-right: 16px; // Further increase icon margin
            font-size: 22px; // Further increase icon size
            color: #409eff;
          }
          
          span {
            font-size: 16px; // Further increase font size
            font-weight: 600;
            color: #303133;
          }
        }
        
        :deep(.el-radio__input.is-checked) {
          .radio-content {
            border-color: #409eff;
            background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
            color: #ffffff;
            
            .radio-icon,
            span {
              color: #ffffff;
            }
          }
        }
      }
      
      // 主题模式表单项样式
      :deep(.el-form-item) {
        margin-bottom: 24px; // Increase form item margin
        
        .el-form-item__label {
          font-size: 16px; // Increase label font size
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px; // Add bottom margin
        }
        
        .field-description {
          margin-top: 16px; // Increase top margin
          font-size: 14px; // Increase font size
          color: #909399;
          line-height: 1.6;
          padding: 12px 16px; // Add padding
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #409eff;
        }
      }
      
      // 颜色预览样式
      .color-preview {
        display: flex;
        align-items: center;
        margin-top: 12px;
        padding: 12px;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e4e7ed;
        
        .color-sample {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid #e4e7ed;
          margin-right: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .color-value {
          font-size: 13px;
          font-weight: 600;
          color: #606266;
          font-family: 'Courier New', monospace;
        }
      }
      
      // 开关包装器样式
      .switch-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .animation-switch {
          align-self: flex-start;
        }
        
        .switch-description {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e4e7ed;
          
          .switch-icon {
            margin-right: 8px;
            font-size: 16px;
            color: #409eff;
          }
          
          span {
            font-size: 13px;
            color: #606266;
            font-weight: 500;
          }
        }
      }
      
      // 输入包装器样式
      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .url-input {
          :deep(.el-input__wrapper) {
            border-radius: 12px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #409eff;
            }
            
            &:focus-within {
              border-color: #409eff;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
            }
          }
        }
        
        .logo-preview,
        .favicon-preview {
          display: flex;
          justify-content: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e4e7ed;
          
          .preview-image {
            max-width: 120px;
            max-height: 60px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            object-fit: contain;
          }
        }
        
        .favicon-preview .preview-image {
          max-width: 32px;
          max-height: 32px;
        }
      }
    }
    
    .test-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .el-button {
        width: 100%;
        height: 44px;
        font-size: 14px;
        margin: 0; // Remove any default margins
        
        .el-icon {
          margin-right: 6px;
        }
      }
    }
    
    .config-alert {
      margin-top: 12px;
      width: 100%; // Ensure full width
      
      :deep(.el-alert__content) {
        width: 100%; // Ensure content takes full width
        
        .el-alert__title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .el-alert__description {
          width: 100%; // Ensure description takes full width
          
          p {
            margin: 4px 0;
            font-size: 13px;
            line-height: 1.6; // Increase line height for better readability
            word-wrap: break-word; // Allow text to wrap
            overflow-wrap: break-word; // Modern browsers
            
            code {
              background: #f0f2f5;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              color: #e6a23c;
              word-break: break-all; // Break long URLs
            }
          }
        }
      }
    }
    
    .test-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
      border: none;
      box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
      transition: all 0.3s ease;
      margin-top: 12px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(230, 162, 60, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
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
