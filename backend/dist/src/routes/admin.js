const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { requireAdmin, authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validatePasswordComplexity, getPasswordRequirements } = require('../utils/passwordValidator');

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
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;

  // 使用安全的字段查询
  let query = `
    SELECT id, username, email, role, status, storage_limit, used_storage, created_at 
    FROM users 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

  let users;
  try {
    [users] = await pool.execute(query, params);
  } catch (error) {
    // 如果查询失败，可能是表结构问题，尝试基本查询
    console.log('🔧 尝试基本用户列表查询...');
    const basicQuery = `
      SELECT id, username, email, role, status, created_at 
      FROM users 
      WHERE 1=1
    `;
    const basicParams = [];
    
    if (search) {
      basicQuery += ' AND (username LIKE ? OR email LIKE ?)';
      basicParams.push(`%${search}%`, `%${search}%`);
    }
    
    basicQuery += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    [users] = await pool.execute(basicQuery, basicParams);
  }

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
  const countParams = [];

  if (search) {
    countQuery += ' AND (username LIKE ? OR email LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
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
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

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
    
    // 外观设置
    'theme_mode': { type: 'string', required: false },
    'primary_color': { type: 'string', required: false },
    'sidebar_width': { type: 'string', required: false },
    'enable_animation': { type: 'string', required: false },
    'logo_url': { type: 'string', maxLength: 500, required: false },
    'favicon_url': { type: 'string', maxLength: 500, required: false },
    
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
  
  // 更新设置
  const updatePromises = [];
  for (const [key, value] of Object.entries(settings)) {
    let processedValue = value;
    
    // 特殊处理：将MB值转换为字节值
    if (key === 'max_file_size' || key === 'max_storage_per_user') {
      const mbValue = parseInt(value);
      if (!isNaN(mbValue) && mbValue > 0) {
        processedValue = (mbValue * 1024 * 1024).toString(); // 转换为字节
      }
    }
    
    updatePromises.push(
      pool.execute(
        'UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',
        [processedValue, key]
      )
    );
  }
  
  await Promise.all(updatePromises);
  
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
  
  res.json({ 
    message: '设置更新成功',
    updatedCount: Object.keys(settings).length,
    changes: changes.length > 0 ? changes : ['无变更']
  });
}));


// 测试第三方连接
router.post('/test-connection', [
  body('type').isIn(['qq', 'wechat']).withMessage('连接类型必须是qq或wechat'),
  body('appId').notEmpty().withMessage('应用ID不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: '参数错误', errors: errors.array() });
  }

  const { type, appId, appKey, appSecret } = req.body;
  
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
