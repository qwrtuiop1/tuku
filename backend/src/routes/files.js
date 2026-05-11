const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { pool } = require('../config/database');
const child_process = require('child_process');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const moderationService = require('../services/moderationService');
const ciService = require('../services/ciService');
const cosStsService = require('../services/cosStsService');

const router = express.Router();

// CI 启用检查
// ⚠️ 当前项目仅使用本地存储，完全禁用 COS/腾讯云CI
async function isCiEnabled() {
  // 强制返回 false：禁止所有 COS 相关逻辑
  return false;
}
/** 安卓等客户端常把 GIF/部分图片报成 application/octet-stream 或空 MIME，需结合扩展名判断 */
function inferFileCategory(file) {
  const m = String(file.mimetype || '').toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  const ext = path.extname(file.originalname || '').toLowerCase();
  const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.svg', '.bmp', '.avif']);
  if (imageExts.has(ext)) return 'image';
  const videoExts = new Set(['.mp4', '.webm', '.mov', '.m4v', '.avi', '.mkv', '.flv', '.wmv', '.mpeg', '.mpg', '.3gp', '.ts', '.m2ts', '.ogv']);
  if (videoExts.has(ext)) return 'video';
  return null;
}

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
    const isImage = inferFileCategory(file) !== 'video';
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

// 动态获取允许的文件类型（带规范化与兜底）
const getAllowedFileTypes = async () => {
  try {
    const [imageResult] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['allowed_image_types']
    );
    
    const [videoResult] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['allowed_video_types']
    );
    // 规范化图片 MIME
    const imageExts = (imageResult.length > 0 ? String(imageResult[0].setting_value) : 'jpg,jpeg,png,gif,webp,svg')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const imageMimes = new Set([
      'image/jpeg','image/png','image/gif','image/webp','image/svg+xml','image/heic','image/heif'
    ])
    for (const ext of imageExts) {
      if (ext === 'jpg' || ext === 'jpeg') imageMimes.add('image/jpeg')
      else if (ext === 'png') imageMimes.add('image/png')
      else if (ext === 'gif') imageMimes.add('image/gif')
      else if (ext === 'webp') imageMimes.add('image/webp')
      else if (ext === 'svg' || ext === 'svg+xml') imageMimes.add('image/svg+xml')
      else if (ext === 'heic') imageMimes.add('image/heic')
      else if (ext === 'heif') imageMimes.add('image/heif')
    }

    // 规范化视频 MIME
    const videoExts = (videoResult.length > 0 ? String(videoResult[0].setting_value) : 'mp4,webm,mov,avi,mkv,m4v,flv,wmv,mpeg,mpg,3gp,ts,m2ts,ogv')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const videoMimes = new Set(['video/mp4','video/webm','video/quicktime']) // 兜底
    const mapVideo = (ext) => {
      if (ext === 'mp4') return ['video/mp4']
      if (ext === 'm4v') return ['video/x-m4v','video/mp4']
      if (ext === 'webm') return ['video/webm']
      if (ext === 'mov') return ['video/quicktime']
      if (ext === 'avi') return ['video/x-msvideo']
      if (ext === 'mkv') return ['video/x-matroska','video/webm']
      if (ext === 'flv') return ['video/x-flv']
      if (ext === 'wmv') return ['video/x-ms-wmv']
      if (ext === 'mpeg' || ext === 'mpg') return ['video/mpeg']
      if (ext === '3gp') return ['video/3gpp']
      if (ext === 'ts' || ext === 'm2ts') return ['video/mp2t']
      if (ext === 'ogv' || ext === 'ogg') return ['video/ogg']
      return []
    }
    for (const ext of videoExts) {
      for (const m of mapVideo(ext)) videoMimes.add(m)
    }

    return { allowedImageTypes: Array.from(imageMimes), allowedVideoTypes: Array.from(videoMimes) };
  } catch (error) {
    console.error('获取文件类型设置失败:', error);
    // 使用默认设置
    return {
      allowedImageTypes: ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','image/heic','image/heif'],
      allowedVideoTypes: ['video/mp4','video/webm','video/quicktime','video/x-matroska','video/x-msvideo']
    };
  }
};

// 文件过滤器 - 使用数据库设置
const createFileFilter = async () => {
  const { allowedImageTypes, allowedVideoTypes } = await getAllowedFileTypes();
  const allowedTextTypes = ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  return (req, file, cb) => {
    // 检查文件类型
    if (allowedImageTypes.includes(file.mimetype) || 
        allowedVideoTypes.includes(file.mimetype) || 
        allowedTextTypes.includes(file.mimetype) ||
        allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // 安卓等：GIF/图片可能为 application/octet-stream 或空，用扩展名 + mime-types 推断
      const guessed = mime.lookup(file.originalname || '') || '';
      if (allowedImageTypes.includes(guessed) || allowedVideoTypes.includes(guessed)) {
        cb(null, true);
      } else if (!file.mimetype || file.mimetype === 'application/octet-stream') {
        const cat = inferFileCategory(file);
        if (cat === 'image' && allowedImageTypes.length) cb(null, true);
        else if (cat === 'video' && allowedVideoTypes.length) cb(null, true);
        else cb(new Error('不支持的文件类型'), false);
      } else {
        cb(new Error('不支持的文件类型'), false);
      }
    }
  };
};

// 动态获取文件大小限制 - 临时修复：强制支持大文件
const getFileSizeLimit = async () => {
  // 临时解决方案：直接返回2GB限制，绕过数据库查询
  const hardcodedLimit = 2 * 1024 * 1024 * 1024; // 2GB
  return hardcodedLimit;
  
  // 原始代码（暂时注释掉）
  /*
  try {
    const [result] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['max_file_size']
    );
    
    if (result.length > 0) {
      const maxFileSizeBytes = parseInt(result[0].setting_value);
      // 确保至少支持1GB，最大支持2GB
      const limit = Math.max(maxFileSizeBytes, 1024 * 1024 * 1024); // 至少1GB
      const maxLimit = Math.min(limit, 2 * 1024 * 1024 * 1024); // 最大2GB
      return maxLimit;
    }
    
    // 默认1GB
    const defaultLimit = 1024 * 1024 * 1024;
    return defaultLimit;
  } catch (error) {
    console.error('获取文件大小限制失败:', error);
    // 默认1GB
    const defaultLimit = 1024 * 1024 * 1024;
    return defaultLimit;
  }
  */
};

// 创建动态multer配置
const createUploadMiddleware = async () => {
  const fileSizeLimit = await getFileSizeLimit();
  const fileFilter = await createFileFilter();
  
  
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileSizeLimit,
      fieldSize: 2 * 1024 * 1024 * 1024, // 2GB字段大小限制
      fieldNameSize: 100,
      fieldValueSize: 2 * 1024 * 1024 * 1024, // 2GB字段值大小限制
      fileCount: 1,
      partCount: 1
    },
    // 确保正确处理文件名编码
    preservePath: true
  });
};

// 获取文件列表
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { folder_id, page = 1, limit = 20, file_type, search } = req.query;
  const offset = (page - 1) * limit;

  // 加载 CI 配置
  let ci = null;
  const useCi = await isCiEnabled();
  if (useCi) {
    ci = await ciService.getInstance();
  }

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
    
  // 判断文件存储类型
  const isCosFile = file.file_path.startsWith('users/');
  const useCi = isCiEnabled ? ci && ci.enable : false;

  let fileUrl;
  if (isCosFile) {
    // 根据 CI 是否启用决定使用哪种 URL
    if (useCi) {
      // CI 启用，使用 COS URL
      fileUrl = ci.getPublicUrl(file.file_path);
    } else {
      // CI 未启用，文件虽然路径是 users/ 格式，但实际存储在本地
      let normalizedFilePath = file.file_path.replace(/\\/g, '/');
      fileUrl = `${backendDomain}/uploads/${normalizedFilePath}`;
    }
  } else {
    // 本地文件（storage/ 前缀）
    let normalizedFilePath = file.file_path.replace(/\\/g, '/');
    if (normalizedFilePath.startsWith('storage/')) {
      normalizedFilePath = normalizedFilePath.substring(8);
    }
    fileUrl = `${backendDomain}/uploads/${normalizedFilePath}`;
  }

  // 处理缩略图
  let thumbnailUrl = null;
  if (file.thumbnail_path) {
    let normalizedThumbnailPath = file.thumbnail_path.replace(/\\/g, '/');

    if (normalizedThumbnailPath.startsWith('users/')) {
      // 用户上传目录的缩略图
      if (useCi) {
        thumbnailUrl = ci.getThumbnailUrl(normalizedThumbnailPath);
      } else {
        // CI 未启用，缩略图实际在本地
        thumbnailUrl = `${backendDomain}/uploads/${normalizedThumbnailPath}`;
      }
    } else if (normalizedThumbnailPath.startsWith('storage/')) {
      normalizedThumbnailPath = normalizedThumbnailPath.substring(8);
      thumbnailUrl = `${backendDomain}/uploads/${normalizedThumbnailPath}`;
    } else {
      thumbnailUrl = `${backendDomain}/uploads/${normalizedThumbnailPath}`;
    }
  }

  return {
    ...file,
    original_name: displayName,
    file_url: fileUrl,
    thumbnail_url: thumbnailUrl,
    preview_url: `${backendDomain}/api/files/preview/${file.id}?token=${req.headers.authorization?.split(' ')[1] || ''}`,
    storage: isCosFile ? 'cos' : 'local'
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

// 测试端点 - 验证配置
router.get('/test-config', authenticateToken, asyncHandler(async (req, res) => {
  
  res.json({
    message: '配置测试成功',
    fileSizeLimit: fileSizeLimit,
    fileSizeLimitMB: Math.round(fileSizeLimit / (1024 * 1024)),
    timestamp: new Date().toISOString()
  });
}));

// 上传文件
router.post('/upload', authenticateToken, asyncHandler(async (req, res) => {
  
  // 动态创建multer中间件
  const upload = await createUploadMiddleware();
  const fileSizeLimit = await getFileSizeLimit();
  
  // 使用动态配置处理文件上传
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const fileSizeLimit = await getFileSizeLimit();
          const limitMB = Math.round(fileSizeLimit / (1024 * 1024));
          return res.status(400).json({ message: `文件大小不能超过 ${limitMB}MB` });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: '文件字段名错误' });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: '文件数量超限' });
        } else if (err.code === 'LIMIT_FIELD_KEY') {
          return res.status(400).json({ message: '字段名超限' });
        } else if (err.code === 'LIMIT_FIELD_VALUE') {
          return res.status(400).json({ message: '字段值超限' });
        } else if (err.code === 'LIMIT_FIELD_COUNT') {
          return res.status(400).json({ message: '字段数量超限' });
        } else if (err.code === 'LIMIT_PART_COUNT') {
          return res.status(400).json({ message: '部分数量超限' });
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

// 提取视频元数据（需要系统已安装 ffprobe）
async function extractVideoMeta(fullPath) {
  return await new Promise((resolve) => {
    try {
      const ffprobe = child_process.spawn('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration', '-of', 'json', fullPath]);
      let out = '';
      ffprobe.stdout.on('data', (d) => out += String(d));
      ffprobe.on('close', () => {
        try {
          const json = JSON.parse(out || '{}');
          const s = (json.streams && json.streams[0]) || {};
          resolve({ width: s.width || null, height: s.height || null, duration: s.duration ? Math.round(parseFloat(s.duration)) : null });
        } catch (_) { resolve(null) }
      })
      ffprobe.on('error', () => resolve(null))
    } catch (_) { resolve(null) }
  })
}

// 生成视频缩略图（需要 ffmpeg），落地到用户缩略图目录
async function generateVideoThumbnail(fullPath, userId, folderId) {
  return await new Promise(async (resolve) => {
    try {
      const { thumbnailsDir } = await ensureUploadDir(userId, folderId);
      const outFile = path.join(thumbnailsDir, `thumb_${path.basename(fullPath)}.jpg`);
      const ffmpeg = child_process.spawn('ffmpeg', ['-y', '-i', fullPath, '-ss', '00:00:01', '-vframes', '1', '-vf', 'scale=300:-1', outFile]);
      ffmpeg.on('close', async (code) => {
        try {
          if (code === 0 && await fs.pathExists(outFile)) return resolve(outFile);
        } catch (_) {}
        resolve(null)
      })
      ffmpeg.on('error', () => resolve(null))
    } catch (_) { resolve(null) }
  })
}

// 通过文件头魔数判断类型（用于无法通过 MIME/扩展名确定类型的边界情况）
async function detectFileTypeByMagic(filePath) {
  try {
    const header = Buffer.alloc(12);
    const fd = await fs.open(filePath, 'r');
    await fd.read(header, 0, 12, 0);
    await fd.close();

    // JPEG: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) return 'image';
    // PNG: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return 'image';
    // GIF: 47 49 46 38 (GIF8)
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return 'image';
    // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
        header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) return 'image';
    // MP4/MOV: 00 00 00 ?? 66 74 79 70 (length + ftyp) 或 00 00 00 ?? 6D 6F 6F 76 (length + moov)
    if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) return 'video';
    if (header[4] === 0x6D && header[5] === 0x6F && header[6] === 0x6F && header[7] === 0x76) return 'video';
    // 未知，默认图片（保守策略：避免误归为视频导致文件丢失）
    return 'image';
  } catch (_) {
    return 'image';
  }
}

// 生成 COS 存储路径 - 按用户和分类组织
function buildCosKey(userId, folderId, filename, fileType) {
  const folderPart = folderId ? `folders/folder_${folderId}/` : '';
  const typeDir = fileType === 'video' ? 'videos' : fileType === 'avatar' ? 'avatars' : 'images';
  return `users/user_${userId}/${folderPart}${typeDir}/${filename}`;
}

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
    await fs.remove(file.path);
    return res.status(400).json({ message: '存储空间不足' });
  }

  // 检测 CI 状态
  const useCi = await isCiEnabled();
  let ci = null;

  if (useCi) {
    ci = await ciService.getInstance();
  }

  // 文件类型检测
  let fileType = null;
  let mimeType = file.mimetype || 'application/octet-stream';

  if (ci && ci.enable) {
    // 使用 CI 检测文件类型
    try {
      const detectedMime = await ci.detectFileType(file.path, mimeType);
      if (detectedMime) {
        mimeType = detectedMime;
        if (detectedMime.startsWith('image/')) {
          fileType = 'image';
        } else if (detectedMime.startsWith('video/')) {
          fileType = 'video';
        } else {
          const inferred = inferFileCategory(file);
          fileType = inferred || (await detectFileTypeByMagic(file.path));
        }
      } else {
        const inferred = inferFileCategory(file);
        fileType = inferred || (await detectFileTypeByMagic(file.path));
      }
    } catch (err) {
      console.warn('[CI] detectFileType failed, using local:', err.message);
      const inferred = inferFileCategory(file);
      fileType = inferred || (await detectFileTypeByMagic(file.path));
    }
  } else {
    // 本地检测
    const inferred = inferFileCategory(file);
    fileType = inferred || (await detectFileTypeByMagic(file.path));
  }

  // 标准化文件类型
  if (!fileType) {
    fileType = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : 'image';
  }

  // 如果没有 MIME 类型，根据扩展名推断
  if (!mimeType || mimeType === 'application/octet-stream') {
    const ext = path.extname(file.originalname || file.filename).toLowerCase();
    mimeType = mime.lookup(ext) || (fileType === 'image' ? 'image/jpeg' : fileType === 'video' ? 'video/mp4' : 'application/octet-stream');
  }

  let width = null, height = null, duration = null;
  let cosKey = null;
  let cosUrl = null;
  let thumbnailCosKey = null;
  let thumbnailCosUrl = null;
  let moderationHints = [];

  // 处理图片
  if (fileType === 'image') {
    // 获取图片尺寸 - 优先使用 CI
    if (ci && ci.enable) {
      try {
        const imageInfo = await ci.getImageInfo(file.path);
        if (imageInfo) {
          width = imageInfo.width;
          height = imageInfo.height;
        }
      } catch (err) {
        console.warn('[CI] getImageInfo failed:', err.message);
      }
    }

    // 如果 CI 获取失败，使用 sharp
    if (!width) {
      try {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      } catch (_) {}
    }

    // 上传到 COS - 必须成功
    if (ci && ci.enable) {
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      const thumbFilename = `thumb_${uuidv4()}.jpg`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      try {
        const uploadResult = await ci.uploadToCos(file.path, cosKey, { mimeType });
        if (uploadResult) {
          cosUrl = uploadResult.url;
        } else {
          throw new Error('CI uploadToCos returned null');
        }

        // 生成本地缩略图（sharp 支持 HEIF/HEIC 等 CI 处理不了的格式）
        try {
          const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
          const thumbDir = path.join(baseUploadPath, `users/user_${userId}`, folder_id ? `folders/folder_${folder_id}/thumbnails` : 'thumbnails');
          await fs.ensureDir(thumbDir);
          const thumbPath = path.join(thumbDir, thumbFilename);
          await sharp(file.path)
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(thumbPath);

          // 上传缩略图到 COS
          const thumbnailCosKey = buildCosKey(userId, folder_id, thumbFilename, 'image');
          const thumbUploadResult = await ci.uploadToCos(thumbPath, thumbnailCosKey, { mimeType: 'image/jpeg' });
          if (thumbUploadResult) {
            thumbnailCosUrl = thumbUploadResult.url;
            thumbnailCosKey = thumbnailCosKey;
          } else {
            // 缩略图上传失败则降级为使用原图的 CI 处理 URL（仅支持 JPEG/PNG/WebP 等）
            thumbnailCosUrl = ci.getThumbnailUrl(cosKey);
            thumbnailCosKey = cosKey;
          }
          await fs.remove(thumbPath);
        } catch (thumbErr) {
          console.warn('[Upload] Thumbnail generation failed, using CI processing:', thumbErr.message);
          thumbnailCosUrl = ci.getThumbnailUrl(cosKey);
          thumbnailCosKey = cosKey;
        }
      } catch (err) {
        await fs.remove(file.path);
        return res.status(500).json({
          message: '文件上传到云存储失败，请稍后重试',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    } else {
      // CI 未启用，使用本地存储
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      const normalizedKey = cosKey.replace(/^\//, '');
      const localPath = path.join(baseUploadPath, normalizedKey);

      await fs.ensureDir(path.dirname(localPath));
      await fs.move(file.path, localPath);

      const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
      cosUrl = `${backendDomain}/uploads/${normalizedKey}`;

      // 生成本地缩略图
      try {
        const thumbDir = path.join(baseUploadPath, `users/user_${userId}`, folder_id ? `folders/folder_${folder_id}/thumbnails` : 'thumbnails');
        await fs.ensureDir(thumbDir);
        const thumbPath = path.join(thumbDir, `thumb_${cosFilename}`);
        await sharp(localPath)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
        const thumbRelative = path.relative(baseUploadPath, thumbPath).replace(/\\/g, '/');
        thumbnailCosUrl = `${backendDomain}/uploads/${thumbRelative}`;
        thumbnailCosKey = thumbRelative;
      } catch (_) {}
    }
  }
  // 处理视频
  else if (fileType === 'video') {
    // 获取视频元数据
    try {
      const meta = await extractVideoMeta(file.path).catch(() => null);
      if (meta) {
        duration = meta.duration || null;
        width = meta.width || null;
        height = meta.height || null;
      }
    } catch (_) {}

    moderationHints.push(String(path.basename(file.originalname || '')));

    // 上传到 COS - 必须成功
    if (ci && ci.enable) {
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      try {
        const uploadResult = await ci.uploadToCos(file.path, cosKey, { mimeType });
        if (uploadResult) {
          cosUrl = uploadResult.url;
          // 视频缩略图需要本地生成后再上传
          const localThumb = await generateVideoThumbnail(file.path, userId, folder_id).catch(() => null);
          if (localThumb) {
            const thumbExt = path.extname(cosFilename);
            const thumbFilename = `thumb_${cosFilename.replace(thumbExt, '.jpg')}`;
            thumbnailCosKey = buildCosKey(userId, folder_id, thumbFilename, 'image');
            try {
              await ci.uploadToCos(localThumb, thumbnailCosKey, { mimeType: 'image/jpeg' });
              thumbnailCosUrl = ci.getThumbnailUrl(thumbnailCosKey);
            } catch (_) {
              thumbnailCosKey = null;
            }
            await fs.remove(localThumb);
          }
        } else {
          throw new Error('CI uploadToCos returned null');
        }
      } catch (err) {
        await fs.remove(file.path);
        return res.status(500).json({
          message: '视频上传到云存储失败，请稍后重试',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    } else {
      // CI 未启用，使用本地存储
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      const normalizedKey = cosKey.replace(/^\//, '');
      const localPath = path.join(baseUploadPath, normalizedKey);

      await fs.ensureDir(path.dirname(localPath));
      await fs.move(file.path, localPath);

      const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
      cosUrl = `${backendDomain}/uploads/${normalizedKey}`;

      // 生成本地缩略图
      try {
        const thumbDir = path.join(baseUploadPath, `users/user_${userId}`, folder_id ? `folders/folder_${folder_id}/thumbnails` : 'thumbnails');
        await fs.ensureDir(thumbDir);
        const thumbPath = path.join(thumbDir, `thumb_${cosFilename.replace(path.extname(cosFilename), '.jpg')}`);
        const generatedThumb = await generateVideoThumbnail(localPath, userId, folder_id).catch(() => null);
        if (generatedThumb) {
          await fs.move(generatedThumb, thumbPath, { overwrite: true });
          const thumbRelative = path.relative(baseUploadPath, thumbPath).replace(/\\/g, '/');
          thumbnailCosUrl = `${backendDomain}/uploads/${thumbRelative}`;
          thumbnailCosKey = thumbRelative;
        }
      } catch (_) {}
    }
  }
  // 其他文件类型
  else {
    if (ci && ci.enable) {
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      try {
        const uploadResult = await ci.uploadToCos(file.path, cosKey, { mimeType });
        if (uploadResult) {
          cosUrl = uploadResult.url;
        } else {
          throw new Error('CI uploadToCos returned null');
        }
      } catch (err) {
        await fs.remove(file.path);
        return res.status(500).json({
          message: '文件上传到云存储失败，请稍后重试',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    } else {
      const ext = path.extname(file.filename);
      const cosFilename = `${uuidv4()}${ext}`;
      cosKey = buildCosKey(userId, folder_id, cosFilename, fileType);

      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      const normalizedKey = cosKey.replace(/^\//, '');
      const localPath = path.join(baseUploadPath, normalizedKey);

      console.log('[Upload] Local storage - basePath:', baseUploadPath);
      console.log('[Upload] Local storage - cosKey:', cosKey);
      console.log('[Upload] Local storage - normalizedKey:', normalizedKey);
      console.log('[Upload] Local storage - localPath:', localPath);

      await fs.ensureDir(path.dirname(localPath));
      console.log('[Upload] Directory ensured, moving file...');

      await fs.move(file.path, localPath);
      console.log('[Upload] File moved to:', localPath);
      console.log('[Upload] File exists:', await fs.pathExists(localPath));

      const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
      cosUrl = `${backendDomain}/uploads/${normalizedKey}`;
    }
  }

  // 处理文件名编码问题
  let originalName = file.originalname;

  try {
    const hasGarbledChars = /[^\x00-\x7F\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(originalName);

    if (hasGarbledChars) {
      const encodings = ['latin1', 'binary', 'utf8'];
      for (const encoding of encodings) {
        try {
          const decoded = Buffer.from(originalName, encoding).toString('utf8');
          if (decoded && decoded.length > 0) {
            originalName = decoded;
            break;
          }
        } catch (e) { continue; }
      }
    }

    if (originalName.includes('%')) {
      try {
        const urlDecoded = decodeURIComponent(originalName);
        if (urlDecoded && urlDecoded.length > 0) {
          originalName = urlDecoded;
        }
      } catch (e) {}
    }
  } catch (error) {}

  // 保存文件信息到数据库（路径统一使用 COS key 格式）
  console.log('[Upload] Saving to database - cosKey:', cosKey, 'thumbnailCosKey:', thumbnailCosKey);
  const [result] = await pool.execute(
    `INSERT INTO files (user_id, filename, original_name, file_type, file_size, file_path, thumbnail_path, folder_id, mime_type, width, height, duration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, file.filename, originalName, fileType, file.size, cosKey, thumbnailCosKey, folder_id || null, mimeType, width, height, duration]
  );
  console.log('[Upload] Database insert successful, fileId:', result.insertId);

  // 为审核构建文件记录
  const fileRow = {
    id: result.insertId,
    user_id: userId,
    filename: file.filename,
    original_name: originalName,
    file_type: fileType,
    file_size: file.size,
    file_path: cosKey,
    thumbnail_path: thumbnailCosKey,
    folder_id: folder_id || null,
    mime_type: mimeType,
    width,
    height,
    duration
  };

  // 异步执行图片审核（不影响主流程）
  moderationService.reviewFile(fileRow, moderationHints).then(async (modResult) => {
    if (modResult) {
      if (!modResult.approved) {
        // 审核不通过，删除文件
        try {
          if (ci && ci.enable) {
            await ci.deleteObject(cosKey);
            if (thumbnailCosKey && thumbnailCosKey !== cosKey) {
              await ci.deleteObject(thumbnailCosKey);
            }
          } else {
            const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
            const absPath = path.join(baseUploadPath, cosKey.replace(/^\//, ''));
            if (await fs.pathExists(absPath)) await fs.remove(absPath);
            if (thumbnailCosKey) {
              const thumbAbs = path.join(baseUploadPath, thumbnailCosKey.replace(/^\//, ''));
              if (await fs.pathExists(thumbAbs)) await fs.remove(thumbAbs);
            }
          }
          await pool.execute('DELETE FROM files WHERE id = ?', [fileRow.id]);
          await pool.execute('UPDATE users SET used_storage = used_storage - ? WHERE id = ?', [file.size, userId]);
          console.warn(`[Moderation] File ${fileRow.id} blocked: ${modResult.reason}`);
        } catch (err) {
          console.error('[Moderation] Cleanup failed:', err.message);
        }
      } else {
        try {
          await pool.execute(
            'UPDATE files SET moderation_result = ?, moderation_score = ?, moderation_source = ? WHERE id = ?',
            [modResult.reason || '通过', modResult.score || null, modResult.source || 'ci', fileRow.id]
          );
        } catch (_) {}
      }
    }
  }).catch((err) => {
    console.error('[Moderation] reviewFile error:', err.message);
  });

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage + ? WHERE id = ?',
    [file.size, userId]
  );

  // 返回响应
  res.status(201).json({
    message: '文件上传成功',
    storage: ci && ci.enable ? 'cos' : 'local',
    file: {
      id: result.insertId,
      filename: file.filename,
      original_name: originalName,
      file_type: fileType,
      file_size: file.size,
      mime_type: mimeType,
      width,
      height,
      duration,
      file_url: cosUrl,
      thumbnail_url: thumbnailCosUrl,
      cos_key: cosKey
    }
  });
});

// 批量删除文件（必须在 DELETE /:id 之前注册，否则 "batch" 会被当成 id）
router.delete('/batch', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请选择要删除的文件' });
  }

  const placeholders = file_ids.map(() => '?').join(',');
  const [files] = await pool.execute(
    `SELECT * FROM files WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '没有找到要删除的文件' });
  }

  // 加载 CI 配置
  let ci = null;
  const useCi = await isCiEnabled();
  if (useCi) {
    ci = await ciService.getInstance();
  }

  const totalSize = files.reduce((sum, f) => sum + (Number(f.file_size) || 0), 0);
  const deletePromises = files.map(async (file) => {
    try {
      const isCosFile = (file.file_path || '').startsWith('users/');

      if (isCosFile && ci && ci.enable) {
        // 删除 COS 对象
        await ci.deleteObject(file.file_path);
        if (file.thumbnail_path) {
          await ci.deleteObject(file.thumbnail_path);
        }
      } else {
        // 删除本地文件
        const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
        let filePath;

        if (path.isAbsolute(file.file_path)) {
          filePath = file.file_path;
        } else {
          let normalizedPath = file.file_path.replace(/\\/g, '/');
          if (normalizedPath.startsWith('storage/')) {
            normalizedPath = normalizedPath.substring(8);
          }
          filePath = path.resolve(baseUploadPath, normalizedPath);
        }

        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }

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
      }
    } catch (error) {
      // 批量删除物理文件失败，继续处理
    }
  });

  await Promise.all(deletePromises);

  await pool.execute(
    `DELETE FROM files WHERE id IN (${placeholders}) AND user_id = ?`,
    [...file_ids, userId]
  );

  await pool.execute(
    'UPDATE users SET used_storage = used_storage - ? WHERE id = ?',
    [totalSize, userId]
  );

  res.json({ message: `成功删除 ${files.length} 个文件` });
}));

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

// 批量重命名文件
router.put('/batch/rename', authenticateToken, asyncHandler(async (req, res) => {
  const { file_ids, pattern, prefix, suffix, start_number } = req.body;
  if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
    return res.status(400).json({ message: '请选择要重命名的文件' });
  }
  
  try {
    const results = [];
    
    for (let i = 0; i < file_ids.length; i++) {
      const fileId = file_ids[i];
      const [rows] = await pool.execute(
        'SELECT filename, original_name FROM files WHERE id = ? AND user_id = ?',
        [fileId, req.user.id]
      );
      if (rows.length === 0) continue;
      
      let newName = rows[0].original_name;
      const ext = newName.includes('.') ? '.' + newName.split('.').pop() : '';
      const baseName = newName.includes('.') ? newName.slice(0, -ext.length) : newName;
      
      if (pattern === 'prefix' && prefix) {
        newName = prefix + baseName + ext;
      } else if (pattern === 'suffix' && suffix) {
        newName = baseName + suffix + ext;
      } else if (pattern === 'number' && start_number !== undefined) {
        newName = `${start_number + i}${ext}`;
      } else if (pattern === 'date') {
        const date = new Date().toISOString().slice(0, 10);
        newName = `${date}_${baseName}${ext}`;
      }
      
      await pool.execute(
        'UPDATE files SET original_name = ?, filename = ? WHERE id = ?',
        [newName, newName, fileId]
      );
      results.push({ fileId, newName });
    }
    
    res.json({ message: `成功重命名 ${results.length} 个文件`, results });
  } catch (error) {
    console.error('批量重命名失败:', error);
    res.status(500).json({ message: '批量重命名失败' });
  }
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
  const isCosFile = (file.file_path || '').startsWith('users/');

  // 删除物理文件
  try {
    if (isCosFile) {
      // 删除 COS 对象
      const useCi = await isCiEnabled();
      if (useCi) {
        const ci = await ciService.getInstance();
        if (ci.enable) {
          await ci.deleteObject(file.file_path);
          if (file.thumbnail_path) {
            await ci.deleteObject(file.thumbnail_path);
          }
        }
      }
    } else {
      // 删除本地文件
      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      let filePath;

      if (path.isAbsolute(file.file_path)) {
        filePath = file.file_path;
      } else {
        let normalizedPath = file.file_path.replace(/\\/g, '/');
        if (normalizedPath.startsWith('storage/')) {
          normalizedPath = normalizedPath.substring(8);
        }
        filePath = path.resolve(baseUploadPath, normalizedPath);
      }

      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }

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
    }
  } catch (error) {
    console.error('删除物理文件失败:', error);
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

  console.log('[Preview] Requesting file:', fileId, 'user:', userId);

  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    console.log('[Preview] File not found in database');
    return res.status(404).json({ message: '文件不存在' });
  }

  const file = files[0];
  console.log('[Preview] File found:', file.filename, 'path:', file.file_path, 'type:', file.file_type);
  const isCosFile = (file.file_path || '').startsWith('users/');

  // CI 已启用且 COS 配置有效：重定向到签名 URL；否则走下方本地流式（避免占位桶名导致 400/CORS）
  if (isCosFile) {
    const useCi = await isCiEnabled();
    if (useCi) {
      const ci = await ciService.getInstance();
      if (ci.enable && ci.canUseSignedUrls()) {
        const signedUrl = ci.getSignedUrl(file.file_path, 3600);
        return res.redirect(302, signedUrl);
      }
    }
    // CI 未启用但路径是 users/ 格式：这是历史遗留数据，尝试从本地读取
    // 不再重定向到 COS，而是从本地 storage 目录读取
  }

  // 本地文件：流式读取（处理所有本地路径，包括 users/ 格式）
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  const baseNormalized = baseUploadPath.replace(/\\/g, '/');
  let filePath;

  const dbPath = (file.file_path || '').replace(/\\/g, '/');

  if (path.isAbsolute(dbPath)) {
    filePath = dbPath;
  } else {
    let normalizedPath = dbPath;
    if (normalizedPath.startsWith('storage/')) {
      normalizedPath = normalizedPath.substring(8);
    }
    // 修复：如果路径已经是 users/... 格式，直接拼接到 baseUploadPath
    if (normalizedPath.startsWith('users/')) {
      filePath = path.join(baseNormalized, normalizedPath);
    } else {
      filePath = path.resolve(baseNormalized, normalizedPath);
    }
  }

  if (!await fs.pathExists(filePath)) {
    console.log('[Preview] File not found at path:', filePath);
    const dbPathSafe = dbPath.replace(/\\/g, '/');
    const alternativePaths = [
      path.join('/www/wwwroot/tuku/backend', dbPathSafe),
      path.join('/www/wwwroot/tuku/backend/dist', dbPathSafe),
      path.join(baseNormalized, dbPathSafe),
      path.resolve(dbPathSafe),
      dbPathSafe
    ].filter((p, i, arr) => arr.indexOf(p) === i);

    for (const altPath of alternativePaths) {
      console.log('[Preview] Checking alt path:', altPath, 'exists:', await fs.pathExists(altPath));
      if (await fs.pathExists(altPath)) {
        filePath = altPath;
        break;
      }
    }

    if (!await fs.pathExists(filePath)) {
      console.log('[Preview] All paths failed, returning 404');
      return res.status(404).json({ message: '文件不存在' });
    }
  }

  console.log('[Preview] Serving file from:', filePath);

  const mimeType = mime.lookup(filePath) || file.mime_type || 'application/octet-stream';
  const stat = await fs.stat(filePath);
  const isDownload = req.query.download === 'true';

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Length': stat.size,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Content-Disposition': isDownload
      ? `attachment; filename="${encodeURIComponent(path.basename(filePath))}"; filename*=UTF-8''${encodeURIComponent(path.basename(filePath))}`
      : `inline; filename="${path.basename(filePath)}"`,
    'Cache-Control': 'public, max-age=31536000, immutable, no-transform'
  });
  fs.createReadStream(filePath).pipe(res);
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

// 辅助函数：获取文件的绝对路径
function toAbsolute(relativePath) {
  if (!relativePath) return null;
  if (/^https?:\/\//.test(relativePath)) return null;
  if (path.isAbsolute(relativePath)) return relativePath;
  const normalized = String(relativePath).replace(/\\/g, '/').replace(/^storage\//, '');
  const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
  return path.resolve(baseUploadPath, normalized);
}

// 获取 CI 上传签名（供前端直传 COS）
router.get('/upload-signature', authenticateToken, asyncHandler(async (req, res) => {
  const { filename, file_type, folder_id } = req.query;
  const userId = req.user.id;

  const useCi = await isCiEnabled();
  if (!useCi) {
    return res.status(400).json({ message: 'CI 未启用，请使用标准上传接口' });
  }

  const ci = await ciService.getInstance();
  if (!ci.enable || !ci.canUseSignedUrls()) {
    return res.status(400).json({ message: 'CI 未启用或未正确配置 COS，请使用标准上传接口' });
  }

  // 生成 COS key
  const ext = path.extname(filename || '.tmp').toLowerCase();
  const safeFilename = `${uuidv4()}${ext}`;
  const cosKey = buildCosKey(userId, folder_id, safeFilename, file_type === 'video' ? 'video' : 'image');

  // 生成上传签名（有效期 1 小时）
  const signature = ci.generateUploadSignature(cosKey, 3600);

  res.json({
    success: true,
    cos_key: cosKey,
    upload_url: signature.uploadUrl,
    signature: signature.signature,
    expires: signature.expires,
    thumbnail_url: ci.getThumbnailUrl(cosKey)
  });
}));

// 获取文件访问签名 URL
router.get('/:id/signed-url', authenticateToken, asyncHandler(async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id;
  const { expires = 3600 } = req.query;

  const [files] = await pool.execute(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  if (files.length === 0) {
    return res.status(404).json({ message: '文件不存在' });
  }

  const file = files[0];
  const useCi = await isCiEnabled();

  if (useCi) {
    const ci = await ciService.getInstance();
    if (ci.enable && ci.canUseSignedUrls()
      && file.file_path && file.file_path.startsWith('users/')) {
      // COS 文件，生成签名 URL
      const signedUrl = ci.getSignedUrl(file.file_path, parseInt(expires));
      return res.json({
        success: true,
        url: signedUrl,
        expires: parseInt(expires),
        storage: 'cos'
      });
    }
  }

  // 本地文件，返回标准 URL
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  let normalized = file.file_path.replace(/\\/g, '/');
  if (normalized.startsWith('storage/')) normalized = normalized.substring(8);
  const url = `${backendDomain}/uploads/${normalized}`;

  res.json({
    success: true,
    url,
    expires: parseInt(expires),
    storage: 'local'
  });
}));

// ============================================================
// COS 临时密钥接口（前端直传用）
// ============================================================

// 获取上传凭证
router.get('/cos-credential', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type = 'image', folder_id } = req.query;

  // 检查 CI/COS 是否启用
  const cosConfig = cosStsService.getCosConfig();
  if (!cosConfig.enable) {
    return res.status(400).json({
      success: false,
      message: 'COS 未配置，请联系管理员'
    });
  }

  try {
    // 生成上传路径
    const folderPart = folder_id ? `folders/folder_${folder_id}/` : '';
    const typeDir = type === 'video' ? 'videos' : 'images';
    const uploadPath = `users/user_${userId}/${folderPart}${typeDir}`;

    // 生成临时凭证
    const credential = cosStsService.generateTempCredential({
      userId: `user_${userId}`,
      allowActions: [
        'cos:PutObject',           // 上传
        'cos:InitiateMultipartUpload', // 分片上传初始化
        'cos:UploadPart',          // 分片上传
        'cos:CompleteMultipartUpload', // 分片上传完成
        'cos:GetObject',           // 下载
        'cos:HeadObject'           // 查询文件信息
      ],
      durationSeconds: 7200 // 2小时
    });

    // 构建上传目录前缀（前端只能上传到这个目录）
    const allowPrefix = `${uploadPath}/*`;

    res.json({
      success: true,
      message: '获取凭证成功',
      data: {
        // COS 配置
        bucket: cosConfig.bucket,
        region: cosConfig.region,
        host: cosConfig.host,

        // 凭证
        tmpSecretId: credential.tmpSecretId,
        tmpSecretKey: credential.tmpSecretKey,
        sessionToken: credential.sessionToken,
        expiredTime: credential.expiredTime,

        // 路径限制
        uploadPath,
        allowPrefix,

        // 上传限制
        maxSize: 200 * 1024 * 1024, // 200MB
        allowExts: type === 'video'
          ? ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v']
          : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],

        // 回调地址（可选，用于上传成功后通知后端）
        callbackUrl: `${process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn'}/api/files/cos-callback`
      }
    });
  } catch (error) {
    console.error('[COS] 获取凭证失败:', error.message);
    res.status(500).json({
      success: false,
      message: '获取上传凭证失败'
    });
  }
}));

// COS 上传成功回调（前端直传后调用）
router.post('/cos-callback', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    cosKey,
    originalName,
    fileSize,
    mimeType,
    width,
    height,
    folder_id
  } = req.body;

  // 安全验证：确保只能操作自己的目录
  if (!cosStsService.validateCosKey(cosKey, userId)) {
    return res.status(403).json({
      success: false,
      message: '无权操作此文件'
    });
  }

  try {
    // 推断文件类型
    const fileType = (mimeType || '').startsWith('video/') ? 'video'
      : (mimeType || '').startsWith('image/') ? 'image'
      : 'other';

    // 生成缩略图 COS Key
    let thumbnailCosKey = null;
    let thumbnailUrl = null;

    if (fileType === 'image') {
      // 图片缩略图直接用 CI 处理参数
      const ci = await ciService.getInstance();
      if (ci.enable) {
        thumbnailUrl = ci.getThumbnailUrl(cosKey);
        // 缩略图和原图同一个 key，通过 URL 参数区分
        thumbnailCosKey = cosKey;
      }
    } else if (fileType === 'video') {
      // 视频缩略图：需要后端生成后再上传
      // TODO: 视频缩略图处理
    }

    // 保存到数据库
    const [result] = await pool.execute(
      `INSERT INTO files (user_id, filename, original_name, file_type, file_size, file_path, thumbnail_path, folder_id, mime_type, width, height)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, path.basename(cosKey), originalName, fileType, fileSize, cosKey, thumbnailCosKey, folder_id || null, mimeType, width, height]
    );

    // 更新用户存储使用量
    await pool.execute(
      'UPDATE users SET used_storage = used_storage + ? WHERE id = ?',
      [fileSize, userId]
    );

    // 异步执行审核
    const fileRow = {
      id: result.insertId,
      user_id: userId,
      filename: path.basename(cosKey),
      original_name: originalName,
      file_type: fileType,
      file_size: fileSize,
      file_path: cosKey,
      thumbnail_path: thumbnailCosKey,
      folder_id: folder_id || null,
      mime_type: mimeType
    };

    moderationService.reviewFile(fileRow).then(async (modResult) => {
      if (modResult && !modResult.approved) {
        // 审核不通过，删除文件
        try {
          const ci = await ciService.getInstance();
          if (ci.enable) {
            await ci.deleteObject(cosKey);
          }
          await pool.execute('DELETE FROM files WHERE id = ?', [fileRow.id]);
          await pool.execute('UPDATE users SET used_storage = used_storage - ? WHERE id = ?', [fileSize, userId]);
        } catch (_) {}
      }
    }).catch((err) => {
      console.error('[Moderation] reviewFile error:', err.message);
    });

    res.json({
      success: true,
      message: '文件注册成功',
      data: {
        id: result.insertId,
        cosKey,
        file_url: thumbnailUrl || cosKey,
        thumbnail_url: thumbnailUrl,
        file_type: fileType,
        file_size: fileSize
      }
    });
  } catch (error) {
    console.error('[COS Callback] 保存文件记录失败:', error.message);
    res.status(500).json({
      success: false,
      message: '保存文件记录失败'
    });
  }
}));

// 获取 COS 配置信息（公开）
router.get('/cos-config', asyncHandler(async (req, res) => {
  const cosConfig = cosStsService.getCosConfig();

  res.json({
    success: true,
    data: {
      enable: cosConfig.enable,
      bucket: cosConfig.bucket,
      region: cosConfig.region,
      host: cosConfig.host
    }
  });
}));

// ============================================================
// 视频处理 API (使用腾讯云 CI)
// ============================================================

// 视频转动图 - 提交任务
router.post('/video/animation', authenticateToken, asyncHandler(async (req, res) => {
  const ci = await ciService.getInstance();
  if (!ci.enable) {
    return res.status(400).json({ success: false, message: 'CI 未启用' });
  }

  const { cosKey, options = {} } = req.body;
  if (!cosKey) {
    return res.status(400).json({ success: false, message: '缺少 cosKey 参数' });
  }

  // 验证用户是否有权限访问该文件
  const fileRecord = await pool.execute(
    'SELECT id, user_id FROM files WHERE file_path = ? OR thumbnail_path = ?',
    [cosKey, cosKey]
  );
  const [rows] = fileRecord;
  if (rows.length === 0 || rows[0].user_id !== req.userId) {
    return res.status(403).json({ success: false, message: '无权访问该文件' });
  }

  const result = await ci.videoToAnimation(cosKey, {
    startTime: options.startTime || '0',
    timeSpan: options.timeSpan || '3',
    frameRate: options.frameRate || '15',
    outputFormat: options.outputFormat || 'gif',
    width: options.width || '320',
    quality: options.quality || '80',
    templateId: options.templateId || ''
  });

  if (result) {
    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        state: result.state,
        outputUrl: result.outputUrl
      }
    });
  } else {
    res.status(500).json({ success: false, message: '视频转动图任务提交失败' });
  }
}));

// 智能封面 - 提交任务
router.post('/video/smart-cover', authenticateToken, asyncHandler(async (req, res) => {
  const ci = await ciService.getInstance();
  if (!ci.enable) {
    return res.status(400).json({ success: false, message: 'CI 未启用' });
  }

  const { cosKey, options = {} } = req.body;
  if (!cosKey) {
    return res.status(400).json({ success: false, message: '缺少 cosKey 参数' });
  }

  // 验证用户是否有权限访问该文件
  const fileRecord = await pool.execute(
    'SELECT id, user_id FROM files WHERE file_path = ? OR thumbnail_path = ?',
    [cosKey, cosKey]
  );
  const [rows] = fileRecord;
  if (rows.length === 0 || rows[0].user_id !== req.userId) {
    return res.status(403).json({ success: false, message: '无权访问该文件' });
  }

  const result = await ci.generateSmartCover(cosKey, {
    count: options.count || '3',
    width: options.width || '',
    height: options.height || '',
    deleteDuplicates: options.deleteDuplicates || 'false',
    templateId: options.templateId || ''
  });

  if (result) {
    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        state: result.state,
        covers: result.covers
      }
    });
  } else {
    res.status(500).json({ success: false, message: '智能封面任务提交失败' });
  }
}));

// 查询视频处理任务结果
router.get('/video/job/:jobId', authenticateToken, asyncHandler(async (req, res) => {
  const ci = await ciService.getInstance();
  if (!ci.enable) {
    return res.status(400).json({ success: false, message: 'CI 未启用' });
  }

  const { jobId } = req.params;

  const result = await ci.queryMediaJob(jobId);

  if (result) {
    res.json({
      success: true,
      data: {
        jobId: result.jobId,
        state: result.state,
        outputKey: result.outputKey,
        outputUrl: result.outputUrl,
        covers: result.covers
      }
    });
  } else {
    res.status(404).json({ success: false, message: '任务不存在或查询失败' });
  }
}));

// 导出文件列表
router.get('/export', authenticateToken, asyncHandler(async (req, res) => {
  const { format = 'csv', folder_id } = req.query;
  try {
    let query = 'SELECT original_name, file_type, file_size, created_at FROM files WHERE user_id = ?';
    const params = [req.user.id];
    if (folder_id) { query += ' AND folder_id = ?'; params.push(folder_id); }
    query += ' ORDER BY created_at DESC LIMIT 10000';
    
    const [rows] = await pool.execute(query, params);
    
    if (format === 'json') {
      return res.json({ files: rows, total: rows.length });
    }
    
    // CSV format
    const header = '文件名,类型,大小,创建时间\n';
    const csv = rows.map(r => 
      `"${r.original_name}",${r.file_type},${r.file_size},${r.created_at}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=files_export.csv');
    res.send('\ufeff' + header + csv); // BOM for Excel
  } catch (error) {
    console.error('导出失败:', error);
    res.status(500).json({ message: '导出失败' });
  }
}));

module.exports = router;
