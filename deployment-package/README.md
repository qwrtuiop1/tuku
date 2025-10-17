# 图库系统部署包

## 项目概述
这是一个完整的图库管理系统，包含前端Vue3应用和后端Node.js API服务。

## 目录结构
```
deployment-package/
├── frontend/                 # 前端构建文件
│   ├── dist/                # 前端构建产物
│   └── Dockerfile           # 前端Docker配置
├── backend/                 # 后端应用文件
│   ├── src/                 # 后端源代码
│   ├── node_modules/        # 后端依赖包
│   ├── package.json         # 后端依赖配置
│   ├── Dockerfile           # 后端Docker配置
│   └── env.example          # 环境变量示例
├── docker-compose.yml       # Docker Compose配置
└── README.md               # 本说明文档
```

## 部署方式

### 方式一：Docker Compose 部署（推荐）

1. **配置环境变量**
   ```bash
   cd backend
   cp env.example .env
   # 编辑 .env 文件，配置数据库连接等信息
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   - 前端：http://localhost:80
   - 后端API：http://localhost:3000

### 方式二：传统部署

#### 前端部署
1. 将 `frontend/dist/` 目录内容部署到Web服务器（如Nginx）
2. 配置Nginx反向代理到后端API

#### 后端部署
1. 确保Node.js环境（版本 >= 16.0.0）
2. 进入backend目录
3. 安装依赖：`npm install --production`
4. 配置环境变量
5. 启动服务：`npm start`

## 环境要求

### 系统要求
- Node.js >= 16.0.0
- MySQL 5.7+ 或 MySQL 8.0+
- Docker & Docker Compose（可选）

### 数据库配置
- 创建数据库：`tuku`
- 导入SQL脚本（位于backend/database/目录）
- 配置数据库连接信息

## 功能特性

### 前端功能
- ✅ 用户注册/登录
- ✅ 文件上传/下载
- ✅ 图片预览
- ✅ 文件夹管理
- ✅ 用户中心
- ✅ 管理中心（管理员）
- ✅ 响应式设计

### 后端功能
- ✅ RESTful API
- ✅ JWT身份验证
- ✅ 文件上传处理
- ✅ 图片压缩/缩略图
- ✅ 数据库操作
- ✅ 邮件服务
- ✅ QQ OAuth登录

## 技术栈

### 前端
- Vue 3
- TypeScript
- Element Plus
- Vite
- Pinia
- Axios

### 后端
- Node.js
- Express
- MySQL
- JWT
- Multer
- Sharp
- Nodemailer

## 注意事项

1. **安全配置**：生产环境请修改默认的JWT密钥
2. **数据库**：确保数据库连接配置正确
3. **文件存储**：确保存储目录有足够的磁盘空间
4. **网络**：确保防火墙允许相应端口访问

## 故障排除

### 常见问题
1. **数据库连接失败**：检查数据库配置和网络连接
2. **文件上传失败**：检查存储目录权限
3. **前端无法访问后端**：检查API地址配置

### 日志查看
```bash
# Docker部署
docker-compose logs -f

# 传统部署
# 查看应用日志
```

## 更新说明

本次打包包含以下修复：
- ✅ 修复存储管理数字显示错误
- ✅ 优化管理中心页面布局
- ✅ 改进数据类型处理
- ✅ 增强错误处理机制

## 联系支持

如有问题，请联系开发团队。



