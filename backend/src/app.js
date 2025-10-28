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
const systemRoutes = require('./routes/system');
const liveMediaRoutes = require('./routes/liveMedia');
const shareRoutes = require('./routes/share');
const nginxConfigRoutes = require('./routes/nginxConfig');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const { checkMaintenanceMode } = require('./middleware/maintenance');
const { startCleanupTask } = require('./services/verificationService');
const TrendService = require('./services/trendService');
const nginxAutoUpdateService = require('./services/nginxAutoUpdateService');
const databaseInitService = require('./services/databaseInitService');

const app = express();
const PORT = process.env.PORT || 3000;

// 信任代理（用于Nginx反向代理）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());
// CORS配置 - 简化版本确保兼容性
const corsOptions = {
  origin: function (origin, callback) {
    // 生产环境允许的域名
    const allowedOrigins = [
      'https://tukufrontend.vtart.cn',
      'https://tukubackend.vtart.cn',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3008',
      'http://localhost:3010'
    ];
    
    // 允许没有origin的请求（如移动应用、Postman等）
    if (!origin) {
      return callback(null, true);
    }
    
    // 检查origin是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'X-File-Name',
    'X-File-Size',
    'X-File-Type'
  ],
  exposedHeaders: [
    'Content-Type', 
    'Content-Length', 
    'Cache-Control', 
    'Last-Modified', 
    'ETag',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200 // 支持旧版浏览器
};

app.use(cors(corsOptions));

// 统一CORS响应头（确保错误/非简单响应也携带CORS头）
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://tukufrontend.vtart.cn',
    'https://tukubackend.vtart.cn',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3008',
    'http://localhost:3010'
  ];
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || 'https://tukufrontend.vtart.cn');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, X-File-Name, X-File-Size, X-File-Type');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag, Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  }
  next();
});

// 手动处理OPTIONS请求
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, X-File-Name, X-File-Size, X-File-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24小时
  res.sendStatus(200);
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

// 解析中间件 - 支持大文件上传
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ extended: true, limit: '2gb' }));

// 静态文件服务 - 必须在认证中间件之前
app.use('/uploads', express.static(process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage', {
  setHeaders: (res, path) => {
    // 仅设置与跨源资源策略/缓存相关的安全头，避免重复设置 CORS 头导致浏览器报错
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable, no-transform');
    // 开发环境下由 Node 设置 CORS；生产环境交由 Nginx（避免重复/冲突）
    const devCors = (process.env.NODE_ENV || '').toLowerCase() !== 'production' && (process.env.ENABLE_UPLOADS_CORS || 'true').toLowerCase() === 'true';
    if (devCors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
  }
}));

// 维护模式检查中间件（应用到所有需要认证的路由）
app.use('/api/folders', checkMaintenanceMode);
app.use('/api/admin', checkMaintenanceMode);
app.use('/api/avatars', checkMaintenanceMode);
app.use('/api/files', checkMaintenanceMode);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/system', systemRoutes); // 系统公共接口，无需认证
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/avatars', authenticateToken, avatarRoutes);
app.use('/api/nginx-config', nginxConfigRoutes); // Nginx配置管理

// 头像静态文件服务 - 必须在 /api/files 路由之前
app.use('/api/files/avatar', express.static(path.join(process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage', 'users'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// 文件路由 - 必须在头像静态服务之后
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/live-media', authenticateToken, liveMediaRoutes);
app.use('/api/share', shareRoutes); // 公开分享，无需认证

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// CORS测试端点
app.get('/api/cors-test', (req, res) => {
  
  res.json({
    message: 'CORS测试成功',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 文件大小测试端点
app.post('/api/upload-test', (req, res) => {
  
  res.json({
    message: '文件上传测试成功',
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    timestamp: new Date().toISOString()
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

// 启动Nginx配置自动更新服务
nginxAutoUpdateService.start();

// 数据库初始化（异步执行，不阻塞服务启动）
databaseInitService.initialize().catch(error => {
  console.error('❌ 数据库初始化失败:', error.message);
});

app.listen(PORT, () => {
  console.log(`🚀 图库系统后端服务启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 验证码清理任务已启动`);
});

module.exports = app;

