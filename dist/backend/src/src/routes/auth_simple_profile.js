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
      return res.status(400).json({ message: '没有需要更新的字段' });
    }
    
    // 添加更新时间戳
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    // 执行更新
    const [result] = await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
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
