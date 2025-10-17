# 图库系统

一个现代化的多用户文件管理系统，支持图片和视频的上传、管理和预览。

## 功能特性

### 🎯 核心功能
- ✅ **多用户系统** - 支持用户注册、登录和权限管理
- ✅ **文件上传** - 支持图片和视频文件的上传
- ✅ **文件管理** - 文件夹创建、文件预览、下载和删除
- ✅ **存储管理** - 用户存储容量控制和监控
- ✅ **管理员控制台** - 用户管理、系统设置和统计

### 🎨 界面特性
- ✅ **响应式设计** - 支持桌面、平板和移动设备
- ✅ **现代化UI** - 基于Element Plus的简约设计
- ✅ **暗色主题** - 支持明暗主题切换
- ✅ **动画效果** - 流畅的页面过渡和交互动画
- ✅ **拖拽上传** - 支持文件拖拽上传

### 🔧 技术特性
- ✅ **JWT认证** - 安全的用户认证机制
- ✅ **文件预览** - 图片和视频的在线预览
- ✅ **缩略图生成** - 自动生成图片缩略图
- ✅ **批量操作** - 支持文件的批量删除
- ✅ **搜索功能** - 文件名称搜索
- ✅ **分页加载** - 大文件列表的分页显示

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Element Plus** - Vue 3组件库
- **Pinia** - Vue状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **Sass** - CSS预处理器

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **MySQL** - 关系型数据库
- **JWT** - JSON Web Token认证
- **Multer** - 文件上传中间件
- **Sharp** - 图片处理库
- **bcryptjs** - 密码加密

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd tuku
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **配置后端环境**
```bash
cp env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

4. **初始化数据库**
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE tuku_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据库结构
mysql -u root -p tuku_dev < database/init.sql
```

5. **启动后端服务**
```bash
npm run dev
```

6. **安装前端依赖**
```bash
cd ../frontend
npm install
```

7. **启动前端服务**
```bash
npm run dev
```

8. **访问应用**
- 前端地址: http://localhost:5173
- 后端API: http://localhost:3000

### 默认账户
- **管理员**: admin / admin123
- **测试用户**: testuser / test123

## 项目结构

```
tuku/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.js          # 应用入口
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   └── routes/         # 路由
│   ├── database/           # 数据库脚本
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/          # 页面
│   │   ├── layouts/        # 布局
│   │   ├── stores/         # 状态管理
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   └── package.json
└── README.md
```

## API文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 文件管理接口
- `GET /api/files` - 获取文件列表
- `POST /api/files/upload` - 上传文件
- `DELETE /api/files/:id` - 删除文件
- `GET /api/files/preview/:id` - 获取文件预览

### 文件夹管理接口
- `GET /api/folders` - 获取文件夹树
- `POST /api/folders` - 创建文件夹
- `DELETE /api/folders/:id` - 删除文件夹
- `PUT /api/folders/:id` - 重命名文件夹

### 管理员接口
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/storage` - 设置用户存储容量
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/stats` - 获取系统统计
- `GET /api/admin/settings` - 获取系统设置
- `PUT /api/admin/settings` - 更新系统设置

## 部署指南

### 生产环境配置

1. **后端配置**
```bash
# 修改 .env 文件
NODE_ENV=production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=tuku
JWT_SECRET=your-production-secret
```

2. **前端构建**
```bash
cd frontend
npm run build
```

3. **部署后端**
```bash
cd backend
npm start
```

4. **部署前端**
将 `frontend/dist` 目录部署到Web服务器

### Docker部署

```dockerfile
# Dockerfile示例
FROM node:16-alpine

WORKDIR /app

# 复制后端文件
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

EXPOSE 3000

CMD ["npm", "start"]
```

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API规范
- 使用TypeScript进行类型检查

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 分支管理
- `main` - 主分支，用于生产环境
- `develop` - 开发分支，用于集成开发
- `feature/*` - 功能分支
- `hotfix/*` - 热修复分支

## 常见问题

### Q: 如何修改文件上传大小限制？
A: 在系统设置中修改"最大文件大小"配置，或在后端代码中修改multer配置。

### Q: 如何添加新的文件类型支持？
A: 在后端`routes/files.js`中修改`fileFilter`函数，添加新的MIME类型。

### Q: 如何自定义主题颜色？
A: 在`frontend/src/styles/variables.scss`中修改颜色变量。

### Q: 如何备份用户数据？
A: 导出MySQL数据库，或使用系统管理功能导出用户数据。

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目链接: [https://github.com/your-username/tuku](https://github.com/your-username/tuku)
- 问题反馈: [https://github.com/your-username/tuku/issues](https://github.com/your-username/tuku/issues)

## 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✅ 用户认证系统
- ✅ 文件上传和管理
- ✅ 管理员控制台
- ✅ 响应式设计
- ✅ 暗色主题支持



















