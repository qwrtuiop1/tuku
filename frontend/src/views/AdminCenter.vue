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
      <!-- 移动端顶部导航栏 -->
      <div class="mobile-nav-bar" v-if="isMobile">
        <div class="mobile-nav-header">
          <h2 class="mobile-nav-title">管理中心</h2>
          <el-button 
            type="primary" 
            size="small" 
            @click="refreshAllData" 
            :loading="refreshing"
            class="mobile-refresh-btn"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        
        <!-- 移动端标签页导航 -->
        <div class="mobile-tabs">
          <div 
            v-for="tab in mobileTabs" 
            :key="tab.key"
            :class="['mobile-tab', { active: activeSection === tab.key }]"
            @click="handleSectionSelect(tab.key)"
          >
            <el-icon><component :is="tab.icon" /></el-icon>
            <span>{{ tab.label }}</span>
          </div>
        </div>
      </div>

      <!-- 桌面端布局 -->
      <el-row v-if="!isMobile" class="desktop-layout">
        <!-- 左侧导航 -->
        <el-col :xs="24" :sm="8" :md="6" :lg="5" :xl="4">
          <el-card class="admin-nav-card">
            <el-menu
              v-model="activeSection"
              :default-active="activeSection"
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
              <el-menu-item index="moderation">
                <el-icon><CircleCheck /></el-icon>
                <span>审核设置</span>
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
              <el-row class="stats-cards">
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card users-card">
                    <div class="stat-icon users">
                      <el-icon><UserFilled /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ systemStats.totalUsers }}</div>
                      <div class="stat-label">总用户数</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                        <span class="trend-text">活跃用户</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card files-card">
                    <div class="stat-icon files">
                      <el-icon><Folder /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ systemStats.totalFiles }}</div>
                      <div class="stat-label">总文件数</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                        <span class="trend-text">存储文件</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                
                <!-- 文件夹卡片（与动图卡片交换位置） -->
                <el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="stat-card folder-card">
                    <div class="stat-icon folder">
                      <el-icon><Folder /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ systemStats.totalFolders || 0 }}</div>
                      <div class="stat-label">文件夹</div>
                      <div class="stat-trend">
                        <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                        <span class="trend-text">数据</span>
                      </div>
                    </div>
                  </div>
                </el-col>

                
              </el-row>

              
                
              <!-- 快速操作 -->
              <div class="quick-actions">
                <h4>快速操作</h4>
                <el-row class="quick-actions-row">
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
                <!-- 移动端筛选表单 -->
                <div class="mobile-filters" v-if="isMobile">
                  <el-form :model="userFilter" label-position="top">
                    <el-row :gutter="12">
                      <el-col :span="24">
                        <el-form-item label="搜索用户">
                          <el-input
                            v-model="userFilter.search"
                            placeholder="用户名或邮箱"
                            clearable
                            @keyup.enter="searchUsers"
                          >
                            <template #prefix>
                              <el-icon><Search /></el-icon>
                            </template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    
                    <el-row :gutter="12">
                      <el-col :span="12">
                        <el-form-item label="角色">
                          <el-select v-model="userFilter.role" placeholder="选择角色" clearable style="width: 100%">
                            <el-option label="全部" value="" />
                            <el-option label="管理员" value="admin" />
                            <el-option label="用户" value="user" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="状态">
                          <el-select v-model="userFilter.status" placeholder="选择状态" clearable style="width: 100%">
                            <el-option label="全部" value="" />
                            <el-option label="正常" value="active" />
                            <el-option label="已禁用" value="inactive" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    
                    <el-row :gutter="12">
                      <el-col :span="12">
                        <el-button type="primary" @click="searchUsers" :loading="refreshing" style="width: 100%">
                          <el-icon><Search /></el-icon>
                          搜索
                        </el-button>
                      </el-col>
                      <el-col :span="12">
                        <el-button @click="resetUserFilter" style="width: 100%">
                          <el-icon><Refresh /></el-icon>
                          重置
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
                
                <!-- 桌面端筛选表单 -->
                <el-form :model="userFilter" inline v-else>
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
                      <el-option label="已禁用" value="inactive" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="注册时间">
                    <el-date-picker
                      v-model="userFilter.createdRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                  
                  <el-form-item label="最后登录">
                    <el-date-picker
                      v-model="userFilter.lastLoginRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                  
                  <el-form-item label="排序">
                    <el-select v-model="userFilter.sortBy" placeholder="字段" style="width: 140px">
                      <el-option label="注册时间" value="created_at" />
                      <el-option label="最后登录" value="last_login" />
                      <el-option label="已用存储" value="used_storage" />
                      <el-option label="用户名" value="username" />
                      <el-option label="邮箱" value="email" />
                      <el-option label="登录次数" value="login_count" />
                    </el-select>
                    <el-select v-model="userFilter.sortOrder" placeholder="顺序" style="width: 120px; margin-left: 8px">
                      <el-option label="降序" value="desc" />
                      <el-option label="升序" value="asc" />
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
                <!-- 移动端操作按钮 -->
                <div class="mobile-actions" v-if="isMobile">
                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-button type="primary" @click="showCreateUserDialog = true" style="width: 100%">
                        <el-icon><Plus /></el-icon>
                        创建用户
                      </el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button @click="batchDeleteUsers" :disabled="selectedUsers.length === 0" style="width: 100%">
                        <el-icon><Delete /></el-icon>
                        批量删除
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
                
                <!-- 桌面端操作按钮 -->
                <div class="desktop-actions" v-else>
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
              </div>
              
              <!-- 移动端用户卡片列表 -->
              <div class="mobile-user-list" v-if="isMobile">
                <div 
                  v-for="user in users" 
                  :key="user.id" 
                  class="user-card"
                  v-loading="refreshing"
                  @click="handleUserCardClick(user, $event)"
                >
                  <div class="user-card-header">
                    <div class="user-info">
                      <el-avatar :size="40" :src="getAvatarUrl(user.avatar_url)">
                        {{ user.username?.charAt(0).toUpperCase() }}
                      </el-avatar>
                      <div class="user-details">
                        <div class="username">{{ user.username || '未知用户' }}</div>
                        <div class="email">{{ user.email || '未设置' }}</div>
                      </div>
                    </div>
                    <div class="user-status">
                      <el-tag :type="user.role === 'admin' ? 'danger' : 'primary'" size="small">
                        {{ user.role === 'admin' ? '管理员' : '用户' }}
                      </el-tag>
                      <el-tag 
                        :type="getStatusTagType(user.status)" 
                        size="small"
                        style="margin-top: 4px;"
                      >
                        {{ getStatusText(user.status) }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <div class="user-card-content">
                    <div class="storage-section">
                      <div class="storage-label">存储使用</div>
                      <div class="storage-info">
                        <el-progress
                          :percentage="Math.round(((user.used_storage || 0) / (user.storage_limit || 1)) * 100)"
                          :stroke-width="8"
                          :show-text="false"
                          :color="getStorageProgressColor(user.used_storage, user.storage_limit)"
                        />
                        <div class="storage-text">
                          {{ formatFileSize(user.used_storage || 0) }} / {{ formatFileSize(user.storage_limit || 0) }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="time-section">
                      <div class="time-label">注册时间</div>
                      <div class="time-text">{{ formatTimestamp(user.created_at) }}</div>
                    </div>
                  </div>
                  
                  <div class="user-card-actions">
                    <el-checkbox 
                      :model-value="selectedUsers.includes(user)"
                      @change="(val: any) => handleUserSelectionChange(!!val, user)"
                    >
                      选择
                    </el-checkbox>
                    <el-dropdown 
                      @command="(command: string) => handleUserAction(command, user)" 
                      trigger="click"
                      :hide-on-click="true"
                    >
                      <el-button type="primary" size="small">
                        操作 <el-icon><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="toggleRole">
                            <el-icon><User /></el-icon>
                            {{ user.role === 'admin' ? '设为用户' : '设为管理员' }}
                          </el-dropdown-item>
                          <el-dropdown-item command="toggleStatus">
                            <el-icon><Switch /></el-icon>
                            {{ user.status === 'active' ? '禁用用户' : '启用用户' }}
                          </el-dropdown-item>
                          <el-dropdown-item command="editStorage">
                            <el-icon><FolderOpened /></el-icon>
                            设置存储
                          </el-dropdown-item>
                          <el-dropdown-item command="viewStats" divided>
                            <el-icon><DataAnalysis /></el-icon>
                            查看统计
                          </el-dropdown-item>
                          <el-dropdown-item command="delete" divided>
                            <el-icon><Delete /></el-icon>
                            删除用户
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                
                <div v-if="users.length === 0" class="empty-state">
                  <el-empty description="暂无用户数据" />
                </div>
              </div>
              
              <!-- 桌面端用户表格 -->
              <el-table
                v-else
                :data="users"
                style="width: 100%; table-layout: fixed;"
                @selection-change="handleTableSelectionChange"
                @row-click="handleTableRowClick"
                v-loading="refreshing"
                empty-text="暂无用户数据"
                row-key="id"
                class="user-table"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="username" label="用户名" width="140">
                  <template #default="{ row }">
                    <div class="user-info">
                      <el-avatar :size="32" :src="getAvatarUrl(row.avatar_url)" shape="circle">
                        {{ row.username?.charAt(0).toUpperCase() }}
                      </el-avatar>
                      <span class="username-text" :title="row.username || '未知用户'">{{ row.username || '未知用户' }}</span>
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
                      @command="(command: string) => handleUserAction(command, row)" 
                      @visible-change="(visible: boolean) => handleMenuToggle(visible, row)"
                      trigger="click"
                      :hide-on-click="true">
                      <el-button 
                        type="text" 
                        size="small" 
                        @click.stop="toggleMenu(row)"
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
                
                <!-- 安全设置 -->
                <el-divider content-position="left">
                  <el-icon><Key /></el-icon>
                  安全设置
                </el-divider>
                <el-form-item label="最小密码长度">
                  <el-input-number v-model="systemSettings.minPasswordLength" :min="4" :max="64" />
                </el-form-item>
                <el-form-item label="密码复杂度">
                  <el-select v-model="systemSettings.passwordComplexity" style="width: 200px">
                    <el-option label="低" value="low" />
                    <el-option label="中" value="medium" />
                    <el-option label="高" value="high" />
                  </el-select>
                </el-form-item>
                <el-form-item label="登录锁定">
                  <el-switch v-model="systemSettings.enableLoginLock" active-text="启用" inactive-text="关闭" />
                </el-form-item>
                <el-form-item label="最大失败次数">
                  <el-input-number v-model="systemSettings.maxLoginAttempts" :min="3" :max="20" />
                </el-form-item>
                <el-form-item label="锁定时长(分钟)">
                  <el-input-number v-model="systemSettings.lockoutDuration" :min="1" :max="1440" />
                </el-form-item>
                <el-form-item label="会话超时(分钟)">
                  <el-input-number v-model="systemSettings.sessionTimeout" :min="5" :max="1440" />
                </el-form-item>
                <el-form-item label="双因素认证">
                  <el-switch v-model="systemSettings.enableTwoFactor" active-text="启用" inactive-text="关闭" />
                </el-form-item>
                <el-form-item label="启用分享功能">
                  <el-switch v-model="systemSettings.sharingEnabled" active-text="开启" inactive-text="关闭" />
                  <div class="form-description">关闭后：所有分享链接立即失效，历史链接永久不可用；再次开启后需要重新生成新链接</div>
                </el-form-item>

                <!-- 存储设置 -->
                <el-divider content-position="left">
                  <el-icon><Folder /></el-icon>
                  存储设置
                </el-divider>
                <el-form-item label="单用户存储上限(MB)">
                  <el-input-number v-model="systemSettings.maxStoragePerUser" :min="0" :max="1048576" />
                  <div class="form-description">0 表示不限制</div>
                </el-form-item>

                <!-- 文档类型 -->
                <el-divider content-position="left">
                  <el-icon><Document /></el-icon>
                  文档类型
                </el-divider>
                <el-form-item label="允许的文档扩展名">
                  <el-input v-model="systemSettings.allowedDocumentTypesCsv" placeholder="例如: pdf,docx,xlsx" />
                  <div class="form-description">多个扩展名用英文逗号分隔</div>
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
                    active-color="#374151"
                    inactive-color="#6b7280"
                  />
                  <div class="form-description">是否允许新用户注册，关闭后只能由管理员创建用户</div>
                </el-form-item>
                
                <el-form-item label="维护模式">
                  <el-switch 
                    v-model="systemSettings.maintenanceMode"
                    active-text="开启"
                    inactive-text="关闭"
                    active-color="#6b7280"
                    inactive-color="#374151"
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
                    <el-checkbox label="mkv">MKV</el-checkbox>
                    <el-checkbox label="m4v">M4V</el-checkbox>
                    <el-checkbox label="flv">FLV</el-checkbox>
                    <el-checkbox label="wmv">WMV</el-checkbox>
                    <el-checkbox label="mpeg">MPEG</el-checkbox>
                    <el-checkbox label="mpg">MPG</el-checkbox>
                    <el-checkbox label="3gp">3GP</el-checkbox>
                    <el-checkbox label="ts">TS</el-checkbox>
                    <el-checkbox label="m2ts">M2TS</el-checkbox>
                    <el-checkbox label="ogv">OGV</el-checkbox>
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
                
                <!-- 外观设置 -->
                <el-divider content-position="left">
                  <el-icon><Brush /></el-icon>
                  外观设置
                </el-divider>
                
                <el-form-item label="主题模式">
                  <el-radio-group v-model="systemSettings.themeMode">
                    <el-radio-button label="auto">自动</el-radio-button>
                    <el-radio-button label="light">浅色</el-radio-button>
                    <el-radio-button label="dark">深色</el-radio-button>
                  </el-radio-group>
                  <div class="form-description">自动模式会根据系统设置自动切换主题</div>
                </el-form-item>
                
                <el-form-item label="主色调">
                  <div class="color-picker-container">
                    <el-color-picker 
                      v-model="systemSettings.primaryColor"
                      :predefine="predefineColors"
                      show-alpha
                      size="large"
                    />
                    <span class="color-value">{{ systemSettings.primaryColor }}</span>
                  </div>
                  <div class="form-description">系统的主要颜色，影响按钮、链接等元素</div>
                </el-form-item>
                
                <el-form-item label="侧边栏宽度">
                  <el-input-number 
                    v-model="systemSettings.sidebarWidth" 
                    :min="180" 
                    :max="300"
                    controls-position="right"
                    style="width: 200px"
                  />
                  <span class="form-unit">px</span>
                  <div class="form-description">侧边栏的宽度，影响整体布局</div>
                </el-form-item>
                
                <el-form-item label="页面动画">
                  <el-switch 
                    v-model="systemSettings.enableAnimation"
                    active-text="开启"
                    inactive-text="关闭"
                    active-color="#374151"
                    inactive-color="#6b7280"
                  />
                  <div class="form-description">开启页面切换和交互动画效果</div>
                </el-form-item>
                
                <el-form-item label="Logo地址">
                  <el-input 
                    v-model="systemSettings.logoUrl" 
                    placeholder="请输入Logo图片URL"
                    clearable
                    maxlength="500"
                    show-word-limit
                  >
                    <template #prefix>
                      <el-icon><Picture /></el-icon>
                    </template>
                  </el-input>
                  <div class="form-description">自定义Logo图片地址，留空使用默认Logo</div>
                </el-form-item>
                
                <el-form-item label="网站图标">
                  <el-input 
                    v-model="systemSettings.faviconUrl" 
                    placeholder="请输入网站图标URL"
                    clearable
                    maxlength="500"
                    show-word-limit
                  >
                    <template #prefix>
                      <el-icon><Star /></el-icon>
                    </template>
                  </el-input>
                  <div class="form-description">自定义网站图标(favicon)地址</div>
                </el-form-item>
                
                <el-form-item label="自定义CSS">
                  <el-input 
                    v-model="systemSettings.customCss" 
                    type="textarea"
                    :rows="4"
                    placeholder="请输入自定义CSS代码"
                    maxlength="2000"
                    show-word-limit
                  />
                  <div class="form-description">添加自定义样式代码，支持CSS语法</div>
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

            <!-- 审核设置 -->
            <div v-if="activeSection === 'moderation'" class="admin-section">
              <div class="section-header">
                <h3>审核设置</h3>
                <p>配置内容审核开关、提供商与阈值（实时生效）</p>
              </div>
              <el-form :model="moderationForm" label-width="120px" class="moderation-form">
                <el-form-item label="启用审核">
                  <el-switch v-model="moderationForm.enable" />
                </el-form-item>
                <el-form-item label="提供商">
                  <el-select v-model="moderationForm.provider" placeholder="选择提供商">
                    <el-option label="SiliconFlow" value="siliconflow" />
                    <el-option label="自研/通用接口" value="custom" />
                  </el-select>
                </el-form-item>
                <el-form-item label="API URL">
                  <el-input v-model="moderationForm.apiUrl" placeholder="https://..." />
                </el-form-item>
                <el-form-item label="API Key">
                  <el-input v-model="moderationForm.apiKey" placeholder="密钥" show-password />
                </el-form-item>
                <el-form-item label="模型名称">
                  <el-input v-model="moderationForm.model" placeholder="例如 Pro/deepseek-ai/DeepSeek-V3.2-Exp" />
                </el-form-item>
                <el-form-item label="AI等待时长">
                  <div class="strict-row">
                    <el-input v-model.number="moderationForm.httpTimeoutMs" placeholder="默认 20000 (20秒)" />
                    <span class="strict-value">ms</span>
                  </div>
                </el-form-item>
                <el-form-item label="严格度">
                  <div class="strict-row">
                    <el-slider v-model="moderationForm.strictness" :min="0" :max="100" />
                    <span class="strict-value">{{ moderationForm.strictness }}</span>
                  </div>
                </el-form-item>
                <el-form-item label="图片启发式">
                  <el-switch v-model="moderationForm.imageHeuristic" />
                </el-form-item>
                <el-form-item label="最大图片大小">
                  <div style="display:flex; gap:8px; align-items:center; width:100%">
                    <el-input v-model.number="maxImageSizeValue" placeholder="数值" style="flex:1" />
                    <el-select v-model="maxImageSizeUnit" style="width:100px">
                      <el-option label="MB" value="MB" />
                      <el-option label="KB" value="KB" />
                      <el-option label="B" value="B" />
                    </el-select>
                  </div>
                </el-form-item>
                <el-form-item label="OCR API URL">
                  <el-input v-model="moderationForm.ocrApiUrl" placeholder="可选：用于图片文字审核" />
                </el-form-item>
                <el-form-item label="OCR API Key">
                  <el-input v-model="moderationForm.ocrApiKey" placeholder="可选" show-password />
                </el-form-item>
                <el-form-item>
                  <div class="settings-actions">
                    <div class="settings-action-item">
                      <el-button type="primary" :loading="moderationSaving" @click="saveModeration" style="width: 100%">保存</el-button>
                    </div>
                    <div class="settings-action-item">
                      <el-button :loading="moderationLoading" @click="loadModeration" style="width: 100%">重载</el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <!-- 移动端内容区域 -->
      <div v-if="isMobile" class="mobile-content">
        <el-card class="mobile-panel-card">
          <!-- 系统概览 -->
          <div v-if="activeSection === 'overview'" class="admin-section">
            <div class="section-header">
              <h3>系统概览</h3>
              <p>系统整体运行状态和统计数据</p>
            </div>
            
            <!-- 统计卡片 -->
            <el-row class="stats-cards">
              <el-col :span="24">
                <div class="stat-card users-card">
                  <div class="stat-icon users">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ systemStats.totalUsers }}</div>
                    <div class="stat-label">总用户数</div>
                    <div class="stat-trend">
                      <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                      <span class="trend-text">活跃用户</span>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="24">
                <div class="stat-card files-card">
                  <div class="stat-icon files">
                    <el-icon><Folder /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ systemStats.totalFiles }}</div>
                    <div class="stat-label">总文件数</div>
                    <div class="stat-trend">
                      <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                      <span class="trend-text">存储文件</span>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="24">
                <div class="stat-card storage-card">
                  <div class="stat-icon storage">
                    <el-icon><FolderOpened /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatFileSize(systemStats.totalStorage) }}</div>
                    <div class="stat-label">总存储</div>
                    <div class="stat-trend">
                      <el-icon class="trend-icon up"><ArrowUp /></el-icon>
                      <span class="trend-text">存储使用</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 用户管理 -->
          <div v-if="activeSection === 'users'" class="admin-section">
            <div class="section-header">
              <h3>用户管理</h3>
              <p>管理系统用户和权限</p>
            </div>
            
            <!-- 移动端用户筛选 -->
            <div class="mobile-user-filters">
                <!-- 筛选表单标题 -->
                <div class="user-filter-header">
                  <div class="filter-title">
                    <el-icon class="filter-icon"><User /></el-icon>
                    <span>用户筛选</span>
                  </div>
                  <div class="filter-subtitle">快速查找和管理系统用户</div>
                </div>
                
                <el-form :model="userFilter" label-position="top" class="user-filter-form">
                  <!-- 用户搜索区域 -->
                  <div class="search-section">
                    <el-form-item label="用户搜索" class="search-item">
                      <el-input
                        v-model="userFilter.search"
                        placeholder="输入用户名或邮箱"
                        clearable
                        @keyup.enter="searchUsers"
                        class="search-input"
                      >
                        <template #prefix>
                          <el-icon class="search-prefix-icon"><Search /></el-icon>
                        </template>
                      </el-input>
                    </el-form-item>
                  </div>
                  
                  <!-- 角色和状态筛选 -->
                  <div class="filter-section">
                    <el-form-item label="用户角色" class="filter-item">
                      <el-select 
                        v-model="userFilter.role" 
                        placeholder="选择用户角色" 
                        clearable
                        class="filter-select"
                      >
                        <el-option label="全部角色" value="" />
                        <el-option label="管理员" value="admin" />
                        <el-option label="普通用户" value="user" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="用户状态" class="filter-item">
                      <el-select 
                        v-model="userFilter.status" 
                        placeholder="选择用户状态" 
                        clearable
                        class="filter-select"
                      >
                        <el-option label="全部状态" value="" />
                        <el-option label="正常用户" value="active" />
                        <el-option label="禁用用户" value="inactive" />
                      </el-select>
                    </el-form-item>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="user-action-section">
                    <div class="user-action-buttons">
                      <el-button 
                        type="primary" 
                        @click="searchUsers" 
                        :loading="refreshing" 
                        class="user-action-btn primary-btn"
                      >
                        <el-icon><Search /></el-icon>
                        <span>搜索用户</span>
                      </el-button>
                      
                      <el-button 
                        @click="resetUserFilter" 
                        class="user-action-btn secondary-btn"
                      >
                        <el-icon><Refresh /></el-icon>
                        <span>重置筛选</span>
                      </el-button>
                    </div>
                  </div>
                </el-form>
              </div>
            
            <!-- 用户操作栏 -->
            <div class="user-actions">
              <!-- 移动端操作按钮 -->
              <div class="mobile-actions" v-if="isMobile">
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-button type="primary" @click="showCreateUserDialog = true" style="width: 100%">
                      <el-icon><Plus /></el-icon>
                      创建用户
                    </el-button>
                  </el-col>
                  <el-col :span="12">
                    <el-button @click="batchDeleteUsers" :disabled="selectedUsers.length === 0" style="width: 100%">
                      <el-icon><Delete /></el-icon>
                      批量删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
            
            <!-- 移动端用户卡片列表 -->
            <div class="mobile-user-list" v-if="isMobile">
              <div 
                v-for="user in users" 
                :key="user.id" 
                class="user-card"
                v-loading="refreshing"
                @click="handleUserCardClick(user, $event)"
              >
                <div class="user-card-header">
                  <div class="user-info">
                    <el-avatar :size="40" :src="getAvatarUrl(user.avatar_url)">
                      {{ user.username?.charAt(0).toUpperCase() }}
                    </el-avatar>
                    <div class="user-details">
                      <div class="username">{{ user.username || '未知用户' }}</div>
                      <div class="email">{{ user.email || '未设置' }}</div>
                    </div>
                  </div>
                  <div class="user-status">
                    <el-tag :type="user.role === 'admin' ? 'danger' : 'primary'" size="small">
                      {{ user.role === 'admin' ? '管理员' : '用户' }}
                    </el-tag>
                    <el-tag 
                      :type="getStatusTagType(user.status)" 
                      size="small"
                      style="margin-top: 4px;"
                    >
                      {{ getStatusText(user.status) }}
                    </el-tag>
                  </div>
                </div>
                
                <div class="user-card-content">
                  <div class="storage-section">
                    <div class="storage-label">存储使用</div>
                    <div class="storage-info">
                      <el-progress
                        :percentage="Math.round(((user.used_storage || 0) / (user.storage_limit || 1)) * 100)"
                        :stroke-width="8"
                        :show-text="false"
                        :color="getStorageProgressColor(user.used_storage, user.storage_limit)"
                      />
                      <div class="storage-text">
                        {{ formatFileSize(user.used_storage || 0) }} / {{ formatFileSize(user.storage_limit || 0) }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="time-section">
                    <div class="time-label">注册时间</div>
                    <div class="time-text">{{ formatTimestamp(user.created_at) }}</div>
                  </div>
                </div>
                
                <div class="user-card-actions">
                  <el-checkbox 
                    :model-value="selectedUsers.includes(user)"
                    @change="(val: any) => handleUserSelectionChange(!!val, user)"
                  >
                    选择
                  </el-checkbox>
                  <el-dropdown 
                    @command="(command: string) => handleUserAction(command, user)" 
                    trigger="click"
                    :hide-on-click="true"
                  >
                    <el-button type="primary" size="small" @click.stop>
                      操作 <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="toggleRole">
                          <el-icon><User /></el-icon>
                          {{ user.role === 'admin' ? '设为用户' : '设为管理员' }}
                        </el-dropdown-item>
                        <el-dropdown-item command="toggleStatus">
                          <el-icon><Switch /></el-icon>
                          {{ user.status === 'active' ? '禁用用户' : '启用用户' }}
                        </el-dropdown-item>
                        <el-dropdown-item command="editStorage">
                          <el-icon><FolderOpened /></el-icon>
                          设置存储
                        </el-dropdown-item>
                        <el-dropdown-item command="viewStats" divided>
                          <el-icon><DataAnalysis /></el-icon>
                          查看统计
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                          <el-icon><Delete /></el-icon>
                          删除用户
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              
              <div v-if="users.length === 0" class="empty-state">
                <el-empty description="暂无用户数据" />
              </div>
            </div>
          </div>

          <!-- 系统日志 -->
          <div v-if="activeSection === 'logs'" class="admin-section">
            <div class="section-header">
              <h3>系统日志</h3>
              <p>查看和管理系统运行日志</p>
            </div>
            
            <!-- 移动端日志筛选 -->
            <div class="mobile-log-filters">
              <!-- 筛选表单标题 -->
              <div class="log-filter-header">
                <div class="filter-title">
                  <el-icon class="filter-icon"><Document /></el-icon>
                  <span>日志筛选</span>
                </div>
                <div class="filter-subtitle">快速查找和分析系统日志</div>
              </div>
              
              <el-form :model="logFilter" label-position="top" class="log-filter-form">
                <!-- 日志级别选择 -->
                <div class="level-section">
                  <el-form-item label="日志级别" class="level-item">
                    <el-select 
                      v-model="logFilter.level" 
                      placeholder="选择日志级别" 
                      clearable
                      class="level-select"
                    >
                      <el-option label="全部级别" value="" />
                      <el-option label="错误日志" value="error" />
                      <el-option label="警告日志" value="warning" />
                      <el-option label="信息日志" value="info" />
                    </el-select>
                  </el-form-item>
                </div>
                
                <!-- 关键词搜索 -->
                <div class="search-section">
                  <el-form-item label="关键词搜索" class="search-item">
                    <el-input
                      v-model="logFilter.keyword"
                      placeholder="输入关键词搜索日志"
                      clearable
                      @keyup.enter="searchLogs"
                      class="search-input"
                    >
                      <template #prefix>
                        <el-icon class="search-prefix-icon"><Search /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
                
                <!-- 操作按钮 -->
                <div class="log-action-section">
                  <div class="log-action-buttons">
                    <el-button 
                      type="primary" 
                      @click="searchLogs" 
                      :loading="refreshing" 
                      class="log-action-btn primary-btn"
                    >
                      <el-icon><Search /></el-icon>
                      <span>搜索日志</span>
                    </el-button>
                    
                    <el-button 
                      @click="exportLogs" 
                      class="log-action-btn secondary-btn"
                    >
                      <el-icon><Download /></el-icon>
                      <span>导出日志</span>
                    </el-button>
                    
                    <el-button 
                      @click="clearLogs" 
                      :loading="refreshing" 
                      class="log-action-btn danger-btn"
                    >
                      <el-icon><Delete /></el-icon>
                      <span>清空日志</span>
                    </el-button>
                  </div>
                </div>
              </el-form>
            </div>
            
            <!-- 移动端日志列表 -->
            <div class="mobile-log-list">
              <div 
                v-for="log in filteredLogs" 
                :key="log.id" 
                class="log-card"
                v-loading="refreshing"
              >
                <div class="log-card-header">
                  <div class="log-time">{{ formatTimestamp(log.timestamp) }}</div>
                  <el-tag :type="getLevelType(log.level)" size="small">
                    {{ getLevelText(log.level) }}
                  </el-tag>
                </div>
                
                <div class="log-card-content">
                  <div class="log-source">
                    <el-icon><Document /></el-icon>
                    <span>{{ log.source || '系统' }}</span>
                  </div>
                  
                  <div class="log-message">
                    {{ log.message || '无消息内容' }}
                  </div>
                </div>
              </div>
              
              <div v-if="filteredLogs.length === 0" class="empty-state">
                <el-empty description="暂无日志数据" />
              </div>
            </div>
          </div>

          <!-- 存储管理 -->
          <div v-if="activeSection === 'storage'" class="admin-section">
            <div class="section-header">
              <h3>存储管理</h3>
              <p>管理系统存储空间和使用情况</p>
            </div>
            
            <!-- 移动端存储统计 -->
            <div class="mobile-storage-stats">
              <div class="storage-stat-card">
                <div class="stat-icon total">
                  <el-icon><DataBoard /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatFileSize(storageStats.totalStorage) }}</div>
                  <div class="stat-label">总存储空间</div>
                </div>
              </div>
              
              <div class="storage-stat-card">
                <div class="stat-icon used">
                  <el-icon><Folder /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatFileSize(storageStats.usedStorage) }}</div>
                  <div class="stat-label">已使用空间</div>
                </div>
              </div>
              
              <div class="storage-stat-card">
                <div class="stat-icon motion">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ systemStats.totalMotion || 0 }}</div>
                  <div class="stat-label">动图/实况</div>
                </div>
              </div>

              <div class="storage-stat-card">
                <div class="stat-icon available">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatFileSize(storageStats.availableStorage) }}</div>
                  <div class="stat-label">可用空间</div>
                </div>
              </div>
            </div>
            
            <!-- 移动端存储使用率 -->
            <div class="mobile-storage-usage">
              <div class="usage-header">
                <h4>存储使用率</h4>
                <el-button @click="refreshStorageStats" :loading="refreshing" size="small">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
              
              <div class="usage-content">
                <el-progress
                  :percentage="storageUsagePercentage"
                  :stroke-width="16"
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
            </div>
            
            <!-- 移动端存储操作 -->
            <div class="mobile-storage-actions">
              <el-row :gutter="12">
                <el-col :span="12">
                  <el-button type="primary" @click="showCleanupDialog = true" style="width: 100%">
                    <el-icon><Delete /></el-icon>
                    清理存储
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button @click="showStorageAnalysis" style="width: 100%">
                    <el-icon><DataAnalysis /></el-icon>
                    存储分析
                  </el-button>
                </el-col>
              </el-row>
              
              <el-row :gutter="12" style="margin-top: 12px;">
                <el-col :span="24">
                  <el-button @click="exportStorageReport" style="width: 100%">
                    <el-icon><Download /></el-icon>
                    导出报告
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
          <!-- 系统设置 -->
          <div v-if="activeSection === 'settings'" class="admin-section">
            <div class="section-header">
              <h3>系统设置</h3>
              <p>配置系统参数和功能</p>
            </div>
            
            <!-- 移动端系统设置表单 -->
            <div class="mobile-settings-form">
              <el-form label-position="top" class="system-settings-form">
                <!-- 基本设置 -->
                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><Setting /></el-icon>
                    <span>基本设置</span>
                  </div>
                  
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
                </div>
                
                <!-- 用户管理设置 -->
                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><User /></el-icon>
                    <span>用户管理</span>
                  </div>
                  
                  <el-form-item label="允许注册">
                    <el-switch 
                      v-model="systemSettings.allowRegistration"
                      active-text="允许"
                      inactive-text="禁止"
                      active-color="#374151"
                      inactive-color="#6b7280"
                    />
                    <div class="form-description">是否允许新用户注册，关闭后只能由管理员创建用户</div>
                  </el-form-item>
                  
                  <el-form-item label="维护模式">
                    <el-switch 
                      v-model="systemSettings.maintenanceMode"
                      active-text="开启"
                      inactive-text="关闭"
                      active-color="#6b7280"
                      inactive-color="#374151"
                    />
                    <div class="form-description">开启后只有管理员可以访问系统，普通用户将看到维护页面</div>
                  </el-form-item>
                </div>
                
                <!-- 文件上传设置 -->
                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><Upload /></el-icon>
                    <span>文件上传</span>
                  </div>
                  
                  <el-form-item label="最大文件大小">
                    <el-input-number 
                      v-model="systemSettings.maxFileSize" 
                      :min="1" 
                      :max="1000"
                      controls-position="right"
                      style="width: 100%"
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
                      style="width: 100%"
                    />
                    <span class="form-unit">个</span>
                    <div class="form-description">单次最多可以上传的文件数量</div>
                  </el-form-item>
                </div>
                
                <!-- 外观设置 -->
                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><Brush /></el-icon>
                    <span>外观设置</span>
                  </div>
                  
                  <el-form-item label="主题模式">
                    <el-radio-group v-model="systemSettings.themeMode" style="width: 100%">
                      <el-radio-button label="auto" style="flex: 1;">自动</el-radio-button>
                      <el-radio-button label="light" style="flex: 1;">浅色</el-radio-button>
                      <el-radio-button label="dark" style="flex: 1;">深色</el-radio-button>
                    </el-radio-group>
                    <div class="form-description">自动模式会根据系统设置自动切换主题</div>
                  </el-form-item>
                  
                  <el-form-item label="主色调">
                    <div class="color-picker-container">
                      <el-color-picker 
                        v-model="systemSettings.primaryColor"
                        :predefine="predefineColors"
                        show-alpha
                        size="large"
                      />
                      <span class="color-value">{{ systemSettings.primaryColor }}</span>
                    </div>
                    <div class="form-description">系统的主要颜色，影响按钮、链接等元素</div>
                  </el-form-item>
                </div>
                
                <!-- 操作按钮 -->
                <div class="settings-actions">
                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-button type="primary" @click="saveSystemSettings" :loading="savingSettings" style="width: 100%">
                        <el-icon><Setting /></el-icon>
                        保存设置
                      </el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button @click="fetchSystemSettings" :loading="loadingSettings" style="width: 100%">
                        <el-icon><Refresh /></el-icon>
                        重置
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </el-form>
            </div>
          </div>

          <!-- 审核设置（移动端） -->
          <div v-if="activeSection === 'moderation'" class="admin-section">
            <div class="section-header">
              <h3>审核设置</h3>
              <p>配置内容审核（移动端）</p>
            </div>
            <div class="mobile-settings-form">
              <el-form label-position="top" class="system-settings-form">
                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><CircleCheck /></el-icon>
                    <span>基础</span>
                  </div>
                  <el-form-item label="启用审核">
                    <el-switch v-model="moderationForm.enable" />
                  </el-form-item>
                  <el-form-item label="提供商">
                    <el-select v-model="moderationForm.provider" placeholder="选择提供商">
                      <el-option label="SiliconFlow" value="siliconflow" />
                      <el-option label="自研/通用接口" value="custom" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="API URL">
                    <el-input v-model="moderationForm.apiUrl" placeholder="https://..." />
                  </el-form-item>
                  <el-form-item label="API Key">
                    <el-input v-model="moderationForm.apiKey" placeholder="密钥" show-password />
                  </el-form-item>
                  <el-form-item label="模型名称">
                    <el-input v-model="moderationForm.model" placeholder="例如 Pro/deepseek-ai/DeepSeek-V3.2-Exp" />
                  </el-form-item>
                </div>

                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><Tools /></el-icon>
                    <span>策略</span>
                  </div>
                  <el-form-item label="严格度">
                    <el-slider v-model="moderationForm.strictness" :min="0" :max="100" />
                  </el-form-item>
                  <el-form-item label="图片启发式">
                    <el-switch v-model="moderationForm.imageHeuristic" />
                  </el-form-item>
                  <el-form-item label="最大图片字节">
                    <el-input v-model.number="moderationForm.maxImageBytes" placeholder="默认 524288 (512KB)" />
                  </el-form-item>
                </div>

                <div class="settings-group">
                  <div class="group-title">
                    <el-icon><Key /></el-icon>
                    <span>OCR</span>
                  </div>
                  <el-form-item label="OCR API URL">
                    <el-input v-model="moderationForm.ocrApiUrl" placeholder="可选：用于图片文字审核" />
                  </el-form-item>
                  <el-form-item label="OCR API Key">
                    <el-input v-model="moderationForm.ocrApiKey" placeholder="可选" show-password />
                  </el-form-item>
                </div>

                <div class="settings-actions">
                  <div class="settings-action-item">
                    <el-button type="primary" :loading="moderationSaving" @click="saveModeration" style="width: 100%">保存</el-button>
                  </div>
                  <div class="settings-action-item">
                    <el-button :loading="moderationLoading" @click="loadModeration" style="width: 100%">重载</el-button>
                  </div>
                </div>
              </el-form>
            </div>
          </div>
        </el-card>
      </div>
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

    <!-- 用户统计对话框 -->
    <el-dialog
      v-model="showUserStatsDialog"
      :title="`用户统计 - ${selectedUserStats?.username || ''}`"
      :width="isMobile ? '92%' : '640px'"
      :close-on-click-modal="true"
      :class="{ 'mobile-dialog': isMobile, 'grayscale-dialog': true }"
      @close="closeUserStatsDialog"
    >
      <div v-loading="loadingUserStats" class="user-stats-content grayscale">
        <div v-if="userStats" class="stats-grid">
          <!-- 移动端：用户头像和基本信息 -->
          <div v-if="isMobile" class="mobile-user-header">
            <div class="user-avatar-section">
              <el-avatar :size="60" :src="getAvatarUrl(selectedUserStats?.avatar_url)">
                {{ selectedUserStats?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-basic-info">
                <h3>{{ selectedUserStats?.username }}</h3>
                <p>{{ selectedUserStats?.email }}</p>
                <div class="user-tags">
                  <el-tag :type="selectedUserStats?.role === 'admin' ? 'danger' : 'primary'" size="small">
                    {{ selectedUserStats?.role === 'admin' ? '管理员' : '用户' }}
                  </el-tag>
                  <el-tag :type="getStatusTagType(selectedUserStats?.status || '')" size="small">
                    {{ getStatusText(selectedUserStats?.status || '') }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面端：基本信息 -->
          <div v-if="!isMobile" class="stats-section">
            <h4>基本信息</h4>
            <div class="stats-item">
              <span class="label">用户名：</span>
              <span class="value">{{ selectedUserStats?.username }}</span>
            </div>
            <div class="stats-item">
              <span class="label">用户ID：</span>
              <span class="value">{{ selectedUserStats?.id }}</span>
            </div>
            <div class="stats-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ selectedUserStats?.email }}</span>
            </div>
            <div class="stats-item password-item">
              <div class="password-container">
                <span class="label">密码：</span>
                <div class="password-display">
                  <span class="password-value">{{ showPassword ? (userStats.password || '未设置') : '******' }}</span>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="resetSelectedUserPassword"
                    class="password-toggle-btn"
                  >
                    重置密码
                  </el-button>
                </div>
              </div>
              <!-- 验证码输入区域 -->
              <div v-if="passwordVerificationSent && !passwordVerificationExpired" class="password-verification">
                <div class="verification-input">
                  <el-input
                    v-model="passwordVerificationCode"
                    placeholder="请输入验证码"
                    size="small"
                    maxlength="6"
                    class="verification-code-input"
                  />
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="verifyPasswordCode"
                    :disabled="passwordVerificationCode.length !== 6"
                    class="verify-btn-desktop"
                  >
                    验证
                  </el-button>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="sendPasswordVerificationCode"
                    :loading="sendingVerificationCode"
                    :disabled="passwordVerificationCooldown > 0"
                    class="send-code-btn-desktop"
                  >
                    {{ passwordVerificationCooldown > 0 ? `${passwordVerificationCooldown}s` : '发送验证码' }}
                  </el-button>
                </div>
                <div class="verification-timer">
                  <span class="timer-text">验证码有效期：{{ getVerificationTimeLeft() }}</span>
                </div>
              </div>
            </div>
            <div class="stats-item">
              <span class="label">角色：</span>
              <span class="value">{{ selectedUserStats?.role === 'admin' ? '管理员' : '用户' }}</span>
            </div>
            <div class="stats-item">
              <span class="label">状态：</span>
              <span class="value">{{ getStatusText(selectedUserStats?.status || '') }}</span>
            </div>
            <div class="stats-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ selectedUserStats?.created_at ? new Date(selectedUserStats.created_at).toLocaleString() : '未知' }}</span>
            </div>
          </div>

          <!-- 移动端：详细信息卡片 -->
          <div v-if="isMobile" class="mobile-info-cards">
            <!-- 账户信息卡片 -->
            <div class="mobile-info-card">
              <div class="card-header">
                <el-icon><Key /></el-icon>
                <span>账户信息</span>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="info-label">用户名</span>
                  <span class="info-value">{{ selectedUserStats?.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">邮箱</span>
                  <span class="info-value">{{ selectedUserStats?.email }}</span>
                </div>
                <div class="info-item password-item">
                  <span class="info-label">密码</span>
                  <div class="password-display">
                    <span class="password-value">{{ showPassword ? (userStats.password || '未设置') : '******' }}</span>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="resetSelectedUserPassword"
                      class="password-toggle-btn"
                    >
                      重置密码
                    </el-button>
                  </div>
                </div>
                <!-- 验证码输入区域 - 移到密码显示区域下面 -->
                <div v-if="passwordVerificationSent && !passwordVerificationExpired" class="password-verification">
                  <div class="verification-input">
                    <el-input
                      v-model="passwordVerificationCode"
                      placeholder="请输入验证码"
                      size="small"
                      maxlength="6"
                    />
                  </div>
                  <div class="verification-actions-mobile">
                    <el-button 
                      type="success" 
                      size="small" 
                      @click="verifyPasswordCode"
                      :disabled="passwordVerificationCode.length !== 6"
                      class="verify-btn"
                    >
                      验证
                    </el-button>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="sendPasswordVerificationCode"
                      :loading="sendingVerificationCode"
                      :disabled="passwordVerificationCooldown > 0"
                      class="send-code-btn"
                    >
                      {{ passwordVerificationCooldown > 0 ? `${passwordVerificationCooldown}s` : '发送验证码' }}
                    </el-button>
                  </div>
                  <div class="verification-timer">
                    <span class="timer-text">验证码有效期：{{ getVerificationTimeLeft() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-label">注册时间</span>
                  <span class="info-value">{{ selectedUserStats?.created_at ? new Date(selectedUserStats.created_at).toLocaleDateString() : '未知' }}</span>
                </div>
              </div>
            </div>

            <!-- 存储信息卡片 -->
            <div class="mobile-info-card">
              <div class="card-header">
                <el-icon><FolderOpened /></el-icon>
                <span>存储信息</span>
              </div>
              <div class="card-content">
                <div class="storage-progress">
                  <div class="progress-info">
                    <span class="progress-label">存储使用率</span>
                    <span class="progress-percent">{{ userStats.storage_limit > 0 ? Math.round((userStats.used_storage / userStats.storage_limit) * 100) : 0 }}%</span>
                  </div>
                  <el-progress 
                    :percentage="userStats.storage_limit > 0 ? Math.round((userStats.used_storage / userStats.storage_limit) * 100) : 0"
                    :color="userStats.storage_limit > 0 && (userStats.used_storage / userStats.storage_limit) > 0.8 ? '#f56c6c' : '#409eff'"
                    :stroke-width="8"
                  />
                </div>
                <div class="storage-details">
                  <div class="storage-item">
                    <span class="storage-label">已使用</span>
                    <span class="storage-value">{{ formatFileSize(userStats.used_storage || 0) }}</span>
                  </div>
                  <div class="storage-item">
                    <span class="storage-label">总容量</span>
                    <span class="storage-value">{{ formatFileSize(userStats.storage_limit || 0) }}</span>
                  </div>
                  <div class="storage-item">
                    <span class="storage-label">文件数</span>
                    <span class="storage-value">{{ userStats.file_count || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面端：存储统计 -->
          <div v-if="!isMobile" class="stats-section">
            <h4>存储统计</h4>
            <div class="stats-item">
              <span class="label">已使用：</span>
              <span class="value">{{ formatFileSize(userStats.used_storage || 0) }}</span>
            </div>
            <div class="stats-item">
              <span class="label">存储限制：</span>
              <span class="value">{{ formatFileSize(userStats.storage_limit || 0) }}</span>
            </div>
            <div class="stats-item">
              <span class="label">使用率：</span>
              <span class="value">{{ userStats.storage_limit > 0 ? Math.round((userStats.used_storage / userStats.storage_limit) * 100) : 0 }}%</span>
            </div>
            <div class="stats-item">
              <span class="label">文件数量：</span>
              <span class="value">{{ userStats.file_count || 0 }}</span>
            </div>
          </div>

        </div>
        
        <div v-else-if="!loadingUserStats" class="no-stats">
          <el-icon class="no-data-icon"><DataAnalysis /></el-icon>
          <p>暂无统计数据</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUserStatsDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  DataBoard,
  UserFilled,
  Document,
  Setting,
  // ShieldCheck, // not exported, use CircleCheck instead
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
  Picture,
  VideoCamera,
  DataAnalysis,
  Download,
  Refresh,
  Brush,
  FolderOpened,
  // Picture,
  Star,
  Upload,
  Tools,
  View,
  Calendar
} from '@element-plus/icons-vue'
import { formatFileSize, getAvatarUrl } from '@/utils/helpers'
import api from '@/utils/api'

// GeeTest v4 人机验证集成
const geetestScriptUrl = 'https://static.geetest.com/v4/gt4.js'
const geetestCaptchaId = (((import.meta as any).env?.VITE_GEETEST_CAPTCHA_ID as string) || '30d77075542cc161d6518051a937b9a0')
let geetestHandler: any = null
const geetestReady = ref(false)
const geetestMaxWaitMs = 12000

const loadScriptOnce = (src: string) => new Promise<void>((resolve, reject) => {
  const exists = Array.from(document.scripts).some(s => s.src === src)
  if (exists) return resolve()
  const s = document.createElement('script')
  s.src = src
  s.async = true
  s.onload = () => resolve()
  s.onerror = () => reject(new Error('geetest script load failed'))
  document.head.appendChild(s)
})

const ensureGeetest = async (): Promise<boolean> => {
  if (!geetestCaptchaId) return false
  if (geetestReady.value && geetestHandler) return true
  await loadScriptOnce(geetestScriptUrl)
  const initGeetest4: any = (window as any).initGeetest4
  if (!initGeetest4) return false
  return await new Promise<boolean>((resolve) => {
    try {
      initGeetest4({
        captchaId: geetestCaptchaId,
        product: 'bind',
        language: 'zho',
        mask: { outside: true, bgColor: '#0000004d' },
        timeout: 15000
      }, (handler: any) => {
        geetestHandler = handler
        geetestReady.value = !!handler
        try { geetestHandler?.onReady?.(() => {}) } catch {}
        resolve(geetestReady.value)
      })
    } catch {
      resolve(false)
    }
  })
}

// 审核设置表单
const moderationForm = reactive({
  enable: false,
  provider: '',
  apiUrl: '',
  apiKey: '',
  model: '',
  strictness: 70,
  maxImageBytes: 524288,
  httpTimeoutMs: 20000,
  imageHeuristic: true,
  ocrApiUrl: '',
  ocrApiKey: ''
})
// 最大图片大小（数值/单位）派生字段
const maxImageSizeUnit = ref('MB' as 'MB' | 'KB' | 'B')
const maxImageSizeValue = computed<number>({
  get() {
    const bytes = Number(moderationForm.maxImageBytes || 0)
    if (maxImageSizeUnit.value === 'KB') return Math.round(bytes / 1024)
    if (maxImageSizeUnit.value === 'B') return bytes
    return Math.round(bytes / (1024 * 1024))
  },
  set(v: number) {
    const n = Number(v || 0)
    if (maxImageSizeUnit.value === 'KB') moderationForm.maxImageBytes = Math.max(0, Math.round(n * 1024))
    else if (maxImageSizeUnit.value === 'B') moderationForm.maxImageBytes = Math.max(0, Math.round(n))
    else moderationForm.maxImageBytes = Math.max(0, Math.round(n * 1024 * 1024))
  }
})
const moderationLoading = ref(false)
const moderationSaving = ref(false)

const loadModeration = async () => {
  try {
    moderationLoading.value = true
    const { data } = await api.get('/system/moderation')
    moderationForm.enable = !!data.enable
    moderationForm.provider = data.provider || ''
    moderationForm.apiUrl = data.apiUrl || ''
    moderationForm.apiKey = data.apiKey || ''
    moderationForm.model = data.model || ''
    moderationForm.strictness = Number.isFinite(Number(data.strictness)) ? Number(data.strictness) : 70
    moderationForm.maxImageBytes = Number.isFinite(Number(data.maxImageBytes)) ? Number(data.maxImageBytes) : 524288
    moderationForm.httpTimeoutMs = Number.isFinite(Number(data.httpTimeoutMs)) ? Number(data.httpTimeoutMs) : 20000
    // 根据当前值回推初始单位（优先MB，再KB，否则B）
    try {
      if (moderationForm.maxImageBytes % (1024*1024) === 0) maxImageSizeUnit.value = 'MB'
      else if (moderationForm.maxImageBytes % 1024 === 0) maxImageSizeUnit.value = 'KB'
      else maxImageSizeUnit.value = 'B'
    } catch {}
    moderationForm.imageHeuristic = data.imageHeuristic !== false
    moderationForm.ocrApiUrl = data.ocrApiUrl || ''
    moderationForm.ocrApiKey = data.ocrApiKey || ''
  } catch (e:any) {
    ElMessage.error('加载审核设置失败')
  } finally {
    moderationLoading.value = false
  }
}

const saveModeration = async () => {
  try {
    moderationSaving.value = true
    await api.put('/system/moderation', { ...moderationForm })
    ElMessage.success('审核设置保存成功（全局5秒内生效）')
  } catch (e:any) {
    ElMessage.error(e?.response?.data?.message || '保存审核设置失败')
  } finally {
    moderationSaving.value = false
  }
}

onMounted(() => { loadModeration().catch(()=>{}) })

const showCaptcha = async (): Promise<boolean> => {
  if (!geetestCaptchaId) return true
  const ok = await ensureGeetest()
  if (!ok || !geetestHandler) return false
  return await new Promise<boolean>((resolve) => {
    let settled = false
    const cleanup = () => {
      if (settled) return
      settled = true
      // 确保关闭验证框和遮罩
      try {
        if (geetestHandler?.close) geetestHandler.close()
        if (geetestHandler?.hide) geetestHandler.hide()
      } catch (e) {
        console.warn('关闭GeeTest验证框时出错:', e)
      }
    }
    
    const onSuccess = async () => {
      if (settled) return
      settled = true
      try {
        const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null
        if (!validate) { 
          ElMessage.error('请完成人机验证')
          cleanup()
          return resolve(false) 
        }
        
        const { lot_number, captcha_output, pass_token, gen_time } = validate
        
        if (!lot_number || !captcha_output || !pass_token || !gen_time) {
          ElMessage.error('验证码参数不完整，请重新验证')
          cleanup()
          return resolve(false)
        }
        
        const resp = await api.post('/auth/captcha/validate', {
          lot_number, captcha_output, pass_token, gen_time, captcha_id: geetestCaptchaId
        })
        
        if (resp?.data?.success || resp?.data?.result === 'success') {
          cleanup()
          return resolve(true)
        }
        ElMessage.error(resp?.data?.message || resp?.data?.reason || '人机验证失败')
        cleanup()
        resolve(false)
      } catch (e: any) {
        console.error('验证码验证异常:', e)
        ElMessage.error('人机验证服务异常，请稍后重试')
        cleanup()
        resolve(false)
      }
    }
    
    const onError = () => {
      if (settled) return
      settled = true
      ElMessage.error('人机验证出错')
      cleanup()
      resolve(false)
    }
    
    const onClose = () => {
      if (settled) return
      settled = true
      ElMessage.warning('请先完成人机验证')
      cleanup()
      resolve(false)
    }
    
    try {
      geetestHandler?.onSuccess?.(onSuccess)
      geetestHandler?.onError?.(onError)
      geetestHandler?.onClose?.(onClose)
      
      if (geetestHandler.showCaptcha) geetestHandler.showCaptcha()
      else if (geetestHandler.showBox) geetestHandler.showBox()
      
      setTimeout(() => {
        if (!settled) {
          settled = true
          ElMessage.warning('验证超时，请重试')
          cleanup()
          resolve(false)
        }
      }, geetestMaxWaitMs)
    } catch {
      cleanup()
      resolve(false)
    }
  })
}

// 类型定义
interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
  avatar_url?: string
  used_storage: number
  storage_limit: number
  created_at: string
}

interface LogEntry {
  id: number
  timestamp: string
  level: string
  source: string
  message: string
  user_id?: number
}

interface NewUser {
  username: string
  email: string
  password: string
  role: string
}

// 响应式数据
const activeSection = ref('overview')
const refreshing = ref(false)
const savingSettings = ref(false)
const loadingSettings = ref(false)
const creatingUser = ref(false)
const showCreateUserDialog = ref(false)
const selectedUsers = ref<User[]>([])
const userFormRef = ref<FormInstance>()
const openMenus = ref<Set<number>>(new Set()) // 跟踪打开的菜单
const showCleanupDialog = ref(false)

// 用户统计相关
const showUserStatsDialog = ref(false)
const selectedUserStats = ref<User | null>(null)
const userStats = ref<any>(null)
const loadingUserStats = ref(false)
const showPassword = ref(false)
const passwordVerificationCode = ref('')
const passwordVerificationSent = ref(false)
const passwordVerificationExpired = ref(false)
const passwordVerifiedOk = ref(false)
const passwordVerificationExpiry = ref<Date | null>(null)
const sendingVerificationCode = ref(false)
const passwordVerificationCooldown = ref(0)
let passwordVerificationTimer: number | null = null

const startPasswordVerificationCooldown = () => {
  if (passwordVerificationTimer) { clearInterval(passwordVerificationTimer); passwordVerificationTimer = null }
  passwordVerificationCooldown.value = 60
  passwordVerificationTimer = window.setInterval(() => {
    passwordVerificationCooldown.value--
    if (passwordVerificationCooldown.value <= 0) {
      if (passwordVerificationTimer) { clearInterval(passwordVerificationTimer); passwordVerificationTimer = null }
      passwordVerificationCooldown.value = 0
    }
  }, 1000)
}

// 移动端检测
const isMobile = ref(false)

// 移动端标签页配置（使用组件引用，避免字符串名称在移动端未注册导致不渲染）
// 用 markRaw 包裹图标组件，避免 Vue 将组件对象代理为响应式，造成性能开销警告
const mobileTabs = ref([
  { key: 'overview', label: '概览', icon: markRaw(DataBoard) },
  { key: 'users', label: '用户', icon: markRaw(UserFilled) },
  { key: 'logs', label: '日志', icon: markRaw(Document) },
  { key: 'storage', label: '存储', icon: markRaw(Folder) },
  { key: 'settings', label: '设置', icon: markRaw(Setting) },
  { key: 'moderation', label: '审核', icon: markRaw(CircleCheck) }
])

// 系统统计数据
const systemStats = reactive({
  totalUsers: 0,
  totalFiles: 0,
  totalStorage: 0,
  totalMotion: 0,
  totalFolders: 0
})

// 存储分类拆解（图片/视频/动图）
const storageBreakdownImageCount = ref(0)
const storageBreakdownImageBytes = ref(0)
const storageBreakdownVideoCount = ref(0)
const storageBreakdownVideoBytes = ref(0)
const storageBreakdownMotionCount = ref(0)

const imageCount = computed(() => storageBreakdownImageCount.value)
const imageBytes = computed(() => storageBreakdownImageBytes.value)
const videoCount = computed(() => storageBreakdownVideoCount.value)
const videoBytes = computed(() => storageBreakdownVideoBytes.value)
const motionCount = computed(() => storageBreakdownMotionCount.value)

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
            const target = e.target as HTMLElement
            bodyWrapper.scrollLeft = target.scrollLeft
            setTimeout(() => { isScrolling = false }, 10)
          }
        })
        
        // 表体滚动时，同步表头滚动
        bodyWrapper.addEventListener('scroll', (e) => {
          if (!isScrolling) {
            isScrolling = true
            const target = e.target as HTMLElement
            headerWrapper.scrollLeft = target.scrollLeft
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
              const target = e.target as HTMLElement
              if (bodyScrollbar) {
                bodyScrollbar.scrollLeft = target.scrollLeft
              }
              setTimeout(() => { isScrolling = false }, 10)
            }
          })
        }
        
        if (bodyScrollbar) {
          bodyScrollbar.addEventListener('scroll', (e) => {
            if (!isScrolling) {
              isScrolling = true
              const target = e.target as HTMLElement
              if (headerScrollbar) {
                headerScrollbar.scrollLeft = target.scrollLeft
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
// 方法

// 存储统计数据
const storageStats = reactive({
  totalStorage: 0,
  usedStorage: 0,
  availableStorage: 0
})
// 用户数据
const users = ref<User[]>([])
// 日志数据
const logs = ref<LogEntry[]>([])
// 日志筛选
const logFilter = reactive({
  level: '',
  keyword: ''
})

// 用户筛选
const userFilter = reactive({
  search: '',
  role: '',
  status: '',
  createdRange: [],
  lastLoginRange: [],
  sortBy: 'created_at',
  sortOrder: 'desc'
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
  allowedDocumentTypes: ['pdf', 'docx', 'xlsx'],
  allowedDocumentTypesCsv: 'pdf,docx,xlsx',
  thumbnailSize: 300,
  maxStoragePerUser: 0,
  autoCleanLogs: false,
  // 外观设置
  themeMode: 'auto', // auto, light, dark
  primaryColor: '#409eff',
  sidebarWidth: 220,
  enableAnimation: true,
  logoUrl: '',
  faviconUrl: '',
  customCss: '',
  // 安全设置
  minPasswordLength: 6,
  passwordComplexity: 'low', // low, medium, high
  enableLoginLock: false,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 60,
  enableTwoFactor: false,
  // 分享设置
  sharingEnabled: true,
  shareDisabledAt: '' as string | '' ,
  // 通知设置
  enableMaintenanceNotification: false
})

// 记录上次获取的维护模式，保存前做确认
const prevMaintenanceMode = ref(false)

// 预定义颜色
const predefineColors = [
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#c71585',
  '#ff69b4',
  '#ff1493',
  '#dc143c',
  '#b22222',
  '#8b0000',
  '#ff4500',
  '#ff8c00',
  '#ffa500',
  '#ffd700',
  '#ffff00',
  '#9acd32',
  '#32cd32',
  '#00ff00',
  '#00ff7f',
  '#00ced1',
  '#00bfff',
  '#1e90ff',
  '#4169e1',
  '#0000ff',
  '#8a2be2',
  '#9932cc',
  '#9400d3',
  '#4b0082',
  '#800080'
]

// 新用户表单
const newUser = reactive<NewUser>({
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
      validator: (_rule: any, value: string, callback: any) => {
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
  const total = Number(storageStats.totalStorage) || 0
  const used = Number(storageStats.usedStorage) || 0
  
  if (total === 0) return 0
  return Math.round((used / total) * 100)
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
  } catch (error: any) {
    ElMessage.error('刷新数据失败')
  } finally {
    refreshing.value = false
  }
}

// 将部分全局设置立即应用到前端
const applyFrontendSettings = () => {
  try {
    // 主题模式
    const html = document.documentElement
    html.setAttribute('data-theme', systemSettings.themeMode)
    // 主色
    document.documentElement.style.setProperty('--primary-color', systemSettings.primaryColor)
    // 侧边栏宽度（可由布局自适应使用）
    document.documentElement.style.setProperty('--sidebar-width', `${systemSettings.sidebarWidth}px`)
    // favicon
    if (systemSettings.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = systemSettings.faviconUrl
    }
    // 自定义CSS
    let styleEl = document.getElementById('custom-css') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'custom-css'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = systemSettings.customCss || ''
  } catch {
    // 忽略前端应用错误，避免影响主流程
  }
}

// 获取系统统计数据
const fetchSystemStats = async () => {
  try {
    const response = await api.get('/admin/stats')
    const data = response.data
    
    systemStats.totalUsers = Number(data.total_users) || 0
    systemStats.totalFiles = Number(data.total_files) || 0
    systemStats.totalStorage = Number(data.total_file_size) || 0
    systemStats.totalMotion = Number(data.live_count) || 0
    systemStats.totalFolders = Number(data.total_folders) || 0
  } catch (error: any) {
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
  } catch (error: any) {
    throw error
  }
}

// 获取系统日志
const fetchLogs = async () => {
  try {
    const response = await api.get('/admin/logs')
    logs.value = response.data.logs || []
  } catch (error: any) {
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
    
    // 修复：将字节值转换为MB值
    const maxFileSizeBytes = parseInt(settings.max_file_size?.value) || 100 * 1024 * 1024
    systemSettings.maxFileSize = Math.round(maxFileSizeBytes / (1024 * 1024))
    
    systemSettings.maxUploadFiles = parseInt(settings.max_upload_files?.value) || 10
    systemSettings.allowedImageTypes = settings.allowed_image_types?.value?.split(',') || ['jpg', 'png', 'gif', 'webp']
    systemSettings.allowedVideoTypes = settings.allowed_video_types?.value?.split(',') || ['mp4', 'webm', 'mov']
    systemSettings.allowedDocumentTypes = settings.allowed_document_types?.value?.split(',') || ['pdf', 'docx', 'xlsx']
    systemSettings.allowedDocumentTypesCsv = settings.allowed_document_types?.value || 'pdf,docx,xlsx'
    systemSettings.thumbnailSize = parseInt(settings.thumbnail_size?.value) || 300
    const maxStorageBytes = parseInt(settings.max_storage_per_user?.value)
    systemSettings.maxStoragePerUser = isNaN(maxStorageBytes) ? 0 : Math.round(maxStorageBytes / (1024 * 1024))
    systemSettings.autoCleanLogs = settings.auto_clean_logs?.value === 'true'
    
    // 更新外观设置
    systemSettings.themeMode = settings.theme_mode?.value || 'auto'
    systemSettings.primaryColor = settings.primary_color?.value || '#409eff'
    systemSettings.sidebarWidth = parseInt(settings.sidebar_width?.value) || 220
    systemSettings.enableAnimation = settings.enable_animation?.value === 'true'
    systemSettings.logoUrl = settings.logo_url?.value || ''
    systemSettings.faviconUrl = settings.favicon_url?.value || ''
    systemSettings.customCss = settings.custom_css?.value || ''

    // 安全设置
    systemSettings.minPasswordLength = parseInt(settings.min_password_length?.value) || 6
    systemSettings.passwordComplexity = settings.password_complexity?.value || 'low'
    systemSettings.enableLoginLock = settings.enable_login_lock?.value === 'true'
    systemSettings.maxLoginAttempts = parseInt(settings.max_login_attempts?.value) || 5
    systemSettings.lockoutDuration = parseInt(settings.lockout_duration?.value) || 15
    systemSettings.sessionTimeout = parseInt(settings.session_timeout?.value) || 60
    systemSettings.enableTwoFactor = settings.enable_two_factor?.value === 'true'
    // 分享设置
    systemSettings.sharingEnabled = settings.sharing_enabled?.value !== 'false'
    systemSettings.shareDisabledAt = settings.share_disabled_at?.value || ''

    // 通知设置
    systemSettings.enableMaintenanceNotification = settings.enable_maintenance_notification?.value === 'true'

    // 记录维护模式的原值
    prevMaintenanceMode.value = systemSettings.maintenanceMode
  } catch (error: any) {
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
    
    // 确保数据是数字类型，避免NaN
    storageStats.totalStorage = Number(data.total_storage) || 0
    storageStats.usedStorage = Number(data.used_storage) || 0
    storageStats.availableStorage = Number(data.available_storage) || 0
    } catch (error: any) {
      // 获取存储统计失败
    // 如果API不存在，使用系统统计数据
    storageStats.totalStorage = Number(systemStats.totalStorage) || 0
    storageStats.usedStorage = Number(systemStats.totalStorage) || 0
    storageStats.availableStorage = 0
  }
}

// 刷新存储统计
const refreshStorageStats = async () => {
  try {
    await fetchStorageStats()
    ElMessage.success('存储统计已刷新')
  } catch (error: any) {
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
    } as any
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


const handleUserSelectionChange = (checked: any, user: User) => {
  if (checked) {
    if (!selectedUsers.value.includes(user)) {
      selectedUsers.value.push(user)
    }
  } else {
    const index = selectedUsers.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      selectedUsers.value.splice(index, 1)
    }
  }
}

const handleTableSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 菜单状态管理
const toggleMenu = (user: User) => {
  const userId = user.id
  if (openMenus.value.has(userId)) {
    openMenus.value.delete(userId)
  } else {
    // 关闭其他所有菜单
    openMenus.value.clear()
    openMenus.value.add(userId)
  }
}

const isMenuOpen = (user: User) => {
  return openMenus.value.has(user.id)
}

const handleMenuToggle = (visible: boolean, user: User) => {
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
    // 如果点击的不是下拉菜单相关元素，且不是对话框相关元素，关闭所有菜单
    if (!target.closest('.el-dropdown') && 
        !target.closest('.el-dropdown-menu') && 
        !target.closest('.el-dialog') &&
        !target.closest('.el-overlay')) {
      closeAllMenus()
    }
  })
})
// 处理用户卡片点击事件
const handleUserCardClick = async (user: User, evt?: MouseEvent) => {
  try {
    // 如果点击的是操作下拉或按钮，不触发人机验证/详情
    if (evt) {
      const target = evt.target as HTMLElement
      if (target.closest('.el-dropdown') || target.closest('.el-dropdown-menu') || target.closest('.el-button')) {
        return
      }
    }
    // 显示人机验证
    const captchaResult = await showCaptcha()
    if (!captchaResult) {
      ElMessage.warning('人机验证失败')
      return
    }
    
    // 直接显示对话框（保留查看统计）
    await showUserStats(user)
  } catch (error: any) {
    console.error('用户卡片点击处理失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}
const handleUserAction = async (command: string, user: User) => {
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
        
    case 'viewStats':
        await showUserStats(user)
      break
        
    case 'editStorage':
        await manageUserStorage(user)
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
  } catch (error: any) {
    if (error === 'cancel') {
      ElMessage.info('操作已取消')
    } else {
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 表格行点击（Element Plus会传 row, column, event）
const handleTableRowClick = async (row: User, _column: any, event: MouseEvent) => {
  // 操作列或点击在下拉/按钮上时，不触发
  if (_column && (_column.fixed === 'right' || _column.label === '操作')) return
  const target = event.target as HTMLElement
  if (target.closest('.el-dropdown') || target.closest('.el-dropdown-menu') || target.closest('.el-button')) return
  await handleUserCardClick(row, event)
}

// 切换用户角色
const toggleUserRole = async (user: User) => {
  try {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    await api.put(`/admin/users/${user.id}/role`, { role: newRole })
    
    // 更新本地数据
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }
    
    ElMessage.success(`用户角色已更新为${newRole === 'admin' ? '管理员' : '普通用户'}`)
  } catch (error: any) {
    ElMessage.error('切换用户角色失败')
    throw error
  }
}
// 切换用户状态
const toggleUserStatus = async (user: User) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await api.put(`/admin/users/${user.id}/status`, { status: newStatus })
    
    // 更新本地数据
    const userIndex = users.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus
    }
    
    ElMessage.success(`用户状态已更新为${newStatus === 'active' ? '正常' : '已禁用'}`)
  } catch (error: any) {
    ElMessage.error('切换用户状态失败')
    throw error
  }
}

// 切换密码显示
const togglePasswordVisibility = async () => {
  if (!showPassword.value) {
    // 如果当前没有显示密码，需要先进行验证
    if (!passwordVerificationSent.value || passwordVerificationExpired.value) {
      // 显示验证码输入框
      passwordVerificationSent.value = true
      passwordVerificationExpired.value = false
      passwordVerificationExpiry.value = new Date(Date.now() + 5 * 60 * 1000) // 5分钟有效期
      passwordVerificationCode.value = ''
    } else {
      // 验证验证码
      await verifyPasswordCode()
    }
  } else {
    // 隐藏密码
    showPassword.value = false
  }
}

// 发送密码查看验证码
const sendPasswordVerificationCode = async () => {
  if (!selectedUserStats.value) return
  
  try {
    sendingVerificationCode.value = true
    
    // 先进行人机验证
    const captchaResult = await showCaptcha()
    if (!captchaResult) {
      ElMessage.warning('人机验证失败')
      return
    }
    
    // 发送验证码到用户邮箱
    const response = await api.post(`/admin/users/${selectedUserStats.value.id}/view-password/send-code`)
    
    if (response.data.success) {
      passwordVerificationExpiry.value = new Date(Date.now() + 5 * 60 * 1000) // 5分钟有效期
      passwordVerificationCode.value = ''
      ElMessage.success('验证码已发送到用户邮箱')
      startPasswordVerificationCooldown()
    } else {
      ElMessage.error(response.data.message || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('发送密码验证码失败:', error)
    ElMessage.error('发送验证码失败，请重试')
  } finally {
    sendingVerificationCode.value = false
  }
}

// 验证密码查看验证码
const verifyPasswordCode = async () => {
  if (!selectedUserStats.value || passwordVerificationCode.value.length !== 6) return
  
  try {
    // 验证验证码
    const response = await api.post(`/admin/users/${selectedUserStats.value.id}/view-password/verify`, {
      code: passwordVerificationCode.value
    })
    
    if (response.data.success) {
      // 验证成功
      userStats.value.password = response.data.passwordMaskedHash || '****'
      showPassword.value = true
      passwordVerifiedOk.value = true
      passwordVerificationSent.value = false
      passwordVerificationExpired.value = false
      passwordVerificationCode.value = ''
      ElMessage.success('验证成功')
    } else {
      ElMessage.error(response.data.message || '验证码错误或已过期')
    }
  } catch (error: any) {
    console.error('验证密码验证码失败:', error)
    ElMessage.error('验证失败，请重试')
  }
}

// 已移除获取用户实时明文密码的接口调用，改为使用后端返回的密码哈希摘要掩码

// 生成随机密码
const generateRandomPassword = (length = 12): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+' // 去除易混字符
  let res = ''
  for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)]
  return res
}

// 验证通过后，重置所选用户的密码并提示新密码
const resetSelectedUserPassword = async () => {
  if (!selectedUserStats.value) return
  
  // 如果还没有验证通过，先显示验证码输入框
  if (!passwordVerifiedOk.value) {
    // 显示验证码输入框
    passwordVerificationSent.value = true
    passwordVerificationExpired.value = false
    passwordVerificationExpiry.value = new Date(Date.now() + 5 * 60 * 1000) // 5分钟有效期
    passwordVerificationCode.value = ''
    ElMessage.info('请先完成验证码校验')
    return
  }
  
  // 验证通过后，执行重置密码
  try {
    const newPwd = generateRandomPassword(12)
    await api.put(`/admin/users/${selectedUserStats.value.id}/password`, { password: newPwd })
    await ElMessageBox.alert(`新密码：${newPwd}`, '重置成功', { confirmButtonText: '我已保存' })
    // 重置状态，要求再次验证才可再次重置
    passwordVerifiedOk.value = false
    showPassword.value = false
    passwordVerificationSent.value = false
  } catch (e: any) {
    ElMessage.error('重置密码失败，请重试')
  }
}
// 获取验证码剩余时间
const getVerificationTimeLeft = () => {
  if (!passwordVerificationExpiry.value) return '0:00'
  
  const now = new Date()
  const diff = passwordVerificationExpiry.value.getTime() - now.getTime()
  
  if (diff <= 0) {
    passwordVerificationExpired.value = true
    return '已过期'
  }
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
// 显示用户统计
const showUserStats = async (user: User) => {
  try {
    selectedUserStats.value = user
    loadingUserStats.value = true
    showUserStatsDialog.value = true
    
    // 重置密码验证状态
    showPassword.value = false
    passwordVerificationSent.value = false
    passwordVerificationExpired.value = false
    passwordVerificationCode.value = ''
    passwordVerificationExpiry.value = null
    passwordVerifiedOk.value = false
    
    // 获取用户统计数据 - 从后端实时获取
    const response = await api.get(`/admin/users/${user.id}/stats`)
    
    // 检查API响应结构
    if (response.data.user && response.data.dataStats && response.data.storage) {
      // 后端返回的数据结构: {user: {...}, dataStats: {...}, storage: {...}}
      const { user: userData, dataStats, storage } = response.data
      // 使用后端实时用户信息更新悬浮窗基本信息（含用户ID）
      selectedUserStats.value = {
        ...(selectedUserStats.value || {} as any),
        ...userData
      } as any
      
      // 确保存储信息是从后端实时获取的真实数据（兼容不同字段名）
      userStats.value = {
        // 用户基本信息
        username: userData.username,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        created_at: userData.created_at,
        // 存储信息
        used_storage: (storage.used_storage ?? storage.used ?? 0),
        storage_limit: (storage.storage_limit ?? storage.limit ?? 0),
        file_count: storage.file_count || 0,
        // 统计数据
        login_count: dataStats.login_count || 0,
        upload_count: dataStats.upload_count || 0,
        download_count: dataStats.download_count || 0,
        last_login: dataStats.last_login || null,
        password: userData.password || null
      }
    } else if (response.data.success) {
      // 确保存储信息是从后端实时获取的真实数据（兼容旧格式字段名）
      userStats.value = {
        ...response.data,
        // 确保存储相关字段存在且有值
        used_storage: (response.data.used_storage ?? response.data.used ?? 0),
        storage_limit: (response.data.storage_limit ?? response.data.limit ?? 0),
        file_count: response.data.file_count || 0,
        // 其他统计信息
        login_count: response.data.login_count || 0,
        upload_count: response.data.upload_count || 0,
        download_count: response.data.download_count || 0,
        last_login: response.data.last_login || null,
        password: response.data.password || null
      }
      // 如果旧格式包含基本用户信息，也尽量刷新选中用户数据
      try {
        const maybeUser = response.data.user || response.data
        if (maybeUser && (maybeUser.id || maybeUser.username)) {
          selectedUserStats.value = {
            ...(selectedUserStats.value || {} as any),
            ...maybeUser
          } as any
        }
      } catch {}
    } else {
      console.error('API返回失败:', response.data)
      throw new Error(response.data.message || '获取用户统计失败')
    }
    
  } catch (error: any) {
    console.error('获取用户统计失败 - 完整错误信息:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config,
      stack: error.stack
    })
    
    // 检查是否是404错误（API不存在）
    if (error.response?.status === 404) {
      // 使用用户列表中的基本信息作为备用数据
      userStats.value = {
        used_storage: user.used_storage || 0,
        storage_limit: user.storage_limit || 0,
        file_count: 0, // 用户列表中没有文件数信息
        login_count: 0,
        upload_count: 0,
        download_count: 0,
        last_login: null,
        password: null,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at
      }
      
      ElMessage.warning('用户统计API暂不可用，显示基本信息')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问用户统计信息')
      showUserStatsDialog.value = false
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
      showUserStatsDialog.value = false
    } else {
      // 显示更详细的错误信息
      const errorMsg = error.response?.data?.message || error.message || '获取用户统计失败'
      console.error('具体错误信息:', errorMsg)
      
      // 如果API调用失败，尝试使用用户基本信息作为备用
      userStats.value = {
        used_storage: user.used_storage || 0,
        storage_limit: user.storage_limit || 0,
        file_count: 0,
        login_count: 0,
        upload_count: 0,
        download_count: 0,
        last_login: null,
        password: null,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at
      }
      
      ElMessage.warning(`用户统计API调用失败: ${errorMsg}，显示基本信息`)
    }
  } finally {
    loadingUserStats.value = false
  }
}

// 关闭用户统计对话框
const closeUserStatsDialog = () => {
  showUserStatsDialog.value = false
  selectedUserStats.value = null
  userStats.value = null
  showPassword.value = false
  passwordVerificationSent.value = false
  passwordVerificationExpired.value = false
  passwordVerificationCode.value = ''
  passwordVerificationExpiry.value = null
}

// 管理用户存储
const manageUserStorage = async (user: User) => {
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
            .catch((error: any) => {
              ElMessage.error('更新存储限制失败')
              instance.confirmButtonLoading = false
            })
        } else {
          done()
        }
      }
    })
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('管理用户存储失败')
    }
  }
}

// 重置用户密码
const resetUserPassword = async (user: User) => {
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
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

// 强制用户登出
const forceUserLogout = async (user: User) => {
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
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('强制登出失败')
    }
  }
}

// 删除用户
const deleteUser = async (user: User) => {
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
    if (userFilter.createdRange?.length === 2) {
      params.created_from = userFilter.createdRange[0]
      params.created_to = userFilter.createdRange[1]
    }
    if (userFilter.lastLoginRange?.length === 2) {
      params.last_login_from = userFilter.lastLoginRange[0]
      params.last_login_to = userFilter.lastLoginRange[1]
    }
    if (userFilter.sortBy) params.sort_by = userFilter.sortBy
    if (userFilter.sortOrder) params.sort_order = userFilter.sortOrder
    
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
  userFilter.createdRange = []
  userFilter.lastLoginRange = []
  userFilter.sortBy = 'created_at'
  userFilter.sortOrder = 'desc'
  
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
  const headers = ['时间', '级别', '来源', '消息', '用户ID'] as const
  type HeaderKey = '时间' | '级别' | '来源' | '消息' | '用户ID'
  const csvContent = [
    headers.join(','),
    ...logData.map(row => 
      headers.map(header => `"${((row as any)[header] || '').toString().replace(/"/g, '""')}"`).join(',')
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
  if (systemSettings.minPasswordLength < 4) {
    ElMessage.error('最小密码长度不能小于4')
    return
  }
  if (systemSettings.enableLoginLock && systemSettings.maxLoginAttempts < 3) {
    ElMessage.error('启用登录锁定时，最大失败次数需≥3')
    return
  }
  
  if (systemSettings.systemName.trim().length === 0) {
    ElMessage.error('系统名称不能为空')
    return
  }
  
  savingSettings.value = true
  try {
    if (!prevMaintenanceMode.value && systemSettings.maintenanceMode) {
      await ElMessageBox.confirm(
        '你将开启维护模式，普通用户将无法访问，确认继续？',
        '确认开启维护模式',
        { type: 'warning', confirmButtonText: '确认开启', cancelButtonText: '取消' }
      )
    }
    // 探测后端是否支持分享设置（向后兼容旧后端）
    let shareApiSupported = true
    try {
      await api.get('/system/share-status', { timeout: 3000 })
    } catch (_) {
      shareApiSupported = false
    }

    const settings: Record<string, string> = {
      system_name: systemSettings.systemName.trim(),
      enable_registration: systemSettings.allowRegistration.toString(),
      maintenance_mode: systemSettings.maintenanceMode.toString(),
      max_file_size: systemSettings.maxFileSize.toString(),
      max_upload_files: systemSettings.maxUploadFiles.toString(),
      allowed_image_types: systemSettings.allowedImageTypes.join(','),
      allowed_video_types: systemSettings.allowedVideoTypes.join(','),
      allowed_document_types: (systemSettings.allowedDocumentTypesCsv || systemSettings.allowedDocumentTypes.join(',')).trim(),
      thumbnail_size: systemSettings.thumbnailSize.toString(),
      auto_clean_logs: systemSettings.autoCleanLogs.toString(),
      // 外观与前端行为设置
      theme_mode: systemSettings.themeMode,
      primary_color: systemSettings.primaryColor,
      sidebar_width: systemSettings.sidebarWidth.toString(),
      enable_animation: systemSettings.enableAnimation.toString(),
      logo_url: systemSettings.logoUrl,
      favicon_url: systemSettings.faviconUrl,
      custom_css: systemSettings.customCss,
      // 存储（每用户上限，MB => 后端转换）
      max_storage_per_user: systemSettings.maxStoragePerUser.toString(),
      // 安全设置
      min_password_length: systemSettings.minPasswordLength.toString(),
      password_complexity: systemSettings.passwordComplexity,
      enable_login_lock: systemSettings.enableLoginLock.toString(),
      max_login_attempts: systemSettings.maxLoginAttempts.toString(),
      lockout_duration: systemSettings.lockoutDuration.toString(),
      session_timeout: systemSettings.sessionTimeout.toString(),
      enable_two_factor: systemSettings.enableTwoFactor.toString(),
      // 通知设置
      enable_maintenance_notification: systemSettings.enableMaintenanceNotification.toString()
    }
    // 仅当后端支持时再提交分享设置，避免旧后端校验失败
    if (shareApiSupported) {
      settings['sharing_enabled'] = systemSettings.sharingEnabled.toString()
      if (systemSettings.sharingEnabled === false) {
        settings['share_disabled_at'] = new Date().toISOString().slice(0,19).replace('T',' ')
      }
    }
    await api.put('/admin/settings', { settings })
    ElMessage.success('系统设置保存成功')
    prevMaintenanceMode.value = systemSettings.maintenanceMode
    // 全站强制刷新，确保加载最新系统设置
    setTimeout(() => { window.location.reload() }, 800)
    
    // 发送全局事件通知其他组件设置已更新
    window.dispatchEvent(new CustomEvent('system-settings-changed', {
      detail: {
        enable_animation: systemSettings.enableAnimation,
        theme_mode: systemSettings.themeMode,
        primary_color: systemSettings.primaryColor,
        sidebar_width: systemSettings.sidebarWidth
      }
    }))
    applyFrontendSettings()
    
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
    } catch (error: any) {
      // 保存系统设置失败
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
    ElMessage.error('保存设置失败')
    }
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
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
      <h4 style="color: #409eff; margin-bottom: 10px;">外观设置：</h4>
      <p><strong>主题模式：</strong>${systemSettings.themeMode === 'auto' ? '自动' : systemSettings.themeMode === 'light' ? '浅色' : '深色'}</p>
      <p><strong>主色调：</strong><span style="color: ${systemSettings.primaryColor}; font-weight: bold;">${systemSettings.primaryColor}</span></p>
      <p><strong>侧边栏宽度：</strong>${systemSettings.sidebarWidth}px</p>
      <p><strong>页面动画：</strong>${systemSettings.enableAnimation ? '开启' : '关闭'}</p>
      <p><strong>Logo地址：</strong>${systemSettings.logoUrl || '使用默认Logo'}</p>
      <p><strong>网站图标：</strong>${systemSettings.faviconUrl || '使用默认图标'}</p>
      <p><strong>自定义CSS：</strong>${systemSettings.customCss ? '已设置' : '未设置'}</p>
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

// 移动端检测函数
const checkMobile = () => {
  const width = window.innerWidth
  // 使用更精确的断点：768px以下为移动端，768px-1024px为平板，1024px以上为桌面端
  isMobile.value = width < 768
}

// 监听窗口大小变化
const handleResize = () => {
  checkMobile()
  // 延迟调整表格宽度，确保DOM更新完成
  setTimeout(() => {
    adjustTableWidth()
  }, 100)
}
// 生命周期
onMounted(async () => {
  try {
    // 检测移动端
    checkMobile()
    window.addEventListener('resize', handleResize)
    
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
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
// 全局按钮样式覆盖 - 确保所有按钮使用灰白黑三色
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
  border: none !important;
  color: white !important;
  
  &:hover {
    background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
  }
}

:deep(.el-button--default) {
  background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
  
  &:hover {
    background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
    border-color: #9ca3af !important;
  }
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  border: none !important;
  color: white !important;
  
  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
  }
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
  border: none !important;
  color: white !important;
  
  &:hover {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  }
}

// 全局开关样式覆盖 - 确保所有开关使用灰白黑三色
:deep(.el-switch) {
  .el-switch__core {
    background-color: #d1d5db !important;
    border-color: #d1d5db !important;
  }
  
  &.is-checked .el-switch__core {
    background-color: #374151 !important;
    border-color: #374151 !important;
  }
  
  .el-switch__action {
    background-color: white !important;
  }
}

// 全局单选按钮组样式覆盖 - 确保所有单选按钮使用灰白黑三色
:deep(.el-radio-group) {
  .el-radio-button {
    .el-radio-button__inner {
      background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
      border: 1px solid #d1d5db !important;
      color: #374151 !important;
      
      &:hover {
        background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
        border-color: #9ca3af !important;
      }
    }
    
    &.is-active .el-radio-button__inner {
      background: linear-gradient(135deg, #374151, #111827) !important;
      border-color: #374151 !important;
      color: white !important;
      
      &:hover {
        background: linear-gradient(135deg, #111827, #000000) !important;
      }
    }
  }
}

// 全局复选框组样式覆盖 - 确保所有复选框使用灰白黑三色
:deep(.el-checkbox-group) {
  .el-checkbox {
    .el-checkbox__input {
      .el-checkbox__inner {
        background-color: #f9fafb !important;
        border: 1px solid #d1d5db !important;
        
        &:hover {
          border-color: #9ca3af !important;
        }
      }
      
      &.is-checked .el-checkbox__inner {
        background-color: #374151 !important;
        border-color: #374151 !important;
        
        &::after {
          border-color: white !important;
        }
      }
    }
    
    .el-checkbox__label {
      color: #374151 !important;
    }
  }
}

// 全局侧边栏按钮样式覆盖 - 确保所有侧边栏按钮使用灰白黑三色
:deep(.sidebar) {
  .collapse-btn {
    background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
    
    &:hover {
      background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
      border-color: #9ca3af !important;
    }
  }
  
  .user-menu-btn {
    background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
    
    &:hover {
      background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
      border-color: #9ca3af !important;
    }
  }
  
  .el-menu-item {
    color: #374151 !important;
    
    &:hover {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
      color: #111827 !important;
    }
    
    &.is-active {
      background: linear-gradient(135deg, #374151, #111827) !important;
      color: white !important;
      
      &:hover {
        background: linear-gradient(135deg, #111827, #000000) !important;
      }
    }
  }
}

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
                box-shadow: 0 0 0 1px #d1d5db inset !important;
                
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
                box-shadow: 0 0 0 1px #d1d5db inset !important;
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
          background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
          border: none !important;
          
          &:hover {
            background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
          }
        }
      }
    }
  }
}
.admin-center-page {
  padding: 24px; // 统一设置所有方向的内边距
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px 0;
  background: linear-gradient(135deg, #374151 0%, #111827 100%);
  border-radius: 12px;
  color: white;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    
    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px 0;
        color: white;
      }
      
      .page-subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
      }
    }
    
    .header-actions {
      .el-button {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }
}
.admin-center-content {
  // 移除所有内边距，让父级容器控制间距
  
  // 重置Element Plus栅格系统，保持响应式布局
  :deep(.el-row) {
    display: flex !important;
    flex-wrap: nowrap !important; // 改为不换行，保持侧边栏在左侧
    margin-left: 0 !important;
    margin-right: 0 !important;
    gap: 24px; // 使用gap替代Element Plus的默认间距
    
    // 覆盖内联样式
    &[style*="margin-left"] {
      margin-left: 0 !important;
    }
    
    &[style*="margin-right"] {
      margin-right: 0 !important;
    }
    
    .el-col {
      padding-left: 0 !important;
      padding-right: 0 !important;
      flex: 0 0 auto !important;
      
      // 覆盖内联样式
      &[style*="padding-left"] {
        padding-left: 0 !important;
      }
      
      &[style*="padding-right"] {
        padding-right: 0 !important;
      }
    }
  }
  
  // 额外的强制重置
  :deep(.el-col) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    flex: 0 0 auto !important;
    
    &[style*="padding-left"] {
      padding-left: 0 !important;
    }
    
    &[style*="padding-right"] {
      padding-right: 0 !important;
    }
  }
  
  .admin-nav-card {
    .admin-menu {
      border: none;
      
      :deep(.el-menu-item) {
        height: 48px;
        line-height: 48px;
        margin-bottom: 4px;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &.is-active {
          background: linear-gradient(135deg, #374151 0%, #111827 100%);
          color: white;
          
          .el-icon {
            color: white;
          }
        }
        
        &:hover {
          background: #f0f9ff;
          color: #111827;
        }
        
        .el-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        span {
          font-weight: 500;
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
        gap: 16px;
        display: flex !important;
        flex-wrap: nowrap !important; // 桌面端不换行
        
        :deep(.el-col) {
          padding-left: 0 !important;
          padding-right: 0 !important;
          flex: 0 0 auto !important;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f0f0f0;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            border-color: #e0e0e0;
          }
          
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
              background: linear-gradient(135deg, #374151 0%, #111827 100%);
            }
            
            &.files {
              background: linear-gradient(135deg, #6b7280, #4b5563);
            }
            
            &.storage {
              background: linear-gradient(135deg, #4b5563, #374151);
            }

            // 补全缺失的图标样式：文件夹与动图/实况
            &.folder {
              background: linear-gradient(135deg, #52525b, #262626);
            }
            &.motion {
              background: linear-gradient(135deg, #111111, #000000);
            }
          }
          
          .stat-info {
            flex: 1;
            
            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #2c3e50;
              line-height: 1.2;
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 14px;
              color: #7f8c8d;
              margin-bottom: 8px;
            }
            
            .stat-trend {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              
              .trend-icon {
                font-size: 12px;
                
                &.up {
                  color: #374151;
                }
                
                &.down {
                  color: #6b7280;
                }
              }
              
              .trend-text {
                color: #95a5a6;
                font-weight: 500;
              }
            }
          }
        }
      }

      // 窄屏自动换行，避免卡片被压缩
      @media (max-width: 1200px) {
        .stats-cards {
          flex-wrap: wrap !important;
          :deep(.el-col) { flex: 1 1 48% !important; min-width: 280px; }
        }
      }
      @media (max-width: 768px) {
        .stats-cards { gap: 12px; }
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
        
        .quick-actions-row {
          gap: 12px;
          display: flex !important;
          flex-wrap: nowrap !important; // 桌面端不换行
          
          :deep(.el-col) {
            padding-left: 0 !important;
            padding-right: 0 !important;
            flex: 0 0 auto !important;
          }
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
        max-width: 100%;
        min-width: 0;
        
        :deep(.el-avatar) {
          flex-shrink: 0;
          flex-grow: 0;
          border-radius: 50% !important;
          overflow: hidden !important;
          width: 32px !important;
          height: 32px !important;
          min-width: 32px;
          min-height: 32px;
        }
        :deep(.el-avatar--circle) {
          flex-shrink: 0;
          flex-grow: 0;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          min-width: 32px;
          min-height: 32px;
          overflow: hidden !important;
        }
        :deep(.el-avatar img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 50% !important;
          display: block !important;
        }
        :deep(.el-avatar__img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 50% !important;
          display: block !important;
        }
        
        .username-text {
              font-weight: 500;
          color: #303133;
          max-width: 100px;
          flex: 1 1 auto;
          flex-shrink: 1;
          min-width: 0;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
                background: linear-gradient(135deg, #374151 0%, #111827 100%);
              }
              
              &.used {
                background: linear-gradient(135deg, #6b7280, #4b5563);
              }
              
              &.available {
                background: linear-gradient(135deg, #4b5563, #374151);
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

/* 审核设置样式（黑白灰） */
.moderation-form {
  --card-bg: #fff;
  --text: #1f1f1f;
  --muted: #6f6f6f;
  --border: #e5e5e5;
  --input-bg: #fafafa;
}
.moderation-form :deep(.el-form-item__label) { color: var(--muted); }
.moderation-form :deep(.el-input__wrapper) { background: var(--input-bg); box-shadow: none; }
.moderation-form :deep(.el-input__inner) { color: var(--text); }
.moderation-form :deep(.el-select .el-input__wrapper) { background: var(--input-bg); box-shadow: none; }
.moderation-form .strict-row { display: flex; align-items: center; gap: 12px; width: 100%; }
.moderation-form .strict-value { color: var(--text); font-weight: 600; min-width: 28px; text-align: right; }

// 审核设置 - 桌面端基础布局（按钮左右排列）
.moderation-form .settings-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}
.moderation-form .settings-action-item {
  flex: 0 0 auto;
  min-width: 80px;
}
.moderation-form .settings-action-item .el-button {
  height: 36px;
  font-size: 14px;
  border-radius: 6px;
  white-space: nowrap;
}

// 审核设置 - 平板适配 (992px - 1200px)
@media (max-width: 1200px) {
  .moderation-form {
    :deep(.el-form-item) {
      margin-bottom: 20px;
    }
    :deep(.el-form-item__label) {
      font-size: 13px;
    }
    :deep(.el-input__inner),
    :deep(.el-select__input) {
      font-size: 13px;
    }
    .strict-row {
      gap: 10px;
    }
  }
}

// 审核设置 - 小平板适配 (768px - 992px)
@media (max-width: 992px) {
  .moderation-form {
    :deep(.el-form) {
      display: flex;
      flex-direction: column;
    }
    :deep(.el-form-item) {
      display: flex;
      flex-direction: column;
      margin-bottom: 18px;
    }
    :deep(.el-form-item__label) {
      width: 100% !important;
      text-align: left;
      padding-bottom: 6px;
      font-size: 13px;
      line-height: 1.4;
    }
    :deep(.el-form-item__content) {
      margin-left: 0 !important;
      width: 100%;
    }
    :deep(.el-select) {
      width: 100%;
    }
    :deep(.el-input) {
      width: 100%;
    }
    :deep(.el-switch) {
      align-self: flex-start;
    }
    .strict-row {
      flex-direction: row;
      gap: 8px;
      .el-input {
        flex: 1;
      }
      .strict-value {
        font-size: 13px;
        min-width: 24px;
      }
    }
    // 最大图片大小那一行
    > .el-form-item:has(.el-select) {
      :deep(.el-form-item__content) {
        flex-wrap: wrap;
      }
    }
  }

  // 平板下隐藏桌面端的 label-width 提示
  .moderation-form {
    :deep(.el-form-item__label)::after {
      display: none;
    }
  }
}

// 审核设置 - 移动端适配 (< 768px)
@media (max-width: 768px) {
  .moderation-form {
    padding: 0;

    :deep(.el-form-item) {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      &:last-of-type {
        border-bottom: none;
      }
    }
    :deep(.el-form-item__label) {
      width: 100% !important;
      text-align: left;
      padding-bottom: 4px;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
      font-weight: 500;
    }
    :deep(.el-form-item__content) {
      margin-left: 0 !important;
      width: 100%;
    }
    :deep(.el-input__wrapper) {
      min-height: 40px;
      border-radius: 8px;
    }
    :deep(.el-input__inner) {
      font-size: 14px;
    }
    :deep(.el-select) {
      width: 100%;
      :deep(.el-select__wrapper) {
        min-height: 40px;
        border-radius: 8px;
      }
    }
    :deep(.el-switch) {
      align-self: flex-start;
      transform: scale(0.9);
    }
    :deep(.el-slider) {
      width: 100%;
    }
    .strict-row {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      .el-input {
        width: 100%;
      }
      .strict-value {
        align-self: flex-end;
        font-size: 12px;
        color: #909399;
        font-weight: 400;
        min-width: unset;
        text-align: right;
      }
    }
    // 按钮区域 - 移动端垂直堆叠
    .el-form-item:last-child {
      border-bottom: none;
      margin-top: 8px;
    }
    .settings-actions {
      flex-direction: column;
      gap: 10px;
      .settings-action-item {
        width: 100%;
        min-width: unset;
      }
    }
  }
}

// 审核设置 - 超小屏适配 (< 480px)
@media (max-width: 480px) {
  .moderation-form {
    :deep(.el-form-item__label) {
      font-size: 12px;
    }
    :deep(.el-input__wrapper) {
      min-height: 38px;
    }
    :deep(.el-select__wrapper) {
      min-height: 38px;
    }
    :deep(.el-switch) {
      transform: scale(0.85);
    }
    .strict-row {
      .el-input .el-input__wrapper {
        min-height: 38px;
      }
    }
  }
}

// ==================== 移动端用户卡片样式优化 ====================
.mobile-user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .user-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    
    // 添加微妙的渐变背景
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #374151, #6b7280, #9ca3af, #6b7280);
      opacity: 0.6;
    }
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-4px);
      border-color: #374151;
    }
    
    &:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    .user-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        min-width: 0;
        
        .el-avatar {
          flex-shrink: 0;
          flex-grow: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 2px solid #fff;
        }
        
        .user-details {
          flex: 1;
          min-width: 0;
          
          .username {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.2;
          }
          
          .email {
            font-size: 14px;
            color: #909399;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.3;
          }
        }
      }
      
      .user-status {
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-end;
        
        .el-tag {
          border-radius: 6px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    .user-card-content {
      margin-bottom: 20px;
      
      .storage-section {
        margin-bottom: 16px;
        
        .storage-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .storage-info {
          .el-progress {
            margin-bottom: 8px;
            
            :deep(.el-progress-bar__outer) {
              border-radius: 6px;
              background: #f0f2f5;
            }
            
            :deep(.el-progress-bar__inner) {
              border-radius: 6px;
            }
          }
          
          .storage-text {
            font-size: 13px;
            color: #606266;
            text-align: center;
            font-weight: 500;
          }
        }
      }
      
      .time-section {
        .time-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        .time-text {
          font-size: 13px;
          color: #606266;
          font-weight: 500;
        }
      }
    }
    
    .user-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
      
      .el-checkbox {
        margin: 0;
        
        :deep(.el-checkbox__label) {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
      }
      
      .el-dropdown {
        .el-button {
          min-width: 90px;
          height: 36px;
          border-radius: 8px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          
          // 添加点击波纹效果
          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
            pointer-events: none;
          }
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          &:active {
            transform: translateY(0) scale(0.98);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            
            &::before {
              width: 200px;
              height: 200px;
            }
          }
          
          // 移动端触摸优化
          @media (max-width: 768px) {
            &:active {
              background: rgba(64, 158, 255, 0.2) !important;
              transform: scale(0.95) !important;
            }
            
            // 添加触摸反馈
            &:focus {
              outline: none;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #fafafa;
    border-radius: 16px;
    border: 2px dashed #e4e7ed;
    
    :deep(.el-empty__description) {
      color: #909399;
      font-size: 14px;
    }
  }
}
// ==================== 移动端用户筛选样式优化 ====================
.mobile-user-filters {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 24px;
  padding: 0;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  // 添加装饰性背景元素
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #374151 0%, #6b7280 50%, #9ca3af 100%);
    border-radius: 24px 24px 0 0;
  }
  
  // 添加微妙的背景纹理
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(64, 158, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(103, 194, 58, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  
  // 用户筛选表单标题样式
  .user-filter-header {
    padding: 24px 24px 16px 24px;
    position: relative;
    z-index: 1;
    
    .filter-title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .filter-icon {
        font-size: 20px;
        color: #374151;
        margin-right: 12px;
        background: linear-gradient(135deg, #374151, #6b7280);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      span {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
        letter-spacing: 0.5px;
      }
    }
    
    .filter-subtitle {
      font-size: 14px;
      color: #909399;
      font-weight: 400;
      margin-left: 32px;
      line-height: 1.4;
    }
  }
  
  // 表单容器样式
  .user-filter-form {
    padding: 0 24px 24px 24px;
    position: relative;
    z-index: 1;
  }
  
  // 搜索区域样式
  .search-section {
    margin-bottom: 20px;
    
    .search-item {
      margin-bottom: 0;
      
      .el-form-item__label {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(135deg, #374151, #6b7280);
          border-radius: 2px;
          margin-right: 8px;
        }
      }
      
      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 2px solid #d1d5db;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 56px !important;
          background: #ffffff;
          
          &:hover {
            border-color: #c0c4cc;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &.is-focus {
            border-color: #374151;
            box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15);
            transform: translateY(-2px);
          }
          
          .el-input__inner {
            height: 54px !important;
            font-size: 16px !important;
            padding: 0 20px !important;
            color: #303133;
            
            &::placeholder {
              color: #c0c4cc;
              font-size: 15px;
            }
          }
          
          .el-input__prefix {
            padding-left: 20px;
            
            .search-prefix-icon {
              font-size: 18px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  // 筛选区域样式
  .filter-section {
    margin-bottom: 20px;
    
    .filter-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-form-item__label {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(135deg, #374151, #6b7280);
          border-radius: 2px;
          margin-right: 8px;
        }
      }
      
      .filter-select {
        :deep(.el-select__wrapper) {
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 2px solid #d1d5db;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 56px !important;
          background: #ffffff;
          
          &:hover {
            border-color: #c0c4cc;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &.is-focus {
            border-color: #374151;
            box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15);
            transform: translateY(-2px);
          }
          
          .el-select__selection {
            height: 54px !important;
            
            .el-select__selected-item {
              font-size: 16px !important;
              color: #303133;
              padding: 0 20px !important;
              line-height: 54px !important;
              font-weight: 500;
            }
            
            .el-select__placeholder {
              font-size: 15px !important;
              color: #c0c4cc;
              padding: 0 20px !important;
              line-height: 54px !important;
            }
          }
        }
      }
    }
  }
  
  // 操作按钮区域样式
  .user-action-section {
    margin-top: 24px;
    
    .user-action-buttons {
      display: flex;
      gap: 12px;
      
      .user-action-btn {
        flex: 1;
        height: 56px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: none;
        position: relative;
        overflow: hidden;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        &:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        
        .el-icon {
          margin-right: 4px !important;
          font-size: 13px !important;
        }
        
        span {
          font-size: 13px !important;
          font-weight: 600 !important;
        }
        
        &.primary-btn {
          background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
          color: #ffffff !important;
          
          &:hover {
            background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
          }
        }
        
        &.secondary-btn {
          background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
          color: #ffffff !important;
          
          &:hover {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
          }
        }
      }
    }
  }
}
// ==================== 移动端筛选表单样式优化 ====================
.mobile-filters {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-form-item__label {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 10px;
        line-height: 1.4;
        display: block;
        width: 100%;
      }
      
      .el-form-item__content {
        .el-input {
          :deep(.el-input__wrapper) {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #d1d5db;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 48px;
            
            &:hover {
              border-color: #c0c4cc;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }
            
            &.is-focus {
              border-color: #374151;
              box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
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
            
            .el-input__prefix {
              padding-left: 16px;
              
              .el-icon {
                font-size: 16px;
                color: #909399;
              }
            }
          }
        }
        
        .el-select {
          :deep(.el-select__wrapper) {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #d1d5db;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 48px;
            
            &:hover {
              border-color: #c0c4cc;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }
            
            &.is-focus {
              border-color: #374151;
              box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
            }
            
            .el-select__selection {
              height: 46px;
              
              .el-select__selected-item {
                font-size: 15px;
                color: #303133;
                padding: 0 16px;
                line-height: 46px;
              }
              
              .el-select__placeholder {
                font-size: 14px;
                color: #c0c4cc;
                padding: 0 16px;
                line-height: 46px;
              }
            }
            
            .el-select__suffix {
              padding-right: 16px;
              
              .el-icon {
                font-size: 16px;
                color: #909399;
              }
            }
          }
        }
      }
    }
    
    .el-row {
      margin-left: -8px !important;
      margin-right: -8px !important;
      
      .el-col {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
    }
    
    // 移动端筛选表单按钮样式优化
    .el-button {
      height: 52px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: none !important;
      padding: 0 20px !important;
      
      &:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
      }
      
      &:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, #374151, #111827) !important;
        
        &:hover {
          background: linear-gradient(135deg, #111827, #000000) !important;
        }
      }
      
      &.el-button--default {
        background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
        color: #606266 !important;
        
        &:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
          color: #303133 !important;
        }
      }
      
      .el-icon {
        margin-right: 8px !important;
        font-size: 18px !important;
      }
      
      span {
        font-size: 16px !important;
        font-weight: 600 !important;
        line-height: 1.2 !important;
      }
    }
  }
}

// ==================== 移动端操作按钮样式优化 ====================
.mobile-actions {
  margin-bottom: 20px;
  
  .el-button {
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #374151, #111827);
      
      &:hover {
        background: linear-gradient(135deg, #111827, #000000);
      }
    }
    
    &.el-button--default {
      background: linear-gradient(135deg, #f9fafb, #e5e7eb);
      color: #606266;
      
      &:hover {
        background: linear-gradient(135deg, #e5e7eb, #d1d5db);
        color: #303133;
      }
      
      &:disabled {
        background: #f5f7fa;
        color: #c0c4cc;
        transform: none;
        box-shadow: none;
      }
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 16px;
    }
  }
}

// ==================== 移动端日志功能样式 ====================
.mobile-log-filters {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-form-item__label {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 10px;
        line-height: 1.4;
        display: block;
        width: 100%;
      }
      
      .el-form-item__content {
        .el-input {
          :deep(.el-input__wrapper) {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #d1d5db;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 48px;
            
            &:hover {
              border-color: #c0c4cc;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }
            
            &.is-focus {
              border-color: #374151;
              box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
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
            
            .el-input__prefix {
              padding-left: 16px;
              
              .el-icon {
                font-size: 16px;
                color: #909399;
              }
            }
          }
        }
        
        .el-select {
          :deep(.el-select__wrapper) {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #d1d5db;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 48px;
            
            &:hover {
              border-color: #c0c4cc;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }
            
            &.is-focus {
              border-color: #374151;
              box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
            }
            
            .el-select__selection {
              height: 46px;
              
              .el-select__selected-item {
                font-size: 15px;
                color: #303133;
                padding: 0 16px;
                line-height: 46px;
              }
              
              .el-select__placeholder {
                font-size: 14px;
                color: #c0c4cc;
                padding: 0 16px;
                line-height: 46px;
              }
            }
            
            .el-select__suffix {
              padding-right: 16px;
              
              .el-icon {
                font-size: 16px;
                color: #909399;
              }
            }
          }
        }
      }
    }
    
    .el-row {
      margin-left: -8px !important;
      margin-right: -8px !important;
      
      .el-col {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
    }
    
    // 移动端日志筛选表单按钮样式优化
    .el-button {
      height: 52px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: none !important;
      padding: 0 20px !important;
      
      &:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
      }
      
      &:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, #374151, #111827) !important;
        
        &:hover {
          background: linear-gradient(135deg, #111827, #000000) !important;
        }
      }
      
      &.el-button--default {
        background: linear-gradient(135deg, #f9fafb, #e5e7eb) !important;
        color: #606266 !important;
        
        &:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db) !important;
          color: #303133 !important;
        }
      }
      
      .el-icon {
        margin-right: 8px !important;
        font-size: 18px !important;
      }
      
      span {
        font-size: 16px !important;
        font-weight: 600 !important;
        line-height: 1.2 !important;
      }
    }
  }
}

.mobile-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .log-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    
    .log-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .log-time {
        font-size: 13px;
        color: #909399;
        font-weight: 500;
      }
      
      .el-tag {
        border-radius: 6px;
        font-weight: 500;
      }
    }
    
    .log-card-content {
      .log-source {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        
        .el-icon {
          font-size: 14px;
          color: #909399;
        }
        
        span {
          font-size: 13px;
          color: #606266;
          font-weight: 500;
        }
      }
      
      .log-message {
        font-size: 14px;
        color: #303133;
        line-height: 1.5;
        word-break: break-word;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: #fafafa;
    border-radius: 12px;
    border: 2px dashed #e4e7ed;
  }
}
// ==================== 移动端存储管理样式 ====================
.mobile-storage-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  
  .storage-stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .el-icon {
        font-size: 24px;
        color: #fff;
      }
      
      &.total {
        background: linear-gradient(135deg, #374151, #111827);
      }
      
      &.used {
        background: linear-gradient(135deg, #6b7280, #4b5563);
      }
      
      &.available {
        background: linear-gradient(135deg, #4b5563, #374151);
      }
    }
    
    .stat-info {
      flex: 1;
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 13px;
        color: #909399;
        font-weight: 500;
      }
    }
  }
}

.mobile-storage-usage {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  
  .usage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
  
  .usage-content {
    .el-progress {
      margin-bottom: 12px;
      
      :deep(.el-progress-bar__outer) {
        border-radius: 8px;
        background: #f0f2f5;
      }
      
      :deep(.el-progress-bar__inner) {
        border-radius: 8px;
      }
    }
    
    .usage-details {
      text-align: center;
      
      .usage-text {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
}

.mobile-storage-actions {
  .el-button {
    height: 44px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 14px;
    }
  }
}
// ==================== 移动端系统设置样式 ====================
.mobile-settings-form {
  .settings-group {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    
    .group-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      
      .el-icon {
        font-size: 16px;
        color: #374151;
      }
      
      span {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .el-form-item {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-form-item__label {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }
      
      .form-description {
        font-size: 12px;
        color: #909399;
        margin-top: 6px;
        line-height: 1.4;
      }
      
      .form-unit {
        font-size: 14px;
        color: #606266;
        margin-left: 8px;
        font-weight: 500;
      }
      
      .color-picker-container {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .color-value {
          font-size: 13px;
          color: #606266;
          font-weight: 500;
          font-family: monospace;
        }
      }
    }
  }
  
  .settings-actions {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    
    .el-button {
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, #374151, #111827);
        
        &:hover {
          background: linear-gradient(135deg, #111827, #000000);
        }
      }
      
      &.el-button--default {
        background: linear-gradient(135deg, #f9fafb, #e5e7eb);
        color: #606266;
        
        &:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db);
          color: #303133;
        }
      }
      
      .el-icon {
        margin-right: 6px;
        font-size: 16px;
      }
    }
  }
}

// ==================== 响应式断点设计 ====================

// 超小屏幕 (手机竖屏) - 320px-480px
@media (max-width: 480px) {
  .admin-center-page {
    padding: 12px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      gap: 12px;
      
      .header-left {
        text-align: center;
        
        .page-title {
          font-size: 20px;
        }
        
        .page-subtitle {
          font-size: 12px;
        }
      }
      
      .header-actions {
        width: 100%;
        
        .el-button {
          width: 100%;
          height: 44px;
        }
      }
    }
  }
}

// 小屏幕 (手机横屏/小平板) - 481px-768px
@media (min-width: 481px) and (max-width: 768px) {
  .admin-center-page {
    padding: 16px;
  }
  
  .page-header {
    .header-content {
      .header-left {
        .page-title {
          font-size: 24px;
        }
        
        .page-subtitle {
          font-size: 14px;
        }
      }
    }
  }
}

// 中等屏幕 (平板) - 769px-1024px
@media (min-width: 769px) and (max-width: 1024px) {
  .admin-center-page {
    padding: 20px;
  }
  
  .admin-center-content {
    .desktop-layout {
      .el-col {
        &:first-child {
          flex: 0 0 200px; // 固定侧边栏宽度
        }
        
        &:last-child {
          flex: 1; // 内容区域自适应
        }
      }
    }
  }
}

// 大屏幕 (桌面) - 1025px以上
@media (min-width: 1025px) {
  .admin-center-page {
    padding: 24px;
  }
}

// ==================== 移动端专用样式 ====================

// 移动端导航栏
.mobile-nav-bar {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .mobile-nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .mobile-nav-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
    
    .mobile-refresh-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }
  }
  
  .mobile-tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    
    .mobile-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #f5f7fa;
      color: #606266;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 60px;
      flex-shrink: 0;
      
      .el-icon {
        font-size: 18px;
      }
      
      span {
        font-size: 12px;
        font-weight: 500;
      }
      
      &:hover {
        background: #e6f7ff;
        color: #374151;
      }
      
      &.active {
        background: #409eff;
        color: #fff;
        
        .el-icon {
          color: #fff;
        }
      }
    }
  }
  /* 移动端审核设置适配 */
  .mobile-settings-form .system-settings-form {
    .settings-group {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .group-title {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
      color: #1f1f1f;
      :deep(.el-icon) { color: #1f1f1f; }
    }
    :deep(.el-form-item__label) { color: #6f6f6f; }
  }
}

// 移动端内容区域
.mobile-content {
  .mobile-panel-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
    
    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}
// ==================== 移动端统计卡片优化 ====================
@media (max-width: 768px) {
  .stats-cards {
    .el-col {
      margin-bottom: 12px;
      
      .stat-card {
        padding: 16px;
        border-radius: 12px;
        
        .stat-icon {
          width: 48px;
          height: 48px;
          
          .el-icon {
            font-size: 24px;
          }
        }
        
        .stat-info {
          .stat-value {
            font-size: 20px;
          }
          
          .stat-label {
            font-size: 12px;
          }
          
          .stat-trend {
            .trend-text {
              font-size: 11px;
            }
          }
        }
      }
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
    
    // 移动端允许其他行也换行
    .stats-cards {
      flex-wrap: wrap !important;
    }
    
    .quick-actions-row {
      flex-wrap: wrap !important;
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
              background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%) !important;
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
                background: linear-gradient(90deg, #374151 0%, #6b7280 100%) !important;
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
              background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
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
                background: linear-gradient(135deg, #374151 0%, #111827 100%) !important;
                border: none !important;
                
                &:hover {
                  background: linear-gradient(135deg, #111827 0%, #000000 100%) !important;
                }
              }
              
              &.el-button--danger {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
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
        color: #374151;
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
    
    // 外观设置样式
    .color-picker-container {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .color-value {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #606266;
        background: #f5f7fa;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
      }
    }
    
    .el-radio-group {
      .el-radio-button {
        margin-right: 8px;
      }
    }
    
    .el-color-picker {
      margin-right: 8px;
    }
  }
}
// ==================== 移动端日志筛选样式优化 ====================
.mobile-log-filters {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 0;
  margin-bottom: 24px;
  border: 1px solid rgba(64, 158, 255, 0.12);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  // 添加装饰性背景元素
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #e6a23c 0%, #f56c6c 50%, #67c23a 100%);
    border-radius: 24px 24px 0 0;
  }
  
  // 添加微妙的背景纹理
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(230, 162, 60, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(103, 194, 58, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  
  // 日志筛选表单标题样式
  .log-filter-header {
    padding: 24px 24px 16px 24px;
    position: relative;
    z-index: 1;
    
    .filter-title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .filter-icon {
        font-size: 20px;
        color: #e6a23c;
        margin-right: 12px;
        background: linear-gradient(135deg, #e6a23c, #f56c6c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      span {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
        letter-spacing: 0.5px;
      }
    }
    
    .filter-subtitle {
      font-size: 14px;
      color: #909399;
      font-weight: 400;
      margin-left: 32px;
      line-height: 1.4;
    }
  }
  
  // 表单容器样式
  .log-filter-form {
    padding: 0 24px 24px 24px;
    position: relative;
    z-index: 1;
  }
  
  // 日志级别区域样式
  .level-section {
    margin-bottom: 20px;
    
    .level-item {
      margin-bottom: 0;
      
      .el-form-item__label {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(135deg, #e6a23c, #f56c6c);
          border-radius: 2px;
          margin-right: 8px;
        }
      }
      
      .level-select {
        :deep(.el-select__wrapper) {
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 2px solid #d1d5db;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 56px !important;
          background: #ffffff;
          
          &:hover {
            border-color: #c0c4cc;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &.is-focus {
            border-color: #e6a23c;
            box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.15);
            transform: translateY(-2px);
          }
          
          .el-select__selection {
            height: 54px !important;
            
            .el-select__selected-item {
              font-size: 16px !important;
              color: #303133;
              padding: 0 20px !important;
              line-height: 54px !important;
              font-weight: 500;
            }
            
            .el-select__placeholder {
              font-size: 15px !important;
              color: #c0c4cc;
              padding: 0 20px !important;
              line-height: 54px !important;
            }
          }
          
          .el-select__suffix {
            padding-right: 20px !important;
            
            .el-icon {
              font-size: 18px !important;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  // 搜索区域样式
  .search-section {
    margin-bottom: 24px;
    
    .search-item {
      margin-bottom: 0;
      
      .el-form-item__label {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(135deg, #67c23a, #85ce61);
          border-radius: 2px;
          margin-right: 8px;
        }
      }
      
      .search-input {
        :deep(.el-input__wrapper) {
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 2px solid #d1d5db;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 56px !important;
          background: #ffffff;
          
          &:hover {
            border-color: #c0c4cc;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          
          &.is-focus {
            border-color: #67c23a;
            box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.15);
            transform: translateY(-2px);
          }
          
          .el-input__inner {
            height: 54px !important;
            font-size: 16px !important;
            padding: 0 20px !important;
            font-weight: 500;
            
            &::placeholder {
              color: #c0c4cc;
              font-size: 15px !important;
              font-weight: 400;
            }
          }
          
          .el-input__prefix {
            padding-left: 20px !important;
            
            .search-prefix-icon {
              font-size: 18px !important;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  // 操作按钮区域样式
  .log-action-section {
    .log-action-buttons {
      display: flex;
      gap: 12px;
      
      .log-action-btn {
        flex: 1;
        height: 52px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        border-radius: 14px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border: none !important;
        padding: 0 20px !important;
        margin: 0 !important;
        letter-spacing: 0.5px;
        
        &:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }
        
        &:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        
        .el-icon {
          margin-right: 4px !important;
          font-size: 13px !important;
        }
        
        span {
          font-size: 13px !important;
          font-weight: 600 !important;
        }
        
        &.primary-btn {
          background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%) !important;
          color: #ffffff !important;
          
          &:hover {
            background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%) !important;
          }
        }
        
        &.secondary-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%) !important;
          color: #ffffff !important;
          
          &:hover {
            background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%) !important;
          }
        }
        
        &.danger-btn {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%) !important;
          color: #ffffff !important;
          
          &:hover {
            background: linear-gradient(135deg, #f78989 0%, #f56c6c 100%) !important;
          }
        }
      }
    }
  }
}

// ==================== 移动端日志筛选动画效果 ====================
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 移动端日志筛选表单进入动画
.mobile-log-filters {
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  .log-filter-header {
    animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
  }
  
  .level-section {
    animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
  }
  
  .search-section {
    animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
  }
  
  .log-action-section {
    animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
  }
  
  // 悬停时的微妙动画
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  // 加载状态动画
  &.loading {
    .log-action-btn {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }
}

// 表单控件焦点动画
.level-select,
.search-input {
  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper) {
    &:focus-within {
      animation: pulse 0.3s ease-out;
    }
  }
}

// 按钮点击反馈动画
.log-action-btn {
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::before {
    width: 300px;
    height: 300px;
  }
}

// 桌面端用户表格样式
.user-table {
  :deep(.el-table__row) {
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
// 用户统计对话框样式
.user-stats-content {
  &.grayscale {
    .stats-section {
      background: #ffffff;
      border: 1px solid #e5e5e5;
    }
    h4 { color: #1f1f1f; }
    .label { color: #6f6f6f; }
    .value { color: #1f1f1f; font-weight: 600; }
    .password-display .password-value { background: #f5f5f5; border-color: #e5e5e5; color: #1f1f1f; }
    .password-verification { background: #f9f9f9; border-color: #e5e5e5; }
  }
  .stats-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .stats-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;
    
    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 8px;
    }
    
  .stats-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-weight: 500;
      color: #6c757d;
      font-size: 14px;
    }
    
    .value {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
      text-align: right;
      max-width: 60%;
      word-break: break-all;
    }
    
    .password-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      
      .password-value {
        font-size: 14px;
        color: #2c3e50;
        font-weight: 600;
        font-family: 'Courier New', monospace;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #e9ecef;
        flex: 1;
        min-width: 0;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .password-toggle-btn {
        padding: 4px 12px;
        min-width: 80px;
        height: 28px;
        flex-shrink: 0;
        
        .el-icon {
          font-size: 14px;
        }
      }
    }
    
    .password-verification {
      margin-top: 8px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      
      .verification-input {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .verification-code-input {
          width: 180px;
          flex-shrink: 0;
          
          .el-input__wrapper {
            width: 100%;
          }
        }
        
        .verify-btn-desktop {
          flex-shrink: 0;
        }
        
        .send-code-btn-desktop {
          flex-shrink: 0;
        }
      }
      
      .verification-actions {
        margin-bottom: 8px;
        text-align: center;
      }
      
      .verification-timer {
        text-align: center;
        
        .timer-text {
          font-size: 12px;
          color: #6c757d;
          font-weight: 500;
        }
      }
    }
  }
  }
  
  .no-stats {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
    
    .no-data-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    p {
      margin: 0;
      font-size: 16px;
    }
  }
  .password-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .password-container {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .label {
        font-weight: 500;
        color: #6c757d;
        min-width: 60px;
        flex-shrink: 0;
      }
      
      .password-display {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  // 桌面端：密码项上下布局
  @media (min-width: 1024px) {
    .password-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      
      .password-container {
        width: 100%;
        
        .label {
          min-width: 60px;
          font-weight: 500;
          color: #6c757d;
        }
        
        .password-display {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
      
      .password-verification {
        width: 100%;
        margin-top: 0;
      }
    }
  }
}
// 移动端用户统计对话框优化
@media (max-width: 768px) {
  .user-stats-content {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .stats-section {
      padding: 16px;
      
      h4 {
        font-size: 15px;
        margin-bottom: 12px;
      }
      
      .stats-item {
        margin-bottom: 10px;
        
        .label {
          font-size: 13px;
        }
        
        .value {
          font-size: 13px;
        }
      }
    }
    
    // 移动端用户头部
    .mobile-user-header {
      margin-bottom: 20px;
      
      .user-avatar-section {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 16px;
        border: 1px solid #e9ecef;
        
        .user-basic-info {
          flex: 1;
          min-width: 0; // 允许flex子元素收缩
          
          h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }
          
          p {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #6c757d;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }
          
          .user-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }
      }
    }
    
    // 移动端信息卡片
    .mobile-info-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .mobile-info-card {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e9ecef;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #e9ecef;
          
          .el-icon {
            font-size: 18px;
            color: #409eff;
          }
          
          span {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
          }
        }
        
        .card-content {
          padding: 20px;
          
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .info-label {
              font-size: 14px;
              color: #6c757d;
              font-weight: 500;
            }
            
            .info-value {
              font-size: 14px;
              color: #2c3e50;
              font-weight: 600;
            }
            
            .password-display {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              gap: 8px;
              
              .password-value {
                font-size: 14px;
                color: #2c3e50;
                font-weight: 600;
                font-family: 'Courier New', monospace;
                background: #f8f9fa;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #e9ecef;
                flex: 1;
                min-width: 0;
                word-break: break-all;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .password-toggle-btn {
                padding: 4px 12px;
                min-width: 80px;
                height: 28px;
                flex-shrink: 0;
                
                .el-icon {
                  font-size: 14px;
                }
              }
            }
            
          .password-verification {
            margin-top: 12px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            
            .verification-input {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-bottom: 12px;
              
              .el-input {
                width: 100%;
              }
            }
            
            .verification-actions-mobile {
              display: flex;
              gap: 8px;
              margin-bottom: 12px;
              
              .verify-btn,
              .send-code-btn {
                flex: 1;
                width: 50%;
                height: 36px;
              }
            }
            
            .verification-actions {
              margin-bottom: 12px;
              
              .el-button {
                width: 100%;
                height: 36px;
              }
            }
            
            .verification-timer {
              text-align: center;
              
              .timer-text {
                font-size: 13px;
                color: #6c757d;
                font-weight: 500;
              }
            }
          }
          }
          
          // 存储进度
          .storage-progress {
            margin-bottom: 16px;
            
            .progress-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              
              .progress-label {
                font-size: 14px;
                color: #6c757d;
                font-weight: 500;
              }
              
              .progress-percent {
                font-size: 16px;
                font-weight: 600;
                color: #409eff;
              }
            }
          }
          
          // 存储详情
          .storage-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            
            .storage-item {
              text-align: center;
              padding: 12px 8px;
              background: #f8f9fa;
              border-radius: 8px;
              
              .storage-label {
                display: block;
                font-size: 12px;
                color: #6c757d;
                margin-bottom: 4px;
              }
              
              .storage-value {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #2c3e50;
              }
            }
          }
          
          // 活动网格
          .activity-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
            
            .activity-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 16px 8px;
              background: #f8f9fa;
              border-radius: 8px;
              
              .activity-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #409eff;
                border-radius: 50%;
                margin-bottom: 8px;
                
                .el-icon {
                  font-size: 16px;
                  color: #fff;
                }
              }
              
              .activity-info {
                text-align: center;
                
                .activity-label {
                  display: block;
                  font-size: 11px;
                  color: #6c757d;
                  margin-bottom: 2px;
                }
                
                .activity-value {
                  display: block;
                  font-size: 16px;
                  font-weight: 600;
                  color: #2c3e50;
                }
              }
            }
          }
          
          // 最后登录
          .last-login {
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
            
            .last-login-label {
              display: block;
              font-size: 12px;
              color: #6c757d;
              margin-bottom: 4px;
            }
            
            .last-login-value {
              display: block;
              font-size: 13px;
              color: #2c3e50;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

// 移动端按钮点击动效优化
@media (max-width: 768px) {
  // 为所有按钮添加移动端触摸反馈
  :deep(.el-button) {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    
    &:active {
      transform: scale(0.95) !important;
      transition: transform 0.1s ease !important;
    }
  }
  
  // 特别优化下拉按钮
  :deep(.el-dropdown .el-button) {
    &:active {
      background: rgba(64, 158, 255, 0.2) !important;
      transform: scale(0.95) !important;
    }
  }
  
  // 优化复选框
  :deep(.el-checkbox) {
    &:active {
      transform: scale(0.95);
      transition: transform 0.1s ease;
    }
  }
  
  // 移动端对话框优化
  :deep(.mobile-dialog) {
    .el-dialog {
      margin: 5vh auto !important;
      max-height: 90vh !important;
      border-radius: 16px !important;
    }
    
    .el-dialog__header {
      padding: 20px 20px 0 20px !important;
      
      .el-dialog__title {
        font-size: 18px !important;
        font-weight: 600 !important;
      }
    }
    
    .el-dialog__body {
      padding: 20px !important;
      max-height: calc(90vh - 120px) !important;
      overflow-y: auto !important;
    }
    
    .el-dialog__footer {
      padding: 0 20px 20px 20px !important;
      
      .el-button {
        width: 100% !important;
        height: 48px !important;
        font-size: 16px !important;
        border-radius: 12px !important;
      }
    }
  }
}

/* 新版用户详情悬浮窗风格 */
.user-popover.user-popover-v2 {
  padding: 0 !important;
  border-radius: 14px !important;
  overflow: hidden !important;
}

.user-profile-popover {
  width: 100%;
  max-width: 640px;
}
.user-profile-popover.minimal {
  padding: 12px 14px;
  background: #fff;
}

.user-profile-popover .header-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile-popover .header-row .identity .name {
  font-weight: 700;
  color: #1f1f1f;
}

.user-profile-popover .header-row .identity .email {
  font-size: 12px;
  color: #6f6f6f;
}

.user-profile-popover .kv-list {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.user-profile-popover .kv-list .kv {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.user-profile-popover .kv-list .kv span {
  color: #6f6f6f;
}

.user-profile-popover .kv-list .kv b {
  color: #1f1f1f;
}

.user-profile-popover .stats-row {
  margin-top: 10px;
  display: flex;
  gap: 12px;
}

.user-profile-popover .stats-row .stat {
  flex: 1;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.user-profile-popover .stats-row .stat span {
  display: block;
  font-size: 11px;
  color: #6f6f6f;
}

.user-profile-popover .stats-row .stat b {
  display: block;
  font-size: 14px;
  color: #1f1f1f;
}

/* 卡片式容器阴影与边框（黑白灰） */
.user-card-popover.el-card {
  border: 1px solid #e9e9e9 !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
  border-radius: 12px !important;
}

.user-card-popover.inline-card {
  background: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.user-profile-popover .popover-close .el-button {
  color: #6f6f6f;
}

.user-profile-popover .storage-block.minimal {
  margin-top: 12px;
  background: #fafafa;
  border-color: #e9e9e9;
}
@media (max-width: 768px) {
  .user-profile-popover .kv-list {
    grid-template-columns: 1fr;
  }
}

.user-profile-popover .popover-hero {
  height: 64px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.user-profile-popover .popover-close {
  position: absolute;
  right: 8px;
  top: 8px;
}

.user-profile-popover .avatar-wrap {
  display: flex;
  justify-content: center;
  margin-top: -28px;
}

.user-profile-popover .name-row {
  margin-top: 8px;
  text-align: center;
}

.user-profile-popover .name-row .name {
  font-weight: 700;
  color: #2c3e50;
}

.user-profile-popover .name-row .nickname {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
}

.user-profile-popover .tag-row {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.user-profile-popover .info-grid.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  padding: 12px 16px;
}

.user-profile-popover .info-grid.two-col.subtle .label {
  color: #909399;
}

.user-profile-popover .info-item .label {
  font-size: 12px;
  color: #6c757d;
}

.user-profile-popover .info-item .value {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 600;
}
.user-profile-popover .storage-block {
  margin: 8px 16px 0 16px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  background: #f8f9fa;
}

.user-profile-popover .storage-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-profile-popover .storage-top .title {
  font-size: 13px;
  color: #6c757d;
}

.user-profile-popover .storage-top .usage {
  font-size: 13px;
  color: #409eff;
  font-weight: 700;
}

.user-profile-popover .storage-text {
  margin-top: 6px;
  font-size: 12px;
  color: #6c757d;
}

.user-profile-popover .stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 16px 0 16px;
}

.user-profile-popover .stat-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.user-profile-popover .stat-item .label {
  font-size: 11px;
  color: #909399;
}

.user-profile-popover .stat-item .value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 700;
}

.user-profile-popover .bio-block {
  padding: 12px 16px;
}

.user-profile-popover .bio-block .title {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 6px;
}

.user-profile-popover .bio-block .bio {
  color: #2c3e50;
}

@media (max-width: 768px) {
  .user-profile-popover .info-grid.two-col {
    grid-template-columns: 1fr;
  }
  .user-profile-popover .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>