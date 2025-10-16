const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 确保用户头像目录存在
const ensureAvatarDir = async (userId) => {
  const avatarDir = path.join(process.env.UPLOAD_PATH || './storage', 'users', `user_${userId}`, 'avatars');
  await fs.ensureDir(avatarDir);
  return avatarDir;
};

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const avatarDir = await ensureAvatarDir(req.user.id);
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar_${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 头像文件过滤器
const avatarFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上传用户头像
router.post('/upload', authenticateToken, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有上传头像文件' });
  }

  const file = req.file;
  const userId = req.user.id;

  // 检查文件大小
  if (file.size > 5 * 1024 * 1024) {
    await fs.remove(file.path);
    return res.status(400).json({ message: '头像文件大小不能超过5MB' });
  }

  // 获取图片信息
  let width = null, height = null;
  try {
    const metadata = await sharp(file.path).metadata();
    width = metadata.width || null;
    height = metadata.height || null;
  } catch (error) {
    console.error('获取图片元数据失败:', error);
    await fs.remove(file.path);
    return res.status(400).json({ message: '无效的图片文件' });
  }

  // 开始事务
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. 将之前的头像标记为非当前
    await connection.execute(
      'UPDATE user_avatars SET is_current = FALSE WHERE user_id = ?',
      [userId]
    );

    // 2. 保存新头像信息到数据库
    const [result] = await connection.execute(
      `INSERT INTO user_avatars (user_id, filename, original_name, file_path, file_size, mime_type, width, height, is_current) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [userId, file.filename, file.originalname, file.path, file.size, file.mimetype, width, height]
    );

    // 3. 更新用户表的avatar_url
    const avatarUrl = `/api/avatars/preview/${result.insertId}`;
    await connection.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    // 4. 清理旧头像（保留最近10张）
    const [oldAvatars] = await connection.execute(
      'SELECT id, file_path FROM user_avatars WHERE user_id = ? AND is_current = FALSE ORDER BY created_at DESC',
      [userId]
    );

    // 删除超过10张的旧头像
    if (oldAvatars.length > 10) {
      const avatarsToDelete = oldAvatars.slice(10);
      for (const avatar of avatarsToDelete) {
        try {
          await fs.remove(avatar.file_path);
          await connection.execute('DELETE FROM user_avatars WHERE id = ?', [avatar.id]);
        } catch (error) {
          console.error('删除旧头像失败:', error);
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      message: '头像上传成功',
      avatar: {
        id: result.insertId,
        filename: file.filename,
        original_name: file.originalname,
        file_size: file.size,
        width,
        height,
        url: avatarUrl
      }
    });

  } catch (error) {
    await connection.rollback();
    await fs.remove(file.path);
    throw error;
  } finally {
    connection.release();
  }
}));

// 获取用户头像列表
router.get('/list', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [avatars] = await pool.execute(
    'SELECT id, filename, original_name, file_size, width, height, is_current, created_at FROM user_avatars WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  res.json({
    avatars: avatars.map(avatar => ({
      ...avatar,
      url: `/api/avatars/preview/${avatar.id}`
    }))
  });
}));

// 获取头像预览
router.get('/preview/:id', authenticateToken, asyncHandler(async (req, res) => {
  const avatarId = req.params.id;
  const userId = req.user.id;

  const [avatars] = await pool.execute(
    'SELECT * FROM user_avatars WHERE id = ? AND user_id = ?',
    [avatarId, userId]
  );

  if (avatars.length === 0) {
    return res.status(404).json({ message: '头像不存在' });
  }

  const avatar = avatars[0];

  if (!await fs.pathExists(avatar.file_path)) {
    return res.status(404).json({ message: '头像文件不存在' });
  }

  res.sendFile(path.resolve(avatar.file_path));
}));

// 设置当前头像
router.put('/set-current/:id', authenticateToken, asyncHandler(async (req, res) => {
  const avatarId = req.params.id;
  const userId = req.user.id;

  // 检查头像是否存在且属于当前用户
  const [avatars] = await pool.execute(
    'SELECT * FROM user_avatars WHERE id = ? AND user_id = ?',
    [avatarId, userId]
  );

  if (avatars.length === 0) {
    return res.status(404).json({ message: '头像不存在' });
  }

  const avatar = avatars[0];

  // 开始事务
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. 将所有头像标记为非当前
    await connection.execute(
      'UPDATE user_avatars SET is_current = FALSE WHERE user_id = ?',
      [userId]
    );

    // 2. 设置指定头像为当前
    await connection.execute(
      'UPDATE user_avatars SET is_current = TRUE WHERE id = ?',
      [avatarId]
    );

    // 3. 更新用户表的avatar_url
    const avatarUrl = `/api/avatars/preview/${avatarId}`;
    await connection.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    await connection.commit();

    res.json({
      message: '头像设置成功',
      avatar: {
        id: avatar.id,
        filename: avatar.filename,
        original_name: avatar.original_name,
        url: avatarUrl
      }
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// 删除头像
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const avatarId = req.params.id;
  const userId = req.user.id;

  // 检查头像是否存在且属于当前用户
  const [avatars] = await pool.execute(
    'SELECT * FROM user_avatars WHERE id = ? AND user_id = ?',
    [avatarId, userId]
  );

  if (avatars.length === 0) {
    return res.status(404).json({ message: '头像不存在' });
  }

  const avatar = avatars[0];

  // 不能删除当前使用的头像
  if (avatar.is_current) {
    return res.status(400).json({ message: '不能删除当前使用的头像' });
  }

  // 删除物理文件
  try {
    await fs.remove(avatar.file_path);
  } catch (error) {
    console.error('删除头像文件失败:', error);
  }

  // 从数据库删除记录
  await pool.execute('DELETE FROM user_avatars WHERE id = ?', [avatarId]);

  res.json({ message: '头像删除成功' });
}));

module.exports = router;







