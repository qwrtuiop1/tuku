const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// 获取文件夹完整路径
const getFolderPath = async (folderId, userId) => {
  const folderPath = [];
  let currentFolderId = folderId;
  
  while (currentFolderId) {
    const [folders] = await pool.execute(
      'SELECT id, folder_name, parent_folder_id FROM folders WHERE id = ? AND user_id = ?',
      [currentFolderId, userId]
    );
    
    if (folders.length === 0) break;
    
    const folder = folders[0];
    folderPath.unshift({
      id: folder.id,
      name: folder.folder_name
    });
    
    currentFolderId = folder.parent_folder_id;
  }
  
  return folderPath;
};

// 获取文件夹树
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { parent_id } = req.query;

  let query = 'SELECT f.* FROM folders f WHERE f.user_id = ?';
  const params = [userId];

  if (parent_id) {
    query += ' AND f.parent_folder_id = ?';
    params.push(parent_id);
  } else {
    query += ' AND f.parent_folder_id IS NULL';
  }

  query += ' ORDER BY f.folder_name';

  const [folders] = await pool.execute(query, params);

  // 查询封面：每个文件夹内最新的一张图片
  if (folders.length > 0) {
    const fids = folders.map(f => f.id)
    const ph = fids.map(() => '?').join(',')
    const [coverRows] = await pool.execute(
      `SELECT folder_id, id AS cover_file_id FROM files
       WHERE folder_id IN (${ph}) AND user_id = ? AND file_type = 'image'
       ORDER BY folder_id, created_at DESC, id DESC`,
      [...fids, userId]
    )
    // 每个 folder 只取第一条（最新）
    const seen = new Set()
    for (const row of coverRows) {
      if (!seen.has(row.folder_id)) {
        seen.add(row.folder_id)
        // 找到对应的 folder 并写入封面
        for (const fd of folders) {
          if (fd.id === row.folder_id) {
            fd.cover_file_id = row.cover_file_id
            break
          }
        }
      }
    }
  }

  // 如果请求的是根文件夹，构建完整的文件夹树
  if (!parent_id) {
    // 获取所有文件夹来构建树形结构
    const [allFolders] = await pool.execute(
      'SELECT f.* FROM folders f WHERE f.user_id = ? ORDER BY f.folder_name',
      [userId]
    )

    // 同样查询所有文件夹的封面
    if (allFolders.length > 0) {
      const fids = allFolders.map(f => f.id)
      const ph = fids.map(() => '?').join(',')
      const [coverRows] = await pool.execute(
        `SELECT folder_id, id AS cover_file_id FROM files
         WHERE folder_id IN (${ph}) AND user_id = ? AND file_type = 'image'
         ORDER BY folder_id, created_at DESC, id DESC`,
        [...fids, userId]
      )
      const seen = new Set()
      for (const row of coverRows) {
        if (!seen.has(row.folder_id)) {
          seen.add(row.folder_id)
          for (const fd of allFolders) {
            if (fd.id === row.folder_id) {
              fd.cover_file_id = row.cover_file_id
              break
            }
          }
        }
      }
    }

    // 构建文件夹树
    const folderMap = new Map();
    const rootFolders = [];

    // 创建文件夹映射
    allFolders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // 构建树形结构
    allFolders.forEach(folder => {
      if (folder.parent_folder_id === null) {
        rootFolders.push(folderMap.get(folder.id));
      } else {
        const parent = folderMap.get(folder.parent_folder_id);
        if (parent) {
          parent.children.push(folderMap.get(folder.id));
        }
      }
    });

    res.json({ folders: rootFolders });
  } else {
    // 返回指定父文件夹的子文件夹
    res.json({ folders });
  }
}));

// 获取文件夹路径
router.get('/path/:id', asyncHandler(async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  const folderPath = await getFolderPath(folderId, userId);
  res.json({ path: folderPath });
}));

// 创建文件夹
router.post('/', [
  body('folder_name')
    .notEmpty()
    .withMessage('文件夹名称不能为空')
    .isLength({ max: 255 })
    .withMessage('文件夹名称不能超过255个字符'),
  body('parent_folder_id')
    .optional()
    .isInt()
    .withMessage('父文件夹ID必须是整数')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const { folder_name, parent_folder_id } = req.body;
  const userId = req.user.id;

  // 检查父文件夹是否存在且属于当前用户
  if (parent_folder_id) {
    const [parentFolders] = await pool.execute(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?',
      [parent_folder_id, userId]
    );

    if (parentFolders.length === 0) {
      return res.status(400).json({ message: '父文件夹不存在' });
    }
  }

  // 检查同级文件夹名称是否重复
  const [existingFolders] = await pool.execute(
    'SELECT id FROM folders WHERE folder_name = ? AND user_id = ? AND parent_folder_id = ?',
    [folder_name, userId, parent_folder_id || null]
  );

  if (existingFolders.length > 0) {
    return res.status(400).json({ message: '文件夹名称已存在' });
  }

  // 创建文件夹
  const [result] = await pool.execute(
    'INSERT INTO folders (user_id, folder_name, parent_folder_id) VALUES (?, ?, ?)',
    [userId, folder_name, parent_folder_id || null]
  );

  res.status(201).json({
    message: '文件夹创建成功',
    folder: {
      id: result.insertId,
      folder_name,
      parent_folder_id: parent_folder_id || null
    }
  });
}));

// 删除文件夹
router.delete('/:id', asyncHandler(async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  // 检查文件夹是否存在且属于当前用户
  const [folders] = await pool.execute(
    'SELECT id FROM folders WHERE id = ? AND user_id = ?',
    [folderId, userId]
  );

  if (folders.length === 0) {
    return res.status(404).json({ message: '文件夹不存在' });
  }

  // 检查是否有子文件夹（按用户ID过滤）
  const [childFolders] = await pool.execute(
    'SELECT id FROM folders WHERE parent_folder_id = ? AND user_id = ?',
    [folderId, userId]
  );

  if (childFolders.length > 0) {
    return res.status(400).json({ message: '文件夹不为空，无法删除' });
  }

  // 检查是否有文件（按用户ID过滤）
  const [files] = await pool.execute(
    'SELECT id FROM files WHERE folder_id = ? AND user_id = ?',
    [folderId, userId]
  );

  if (files.length > 0) {
    return res.status(400).json({ message: '文件夹不为空，无法删除' });
  }

  // 删除文件夹
  await pool.execute('DELETE FROM folders WHERE id = ?', [folderId]);

  res.json({ message: '文件夹删除成功' });
}));

// 重命名文件夹
router.put('/:id', [
  body('folder_name')
    .notEmpty()
    .withMessage('文件夹名称不能为空')
    .isLength({ max: 255 })
    .withMessage('文件夹名称不能超过255个字符')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '数据验证失败',
      errors: errors.array()
    });
  }

  const folderId = req.params.id;
  const { folder_name } = req.body;
  const userId = req.user.id;

  // 检查文件夹是否存在且属于当前用户
  const [folders] = await pool.execute(
    'SELECT * FROM folders WHERE id = ? AND user_id = ?',
    [folderId, userId]
  );

  if (folders.length === 0) {
    return res.status(404).json({ message: '文件夹不存在' });
  }

  const folder = folders[0];

  // 检查同级文件夹名称是否重复
  const [existingFolders] = await pool.execute(
    'SELECT id FROM folders WHERE folder_name = ? AND user_id = ? AND parent_folder_id = ? AND id != ?',
    [folder_name, userId, folder.parent_folder_id, folderId]
  );

  if (existingFolders.length > 0) {
    return res.status(400).json({ message: '文件夹名称已存在' });
  }

  // 更新文件夹名称
  await pool.execute(
    'UPDATE folders SET folder_name = ? WHERE id = ?',
    [folder_name, folderId]
  );

  res.json({ message: '文件夹重命名成功' });
}));

module.exports = router;

