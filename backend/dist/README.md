# 图库系统后端

## 项目简介

图库系统后端API服务，基于Node.js + Express构建，提供文件管理、用户认证、权限控制等功能。

## 技术栈

- **运行环境**: Node.js 16+
- **Web框架**: Express.js
- **数据库**: MySQL 8.0+
- **认证**: JWT
- **文件处理**: Multer + Sharp
- **安全**: Helmet + CORS + Rate Limiting

## 功能特性

- ✅ 用户注册/登录/认证
- ✅ JWT令牌管理
- ✅ 文件上传/下载/删除
- ✅ 图片缩略图生成
- ✅ 文件夹管理
- ✅ 存储容量控制
- ✅ 管理员权限控制
- ✅ 系统统计和设置
- ✅ 安全防护措施

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并修改配置：

```bash
cp env.example .env
```

### 3. 数据库配置

确保MySQL服务运行，并创建数据库：

```sql
CREATE DATABASE tuku_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
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

## 默认账户

- **管理员**: admin / admin123
- **邮箱**: admin@tuku.com

## 项目结构

```
src/
├── app.js              # 应用入口
├── config/
│   └── database.js     # 数据库配置
├── middleware/
│   ├── auth.js         # 认证中间件
│   └── errorHandler.js # 错误处理中间件
└── routes/
    ├── auth.js         # 认证路由
    ├── files.js        # 文件管理路由
    ├── folders.js      # 文件夹管理路由
    └── admin.js        # 管理员路由
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| DB_NAME | 数据库名称 | tuku_dev |
| UPLOAD_PATH | 文件上传路径 | ./storage |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRES_IN | JWT过期时间 | 7d |
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |

## 开发说明

### 数据库表结构

- **users**: 用户表
- **files**: 文件表
- **folders**: 文件夹表
- **system_settings**: 系统设置表

### 文件存储结构

```
storage/
├── avatars/          # 用户头像
├── users/
│   ├── user_1/      # 用户1的文件
│   │   ├── images/
│   │   ├── videos/
│   │   └── thumbnails/
│   └── user_2/      # 用户2的文件
└── temp/            # 临时上传文件
```

## 许可证

MIT License

