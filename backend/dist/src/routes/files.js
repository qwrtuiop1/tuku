const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const ensureUploadDir = async (userId, folderId = null) => {
  // 使用绝对路径 - 避免dist更新时文件丢失
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  const userDir = path.join(baseUploadPath, 'users', `user_${userId}`);
  
  // 如果有文件夹ID，创建文件夹路径
  let folderDirPath = '';
  if (folderId) {
    folderDirPath = path.join('folders', `folder_${folderId}`);
  }
  
  const imagesDir = path.join(userDir, folderDirPath, 'images');
  const videosDir = path.join(userDir, folderDirPath, 'videos');
  const thumbnailsDir = path.join(userDir, folderDirPath, 'thumbnails');
  const avatarsDir = path.join(userDir, 'avatars'); // 头像始终在用户根目录

  await fs.ensureDir(imagesDir);
  await fs.ensureDir(videosDir);
  await fs.ensureDir(thumbnailsDir);
  await fs.ensureDir(avatarsDir);

  return { userDir, imagesDir, videosDir, thumbnailsDir, avatarsDir, folderDirPath };
};

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folderId = req.body.folder_id || null;
    const { imagesDir, videosDir } = await ensureUploadDir(req.user.id, folderId);
    const isImage = file.mimetype.startsWith('image/');
    cb(null, isImage ? imagesDir : videosDir);
  },
  filename: (req, file, cb) => {
    // 处理中文文件名编码问题
    let originalName = file.originalname;
    
    // 尝试修复中文文件名编码
    try {
      // 检查是否包含乱码字符
      const hasGarbledChars = /[^\x00-\x7F\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(originalName);
      
      if (hasGarbledChars) {
        // 尝试多种编码方式修复
        const encodings = ['latin1', 'binary', 'utf8'];
        
        for (const encoding of encodings) {
          try {
            const decoded = Buffer.from(originalName, encoding).toString('utf8');
            if (decoded && !decoded.includes('') && decoded.length > 0) {
              originalName = decoded;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      // 如果还是有问题，尝试URL解码
      if (originalName.includes('%')) {
        try {
          const urlDecoded = decodeURIComponent(originalName);
          if (urlDecoded && !urlDecoded.includes('')) {
            originalName = urlDecoded;
          }
        } catch (e) {
          // URL解码失败，使用原始名称
        }
      }
    } catch (error) {
      // 编码处理失败，使用原始名称
    }
    
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 动态获取文件大小限制
const getFileSizeLimit = async () => {
  try {
    const [result] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['max_file_size']
    );
    
    if (result.length > 0) {
      const maxFileSize = parseInt(result[0].setting_value);
      return maxFileSize || 100 * 1024 * 1024; // 默认100MB
    }
    
    return 100 * 1024 * 1024; // 默认100MB
  } catch (error) {
    console.error('获取文件大小限制失败:', error);
    return 100 * 1024 * 1024; // 默认100MB
  }
};

// 创建动态multer配置
const createUploadMiddleware = async () => {
  const fileSizeLimit = await getFileSizeLimit();
  
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileSizeLimit
    },
    // 确保正确处理文件名编码
    preservePath: true
  });
};

// 获取文件列表
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { folder_id, page = 1, limit = 20, file_type, search } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT f.*
    FROM files f 
    WHERE f.user_id = ?
  `;
  const params = [req.user.id];

  if (folder_id !== undefined && folder_id !== null) {
    query += ' AND f.folder_id = ?';
    params.push(folder_id);
  } else {
    // 如果没有指定folder_id，只返回根目录文件（folder_id为null）
    query += ' AND f.folder_id IS NULL';
  }

  if (file_type) {
    query += ' AND f.file_type = ?';
    params.push(file_type);
  }

  if (search) {
    query += ' AND (f.original_name LIKE ? OR f.filename LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY f.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

  const [files] = await pool.execute(query, params);

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM files WHERE user_id = ?';
  const countParams = [req.user.id];

  if (folder_id !== undefined && folder_id !== null) {
    countQuery += ' AND folder_id = ?';
    countParams.push(folder_id);
  } else {
    // 如果没有指定folder_id，只返回根目录文件（folder_id为null）
    countQuery += ' AND folder_id IS NULL';
  }

  if (file_type) {
    countQuery += ' AND file_type = ?';
    countParams.push(file_type);
  }

  if (search) {
    countQuery += ' AND (original_name LIKE ? OR filename LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }

  const [countResult] = await pool.execute(countQuery, countParams);

  // 为每个文件添加完整的访问URL
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  
  const filesWithUrls = files.map(file => {
    // 处理文件名乱码问题
    let displayName = file.original_name;
    try {
      // 检查是否包含乱码字符
      const hasGarbledChars = /[^\x00-\x7F\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(displayName);
      if (hasGarbledChars) {
        // 尝试不同的编码解码
        const encodings = ['latin1', 'binary', 'utf8'];
        for (const encoding of encodings) {
          try {
            const decoded = Buffer.from(displayName, encoding).toString('utf8');
            if (decoded && !decoded.includes('') && decoded.length > 0) {
              displayName = decoded;
              break;
            }
          } catch (e) { /* ignore */ }
        }
      }
      
      // 处理URL编码
      if (displayName.includes('%')) {
        try {
          const urlDecoded = decodeURIComponent(displayName);
          if (urlDecoded && !urlDecoded.includes('')) {
            displayName = urlDecoded;
          }
        } catch (e) { /* ignore */ }
        }
      } catch (error) {
        // 编码处理失败，使用原始名称
      }
    
    // 处理文件路径
    let normalizedFilePath = file.file_path.replace(/\\/g, '/');
    if (normalizedFilePath.startsWith('storage/')) {
      normalizedFilePath = normalizedFilePath.substring(8);
    }
    
    // 处理缩略图路径
    let thumbnailUrl = null;
    if (file.thumbnail_path) {
      let normalizedThumbnailPath = file.thumbnail_path.replace(/\\/g, '/');
      if (normalizedThumbnailPath.startsWith('storage/')) {
        normalizedThumbnailPath = normalizedThumbnailPath.substring(8);
      }
      thumbnailUrl = `${backendDomain}/uploads/${normalizedThumbnailPath}`;
    }
    
    return {
      ...file,
      original_name: displayName, // 使用解码后的文件名
      file_url: `${backendDomain}/uploads/${normalizedFilePath}`,
      thumbnail_url: thumbnailUrl,
      preview_url: `${backendDomain}/api/files/preview/${file.id}?token=${req.headers.authorization?.split(' ')[1] || ''}`
    };
  });

  res.json({
    files: filesWithUrls,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    }
  });
}));

// 上传文件
router.post('/upload', authenticateToken, asyncHandler(async (req, res) => {
  // 动态创建multer中间件
  const upload = await createUploadMiddleware();
  
  // 使用动态配置处理文件上传
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const fileSizeLimit = await getFileSizeLimit();
          const limitMB = Math.round(fileSizeLimit / (1024 * 1024));
          return res.status(400).json({ message: `文件大小不能超过 ${limitMB}MB` });
        }
      }
      return res.status(400).json({ message: err.message });
    }
    
    // 继续处理文件上传逻辑
    try {
      await handleFileUpload(req, res);
    } catch (error) {
      console.error('文件上传处理失败:', error);
      res.status(500).json({ message: '文件上传失败' });
    }
  });
}));

// 处理文件上传的核心逻辑
const handleFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有上传文件' });
  }

  const { folder_id } = req.body;
  const file = req.file;
  const userId = req.user.id;

  // 检查存储空间
  const [userResult] = await pool.execute(
    'SELECT storage_limit, used_storage FROM users WHERE id = ?',
    [userId]
  );

  const user = userResult[0];
  if (user.used_storage + file.size > user.storage_limit) {
    // 删除已上传的文件
    await fs.remove(file.path);
    return res.status(400).json({ message: '存储空间不足' });
  }

  // 获取文件信息
  const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
  let width = null, height = null, duration = null;

  if (fileType === 'image') {
    try {
      const metadata = await sharp(file.path).metadata();
      width = metadata.width || null;
        height = metadata.height || null;
      } catch (error) {
        width = null;
        height = null;
    }
  }

  // 生成缩略图
  let thumbnailPath = null;
  if (fileType === 'image') {
    try {
      const thumbnailFilename = `thumb_${path.basename(file.filename)}`;
      const { thumbnailsDir } = await ensureUploadDir(userId, folder_id);
      thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
      
      await sharp(file.path)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
      } catch (error) {
        // 缩略图生成失败，继续处理
      }
  }

  // 处理文件名编码问题
  let originalName = file.originalname;
  
  try {
    // 检查是否包含乱码字符
    const hasGarbledChars = /[^\x00-\x7F\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(originalName);
    
    if (hasGarbledChars) {
      // 尝试多种编码方式修复
      const encodings = ['latin1', 'binary', 'utf8'];
      
      for (const encoding of encodings) {
        try {
          const decoded = Buffer.from(originalName, encoding).toString('utf8');
          // 检查解码后的结果是否合理
          if (decoded && !decoded.includes('') && decoded.length > 0) {
            originalName = decoded;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // 如果还是有问题，尝试URL解码
    if (originalName.includes('%')) {
      try {
        const urlDecoded = decodeURIComponent(originalName);
        if (urlDecoded && !urlDecoded.includes('')) {
          originalName = urlDecoded;
        }
      } catch (e) {
        // URL解码失败，使用原始名称
      }
    }
    
  } catch (error) {
    // 编码处理失败，使用原始名称
  }

  // 生成相对路径用于存储 - 相对于存储根目录
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  const relativePath = path.relative(baseUploadPath, file.path);
  
  // 确保路径格式正确
  const normalizedRelativePath = relativePath.replace(/\\/g, '/');
  
  // 保存文件信息到数据库
  const [result] = await pool.execute(
    `INSERT INTO files (user_id, filename, original_name, file_type, file_size, file_path, thumbnail_path, folder_id, mime_type, width, height, duration) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, file.filename, originalName, fileType, file.size, normalizedRelativePath, thumbnailPath, folder_id || null, file.mimetype, width, height, duration]
  );

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage + ? WHERE id = ?',
    [file.size, userId]
  );

  // 生成文件访问URL
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const fileUrl = `${backendDomain}/uploads/${normalizedRelativePath}`;
  const thumbnailUrl = thumbnailPath ? `${backendDomain}/uploads/${path.relative(baseUploadPath, thumbnailPath).replace(/\\/g, '/')}` : null;

  res.status(201).json({
    message: '文件上传成功',
    file: {
      id: result.insertId,
      filename: file.filename,
      original_name: originalName,
      file_type: fileType,
      file_size: file.size,
      width,
      height,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      thumbnail_path: thumbnailPath
    }
  });
});

// 重命名文件
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const { original_name } = req.body;
  const userId = req.user.id;

  if (!original_name || original_name.trim() === '') {
    return res.status(400).json({ message: '文件名不能为空' });
  }

  // 检查文件是否存在且属于当前用户
  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  // 更新文件名
  await pool.execute(
    'UPDATE files SET original_name = ? WHERE id = ? AND user_id = ?',
    [original_name.trim(), fileId, userId]
  );

  res.json({ message: '文件重命名成功' });
}));

// 移动文件到文件夹
router.put('/:id/move', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const { folder_id } = req.body;
  const userId = req.user.id;

  // 检查文件是否存在且属于当前用户
  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  const file = files[0];

  // 如果指定了文件夹，检查文件夹是否存在
  if (folder_id) {
    const [folders] = await pool.execute(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?',
      [folder_id, userId]
    );

    if (folders.length === 0) {
      return res.status(400).json({ message: '目标文件夹不存在' });
    }
  }

  // 更新数据库中的文件夹ID
  await pool.execute(
    'UPDATE files SET folder_id = ? WHERE id = ?',
    [folder_id || null, fileId]
  );

  res.json({ message: '文件移动成功' });
}));

// 复制文件
router.post('/:id/copy', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const { folder_id } = req.body;
  const userId = req.user.id;

  // 检查文件是否存在且属于当前用户
  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  const originalFile = files[0];

  // 如果指定了文件夹，检查文件夹是否存在
  if (folder_id) {
    const [folders] = await pool.execute(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?',
      [folder_id, userId]
    );

    if (folders.length === 0) {
      return res.status(400).json({ message: '目标文件夹不存在' });
    }
  }

  // 生成新的文件名
  const ext = path.extname(originalFile.filename);
  const newFilename = `${uuidv4()}${ext}`;

  // 复制文件
  const { imagesDir, videosDir } = await ensureUploadDir(userId, folder_id);
  const isImage = originalFile.file_type === 'image';
  const sourcePath = originalFile.file_path;
  const destPath = path.join(isImage ? imagesDir : videosDir, newFilename);

  await fs.copy(sourcePath, destPath);

  // 复制缩略图（如果存在）
  let newThumbnailPath = null;
  if (originalFile.thumbnail_path) {
    const { thumbnailsDir } = await ensureUploadDir(userId, folder_id);
    const thumbnailExt = path.extname(originalFile.thumbnail_path);
    const newThumbnailFilename = `thumb_${uuidv4()}${thumbnailExt}`;
    newThumbnailPath = path.join(thumbnailsDir, newThumbnailFilename);
    await fs.copy(originalFile.thumbnail_path, newThumbnailPath);
  }

  // 生成相对路径用于存储
  const relativeDestPath = path.relative(process.cwd(), destPath);
  const relativeThumbnailPath = newThumbnailPath ? path.relative(process.cwd(), newThumbnailPath) : null;
  
  // 插入新的文件记录
  const [result] = await pool.execute(
    `INSERT INTO files (user_id, filename, original_name, file_type, file_size, file_path, thumbnail_path, folder_id, mime_type, width, height, duration) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, newFilename, originalFile.original_name, originalFile.file_type, originalFile.file_size, relativeDestPath, relativeThumbnailPath, folder_id || null, originalFile.mime_type, originalFile.width, originalFile.height, originalFile.duration]
  );

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage + ? WHERE id = ?',
    [originalFile.file_size, userId]
  );

  res.status(201).json({
    message: '文件复制成功',
    file: {
      id: result.insertId,
      filename: newFilename,
      original_name: originalFile.original_name,
      file_type: originalFile.file_type,
      file_size: originalFile.file_size
    }
  });
}));

// 删除文件
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  // 获取文件信息
  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  const file = files[0];

  // 删除物理文件
  try {
    // 解析文件路径
    const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
    let filePath;
    
    if (path.isAbsolute(file.file_path)) {
      filePath = file.file_path;
    } else {
      // 如果是相对路径，基于存储根目录解析
      let normalizedPath = file.file_path.replace(/\\/g, '/');
      
      // 如果路径以 storage/ 开头，去掉这个前缀
      if (normalizedPath.startsWith('storage/')) {
        normalizedPath = normalizedPath.substring(8);
      }
      
      filePath = path.resolve(baseUploadPath, normalizedPath);
      }
      
      // 删除主文件
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    
    // 删除缩略图
    if (file.thumbnail_path) {
      let thumbnailPath;
      
      if (path.isAbsolute(file.thumbnail_path)) {
        thumbnailPath = file.thumbnail_path;
      } else {
        let normalizedThumbnailPath = file.thumbnail_path.replace(/\\/g, '/');
        
        if (normalizedThumbnailPath.startsWith('storage/')) {
          normalizedThumbnailPath = normalizedThumbnailPath.substring(8);
        }
        
        thumbnailPath = path.resolve(baseUploadPath, normalizedThumbnailPath);
        }
        
        if (await fs.pathExists(thumbnailPath)) {
          await fs.remove(thumbnailPath);
        }
    }
  } catch (error) {
    // 删除物理文件失败，继续处理
  }

  // 从数据库删除记录
  await pool.execute('DELETE FROM files WHERE id = ?', [fileId]);

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage - ? WHERE id = ?',
    [file.file_size, userId]
  );

  res.json({ message: '文件删除成功' });
}));

// 批量删除文件
router.delete('/batch', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请选择要删除的文件' });
  }

  // 获取文件信息
  const placeholders = file_ids.map(() => '?').join(',');
  const [files] = await pool.execute(
    `SELECT * FROM files WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '没有找到要删除的文件' });
  }

  let totalSize = 0;
  const deletePromises = files.map(async (file) => {
    totalSize += file.file_size;
    
    // 删除物理文件
    try {
      // 解析文件路径
      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      let filePath;
      
      if (path.isAbsolute(file.file_path)) {
        filePath = file.file_path;
      } else {
        // 如果是相对路径，基于存储根目录解析
        let normalizedPath = file.file_path.replace(/\\/g, '/');
        
        // 如果路径以 storage/ 开头，去掉这个前缀
        if (normalizedPath.startsWith('storage/')) {
          normalizedPath = normalizedPath.substring(8);
        }
        
        filePath = path.resolve(baseUploadPath, normalizedPath);
        }
        
        // 删除主文件
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      
      // 删除缩略图
      if (file.thumbnail_path) {
        let thumbnailPath;
        
        if (path.isAbsolute(file.thumbnail_path)) {
          thumbnailPath = file.thumbnail_path;
        } else {
          let normalizedThumbnailPath = file.thumbnail_path.replace(/\\/g, '/');
          
          if (normalizedThumbnailPath.startsWith('storage/')) {
            normalizedThumbnailPath = normalizedThumbnailPath.substring(8);
          }
          
          thumbnailPath = path.resolve(baseUploadPath, normalizedThumbnailPath);
          }
          
          if (await fs.pathExists(thumbnailPath)) {
            await fs.remove(thumbnailPath);
          }
      }
    } catch (error) {
      // 批量删除物理文件失败，继续处理
    }
  });

  await Promise.all(deletePromises);

  // 从数据库删除记录
  await pool.execute(
    `DELETE FROM files WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, userId]
  );

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage - ? WHERE id = ?',
    [totalSize, userId]
  );

  res.json({ message: `成功删除 ${files.length} 个文件` });
}));

// 批量移动文件
router.put('/batch/move', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids, folder_id } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请选择要移动的文件' });
  }

  // 如果指定了文件夹，检查文件夹是否存在
  if (folder_id) {
    const [folders] = await pool.execute(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?',
      [folder_id, userId]
    );

    if (folders.length === 0) {
      return res.status(400).json({ message: '目标文件夹不存在' });
    }
  }

  // 更新数据库中的文件夹ID
  const placeholders = file_ids.map(() => '?').join(',');
  const [result] = await pool.execute(
    `UPDATE files SET folder_id = ? WHERE id IN (${placeholders}) AND user_id = ?`,
    [folder_id || null, ...file_ids, userId]
  );

  res.json({ message: `成功移动 ${result.affectedRows} 个文件` });
}));

// 获取文件预览
router.get('/preview/:id', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;

  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  const file = files[0];

  // 处理文件路径 - 基于存储根目录解析
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  let filePath;
  
  if (path.isAbsolute(file.file_path)) {
    filePath = file.file_path;
  } else {
    // 如果是相对路径，基于存储根目录解析
    // 处理可能的路径格式问题
    let normalizedPath = file.file_path.replace(/\\/g, '/');
    
    // 如果路径以 storage/ 开头，去掉这个前缀
    if (normalizedPath.startsWith('storage/')) {
      normalizedPath = normalizedPath.substring(8); // 去掉 'storage/' 前缀
    }
    
    // 使用绝对路径解析，确保路径正确
    filePath = path.resolve(baseUploadPath, normalizedPath);
    }
    
    if (!await fs.pathExists(filePath)) {
    
    // 尝试其他可能的路径
    const alternativePaths = [
      path.join('/www/wwwroot/tuku/backend', file.file_path),
      path.join('/www/wwwroot/tuku/backend/dist', file.file_path),
      path.join(baseUploadPath, file.file_path),
      path.resolve(file.file_path),
      file.file_path // 直接使用原始路径
    ];
    
      for (const altPath of alternativePaths) {
        if (await fs.pathExists(altPath)) {
          filePath = altPath;
          break;
        }
      }
      
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({ message: '文件不存在' });
      }
    }

  // 设置正确的Content-Type
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // 设置缓存头
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
  
  res.sendFile(filePath);
}));

// 头像上传
router.post('/upload/avatar', authenticateToken, asyncHandler(async (req, res) => {
  
  const upload = multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        const { avatarsDir } = await ensureUploadDir(req.user.id);
        cb(null, avatarsDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `avatar_${uuidv4()}${ext}`;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 临时允许10MB，后续压缩到2MB
      fieldSize: 10 * 1024 * 1024 // 字段大小限制
    }
  }).single('avatar');

  upload(req, res, async (err) => {
    
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: '头像文件大小不能超过 10MB' });
        }
      }
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: '请选择头像文件' });
    }

           try {
             const userId = req.user.id;
             const { avatarsDir } = await ensureUploadDir(userId);
             const originalPath = req.file.path;
             
             // 检查文件大小，如果超过2MB则压缩
             const fileStats = await fs.stat(originalPath);
             const maxSize = 2 * 1024 * 1024; // 2MB
             let finalImagePath = originalPath;
             
              if (fileStats.size > maxSize) {
                
                // 压缩图片到2MB以下 - 优化版本
               const compressedFilename = `compressed_${req.file.filename}`;
               const compressedPath = path.join(avatarsDir, compressedFilename);
               
               // 获取图片元数据
               const metadata = await sharp(originalPath).metadata();
               
               // 计算合适的压缩参数
               let quality = 75;
               let scale = 1;
               
               // 如果文件很大，先缩小尺寸
               if (fileStats.size > maxSize * 2) {
                 scale = Math.sqrt(maxSize / fileStats.size) * 0.8;
               }
               
               // 一次性压缩
               await sharp(originalPath)
                 .resize(
                   scale < 1 ? Math.floor(metadata.width * scale) : metadata.width,
                   scale < 1 ? Math.floor(metadata.height * scale) : metadata.height
                 )
                 .jpeg({ quality })
                 .toFile(compressedPath);
               
               // 检查压缩后大小，如果还是太大再调整
               const compressedStats = await fs.stat(compressedPath);
               if (compressedStats.size > maxSize) {
                 const finalScale = Math.sqrt(maxSize / compressedStats.size) * 0.9;
                 await sharp(compressedPath)
                   .resize(
                     Math.floor(metadata.width * finalScale),
                     Math.floor(metadata.height * finalScale)
                   )
                   .jpeg({ quality: 60 })
                   .toFile(compressedPath);
                }
                
                // 删除原始文件
                try {
                  await fs.remove(originalPath);
                } catch (error) {
                  // 删除失败，忽略错误
                }
               
               finalImagePath = compressedPath;
             }
             
             // 生成不同尺寸的头像
             const sizes = [
               { size: 32, suffix: '_32' },
               { size: 64, suffix: '_64' },
               { size: 120, suffix: '_120' },
               { size: 200, suffix: '_200' }
             ];

             const avatarUrls = {};
             const baseFilename = path.parse(req.file.filename).name;
             
             for (const { size, suffix } of sizes) {
               const resizedPath = path.join(avatarsDir, `${baseFilename}${suffix}.jpg`);
               
               await sharp(finalImagePath)
                 .resize(size, size, { fit: 'cover' })
                 .jpeg({ quality: 90 })
                 .toFile(resizedPath);
               
               // 生成访问URL - 直接使用后端域名
               const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
                const avatarFileName = path.basename(resizedPath);
                avatarUrls[`size_${size}`] = `${backendDomain}/uploads/users/user_${userId}/avatars/${avatarFileName}`;
             }

             // 删除压缩后的临时文件（如果存在且不是最终文件）
             if (finalImagePath !== originalPath) {
              try {
                await fs.remove(finalImagePath);
              } catch (error) {
                // 删除失败，忽略错误
              }
             }

      // 更新用户头像URL
      const avatarUrl = avatarUrls.size_120; // 默认使用120px尺寸
      
      await pool.execute(
        'UPDATE users SET avatar_url = ? WHERE id = ?',
        [avatarUrl, userId]
      );
      
      res.json({
        success: true,
        message: fileStats.size > maxSize ? '头像上传成功（已自动压缩）' : '头像上传成功',
        data: {
          url: avatarUrl,
          urls: avatarUrls,
          compressed: fileStats.size > maxSize,
          originalSize: fileStats.size,
          finalSize: fileStats.size > maxSize ? (await fs.stat(path.join(avatarsDir, `${path.parse(req.file.filename).name}_120.jpg`))).size : fileStats.size
        }
      });
    } catch (error) {
      
      // 清理上传的文件（忽略权限错误）
      if (req.file) {
        try {
          await fs.remove(req.file.path);
        } catch (cleanupError) {
          // 清理失败，忽略错误
        }
      }
      
      res.status(500).json({ message: '头像上传失败' });
    }
  });
}));

// 头像获取已通过静态文件服务提供，无需单独路由

const TrendService = require('../services/trendService');

// 获取用户文件统计信息（包含趋势数据）
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    // 先收集今日趋势数据
    await TrendService.collectUserTrends(userId);
    
    // 获取趋势数据
    const trendResult = await TrendService.getUserTrends(userId, 7);
    
    // 获取最新数据，如果没有趋势数据则使用默认值
    const latestTrend = trendResult.data.trends.length > 0 
      ? trendResult.data.trends[trendResult.data.trends.length - 1]
      : {
          total_files: 0,
          total_size: 0,
          image_count: 0,
          image_size: 0,
          video_count: 0,
          video_size: 0,
          folder_count: 0,
          other_files: 0,
          other_size: 0
        };
    
    res.json({
      success: true,
      data: {
        ...latestTrend,
        trends: trendResult.data.trends,
        changes: trendResult.data.changes
      }
    });
    } catch (error) {
      res.status(500).json({
        success: false,
      message: '获取文件统计失败'
    });
  }
}));

// 获取用户趋势图表数据
router.get('/trends', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = parseInt(req.query.days) || 30;
  
  try {
    const result = await TrendService.getUserTrends(userId, days);
    
    res.json({
      success: true,
      data: result.data
    });
    } catch (error) {
      res.status(500).json({
        success: false,
      message: '获取趋势数据失败'
    });
  }
}));

// 获取存储详情
router.get('/storage-details', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取用户存储目录
    const userDir = path.join(process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage', 'users', `user_${userId}`);
    
    // 初始化统计数据
    let imageSize = 0;
    let videoSize = 0;
    let otherSize = 0;
    let imageCount = 0;
    let videoCount = 0;
    let otherCount = 0;
    
    // 递归计算目录大小
    const calculateDirSize = async (dirPath) => {
      if (!await fs.pathExists(dirPath)) return { size: 0, count: 0 };
      
      let totalSize = 0;
      let fileCount = 0;
      
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          const subResult = await calculateDirSize(filePath);
          totalSize += subResult.size;
          fileCount += subResult.count;
        } else {
          totalSize += stats.size;
          fileCount += 1;
        }
      }
      
      return { size: totalSize, count: fileCount };
    };
    
    // 计算图片大小（images目录和avatars目录）
    const imagesDir = path.join(userDir, 'images');
    const avatarsDir = path.join(userDir, 'avatars');
    
    const imagesResult = await calculateDirSize(imagesDir);
    const avatarsResult = await calculateDirSize(avatarsDir);
    
    imageSize = imagesResult.size + avatarsResult.size;
    imageCount = imagesResult.count + avatarsResult.count;
    
    // 计算视频大小
    const videosDir = path.join(userDir, 'videos');
    const videosResult = await calculateDirSize(videosDir);
    videoSize = videosResult.size;
    videoCount = videosResult.count;
    
    // 计算其他文件大小（thumbnails等）
    const thumbnailsDir = path.join(userDir, 'thumbnails');
    const otherResult = await calculateDirSize(thumbnailsDir);
    otherSize = otherResult.size;
    otherCount = otherResult.count;
    
    res.json({
      success: true,
      data: {
        imageSize,
        videoSize,
        otherSize,
        imageCount,
        videoCount,
        otherCount,
        totalSize: imageSize + videoSize + otherSize,
        totalCount: imageCount + videoCount + otherCount
      }
    });
    } catch (error) {
      res.status(500).json({
        success: false,
      message: '获取存储详情失败'
    });
  }
}));

module.exports = router;
