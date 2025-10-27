const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { requireAdmin, authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validatePasswordComplexity, getPasswordRequirements } = require('../utils/passwordValidator');
const { createVerificationCode, verifyCode, checkRateLimit } = require('../services/verificationService');
const { sendEmailVerificationCode } = require('../services/emailService');

const router = express.Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

// 管理员创建用户
router.post('/users', [
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/)
    .withMessage('用户名只能包含中文、字母、数字、下划线和空格')
    .custom((value) => {
      // 检查用户名是否包含邮箱格式（包含@符号）
      if (value && value.includes('@')) {
        throw new Error('用户名不能使用邮箱格式');
      }
      // 检查是否只包含空格
      if (value && value.trim().length === 0) {
        throw new Error('用户名不能只包含空格');
      }
      return true;
    }),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色必须是 admin 或 user')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, email, password, role = 'user' } = req.body;

  // 获取安全设置
  const [settingsRows] = await pool.execute(
    'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
    ['min_password_length', 'password_complexity']
  );
  
  const settings = {};
  settingsRows.forEach(row => {
    settings[row.setting_key] = row.setting_value;
  });

  // 验证密码复杂度
  const passwordValidation = validatePasswordComplexity(password, settings);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      message: '密码不符合安全要求',
      errors: passwordValidation.errors,
      requirements: getPasswordRequirements(settings)
    });
  }

  // 分别检查用户名和邮箱是否已存在
  const [usernameCheck] = await pool.execute(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );
  
  const [emailCheck] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  // 构建精确的错误信息
  const duplicateErrors = [];
  if (usernameCheck.length > 0) {
    duplicateErrors.push('用户名已存在');
  }
  if (emailCheck.length > 0) {
    duplicateErrors.push('邮箱已存在');
  }

  if (duplicateErrors.length > 0) {
    return res.status(400).json({ 
      message: duplicateErrors.join('，'),
      details: {
        usernameExists: usernameCheck.length > 0,
        emailExists: emailCheck.length > 0
      }
    });
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 创建用户
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role, status, last_login, login_count, storage_limit, used_storage) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)',
    [username, email, passwordHash, role, 'active', 0, 1073741824, 0] // 1GB存储限制
  );

  // 记录创建操作到系统日志
  await pool.execute(
    'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [
      'info',
      `管理员创建了新用户: ${username} (邮箱: ${email}, 角色: ${role})`,
      'ADMIN_PANEL',
      req.user.id
    ]
  );

  res.status(201).json({
    message: '用户创建成功',
    user: {
      id: result.insertId,
      username,
      email,
      role,
      status: 'active',
      last_login: new Date().toISOString(),
      login_count: 0,
      storage_limit: 1073741824,
      used_storage: 0,
      created_at: new Date().toISOString()
    }
  });
}));

// 获取用户列表
router.get('/users', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status,
    created_from,
    created_to,
    last_login_from,
    last_login_to,
    sort_by,
    sort_order
  } = req.query;
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum;

  // 使用安全的字段查询
  let query = `
    SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, created_at, last_login, login_count 
    FROM users 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    query += ' AND role = ?'
    params.push(role)
  }
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  if (created_from) {
    query += ' AND created_at >= ?'
    params.push(created_from)
  }
  if (created_to) {
    query += ' AND created_at <= ?'
    params.push(created_to)
  }
  if (last_login_from) {
    query += ' AND last_login >= ?'
    params.push(last_login_from)
  }
  if (last_login_to) {
    query += ' AND last_login <= ?'
    params.push(last_login_to)
  }

  // 安全排序白名单
  const SORT_FIELDS = {
    created_at: 'created_at',
    last_login: 'last_login',
    used_storage: 'used_storage',
    username: 'username',
    email: 'email',
    login_count: 'login_count'
  }
  const sortField = SORT_FIELDS[String(sort_by)] || 'created_at'
  const sortDir = String(sort_order)?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  query += ` ORDER BY ${sortField} ${sortDir} LIMIT ${limitNum} OFFSET ${offset}`;

  let users;
  try {
    [users] = await pool.execute(query, params);
  } catch (error) {
    // 如果查询失败，可能是表结构问题，尝试基本查询
    console.log('🔧 尝试基本用户列表查询...');
    let basicQuery = `
      SELECT id, username, email, role, status, created_at 
      FROM users 
      WHERE 1=1
    `;
    const basicParams = [];
    
    if (search) {
      basicQuery += ' AND (username LIKE ? OR email LIKE ?)';
      basicParams.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      basicQuery += ' AND role = ?'
      basicParams.push(role)
    }
    if (status) {
      basicQuery += ' AND status = ?'
      basicParams.push(status)
    }
    
    basicQuery += ` ORDER BY ${sortField} ${sortDir} LIMIT ${limitNum} OFFSET ${offset}`;
    [users] = await pool.execute(basicQuery, basicParams);
  }

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
  const countParams = [];

  if (search) {
    countQuery += ' AND (username LIKE ? OR email LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    countQuery += ' AND role = ?'
    countParams.push(role)
  }
  if (status) {
    countQuery += ' AND status = ?'
    countParams.push(status)
  }
  if (created_from) {
    countQuery += ' AND created_at >= ?'
    countParams.push(created_from)
  }
  if (created_to) {
    countQuery += ' AND created_at <= ?'
    countParams.push(created_to)
  }
  if (last_login_from) {
    countQuery += ' AND last_login >= ?'
    countParams.push(last_login_from)
  }
  if (last_login_to) {
    countQuery += ' AND last_login <= ?'
    countParams.push(last_login_to)
  }

  let countResult;
  try {
    [countResult] = await pool.execute(countQuery, countParams);
  } catch (error) {
    console.log('🔧 尝试基本计数查询...');
    [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
  }

  res.json({
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limitNum)
    }
  });
}));

// 获取用户详情
router.get('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, nickname, bio, last_login, login_count, created_at, qq_openid, qq_unionid, epass_id FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ data: rows[0] });
  } catch (error) {
    console.log('🔧 获取用户详情查询回退:', error.message);
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    return res.json({ data: rows[0] });
  }
}));

// 管理员：发送查看用户敏感信息的邮箱验证码（先做人机验证）
router.post('/users/:id/view-password/send-code', asyncHandler(async (req, res) => {
  const { id } = req.params
  // 仅管理员已由上方中间件保证
  const [rows] = await pool.execute('SELECT id, email, username FROM users WHERE id = ?', [id])
  if (rows.length === 0) return res.status(404).json({ message: '用户不存在' })
  const email = rows[0].email
  if (!email) return res.status(400).json({ message: '该用户未设置邮箱，无法发送验证码' })

  const rate = checkRateLimit(email, 'admin_view_sensitive')
  if (!rate.allowed) {
    return res.status(429).json({ message: `发送过于频繁，请 ${rate.remainingTime}s 后再试` })
  }
  const code = createVerificationCode(email, 'admin_view_sensitive', rows[0].id)
  try {
    const r = await sendEmailVerificationCode(email, code, 'admin_view_sensitive')
    if (r?.success) return res.json({ success: true, message: '验证码已发送至用户邮箱' })
    return res.status(500).json({ message: '发送验证码失败，请稍后重试' })
  } catch (e) {
    return res.status(500).json({ message: '发送验证码失败，请稍后重试' })
  }
}))

// 管理员：校验验证码并返回用户密码摘要（不返回明文）
router.post('/users/:id/view-password/verify', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { code } = req.body || {}
  if (!code) return res.status(400).json({ message: '缺少验证码' })
  const [rows] = await pool.execute('SELECT id, email, username, password_hash FROM users WHERE id = ?', [id])
  if (rows.length === 0) return res.status(404).json({ message: '用户不存在' })
  const user = rows[0]
  const result = verifyCode(user.email, code, 'admin_view_sensitive', { userId: user.id, username: user.username })
  if (!result.valid) return res.status(400).json({ message: result.message || '验证码无效' })
  // 仅返回密码哈希的掩码摘要，避免泄露明文
  const hash = user.password_hash || ''
  const masked = hash ? `${hash.slice(0, 8)}****${hash.slice(-6)}` : ''
  return res.json({ success: true, passwordMaskedHash: masked })
}))

// 设置用户存储容量
router.put('/users/:id/storage', [
  body('storage_limit')
    .isInt({ min: 0 })
    .withMessage('存储容量必须是大于等于0的整数')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.params.id;
  const { storage_limit } = req.body;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, used_storage FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 检查新容量是否小于已使用容量
  if (storage_limit < user.used_storage) {
    return res.status(400).json({ 
      message: `新容量不能小于已使用容量 (${user.used_storage} 字节)` 
    });
  }

  // 更新存储容量
  await pool.execute(
    'UPDATE users SET storage_limit = ? WHERE id = ?',
    [storage_limit, userId]
  );

  res.json({ message: '存储容量设置成功' });
}));

// 设置用户角色
router.put('/users/:id/role', [
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('角色必须是 admin 或 user')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.params.id;
  const { role } = req.body;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  // 不能修改自己的角色
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: '不能修改自己的角色' });
  }

  // 更新用户角色
  await pool.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, userId]
  );

  res.json({ message: '用户角色设置成功' });
}));

// 设置用户状态（禁用/启用）
router.put('/users/:id/status', [
  body('status')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('状态必须是 active、inactive 或 suspended')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.params.id;
  const { status } = req.body;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username, role FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 不能修改自己的状态
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: '不能修改自己的状态' });
  }

  // 不能禁用其他管理员
  if (user.role === 'admin' && status !== 'active') {
    return res.status(400).json({ message: '不能禁用管理员账户' });
  }

  // 更新用户状态
  await pool.execute(
    'UPDATE users SET status = ? WHERE id = ?',
    [status, userId]
  );

  // 如果用户被禁用或暂停，清除所有该用户的token
  if (status === 'inactive' || status === 'suspended') {
    try {
      await pool.execute(
        'DELETE FROM user_tokens WHERE user_id = ?',
        [userId]
      );
      console.log(`🔑 已清除用户 ${user.username} 的所有登录token`);
    } catch (error) {
      console.log('⚠️ user_tokens表不存在，跳过token删除');
    }
  }

  // 记录操作日志
  const statusText = {
    'active': '启用',
    'inactive': '禁用', 
    'suspended': '暂停'
  };

  await pool.execute(
    'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [
      status === 'active' ? 'info' : 'warn',
      `管理员${req.user.username}将用户${user.username}的状态修改为: ${statusText[status]}`,
      'ADMIN_PANEL',
      req.user.id
    ]
  );

  res.json({ 
    message: `用户状态已更新为 ${statusText[status]}`,
    user: {
      id: parseInt(userId),
      username: user.username,
      status,
      statusText: statusText[status]
    }
  });
}));

// 批量设置用户状态
router.put('/users/batch-status', [
  body('userIds').isArray().withMessage('用户ID列表必须是数组'),
  body('userIds.*').isInt().withMessage('用户ID必须是整数'),
  body('status')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('状态必须是 active、inactive 或 suspended')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { userIds, status } = req.body;

  // 检查用户是否存在
  const placeholders = userIds.map(() => '?').join(',');
  const [users] = await pool.execute(
    `SELECT id, username, role FROM users WHERE id IN (${placeholders})`,
    userIds
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '没有找到任何用户' });
  }

  // 检查是否包含自己
  const selfIndex = userIds.indexOf(req.user.id);
  if (selfIndex !== -1) {
    return res.status(400).json({ message: '不能修改自己的状态' });
  }

  // 检查是否包含其他管理员
  const adminUsers = users.filter(user => user.role === 'admin');
  if (adminUsers.length > 0 && status !== 'active') {
    return res.status(400).json({ 
      message: `不能禁用管理员账户: ${adminUsers.map(u => u.username).join(', ')}` 
    });
  }

  // 批量更新用户状态
  const updatePlaceholders = userIds.map(() => '?').join(',');
  await pool.execute(
    `UPDATE users SET status = ? WHERE id IN (${updatePlaceholders})`,
    [status, ...userIds]
  );

  // 如果用户被禁用或暂停，清除所有相关token
  if (status === 'inactive' || status === 'suspended') {
    try {
      await pool.execute(
        `DELETE FROM user_tokens WHERE user_id IN (${placeholders})`,
        userIds
      );
      console.log(`🔑 已清除 ${userIds.length} 个用户的所有登录token`);
    } catch (error) {
      console.log('⚠️ user_tokens表不存在，跳过token删除');
    }
  }

  // 记录操作日志
  const statusText = {
    'active': '启用',
    'inactive': '禁用', 
    'suspended': '暂停'
  };

  await pool.execute(
    'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [
      status === 'active' ? 'info' : 'warn',
      `管理员${req.user.username}批量将 ${userIds.length} 个用户的状态修改为: ${statusText[status]}`,
      'ADMIN_PANEL',
      req.user.id
    ]
  );

  res.json({ 
    message: `已批量更新 ${userIds.length} 个用户状态为 ${statusText[status]}`,
    updatedCount: userIds.length,
    status,
    statusText: statusText[status],
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      status
    }))
  });
}));

// 强制用户登出
router.post('/users/:id/logout', asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 清除该用户的所有token
  try {
    await pool.execute(
      'DELETE FROM user_tokens WHERE user_id = ?',
      [userId]
    );
  } catch (error) {
    console.log('⚠️ user_tokens表不存在，跳过token删除');
  }

  res.json({ 
    message: `用户 ${user.username} 已被强制登出`,
    user: {
      id: user.id,
      username: user.username
    }
  });
}));

// 获取用户数据统计（删除前确认）
router.get('/users/:id/stats', asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 获取用户数据统计
  const [fileCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
    [userId]
  );

  const [folderCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM folders WHERE user_id = ?',
    [userId]
  );

  // 获取token数量
  const [tokenCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM user_tokens WHERE user_id = ?',
    [userId]
  );

  // 获取通知设置数量
  const [notificationCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM user_notification_settings WHERE user_id = ?',
    [userId]
  );

  // 获取偏好设置数量
  const [preferencesCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM user_preferences WHERE user_id = ?',
    [userId]
  );

  const [logCount] = await pool.execute(
    'SELECT COUNT(*) as count FROM system_logs WHERE user_id = ?',
    [userId]
  );

  // 获取用户存储使用情况
  const [storageInfo] = await pool.execute(
    'SELECT storage_limit, used_storage FROM users WHERE id = ?',
    [userId]
  );

  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at
    },
    dataStats: {
      files: fileCount[0].count,
      folders: folderCount[0].count,
      tokens: tokenCount[0].count,
      notifications: notificationCount[0].count,
      preferences: preferencesCount[0].count,
      logs: logCount[0].count
    },
    storage: {
      limit: storageInfo[0].storage_limit,
      used: storageInfo[0].used_storage,
      usage_percent: ((storageInfo[0].used_storage / storageInfo[0].storage_limit) * 100).toFixed(2)
    }
  });
}));

// 删除用户
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username, role FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 不能删除自己
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: '不能删除自己的账户' });
  }

  // 开始事务
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. 删除用户文件
    console.log(`🗑️ 删除用户 ${user.username} 的文件...`);
    const [fileResult] = await connection.execute(
      'DELETE FROM files WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${fileResult.affectedRows} 个文件`);

    // 2. 删除用户文件夹
    console.log(`📁 删除用户 ${user.username} 的文件夹...`);
    const [folderResult] = await connection.execute(
      'DELETE FROM folders WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${folderResult.affectedRows} 个文件夹`);

    // 3. 删除用户token
    console.log(`🔑 删除用户 ${user.username} 的登录token...`);
    const [tokenResult] = await connection.execute(
      'DELETE FROM user_tokens WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${tokenResult.affectedRows} 个token`);

    // 4. 删除用户通知设置
    console.log(`🔔 删除用户 ${user.username} 的通知设置...`);
    const [notificationResult] = await connection.execute(
      'DELETE FROM user_notification_settings WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${notificationResult.affectedRows} 个通知设置`);

    // 5. 删除用户偏好设置
    console.log(`⚙️ 删除用户 ${user.username} 的偏好设置...`);
    const [preferencesResult] = await connection.execute(
      'DELETE FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${preferencesResult.affectedRows} 个偏好设置`);

    // 6. 删除用户相关的系统日志（可选，也可以保留用于审计）
    console.log(`📝 删除用户 ${user.username} 的系统日志...`);
    const [logResult] = await connection.execute(
      'DELETE FROM system_logs WHERE user_id = ?',
      [userId]
    );
    console.log(`   删除了 ${logResult.affectedRows} 条日志`);

    // 7. 最后删除用户记录
    console.log(`👤 删除用户 ${user.username} 的记录...`);
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

    // 提交事务
    await connection.commit();

    // 记录删除操作到系统日志
    await pool.execute(
      'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
      [
        'info',
        `管理员删除了用户: ${user.username} (ID: ${userId})`,
        'ADMIN_PANEL',
        req.user.id
      ]
    );

    res.json({ 
      message: `用户 ${user.username} 及其所有相关数据已删除`,
      deletedData: {
        files: fileResult.affectedRows,
        folders: folderResult.affectedRows,
        tokens: tokenResult.affectedRows,
        notifications: notificationResult.affectedRows,
        preferences: preferencesResult.affectedRows,
        logs: logResult.affectedRows
      }
    });

  } catch (error) {
    // 回滚事务
    await connection.rollback();
    console.error('删除用户失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}));

// 获取存储统计
router.get('/storage-stats', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // 获取所有用户的存储使用情况
    const [storageStats] = await pool.execute(`
      SELECT 
        SUM(storage_limit) as total_storage,
        SUM(used_storage) as used_storage,
        SUM(storage_limit) - SUM(used_storage) as available_storage
      FROM users 
      WHERE status = 'active'
    `);

    // 获取文件统计
    const [fileStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_file_size
      FROM files
    `);

    // 获取用户统计
    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
      FROM users
    `);

    const stats = {
      total_storage: Number(storageStats[0].total_storage) || 0,
      used_storage: Number(storageStats[0].used_storage) || 0,
      available_storage: Number(storageStats[0].available_storage) || 0,
      total_files: Number(fileStats[0].total_files) || 0,
      total_file_size: Number(fileStats[0].total_file_size) || 0,
      total_users: Number(userStats[0].total_users) || 0,
      active_users: Number(userStats[0].active_users) || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('获取存储统计失败:', error);
    res.status(500).json({ message: '获取存储统计失败' });
  }
}));

// 获取系统日志
router.get('/logs', authenticateToken, asyncHandler(async (req, res) => {
  const { level = 'all', page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM system_logs WHERE 1=1';
  const params = [];

  if (level !== 'all') {
    query += ' AND level = ?';
    params.push(level);
  }

  query += ` ORDER BY timestamp DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

  const [logs] = await pool.execute(query, params);

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM system_logs WHERE 1=1';
  const countParams = [];

  if (level !== 'all') {
    countQuery += ' AND level = ?';
    countParams.push(level);
  }

  const [countResult] = await pool.execute(countQuery, countParams);

  res.json({
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// 清空系统日志
router.delete('/logs', authenticateToken, asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM system_logs');
  res.json({ message: '日志清空成功' });
}));

// 获取用户状态统计
router.get('/users/status-stats', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // 获取各状态用户数量
    const [statusStats] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM users 
      GROUP BY status
    `);

    // 获取总用户数
    const [totalStats] = await pool.execute(`
      SELECT COUNT(*) as total FROM users
    `);

    // 获取最近7天状态变更统计
    const [recentChanges] = await pool.execute(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as changes
      FROM system_logs 
      WHERE message LIKE '%状态修改为%' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    // 格式化状态统计
    const statusMap = {
      'active': { count: 0, label: '正常' },
      'inactive': { count: 0, label: '禁用' },
      'suspended': { count: 0, label: '暂停' }
    };

    statusStats.forEach(stat => {
      if (statusMap[stat.status]) {
        statusMap[stat.status].count = stat.count;
      }
    });

    res.json({
      total: totalStats[0].total,
      statusStats: statusMap,
      recentChanges: recentChanges,
      summary: {
        activeUsers: statusMap.active.count,
        inactiveUsers: statusMap.inactive.count,
        suspendedUsers: statusMap.suspended.count,
        totalUsers: totalStats[0].total
      }
    });
  } catch (error) {
    console.error('获取用户状态统计失败:', error);
    res.status(500).json({ message: '获取统计信息失败' });
  }
}));

// 获取系统统计
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  // 获取用户统计
  const [userStats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as user_growth
    FROM users
  `);

  // 获取文件统计
  const [fileStats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_files,
      SUM(file_size) as total_file_size,
      COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as file_growth,
      COUNT(CASE WHEN file_type = 'image' THEN 1 END) as image_count,
      COUNT(CASE WHEN file_type = 'video' THEN 1 END) as video_count
    FROM files
  `);

  // 获取文件夹统计
  const [folderStats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_folders,
      COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as folder_growth
    FROM folders
  `);

  // 获取存储增长统计
  const [storageStats] = await pool.execute(`
    SELECT 
      SUM(file_size) as total_storage,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN file_size ELSE 0 END) as storage_growth
    FROM files
  `);

  res.json({
    total_users: userStats[0].total_users,
    user_growth: userStats[0].user_growth,
    total_files: fileStats[0].total_files,
    total_file_size: fileStats[0].total_file_size || 0,
    file_growth: fileStats[0].file_growth,
    image_count: fileStats[0].image_count,
    video_count: fileStats[0].video_count,
    total_folders: folderStats[0].total_folders,
    folder_growth: folderStats[0].folder_growth,
    storage_growth: storageStats[0].storage_growth || 0
  });
}));

// 获取系统设置
router.get('/settings', asyncHandler(async (req, res) => {
  const [settings] = await pool.execute(
    'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
  );
  
  const settingsMap = {};
  settings.forEach(setting => {
    settingsMap[setting.setting_key] = {
      value: setting.setting_value,
      description: setting.description
    };
    
    // 特别记录 max_file_size 的值
    if (setting.setting_key === 'max_file_size') {
      const bytes = parseInt(setting.setting_value);
      const mb = Math.round(bytes / (1024 * 1024));
    }
  });
  
  res.json({ settings: settingsMap });
}));

// 更新系统设置
router.put('/settings', [
  body('settings').isObject().withMessage('设置必须是对象格式')
], asyncHandler(async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { settings } = req.body;
  
  // 验证设置项 - 简化验证规则
  const validSettings = {
    // 基本设置
    'system_name': { type: 'string', maxLength: 50, required: false },
    'system_description': { type: 'string', maxLength: 200, required: false },
    'system_version': { type: 'string', maxLength: 20, required: false },
    
    // 存储设置
    'max_file_size': { type: 'string', required: false }, // 前端传递字符串
    'max_upload_files': { type: 'string', required: false }, // 前端传递字符串
    'allowed_image_types': { type: 'string', required: false },
    'allowed_video_types': { type: 'string', required: false },
    'allowed_document_types': { type: 'string', required: false },
    'thumbnail_size': { type: 'string', required: false }, // 前端传递字符串
    'max_storage_per_user': { type: 'string', required: false }, // 前端传递字符串
    
    // 用户管理设置
    'enable_registration': { type: 'string', required: false }, // 前端传递 'true'/'false'
    'require_email_verification': { type: 'string', required: false },
    'default_user_role': { type: 'string', required: false },
    'max_users': { type: 'string', required: false },
    
    // 安全设置
    'min_password_length': { type: 'string', required: false },
    'enable_login_lock': { type: 'string', required: false },
    'max_login_attempts': { type: 'string', required: false },
    'lockout_duration': { type: 'string', required: false },
    'session_timeout': { type: 'string', required: false },
    'enable_two_factor': { type: 'string', required: false },
    'password_complexity': { type: 'string', required: false },
    // 分享设置
    'sharing_enabled': { type: 'string', required: false },
    'share_disabled_at': { type: 'string', required: false },
    
    // 通知设置
    'enable_email_notification': { type: 'string', required: false },
    'smtp_host': { type: 'string', maxLength: 255, required: false },
    'smtp_port': { type: 'string', required: false },
    'smtp_username': { type: 'string', maxLength: 255, required: false },
    'smtp_password': { type: 'string', maxLength: 255, required: false },
    'sender_email': { type: 'string', required: false },
    'sender_name': { type: 'string', maxLength: 100, required: false },
    'enable_system_notification': { type: 'string', required: false },
    'notification_retention_days': { type: 'string', required: false },
    
    // 用户通知偏好设置
    'enable_login_notification': { type: 'string', required: false },
    'enable_upload_notification': { type: 'string', required: false },
    'enable_storage_warning': { type: 'string', required: false },
    'enable_security_alert': { type: 'string', required: false },
    'enable_maintenance_notification': { type: 'string', required: false },
    
    // 通知频率设置
    'email_frequency': { type: 'string', required: false },
    'system_frequency': { type: 'string', required: false },
    
    // 外观设置
    'theme_mode': { type: 'string', required: false },
    'primary_color': { type: 'string', required: false },
    'sidebar_width': { type: 'string', required: false },
    'enable_animation': { type: 'string', required: false },
    'logo_url': { type: 'string', maxLength: 500, required: false },
    'favicon_url': { type: 'string', maxLength: 500, required: false },
    'custom_css': { type: 'string', required: false },
    
    // 维护设置
    'maintenance_mode': { type: 'string', required: false }, // 前端传递 'true'/'false'
    'maintenance_message': { type: 'string', maxLength: 500, required: false },
    'backup_enabled': { type: 'string', required: false },
    'backup_frequency': { type: 'string', required: false },
    'backup_retention_days': { type: 'string', required: false },
    
    // 性能设置
    'cache_enabled': { type: 'string', required: false },
    'cache_ttl': { type: 'string', required: false },
    'max_concurrent_uploads': { type: 'string', required: false },
    'image_compression_quality': { type: 'string', required: false },
    'video_compression_enabled': { type: 'string', required: false },
    
    // 第三方集成
    'qq_login_enabled': { type: 'string', required: false },
    'qq_app_id': { type: 'string', maxLength: 50, required: false },
    'qq_app_key': { type: 'string', maxLength: 100, required: false },
    'wechat_login_enabled': { type: 'string', required: false },
    'wechat_app_id': { type: 'string', maxLength: 50, required: false },
    'wechat_app_secret': { type: 'string', maxLength: 100, required: false },
    
    // 其他设置
    'auto_clean_logs': { type: 'string', required: false } // 前端传递 'true'/'false'
  };
  
  // 验证设置项
  const validationErrors = [];
  for (const [key, value] of Object.entries(settings)) {
    const rule = validSettings[key];
    if (!rule) {
      validationErrors.push(`未知的设置项: ${key}`);
      continue;
    }
    
    // 简化的类型验证 - 只检查基本类型和长度
    if (rule.type === 'string') {
      if (typeof value !== 'string') {
        validationErrors.push(`${key} 必须是字符串`);
        continue;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        validationErrors.push(`${key} 长度不能超过 ${rule.maxLength} 个字符`);
      }
    }
  }
  
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      message: '设置验证失败', 
      errors: validationErrors 
    });
  }
  
  // 获取当前设置用于比较
  const settingKeys = Object.keys(settings);
  const placeholders = settingKeys.map(() => '?').join(',');
  const [oldSettings] = await pool.execute(
    `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
    settingKeys
  );
  
  const oldSettingsMap = {};
  oldSettings.forEach(setting => {
    oldSettingsMap[setting.setting_key] = setting.setting_value;
  });
  
  // 更新设置（若不存在则插入）
  for (const [key, value] of Object.entries(settings)) {
    let processedValue = value;
    // 特殊处理：将MB值转换为字节值
    if (key === 'max_file_size' || key === 'max_storage_per_user') {
      const mbValue = parseInt(value);
      if (!isNaN(mbValue) && mbValue > 0) {
        processedValue = (mbValue * 1024 * 1024).toString();
      }
    }
    const [result] = await pool.execute(
      'UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',
      [processedValue, key]
    );
    if (!result || result.affectedRows === 0) {
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [key, processedValue, null]
      );
    }
  }
  
  // 记录操作日志
  const changes = [];
  for (const [key, value] of Object.entries(settings)) {
    const oldValue = oldSettingsMap[key];
    if (oldValue !== value) {
      changes.push(`${key}: ${oldValue || '未设置'} → ${value}`);
    }
  }
  
  if (changes.length > 0) {
    try {
      await pool.execute(
        'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [
          'info',
          `管理员${req.user.username}修改了系统设置: ${changes.join(', ')}`,
          'ADMIN_PANEL',
          req.user.id
        ]
      );
    } catch (logError) {
      // 日志记录失败不影响主流程，继续执行
    }
  }
  // 更新全局配置版本（用于前端强制刷新）
  try {
    const version = new Date().toISOString();
    const [vr] = await pool.execute(
      'UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',[version,'config_version']
    );
    if (!vr || vr.affectedRows === 0) {
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        ['config_version', version, '前端配置版本号']
      );
    }
  } catch (_) {}
  
  res.json({ 
    message: '设置更新成功',
    updatedCount: Object.keys(settings).length,
    changes: changes.length > 0 ? changes : ['无变更']
  });
}));


// 测试第三方连接
router.post('/test-connection', [
  body('type').isIn(['qq', 'wechat', 'email']).withMessage('连接类型必须是qq、wechat或email'),
  body('appId').optional().notEmpty().withMessage('应用ID不能为空'),
  body('smtpHost').optional().notEmpty().withMessage('SMTP服务器不能为空'),
  body('smtpPort').optional().isInt({ min: 1, max: 65535 }).withMessage('SMTP端口必须是1-65535之间的整数'),
  body('smtpUsername').optional().notEmpty().withMessage('SMTP用户名不能为空'),
  body('smtpPassword').optional().notEmpty().withMessage('SMTP密码不能为空'),
  body('senderEmail').optional().isEmail().withMessage('发件人邮箱格式不正确')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { type, appId, appKey, appSecret, smtpHost, smtpPort, smtpUsername, smtpPassword, senderEmail, senderName } = req.body;
  
  try {
    if (type === 'qq') {
      // 测试QQ连接
      const qqOAuthService = require('../services/qqOAuthService');
      
      // 验证配置
      qqOAuthService.validateConfig();
      
      // 尝试生成授权URL来测试连接
      const authUrl = qqOAuthService.generateAuthUrl('test');
      
      res.json({
        success: true,
        message: 'QQ连接测试成功',
        authUrl: authUrl
      });
    } else if (type === 'wechat') {
      // 测试微信连接
      const axios = require('axios');
      
      // 使用微信API测试连接
      const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: appSecret
        },
        timeout: 10000
      });
      
      if (response.data.access_token) {
        res.json({
          success: true,
          message: '微信连接测试成功',
          token: response.data.access_token.substring(0, 10) + '...'
        });
      } else {
        res.json({
          success: false,
          message: response.data.errmsg || '微信连接测试失败'
        });
      }
    } else if (type === 'email') {
      // 测试邮件连接
      const nodemailer = require('nodemailer');
      
      // 创建邮件传输器
      const transporter = nodemailer.createTransporter({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort == 465, // true for 465, false for other ports
        auth: {
          user: smtpUsername,
          pass: smtpPassword
        }
      });
      
      // 验证连接
      await transporter.verify();
      
      // 发送测试邮件
      const testEmail = {
        from: `"${senderName || '图库系统'}" <${senderEmail}>`,
        to: senderEmail, // 发送给自己作为测试
        subject: '邮件连接测试 - 图库系统',
        html: `
          <h2>邮件连接测试成功</h2>
          <p>这是一封测试邮件，用于验证SMTP配置是否正确。</p>
          <p>测试时间：${new Date().toLocaleString('zh-CN')}</p>
          <p>如果您收到这封邮件，说明邮件通知功能配置正确。</p>
        `
      };
      
      await transporter.sendMail(testEmail);
      
      res.json({
        success: true,
        message: '邮件连接测试成功，测试邮件已发送'
      });
    }
  } catch (error) {
    console.error(`${type}连接测试失败:`, error);
    
    let errorMessage = `${type}连接测试失败`;
    if (error.response) {
      errorMessage = error.response.data?.errmsg || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.json({
      success: false,
      message: errorMessage
    });
  }
}));

// 重置用户密码
router.put('/users/:id/password', [
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6位')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { id } = req.params;
  const { password } = req.body;

  // 检查用户是否存在
  const [users] = await pool.execute(
    'SELECT id, username FROM users WHERE id = ?',
    [id]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const user = users[0];

  // 获取安全设置
  const [settingsRows] = await pool.execute(
    'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
    ['min_password_length', 'password_complexity']
  );
  
  const settings = {};
  settingsRows.forEach(row => {
    settings[row.setting_key] = row.setting_value;
  });

  // 验证密码复杂度
  const passwordValidation = validatePasswordComplexity(password, settings);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      message: '密码不符合安全要求',
      errors: passwordValidation.errors,
      requirements: getPasswordRequirements(settings)
    });
  }

  // 加密新密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 更新密码
  await pool.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, id]
  );

  // 记录操作日志
  await pool.execute(
    'INSERT INTO system_logs (level, message, source, user_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
    [
      'warn',
      `管理员${req.user.username}重置了用户${user.username}的密码`,
      'ADMIN_PANEL',
      req.user.id
    ]
  );

  res.json({
    message: '密码重置成功'
  });
}));

// 获取通知历史记录
router.get('/notifications', asyncHandler(async (req, res) => {
  const { userId, type, limit = 50, offset = 0 } = req.query;
  const currentUserId = req.user.id; // 当前登录的管理员ID
  
  // 管理员需要能看到所有通知，同时显示自己的已读状态
  let query = `
    SELECT nh.*, su.username AS sender_username, 
           un.is_read, un.read_at, un.created_at as user_notification_created_at
    FROM notification_history nh
    LEFT JOIN users su ON nh.sender_id = su.id
    LEFT JOIN user_notifications un ON nh.id = un.notification_id AND un.user_id = ?
    WHERE 1=1
  `;
  const params = [currentUserId];

  if (userId) {
    // 可选：按发送者过滤（注意这不是接收者）
    query += ' AND nh.sender_id = ?';
    params.push(userId);
  }

  if (type) {
    query += ' AND nh.notification_type = ?';
    params.push(type);
  }

  query += ' ORDER BY nh.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [notifications] = await pool.execute(query, params);

  // 统计总数
  let countQuery = 'SELECT COUNT(*) as total FROM notification_history nh WHERE 1=1';
  const countParams = [];
  if (userId) { countQuery += ' AND nh.sender_id = ?'; countParams.push(userId); }
  if (type) { countQuery += ' AND nh.notification_type = ?'; countParams.push(type); }
  const [countResult] = await pool.execute(countQuery, countParams);

  res.json({
    notifications,
    total: countResult[0].total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

// 标记通知为已读
router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const notificationService = require('../services/notificationService');
  const success = await notificationService.markNotificationAsRead(id, userId);
  
  if (success) {
    res.json({ message: '通知已标记为已读' });
  } else {
    res.status(404).json({ message: '通知不存在或无权限' });
  }
}));

// 获取通知统计
router.get('/notifications/stats', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  
  let query = 'SELECT ns.*, u.username FROM notification_stats ns JOIN users u ON ns.user_id = u.id';
  let params = [];
  
  if (userId) {
    query += ' WHERE ns.user_id = ?';
    params.push(userId);
  }
  
  query += ' ORDER BY ns.total_sent DESC';
  
  const [stats] = await pool.execute(query, params);
  
  res.json({ stats });
}));

// 清理过期通知
router.delete('/notifications/cleanup', asyncHandler(async (req, res) => {
  const notificationService = require('../services/notificationService');
  const cleanedCount = await notificationService.cleanExpiredNotifications();
  
  res.json({ 
    message: `清理完成，删除了 ${cleanedCount} 条过期通知`,
    cleanedCount 
  });
}));

// 创建通知
// 辅助函数：格式化为 MySQL DATETIME 字符串
function formatToMySqlDateTime(input) {
  if (!input) return null;
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (Number.isNaN(date?.getTime?.())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

router.post('/notifications', [
  body('title').notEmpty().withMessage('通知标题不能为空'),
  body('content').notEmpty().withMessage('通知内容不能为空'),
  body('notification_type').isIn(['system', 'maintenance', 'security_alert', 'storage_warning', 'email']).withMessage('通知类型无效'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('优先级无效'),
  body('send_at').notEmpty().withMessage('发送时间不能为空'),
  body('target').isIn(['all', 'admin', 'user']).withMessage('发送范围无效')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { title, content, notification_type, priority, send_at, delete_at, target } = req.body;
  
  const sendAtFormatted = formatToMySqlDateTime(send_at);
  const deleteAtFormatted = delete_at ? formatToMySqlDateTime(delete_at) : null;
  if (!sendAtFormatted) {
    return res.status(400).json({ message: '发送时间格式无效，请使用 YYYY-MM-DD HH:mm:ss' });
  }
  
  try {
    // 插入单条通知主记录
    const senderId = req.user?.id || null; // 允许为null（系统创建）
    const [result] = await pool.execute(
      'INSERT INTO notification_history (sender_id, notification_type, title, content, priority, send_at, delete_at, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [senderId, notification_type, title, content, priority, sendAtFormatted, deleteAtFormatted, target]
    );

    // 立即为目标用户创建投递记录，但不为发送者本人创建
    const sendTime = new Date(sendAtFormatted);
    const now = new Date();
    if (sendTime <= now) {
      await sendNotificationToUsers(result.insertId, senderId, target);
    }

    res.json({
      success: true,
      message: '通知创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建通知失败:', error);
    res.status(500).json({ 
      message: '创建通知失败', 
      error: error.message,
      code: error.code || null,
      sqlMessage: error.sqlMessage || null
    });
  }
}));

// 更新通知
router.put('/notifications/:id', [
  body('title').notEmpty().withMessage('通知标题不能为空'),
  body('content').notEmpty().withMessage('通知内容不能为空'),
  body('notification_type').isIn(['system', 'maintenance', 'security_alert', 'storage_warning', 'email']).withMessage('通知类型无效'),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('优先级无效'),
  body('send_at').notEmpty().withMessage('发送时间不能为空'),
  body('target').isIn(['all', 'admin', 'user']).withMessage('发送范围无效')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const notificationId = req.params.id;
  const { title, content, notification_type, priority, send_at, delete_at, target } = req.body;
  
  try {
    // 更新通知记录
    const [result] = await pool.execute(
      'UPDATE notification_history SET notification_type = ?, title = ?, content = ?, priority = ?, send_at = ?, delete_at = ?, target = ?, updated_at = NOW() WHERE id = ?',
      [notification_type, title, content, priority, send_at, delete_at || null, target, notificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({
      success: true,
      message: '通知更新成功'
    });
  } catch (error) {
    console.error('更新通知失败:', error);
    res.status(500).json({ message: '更新通知失败', error: error.message });
  }
}));

// 删除通知
router.delete('/notifications/:id', asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  
  try {
    const [result] = await pool.execute(
      'DELETE FROM notification_history WHERE id = ?',
      [notificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }

    res.json({
      success: true,
      message: '通知删除成功'
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({ message: '删除通知失败', error: error.message });
  }
}));

// 修复缺失的用户通知记录
router.post('/notifications/fix-missing', requireAdmin, asyncHandler(async (req, res) => {
  try {
    console.log('🔍 检查缺失的用户通知记录...');
    
    // 查找所有没有 user_notifications 记录的通知
    const [orphanedNotifications] = await pool.execute(`
      SELECT nh.id, nh.title, nh.target, nh.sender_id, nh.created_at
      FROM notification_history nh
      LEFT JOIN user_notifications un ON nh.id = un.notification_id
      WHERE un.notification_id IS NULL
      ORDER BY nh.id DESC
    `);
    
    console.log(`发现 ${orphanedNotifications.length} 条缺失用户通知记录的通知`);
    
    if (orphanedNotifications.length === 0) {
      return res.json({ success: true, message: '没有发现缺失的用户通知记录', fixed: 0 });
    }
    
    let fixedCount = 0;
    
    for (const notification of orphanedNotifications) {
      console.log(`处理通知 ID: ${notification.id}`);
      
      // 根据通知的目标范围确定用户
      let query = 'SELECT id FROM users WHERE status = "active"';
      let params = [];
      
      if (notification.target === 'admin') {
        query += ' AND role = "admin"';
      } else if (notification.target === 'user') {
        query += ' AND role = "user"';
      }
      
      if (notification.sender_id) {
        query += ' AND id <> ?';
        params.push(notification.sender_id);
      }
      
      const [users] = await pool.execute(query, params);
      
      // 为每个用户创建通知记录
      for (const user of users) {
        try {
          await pool.execute(
            'INSERT IGNORE INTO user_notifications (notification_id, user_id, is_read, created_at) VALUES (?, ?, 0, NOW())',
            [notification.id, user.id]
          );
          fixedCount++;
        } catch (error) {
          console.error(`为用户 ${user.id} 创建通知记录失败:`, error.message);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `修复完成，共创建 ${fixedCount} 条用户通知记录`,
      fixed: fixedCount,
      notifications: orphanedNotifications.length
    });
    
  } catch (error) {
    console.error('修复过程中出错:', error);
    res.status(500).json({ message: '修复失败', error: error.message });
  }
}));

// 发送通知给用户：仅写入 user_notifications 投递记录；不再向 notification_history 重复插入
const sendNotificationToUsers = async (notificationId, senderId, target) => {
  try {
    let query = 'SELECT id FROM users WHERE status = "active"';
    let params = [];

    if (target === 'admin') {
      query += ' AND role = "admin"';
    } else if (target === 'user') {
      query += ' AND role = "user"';
    }

    // 不再排除发送者，让所有目标用户都能收到通知
    // if (senderId) {
    //   query += ' AND id <> ?';
    //   params.push(senderId);
    // }

    const [users] = await pool.execute(query, params);

    // 为每个目标用户创建投递记录
    for (const user of users) {
      await pool.execute(
        'INSERT IGNORE INTO user_notifications (notification_id, user_id, is_read, created_at) VALUES (?, ?, 0, NOW())',
        [notificationId, user.id]
      );
    }

    // 推送给在线用户（SSE）
    try {
      const pushService = require('../services/notificationPushService');
      pushService.publishToUsers(users.map(u => u.id), {
        type: 'notification:new',
        notificationId
      });
    } catch (_) {}

    console.log(`✅ 通知 ${notificationId} 已发送给 ${users.length} 个用户`);
  } catch (error) {
    console.error('发送通知给用户失败:', error);
  }
};

// 手动迁移通知相关表结构（管理员接口）
router.post('/notifications/migrate', asyncHandler(async (req, res) => {
  try {
    // 创建 notification_history（如果不存在）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        sender_id INT NULL,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        send_at DATETIME NULL,
        delete_at DATETIME NULL,
        target VARCHAR(20) DEFAULT 'all',
        is_read TINYINT(1) DEFAULT 0,
        read_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 校验并补齐列
    const [cols] = await pool.execute('DESCRIBE notification_history');
    const colNames = cols.map(c => c.Field);
    const userIdCol = cols.find(c => c.Field === 'user_id');
    const safeAdd = async (sql) => { try { await pool.execute(sql); } catch (e) { /* ignore */ } };
    if (!colNames.includes('sender_id')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN sender_id INT NULL`);
    if (!colNames.includes('priority')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'`);
    if (!colNames.includes('send_at')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN send_at DATETIME NULL`);
    if (!colNames.includes('delete_at')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN delete_at DATETIME NULL`);
    if (!colNames.includes('target')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN target VARCHAR(20) DEFAULT 'all'`);
    if (!colNames.includes('updated_at')) await safeAdd(`ALTER TABLE notification_history ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);

    // 将 user_id 列改为可为空（用于系统级通知主表记录）
    try {
      if (userIdCol && userIdCol.Null === 'NO') {
        await pool.execute('ALTER TABLE notification_history MODIFY COLUMN user_id INT NULL');
      }
    } catch (e) {
      // 忽略可能的权限或已修改错误
    }

    // 创建 user_notifications（如果不存在）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        notification_id INT NOT NULL,
        user_id INT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        read_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_notification_user (notification_id, user_id),
        INDEX idx_user_id_is_read (user_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    res.json({ success: true, message: '通知相关表结构校验/创建完成' });
  } catch (error) {
    console.error('通知表结构迁移失败:', error);
    res.status(500).json({ success: false, message: '迁移失败', error: error.message });
  }
}));

// 发送测试通知
router.post('/notifications/test', [
  body('type').isIn(['email', 'system']).withMessage('通知类型必须是email或system'),
  body('recipient').notEmpty().withMessage('收件人不能为空'),
  body('subject').notEmpty().withMessage('主题不能为空'),
  body('content').notEmpty().withMessage('内容不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { type, recipient, subject, content } = req.body;
  const notificationService = require('../services/notificationService');
  
  try {
    if (type === 'email') {
      await notificationService.sendEmailNotification(recipient, subject, content);
      res.json({ message: '测试邮件发送成功' });
    } else if (type === 'system') {
      // 查找用户ID
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [recipient, recipient]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      await notificationService.sendSystemNotification(users[0].id, 'test', subject, content);
      res.json({ message: '测试系统通知发送成功' });
    }
  } catch (error) {
    res.status(500).json({ message: '发送测试通知失败', error: error.message });
  }
}));

// 版本检查接口（不需要认证）
router.get('/version', asyncHandler(async (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    esVersion: 'ES8+ (async/await supported)'
  });
}));

module.exports = router;
