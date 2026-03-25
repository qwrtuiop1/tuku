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
const liveMediaService = require('../services/liveMediaService');

const router = express.Router();

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

// 处理文件上传的核心逻辑
// 安卓 Live 图可能为 [JPEG][MP4] 且拼接点在文件中部（JPEG 占少、MP4 占多），需扩大搜索
async function isMotionPhotoJpeg(filePath) {
  const ftyp = Buffer.from('ftyp');
  const MAX_HEAD = 20 * 1024 * 1024; // 与 liveMediaService 一致，覆盖大体积封面 + 中部 ftyp
  const MAX_TAIL = 5 * 1024 * 1024;   // 与 liveMediaService 一致

  function validateFtypBox(buf, idx, bufStartInFile) {
    if (idx < 4) return null;
    const boxLen = buf.readUInt32BE(idx - 4);
    const remaining = buf.length - (idx - 4);
    if (boxLen < 8 || boxLen > 1024 * 1024 || boxLen > remaining) return null;
    return bufStartInFile + (idx - 4);
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.size < 16) return false;

    const fd = await fs.open(filePath, 'r');

    // 1) 前部扫描：JPEG 在前、ftyp 在中部（如 IMG_20251017_191706.jpg）
    const headSize = Math.min(MAX_HEAD, stat.size);
    const headBuf = Buffer.alloc(headSize);
    await fd.read(headBuf, 0, headSize, 0);

    let pos = 0;
    while (true) {
      const idx = headBuf.indexOf(ftyp, pos);
      if (idx === -1) break;
      const mp4Start = validateFtypBox(headBuf, idx, 0);
      if (mp4Start !== null) {
        // 确认 ftyp 之前有 FF D9（JPEG EOI）
        let eoiBefore = -1;
        for (let i = idx - 1; i >= 1; i--) {
          if (headBuf[i - 1] === 0xFF && headBuf[i] === 0xD9) {
            eoiBefore = i + 1;
            break;
          }
        }
        if (eoiBefore > 0 && eoiBefore < idx) {
          await fd.close();
          return true;
        }
      }
      pos = idx + 4;
    }

    // 2) 尾部扫描：JPEG 在后、ftyp 紧跟 EOI（标准结构）
    const tailSize = Math.min(MAX_TAIL, stat.size);
    const tailBuf = Buffer.alloc(tailSize);
    await fd.read(tailBuf, 0, tailSize, stat.size - tailSize);
    await fd.close();

    let eoiAfter = -1;
    for (let i = tailBuf.length - 2; i >= 0; i--) {
      if (tailBuf[i] === 0xFF && tailBuf[i + 1] === 0xD9) {
        eoiAfter = i + 2;
        break;
      }
    }
    if (eoiAfter >= 0 && eoiAfter < tailBuf.length - 8) {
      const afterJpeg = tailBuf.subarray(eoiAfter);
      pos = 0;
      while (true) {
        const idx = afterJpeg.indexOf(ftyp, pos);
        if (idx === -1) break;
        if (validateFtypBox(afterJpeg, idx, 0) !== null) return true;
        pos = idx + 4;
      }
    }
    return false;
  } catch (_) {
    return false;
  }
}

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

const handleFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '没有上传文件' });
  }

  const { folder_id, live_basename, live_role } = req.body;
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

  // 获取文件信息（必须与 multer destination 的分类一致）
  const inferred = inferFileCategory(file);
  // inferFileCategory 无法识别时（如无扩展名且 MIME 异常），降级读取文件头魔数
  const fileType = inferred === 'image' ? 'image'
    : inferred === 'video' ? 'video'
    : await detectFileTypeByMagic(file.path);
  let width = null, height = null, duration = null;
  let thumbnailPath = null;
  // 为审核提供的额外文本（如OCR、ASR、文件特征）
  let moderationHints = [];
  

  if (fileType === 'image') {
    // 兜底：安卓 Motion Photo 检测，命中则转交 live 通道
    if ((file.mimetype === 'image/jpeg' || path.extname(file.originalname).toLowerCase() === '.jpg' || path.extname(file.originalname).toLowerCase() === '.jpeg') && await isMotionPhotoJpeg(file.path)) {
      try {
        const jobId = await liveMediaService.createUploadJob(userId, [
          { path: file.path, originalname: file.originalname, mimetype: file.mimetype }
        ]);
        return res.status(202).json({ message: '检测到 Motion Photo，已转交实况处理', jobId });
      } catch (e) {
        // 若转交失败，则继续按普通图片处理
      }
    }
    try {
      const metadata = await sharp(file.path).metadata();
      width = metadata.width || null;
        height = metadata.height || null;
      } catch (error) {
        width = null;
        height = null;
    }
  } else if (fileType === 'video') {
    // 提取视频元数据与缩略图（若系统安装了 ffprobe/ffmpeg）
    try {
      const meta = await extractVideoMeta(file.path).catch(() => null)
      if (meta) {
        duration = meta.duration || null
        width = meta.width || null
        height = meta.height || null
      }
      const thumb = await generateVideoThumbnail(file.path, userId, folder_id).catch(() => null)
      if (thumb) thumbnailPath = thumb
    } catch (_) {}
    // 生成OCR可用的提示（文件名）
    try { moderationHints.push(String(path.basename(file.originalname || ''))) } catch (_) {}
  }

  // 保存文件后追加：将审核提示写入扩展列（幂等添加 columns）
  try { await pool.execute("ALTER TABLE files ADD COLUMN IF NOT EXISTS moderation_hints TEXT NULL") } catch (_) {}
  // 生成缩略图（仅成功写入后才记录路径）
  if (fileType === 'image') {
    try {
      const thumbnailFilename = `thumb_${path.basename(file.filename)}`;
      const { thumbnailsDir } = await ensureUploadDir(userId, folder_id);
      const thumbFull = path.join(thumbnailsDir, thumbnailFilename);
      await sharp(file.path)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbFull);
      thumbnailPath = thumbFull;
    } catch (error) {
      thumbnailPath = null;
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
  const baseNormalized = baseUploadPath.replace(/\\/g, '/');

  // 将 file.path 统一转换为正斜杠后再计算相对路径（处理 Windows 路径被 path.relative 产出反斜杠的情况）
  const normalizedFilePath = file.path.replace(/\\/g, '/');
  const relativePath = path.relative(baseNormalized, normalizedFilePath);

  // 确保路径格式正确：只保留正斜杠，且不带前导斜杠
  const normalizedRelativePath = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');

  // 缩略图路径规范化：去掉 baseUploadPath 前缀，保留 users/user_1/... 格式
  let normalizedThumbnailRelative = null;
  if (thumbnailPath) {
    const normalizedThumb = thumbnailPath.replace(/\\/g, '/');
    normalizedThumbnailRelative = normalizedThumb.startsWith(baseNormalized)
      ? normalizedThumb.substring(baseNormalized.length).replace(/^\/+/, '')
      : normalizedThumb.replace(/^\/+/, '');
  }

  // 保存文件信息到数据库（路径统一为相对 POSIX 路径，避免 Windows 反斜杠写入 DB 导致 Linux 上预览失败）
  
  const [result] = await pool.execute(
    `INSERT INTO files (user_id, filename, original_name, file_type, file_size, file_path, thumbnail_path, folder_id, mime_type, width, height, duration) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, file.filename, originalName, fileType, file.size, normalizedRelativePath, normalizedThumbnailRelative, folder_id || null, file.mimetype, width, height, duration]
  );
  

  // 更新用户存储使用量
  await pool.execute(
    'UPDATE users SET used_storage = used_storage + ? WHERE id = ?',
    [file.size, userId]
  );

  // 生成文件访问URL
  const backendDomain = process.env.BACKEND_DOMAIN || 'https://tukubackend.vtart.cn';
  const fileUrl = `${backendDomain}/uploads/${normalizedRelativePath}`;
  const thumbnailUrl = normalizedThumbnailRelative ? `${backendDomain}/uploads/${normalizedThumbnailRelative}` : null;

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
      thumbnail_path: normalizedThumbnailRelative
    }
  });

  // 实况图配对：尝试将图片与同名视频建立关联（需要表结构支持）
  try {
    if (live_basename && (live_role === 'image' || live_role === 'video')) {
      // 确保存在 live_video_id 字段
      try {
        await pool.execute("ALTER TABLE files ADD COLUMN IF NOT EXISTS live_video_id INT NULL");
      } catch (e) {
        // 某些MySQL版本不支持IF NOT EXISTS，忽略错误
      }
      // 如果当前是图片，找同用户/同文件夹下的视频
      if (live_role === 'image') {
        const [videos] = await pool.execute(
          "SELECT id FROM files WHERE user_id=? AND (folder_id <=> ?) AND file_type='video' AND (original_name LIKE ? OR original_name LIKE ? ) ORDER BY id DESC LIMIT 1",
          [userId, folder_id || null, live_basename + '.%', live_basename + '%']
        );
        if (videos.length > 0) {
          await pool.execute('UPDATE files SET live_video_id=? WHERE id=?', [videos[0].id, result.insertId]);
        }
      } else if (live_role === 'video') {
        // 当前是视频，找图片并回填其live_video_id
        const [images] = await pool.execute(
          "SELECT id FROM files WHERE user_id=? AND (folder_id <=> ?) AND file_type='image' AND (original_name LIKE ? OR original_name LIKE ? ) ORDER BY id DESC LIMIT 1",
          [userId, folder_id || null, live_basename + '.%', live_basename + '%']
        );
        if (images.length > 0) {
          await pool.execute('UPDATE files SET live_video_id=? WHERE id=?', [result.insertId, images[0].id]);
        }
      }
    }
  } catch (e) {
    // 关联失败不影响主流程
  }
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

  const totalSize = files.reduce((sum, f) => sum + (Number(f.file_size) || 0), 0);
  const deletePromises = files.map(async (file) => {
    try {
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
  // 清理与该文件的实况关联（如有）
  try {
    await pool.execute('UPDATE files SET live_video_id = NULL WHERE live_video_id = ? AND user_id = ?', [fileId, userId]);
  } catch (e) {}

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
  const baseNormalized = baseUploadPath.replace(/\\/g, '/');
  let filePath;

  // 统一 DB 中路径的正斜杠（防御：旧数据可能有反斜杠）
  const dbPath = (file.file_path || '').replace(/\\/g, '/');

  if (path.isAbsolute(dbPath)) {
    filePath = dbPath;
  } else {
    // 如果是相对路径，基于存储根目录解析
    let normalizedPath = dbPath;

    // 如果路径以 storage/ 开头，去掉这个前缀
    if (normalizedPath.startsWith('storage/')) {
      normalizedPath = normalizedPath.substring(8);
    }

    // 使用绝对路径解析，确保路径正确
    filePath = path.resolve(baseNormalized, normalizedPath);
  }

  if (!await fs.pathExists(filePath)) {

    // 尝试其他可能的路径（均用正斜杠规范化）
    const dbPathSafe = dbPath.replace(/\\/g, '/');
    const alternativePaths = [
      path.join('/www/wwwroot/tuku/backend', dbPathSafe),
      path.join('/www/wwwroot/tuku/backend/dist', dbPathSafe),
      path.join(baseNormalized, dbPathSafe),
      path.resolve(dbPathSafe),
      dbPathSafe // 直接使用规范化后的原始路径
    ].filter((p, i, arr) => arr.indexOf(p) === i); // 去重

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

  // 使用流式输出，显式设置 Content-Length，避免部分反代/HTTP2 下的协议问题
  const stat = await fs.stat(filePath);
  const isDownload = req.query.download === 'true';

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Length': stat.size,
    // CORS 头
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Cache-Control, Last-Modified, ETag',
    // 跨源资源策略/嵌入策略，避免浏览器阻断跨域图片/视频
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    // download=true 时为附件下载（触发浏览器下载对话框），否则为内联预览
    'Content-Disposition': isDownload
      ? `attachment; filename="${encodeURIComponent(path.basename(filePath))}"; filename*=UTF-8''${encodeURIComponent(path.basename(filePath))}`
      : `inline; filename="${path.basename(filePath)}"`,
    // 禁止中间层对二进制进行转换/注入
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
    
    // 计算动图/实况（live_media_assets）数量与大小
    let motionCount = 0;
    let motionSize = 0;
    try {
      const [assets] = await pool.execute(
        'SELECT poster_path, video_mp4_path, video_webm_path, original_image_path, original_video_path FROM live_media_assets WHERE owner_user_id=?',
        [userId]
      );
      motionCount = Array.isArray(assets) ? assets.length : 0;
      const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
      const seen = new Set();
      const toAbs = (p) => {
        if (!p) return null;
        let normalized = String(p).replace(/\\/g, '/');
        if (path.isAbsolute(normalized)) return normalized;
        if (normalized.startsWith('storage/')) normalized = normalized.substring(8);
        return path.resolve(baseUploadPath, normalized);
      };
      const statSize = async (p) => {
        try {
          if (!p) return 0;
          const exists = await fs.pathExists(p);
          if (!exists) return 0;
          const st = await fs.stat(p);
          return st.isFile() ? st.size : 0;
        } catch { return 0; }
      };
      for (const a of (assets || [])) {
        const candidates = [a.video_mp4_path, a.video_webm_path, a.original_video_path, a.original_image_path, a.poster_path]
          .map(toAbs)
          .filter(Boolean);
        for (const abs of candidates) {
          const key = abs;
          if (seen.has(key)) continue;
          seen.add(key);
          motionSize += await statSize(abs);
        }
      }
    } catch (_) { /* ignore motion errors */ }

    res.json({
      success: true,
      data: {
        ...latestTrend,
        motion_count: motionCount,
        live_count: motionCount,
        motion_size: motionSize,
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
