# 图库系统后端部署包

## 📦 包内容

- `src/` - 源代码目录
- `database/` - 数据库脚本
- `node_modules/` - 生产依赖
- `package.json` - 项目配置
- `env.example` - 环境配置示例
- `start.bat` - Windows启动脚本
- `start.sh` - Linux/Mac启动脚本

## 🚀 快速部署

### Windows系统
1. 解压部署包到目标目录
2. 复制 `env.example` 为 `.env` 并配置数据库信息
3. 双击运行 `start.bat`

### Linux/Mac系统
1. 解压部署包到目标目录
2. 复制 `env.example` 为 `.env` 并配置数据库信息
3. 给启动脚本执行权限：`chmod +x start.sh`
4. 运行启动脚本：`./start.sh`

## ⚙️ 环境配置

创建 `.env` 文件并配置以下参数：

```env
# 数据库配置
DB_HOST=134.175.220.243
DB_USER=tuku
DB_PASSWORD=RHd5biyaXmaAbyDC
DB_NAME=tuku
DB_PORT=3306

# 服务配置
PORT=3000
NODE_ENV=production

# JWT密钥
JWT_SECRET=your_jwt_secret_here

# 邮件配置（可选）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

## 🔧 手动启动

如果自动启动脚本有问题，可以手动启动：

```bash
# 安装依赖
npm install --production

# 启动服务
npm start
```

## 📋 系统要求

- Node.js >= 16.0.0
- MySQL 5.7+ 或 8.0+
- 至少 1GB 可用内存
- 至少 10GB 可用磁盘空间

## 🌐 访问地址

服务启动后，API将在以下地址可用：
- 本地访问：http://localhost:3000
- 外网访问：https://tukubackend.vtart.cn

## 📞 技术支持

如有问题，请联系技术支持团队。

---
**图库系统 v1.0.0**  
*Tuku Team*
