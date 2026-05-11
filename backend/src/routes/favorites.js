const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// 获取用户收藏列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const [rows] = await pool.execute(
      `SELECT f.id, f.file_id, f.created_at, 
              fi.filename, fi.original_name, fi.file_type, fi.file_size, fi.thumbnail_path, fi.folder_id
       FROM file_favorites f
       JOIN files fi ON f.file_id = fi.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: rows });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ message: '获取收藏列表失败' });
  }
});

// 添加收藏
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const { file_id } = req.body;
    if (!file_id) return res.status(400).json({ message: '缺少 file_id' });
    
    await pool.execute(
      'INSERT IGNORE INTO file_favorites (user_id, file_id) VALUES (?, ?)',
      [req.user.id, file_id]
    );
    res.json({ message: '收藏成功' });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ message: '添加收藏失败' });
  }
});

// 取消收藏
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    await pool.execute(
      'DELETE FROM file_favorites WHERE user_id = ? AND file_id = ?',
      [req.user.id, req.params.fileId]
    );
    res.json({ message: '已取消收藏' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ message: '取消收藏失败' });
  }
});

// 检查文件是否已收藏
router.get('/check/:fileId', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const [rows] = await pool.execute(
      'SELECT id FROM file_favorites WHERE user_id = ? AND file_id = ?',
      [req.user.id, req.params.fileId]
    );
    res.json({ isFavorite: rows.length > 0 });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json({ message: '检查收藏状态失败' });
  }
});

module.exports = router;
