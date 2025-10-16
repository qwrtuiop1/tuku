const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const folderRoutes = require('./routes/folders');
const adminRoutes = require('./routes/admin');
const avatarRoutes = require('./routes/avatars');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const { checkMaintenanceMode } = require('./middleware/maintenance');
const { startCleanupTask } = require('./services/verificationService');
const TrendService = require('./services/trendService');

const app = express();
const PORT = process.env.PORT || 3000;

// 信任代理（用于Nginx反向代理）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());
// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://tukufrontend.vtart.cn', 'https://tukubackend.vtart.cn'] 
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3008', 'http://localhost:3010'];
    
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Length', 'Cache-Control', 'Last-Modified', 'ETag']
};

app.use(cors(corsOptions));

// CORS调试中间件
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.url);
  next();
});

// 请求限制 - 排除静态文件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000个请求（提高限制）
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers
  legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
  skip: (req) => {
    // 跳过静态文件请求
    return req.path.startsWith('/uploads/') || req.path.startsWith('/static/')
  }
});

// 更宽松的API限制
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 每分钟最多100个API请求
  message: 'API请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false
});

// 只对API路由应用限制，排除静态文件
app.use('/api/auth', apiLimiter);
app.use('/api/folders', apiLimiter);
app.use('/api/admin', apiLimiter);
app.use('/api/files', apiLimiter);

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 必须在认证中间件之前
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './storage', {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag');
  }
}));

// 维护模式检查中间件（应用到所有需要认证的路由）
app.use('/api/folders', checkMaintenanceMode);
app.use('/api/admin', checkMaintenanceMode);
app.use('/api/avatars', checkMaintenanceMode);
app.use('/api/files', checkMaintenanceMode);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/avatars', authenticateToken, avatarRoutes);

// 头像静态文件服务 - 必须在 /api/files 路由之前
app.use('/api/files/avatar', express.static(path.join(process.env.UPLOAD_PATH || './storage', 'users'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// 文件路由 - 必须在头像静态服务之后
app.use('/api/files', authenticateToken, fileRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 启动验证码清理任务
startCleanupTask();

// 启动趋势数据收集任务（每天凌晨2点执行）
const scheduleTrendCollection = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0);
  
  const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    // 执行趋势数据收集
    TrendService.collectAllUsersTrends();
    
    // 设置每日定时任务
    setInterval(() => {
      TrendService.collectAllUsersTrends();
    }, 24 * 60 * 60 * 1000); // 每24小时执行一次
  }, timeUntilTomorrow);
  
  console.log('📊 趋势数据收集任务已安排，将在每天凌晨2点执行');
};

// 启动趋势数据收集任务
scheduleTrendCollection();

app.listen(PORT, () => {
  console.log(`🚀 图库系统后端服务启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 验证码清理任务已启动`);
});

module.exports = app;

