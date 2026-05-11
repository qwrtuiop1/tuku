const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取用户回收站文件
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const [items] = await pool.execute(
    `SELECT r.id, r.file_id, r.original_name, r.file_path, r.thumbnail_path,
     r.file_type, r.file_size, r.mime_type, r.width, r.height, r.duration,
     r.file_hash, r.deleted_at, r.expire_at
     FROM recycle_bin r
     WHERE r.user_id = ?
     ORDER BY r.deleted_at DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, parseInt(limit), offset]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM recycle_bin WHERE user_id = ?',
    [req.user.id]
  );

  res.json({
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// 恢复文件
router.post('/restore', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请提供要恢复的文件ID列表' });
  }

  const placeholders = file_ids.map(() => '?').join(',');
  const [items] = await pool.execute(
    `SELECT * FROM recycle_bin WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, req.user.id]
  );

  if (items.length === 0) {
    return res.status(404).json({ message: '没有找到可恢复的文件' });
  }

  // 从 recycle_bin 中移除（不删除物理文件，由 files INSERT 重新关联）
  for (const item of items) {
    await pool.execute(
      `INSERT INTO files (id, user_id, filename, original_name, file_type, file_size, file_path,
       thumbnail_path, folder_id, mime_type, width, height, duration, file_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE original_name = VALUES(original_name), file_size = VALUES(file_size)`,
      [item.file_id, item.user_id, path.basename(item.file_path), item.original_name, item.file_type,
       item.file_size, item.file_path, item.thumbnail_path, null, item.mime_type,
       item.width, item.height, item.duration, item.file_hash, item.deleted_at]
    );
    await pool.execute('DELETE FROM recycle_bin WHERE id = ?', [item.id]);
  }

  res.json({ message: `成功恢复 ${items.length} 个文件` });
}));

// 彻底删除
router.delete('/', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请提供要彻底删除的文件ID列表' });
  }

  const placeholders = file_ids.map(() => '?').join(',');
  const [items] = await pool.execute(
    `SELECT * FROM recycle_bin WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, req.user.id]
  );

  if (items.length === 0) {
    return res.status(404).json({ message: '没有找到可删除的文件' });
  }

  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

  for (const item of items) {
    // 删除物理文件
    try {
      let normalizedFilePath = (item.file_path || '').replace(/\\/g, '/').replace(/^\//, '');
      if (!normalizedFilePath.startsWith('users/')) {
        normalizedFilePath = 'users/' + normalizedFilePath;
      }
      const absPath = path.resolve(baseUploadPath, normalizedFilePath);
      if (await fs.pathExists(absPath)) {
        await fs.remove(absPath);
      }
      // 删除缩略图
      if (item.thumbnail_path) {
        let normalizedThumbPath = item.thumbnail_path.replace(/\\/g, '/').replace(/^\//, '');
        if (!normalizedThumbPath.startsWith('users/')) {
          normalizedThumbPath = 'users/' + normalizedThumbPath;
        }
        const thumbAbsPath = path.resolve(baseUploadPath, normalizedThumbPath);
        if (await fs.pathExists(thumbAbsPath)) {
          await fs.remove(thumbAbsPath);
        }
      }
    } catch (e) {
      console.error('删除物理文件失败:', e);
    }

    // 从 recycle_bin 删除记录
    await pool.execute('DELETE FROM recycle_bin WHERE id = ?', [item.id]);
    // 更新用户存储使用量
    await pool.execute(
      'UPDATE users SET used_storage = GREATEST(0, used_storage - ?) WHERE id = ?',
      [item.file_size, item.user_id]
    );
  }

  res.json({ message: `已彻底删除 ${items.length} 个文件` });
}));

// 清空回收站
router.delete('/purge', authenticateToken, asyncHandler(async (req, res) => {
  const [items] = await pool.execute(
    'SELECT * FROM recycle_bin WHERE user_id = ?',
    [req.user.id]
  );

  if (items.length === 0) {
    return res.json({ message: '回收站已是空的' });
  }

  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';

  for (const item of items) {
    try {
      let normalizedFilePath = (item.file_path || '').replace(/\\/g, '/').replace(/^\//, '');
      if (!normalizedFilePath.startsWith('users/')) {
        normalizedFilePath = 'users/' + normalizedFilePath;
      }
      const absPath = path.resolve(baseUploadPath, normalizedFilePath);
      if (await fs.pathExists(absPath)) {
        await fs.remove(absPath);
      }
      if (item.thumbnail_path) {
        let normalizedThumbPath = item.thumbnail_path.replace(/\\/g, '/').replace(/^\//, '');
        if (!normalizedThumbPath.startsWith('users/')) {
          normalizedThumbPath = 'users/' + normalizedThumbPath;
        }
        const thumbAbsPath = path.resolve(baseUploadPath, normalizedThumbPath);
        if (await fs.pathExists(thumbAbsPath)) {
          await fs.remove(thumbAbsPath);
        }
      }
    } catch (e) {
      console.error('删除物理文件失败:', e);
    }
    await pool.execute('DELETE FROM recycle_bin WHERE id = ?', [item.id]);
    await pool.execute(
      'UPDATE users SET used_storage = GREATEST(0, used_storage - ?) WHERE id = ?',
      [item.file_size, item.user_id]
    );
  }

  res.json({ message: `已清空回收站，删除 ${items.length} 个文件` });
}));

// 自动清理过期文件（由定时任务调用）
router.delete('/auto-cleanup', asyncHandler(async (req, res) => {
  const [expiredItems] = await pool.execute(
    'SELECT * FROM recycle_bin WHERE expire_at < NOW()'
  );

  if (expiredItems.length === 0) {
    return res.json({ message: '没有过期的文件', count: 0 });
  }

  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  let deletedCount = 0;

  for (const item of expiredItems) {
    try {
      let normalizedFilePath = (item.file_path || '').replace(/\\/g, '/').replace(/^\//, '');
      if (!normalizedFilePath.startsWith('users/')) {
        normalizedFilePath = 'users/' + normalizedFilePath;
      }
      const absPath = path.resolve(baseUploadPath, normalizedFilePath);
      if (await fs.pathExists(absPath)) {
        await fs.remove(absPath);
      }
      if (item.thumbnail_path) {
        let normalizedThumbPath = item.thumbnail_path.replace(/\\/g, '/').replace(/^\//, '');
        if (!normalizedThumbPath.startsWith('users/')) {
          normalizedThumbPath = 'users/' + normalizedThumbPath;
        }
        const thumbAbsPath = path.resolve(baseUploadPath, normalizedThumbPath);
        if (await fs.pathExists(thumbAbsPath)) {
          await fs.remove(thumbAbsPath);
        }
      }
    } catch (e) {
      console.error('清理过期文件失败:', e);
    }
    await pool.execute('DELETE FROM recycle_bin WHERE id = ?', [item.id]);
    await pool.execute(
      'UPDATE users SET used_storage = GREATEST(0, used_storage - ?) WHERE id = ?',
      [item.file_size, item.user_id]
    );
    deletedCount++;
  }

  res.json({ message: `自动清理完成，删除 ${deletedCount} 个过期文件`, count: deletedCount });
}));

// 获取用户回收站设置
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const [prefs] = await pool.execute(
    'SELECT recycle_days, auto_cleanup FROM user_preferences WHERE user_id = ?',
    [req.user.id]
  );
  if (prefs.length === 0) {
    return res.json({ recycle_days: 30, auto_cleanup: true });
  }
  res.json({
    recycle_days: prefs[0].recycle_days || 30,
    auto_cleanup: prefs[0].auto_cleanup !== 0
  });
}));

// 更新用户回收站设置
router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const { recycle_days, auto_cleanup } = req.body;
  const validDays = [7, 15, 30, 60, 0]; // 0 表示永久
  if (recycle_days !== undefined && !validDays.includes(parseInt(recycle_days))) {
    return res.status(400).json({ message: '回收时间必须是 7、15、30、60 或 0（永久）' });
  }
  await pool.execute(
    'UPDATE user_preferences SET recycle_days = COALESCE(?, recycle_days), auto_cleanup = COALESCE(?, auto_cleanup) WHERE user_id = ?',
    [recycle_days, auto_cleanup !== undefined ? (auto_cleanup ? 1 : 0) : null, req.user.id]
  );
  res.json({ message: '设置已保存' });
}));

module.exports = router;
