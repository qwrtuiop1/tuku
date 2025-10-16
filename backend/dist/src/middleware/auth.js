const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // 如果没有Authorization头，尝试从查询参数获取token
  const queryToken = req.query.token;

  const finalToken = token || queryToken;

  if (!finalToken) {
    return res.status(401).json({ message: '访问令牌缺失' });
  }

  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    
    // 验证用户是否存在 - 使用安全的字段查询
    let users;
    try {
      [users] = await pool.execute(
        'SELECT id, username, email, role, status, storage_limit, used_storage FROM users WHERE id = ?',
        [decoded.userId]
      );
    } catch (error) {
      // 如果查询失败，可能是表结构问题，尝试基本查询
      console.log('🔧 尝试基本用户查询...');
      [users] = await pool.execute(
        'SELECT id, username, email, role, status FROM users WHERE id = ?',
        [decoded.userId]
      );
    }

    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = users[0];

    // 检查用户状态
    if (user.status && (user.status === 'inactive' || user.status === 'suspended')) {
      const statusText = {
        'inactive': '已禁用',
        'suspended': '已暂停'
      };
      return res.status(403).json({ 
        message: `账户已被${statusText[user.status]}，请联系管理员`,
        code: 'ACCOUNT_DISABLED',
        status: user.status
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '访问令牌已过期' });
    }
    return res.status(403).json({ message: '无效的访问令牌' });
  }
};

// 管理员权限检查中间件
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 生成JWT令牌
const generateToken = (userId, expiresIn = null) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
};

