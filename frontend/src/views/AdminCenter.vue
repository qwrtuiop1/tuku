<template>
  <div class="admin-center-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">管理中心</h1>
          <p class="page-subtitle">系统管理、监控和日志中心</p>
        </div>
        <div class="header-actions">
          <el-button @click="refreshAllData" :loading="refreshing">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="admin-center-content">
      <el-row :gutter="24">
        <!-- 左侧导航 -->
        <el-col :xs="24" :sm="8" :md="6" :lg="5" :xl="4">
          <el-card class="admin-nav-card">
            <el-menu
              v-model="activeSection"
              class="admin-menu"
              @select="handleSectionSelect"
            >
              <el-menu-item index="overview">
                <el-icon><DataBoard /></el-icon>
                <span>系统概览</span>
              </el-menu-item>
              <el-menu-item index="users">
                <el-icon><UserFilled /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
              <el-menu-item index="logs">
                <el-icon><Document /></el-icon>
                <span>系统日志</span>
              </el-menu-item>
              <el-menu-item index="storage">
                <el-icon><Folder /></el-icon>
                <span>存储管理</span>
              </el-menu-item>
              <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧内容面板 -->
        <el-col :xs="24" :sm="16" :md="18" :lg="19" :xl="20">
          <el-card class="admin-panel-card">
            <!-- 系统概览 -->
            <div v-if="activeSection === 'overview'" class="admin-section">
              <div class="section-header">
                <h3>系统概览</h3>
                <p>系统整体运行状态和统计数据</p>
              </div>
              
              <!-- 统计卡片 -->
              <el-row :gutter="16" class="stats-cards">
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card">
                    <div class="stat-icon users">
                      <el-icon><UserFilled /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ systemStats.totalUsers }}</div>
                      <div class="stat-label">总用户数</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon"><ArrowUp /></el-icon>
                        <span class="trend-text">活跃用户</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card">
                    <div class="stat-icon files">
                      <el-icon><Folder /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ systemStats.totalFiles }}</div>
                      <div class="stat-label">总文件数</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon"><ArrowUp /></el-icon>
                        <span class="trend-text">存储文件</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                
                <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card">
                    <div class="stat-icon storage">
                      <el-icon><DataBoard /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ formatFileSize(systemStats.totalStorage) }}</div>
                      <div class="stat-label">总存储量</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon"><ArrowUp /></el-icon>
                        <span class="trend-text">已使用</span>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
                
              <!-- 快速操作 -->
              <div class="quick-actions">
                <h4>快速操作</h4>
                <el-row :gutter="12">
                <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
                    <el-button class="quick-action-btn" @click="activeSection = 'users'">
                      <el-icon><UserFilled /></el-icon>
                      <span>用户管理</span>
                    </el-button>
                  </el-col>
                  <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
                    <el-button class="quick-action-btn" @click="activeSection = 'logs'">
                      <el-icon><Document /></el-icon>
                      <span>系统日志</span>
                    </el-button>
                  </el-col>
                  <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
                    <el-button class="quick-action-btn" @click="activeSection = 'settings'">
                      <el-icon><Setting /></el-icon>
                      <span>系统设置</span>
                    </el-button>
                  </el-col>
                  <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
                    <el-button class="quick-action-btn" @click="refreshAllData">
                      <el-icon><Refresh /></el-icon>
                      <span>刷新数据</span>
                    </el-button>
                </el-col>
              </el-row>
              </div>
            </div>

            <!-- 用户管理 -->
            <div v-if="activeSection === 'users'" class="admin-section">
              <div class="section-header">
                <h3>用户管理</h3>
                <p>管理系统用户和权限</p>
              </div>
              
              <!-- 用户搜索和筛选 -->
              <div class="user-filters">
                <el-form :model="userFilter" inline>
                  <el-form-item label="搜索用户">
                    <el-input
                      v-model="userFilter.search"
                      placeholder="用户名或邮箱"
                      clearable
                      style="width: 200px"
                      @keyup.enter="searchUsers"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  
                  <el-form-item label="角色">
                    <el-select v-model="userFilter.role" placeholder="选择角色" clearable style="width: 120px">
                      <el-option label="全部" value="" />
                      <el-option label="管理员" value="admin" />
                      <el-option label="用户" value="user" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="状态">
                    <el-select v-model="userFilter.status" placeholder="选择状态" clearable style="width: 120px">
                      <el-option label="全部" value="" />
                      <el-option label="正常" value="active" />
                      <el-option label="已禁用" value="disabled" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="searchUsers" :loading="refreshing">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="resetUserFilter">
                      <el-icon><Refresh /></el-icon>
                      重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 用户操作栏 -->
              <div class="user-actions">
                <div class="action-left">
                <el-button type="primary" @click="showCreateUserDialog = true">
                  <el-icon><Plus /></el-icon>
                  创建用户
                </el-button>
                <el-button @click="batchDeleteUsers" :disabled="selectedUsers.length === 0">
                  <el-icon><Delete /></el-icon>
                  批量删除
                  </el-button>
                </div>
              </div>
              
              <!-- 用户列表 -->
              <el-table
                :data="users"
                style="width: 100%; table-layout: fixed;"
                @selection-change="handleUserSelectionChange"
                v-loading="refreshing"
                empty-text="暂无用户数据"
                :row-key="(row) => row.id"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="username" label="用户名" width="140">
                  <template #default="{ row }">
                    <div class="user-info">
                      <el-avatar :size="32" :src="row.avatar_url">
                        {{ row.username?.charAt(0).toUpperCase() }}
                      </el-avatar>
                      <span class="username-text">{{ row.username || '未知用户' }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="120">
                  <template #default="{ row }">
                    <span class="email-text">{{ row.email || '未设置' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="role" label="角色" width="60">
                  <template #default="{ row }">
                    <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
                      {{ row.role === 'admin' ? '管理员' : '用户' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag 
                      :type="getStatusTagType(row.status)" 
                      size="small"
                    >
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="存储使用" width="120">
                  <template #default="{ row }">
                    <div class="storage-info">
                      <el-progress
                        :percentage="Math.round(((row.used_storage || 0) / (row.storage_limit || 1)) * 100)"
                        :stroke-width="6"
                        :show-text="false"
                        :color="getStorageProgressColor(row.used_storage, row.storage_limit)"
                      />
                      <span class="storage-text">
                        {{ formatFileSize(row.used_storage || 0) }} / {{ formatFileSize(row.storage_limit || 0) }}
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="created_at" label="注册时间" width="100">
                  <template #default="{ row }">
                    <span class="time-text">{{ formatTimestamp(row.created_at) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="60" fixed="right">
                  <template #default="{ row }">
                    <el-dropdown 
                      @command="(command) => handleUserAction(command, row)" 
                      @visible-change="(visible) => handleMenuToggle(visible, row)"
                      trigger="click"
                      :hide-on-click="true">
                      <el-button 
                        type="text" 
                        size="small" 
                        @click="toggleMenu(row)"
                        :class="{ 'menu-open': isMenuOpen(row) }">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="toggleRole">
                            <el-icon><User /></el-icon>
                            {{ row.role === 'admin' ? '取消管理员' : '设为管理员' }}
                          </el-dropdown-item>
                          <el-dropdown-item command="toggleStatus">
                            <el-icon><Switch /></el-icon>
                            {{ row.status === 'active' ? '禁用用户' : '启用用户' }}
                          </el-dropdown-item>
                          <el-dropdown-item command="manageStorage">
                            <el-icon><Folder /></el-icon>
                            管理存储
                          </el-dropdown-item>
                          <el-dropdown-item command="resetPassword">
                            <el-icon><Key /></el-icon>
                            重置密码
                          </el-dropdown-item>
                          <el-dropdown-item command="forceLogout">
                            <el-icon><Switch /></el-icon>
                            强制登出
                          </el-dropdown-item>
                          <el-dropdown-item command="delete" divided>
                            <el-icon><Delete /></el-icon>
                            删除用户
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
            </div>


            <!-- 系统日志 -->
            <div v-if="activeSection === 'logs'" class="admin-section">
              <div class="section-header">
                <h3>系统日志</h3>
                <p>查看和管理系统运行日志</p>
              </div>
              
              <!-- 日志筛选 -->
              <div class="log-filters">
                <el-form :model="logFilter" inline>
                  <el-form-item label="日志级别">
                    <el-select 
                      v-model="logFilter.level" 
                      placeholder="选择级别" 
                      clearable
                      style="width: 120px"
                    >
                      <el-option label="全部" value="" />
                      <el-option label="错误" value="error" />
                      <el-option label="警告" value="warning" />
                      <el-option label="信息" value="info" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="关键词">
                    <el-input
                      v-model="logFilter.keyword"
                      placeholder="搜索日志内容"
                      clearable
                      style="width: 200px"
                      @keyup.enter="searchLogs"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="searchLogs" :loading="refreshing">
                      <el-icon><Search /></el-icon>
                      搜索
                    </el-button>
                    <el-button @click="exportLogs">
                      <el-icon><Download /></el-icon>
                      导出日志
                    </el-button>
                    <el-button @click="clearLogs" :loading="refreshing">
                      <el-icon><Delete /></el-icon>
                      清空日志
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 日志列表 -->
              <el-table 
                :data="filteredLogs" 
                style="width: 100%" 
                height="400"
                v-loading="refreshing"
                empty-text="暂无日志数据"
              >
                <el-table-column prop="timestamp" label="时间" width="180">
                  <template #default="{ row }">
                    <span class="timestamp-text">{{ formatTimestamp(row.timestamp) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getLevelType(row.level)" size="small">
                      {{ getLevelText(row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="source" label="来源" width="120">
                  <template #default="{ row }">
                    <el-tag size="small" type="info">
                      {{ row.source || '系统' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="message" label="消息" min-width="200">
                  <template #default="{ row }">
                    <div class="message-content">
                      {{ row.message || '无消息内容' }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 存储管理 -->
            <div v-if="activeSection === 'storage'" class="admin-section">
              <div class="section-header">
                <h3>存储管理</h3>
                <p>管理系统存储空间和使用情况</p>
              </div>
              
              <!-- 存储统计 -->
              <el-row :gutter="16" class="storage-stats">
                <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                  <el-card class="storage-stat-card">
                    <div class="stat-content">
                      <div class="stat-icon total">
                        <el-icon><DataBoard /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ formatFileSize(storageStats.totalStorage) }}</div>
                        <div class="stat-label">总存储空间</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                  <el-card class="storage-stat-card">
                    <div class="stat-content">
                      <div class="stat-icon used">
                        <el-icon><Folder /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ formatFileSize(storageStats.usedStorage) }}</div>
                        <div class="stat-label">已使用空间</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                  <el-card class="storage-stat-card">
                    <div class="stat-content">
                      <div class="stat-icon available">
                        <el-icon><CircleCheck /></el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ formatFileSize(storageStats.availableStorage) }}</div>
                        <div class="stat-label">可用空间</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
              
              <!-- 存储使用率 -->
              <el-card class="storage-usage-card">
                <template #header>
                  <div class="card-header">
                    <span>存储使用率</span>
                    <el-button @click="refreshStorageStats" :loading="refreshing" size="small">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-button>
                  </div>
                </template>
                
                <div class="usage-content">
                  <el-progress
                    :percentage="storageUsagePercentage"
                    :stroke-width="20"
                    :color="getStorageUsageColor(storageUsagePercentage)"
                    :show-text="true"
                    text-inside
                  />
                  <div class="usage-details">
                    <span class="usage-text">
                      已使用 {{ formatFileSize(storageStats.usedStorage) }} / {{ formatFileSize(storageStats.totalStorage) }}
                    </span>
                  </div>
                </div>
              </el-card>
              
              <!-- 存储操作 -->
              <el-card class="storage-actions-card">
                <template #header>
                  <span>存储操作</span>
                </template>
                
                <div class="action-buttons">
                  <el-button type="primary" @click="showCleanupDialog = true">
                    <el-icon><Delete /></el-icon>
                    清理存储
                  </el-button>
                  <el-button @click="showStorageAnalysis">
                    <el-icon><DataAnalysis /></el-icon>
                    存储分析
                  </el-button>
                  <el-button @click="exportStorageReport">
                    <el-icon><Download /></el-icon>
                    导出报告
                  </el-button>
                </div>
              </el-card>
            </div>

            <!-- 系统设置 -->
            <div v-if="activeSection === 'settings'" class="admin-section">
              <div class="section-header">
                <h3>系统设置</h3>
                <p>配置系统参数和功能</p>
              </div>
              
              <el-form label-width="120px" class="system-settings-form">
                <!-- 基本设置 -->
                <el-divider content-position="left">
                  <el-icon><Setting /></el-icon>
                  基本设置
                </el-divider>
                
                <el-form-item label="系统名称">
                  <el-input 
                    v-model="systemSettings.systemName" 
                    placeholder="请输入系统名称"
                    clearable
                    maxlength="50"
                    show-word-limit
                  >
                    <template #prefix>
                      <el-icon><Setting /></el-icon>
                    </template>
                  </el-input>
                  <div class="form-description">显示在页面标题和登录页面的系统名称</div>
                </el-form-item>
                
                <!-- 用户管理设置 -->
                <el-divider content-position="left">
                  <el-icon><User /></el-icon>
                  用户管理
                </el-divider>
                
                <el-form-item label="允许注册">
                  <el-switch 
                    v-model="systemSettings.allowRegistration"
                    active-text="允许"
                    inactive-text="禁止"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                  />
                  <div class="form-description">是否允许新用户注册，关闭后只能由管理员创建用户</div>
                </el-form-item>
                
                <el-form-item label="维护模式">
                  <el-switch 
                    v-model="systemSettings.maintenanceMode"
                    active-text="开启"
                    inactive-text="关闭"
                    active-color="#ff4949"
                    inactive-color="#13ce66"
                  />
                  <div class="form-description">开启后只有管理员可以访问系统，普通用户将看到维护页面</div>
                </el-form-item>
                
                <!-- 文件上传设置 -->
                <el-divider content-position="left">
                  <el-icon><Upload /></el-icon>
                  文件上传
                </el-divider>
                
                <el-form-item label="最大文件大小">
                  <el-input-number 
                    v-model="systemSettings.maxFileSize" 
                    :min="1" 
                    :max="1000"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">MB</span>
                  <div class="form-description">单个文件上传的最大大小限制，建议不超过100MB</div>
                </el-form-item>
                
                <el-form-item label="单次上传数量">
                  <el-input-number 
                    v-model="systemSettings.maxUploadFiles" 
                    :min="1" 
                    :max="50"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">个</span>
                  <div class="form-description">单次最多可以上传的文件数量</div>
                </el-form-item>
                
                <el-form-item label="允许的图片类型">
                  <el-checkbox-group v-model="systemSettings.allowedImageTypes">
                    <el-checkbox label="jpg">JPG</el-checkbox>
                    <el-checkbox label="jpeg">JPEG</el-checkbox>
                    <el-checkbox label="png">PNG</el-checkbox>
                    <el-checkbox label="gif">GIF</el-checkbox>
                    <el-checkbox label="webp">WebP</el-checkbox>
                    <el-checkbox label="svg">SVG</el-checkbox>
                  </el-checkbox-group>
                  <div class="form-description">选择允许上传的图片格式，至少选择一种格式</div>
                </el-form-item>
                
                <el-form-item label="允许的视频类型">
                  <el-checkbox-group v-model="systemSettings.allowedVideoTypes">
                    <el-checkbox label="mp4">MP4</el-checkbox>
                    <el-checkbox label="webm">WebM</el-checkbox>
                    <el-checkbox label="mov">MOV</el-checkbox>
                    <el-checkbox label="avi">AVI</el-checkbox>
                  </el-checkbox-group>
                  <div class="form-description">选择允许上传的视频格式</div>
                </el-form-item>
                
                <!-- 系统优化设置 -->
                <el-divider content-position="left">
                  <el-icon><Tools /></el-icon>
                  系统优化
                </el-divider>
                
                <el-form-item label="缩略图尺寸">
                  <el-input-number 
                    v-model="systemSettings.thumbnailSize" 
                    :min="100" 
                    :max="800"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">px</span>
                  <div class="form-description">生成缩略图的尺寸，影响加载速度和存储空间</div>
                </el-form-item>
                
                <el-form-item label="自动清理日志">
                  <el-switch 
                    v-model="systemSettings.autoCleanLogs"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <div class="form-description">自动清理30天前的系统日志</div>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveSystemSettings" :loading="savingSettings">
                    <el-icon><Setting /></el-icon>
                    保存设置
                  </el-button>
                  <el-button @click="fetchSystemSettings" :loading="loadingSettings">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                  <el-button type="warning" @click="showSettingsPreview">
                    <el-icon><View /></el-icon>
                    预览效果
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="showCreateUserDialog"
      title="创建用户"
      width="500px"
    >
      <el-form :model="newUser" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUser.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUser.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="newUser.role" placeholder="选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateUserDialog = false">取消</el-button>
        <el-button type="primary" @click="createUser" :loading="creatingUser">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  DataBoard,
  UserFilled,
  Document,
  Setting,
  Plus,
  Delete,
  ArrowDown,
  ArrowUp,
  Folder,
  Search,
  User,
  Switch,
  MoreFilled,
  Key,
  CircleCheck,
  DataAnalysis,
  Download,
  Refresh
} from '@element-plus/icons-vue'
import { formatFileSize } from '@/utils/helpers'
import api from '@/utils/api'

// 响应式数据
const activeSection = ref('overview')
const refreshing = ref(false)
const savingSettings = ref(false)
const loadingSettings = ref(false)
const creatingUser = ref(false)
const showCreateUserDialog = ref(false)
const selectedUsers = ref([])
const userFormRef = ref<FormInstance>()
const openMenus = ref<Set<number>>(new Set()) // 跟踪打开的菜单
const showCleanupDialog = ref(false)

// 表格宽度调整
const adjustTableWidth = () => {
  nextTick(() => {
    const tables = document.querySelectorAll('.el-table')
    tables.forEach(table => {
      const tableElement = table as HTMLElement
      
      const bodyWrapper = tableElement.querySelector('.el-table__body-wrapper') as HTMLElement
      if (bodyWrapper) {
        bodyWrapper.style.width = '100%'
        bodyWrapper.style.marginRight = '0px'
        bodyWrapper.style.paddingRight = '0px'
      }
      
      const headerWrapper = tableElement.querySelector('.el-table__header-wrapper') as HTMLElement
      if (headerWrapper) {
        headerWrapper.style.width = '100%'
        headerWrapper.style.marginRight = '0px'
        headerWrapper.style.paddingRight = '0px'
      }
      
      const innerWrapper = tableElement.querySelector('.el-table__inner-wrapper') as HTMLElement
      if (innerWrapper) {
        innerWrapper.style.width = '100%'
        innerWrapper.style.marginRight = '0px'
        innerWrapper.style.paddingRight = '0px'
      }
    })
  })
}

// 同步滚动功能
const setupSyncScroll = () => {
  nextTick(() => {
    const tables = document.querySelectorAll('.el-table')
    tables.forEach(table => {
      const tableElement = table as HTMLElement
      
      // 获取表头和表体的滚动容器
      const headerWrapper = tableElement.querySelector('.el-table__header-wrapper') as HTMLElement
      const bodyWrapper = tableElement.querySelector('.el-table__body-wrapper') as HTMLElement
      
      if (headerWrapper && bodyWrapper) {
        // 强制设置表头和表体宽度一致
        const tableWidth = tableElement.offsetWidth
        headerWrapper.style.width = `${tableWidth}px`
        bodyWrapper.style.width = `${tableWidth}px`
        
        // 强制设置表头和表体的表格宽度一致
        const headerTable = headerWrapper.querySelector('table') as HTMLElement
        const bodyTable = bodyWrapper.querySelector('table') as HTMLElement
        
        if (headerTable && bodyTable) {
          headerTable.style.width = `${tableWidth}px`
          bodyTable.style.width = `${tableWidth}px`
        }
        
        // 防止循环滚动的标志
        let isScrolling = false
        
        // 同步滚动函数
        const syncScroll = (source: HTMLElement, target: HTMLElement) => {
          if (isScrolling) return
          isScrolling = true
          
          const scrollLeft = source.scrollLeft
          
          // 直接设置目标元素的scrollLeft
          target.scrollLeft = scrollLeft
          
          // 同步固定列的滚动
          const fixedRightHeader = tableElement.querySelector('.el-table__fixed-right .el-table__fixed-header-wrapper') as HTMLElement
          const fixedRightBody = tableElement.querySelector('.el-table__fixed-right .el-table__fixed-body-wrapper') as HTMLElement
          
          if (fixedRightHeader) {
            fixedRightHeader.scrollLeft = scrollLeft
          }
          if (fixedRightBody) {
            fixedRightBody.scrollLeft = scrollLeft
          }
          
          // 强制同步所有滚动容器
          const allScrollContainers = tableElement.querySelectorAll('.el-scrollbar__wrap')
          allScrollContainers.forEach(container => {
            if (container !== source) {
              (container as HTMLElement).scrollLeft = scrollLeft
            }
          })
          
          // 使用requestAnimationFrame确保滚动完成
          requestAnimationFrame(() => {
            isScrolling = false
          })
        }
        
        // 表头滚动时，同步表体滚动
        headerWrapper.addEventListener('scroll', (e) => {
          if (!isScrolling) {
            isScrolling = true
            bodyWrapper.scrollLeft = e.target.scrollLeft
            setTimeout(() => { isScrolling = false }, 10)
          }
        })
        
        // 表体滚动时，同步表头滚动
        bodyWrapper.addEventListener('scroll', (e) => {
          if (!isScrolling) {
            isScrolling = true
            headerWrapper.scrollLeft = e.target.scrollLeft
            setTimeout(() => { isScrolling = false }, 10)
          }
        })
        
        // 监听滚动条滚动
        const headerScrollbar = headerWrapper.querySelector('.el-scrollbar__wrap')
        const bodyScrollbar = bodyWrapper.querySelector('.el-scrollbar__wrap')
        
        if (headerScrollbar) {
          headerScrollbar.addEventListener('scroll', (e) => {
            if (!isScrolling) {
              isScrolling = true
              if (bodyScrollbar) {
                bodyScrollbar.scrollLeft = e.target.scrollLeft
              }
              setTimeout(() => { isScrolling = false }, 10)
            }
          })
        }
        
        if (bodyScrollbar) {
          bodyScrollbar.addEventListener('scroll', (e) => {
            if (!isScrolling) {
              isScrolling = true
              if (headerScrollbar) {
                headerScrollbar.scrollLeft = e.target.scrollLeft
              }
              setTimeout(() => { isScrolling = false }, 10)
            }
          })
        }
        
        // 监听固定列的滚动
        const fixedRightHeader = tableElement.querySelector('.el-table__fixed-right .el-table__fixed-header-wrapper') as HTMLElement
        const fixedRightBody = tableElement.querySelector('.el-table__fixed-right .el-table__fixed-body-wrapper') as HTMLElement
        
        if (fixedRightHeader) {
          fixedRightHeader.addEventListener('scroll', () => {
            if (isScrolling) return
            isScrolling = true
            
            const scrollLeft = fixedRightHeader.scrollLeft
            headerWrapper.scrollLeft = scrollLeft
            bodyWrapper.scrollLeft = scrollLeft
            if (fixedRightBody) {
              fixedRightBody.scrollLeft = scrollLeft
            }
            
            requestAnimationFrame(() => {
              isScrolling = false
            })
          })
        }
        
        if (fixedRightBody) {
          fixedRightBody.addEventListener('scroll', () => {
            if (isScrolling) return
            isScrolling = true
            
            const scrollLeft = fixedRightBody.scrollLeft
            headerWrapper.scrollLeft = scrollLeft
            bodyWrapper.scrollLeft = scrollLeft
            if (fixedRightHeader) {
              fixedRightHeader.scrollLeft = scrollLeft
            }
            
            requestAnimationFrame(() => {
              isScrolling = false
            })
          })
        }
        
        // 使用MutationObserver监听DOM变化，确保固定列正确创建
        const observer = new MutationObserver(() => {
          const fixedRight = tableElement.querySelector('.el-table__fixed-right')
          if (fixedRight) {
            const fixedRightHeader = fixedRight.querySelector('.el-table__fixed-header-wrapper') as HTMLElement
            const fixedRightBody = fixedRight.querySelector('.el-table__fixed-body-wrapper') as HTMLElement
            
            if (fixedRightHeader && !fixedRightHeader.hasAttribute('data-sync-attached')) {
              fixedRightHeader.setAttribute('data-sync-attached', 'true')
              fixedRightHeader.addEventListener('scroll', () => {
                if (isScrolling) return
                isScrolling = true
                
                const scrollLeft = fixedRightHeader.scrollLeft
                headerWrapper.scrollLeft = scrollLeft
                bodyWrapper.scrollLeft = scrollLeft
                if (fixedRightBody) {
                  fixedRightBody.scrollLeft = scrollLeft
                }
                
                requestAnimationFrame(() => {
                  isScrolling = false
                })
              })
            }
            
            if (fixedRightBody && !fixedRightBody.hasAttribute('data-sync-attached')) {
              fixedRightBody.setAttribute('data-sync-attached', 'true')
              fixedRightBody.addEventListener('scroll', () => {
                if (isScrolling) return
                isScrolling = true
                
                const scrollLeft = fixedRightBody.scrollLeft
                headerWrapper.scrollLeft = scrollLeft
                bodyWrapper.scrollLeft = scrollLeft
                if (fixedRightHeader) {
                  fixedRightHeader.scrollLeft = scrollLeft
                }
                
                requestAnimationFrame(() => {
                  isScrolling = false
                })
              })
            }
          }
        })
        
        observer.observe(tableElement, {
          childList: true,
          subtree: true
        })
      }
    })
  })
}

// 系统统计数据
const systemStats = reactive({
  totalUsers: 0,
  totalFiles: 0,
  totalStorage: 0
})

// 存储统计数据
const storageStats = reactive({
  totalStorage: 0,
  usedStorage: 0,
  availableStorage: 0
})

// 用户数据
const users = ref([])

// 日志数据
const logs = ref([])

// 日志筛选
const logFilter = reactive({
  level: '',
  keyword: ''
})

// 用户筛选
const userFilter = reactive({
  search: '',
  role: '',
  status: ''
})

// 系统设置
const systemSettings = reactive({
  systemName: '图库系统',
  allowRegistration: true,
  maintenanceMode: false,
  maxFileSize: 100,
  maxUploadFiles: 10,
  allowedImageTypes: ['jpg', 'png', 'gif', 'webp'],
  allowedVideoTypes: ['mp4', 'webm', 'mov'],
  thumbnailSize: 300,
  autoCleanLogs: false
})

// 新用户表单
const newUser = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

// 表单验证规则
const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度必须在2-20个字符之间', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: '用户名只能包含中文、字母、数字、下划线和空格', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.includes('@')) {
          callback(new Error('用户名不能使用邮箱格式'));
        } else if (value && value.trim().length === 0) {
          callback(new Error('用户名不能只包含空格'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 计算属性
const filteredLogs = computed(() => {
  let result = logs.value

  if (logFilter.level) {
    result = result.filter(log => log.level === logFilter.level)
  }

  if (logFilter.keyword) {
    const keyword = logFilter.keyword.toLowerCase()
    result = result.filter(log => 
      log.message.toLowerCase().includes(keyword) ||
      log.source.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 存储使用率计算
const storageUsagePercentage = computed(() => {
  if (storageStats.totalStorage === 0) return 0
  return Math.round((storageStats.usedStorage / storageStats.totalStorage) * 100)
})

// 定时器
let refreshTimer: NodeJS.Timeout | null = null

// 方法
const handleSectionSelect = (index: string) => {
  activeSection.value = index
}

const refreshAllData = async () => {
  // 防止重复刷新
  if (refreshing.value) {
    ElMessage.warning('正在刷新中，请稍候...')
    return
  }
  
  refreshing.value = true
  try {
    // 串行获取数据，避免并发请求过多
    await fetchSystemStats()
    await fetchUsers()
    await fetchLogs()
    await fetchSystemSettings()
    await fetchStorageStats()
    
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    refreshing.value = false
  }
}

// 获取系统统计数据
const fetchSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats')
    const data = response.data
    
    systemStats.totalUsers = data.total_users || 0
    systemStats.totalFiles = data.total_files || 0
    systemStats.totalStorage = data.total_file_size || 0
  } catch (error) {
    throw error
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    case 'suspended':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '正常'
    case 'inactive':
      return '已禁用'
    case 'suspended':
      return '已暂停'
    default:
      return '未知'
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await api.get('/admin/users')
    users.value = response.data.users || []
    // 调整表格宽度
    adjustTableWidth()
    // 设置同步滚动
    setupSyncScroll()
  } catch (error) {
    throw error
  }
}

// 获取系统日志
const fetchLogs = async () => {
  try {
    const response = await api.get('/admin/logs')
    logs.value = response.data.logs || []
  } catch (error) {
    throw error
  }
}

// 获取系统设置
const fetchSystemSettings = async () => {
  loadingSettings.value = true
  try {
    const response = await api.get('/admin/settings')
    const settings = response.data.settings || {}
    
    // 更新系统设置
    systemSettings.systemName = settings.system_name?.value || '图库系统'
    systemSettings.allowRegistration = settings.enable_registration?.value === 'true'
    systemSettings.maintenanceMode = settings.maintenance_mode?.value === 'true'
    systemSettings.maxFileSize = parseInt(settings.max_file_size?.value) || 100
    systemSettings.maxUploadFiles = parseInt(settings.max_upload_files?.value) || 10
    systemSettings.allowedImageTypes = settings.allowed_image_types?.value?.split(',') || ['jpg', 'png', 'gif', 'webp']
    systemSettings.allowedVideoTypes = settings.allowed_video_types?.value?.split(',') || ['mp4', 'webm', 'mov']
    systemSettings.thumbnailSize = parseInt(settings.thumbnail_size?.value) || 300
    systemSettings.autoCleanLogs = settings.auto_clean_logs?.value === 'true'
  } catch (error) {
    ElMessage.error('获取系统设置失败')
    throw error
  } finally {
    loadingSettings.value = false
  }
}

// 获取存储统计数据
const fetchStorageStats = async () => {
  try {
    const response = await api.get('/admin/storage-stats')
    const data = response.data
    
    storageStats.totalStorage = data.total_storage || 0
    storageStats.usedStorage = data.used_storage || 0
    storageStats.availableStorage = data.available_storage || 0
  } catch (error) {
    console.error('获取存储统计失败:', error)
    // 如果API不存在，使用系统统计数据
    storageStats.totalStorage = systemStats.totalStorage
    storageStats.usedStorage = systemStats.totalStorage
    storageStats.availableStorage = 0
  }
}

// 刷新存储统计
const refreshStorageStats = async () => {
  try {
    await fetchStorageStats()
    ElMessage.success('存储统计已刷新')
  } catch (error) {
    ElMessage.error('刷新存储统计失败')
  }
}

// 获取存储使用率颜色
const getStorageUsageColor = (percentage: number) => {
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

// 显示存储分析
const showStorageAnalysis = () => {
  ElMessageBox.alert(
    `
    <div style="text-align: left;">
      <h4>存储分析报告：</h4>
      <p><strong>总存储空间：</strong>${formatFileSize(storageStats.totalStorage)}</p>
      <p><strong>已使用空间：</strong>${formatFileSize(storageStats.usedStorage)}</p>
      <p><strong>可用空间：</strong>${formatFileSize(storageStats.availableStorage)}</p>
      <p><strong>使用率：</strong>${storageUsagePercentage.value}%</p>
      <hr style="margin: 10px 0;">
      <p><strong>建议：</strong></p>
      <p>${storageUsagePercentage.value >= 90 ? '⚠️ 存储空间严重不足，建议立即清理' : 
         storageUsagePercentage.value >= 70 ? '⚠️ 存储空间使用率较高，建议定期清理' : 
         '✅ 存储空间使用正常'}</p>
    </div>
    `,
    '存储分析',
    {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true
    }
  )
}

// 导出存储报告
const exportStorageReport = () => {
  const report = {
    timestamp: new Date().toLocaleString(),
    totalStorage: storageStats.totalStorage,
    usedStorage: storageStats.usedStorage,
    availableStorage: storageStats.availableStorage,
    usagePercentage: storageUsagePercentage.value,
    totalUsers: systemStats.totalUsers,
    totalFiles: systemStats.totalFiles
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `storage-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('存储报告已导出')
}


const handleUserSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 菜单状态管理
const toggleMenu = (user: any) => {
  const userId = user.id
  if (openMenus.value.has(userId)) {
    openMenus.value.delete(userId)
  } else {
    // 关闭其他所有菜单
    openMenus.value.clear()
    openMenus.value.add(userId)
  }
}

const isMenuOpen = (user: any) => {
  return openMenus.value.has(user.id)
}

const handleMenuToggle = (visible: boolean, user: any) => {
  const userId = user.id
  if (visible) {
    // 关闭其他所有菜单
    openMenus.value.clear()
    openMenus.value.add(userId)
  } else {
    openMenus.value.delete(userId)
  }
}

// 点击外部区域关闭所有菜单
const closeAllMenus = () => {
  openMenus.value.clear()
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // 如果点击的不是下拉菜单相关元素，关闭所有菜单
    if (!target.closest('.el-dropdown') && !target.closest('.el-dropdown-menu')) {
      closeAllMenus()
    }
  })
})

const handleUserAction = async (command: string, user: any) => {
  // 执行操作后关闭菜单
  closeAllMenus()
  
  try {
  switch (command) {
    case 'toggleRole':
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        const roleText = newRole === 'admin' ? '管理员' : '普通用户'
        
        await ElMessageBox.confirm(
          `确定要将用户 "${user.username}" 设置为${roleText}吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'custom-message-box'
          }
        )
        
        await toggleUserRole(user)
      break
        
    case 'toggleStatus':
        const newStatus = user.status === 'active' ? 'inactive' : 'active'
        const statusText = newStatus === 'active' ? '启用' : '禁用'
        
        await ElMessageBox.confirm(
          `确定要${statusText}用户 "${user.username}" 吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'custom-message-box'
          }
        )
        
        await toggleUserStatus(user)
      break
        
    case 'manageStorage':
        await manageUserStorage(user)
      break
        
    case 'resetPassword':
        await resetUserPassword(user)
      break
        
    case 'forceLogout':
        await forceUserLogout(user)
      break
        
    case 'delete':
        await ElMessageBox.confirm(
          `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
          '危险操作',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'error',
            customClass: 'custom-message-box custom-danger-box',
            confirmButtonClass: 'el-button--danger'
          }
        )
        
        await deleteUser(user)
        ElMessage.success('用户已删除')
      break
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('操作已取消')
    } else {
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 切换用户角色
const toggleUserRole = async (user: any) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await api.put(`/admin/users/${user.id}/role`, { role: newRole })
    
    // 更新本地数据
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
    
    ElMessage.success(`用户角色已更新为${newRole === 'admin' ? '管理员' : '普通用户'}`)
  } catch (error) {
    ElMessage.error('切换用户角色失败')
    throw error
  }
}

// 切换用户状态
const toggleUserStatus = async (user: any) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await api.put(`/admin/users/${user.id}/status`, { status: newStatus })
    
    // 更新本地数据
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus
    }
    
    ElMessage.success(`用户状态已更新为${newStatus === 'active' ? '正常' : '已禁用'}`)
  } catch (error) {
    ElMessage.error('切换用户状态失败')
    throw error
  }
}

// 管理用户存储
const manageUserStorage = async (user: any) => {
  try {
    // 创建自定义对话框
    const { value: formData } = await ElMessageBox({
      title: '管理用户存储',
      message: `
        <div style="text-align: left;">
          <p><strong>当前用户：</strong>${user.username}</p>
          <p><strong>当前存储限制：</strong>${formatFileSize(user.storage_limit || 0)}</p>
          <p><strong>已使用存储：</strong>${formatFileSize(user.used_storage || 0)}</p>
          <hr style="margin: 15px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">新的存储限制：</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input id="storage-value" type="number" placeholder="请输入数值" 
                     style="flex: 1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px;" 
                     min="1" step="0.1">
              <select id="storage-unit" style="padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px;">
                <option value="MB">MB</option>
                <option value="GB" selected>GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>
          <div style="color: #909399; font-size: 12px;">
            <p>💡 提示：</p>
            <p>• MB: 兆字节 (1MB = 1,048,576 字节)</p>
            <p>• GB: 千兆字节 (1GB = 1,073,741,824 字节)</p>
            <p>• TB: 太字节 (1TB = 1,099,511,627,776 字节)</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          const valueInput = document.getElementById('storage-value') as HTMLInputElement
          const unitSelect = document.getElementById('storage-unit') as HTMLSelectElement
          
          if (!valueInput.value || parseFloat(valueInput.value) <= 0) {
            ElMessage.error('请输入有效的存储数值')
            return
          }
          
          const value = parseFloat(valueInput.value)
          const unit = unitSelect.value
          
          // 转换为字节
          let bytes = 0
          switch (unit) {
            case 'MB':
              bytes = value * 1024 * 1024
              break
            case 'GB':
              bytes = value * 1024 * 1024 * 1024
              break
            case 'TB':
              bytes = value * 1024 * 1024 * 1024 * 1024
              break
          }
          
          // 检查是否小于已使用存储
          if (bytes < (user.used_storage || 0)) {
            ElMessage.error(`新容量不能小于已使用容量 (${formatFileSize(user.used_storage || 0)})`)
            return
          }
          
          instance.confirmButtonLoading = true
          
          // 调用API更新存储限制
          api.put(`/admin/users/${user.id}/storage`, { storage_limit: Math.floor(bytes) })
            .then(() => {
              // 更新本地数据
              const userIndex = users.value.findIndex(u => u.id === user.id)
              if (userIndex !== -1) {
                users.value[userIndex].storage_limit = Math.floor(bytes)
              }
              
              ElMessage.success(`用户存储限制已更新为 ${value} ${unit}`)
              done()
            })
            .catch(error => {
              ElMessage.error('更新存储限制失败')
              instance.confirmButtonLoading = false
            })
        } else {
          done()
        }
      }
    })
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('管理用户存储失败')
    }
  }
}

// 重置用户密码
const resetUserPassword = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.username}" 的密码吗？\n\n重置后用户需要使用新密码登录。`,
      '重置密码确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const { value: newPassword } = await ElMessageBox.prompt(
      `请输入用户 "${user.username}" 的新密码:`,
      '设置新密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^.{6,}$/,
        inputErrorMessage: '密码长度至少6位'
      }
    )
    
    await api.put(`/admin/users/${user.id}/password`, { password: newPassword })
    ElMessage.success('用户密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

// 强制用户登出
const forceUserLogout = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要强制用户 "${user.username}" 登出吗？\n\n这将清除该用户的所有登录会话。`,
      '强制登出确认',
      {
        confirmButtonText: '确定登出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await api.post(`/admin/users/${user.id}/logout`)
    ElMessage.success('用户已被强制登出')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('强制登出失败')
    }
  }
}

// 删除用户
const deleteUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？\n\n此操作将删除：\n- 用户的所有文件\n- 用户的所有文件夹\n- 用户的登录记录\n- 相关的系统日志\n\n此操作不可撤销！`,
      '删除用户确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    await api.delete(`/admin/users/${user.id}`)
    
    // 从本地数据中移除
    users.value = users.value.filter(u => u.id !== user.id)
    
    ElMessage.success(`用户 "${user.username}" 已删除`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败')
    }
  }
}

const batchDeleteUsers = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？\n\n此操作将删除：\n- 用户的所有文件\n- 用户的所有文件夹\n- 用户的登录记录\n- 相关的系统日志\n\n此操作不可撤销！`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    const userIds = selectedUsers.value.map(user => user.id)
    await api.delete('/admin/users/batch', { data: { user_ids: userIds } })
    
    // 从本地数据中移除已删除的用户
    users.value = users.value.filter(user => !userIds.includes(user.id))
    selectedUsers.value = []
    
    ElMessage.success(`已成功删除 ${userIds.length} 个用户`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除用户失败')
    }
  }
}

// 搜索用户
const searchUsers = async () => {
  if (refreshing.value) {
    ElMessage.warning('正在刷新中，请稍候...')
    return
  }
  
  try {
    const params: any = {}
    if (userFilter.search) params.search = userFilter.search
    if (userFilter.role) params.role = userFilter.role
    if (userFilter.status) params.status = userFilter.status
    
    const response = await api.get('/admin/users', { params })
    users.value = response.data.users || []
    
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索用户失败')
  }
}

// 重置用户筛选
const resetUserFilter = async () => {
  if (refreshing.value) {
    ElMessage.warning('正在刷新中，请稍候...')
    return
  }
  
  userFilter.search = ''
  userFilter.role = ''
  userFilter.status = ''
  
  try {
    await fetchUsers()
    ElMessage.success('筛选已重置')
  } catch (error) {
    ElMessage.error('重置筛选失败')
  }
}


const createUser = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    creatingUser.value = true
    
    // 调用管理员创建用户API
    await api.post('/admin/users', {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role
    })
    
    ElMessage.success('用户创建成功')
    showCreateUserDialog.value = false
    
    // 清空表单
    Object.assign(newUser, {
      username: '',
      email: '',
      password: '',
      role: 'user'
    })
    
    // 刷新用户列表
    await fetchUsers()
  } catch (error) {
    ElMessage.error('创建用户失败')
  } finally {
    creatingUser.value = false
  }
}

const searchLogs = async () => {
  if (refreshing.value) {
    ElMessage.warning('正在刷新中，请稍候...')
    return
  }
  
  try {
    const params: any = {}
    if (logFilter.level) {
      params.level = logFilter.level
    }
    
    const response = await api.get('/admin/logs', { params })
    logs.value = response.data.logs || []
    
    ElMessage.success('日志搜索完成')
  } catch (error) {
    ElMessage.error('搜索日志失败')
  }
}

const clearLogs = async () => {
  if (refreshing.value) {
    ElMessage.warning('正在刷新中，请稍候...')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete('/admin/logs')
    logs.value = []
    ElMessage.success('日志已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空日志失败')
    }
  }
}

// 导出日志
const exportLogs = () => {
  if (logs.value.length === 0) {
    ElMessage.warning('没有日志数据可导出')
    return
  }
  
  const logData = logs.value.map(log => ({
    时间: formatTimestamp(log.timestamp),
    级别: getLevelText(log.level),
    来源: log.source || '系统',
    消息: log.message || '无消息内容',
    用户ID: log.user_id || '系统'
  }))
  
  // 创建CSV内容
  const headers = ['时间', '级别', '来源', '消息', '用户ID']
  const csvContent = [
    headers.join(','),
    ...logData.map(row => 
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success(`已导出 ${logs.value.length} 条日志记录`)
}

const saveSystemSettings = async () => {
  // 验证设置
  if (systemSettings.allowedImageTypes.length === 0) {
    ElMessage.error('至少需要选择一种图片格式')
    return
  }
  
  if (systemSettings.systemName.trim().length === 0) {
    ElMessage.error('系统名称不能为空')
    return
  }
  
  savingSettings.value = true
  try {
    const settings = {
      system_name: systemSettings.systemName.trim(),
      enable_registration: systemSettings.allowRegistration.toString(),
      maintenance_mode: systemSettings.maintenanceMode.toString(),
      max_file_size: systemSettings.maxFileSize.toString(),
      max_upload_files: systemSettings.maxUploadFiles.toString(),
      allowed_image_types: systemSettings.allowedImageTypes.join(','),
      allowed_video_types: systemSettings.allowedVideoTypes.join(','),
      thumbnail_size: systemSettings.thumbnailSize.toString(),
      auto_clean_logs: systemSettings.autoCleanLogs.toString()
    }
    
    await api.put('/admin/settings', { settings })
    ElMessage.success('系统设置保存成功')
    
    // 如果开启了维护模式，显示警告
    if (systemSettings.maintenanceMode) {
      ElMessageBox.alert(
        '维护模式已开启，普通用户将无法访问系统。请确保在维护完成后及时关闭维护模式。',
        '维护模式提醒',
        {
          confirmButtonText: '我知道了',
          type: 'warning'
        }
      )
    }
  } catch (error) {
    ElMessage.error('保存设置失败')
  } finally {
    savingSettings.value = false
  }
}

// 预览效果
const showSettingsPreview = () => {
  ElMessageBox.alert(
    `
    <div style="text-align: left;">
      <h4>当前设置预览：</h4>
      <p><strong>系统名称：</strong>${systemSettings.systemName}</p>
      <p><strong>允许注册：</strong>${systemSettings.allowRegistration ? '是' : '否'}</p>
      <p><strong>维护模式：</strong>${systemSettings.maintenanceMode ? '开启' : '关闭'}</p>
      <p><strong>最大文件大小：</strong>${systemSettings.maxFileSize}MB</p>
      <p><strong>单次上传数量：</strong>${systemSettings.maxUploadFiles}个</p>
      <p><strong>允许的图片类型：</strong>${systemSettings.allowedImageTypes.join(', ')}</p>
      <p><strong>允许的视频类型：</strong>${systemSettings.allowedVideoTypes.join(', ')}</p>
      <p><strong>缩略图尺寸：</strong>${systemSettings.thumbnailSize}px</p>
      <p><strong>自动清理日志：</strong>${systemSettings.autoCleanLogs ? '开启' : '关闭'}</p>
    </div>
    `,
    '设置预览',
    {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true
    }
  )
}

const getLevelType = (level: string) => {
  switch (level) {
    case 'error': return 'danger'
    case 'warning': return 'warning'
    case 'info': return 'success'
    default: return 'info'
  }
}

const getLevelText = (level: string) => {
  switch (level) {
    case 'error': return '错误'
    case 'warning': return '警告'
    case 'info': return '信息'
    default: return '未知'
  }
}

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return '未知时间'
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return timestamp
  }
}

const getStorageProgressColor = (used: number, limit: number) => {
  if (!limit || limit === 0) return '#e6e6e6'
  const percentage = (used / limit) * 100
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    // 只有在非刷新状态时才自动刷新
    if (!refreshing.value) {
      refreshAllData()
    }
  }, 60000) // 改为60秒刷新一次，减少请求频率
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  try {
    await refreshAllData()
    startAutoRefresh()
    // 调整表格宽度
    adjustTableWidth()
    // 设置同步滚动
    setupSyncScroll()
  } catch (error) {
    ElMessage.error('初始化数据失败')
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
// 桌面端对话框居中优化
:deep(.el-dialog) {
  margin: auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

// 移动端对话框优化
@media (max-width: 768px) {
  :deep(.el-dialog) {
    margin: auto !important;
    width: 95% !important;
    max-width: 95% !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-height: 90vh !important;
    
    .el-dialog__header {
      padding: 20px 20px 0 20px !important;
      border-bottom: 1px solid #f0f0f0 !important;
      margin-bottom: 0 !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #2c3e50 !important;
      }
      
      .el-dialog__headerbtn {
        top: 20px !important;
        right: 20px !important;
        width: 32px !important;
        height: 32px !important;
        
        .el-dialog__close {
          font-size: 18px !important;
          color: #909399 !important;
          
          &:hover {
            color: #409eff !important;
          }
        }
      }
    }
    
    .el-dialog__body {
      padding: 20px !important;
      max-height: calc(90vh - 140px) !important;
      overflow-y: auto !important;
      
      .el-form {
        .el-form-item {
          margin-bottom: 20px !important;
          
          .el-form-item__label {
            width: 80px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            color: #606266 !important;
          }
          
          .el-form-item__content {
            .el-input {
              .el-input__wrapper {
                border-radius: 8px !important;
                box-shadow: 0 0 0 1px #dcdfe6 inset !important;
                
                .el-input__inner {
                  height: 44px !important;
                  font-size: 15px !important;
                  padding: 0 14px !important;
                }
              }
            }
            
            .el-select {
              .el-select__wrapper {
                border-radius: 8px !important;
                box-shadow: 0 0 0 1px #dcdfe6 inset !important;
                min-height: 44px !important;
                
                .el-select__selection {
                  .el-select__selected-item {
                    font-size: 15px !important;
                    padding: 0 14px !important;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    .el-dialog__footer {
      padding: 0 20px 20px 20px !important;
      border-top: 1px solid #f0f0f0 !important;
      margin-top: 0 !important;
      
      .el-button {
        height: 44px !important;
        font-size: 15px !important;
        border-radius: 8px !important;
        padding: 0 24px !important;
        font-weight: 500 !important;
        
        &.el-button--primary {
          background: linear-gradient(135deg, #409eff 0%, #337ecc 100%) !important;
          border: none !important;
          
          &:hover {
            background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%) !important;
          }
        }
      }
    }
  }
}

.admin-center-page {
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

.admin-center-content {
  .admin-nav-card {
    .admin-menu {
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
  
  .admin-panel-card {
    .admin-section {
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
      
      .stats-cards {
        margin-bottom: 24px;
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          
          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            
            &.users {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            &.files {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            &.storage {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
          }
          
          .stat-info {
            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #303133;
              line-height: 1;
            }
            
            .stat-label {
              font-size: 14px;
              color: #909399;
              margin-top: 4px;
            }
            
            .stat-trend {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 8px;
              
              .trend-icon {
                font-size: 12px;
                color: #67c23a;
              }
              
              .trend-text {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
      
      .quick-actions {
        margin-bottom: 24px;
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
              font-weight: 600;
              color: #303133;
        }
        
        .quick-action-btn {
          width: 100%;
          height: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .el-icon {
            font-size: 20px;
          }
          
          span {
            font-size: 12px;
            font-weight: 500;
          }
        }
      }
      
      .user-filters {
        margin-bottom: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .user-actions {
        margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
        align-items: center;
        gap: 12px;
        
        .action-left {
          display: flex;
          gap: 12px;
        }
        
        .action-right {
          display: flex;
          gap: 12px;
        }
      }
      
      .storage-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .storage-text {
          font-size: 12px;
              color: #909399;
          white-space: nowrap;
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .username-text {
              font-weight: 500;
          color: #303133;
        }
      }
      
      .email-text {
        color: #606266;
              font-size: 14px;
            }
      
      .time-text {
        color: #909399;
        font-size: 12px;
      }
      
      .timestamp-text {
        color: #606266;
        font-size: 12px;
        font-family: 'Courier New', monospace;
      }
      
      .message-content {
        color: #303133;
        font-size: 14px;
        line-height: 1.4;
        word-break: break-word;
      }
      
      .log-filters {
        margin-bottom: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      
      .system-settings-form {
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
      }
      
      // 存储管理样式
      .storage-stats {
        margin-bottom: 24px;
        
        .storage-stat-card {
          .stat-content {
            display: flex;
            align-items: center;
            gap: 16px;
            
            .stat-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              color: white;
              
              &.total {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              
              &.used {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              }
              
              &.available {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              }
            }
            
            .stat-info {
              .stat-value {
                font-size: 20px;
                font-weight: 600;
                color: #303133;
                line-height: 1;
              }
              
              .stat-label {
                font-size: 14px;
                color: #909399;
                margin-top: 4px;
              }
            }
          }
        }
      }
      
      .storage-usage-card {
        margin-bottom: 24px;
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .usage-content {
          .usage-details {
            margin-top: 16px;
            text-align: center;
            
            .usage-text {
              font-size: 14px;
              color: #606266;
            }
          }
        }
      }
      
      .storage-actions-card {
        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-center-page {
    padding: 16px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
  
  .admin-center-content {
    .admin-nav-card {
      margin-bottom: 16px;
      
      .admin-menu {
        :deep(.el-menu-item) {
          height: 40px;
          line-height: 40px;
        }
      }
    }
    
    .admin-panel-card {
      .admin-section {
        .stats-cards {
          .stat-card {
            padding: 16px;
            
            .stat-icon {
              width: 40px;
              height: 40px;
              font-size: 20px;
            }
            
            .stat-info {
              .stat-value {
                font-size: 20px;
              }
            }
          }
        }
        
        .quick-actions {
          .quick-action-btn {
            height: 40px;
            
            .el-icon {
              font-size: 16px;
            }
            
            span {
              font-size: 11px;
            }
          }
        }
        
        .user-filters {
          .el-form {
            .el-form-item {
              margin-bottom: 12px;
            }
          }
        }
        
        .user-actions {
          flex-direction: column;
          gap: 8px;
          
          .action-left,
          .action-right {
            width: 100%;
            justify-content: center;
          }
          
          .el-button {
            flex: 1;
          }
        }
        
        // 确保表格容器不裁剪下拉菜单
        .el-table {
          overflow: visible !important;
        }
        
        .el-table__body-wrapper {
          overflow: visible !important;
        }
        
        .el-table__header-wrapper {
          overflow: visible !important;
        }
        
        // 确保父容器不裁剪下拉菜单
        .admin-section {
          overflow: visible !important;
        }
        
        .admin-panel-card {
          overflow: visible !important;
        }
        
        .admin-center-content {
          overflow: visible !important;
        }
        
        // 全局表格样式 - 支持固定列和同步滚动
        .el-table {
          table-layout: fixed !important;
          width: 100% !important;
          
          // 确保所有表格都使用固定布局
          table {
            table-layout: fixed !important;
            width: 100% !important;
          }
          
          // 修复表格右边空白问题
          .el-table__body-wrapper {
            .el-scrollbar {
              .el-scrollbar__view {
                width: 100% !important;
                max-width: 100% !important;
              }
            }
          }
          
          // 确保表格内容不超出容器
          .el-table__inner-wrapper {
            width: 100% !important;
            overflow: hidden !important;
          }
          
          // 强制表格宽度计算
          .el-table__body {
            width: calc(100% - 0px) !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
          }
          
          // 消除表格右边的所有空白
          .el-table__body-wrapper {
            margin-right: 0 !important;
            padding-right: 0 !important;
            width: 100% !important;
          }
          
          // 强制表格总宽度
          .el-table__header-wrapper {
            width: 100% !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
          }
          
          // 确保表头和表体宽度完全一致
          .el-table__header {
            width: 100% !important;
            table-layout: fixed !important;
            position: relative !important;
            
            table {
              width: 100% !important;
              table-layout: fixed !important;
            }
          }
          
          .el-table__body {
            width: 100% !important;
            table-layout: fixed !important;
            
            table {
              width: 100% !important;
              table-layout: fixed !important;
            }
          }
          
          // 移除Element Plus的固定表头行为
          .el-table__header-wrapper {
            position: relative !important;
            z-index: auto !important;
          }
          
          // 确保滚动条可见
          .el-scrollbar__bar {
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          // 确保表格容器宽度
          .el-table__inner-wrapper {
            width: 100% !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
          }
          
          // 固定列样式优化
          .el-table__fixed-right {
            right: 0 !important;
            width: 60px !important;
            background: #fff !important;
            z-index: 10 !important;
            
            .el-table__fixed-body-wrapper {
              width: 60px !important;
            }
            
            .el-table__fixed-header-wrapper {
              width: 60px !important;
            }
          }
          
          // 确保固定列单元格样式
          .el-table-fixed-column--right {
            background: #fff !important;
            z-index: 10 !important;
          }
          
          // 确保固定列滚动同步
          .el-table__fixed-right-patch {
            display: none !important;
          }
        }
        
        // 确保表头和表体操作列宽度完全一致
        :deep(.el-table) {
          // 强制表格布局
          table-layout: fixed !important;
          
          // 确保colgroup列宽完全一致
          colgroup {
            col:nth-child(1) { width: 55px !important; }
            col:nth-child(2) { width: 140px !important; }
            col:nth-child(3) { width: 120px !important; }
            col:nth-child(4) { width: 60px !important; }
            col:nth-child(5) { width: 60px !important; }
            col:nth-child(6) { width: 120px !important; }
            col:nth-child(7) { width: 100px !important; }
            col:nth-child(8) { width: 60px !important; }
          }
          
          // 表头列宽强制设置
          .el-table__header {
            th:nth-child(1) { width: 55px !important; min-width: 55px !important; max-width: 55px !important; }
            th:nth-child(2) { width: 140px !important; min-width: 140px !important; max-width: 140px !important; }
            th:nth-child(3) { width: 120px !important; min-width: 120px !important; max-width: 120px !important; }
            th:nth-child(4) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
            th:nth-child(5) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
            th:nth-child(6) { width: 120px !important; min-width: 120px !important; max-width: 120px !important; }
            th:nth-child(7) { width: 100px !important; min-width: 100px !important; max-width: 100px !important; }
            th:nth-child(8) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
          }
          
          // 表体列宽强制设置
          .el-table__body {
            td:nth-child(1) { width: 55px !important; min-width: 55px !important; max-width: 55px !important; }
            td:nth-child(2) { width: 140px !important; min-width: 140px !important; max-width: 140px !important; }
            td:nth-child(3) { width: 120px !important; min-width: 120px !important; max-width: 120px !important; }
            td:nth-child(4) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
            td:nth-child(5) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
            td:nth-child(6) { width: 120px !important; min-width: 120px !important; max-width: 120px !important; }
            td:nth-child(7) { width: 100px !important; min-width: 100px !important; max-width: 100px !important; }
            td:nth-child(8) { width: 60px !important; min-width: 60px !important; max-width: 60px !important; }
          }
          
          // 修复固定列右边空白问题
          .el-table__fixed-right {
            right: 0 !important;
            width: 60px !important;
            
            .el-table__fixed-body-wrapper {
              width: 60px !important;
            }
          }
          
          .el-table__header {
            th.el-table-fixed-column--right {
              width: 60px !important;
              min-width: 60px !important;
              max-width: 60px !important;
              flex: 0 0 60px !important;
              right: 0 !important;
            }
          }
          
          .el-table__body {
            td.el-table-fixed-column--right {
              width: 60px !important;
              min-width: 60px !important;
              max-width: 60px !important;
              flex: 0 0 60px !important;
              right: 0 !important;
            }
          }
          
          // 确保操作列内容居中
          .el-table-fixed-column--right {
            .cell {
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
          
          // 防止其他列挤压操作列
          .el-table__header-wrapper,
          .el-table__body-wrapper {
            .el-table__header,
            .el-table__body {
              width: 100% !important;
            }
          }
          
          // 移除固定列的多余空白
          .el-table__fixed-right-patch {
            width: 0 !important;
            right: 0 !important;
            display: none !important;
          }
          
          // 彻底消除右边空白
          .el-table__fixed-right {
            right: 0 !important;
            width: 60px !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
            
            &::after {
              display: none !important;
            }
          }
          
          // 确保固定列单元格没有右边距
          .el-table-fixed-column--right {
            margin-right: 0 !important;
            padding-right: 0 !important;
            border-right: none !important;
            
            .cell {
              margin-right: 0 !important;
              padding-right: 0 !important;
            }
          }
        }
        
        // 移动端表格优化 - 重构版本
        :deep(.el-table) {
          font-size: 12px !important;
          overflow: visible !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          
          // 强制表格布局和列宽
          table-layout: fixed !important;
          
          // 确保colgroup中的列宽设置生效
          colgroup {
            col:last-child {
              width: 60px !important;
            }
          }
          
          .el-table__header-wrapper {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            border-radius: 8px 8px 0 0 !important;
          }
          
          .el-table__body-wrapper {
            overflow-x: auto !important;
            overflow-y: auto !important;
            border-radius: 0 0 8px 8px !important;
          }
          
          .el-table__inner-wrapper {
            overflow: visible !important;
          }
          
          .el-table__header {
            th {
              padding: 8px 4px !important;
              font-size: 11px !important;
              font-weight: 600 !important;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
              border-bottom: 2px solid #dee2e6 !important;
              
              .cell {
                padding: 0 4px !important;
                font-size: 11px !important;
                color: #495057 !important;
                text-align: center !important;
              }
            }
          }
          
          .el-table__body {
            td {
              padding: 8px 4px !important;
              border-bottom: 1px solid #f1f3f4 !important;
              
              .cell {
                padding: 0 4px !important;
                font-size: 12px !important;
              }
            }
            
            tr:hover {
              background-color: #f8f9fa !important;
            }
          }
          
          // 用户信息列优化 - 更美观
          .user-info {
            flex-direction: row !important;
            align-items: center !important;
            gap: 8px !important;
            justify-content: center !important;
            
            .el-avatar {
              width: 24px !important;
              height: 24px !important;
              font-size: 10px !important;
              flex-shrink: 0 !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            
            .username-text {
              font-size: 11px !important;
              max-width: 100px !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
              flex: 1 !important;
              font-weight: 500 !important;
              color: #2c3e50 !important;
            }
          }
          
          // 邮箱列优化 - 更美观
          .email-text {
            font-size: 10px !important;
            max-width: 100px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: block !important;
            color: #6c757d !important;
            text-align: center !important;
          }
          
          // 存储信息优化 - 更美观
          .storage-info {
            flex-direction: column !important;
            gap: 4px !important;
            align-items: center !important;
            
            .el-progress {
              width: 100% !important;
              
              .el-progress-bar__outer {
                height: 4px !important;
                border-radius: 2px !important;
                background-color: #e9ecef !important;
              }
              
              .el-progress-bar__inner {
                border-radius: 2px !important;
                background: linear-gradient(90deg, #28a745 0%, #20c997 100%) !important;
              }
            }
            
            .storage-text {
              font-size: 9px !important;
              text-align: center !important;
              color: #6c757d !important;
              font-weight: 500 !important;
            }
          }
          
          // 时间文本优化 - 更美观
          .time-text {
            font-size: 9px !important;
            max-width: 80px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: block !important;
            color: #6c757d !important;
            text-align: center !important;
          }
          
          // 操作按钮优化 - 无边框设计
          .el-dropdown {
            .el-button {
              padding: 6px !important;
              font-size: 12px !important;
              height: 32px !important;
              width: 32px !important;
              min-width: 32px !important;
              border-radius: 6px !important;
              touch-action: manipulation !important;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
              cursor: pointer !important;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              transition: all 0.2s ease !important;
              
              &:hover {
                background: rgba(64, 158, 255, 0.1) !important;
                transform: scale(1.05) !important;
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2) !important;
              }
              
              &:active {
                background: rgba(64, 158, 255, 0.2) !important;
                transform: scale(0.95) !important;
                box-shadow: 0 1px 4px rgba(64, 158, 255, 0.3) !important;
              }
              
              &:focus {
                outline: none !important;
                background: rgba(64, 158, 255, 0.1) !important;
              }
              
              .el-icon {
                font-size: 14px !important;
                color: #6c757d !important;
                transition: color 0.2s ease !important;
              }
              
              &:hover .el-icon {
                color: #409eff !important;
              }
              
              // 菜单打开状态
              &.menu-open {
                background: rgba(64, 158, 255, 0.15) !important;
                
                .el-icon {
                  color: #409eff !important;
                  transform: rotate(180deg) !important;
                }
              }
            }
          }
          
          // 标签优化 - 更美观
          .el-tag {
            font-size: 9px !important;
            padding: 2px 6px !important;
            height: auto !important;
            line-height: 1.3 !important;
            border-radius: 4px !important;
            font-weight: 500 !important;
            
            &.el-tag--primary {
              background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
              color: white !important;
              border: none !important;
            }
            
            &.el-tag--danger {
              background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
              color: white !important;
              border: none !important;
            }
            
            &.el-tag--success {
              background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important;
              color: white !important;
              border: none !important;
            }
          }
        }
        
        // 完善的下拉菜单样式和交互 - 优化版本
        :deep(.el-dropdown-menu) {
          z-index: 9999 !important;
          min-width: 160px !important;
          font-size: 13px !important;
          position: absolute !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
          border-radius: 12px !important;
          border: none !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          animation: dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          overflow: hidden !important;
          
          .el-dropdown-menu__item {
            padding: 12px 16px !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            cursor: pointer !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            border-radius: 8px !important;
            margin: 2px 8px !important;
            display: flex !important;
            align-items: center !important;
            color: #495057 !important;
            font-weight: 500 !important;
            position: relative !important;
            
            &:hover {
              background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
              color: #1976d2 !important;
              transform: translateX(4px) !important;
              box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2) !important;
            }
            
            &:active {
              background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%) !important;
              transform: translateX(2px) !important;
              box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3) !important;
            }
            
            .el-icon {
              font-size: 14px !important;
              margin-right: 10px !important;
              color: inherit !important;
              transition: transform 0.2s ease !important;
            }
            
            &:hover .el-icon {
              transform: scale(1.1) !important;
            }
            
            // 危险操作样式
            &[data-command="delete"] {
              color: #dc3545 !important;
              
              &:hover {
                background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
                color: #c62828 !important;
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2) !important;
              }
              
              .el-icon {
                color: inherit !important;
              }
            }
            
            // 分隔线样式
            &.is-divided {
              border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
              margin-top: 8px !important;
              padding-top: 16px !important;
            }
          }
        }
        
        // 移动端下拉菜单优化
        @media (max-width: 768px) {
          :deep(.el-dropdown-menu) {
            min-width: 180px !important;
            font-size: 14px !important;
            border-radius: 12px !important;
            
            .el-dropdown-menu__item {
              padding: 16px 20px !important;
              font-size: 14px !important;
              min-height: 48px !important;
              border-radius: 8px !important;
              margin: 3px 6px !important;
              
              .el-icon {
                font-size: 16px !important;
                margin-right: 12px !important;
              }
            }
          }
        }
        
        // 确保下拉菜单容器有正确的层级
        :deep(.el-popper) {
          z-index: 9999 !important;
          position: absolute !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        // 下拉菜单触发器 - 移动端优化
        :deep(.el-dropdown) {
          position: relative !important;
          z-index: 1 !important;
          display: inline-block !important;
          
          .el-button {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
        }
        
        // 移动端操作列宽度调整
        @media (max-width: 768px) {
          :deep(.el-dropdown) {
            .el-button {
              min-height: 40px !important;
              min-width: 40px !important;
              padding: 10px !important;
              border-radius: 8px !important;
              
              &:hover {
                background: rgba(64, 158, 255, 0.15) !important;
                transform: scale(1.1) !important;
              }
              
              &:active {
                background: rgba(64, 158, 255, 0.25) !important;
                transform: scale(0.9) !important;
              }
              
              &:focus {
                outline: 2px solid #409eff !important;
                outline-offset: 2px !important;
              }
              
              .el-icon {
                font-size: 16px !important;
              }
            }
          }
          
          // 移动端操作列宽度调整
          :deep(.el-table) {
            // 强制表格布局
            table-layout: fixed !important;
            
            // 确保colgroup列宽
            colgroup {
              col:last-child {
                width: 60px !important;
              }
            }
            
            .el-table__header {
              th:last-child {
                width: 60px !important;
                min-width: 60px !important;
                max-width: 60px !important;
                flex: 0 0 60px !important;
              }
            }
            
            .el-table__body {
              td:last-child {
                width: 60px !important;
                min-width: 60px !important;
                max-width: 60px !important;
                flex: 0 0 60px !important;
              }
            }
          }
        }
        
        // 下拉菜单动画 - 优化版本
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        // 自定义MessageBox样式
        :deep(.custom-message-box) {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(10px) !important;
          
          .el-message-box__header {
            padding: 20px 20px 0 20px !important;
            border-bottom: 1px solid #f0f0f0 !important;
            
            .el-message-box__title {
              font-size: 18px !important;
              font-weight: 600 !important;
              color: #2c3e50 !important;
            }
            
            .el-message-box__headerbtn {
              top: 20px !important;
              right: 20px !important;
              
              .el-message-box__close {
                font-size: 18px !important;
                color: #909399 !important;
                
                &:hover {
                  color: #409eff !important;
                }
              }
            }
          }
          
          .el-message-box__content {
            padding: 20px !important;
            
            .el-message-box__message {
              font-size: 15px !important;
              line-height: 1.5 !important;
              color: #606266 !important;
            }
          }
          
          .el-message-box__btns {
            padding: 0 20px 20px 20px !important;
            
            .el-button {
              height: 40px !important;
              font-size: 14px !important;
              border-radius: 8px !important;
              padding: 0 20px !important;
              font-weight: 500 !important;
              
              &.el-button--primary {
                background: linear-gradient(135deg, #409eff 0%, #337ecc 100%) !important;
                border: none !important;
                
                &:hover {
                  background: linear-gradient(135deg, #337ecc 0%, #2b6cb0 100%) !important;
                }
              }
              
              &.el-button--danger {
                background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%) !important;
                border: none !important;
                
                &:hover {
                  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
                }
              }
            }
          }
        }
        
        // 危险操作MessageBox样式
        :deep(.custom-danger-box) {
          .el-message-box__header {
            .el-message-box__title {
              color: #e74c3c !important;
            }
          }
          
          .el-message-box__content {
            .el-message-box__message {
              color: #e74c3c !important;
              font-weight: 500 !important;
            }
          }
        }
      }
    }
  }
  
  // 系统设置样式
  .system-settings-form {
    .form-description {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.4;
    }
    
    .form-unit {
      margin-left: 8px;
      color: #606266;
      font-size: 14px;
    }
    
    .el-divider {
      margin: 20px 0;
      
      .el-divider__text {
        font-weight: 600;
        color: #409eff;
      }
    }
    
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .el-switch {
      margin-right: 8px;
    }
    
    .el-checkbox-group {
      .el-checkbox {
        margin-right: 20px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>


