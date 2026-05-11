const express = require('express');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取用户所有标签
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const [tags] = await pool.execute(
    `SELECT t.id, t.tag_name, t.tag_color, t.created_at,
     COUNT(r.file_id) as file_count
     FROM file_tags t
     LEFT JOIN file_tag_relations r ON t.id = r.tag_id
     WHERE t.user_id = ?
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [req.user.id]
  );
  res.json({ tags });
}));

// 创建标签
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { tag_name, tag_color } = req.body;
  if (!tag_name || tag_name.trim() === '') {
    return res.status(400).json({ message: '标签名不能为空' });
  }
  const [result] = await pool.execute(
    'INSERT INTO file_tags (tag_name, tag_color, user_id) VALUES (?, ?, ?)',
    [tag_name.trim(), tag_color || '#409EFF', req.user.id]
  );
  res.status(201).json({ message: '标签创建成功', id: result.insertId });
}));

// 更新标签
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { tag_name, tag_color } = req.body;
  const [existing] = await pool.execute(
    'SELECT * FROM file_tags WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '标签不存在' });
  }
  await pool.execute(
    'UPDATE file_tags SET tag_name = COALESCE(?, tag_name), tag_color = COALESCE(?, tag_color) WHERE id = ?',
    [tag_name ? tag_name.trim() : null, tag_color || null, req.params.id]
  );
  res.json({ message: '标签更新成功' });
}));

// 删除标签
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const [existing] = await pool.execute(
    'SELECT * FROM file_tags WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '标签不存在' });
  }
  await pool.execute('DELETE FROM file_tags WHERE id = ?', [req.params.id]);
  res.json({ message: '标签删除成功' });
}));

// 给文件打标签
router.post('/:id/files', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请提供文件ID列表' });
  }
  const [existing] = await pool.execute(
    'SELECT * FROM file_tags WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '标签不存在' });
  }
  let added = 0;
  for (const fileId of file_ids) {
    try {
      await pool.execute(
        'INSERT IGNORE INTO file_tag_relations (file_id, tag_id) VALUES (?, ?)',
        [fileId, req.params.id]
      );
      added++;
    } catch (e) { /* ignore duplicate */ }
  }
  res.json({ message: `成功添加 ${added} 个文件到标签` });
}));

// 移除文件标签
router.delete('/:id/files/:fileId', authenticateToken, asyncHandler(async (req, res) => {
  const [existing] = await pool.execute(
    'SELECT * FROM file_tags WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '标签不存在' });
  }
  await pool.execute(
    'DELETE FROM file_tag_relations WHERE tag_id = ? AND file_id = ?',
    [req.params.id, req.params.fileId]
  );
  res.json({ message: '已移除文件标签' });
}));

// 获取某标签下的所有文件
router.get('/:id/files', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const [existing] = await pool.execute(
    'SELECT * FROM file_tags WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '标签不存在' });
  }

  const [files] = await pool.execute(
    `SELECT f.*, r.created_at as tagged_at
     FROM file_tag_relations r
     JOIN files f ON r.file_id = f.id
     WHERE r.tag_id = ? AND f.user_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [req.params.id, req.user.id, parseInt(limit), offset]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM file_tag_relations r JOIN files f ON r.file_id = f.id WHERE r.tag_id = ? AND f.user_id = ?',
    [req.params.id, req.user.id]
  );

  res.json({
    files,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// 获取文件的所有标签
router.get('/files/:fileId', authenticateToken, asyncHandler(async (req, res) => {
  const [tags] = await pool.execute(
    `SELECT t.id, t.tag_name, t.tag_color
     FROM file_tag_relations r
     JOIN file_tags t ON r.tag_id = t.id
     JOIN files f ON r.file_id = f.id
     WHERE r.file_id = ? AND f.user_id = ?`,
    [req.params.fileId, req.user.id]
  );
  res.json({ tags });
}));

module.exports = router;
