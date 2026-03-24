// EPass 通行证绑定/解绑 路由将放置在 router 初始化之后
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const geetestService = require('../services/geetestService');
const { pool } = require('../config/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { checkMaintenanceMode, checkRegistrationEnabled } = require('../middleware/maintenance');
const SettingsHistoryService = require('../services/settingsHistoryService');
const { sendPasswordResetEmail, sendEmailVerificationCode } = require('../services/emailService');
const { validatePasswordComplexity, getPasswordRequirements } = require('../utils/passwordValidator');
const { 
  createVerificationCode, 
  checkRateLimit, 
  verifyCode, 
  getCodeStats,
  clearCodesForEmail,
  startCleanupTask,
  verifyCodeOwnership,
  getCodesForUser,
  clearCodesForUser,
  CODE_CONFIG 
} = require('../services/verificationService');

const router = express.Router();
const pushService = require('../services/notificationPushService');

// 用户注册
router.post('/register', checkRegistrationEnabled, [
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/)
    .withMessage('用户名只能包含中文、字母、数字、下划线和空格')
    .custom((value) => {
      if (value && value.includes('@')) {
        throw new Error('用户名不能使用邮箱格式');
      }
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
  body('emailCode')
    .notEmpty()
    .withMessage('请输入邮箱验证码')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, email, password, emailCode } = req.body;

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

  // 验证邮箱验证码
  if (emailCode) {
    const codeResult = verifyCode(email, emailCode, 'verify_email', {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      email: email // 确保验证码只能用于指定邮箱
    });
    if (!codeResult.valid) {
      return res.status(400).json({ message: codeResult.message || '邮箱验证码无效或已过期' });
    }
  } else {
    return res.status(400).json({ message: '请先发送并输入邮箱验证码' });
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
    'INSERT INTO users (username, email, password_hash, status, last_login, login_count) VALUES (?, ?, ?, ?, NOW(), ?)',
    [username, email, passwordHash, 'active', 0]
  );

  // 生成JWT令牌
  const token = generateToken(result.insertId);

  res.status(201).json({
    message: '注册成功',
    token,
    user: {
      id: result.insertId,
      username,
      email,
      role: 'user',
      status: 'active',
      last_login: new Date().toISOString(),
      login_count: 0,
      storage_limit: 1073741824, // 1GB
      used_storage: 0,
      created_at: new Date().toISOString()
    }
  });
}));

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  body('rememberMe').optional().isBoolean().withMessage('记住我选项必须是布尔值')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, password, rememberMe = false } = req.body;

  // 查找用户 - 使用安全的字段查询
  let users;
  try {
    [users] = await pool.execute(
      'SELECT id, username, email, password_hash, role, status, storage_limit, used_storage, avatar_url, created_at FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
  } catch (error) {
    // 如果查询失败，可能是表结构问题，尝试基本查询
    console.log('🔧 尝试基本用户查询...');
    [users] = await pool.execute(
      'SELECT id, username, email, password_hash, role, status, avatar_url, created_at FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
  }

  if (users.length === 0) {
    return res.status(401).json({ message: '用户名或密码错误' });
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

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  // 更新登录时间和次数
  try {
    await pool.execute(
      'UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = ?',
      [user.id]
    );
    
    // 记录登录日志
    await pool.execute(
      'INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)',
      [
        user.id,
        req.ip || req.connection.remoteAddress || 'unknown',
        req.get('User-Agent') || 'unknown',
        'password',
        true
      ]
    );
    
    console.log(`✅ 用户 ${user.username} 登录成功，登录次数已更新`);
  } catch (error) {
    console.error('❌ 更新登录统计失败:', error);
    // 不影响登录流程，继续执行
  }

  // 生成JWT令牌 - 根据记住我选项设置过期时间
  const tokenExpiry = rememberMe ? '30d' : '7d'; // 记住我：30天，否则7天
  const token = generateToken(user.id, tokenExpiry);

  // 获取用户的所有设置
  let userPreferences = { defaultView: 'grid' };
  let userNotificationSettings = {
    emailNotifications: true,
    storageWarnings: true,
    securityAlerts: true
  };

  try {
    // 获取用户偏好设置
    const [preferences] = await pool.execute(
      'SELECT default_view FROM user_preferences WHERE user_id = ?',
      [user.id]
    );
    if (preferences.length > 0) {
      userPreferences = preferences[0];
    }

    // 获取用户通知设置
    const [notifications] = await pool.execute(
      'SELECT email_notifications, storage_warnings, security_alerts FROM user_notification_settings WHERE user_id = ?',
      [user.id]
    );
    if (notifications.length > 0) {
      userNotificationSettings = {
        emailNotifications: notifications[0].email_notifications,
        storageWarnings: notifications[0].storage_warnings,
        securityAlerts: notifications[0].security_alerts
      };
    }

    console.log(`✅ 用户 ${user.id} 登录时设置恢复成功`);
  } catch (error) {
    console.log('⚠️ 用户设置恢复失败，使用默认设置:', error.message);
  }

  res.json({
    message: '登录成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      storage_limit: user.storage_limit || 1073741824,
      used_storage: user.used_storage || 0,
      last_login: new Date().toISOString(),
      login_count: (user.login_count || 0) + 1,
      avatar_url: user.avatar_url || '',
      nickname: user.nickname || '',
      bio: user.bio || '',
      created_at: user.created_at
    },
    settings: {
      preferences: userPreferences,
      notifications: userNotificationSettings
    }
  });
}));

// 获取当前用户信息
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  // 用户信息已经在中间件中验证并设置到req.user
  const user = req.user;
  
  console.log(`👤 用户信息查询结果: ${JSON.stringify(user, null, 2)}`);

  res.json({ user });
}));

// 获取用户个人信息
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  // 用户信息已经在中间件中验证并设置到req.user
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.nickname || user.username,
      bio: user.bio || '',
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      last_login: user.created_at // 使用创建时间作为最后登录时间
    }
  });
}));

// 更新个人资料
router.put('/profile', authenticateToken, [
  body('username')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[^\s@]+$/)
    .withMessage('用户名可用中文、字母、数字、下划线与符号，但不能有空格或@')
    .custom((value) => {
      if (value && value.includes('@')) {
        throw new Error('用户名不能使用邮箱格式');
      }
      if (value && value.trim().length === 0) {
        throw new Error('用户名不能只包含空格');
      }
      return true;
    }),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('nickname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符'),
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('个人简介长度不能超过200个字符'),
  body('emailCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位数字')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  try {
    const { username, email, nickname, bio, emailCode } = req.body;
    const hasQqOpenIdField = Object.prototype.hasOwnProperty.call(req.body || {}, 'qq_openid')
    const hasQqUnionIdField = Object.prototype.hasOwnProperty.call(req.body || {}, 'qq_unionid')
    const userId = req.user.id;
    
    // 获取当前用户信息
    const [currentUser] = await pool.execute(
      'SELECT username, email FROM users WHERE id = ?',
      [userId]
    );
    
    const currentUsername = currentUser[0]?.username;
    const currentEmail = currentUser[0]?.email;
    
    // 如果邮箱发生变化，需要验证码
    if (email && email !== currentEmail) {
      if (!emailCode) {
        return res.status(400).json({ message: '更改邮箱需要验证码' });
      }
      
      // 验证验证码
      const verificationResult = verifyCode(email, emailCode, 'change_email');
      if (!verificationResult.valid) {
        return res.status(400).json({ message: verificationResult.message });
      }
    }
    
    // 检查用户名和邮箱的唯一性（昵称不需要检查唯一性）
    const uniqueChecks = [];
    const uniqueValues = [];
    
    // 检查用户名唯一性
    if (username && username !== currentUsername) {
      uniqueChecks.push('username = ?');
      uniqueValues.push(username);
    }
    
    // 检查邮箱唯一性
    if (email && email !== currentEmail) {
      uniqueChecks.push('email = ?');
      uniqueValues.push(email);
    }
    
    // 如果有需要检查唯一性的字段，分别检查用户名和邮箱
    if (uniqueChecks.length > 0) {
      const duplicateErrors = [];
      const details = {};
      
      // 检查用户名唯一性
      if (username && username !== currentUsername) {
        const [usernameCheck] = await pool.execute(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, userId]
        );
        
        if (usernameCheck.length > 0) {
          duplicateErrors.push('用户名已被其他用户使用');
          details.usernameExists = true;
        }
      }
      
      // 检查邮箱唯一性
      if (email && email !== currentEmail) {
        const [emailCheck] = await pool.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );
        
        if (emailCheck.length > 0) {
          duplicateErrors.push('邮箱已被其他用户使用');
          details.emailExists = true;
        }
      }
      
      if (duplicateErrors.length > 0) {
        return res.status(400).json({ 
          message: duplicateErrors.join('，'),
          details
        });
      }
    }

    // 在清空第三方绑定时进行保护判断（最后一个第三方 + 未设置密码 -> 阻止）
    if (hasQqOpenIdField && req.body.qq_openid === null) {
      try {
        const [rows] = await pool.execute('SELECT qq_openid, epass_id, COALESCE(has_password, 1) AS has_password FROM users WHERE id = ?', [userId])
        const info = rows[0] || {}
        const boundCount = (info.qq_openid ? 1 : 0) + (info.epass_id ? 1 : 0)
        if (!info.has_password && boundCount <= 1) {
          return res.status(400).json({ success: false, code: 'NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER', message: '请先设置密码后再解绑最后一个第三方登录' })
        }
      } catch {}
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    // 只有当邮箱发生变化且验证码验证通过时，才更新邮箱
    if (email && email !== currentEmail) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    
    // 支持解绑/设置 qq_openid（允许显式传 null）
    if (hasQqOpenIdField) {
      updateFields.push('qq_openid = ?')
      updateValues.push(req.body.qq_openid || null)
    }
    // qq_unionid 的清空在更新后以兜底方式单独执行，避免字段不存在导致报错

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有需要更新的字段' });
    }
    
    // 添加更新时间戳
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    // 执行更新 - 确保只更新当前用户的资料
    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // 如果本次是显式解绑 qq_openid，则尝试清空可能存在的 qq_unionid/qq_number/third_party_type（字段不存在则忽略）
    if (hasQqOpenIdField && req.body.qq_openid === null) {
      try { await pool.execute('UPDATE users SET qq_unionid = NULL WHERE id = ?', [userId]) } catch {}
      try { await pool.execute('UPDATE users SET qq_number = NULL WHERE id = ?', [userId]) } catch {}
      try { await pool.execute('UPDATE users SET third_party_type = NULL WHERE id = ?', [userId]) } catch {}
      try { await pool.execute('UPDATE users SET third_party_id = NULL WHERE id = ?', [userId]) } catch {}
    }
    
    // 验证更新是否成功
    if (result.affectedRows === 0) {
      console.error(`⚠️ 用户 ${userId} 个人资料更新失败`);
      return res.status(500).json({ message: '个人资料更新失败' });
    }
    
    console.log(`✅ 用户 ${userId} 个人资料更新成功`);

    // 获取更新后的用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, nickname, bio, last_login, login_count, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: '个人资料更新成功',
      user: users[0]
    });
  } catch (error) {
    console.error('更新个人资料失败:', error);
    res.status(500).json({ message: '更新个人资料失败' });
  }
}));

// 简化的个人资料更新API - 专门处理nickname和bio
router.put('/profile/simple', authenticateToken, [
  body('nickname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符'),
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('个人简介长度不能超过200个字符')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  try {
    const { nickname, bio } = req.body;
    const userId = req.user.id;
    
    console.log('收到个人资料更新请求:', { nickname, bio, userId });
    
    // 构建更新字段
    const updateFields = [];
    const updateValues = [];
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    
    if (updateFields.length === 0) {
      console.log('没有需要更新的字段');
      return res.status(400).json({ message: '没有需要更新的字段' });
    }
    
    // 添加更新时间戳
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    console.log('执行SQL更新:', `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    
    // 执行更新
    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    console.log('更新结果:', result);
    
    if (result.affectedRows === 0) {
      console.log('没有行被更新');
      return res.status(500).json({ message: '个人资料更新失败' });
    }
    
    // 获取更新后的用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, nickname, bio, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: '个人资料更新成功',
      user: users[0]
    });
  } catch (error) {
    console.error('更新个人资料失败:', error);
    res.status(500).json({ message: '更新个人资料失败: ' + error.message });
  }
}));

// 修改密码
router.put('/password', [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符'),
  body('emailCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码长度必须为6位')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.user.id;
  
  const { newPassword, emailCode } = req.body;
  
  // 获取用户信息
  const [users] = await pool.execute(
    'SELECT id, email, password_hash FROM users WHERE id = ?',
    [userId]
  );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = users[0];

    // 验证邮箱验证码
    const codeResult = verifyCode(user.email, emailCode, 'password_change', {
      userId: user.id,
      username: user.username
    });

    if (!codeResult.valid) {
      return res.status(400).json({ message: codeResult.message });
    }

    // 检查新密码是否与原密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({ message: '新密码不能与原密码相同' });
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );
    // 标记为已设置密码
    try { await pool.execute('UPDATE users SET has_password = 1 WHERE id = ?', [userId]) } catch {}

    // 验证码已在verifyCode函数中自动标记为已使用

  res.json({ message: '密码修改成功' });
}));

// 用户登出（客户端处理，这里只是返回成功消息）
router.post('/logout', (req, res) => {
  res.json({ message: '登出成功' });
});

// 忘记密码
router.post('/forgot-password', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  try {
    // 查找用户
    const [users] = await pool.execute(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '该邮箱地址未注册' });
    }

    const user = users[0];

    // 生成重置token
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 发送密码重置邮件
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    
    if (emailResult.success) {
      console.log(`密码重置邮件已发送到: ${user.email}`);
      res.json({
        success: true,
        message: '重置链接已发送到您的邮箱，请查收邮件'
      });
    } else {
      console.error('邮件发送失败:', emailResult.error);
      res.status(500).json({ 
        message: '邮件发送失败，请稍后重试',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 重置密码
router.post('/reset-password', [
  body('token').notEmpty().withMessage('重置令牌不能为空'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  try {
    // 验证token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // 查找用户
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新密码
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    // 标记为已设置密码
    try { await pool.execute('UPDATE users SET has_password = 1 WHERE id = ?', [userId]) } catch {}

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }
    
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 发送邮箱验证码
router.post('/send-email-code', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('type')
    .optional()
    .isIn(['change_email', 'verify_email', 'forgot_password', 'password_change'])
    .withMessage('验证码类型无效')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { email, type = 'change_email' } = req.body;

  // 检查发送频率限制
  const rateLimit = checkRateLimit(email, type);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: `发送过于频繁，请等待 ${rateLimit.remainingTime} 秒后再试`
    });
  }

  // 如果是更改邮箱，检查新邮箱是否已被使用
  if (type === 'change_email') {
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '该邮箱已被其他用户使用' });
    }
  }

  try {
    // 生成验证码
    const code = createVerificationCode(email, type);
    
    // 发送邮件
    const emailResult = await sendEmailVerificationCode(email, code, type);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: '验证码已发送到您的邮箱'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '邮件发送失败，请稍后重试'
      });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败，请稍后重试'
    });
  }
}));

// 检查邮箱是否存在
router.post('/check-email', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  try {
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    res.json({
      exists: users.length > 0
    });
  } catch (error) {
    console.error('检查邮箱失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 验证忘记密码身份
router.post('/verify-forgot-password', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('emailCode').isLength({ min: 6, max: 6 }).withMessage('验证码必须是6位')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, email, emailCode } = req.body;

  try {
    // 检查用户名和邮箱是否匹配
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE username = ? AND email = ?',
      [username, email]
    );

    if (users.length === 0) {
      return res.json({
        valid: false,
        message: '用户名和邮箱不匹配'
      });
    }

    // 验证邮箱验证码
    const codeResult = verifyCode(email, emailCode, 'forgot_password', {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      username: username,
      email: email
    });

    if (!codeResult.valid) {
      return res.json({
        valid: false,
        message: codeResult.message || '验证码无效或已过期'
      });
    }
    
    // 如果验证码所有权验证需要数据库验证
    if (codeResult.ownershipVerified && codeResult.requiresDbVerification) {
      // 验证用户名和邮箱是否匹配
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND email = ?',
        [username, email]
      );
      
      if (users.length === 0) {
        return res.json({
          valid: false,
          message: '用户名和邮箱不匹配'
        });
      }
    }

    // 生成短期 resetToken，用于第三步跳过验证码
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign(
      { typ: 'reset_pw', username, email },
      process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback',
      { expiresIn: '10m' }
    )

    // 返回当前密码规则，供前端展示
    const [settingsRows] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['min_password_length', 'password_complexity']
    );
    const settings = {};
    settingsRows.forEach(row => { settings[row.setting_key] = row.setting_value });

    // 计算密码策略
    const minLength = parseInt(settings.min_password_length) || 6
    const complexity = settings.password_complexity || 'low'

    res.json({
      valid: true,
      message: '身份验证成功',
      resetToken,
      passwordRequirements: getPasswordRequirements(settings),
      passwordPolicy: { minLength, complexity }
    });
  } catch (error) {
    console.error('身份验证失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 检查新密码是否与原密码相同
router.post('/check-password-same', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('newPassword').notEmpty().withMessage('新密码不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, email, newPassword } = req.body;

  try {
    // 查找用户
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE username = ? AND email = ?',
      [username, email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 比较密码
    const bcrypt = require('bcryptjs');
    const isSame = await bcrypt.compare(newPassword, users[0].password_hash);

    res.json({
      isSame: isSame
    });
  } catch (error) {
    console.error('检查密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 新的重置密码API
router.post('/reset-password-new', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('newPassword').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('resetToken').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { username, email, emailCode, newPassword, resetToken } = req.body;

  try {
    // 再次验证身份，验证码仅当没有 resetToken 时才需要
    const [users] = await pool.execute(
      'SELECT id, password_hash FROM users WHERE username = ? AND email = ?',
      [username, email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    let tokenOk = false
    let codeResult = null
    if (resetToken) {
      try {
        const jwt = require('jsonwebtoken')
        const payload = jwt.verify(resetToken, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback')
        tokenOk = (payload?.typ === 'reset_pw' && payload?.username === username && payload?.email === email)
      } catch (e) { tokenOk = false }
    }
    if (!tokenOk) {
      // 回退到验证码校验（兼容旧前端）
      codeResult = verifyCode(email, emailCode, 'forgot_password', {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        username: username,
        email: email
      });
      if (!codeResult.valid) {
        return res.status(400).json({ message: codeResult.message || '验证码无效或已过期' });
      }
    }
    
    // 如果验证码所有权验证需要数据库验证
    if (codeResult && codeResult.ownershipVerified && codeResult.requiresDbVerification) {
      // 验证用户名和邮箱是否匹配
      const [users] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND email = ?',
        [username, email]
      );
      
      if (users.length === 0) {
        return res.status(400).json({ message: '用户名和邮箱不匹配' });
      }
    }

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
    const passwordValidation = validatePasswordComplexity(newPassword, settings);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: '密码不符合安全要求',
        errors: passwordValidation.errors,
        requirements: getPasswordRequirements(settings)
      });
    }

    // 检查新密码是否与原密码相同
    const bcrypt = require('bcryptjs');
    const isSame = await bcrypt.compare(newPassword, users[0].password_hash);

    if (isSame) {
      return res.status(400).json({ message: '新密码不能与原密码相同' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, users[0].id]
    );
    // 标记为已设置密码
    try { await pool.execute('UPDATE users SET has_password = 1 WHERE id = ?', [users[0].id]) } catch {}

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}));

// 获取验证码统计信息（管理员接口）
router.get('/code-stats/:email/:type', asyncHandler(async (req, res) => {
  const { email, type } = req.params;
  
  // 验证类型
  if (!['change_email', 'verify_email', 'forgot_password'].includes(type)) {
    return res.status(400).json({ message: '无效的验证码类型' });
  }
  
  const stats = getCodeStats(email, type);
  res.json({
    success: true,
    data: stats
  });
}));

// 清理指定邮箱的验证码（管理员接口）
router.delete('/clear-codes/:email/:type', asyncHandler(async (req, res) => {
  const { email, type } = req.params;
  
  // 验证类型
  if (!['change_email', 'verify_email', 'forgot_password'].includes(type)) {
    return res.status(400).json({ message: '无效的验证码类型' });
  }
  
  const clearedCount = clearCodesForEmail(email, type);
  res.json({
    success: true,
    message: `已清理 ${clearedCount} 个验证码`,
    clearedCount
  });
}));

// 启动验证码清理任务
router.post('/start-cleanup', asyncHandler(async (req, res) => {
  startCleanupTask();
  res.json({
    success: true,
    message: '验证码清理任务已启动'
  });
}));

// 获取用户的验证码统计信息
router.get('/user-code-stats/:userId/:type', asyncHandler(async (req, res) => {
  const { userId, type } = req.params;
  
  // 验证类型
  if (!['change_email', 'verify_email', 'forgot_password'].includes(type)) {
    return res.status(400).json({ message: '无效的验证码类型' });
  }
  
  const codes = getCodesForUser(userId, type);
  const now = Date.now();
  
  const stats = {
    total: codes.length,
    active: codes.filter(code => !code.used && now < code.expiresAt).length,
    expired: codes.filter(code => now >= code.expiresAt).length,
    used: codes.filter(code => code.used).length,
    maxAttemptsReached: codes.filter(code => code.attempts >= code.maxAttempts).length,
    ownershipVerified: codes.filter(code => code.ownershipVerified).length
  };
  
  res.json({
    success: true,
    data: stats
  });
}));

// 清理用户的所有验证码
router.delete('/clear-user-codes/:userId/:type', asyncHandler(async (req, res) => {
  const { userId, type } = req.params;
  
  // 验证类型
  if (!['change_email', 'verify_email', 'forgot_password'].includes(type)) {
    return res.status(400).json({ message: '无效的验证码类型' });
  }
  
  const clearedCount = clearCodesForUser(userId, type);
  res.json({
    success: true,
    message: `已清理用户 ${userId} 的 ${clearedCount} 个验证码`,
    clearedCount
  });
}));

// 验证码安全审计接口
router.get('/code-audit/:email/:type', asyncHandler(async (req, res) => {
  const { email, type } = req.params;
  
  // 验证类型
  if (!['change_email', 'verify_email', 'forgot_password'].includes(type)) {
    return res.status(400).json({ message: '无效的验证码类型' });
  }
  
  const codes = getCodesForEmail(email, type);
  const auditData = codes.map(code => ({
    codeId: code.codeId,
    email: code.email,
    type: code.type,
    userId: code.userId,
    createdAt: new Date(code.createdAt).toISOString(),
    expiresAt: new Date(code.expiresAt).toISOString(),
    used: code.used,
    usedAt: code.usedAt ? new Date(code.usedAt).toISOString() : null,
    attempts: code.attempts,
    maxAttempts: code.maxAttempts,
    ownershipVerified: code.ownershipVerified,
    verifiedBy: code.verifiedBy,
    ipAddress: code.ipAddress,
    userAgent: code.userAgent
  }));
  
  res.json({
    success: true,
    data: auditData
  });
}));

// 获取用户偏好设置
router.get('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  // 首先验证用户是否存在
  const [userCheck] = await pool.execute(
    'SELECT id FROM users WHERE id = ?',
    [userId]
  );
  
  if (userCheck.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 从数据库获取用户偏好设置，如果不存在则返回默认值
  const [preferences] = await pool.execute(
    'SELECT default_view FROM user_preferences WHERE user_id = ?',
    [userId]
  );

  const userPrefs = preferences.length > 0 ? preferences[0] : { default_view: 'grid' };
  
  console.log(`✅ 用户 ${userId} 偏好设置查询成功: defaultView=${userPrefs.default_view || 'grid'}`);
  
  res.json({
    success: true,
    data: {
      defaultView: userPrefs.default_view || 'grid'
    }
  });
}));

// 更新用户偏好设置
router.put('/preferences', [
  body('defaultView')
    .optional()
    .isIn(['grid', 'list'])
    .withMessage('默认视图必须是grid或list')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  const { defaultView } = req.body;
  
  // 首先验证用户是否存在
  const [userCheck] = await pool.execute(
    'SELECT id FROM users WHERE id = ?',
    [userId]
  );
  
  if (userCheck.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 检查用户偏好设置是否存在
  const [existing] = await pool.execute(
    'SELECT id FROM user_preferences WHERE user_id = ?',
    [userId]
  );

    if (existing.length > 0) {
      // 获取当前设置值用于历史记录
      const [currentSettings] = await pool.execute(
        'SELECT default_view FROM user_preferences WHERE user_id = ?',
        [userId]
      );
      
      const oldValue = currentSettings[0]?.default_view;
      const newValue = defaultView || 'grid';
      
      // 更新现有设置 - 确保只更新当前用户的设置
      const [result] = await pool.execute(
        'UPDATE user_preferences SET default_view = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newValue, userId]
      );
      
      // 验证更新是否成功
      if (result.affectedRows === 0) {
        console.error(`⚠️ 用户 ${userId} 偏好设置更新失败`);
        return res.status(500).json({ message: '偏好设置更新失败' });
      }
      
      // 记录设置变更历史
      if (oldValue !== newValue) {
        await SettingsHistoryService.recordSettingChange(
          userId,
          'preferences',
          'default_view',
          oldValue,
          newValue,
          '用户修改偏好设置',
          req
        );
      }
      
      console.log(`✅ 用户 ${userId} 偏好设置更新成功: defaultView=${newValue}`);
    } else {
      // 创建新设置 - 确保只创建当前用户的设置
      await pool.execute(
        'INSERT INTO user_preferences (user_id, default_view) VALUES (?, ?)',
        [userId, defaultView || 'grid']
      );
      
      // 记录设置变更历史
      await SettingsHistoryService.recordSettingChange(
        userId,
        'preferences',
        'default_view',
        null,
        defaultView || 'grid',
        '用户首次设置偏好',
        req
      );
      
      console.log(`✅ 用户 ${userId} 偏好设置创建成功: defaultView=${defaultView || 'grid'}`);
    }
    
  res.json({
    success: true,
    message: '偏好设置保存成功'
  });
}));

// 获取用户通知设置
router.get('/notification-settings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  // 首先验证用户是否存在
  const [userCheck] = await pool.execute(
    'SELECT id FROM users WHERE id = ?',
    [userId]
  );
  
  if (userCheck.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 从数据库获取用户通知设置，如果不存在则返回默认值
  const [settings] = await pool.execute(
    'SELECT email_notifications, storage_warnings, security_alerts FROM user_notification_settings WHERE user_id = ?',
    [userId]
  );

  const userSettings = settings.length > 0 ? settings[0] : {
    email_notifications: true,
    storage_warnings: true,
    security_alerts: true
  };
  
  console.log(`✅ 用户 ${userId} 通知设置查询成功: email=${userSettings.email_notifications}, storage=${userSettings.storage_warnings}, security=${userSettings.security_alerts}`);
  
  res.json({
    success: true,
    data: {
      emailNotifications: userSettings.email_notifications,
      storageWarnings: userSettings.storage_warnings,
      securityAlerts: userSettings.security_alerts
    }
  });
}));

// 更新用户通知设置
router.put('/notification-settings', [
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('邮件通知必须是布尔值'),
  body('storageWarnings')
    .optional()
    .isBoolean()
    .withMessage('存储警告必须是布尔值'),
  body('securityAlerts')
    .optional()
    .isBoolean()
    .withMessage('安全提醒必须是布尔值')
], authenticateToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  const { emailNotifications, storageWarnings, securityAlerts } = req.body;
  
  // 首先验证用户是否存在
  const [userCheck] = await pool.execute(
    'SELECT id FROM users WHERE id = ?',
    [userId]
  );
  
  if (userCheck.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 检查用户通知设置是否存在
  const [existing] = await pool.execute(
    'SELECT id FROM user_notification_settings WHERE user_id = ?',
    [userId]
  );

    if (existing.length > 0) {
      // 获取当前设置值用于历史记录
      const [currentSettings] = await pool.execute(
        'SELECT email_notifications, storage_warnings, security_alerts FROM user_notification_settings WHERE user_id = ?',
        [userId]
      );
      
      const oldSettings = currentSettings[0];
      const newSettings = {
        emailNotifications: emailNotifications ?? true,
        storageWarnings: storageWarnings ?? true,
        securityAlerts: securityAlerts ?? true
      };
      
      // 更新现有设置 - 确保只更新当前用户的设置
      const [result] = await pool.execute(
        'UPDATE user_notification_settings SET email_notifications = ?, storage_warnings = ?, security_alerts = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [
          newSettings.emailNotifications,
          newSettings.storageWarnings,
          newSettings.securityAlerts,
          userId
        ]
      );
      
      // 验证更新是否成功
      if (result.affectedRows === 0) {
        console.error(`⚠️ 用户 ${userId} 通知设置更新失败`);
        return res.status(500).json({ message: '通知设置更新失败' });
      }
      
      // 记录设置变更历史
      const changes = [];
      if (oldSettings.email_notifications !== newSettings.emailNotifications) {
        changes.push({
          key: 'email_notifications',
          oldValue: oldSettings.email_notifications,
          newValue: newSettings.emailNotifications
        });
      }
      if (oldSettings.storage_warnings !== newSettings.storageWarnings) {
        changes.push({
          key: 'storage_warnings',
          oldValue: oldSettings.storage_warnings,
          newValue: newSettings.storageWarnings
        });
      }
      if (oldSettings.security_alerts !== newSettings.securityAlerts) {
        changes.push({
          key: 'security_alerts',
          oldValue: oldSettings.security_alerts,
          newValue: newSettings.securityAlerts
        });
      }
      
      // 记录每个变更
      for (const change of changes) {
        await SettingsHistoryService.recordSettingChange(
          userId,
          'notifications',
          change.key,
          change.oldValue,
          change.newValue,
          '用户修改通知设置',
          req
        );
      }
      
      console.log(`✅ 用户 ${userId} 通知设置更新成功: email=${newSettings.emailNotifications}, storage=${newSettings.storageWarnings}, security=${newSettings.securityAlerts}`);
    } else {
      // 创建新设置 - 确保只创建当前用户的设置
      await pool.execute(
        'INSERT INTO user_notification_settings (user_id, email_notifications, storage_warnings, security_alerts) VALUES (?, ?, ?, ?)',
        [
          userId,
          emailNotifications ?? true,
          storageWarnings ?? true,
          securityAlerts ?? true
        ]
      );
      
      // 记录设置变更历史
      await SettingsHistoryService.recordSettingChange(
        userId,
        'notifications',
        'all_settings',
        null,
        {
          emailNotifications: emailNotifications ?? true,
          storageWarnings: storageWarnings ?? true,
          securityAlerts: securityAlerts ?? true
        },
        '用户首次设置通知偏好',
        req
      );
      
      console.log(`✅ 用户 ${userId} 通知设置创建成功: email=${emailNotifications ?? true}, storage=${storageWarnings ?? true}, security=${securityAlerts ?? true}`);
    }
    
  res.json({
    success: true,
    message: '通知设置保存成功'
  });
}));

// 获取用户所有通知（包括已读的）
router.get('/notifications/all', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [notifications] = await pool.execute(
      `SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, 
              un.created_at, un.is_read, un.read_at
       FROM user_notifications un
       JOIN notification_history nh ON nh.id = un.notification_id
       WHERE un.user_id = ?
       ORDER BY un.created_at DESC
       LIMIT 50`,
      [userId]
    );
    
    res.json({
      success: true,
      notifications: notifications
    });
  } catch (error) {
    console.error('获取所有通知失败:', error);
    res.status(500).json({ message: '获取所有通知失败' });
  }
}));

// 获取用户未读通知
router.get('/notifications/unread', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    const [notifications] = await pool.execute(
      `SELECT nh.id, nh.notification_type, nh.title, nh.content, nh.priority, un.created_at
       FROM user_notifications un
       JOIN notification_history nh ON nh.id = un.notification_id
       WHERE un.user_id = ? AND un.is_read = 0
       ORDER BY un.created_at DESC
       LIMIT 10`,
      [userId]
    );
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('获取未读通知失败:', error);
    res.status(500).json({ message: '获取未读通知失败' });
  }
}));

// SSE: 订阅通知
router.get('/notifications/stream', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // 复用推送服务
  // 注：订阅函数内部会设置必要的 SSE 头并保持连接
  pushService.subscribe(userId, res);
}));

// 标记通知为已读
router.put('/notifications/:id/read', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;
  
  try {
    const [result] = await pool.execute(
      'UPDATE user_notifications SET is_read = 1, read_at = NOW() WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '通知不存在' });
    }
    
    res.json({
      success: true,
      message: '通知已标记为已读'
    });
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    res.status(500).json({ message: '标记通知为已读失败' });
  }
}));

// 获取用户设置历史
router.get('/settings-history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  // 获取查询参数
  const { settingType, limit = 50, offset = 0 } = req.query;
  
  // 获取设置历史
  const history = await SettingsHistoryService.getUserSettingsHistory(
    userId,
    settingType,
    parseInt(limit),
    parseInt(offset)
  );
  
  // 获取设置统计
  const stats = await SettingsHistoryService.getUserSettingsStats(userId);
  
  res.json({
    success: true,
    data: {
      history,
      stats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: stats.totalChanges
      }
    }
  });
}));

// 获取用户统计信息
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // 验证用户ID的有效性
  if (!userId || typeof userId !== 'number') {
    return res.status(401).json({ message: '无效的用户ID' });
  }
  
  // 获取用户文件统计
  const [fileStats] = await pool.execute(
    'SELECT COUNT(*) as totalFiles FROM files WHERE user_id = ?',
    [userId]
  );
  
  // 获取用户文件夹统计
  const [folderStats] = await pool.execute(
    'SELECT COUNT(*) as totalFolders FROM folders WHERE user_id = ?',
    [userId]
  );
  
  // 获取用户登录次数和最后登录时间
  const [userInfo] = await pool.execute(
    'SELECT login_count, last_login FROM users WHERE id = ?',
    [userId]
  );
  
  // 获取最近登录记录
  const [recentLogins] = await pool.execute(
    'SELECT login_time, ip_address, login_method FROM user_login_logs WHERE user_id = ? AND success = true ORDER BY login_time DESC LIMIT 5',
    [userId]
  );
  
  res.json({
    success: true,
    data: {
      totalFiles: fileStats[0].totalFiles || 0,
      totalFolders: folderStats[0].totalFolders || 0,
      loginCount: userInfo[0]?.login_count || 0,
      lastLogin: userInfo[0]?.last_login || null,
      recentLogins: recentLogins || []
    }
  });
}));

// 发送验证码（兼容前端调用）
router.post('/send-verification-code', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('type')
    .optional()
    .isIn(['change_email', 'verify_email', 'forgot_password', 'password_change'])
    .withMessage('验证码类型无效')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { email, type = 'change_email' } = req.body;

  // 检查发送频率限制
  const rateLimit = checkRateLimit(email, type);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: `发送过于频繁，请等待 ${rateLimit.remainingTime} 秒后再试`
    });
  }

  // 如果是更改邮箱，检查新邮箱是否已被使用
  if (type === 'change_email') {
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '该邮箱已被其他用户使用' });
    }
  }

  try {
    // 生成验证码
    const code = createVerificationCode(email, type);
    
    // 发送邮件
    const emailResult = await sendEmailVerificationCode(email, code, type);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: '验证码已发送到您的邮箱'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '邮件发送失败，请稍后重试'
      });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败，请稍后重试'
    });
  }
}));

// QQ登录相关路由
const qqOAuthService = require('../services/qqOAuthService');
const epassService = require('../services/epassService');
const { deleteUserCompletely } = require('../services/accountDeletionService');

// 获取QQ登录授权URL
router.get('/qq/auth', asyncHandler(async (req, res) => {
  try {
    qqOAuthService.validateConfig();
    const state = req.query.state || '';
    const authUrl = qqOAuthService.generateAuthUrl(state);
    
    res.json({
      success: true,
      authUrl: authUrl
    });
  } catch (error) {
    console.error('生成QQ授权URL失败:', error);
    res.status(500).json({
      success: false,
      message: 'QQ登录服务暂不可用'
    });
  }
}));

// QQ登录回调处理
router.post('/qq/callback', [
  body('code').notEmpty().withMessage('授权码不能为空')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { code, state } = req.body;

  try {
    // 1. 获取访问令牌
    const tokenData = await qqOAuthService.getAccessToken(code);
    
    // 2. 获取OpenID 与 UnionID
    const { openId, unionId } = await qqOAuthService.getOpenId(tokenData.accessToken);
    
    // 3. 获取用户信息
    const qqUserInfo = await qqOAuthService.getUserInfo(tokenData.accessToken, openId);
    
    // 4. 如果是绑定流程（state === 'bind'），则将当前登录用户与 openId 绑定
    if (state === 'bind') {
      if (!req.headers.authorization) {
        return res.status(401).json({ success: false, message: '未登录，无法绑定' });
      }
      const { authenticateToken } = require('../middleware/auth');
      // 手动校验token，获取 userId
      const jwt = require('jsonwebtoken');
      const raw = req.headers.authorization.replace(/^Bearer\s+/i, '');
      const decoded = jwt.verify(raw, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback');
      const userId = decoded.userId;

      // 检查 openId 是否已被其它账号占用
      const [exists] = await pool.execute('SELECT id FROM users WHERE qq_openid = ? OR qq_unionid = ?', [openId, unionId || null]);
      if (exists.length > 0) {
        return res.status(409).json({ success: false, message: '该QQ已绑定其他账号' });
      }
      await pool.execute('UPDATE users SET qq_openid = ?, qq_unionid = ?, third_party_type = ? WHERE id = ?', [openId, unionId || null, 'qq', userId]);
      return res.json({ success: true, message: 'QQ绑定成功' });
    }

    // 非绑定：查找或创建用户并登录
    let [users] = await pool.execute(
      'SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, created_at FROM users WHERE qq_openid = ? OR qq_unionid = ?',
      [openId, unionId || null]
    );

    let user;
    if (users.length > 0) {
      // 用户已存在，更新登录信息
      user = users[0];
      await pool.execute(
        'UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1, qq_unionid = COALESCE(qq_unionid, ?) WHERE id = ?',
        [unionId || null, user.id]
      );
      
      // 记录QQ登录日志
      await pool.execute(
        'INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)',
        [
          user.id,
          req.ip || req.connection.remoteAddress || 'unknown',
          req.get('User-Agent') || 'unknown',
          'qq',
          true
        ]
      );
    } else {
      // 首次：返回确认注册所需信息（无需跳注册页）
      const jwt = require('jsonwebtoken');
      const tempPayload = {
        typ: 'qq_signup',
        openId,
        unionId: unionId || null,
        nickname: qqUserInfo.nickname || '',
        avatar: qqUserInfo.avatar || ''
      };
      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback', { expiresIn: '30m' });
      return res.json({
        success: true,
        needs_confirm: true,
        tempToken,
        profile: {
          provider: 'qq',
          nickname: qqUserInfo.nickname || '',
          avatar: qqUserInfo.avatar || ''
        }
      });
    }

    // 5. 生成JWT令牌 - QQ登录默认使用较长的过期时间（30天）
    const token = generateToken(user.id, '30d');

    // 6. 获取用户设置
    let userPreferences = { defaultView: 'grid' };
    let userNotificationSettings = {
      emailNotifications: true,
      storageWarnings: true,
      securityAlerts: true
    };

    try {
      const [preferences] = await pool.execute(
        'SELECT default_view FROM user_preferences WHERE user_id = ?',
        [user.id]
      );
      if (preferences.length > 0) {
        userPreferences = preferences[0];
      }

      const [notifications] = await pool.execute(
        'SELECT email_notifications, storage_warnings, security_alerts FROM user_notification_settings WHERE user_id = ?',
        [user.id]
      );
      if (notifications.length > 0) {
        userNotificationSettings = {
          emailNotifications: notifications[0].email_notifications,
          storageWarnings: notifications[0].storage_warnings,
          securityAlerts: notifications[0].security_alerts
        };
      }
    } catch (error) {
      console.log('⚠️ 用户设置恢复失败，使用默认设置:', error.message);
    }

    res.json({
      success: true,
      message: 'QQ登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        storage_limit: user.storage_limit || 1073741824,
        used_storage: user.used_storage || 0,
        avatar_url: user.avatar_url || '',
        nickname: qqUserInfo.nickname || '',
        bio: '',
        created_at: user.created_at
      },
      settings: {
        preferences: userPreferences,
        notifications: userNotificationSettings
      }
    });

  } catch (error) {
    console.error('QQ登录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'QQ登录失败，请重试'
    });
  }
}));

// 完成 QQ 首次登录的注册流程
router.post('/qq/complete-signup', [
  body('tempToken').notEmpty().withMessage('缺少临时令牌'),
  body('username').isLength({ min: 2, max: 20 }).matches(/^[^\s@]+$/),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('emailCode').isLength({ min: 6, max: 6 }).withMessage('验证码必须是6位')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
  }
  const { tempToken, username, password, email, emailCode, acceptAgreements } = req.body;
  if (!acceptAgreements) {
    return res.status(400).json({ success: false, message: '请先阅读并同意用户协议与隐私政策' });
  }
  // 校验验证码
  const codeResult = verifyCode(email, emailCode, 'verify_email');
  if (!codeResult.valid) {
    return res.status(400).json({ success: false, message: codeResult.message || '邮箱验证码无效' });
  }
  // 解析临时令牌
  const jwt = require('jsonwebtoken');
  let payload;
  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback');
    if (payload.typ !== 'qq_signup') throw new Error('invalid token');
  } catch (e) {
    return res.status(400).json({ success: false, message: '临时令牌无效或已过期' });
  }
  const { openId, unionId, nickname, avatar } = payload;
  // 唯一性校验
  const [u1] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
  if (u1.length > 0) return res.status(400).json({ success: false, message: '用户名已存在' });
  const [u2] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (u2.length > 0) return res.status(400).json({ success: false, message: '邮箱已被使用' });
  const [u3] = await pool.execute('SELECT id FROM users WHERE qq_openid = ? OR qq_unionid = ?', [openId, unionId || null]);
  if (u3.length > 0) return res.status(409).json({ success: false, message: '该QQ已绑定其他账号' });
  // 创建用户
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role, status, qq_openid, qq_unionid, third_party_type, avatar_url, last_login, login_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())',
    [username, email, passwordHash, 'user', 'active', openId, unionId || null, 'qq', avatar || '', 1]
  );
  const userId = result.insertId;
  // 登录日志
  await pool.execute(
    'INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)',
    [userId, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'qq', true]
  );
  // 签发登录 token
  const token = generateToken(userId, '30d');
  res.json({ success: true, message: '注册并登录成功', token });
}));

// 兼容QQ互联回调GET到后端API路径的情况：重定向到前端回调路由
router.get('/qq/callback', asyncHandler(async (req, res) => {
  try {
    const { code = '', state = '' } = req.query || {}
    const frontendRedirect = new URL(process.env.QQ_REDIRECT_URI || 'https://img.vtart.cn/api/auth/qq/callback')
    // 将 code/state 透传给前端路由
    if (code) frontendRedirect.searchParams.set('code', code)
    if (state) frontendRedirect.searchParams.set('state', state)
    return res.redirect(frontendRedirect.toString())
  } catch (e) {
    return res.status(400).json({ success: false, message: '无效的QQ回调请求' })
  }
}));

module.exports = router;

// ===== 在 router 初始化并导出后，再追加EPass与绑定状态路由 =====
// EPass 隐式登录回调：接收 accessToken 并登录/绑定/或返回注册需求
router.post('/epass/callback', asyncHandler(async (req, res) => {
  const { accessToken, state = '' } = req.body || {}
  if (!accessToken) return res.status(400).json({ success: false, message: '缺少accessToken' })
  try {
    // 拉取EPass用户信息
    const info = await epassService.getUserInfo(accessToken)

    // 绑定流程
    if (state === 'bind') {
      if (!req.headers.authorization) {
        return res.status(401).json({ success: false, message: '未登录，无法绑定' })
      }
      const jwt = require('jsonwebtoken')
      const raw = req.headers.authorization.replace(/^Bearer\s+/i, '')
      const decoded = jwt.verify(raw, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback')
      const userId = decoded.userId
      // 唯一性校验
      const [exist] = await pool.execute('SELECT id FROM users WHERE epass_id = ?', [info.epassId])
      if (exist.length > 0) return res.status(409).json({ success: false, message: '该通行证已绑定其他账号' })
      await pool.execute('UPDATE users SET epass_id = ? WHERE id = ?', [info.epassId, userId])
      return res.json({ success: true, message: 'EPass绑定成功' })
    }

    // 登录：查找已有用户
    let [users] = await pool.execute('SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, created_at FROM users WHERE epass_id = ?', [info.epassId])
    if (users.length === 0) {
      // 首次：返回确认注册所需信息（包含 bio）
      const jwt = require('jsonwebtoken')
      const tempPayload = { typ: 'epass_signup', epassId: info.epassId, username: info.username || '', avatar: info.avatar || '', email: info.email || '', bio: info.bio || '' }
      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback', { expiresIn: '30m' })
      return res.json({ success: true, needs_confirm: true, tempToken, profile: { provider: 'epass', nickname: info.username || '', avatar: info.avatar || '', email: info.email || '' } })
    }
    const user = users[0]
    // 更新登录统计
    await pool.execute('UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = ?', [user.id])
    await pool.execute('INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)', [user.id, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'epass', true])

    // 恢复用户偏好与通知设置
    let userPreferences = { defaultView: 'grid' }
    let userNotificationSettings = { emailNotifications: true, storageWarnings: true, securityAlerts: true }
    try {
      const [preferences] = await pool.execute('SELECT default_view FROM user_preferences WHERE user_id = ?', [user.id])
      if (preferences.length > 0) userPreferences = preferences[0]
      const [notifications] = await pool.execute('SELECT email_notifications, storage_warnings, security_alerts FROM user_notification_settings WHERE user_id = ?', [user.id])
      if (notifications.length > 0) {
        userNotificationSettings = { emailNotifications: notifications[0].email_notifications, storageWarnings: notifications[0].storage_warnings, securityAlerts: notifications[0].security_alerts }
      }
    } catch {}

    const token = generateToken(user.id, '30d')
    return res.json({ success: true, message: 'EPass登录成功', token, user: { id: user.id, username: user.username, email: user.email, role: user.role, status: user.status, storage_limit: user.storage_limit || 1073741824, used_storage: user.used_storage || 0, avatar_url: user.avatar_url || '', nickname: info.username || '', bio: '', created_at: user.created_at }, settings: { preferences: userPreferences, notifications: userNotificationSettings } })
  } catch (e) {
    console.error('EPass 登录回调失败:', e)
    return res.status(500).json({ success: false, message: e.message || 'EPass登录失败，请重试' })
  }
}))

// 完成 EPass 首次登录的注册
router.post('/epass/complete-signup', [
  body('tempToken').notEmpty().withMessage('缺少临时令牌'),
  body('username').isLength({ min: 2, max: 20 }).matches(/^[^\s@]+$/),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('emailCode').isLength({ min: 6, max: 6 }).withMessage('验证码必须是6位')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() })
  const { tempToken, username, password, email, emailCode, acceptAgreements } = req.body
  if (!acceptAgreements) return res.status(400).json({ success: false, message: '请先阅读并同意用户协议与隐私政策' })
  const codeResult = verifyCode(email, emailCode, 'verify_email')
  if (!codeResult.valid) return res.status(400).json({ success: false, message: codeResult.message || '邮箱验证码无效' })
  const jwt = require('jsonwebtoken')
  let payload
  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback')
    if (payload.typ !== 'epass_signup') throw new Error('invalid token')
  } catch {
    return res.status(400).json({ success: false, message: '临时令牌无效或已过期' })
  }
  const { epassId, username: nick, avatar, email: preEmail } = payload
  // 唯一性校验
  const [u1] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])
  if (u1.length > 0) return res.status(400).json({ success: false, message: '用户名已存在' })
  const [u2] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (u2.length > 0) return res.status(400).json({ success: false, message: '邮箱已被使用' })
  const [u3] = await pool.execute('SELECT id FROM users WHERE epass_id = ?', [epassId])
  if (u3.length > 0) return res.status(409).json({ success: false, message: '该通行证已绑定其他账号' })
  // 创建用户
  const bcrypt = require('bcryptjs')
  const passwordHash = await bcrypt.hash(password, 10)
  const [result] = await pool.execute('INSERT INTO users (username, email, password_hash, role, status, epass_id, third_party_type, avatar_url, last_login, login_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())', [username, email, passwordHash, 'user', 'active', epassId, 'epass', avatar || '', 1])
  const userId = result.insertId
  await pool.execute('INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)', [userId, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'epass', true])
  const token = generateToken(userId, '30d')
  return res.json({ success: true, message: '注册并登录成功', token })
}))
// 确认注册（EPass）：消费 tempToken 并创建用户（写入 epass_id、username、email、avatar_url、nickname、bio）
router.post('/epass/confirm-register', [
  body('tempToken').notEmpty().withMessage('缺少临时令牌')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() })

  const { tempToken } = req.body
  const jwt = require('jsonwebtoken')
  let payload
  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback')
    if (payload.typ !== 'epass_signup') throw new Error('invalid token')
  } catch {
    return res.status(400).json({ success: false, message: '临时令牌无效或已过期' })
  }

  const epassId = payload.epassId
  const nickname = payload.username || ''
  const avatar = payload.avatar || ''
  const email = (payload.email || '').trim()
  const bio = (payload.bio || '').toString().slice(0, 200)

  if (!email) return res.status(400).json({ success: false, message: '缺少邮箱' })

  // 已存在该 epassId 则直接登录
  let [exists] = await pool.execute('SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, nickname, bio, created_at FROM users WHERE epass_id = ?', [epassId])
  if (exists.length > 0) {
    const user = exists[0]
    await pool.execute('UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = ?', [user.id])
    const token = generateToken(user.id, '30d')
    return res.json({ success: true, message: '登录成功', token, user })
  }

  // 生成用户名：尽量使用 EPass 的 username，冲突则加后缀
  const sanitize = (s) => (s || '').toString().replace(/[^\u4e00-\u9fa5a-zA-Z0-9_\s]/g, '').trim()
  const randomSuffix = () => Math.random().toString(16).slice(2, 8)
  let username = sanitize(nickname) || `epass_user_${String(epassId).slice(-6) || randomSuffix()}`
  for (let i = 0; i < 5; i++) {
    const [u] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])
    if (u.length === 0) break
    username = `${username}_${randomSuffix()}`
  }

  // 邮箱唯一校验
  const [emailTaken] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (emailTaken.length > 0) return res.status(409).json({ success: false, message: '该邮箱已存在，无法自动注册' })

  const bcrypt = require('bcryptjs')
  const passwordRandom = `Ep!${Math.random().toString(36).slice(2)}${Date.now()}`
  const passwordHash = await bcrypt.hash(passwordRandom, 10)

  try {
    let insertId
    try {
      const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, role, status, epass_id, third_party_type, avatar_url, nickname, bio, last_login, login_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())',
      [username, email, passwordHash, 'user', 'active', epassId, 'local', avatar || '', nickname || username, bio || null, 1]
      )
      insertId = result.insertId
    } catch (e1) {
      // 兼容未添加 nickname/bio 列的数据库
      if ((e1 && e1.code === 'ER_BAD_FIELD_ERROR') || /Unknown column\s+'(nickname|bio)'/i.test(e1?.message || '')) {
        const [result2] = await pool.execute(
          'INSERT INTO users (username, email, password_hash, role, status, epass_id, third_party_type, avatar_url, last_login, login_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())',
          [username, email, passwordHash, 'user', 'active', epassId, 'local', avatar || '', 1]
        )
        insertId = result2.insertId
      } else {
        throw e1
      }
    }
    const userId = insertId
    await pool.execute('INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)', [userId, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'epass', true])
    const token = generateToken(userId, '30d')
    return res.json({ success: true, message: '注册并登录成功', token, user: { id: userId, username, email, role: 'user', status: 'active', storage_limit: 1073741824, used_storage: 0, avatar_url: avatar || '', nickname: nickname || username, bio, created_at: new Date() } })
  } catch (e) {
    // 并发兜底：若刚创建成功但这里报错，再查一次
    try {
      const [u] = await pool.execute('SELECT id, username, email, role, status FROM users WHERE epass_id = ?', [epassId])
      if (u.length > 0) {
        const user = u[0]
        const token = generateToken(user.id, '30d')
        return res.json({ success: true, message: '登录成功', token, user })
      }
    } catch {}
    return res.status(500).json({ success: false, message: e?.message || '注册失败' })
  }
}))
router.post('/epass/bind', authenticateToken, asyncHandler(async (req, res) => {
  const { epassId } = req.body || {}
  if (!epassId) return res.status(400).json({ success: false, message: '缺少epassId' })
  const [exists] = await pool.execute('SELECT id FROM users WHERE epass_id = ?', [epassId])
  if (exists.length > 0) {
    return res.status(409).json({ success: false, message: '该通行证已绑定其他账号' })
  }
  await pool.execute('UPDATE users SET epass_id = ? WHERE id = ?', [epassId, req.user.id])
  return res.json({ success: true, message: 'EPass绑定成功' })
}))

router.post('/epass/unbind', authenticateToken, asyncHandler(async (req, res) => {
  // 阻止在未设置密码的情况下解绑最后一个第三方
  try {
    const [rows] = await pool.execute('SELECT qq_openid, epass_id, COALESCE(has_password, 1) AS has_password FROM users WHERE id = ?', [req.user.id])
    const info = rows[0] || {}
    const boundCount = (info.qq_openid ? 1 : 0) + (info.epass_id ? 1 : 0)
    if (!info.has_password && boundCount <= 1) {
      return res.status(400).json({ success: false, code: 'NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER', message: '请先设置密码后再解绑最后一个第三方登录' })
    }
  } catch {}
  await pool.execute('UPDATE users SET epass_id = NULL WHERE id = ?', [req.user.id])
  return res.json({ success: true, message: 'EPass已解绑' })
}))

// 解绑 QQ（清空 qq_openid 与 qq_unionid）
router.post('/qq/unbind', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // 阻止在未设置密码的情况下解绑最后一个第三方
    try {
      const [rows] = await pool.execute('SELECT qq_openid, epass_id, COALESCE(has_password, 1) AS has_password FROM users WHERE id = ?', [req.user.id])
      const info = rows[0] || {}
      const boundCount = (info.qq_openid ? 1 : 0) + (info.epass_id ? 1 : 0)
      if (!info.has_password && boundCount <= 1) {
        return res.status(400).json({ success: false, code: 'NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER', message: '请先设置密码后再解绑最后一个第三方登录' })
      }
    } catch {}
    await pool.execute('UPDATE users SET qq_openid = NULL, qq_unionid = NULL WHERE id = ?', [req.user.id])
    return res.json({ success: true, message: 'QQ已解绑' })
  } catch (e) {
    return res.status(500).json({ success: false, message: '解绑失败' })
  }
}))

// 确认注册（QQ）：消费 tempToken 并创建用户（写入 qq_openid/qq_unionid，使用占位邮箱）
router.post('/qq/confirm-register', [
  body('tempToken').notEmpty().withMessage('缺少临时令牌')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() })

  const { tempToken } = req.body
  const jwt = require('jsonwebtoken')
  let payload
  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET || 'tuku_default_jwt_secret_key_2024_fallback')
    if (payload.typ !== 'qq_signup') throw new Error('invalid token')
  } catch {
    return res.status(400).json({ success: false, message: '临时令牌无效或已过期' })
  }

  const openId = payload.openId
  const unionId = payload.unionId || null
  const nickname = payload.nickname || ''
  const avatar = payload.avatar || ''

  // 幂等：若已存在则直接登录
  let [exists] = await pool.execute('SELECT id, username, email, role, status, storage_limit, used_storage, avatar_url, created_at FROM users WHERE qq_openid = ? OR qq_unionid = ?', [openId, unionId])
  if (exists.length > 0) {
    const user = exists[0]
    await pool.execute('UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = ?', [user.id])
    await pool.execute('INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)', [user.id, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'qq', true])
    const token = generateToken(user.id, '30d')
    return res.json({ success: true, message: '登录成功', token, user })
  }

  // 生成用户名
  const sanitize = (s) => (s || '').toString().replace(/[^\u4e00-\u9fa5a-zA-Z0-9_\s]/g, '').trim()
  const randomSuffix = () => Math.random().toString(16).slice(2, 8)
  let username = sanitize(nickname) || `qq_user_${(unionId || openId || '').slice(-6) || randomSuffix()}`
  for (let i = 0; i < 5; i++) {
    const [u] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])
    if (u.length === 0) break
    username = `${username}_${randomSuffix()}`
  }
  // 邮箱改为 NULL（第三方注册默认无邮箱）
  const email = null

  const bcrypt = require('bcryptjs')
  const passwordRandom = `Qq!${Math.random().toString(36).slice(2)}${Date.now()}`
  const passwordHash = await bcrypt.hash(passwordRandom, 10)

  try {
    const [result] = await pool.execute('INSERT INTO users (username, email, password_hash, has_password, role, status, qq_openid, qq_unionid, third_party_type, avatar_url, last_login, login_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())', [username, email, passwordHash, 0, 'user', 'active', openId, unionId, 'qq', avatar || '', 1])
    const userId = result.insertId
    await pool.execute('INSERT INTO user_login_logs (user_id, login_time, ip_address, user_agent, login_method, success) VALUES (?, NOW(), ?, ?, ?, ?)', [userId, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent') || 'unknown', 'qq', true])
    const token = generateToken(userId, '30d')
    return res.json({ success: true, message: '注册并登录成功', token })
  } catch (e) {
    // 并发冲突兜底
    try {
      const [u] = await pool.execute('SELECT id, username, email, role, status FROM users WHERE qq_openid = ? OR qq_unionid = ?', [openId, unionId])
      if (u.length > 0) {
        const user = u[0]
        const token = generateToken(user.id, '30d')
        return res.json({ success: true, message: '登录成功', token, user })
      }
    } catch {}
    return res.status(500).json({ success: false, message: e?.message || '注册失败' })
  }
}))
router.get('/bindings', authenticateToken, asyncHandler(async (req, res) => {
  let rows
  // 尽量宽列查询；兼容缺失列回退，避免500
  try {
    ;[rows] = await pool.execute('SELECT qq_openid, qq_unionid, nickname, avatar_url, epass_id, qq_number, email, has_password FROM users WHERE id = ?', [req.user.id])
  } catch (e1) {
    try {
      ;[rows] = await pool.execute('SELECT qq_openid, qq_unionid, nickname, avatar_url, epass_id, email, has_password FROM users WHERE id = ?', [req.user.id])
    } catch (e2) {
      try {
        ;[rows] = await pool.execute('SELECT qq_openid, qq_unionid, nickname, avatar_url, epass_id, email FROM users WHERE id = ?', [req.user.id])
      } catch (e3) {
        rows = [{}]
      }
    }
  }
  const row = rows[0] || {}
  // 归一化占位邮箱：unbound_*@unbind.local 或 qq_*@noemail.qq.local 视为未绑定
  let normalizedEmail = row.email || null
  try {
    if (typeof normalizedEmail === 'string' && (/@unbind\.local$/i.test(normalizedEmail) || /@noemail\.qq\.local$/i.test(normalizedEmail))) {
      normalizedEmail = null
    }
  } catch {}
  return res.json({ success: true, bindings: {
    qq: !!row.qq_openid,
    qqOpenId: row.qq_openid || null,
    qqUnionId: row.qq_unionid || null,
    qqNickname: row.nickname || '',
    qqAvatar: row.avatar_url || '',
    qqNumber: row.qq_number || null,
    epass: !!row.epass_id,
    epassId: row.epass_id || null,
    email: normalizedEmail,
    hasPassword: !!row.has_password
  }})
}))

// 设置或更新 QQ 号（管理员或本人均可）
router.post('/qq/set-number', authenticateToken, [
  body('qqNumber').isString().isLength({ min: 5, max: 20 }).withMessage('QQ号长度需在5-20位之间')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() })
  }
  const { qqNumber } = req.body
  const userId = req.user.id
  // 确保列存在（容错处理）
  try { await pool.execute("ALTER TABLE users ADD COLUMN qq_number VARCHAR(20) NULL UNIQUE COMMENT 'QQ号'") } catch (e) { /* 已存在忽略 */ }
  // 更新
  try {
    await pool.execute('UPDATE users SET qq_number = ? WHERE id = ?', [qqNumber, userId])
    return res.json({ success: true, message: 'QQ号已更新' })
  } catch (e) {
    // 唯一键冲突
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: '该QQ号已被其他账号使用' })
    }
    return res.status(500).json({ success: false, message: '更新失败' })
  }
}))

// 解绑邮箱（将 email 置为 NULL）
router.post('/email/unbind', authenticateToken, asyncHandler(async (req, res) => {
  try {
    await pool.execute('UPDATE users SET email = NULL WHERE id = ?', [req.user.id])
    return res.json({ success: true, message: '邮箱已解绑' })
  } catch (e) {
    // 如果列不允许为 NULL，则回退为占位邮箱（确保唯一）
    if (e && (e.code === 'ER_BAD_NULL_ERROR' || e.errno === 1048)) {
      try {
        const placeholder = `unbound_${req.user.id}_${Date.now()}@unbind.local`
        await pool.execute('UPDATE users SET email = ? WHERE id = ?', [placeholder, req.user.id])
        return res.json({ success: true, message: '邮箱已解绑' })
      } catch (e2) {
        // 占位邮箱可能触发唯一索引冲突，添加随机后缀兜底
        try {
          const placeholder2 = `unbound_${req.user.id}_${Date.now()}_${Math.random().toString(36).slice(2,8)}@unbind.local`
          await pool.execute('UPDATE users SET email = ? WHERE id = ?', [placeholder2, req.user.id])
          return res.json({ success: true, message: '邮箱已解绑' })
        } catch {
          return res.status(500).json({ success: false, message: '解绑失败' })
        }
      }
    }
    return res.status(500).json({ success: false, message: '解绑失败' })
  }
}))

// ========== GeeTest v4 二次校验（用于注册/登录时的人机验证） ==========
router.post('/captcha/validate', asyncHandler(async (req, res) => {
  try {
    if (!geetestService.isConfigured()) {
      // 允许在未配置时通过离线放行（仅用于测试/紧急场景）
      if (geetestService.isOfflineAllowed()) {
        return res.json({ success: true, result: 'success', reason: 'offline_no_config' })
      }
      return res.status(503).json({ success: false, message: '验证码服务未配置' })
    }
    const result = await geetestService.validateSecondary(req.body)
    if (result.success) {
      return res.json({ success: true, result: 'success' })
    }
    return res.status(400).json({ success: false, result: 'fail', reason: result.reason || 'validate_failed' })
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || '校验失败' })
  }
}));

// 注销账号：删除当前用户的所有数据与存储
router.post('/account/delete', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { confirm } = req.body || {};
  if (!confirm || String(confirm) !== '注销') {
    return res.status(400).json({ success: false, message: '确认字样不正确，请输入：注销' });
  }
  try {
    await deleteUserCompletely(userId, { deleteSystemLogs: false });
  } catch (e) {
    return res.status(500).json({ success: false, message: e?.message || '注销失败' });
  }
  return res.json({ success: true, message: '账号已注销' });
}));

// 获取当前密码策略（供前端展示动态密码安全要求）
router.get('/password-policy', asyncHandler(async (req, res) => {
  try {
    const [settingsRows] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['min_password_length', 'password_complexity']
    );
    const settings = {};
    settingsRows.forEach(row => { settings[row.setting_key] = row.setting_value });
    const minLength = parseInt(settings.min_password_length) || 6;
    const complexity = settings.password_complexity || 'low';
    return res.json({
      success: true,
      passwordRequirements: getPasswordRequirements(settings),
      passwordPolicy: { minLength, complexity }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: '获取密码策略失败' });
  }
}));

