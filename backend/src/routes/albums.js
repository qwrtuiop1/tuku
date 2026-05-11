const express = require('express');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取用户所有相册
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const [albums] = await pool.execute(
    `SELECT a.id, a.album_name, a.album_description, a.is_public, a.cover_file_id, a.created_at, a.updated_at,
     COUNT(af.file_id) as file_count,
     f.filename, f.thumbnail_path, f.file_path
     FROM albums a
     LEFT JOIN album_files af ON a.id = af.album_id
     LEFT JOIN files f ON a.cover_file_id = f.id
     WHERE a.user_id = ?
     GROUP BY a.id
     ORDER BY a.updated_at DESC`,
    [req.user.id]
  );

  // 添加完整封面URL
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  const albumsWithCover = albums.map(album => {
    if (album.cover_file_id && album.file_path) {
      const normalized = album.file_path.replace(/\\/g, '/').replace(/^\//, '');
      const absPath = require('path').resolve(baseUploadPath, normalized);
      if (require('fs-extra').pathExistsSync(absPath)) {
        const relative = require('path').relative(baseUploadPath, absPath).replace(/\\/g, '/');
        album.cover_url = `${backendDomain}/uploads/${relative}`;
      }
    }
    delete album.filename;
    delete album.thumbnail_path;
    delete album.file_path;
    return album;
  });

  res.json({ albums: albumsWithCover });
}));

// 创建相册
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { album_name, album_description, is_public } = req.body;
  if (!album_name || album_name.trim() === '') {
    return res.status(400).json({ message: '相册名称不能为空' });
  }
  const [result] = await pool.execute(
    'INSERT INTO albums (album_name, album_description, is_public, user_id) VALUES (?, ?, ?, ?)',
    [album_name.trim(), album_description || '', is_public || false, req.user.id]
  );
  res.status(201).json({ message: '相册创建成功', id: result.insertId });
}));

// 更新相册
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { album_name, album_description, cover_file_id, is_public } = req.body;
  const [existing] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }
  await pool.execute(
    `UPDATE albums SET
     album_name = COALESCE(?, album_name),
     album_description = COALESCE(?, album_description),
     cover_file_id = COALESCE(?, cover_file_id),
     is_public = COALESCE(?, is_public)
     WHERE id = ?`,
    [album_name ? album_name.trim() : null, album_description !== undefined ? album_description : null, cover_file_id !== undefined ? cover_file_id : null, is_public !== undefined ? is_public : null, req.params.id]
  );
  res.json({ message: '相册更新成功' });
}));

// 删除相册
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const [existing] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (existing.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }
  await pool.execute('DELETE FROM albums WHERE id = ?', [req.params.id]);
  res.json({ message: '相册删除成功' });
}));

// 获取相册内文件列表
router.get('/:id/files', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const [albums] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (albums.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }

  const [files] = await pool.execute(
    `SELECT f.*, af.sort_order, af.added_at
     FROM album_files af
     JOIN files f ON af.file_id = f.id
     WHERE af.album_id = ?
     ORDER BY af.sort_order ASC, af.added_at DESC
     LIMIT ? OFFSET ?`,
    [req.params.id, parseInt(limit), offset]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) as total FROM album_files WHERE album_id = ?',
    [req.params.id]
  );

  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const filesWithUrls = files.map(file => {
    if (file.file_path) {
      const normalized = file.file_path.replace(/\\/g, '/').replace(/^\//, '');
      file.file_url = `${backendDomain}/uploads/${normalized}`;
    }
    if (file.thumbnail_path) {
      const normalized = file.thumbnail_path.replace(/\\/g, '/').replace(/^\//, '');
      file.thumbnail_url = `${backendDomain}/uploads/${normalized}`;
    }
    return file;
  });

  res.json({
    files: filesWithUrls,
    album: albums[0],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// 添加文件到相册
router.post('/:id/files', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请提供文件ID列表' });
  }
  const [albums] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (albums.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }
  let added = 0;
  for (const fileId of file_ids) {
    try {
      await pool.execute(
        'INSERT IGNORE INTO album_files (album_id, file_id) VALUES (?, ?)',
        [req.params.id, fileId]
      );
      added++;
    } catch (e) { /* ignore duplicate */ }
  }
  await pool.execute('UPDATE albums SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
  res.json({ message: `成功添加 ${added} 个文件到相册` });
}));

// 从相册移除文件
router.delete('/:id/files/:fileId', authenticateToken, asyncHandler(async (req, res) => {
  const [albums] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (albums.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }
  await pool.execute(
    'DELETE FROM album_files WHERE album_id = ? AND file_id = ?',
    [req.params.id, req.params.fileId]
  );
  await pool.execute('UPDATE albums SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
  res.json({ message: '已从相册移除文件' });
}));

// 调整相册内文件顺序
router.put('/:id/files/reorder', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  if (!file_ids || !Array.isArray(file_ids)) {
    return res.status(400).json({ message: '请提供文件ID顺序列表' });
  }
  const [albums] = await pool.execute(
    'SELECT * FROM albums WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (albums.length === 0) {
    return res.status(404).json({ message: '相册不存在' });
  }
  for (let i = 0; i < file_ids.length; i++) {
    await pool.execute(
      'UPDATE album_files SET sort_order = ? WHERE album_id = ? AND file_id = ?',
      [i, req.params.id, file_ids[i]]
    );
  }
  await pool.execute('UPDATE albums SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
  res.json({ message: '顺序已更新' });
}));

module.exports = router;
