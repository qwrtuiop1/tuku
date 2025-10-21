# 通知设置功能增强说明

## 概述

本次更新完善了用户头像下拉菜单中设置页面的通知设置板块，增加了全面的通知管理功能，包括邮件通知、系统通知、用户通知偏好设置、通知频率控制以及通知历史记录管理。

## 新增功能

### 1. 前端界面增强

#### 通知设置页面 (`frontend/src/views/SettingsPage.vue`)
- **邮件通知配置**：完整的SMTP配置，包括服务器、端口、用户名、密码、发件人信息
- **系统通知配置**：系统内通知开关和保留天数设置
- **用户通知偏好**：登录通知、文件上传通知、存储空间警告、安全提醒、系统维护通知
- **通知频率设置**：邮件通知频率（实时、每小时、每日、每周）和系统通知频率（实时、延迟）
- **测试功能**：邮件连接测试和设置重置功能

#### 通知历史页面 (`frontend/src/views/NotificationHistory.vue`)
- **通知列表**：分页显示所有通知记录
- **筛选功能**：按类型、状态、日期范围筛选
- **搜索功能**：按内容关键词搜索
- **状态管理**：标记已读、批量操作、删除通知
- **详情查看**：点击查看通知详情

### 2. 后端API增强

#### 设置管理API (`backend/src/routes/admin.js`)
- 扩展了系统设置验证，支持新的通知设置字段
- 添加了邮件连接测试API端点
- 新增通知历史记录管理API

#### 通知服务 (`backend/src/services/notificationService.js`)
- **邮件通知服务**：基于nodemailer的邮件发送功能
- **系统通知服务**：用户通知偏好检查和系统内通知发送
- **通知类型支持**：登录、上传、存储警告、安全提醒、维护通知
- **历史记录管理**：通知记录、统计、清理功能

### 3. 数据库结构扩展

#### 系统设置表扩展
```sql
-- 新增通知设置字段
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('enable_login_notification', 'true', '是否启用登录通知'),
('enable_upload_notification', 'true', '是否启用文件上传通知'),
('enable_storage_warning', 'true', '是否启用存储空间警告'),
('enable_security_alert', 'true', '是否启用安全提醒'),
('enable_maintenance_notification', 'true', '是否启用系统维护通知'),
('email_frequency', 'realtime', '邮件通知频率'),
('system_frequency', 'realtime', '系统通知频率');
```

#### 用户通知设置表扩展
```sql
-- 扩展用户通知设置表
ALTER TABLE user_notification_settings 
ADD COLUMN login_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN upload_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN maintenance_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN email_frequency VARCHAR(20) DEFAULT 'realtime',
ADD COLUMN system_frequency VARCHAR(20) DEFAULT 'realtime';
```

#### 新增数据表
- **通知历史记录表** (`notification_history`)：存储所有通知记录
- **通知模板表** (`notification_templates`)：邮件和系统通知模板
- **通知队列表** (`notification_queue`)：异步通知发送队列
- **通知统计表** (`notification_stats`)：通知发送和阅读统计

## 使用方法

### 1. 配置邮件通知

1. 进入系统设置页面
2. 选择"通知设置"标签
3. 启用"邮件通知"
4. 填写SMTP配置信息：
   - SMTP服务器：如 smtp.qq.com、smtp.gmail.com
   - SMTP端口：常用端口 587（TLS）、465（SSL）
   - SMTP用户名和密码
   - 发件人邮箱和名称
5. 点击"测试邮件连接"验证配置
6. 保存设置

### 2. 配置用户通知偏好

1. 在通知设置页面中
2. 在"用户通知偏好"部分
3. 根据需要开启或关闭各种通知类型：
   - 登录通知
   - 文件上传通知
   - 存储空间警告
   - 安全提醒
   - 系统维护通知

### 3. 设置通知频率

1. 在"通知频率设置"部分
2. 选择邮件通知频率：
   - 实时通知：立即发送
   - 每小时汇总：每小时发送一次汇总
   - 每日汇总：每天发送一次汇总
   - 每周汇总：每周发送一次汇总
3. 选择系统通知频率：
   - 实时通知：立即显示
   - 延迟通知：延迟显示

### 4. 查看通知历史

1. 点击用户头像下拉菜单
2. 选择"通知历史"
3. 使用筛选和搜索功能查找特定通知
4. 点击通知查看详情
5. 标记通知为已读或删除不需要的通知

## API端点

### 通知管理API

- `GET /admin/notifications` - 获取通知历史记录
- `PUT /admin/notifications/:id/read` - 标记通知为已读
- `GET /admin/notifications/stats` - 获取通知统计
- `DELETE /admin/notifications/cleanup` - 清理过期通知
- `POST /admin/notifications/test` - 发送测试通知

### 连接测试API

- `POST /admin/test-connection` - 测试第三方连接（QQ、微信、邮件）

## 部署说明

### 1. 数据库迁移

运行数据库迁移脚本：
```bash
mysql -u username -p database_name < backend/database/enhance_notification_settings.sql
```

### 2. 安装依赖

确保后端安装了nodemailer：
```bash
cd backend
npm install nodemailer
```

### 3. 配置环境变量

在 `.env` 文件中添加邮件相关配置（可选）：
```env
# 邮件配置（如果使用环境变量）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SENDER_EMAIL=your-email@example.com
SENDER_NAME=图库系统
```

## 注意事项

1. **邮件服务配置**：确保SMTP服务器支持TLS/SSL连接
2. **通知频率**：高频通知可能影响服务器性能，建议合理设置频率
3. **存储空间**：通知历史记录会占用数据库空间，建议定期清理过期通知
4. **权限控制**：通知历史页面需要管理员权限
5. **测试功能**：在生产环境中使用前，建议先测试邮件连接功能

## 故障排除

### 邮件发送失败
1. 检查SMTP配置是否正确
2. 确认网络连接正常
3. 验证邮箱密码是否正确
4. 检查防火墙设置

### 通知不显示
1. 检查用户通知偏好设置
2. 确认系统通知功能已启用
3. 检查数据库连接状态

### 性能问题
1. 调整通知频率设置
2. 定期清理过期通知
3. 优化数据库查询

## 更新日志

- ✅ 完善前端通知设置界面
- ✅ 扩展数据库表结构
- ✅ 增强后端API功能
- ✅ 添加通知验证和测试功能
- ✅ 实现通知历史记录和审计功能
- ✅ 添加通知历史管理页面
- ✅ 集成到主布局导航
