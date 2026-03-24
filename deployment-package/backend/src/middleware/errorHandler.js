// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      message: '数据已存在',
      error: 'DUPLICATE_ENTRY'
    });
  }

  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: '文件大小超出限制',
      error: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: '不支持的文件类型',
      error: 'INVALID_FILE_TYPE'
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: '数据验证失败',
      error: 'VALIDATION_ERROR',
      details: err.details
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: '无效的访问令牌',
      error: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: '访问令牌已过期',
      error: 'TOKEN_EXPIRED'
    });
  }

  // 默认服务器错误
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? 'INTERNAL_ERROR' : err.stack
  });
};

// 异步错误捕获包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};

