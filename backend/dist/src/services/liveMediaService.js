const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { pool } = require('../config/database');

const BASE_STORAGE = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage';
const MAKE_WEBM = (process.env.LIVE_MEDIA_MAKE_WEBM || 'false').toLowerCase() === 'true';
const MAX_DURATION = parseInt(process.env.LIVE_MEDIA_MAX_DURATION || '6000', 10); // ms
const KEEP_ORIGINAL = (process.env.LIVE_MEDIA_KEEP_ORIGINAL || 'true').toLowerCase() === 'true';
const POSTER_QUALITY = parseInt(process.env.LIVE_MEDIA_POSTER_QUALITY || '82', 10);

async function ensureAssetDir(userId, assetId) {
  // 新路径：storage/users/user_{id}/live/asset_{assetId}
  const dir = path.join(BASE_STORAGE, 'users', `user_${userId}`, 'live', `asset_${assetId}`);
  await fs.ensureDir(dir);
  return dir;
}

function isAnimatedWebp(metadata) {
  return Boolean(metadata.pages && metadata.pages > 1);
}

/**
 * Android Motion Photo：JPEG 与 MP4 拼接点可在文件中部或任意位置。
 * 增强版：扩大搜索范围，支持微信等国产厂商 Motion Photo 格式
 * @returns {Promise<number>} 嵌入 MP4 的起始字节偏移（绝对），未找到返回 -1
 */
async function findMotionPhotoMp4ByteOffset(filePath) {
  const ftyp = Buffer.from('ftyp');
  // 扩大搜索范围以支持微信等国产厂商格式
  const MAX_HEAD = 20 * 1024 * 1024; // 从 10MB 扩大到 20MB
  const MAX_TAIL = 5 * 1024 * 1024;   // 从 2MB 扩大到 5MB
  const MAX_MIDDLE_SCAN = 50 * 1024 * 1024; // 新增：中间区域扫描 50MB

  function validateFtypBox(buf, idx, bufStartInFile) {
    if (idx < 4) return null;
    const boxLen = buf.readUInt32BE(idx - 4);
    const remaining = buf.length - (idx - 4);
    // 放宽限制：允许更小的 ftyp box（某些厂商格式）
    if (boxLen < 8 || boxLen > 1024 * 1024 || boxLen > remaining) return null;
    return bufStartInFile + (idx - 4);
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.size < 16) return -1;

    const fd = await fs.open(filePath, 'r');

    // 1) 前部：ftyp 在中部，JPEG 在前（标准 Android Motion Photo）
    const headSize = Math.min(MAX_HEAD, stat.size);
    const headBuf = Buffer.alloc(headSize);
    await fd.read(headBuf, 0, headSize, 0);

    let pos = 0;
    while (true) {
      const idx = headBuf.indexOf(ftyp, pos);
      if (idx === -1) break;
      const mp4Start = validateFtypBox(headBuf, idx, 0);
      if (mp4Start !== null) {
        let eoiBefore = -1;
        for (let i = idx - 1; i >= 1; i--) {
          if (headBuf[i - 1] === 0xFF && headBuf[i] === 0xD9) {
            eoiBefore = i + 1;
            break;
          }
        }
        if (eoiBefore > 0 && eoiBefore < idx) {
          await fd.close();
          return mp4Start;
        }
      }
      pos = idx + 4;
    }

    // 2) 尾部：标准 [JPEG 结尾][MP4 在最后]（微信、部分三星格式）
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
        const relBoxStart = idx - 4;
        const mp4Start = validateFtypBox(afterJpeg, idx, 0);
        if (mp4Start !== null) {
          return stat.size - tailSize + eoiAfter + relBoxStart;
        }
        pos = idx + 4;
      }
    }

    // 3) 微信特殊格式：JPEG 和 MP4 可能完全分离，JPEG 标记为独立 APP12/Marker
    //    扫描整个文件查找 ftyp 标记（针对微信等国产厂商）
    if (headSize < stat.size) {
      const middleStart = MAX_HEAD;
      const middleSize = Math.min(MAX_MIDDLE_SCAN, stat.size - middleStart);
      if (middleSize > 0) {
        const middleBuf = Buffer.alloc(middleSize);
        const fd2 = await fs.open(filePath, 'r');
        await fd2.read(middleBuf, 0, middleSize, middleStart);
        await fd2.close();

        // 在中间区域查找 ftyp
        pos = 0;
        while (true) {
          const idx = middleBuf.indexOf(ftyp, pos);
          if (idx === -1) break;
          const mp4Start = validateFtypBox(middleBuf, idx, middleStart);
          if (mp4Start !== null) {
            // 找到有效的 ftyp，返回偏移量
            // 注意：微信格式可能没有前面的 JPEG EOI，这里不做强制要求
            return mp4Start;
          }
          pos = idx + 4;
        }
      }
    }

    return -1;
  } catch {
    return -1;
  }
}

// ── Magic Bytes 内容检测 ──────────────────────────────────────────────────────
// 即使浏览器上报错误 MIME type（application/octet-stream），也能正确识别格式
function readMagicBytes(buffer, offset, count) {
  return buffer.slice(offset, offset + count)
}

function matchesMagic(buffer, offset, magic) {
  if (offset + magic.length > buffer.length) return false
  for (let i = 0; i < magic.length; i++) {
    if (buffer[offset + i] !== magic[i]) return false
  }
  return true
}

// 检查 GIF87a / GIF89a
function isGifByContent(buffer) {
  return matchesMagic(buffer, 0, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || // GIF87a
         matchesMagic(buffer, 0, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])    // GIF89a
}

// 检查 WebP RIFF....WEBP
function isWebpByContent(buffer) {
  if (buffer.length < 12) return false
  return matchesMagic(buffer, 0, [0x52, 0x49, 0x46, 0x46]) && // RIFF
         matchesMagic(buffer, 8, [0x57, 0x45, 0x42, 0x50])     // WEBP
}

// 检查 HEIC/HEIF (ftyp box at offset 4)
function isHeicByContent(buffer) {
  if (buffer.length < 12) return false
  return matchesMagic(buffer, 4, [0x66, 0x74, 0x79, 0x70]) // ftyp
}

// 异步读取文件前 16KB 并检测内容类型
async function detectFileContentType(file) {
  try {
    const buffer = await fs.readFile(file.path)
    if (isGifByContent(buffer))   return 'image/gif'
    if (isWebpByContent(buffer))   return 'image/webp'
    if (isHeicByContent(buffer))   return 'image/heic'
    // JPEG 也有 ftyp（在 JPEG trailer 里），但 HEIC 的 ftyp 在 offset 4
    // 已由 isHeicByContent 处理
    return null // 内容类型无法判断，沿用现有检测
  } catch {
    return null
  }
}

async function extractMotionPhotoMp4(jpegPath, outMp4Path) {
  const offset = await findMotionPhotoMp4ByteOffset(jpegPath);
  if (offset < 0) return false;
  try {
    const stats = await fs.stat(jpegPath);
    if (offset >= stats.size) return false;
    const fd = await fs.open(jpegPath, 'r');
    const buf = Buffer.alloc(stats.size - offset);
    await fd.read(buf, 0, buf.length, offset);
    await fd.close();
    await fs.writeFile(outMp4Path, buf);
    return true;
  } catch {
    return false;
  }
}

async function makePosterFromVideo(videoPath, outPosterPath) {
  // 使用 ffmpeg 抽取首帧
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(['-frames:v 1'])
      .on('end', async () => {
        try {
          // 压缩与标准化
          await sharp(outPosterPath).jpeg({ quality: POSTER_QUALITY }).toFile(outPosterPath + '.tmp');
          await fs.move(outPosterPath + '.tmp', outPosterPath, { overwrite: true });
          resolve(true);
        } catch (e) { resolve(true); }
      })
      .on('error', (err) => reject(err))
      .save(outPosterPath);
  });
}

async function transcodeToMp4(inputPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-profile:v high',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-preset veryfast',
        ...(MAX_DURATION > 0 ? ['-t ' + (MAX_DURATION / 1000)] : []),
      ])
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(outPath);
  });
}

async function transcodeToWebm(inputPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libvpx-vp9',
        '-b:v 0',
        '-crf 35',
        ...(MAX_DURATION > 0 ? ['-t ' + (MAX_DURATION / 1000)] : []),
      ])
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(outPath);
  });
}

const DEFAULT_VARIANTS = (process.env.LIVE_MEDIA_VARIANTS || '426x240@400;640x360@800;854x480@1200;1280x720@2500').split(';');
function parseVariants() {
  return DEFAULT_VARIANTS.map(v => {
    const [wh, br] = v.split('@');
    const [w, h] = wh.split('x').map(n => parseInt(n, 10));
    const bitrateK = parseInt(br, 10);
    let label = `${h}p`;
    return { label, width: w, height: h, bitrateK };
  });
}

async function transcodeVariantMp4(inputPath, outPath, width, height, bitrateK) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(`scale=${width}:${height}:force_original_aspect_ratio=decrease`)
      .outputOptions([
        '-c:v libx264',
        `-b:v ${bitrateK}k`,
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-preset veryfast',
        ...(MAX_DURATION > 0 ? ['-t ' + (MAX_DURATION / 1000)] : []),
      ])
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(outPath);
  });
}

async function generateVariants(assetId, masterMp4Path, assetDir) {
  const variants = parseVariants();
  for (const v of variants) {
    const mp4Path = path.join(assetDir, `video_${v.label}.mp4`);
    try {
      await transcodeVariantMp4(masterMp4Path, mp4Path, v.width, v.height, v.bitrateK);
      await pool.execute(
        `INSERT INTO live_media_variants (asset_id, label, width, height, bitrate_k, mp4_path) VALUES (?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE width=VALUES(width), height=VALUES(height), bitrate_k=VALUES(bitrate_k), mp4_path=VALUES(mp4_path)`,
        [assetId, v.label, v.width, v.height, v.bitrateK, toRelative(mp4Path)]
      );
    } catch (e) {
      // 忽略单个变体失败
    }
  }
}

async function getVideoMetadata(inputPath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err || !data) return resolve({});
      const stream = (data.streams || []).find(s => s.codec_type === 'video') || {};
      const duration = (data.format && data.format.duration) ? Number(data.format.duration) : null;
      const fps = stream.r_frame_rate ? (Number(stream.r_frame_rate.split('/')[0]) / Number(stream.r_frame_rate.split('/')[1] || 1)) : null;
      resolve({
        width: stream.width || null,
        height: stream.height || null,
        durationMs: duration ? Math.round(duration * 1000) : null,
        fps: fps || null
      });
    });
  });
}

async function insertAssetRow(userId, payload) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO live_media_assets 
        (owner_user_id, folder_id, kind, poster_path, video_mp4_path, video_webm_path, original_image_path, original_video_path, duration_ms, width, height, fps, loopable)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        payload.folder_id || null,
        payload.kind,
        payload.poster_path,
        payload.video_mp4_path || null,
        payload.video_webm_path || null,
        payload.original_image_path || null,
        payload.original_video_path || null,
        payload.duration_ms || null,
        payload.width || null,
        payload.height || null,
        payload.fps || null,
        payload.loopable ? 1 : 0
      ]
    );
    return result.insertId;
  } catch (e) {
    // 若列不存在或外键无效，降级为不写 folder_id 再重试，避免整条插入失败
    const canRetryWithoutFolder = e && (
      e.code === 'ER_NO_REFERENCED_ROW_2' || e.errno === 1452 ||
      e.code === 'ER_BAD_FIELD_ERROR' || e.errno === 1054 ||
      (typeof e.message === 'string' && /Unknown column 'folder_id'/.test(e.message))
    );
    if (canRetryWithoutFolder) {
      const [result2] = await pool.execute(
        `INSERT INTO live_media_assets 
          (owner_user_id, kind, poster_path, video_mp4_path, video_webm_path, original_image_path, original_video_path, duration_ms, width, height, fps, loopable)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          payload.kind,
          payload.poster_path,
          payload.video_mp4_path || null,
          payload.video_webm_path || null,
          payload.original_image_path || null,
          payload.original_video_path || null,
          payload.duration_ms || null,
          payload.width || null,
          payload.height || null,
          payload.fps || null,
          payload.loopable ? 1 : 0
        ]
      );
      return result2.insertId;
    }
    throw e;
  }
}

function toRelative(p) {
  const normalized = p.replace(/\\/g, '/');
  const baseStorage = BASE_STORAGE.replace(/\\/g, '/');
  
  // 如果路径已经是相对路径（包含 storage/ 前缀），则去掉前缀
  if (normalized.startsWith('storage/')) {
    return normalized.substring(8);
  }
  
  // 如果路径是绝对路径且以 BASE_STORAGE 开头，转换为相对路径
  if (normalized.startsWith(baseStorage)) {
    const relative = normalized.substring(baseStorage.length).replace(/^\/+/, '');
    return relative;
  }
  
  // 否则使用 path.relative
  const relative = path.relative(BASE_STORAGE, normalized).replace(/\\/g, '/');
  return relative;
}

module.exports = {
  // 简易内存任务队列（服务重启后丢失，满足前端轮询需求）
  async createUploadJob(userId, files, folderId, options = {}) {
    const jobId = `${Date.now()}_${Math.floor(Math.random()*1e6)}`;
    await pool.execute(
      `INSERT INTO live_media_jobs (id, owner_user_id, status, progress) VALUES (?,?, 'queued', 0)`,
      [jobId, userId]
    );
    // 异步处理并持久化状态
    setImmediate(async () => {
      const cleanupFiles = async () => {
        for (const f of files || []) {
          try { await fs.remove(f.path); } catch (_) {}
        }
      };
      const update = async (fields, vals=[]) => {
        const sets = Object.keys(fields).map(k => `${k}=?`).join(',');
        const values = Object.values(fields).concat([jobId]);
        await pool.execute(`UPDATE live_media_jobs SET ${sets} WHERE id=?`, values);
      };
      let retries = 0;
      const maxRetries = 2;
      while (retries <= maxRetries) {
        try {
          await update({ status: 'processing', progress: 10 });
          const result = await this.processUploadBatch(userId, files, async (p) => { await update({ progress: Math.min(99, p) }); }, folderId, options);
          await update({ progress: 100, status: 'completed', asset_id: result.assetId });
          await cleanupFiles();
          break;
        } catch (e) {
          retries += 1;
          const delay = Math.min(5000, 500 * Math.pow(2, retries));
          await update({ retries });
          if (retries > maxRetries) {
            await update({ status: 'failed', error: (e && e.message) ? e.message : '处理失败' });
            await cleanupFiles();
            break;
          }
          await new Promise(r => setTimeout(r, delay));
        }
      }
    });
    return jobId;
  },
  async getJob(jobId, userId) {
    const [rows] = await pool.execute('SELECT * FROM live_media_jobs WHERE id=? AND owner_user_id=?', [jobId, userId]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return { id: r.id, status: r.status, progress: r.progress || 0, assetId: r.asset_id, error: r.error, createdAt: r.created_at };
  },

  async cancelJob(jobId, userId) {
    const [rows] = await pool.execute('SELECT id, owner_user_id, status, asset_id FROM live_media_jobs WHERE id=? AND owner_user_id=?', [jobId, userId]);
    if (!rows || rows.length === 0) return false;
    const job = rows[0];
    await pool.execute("UPDATE live_media_jobs SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?", [jobId]);
    if (job.asset_id) {
      try { await module.exports.deleteAssetById(job.asset_id, userId) } catch (_) {}
    }
    return true;
  },

  async processUploadBatch(userId, files, onProgress, folderId, options = {}) {
    const { pairingId } = options || {};
    
    // 调试日志：记录所有上传的文件信息
    console.log('[LiveMedia] 上传文件数量:', files.length);
    for (const f of files) {
      console.log('[LiveMedia] 文件:', {
        name: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        path: f.path
      });
    }

    // ── 内容检测（magic bytes）优先 ──────────────────────────────────────────
    // 即使浏览器上报错误 MIME type（application/octet-stream）也能正确识别
    const gifByContent = new Set()
    const webpByContent = new Set()
    const heicByContent = new Set()
    for (const f of files) {
      const ct = await detectFileContentType(f)
      console.log('[LiveMedia] Magic bytes 检测:', f.originalname, '->', ct);
      if (ct === 'image/gif')   gifByContent.add(f.originalname.toLowerCase())
      if (ct === 'image/webp')  webpByContent.add(f.originalname.toLowerCase())
      if (ct === 'image/heic')   heicByContent.add(f.originalname.toLowerCase())
    }

    // 识别上传内容（支持 HEIC+MOV 或 JPEG+MOV 配对）
    // magic bytes 命中 → 直接走对应通道，不再误入 JPEG 分支
    const isMov = (f) => /\.(mov|qt)$/i.test(f.originalname) || f.mimetype === 'video/quicktime'
    const isHeic = (f) => heicByContent.has(f.originalname.toLowerCase())
                     || /\.heic$/i.test(f.originalname) || f.mimetype === 'image/heic'
    const isJpeg = (f) => /\.jpe?g$/i.test(f.originalname) && !isHeic(f)
                  || (f.mimetype === 'image/jpeg' && !isHeic(f))
    const gif = files.find(f => gifByContent.has(f.originalname.toLowerCase())
                             || /\.gif$/i.test(f.originalname) || f.mimetype === 'image/gif')
    const webp = files.find(f => webpByContent.has(f.originalname.toLowerCase())
                              || /\.webp$/i.test(f.originalname) || f.mimetype === 'image/webp')

    console.log('[LiveMedia] 分类结果:', {
      isMov: files.filter(isMov).map(f => f.originalname),
      isHeic: files.filter(isHeic).map(f => f.originalname),
      isJpeg: files.filter(isJpeg).map(f => f.originalname),
      isGif: gif ? gif.originalname : null,
      isWebp: webp ? webp.originalname : null
    });

    const images = files.filter(f => isHeic(f) || isJpeg(f))
    const movies = files.filter(isMov)
    const jpeg = images.find(f => isJpeg(f))
    const toBase = (n) => String(n || '').replace(/\.[^.]+$/, '').toLowerCase()
    let imageFile = null
    let videoFile = null

    // ============================================================
    // 核心修复：iOS PhotosPicker 专用配对逻辑
    // 前端用 pairingId 把 Live Photo 的 image + video 一起上传，
    // 后端优先按 pairingId 匹配（同一 pairingId = 同一 Live Photo），
    // 不再依赖文件名，降低误配对概率。
    // ============================================================
    if (pairingId && images.length && movies.length) {
      // pairingId 模式：假设 files[0]=image, files[1]=video（前端保证顺序）
      // 直接取第一张图和第一段视频作为配对
      imageFile = images[0]
      videoFile = movies[0]
      console.log('[LiveMedia] pairingId 配对成功:', imageFile.originalname, '+', videoFile.originalname);
    } else if (images.length && movies.length) {
      // 兼容旧逻辑：按同名基名匹配（Android / 桌面端拖拽上传）
      const movMap = new Map()
      for (const m of movies) movMap.set(toBase(m.originalname), m)
      for (const img of images) {
        const m = movMap.get(toBase(img.originalname))
        if (m) { imageFile = img; videoFile = m; break }
      }
      // 若未配对成功，退化为任意取一对
      if (!imageFile) { imageFile = images[0]; videoFile = movies[0] }
      console.log('[LiveMedia] 文件名配对结果:', imageFile?.originalname, '+', videoFile?.originalname);
    }

    // iOS Live Photo
    if (imageFile && videoFile) {
      if (onProgress) onProgress(15);
      const [result] = await pool.execute('SELECT 1'); // 保持连接活跃
      // 先插入占位以获取 assetId
      const assetId = (await insertAssetRow(userId, {
        folder_id: folderId || null,
        kind: 'live_photo', poster_path: '', loopable: true
      }));

      const assetDir = await ensureAssetDir(userId, assetId);
      const posterPath = path.join(assetDir, 'poster.jpg');
      let originalImagePath = null;
      let originalVideoPath = null;
      if (KEEP_ORIGINAL) {
        originalImagePath = path.join(assetDir, path.basename(imageFile.path));
        originalVideoPath = path.join(assetDir, path.basename(videoFile.path));
        await fs.copy(imageFile.path, originalImagePath);
        await fs.copy(videoFile.path, originalVideoPath);
      }
      if (onProgress) onProgress(40);
      const mp4Path = path.join(assetDir, 'video.mp4');
      await transcodeToMp4(originalVideoPath, mp4Path);
      const webmPath = path.join(assetDir, 'video.webm');
      if (MAKE_WEBM) {
        try { await transcodeToWebm(originalVideoPath, webmPath); } catch (e) { /* ignore */ }
      }
      if (onProgress) onProgress(70);
      await makePosterFromVideo(mp4Path, posterPath);
      const meta = await getVideoMetadata(mp4Path);

      await pool.execute(
        `UPDATE live_media_assets SET poster_path=?, video_mp4_path=?, video_webm_path=?, original_image_path=?, original_video_path=?, duration_ms=?, width=?, height=?, fps=? WHERE id=?`,
        [
          toRelative(posterPath),
          toRelative(mp4Path),
          MAKE_WEBM ? toRelative(webmPath) : null,
          originalImagePath ? toRelative(originalImagePath) : null,
          originalVideoPath ? toRelative(originalVideoPath) : null,
          meta.durationMs || null,
          meta.width || null,
          meta.height || null,
          meta.fps || null,
          assetId
        ]
      );

      // 生成多码率变体
      try { await generateVariants(assetId, mp4Path, assetDir); } catch(_) {}
      if (onProgress) onProgress(90);
      return { assetId };
    }

    // Android Motion Photo (JPEG内嵌MP4)
    if (jpeg) {
      console.log('[LiveMedia] 尝试作为 Motion Photo 处理:', jpeg.originalname);
      if (onProgress) onProgress(15);
      // 检测并抽取
      const [tmpDir] = await Promise.all([fs.mkdtemp(path.join(BASE_STORAGE, 'tmp_'))]);
      const extractedMp4 = path.join(tmpDir, 'motion.mp4');
      const offset = await findMotionPhotoMp4ByteOffset(jpeg.path);
      console.log('[LiveMedia] Motion Photo 偏移量检测:', offset);
      const ok = await extractMotionPhotoMp4(jpeg.path, extractedMp4);
      console.log('[LiveMedia] Motion Photo 提取结果:', ok);
      if (ok) {
        const assetId = await insertAssetRow(userId, { folder_id: folderId || null, kind: 'motion_photo', poster_path: '', loopable: true });
        const assetDir = await ensureAssetDir(userId, assetId);
        let originalImagePath = null;
        if (KEEP_ORIGINAL) {
          originalImagePath = path.join(assetDir, path.basename(jpeg.path));
          await fs.copy(jpeg.path, originalImagePath);
        }
        if (onProgress) onProgress(40);
        const mp4Path = path.join(assetDir, 'video.mp4');
        await transcodeToMp4(extractedMp4, mp4Path);
        const webmPath = path.join(assetDir, 'video.webm');
        if (MAKE_WEBM) {
          try { await transcodeToWebm(extractedMp4, webmPath); } catch (e) { /* ignore */ }
        }
        const posterPath = path.join(assetDir, 'poster.jpg');
        await makePosterFromVideo(mp4Path, posterPath);
        const meta = await getVideoMetadata(mp4Path);

        await pool.execute(
          `UPDATE live_media_assets SET poster_path=?, video_mp4_path=?, video_webm_path=?, original_image_path=?, duration_ms=?, width=?, height=?, fps=? WHERE id=?`,
          [
            toRelative(posterPath),
            toRelative(mp4Path),
            MAKE_WEBM ? toRelative(webmPath) : null,
            originalImagePath ? toRelative(originalImagePath) : null,
            meta.durationMs || null,
            meta.width || null,
            meta.height || null,
            meta.fps || null,
            assetId
          ]
        );
        try { await generateVariants(assetId, mp4Path, assetDir); } catch(_) {}
        try { await fs.remove(tmpDir); } catch (_) {}
        if (onProgress) onProgress(90);
        return { assetId };
      }
    }

    // 动图 GIF/WebP
    if (gif || webp) {
      if (onProgress) onProgress(20);
      const input = gif || webp;
      const assetId = await insertAssetRow(userId, { folder_id: folderId || null, kind: 'animated', poster_path: '', loopable: true });
      const assetDir = await ensureAssetDir(userId, assetId);
      let originalImagePath = null;
      if (KEEP_ORIGINAL) {
        originalImagePath = path.join(assetDir, path.basename(input.path));
        await fs.copy(input.path, originalImagePath);
      }

      const mp4Path = path.join(assetDir, 'video.mp4');
      await transcodeToMp4(originalImagePath, mp4Path);
      const webmPath = path.join(assetDir, 'video.webm');
      if (MAKE_WEBM) {
        try { await transcodeToWebm(originalImagePath, webmPath); } catch (e) { /* ignore */ }
      }
      if (onProgress) onProgress(70);
      // 生成封面（直接取第一帧）
      const posterPath = path.join(assetDir, 'poster.jpg');
      try {
        const meta = await sharp(originalImagePath).metadata();
        if (meta && (meta.pages && meta.pages > 1)) {
          await sharp(originalImagePath, { pages: 1 }).jpeg({ quality: POSTER_QUALITY }).toFile(posterPath);
        } else {
          await sharp(originalImagePath).jpeg({ quality: POSTER_QUALITY }).toFile(posterPath);
        }
      } catch (_) {
        // 兜底：从视频取首帧
        await makePosterFromVideo(mp4Path, posterPath);
      }

      const meta = await getVideoMetadata(mp4Path);
      await pool.execute(
        `UPDATE live_media_assets SET poster_path=?, video_mp4_path=?, video_webm_path=?, original_image_path=?, duration_ms=?, width=?, height=?, fps=? WHERE id=?`,
        [
          toRelative(posterPath),
          toRelative(mp4Path),
          MAKE_WEBM ? toRelative(webmPath) : null,
          originalImagePath ? toRelative(originalImagePath) : null,
          meta.durationMs || null,
          meta.width || null,
          meta.height || null,
          meta.fps || null,
          assetId
        ]
      );
      try { await generateVariants(assetId, mp4Path, assetDir); } catch(_) {}
      if (onProgress) onProgress(90);
      return { assetId };
    }

    // 抛出错误前，记录详细的诊断信息
    console.log('[LiveMedia] 最终诊断:');
    console.log('  - images.length:', images?.length);
    console.log('  - movies.length:', movies?.length);
    console.log('  - jpeg:', jpeg?.originalname);
    console.log('  - gif:', gif?.originalname);
    console.log('  - webp:', webp?.originalname);
    console.log('  - imageFile:', imageFile?.originalname);
    console.log('  - videoFile:', videoFile?.originalname);
    
    throw new Error('无法识别的实况上传内容');
  },

  async getAssetById(id, userId) {
    const [rows] = await pool.execute('SELECT * FROM live_media_assets WHERE id=? AND owner_user_id=?', [id, userId]);
    if (!rows || rows.length === 0) return null;
    const asset = rows[0];
    return asset;
  },

  async deleteAssetById(id, userId) {
    const asset = await this.getAssetById(id, userId);
    if (!asset) return false;
    
    try {
      // 先删除磁盘目录
      const candidates = [asset.poster_path, asset.video_mp4_path, asset.video_webm_path, asset.original_image_path, asset.original_video_path]
        .filter(Boolean)
        .map(p => {
          // 处理相对路径，确保正确拼接
          if (p && !path.isAbsolute(p)) {
            return path.join(BASE_STORAGE, p);
          }
          return p;
        });
      
      // 根据任意一个已存在文件定位 asset 目录（倒数两级 .../live/asset_xxx）
      let assetDir = null;
      for (const p of candidates) {
        try {
          if (p && await fs.pathExists(p)) {
            const dir = path.dirname(p);
            assetDir = dir;
            break;
          }
        } catch (_) {}
      }
      
      // 如果找不到已存在的文件，尝试从 asset ID 构造目录
      if (!assetDir) {
        const constructedDir = path.join(BASE_STORAGE, 'users', `user_${userId}`, 'live', `asset_${id}`);
        if (await fs.pathExists(constructedDir)) {
          assetDir = constructedDir;
        }
      }
      
      if (assetDir) {
        try { await fs.remove(assetDir); } catch (err) {
          console.error(`删除实况资源目录失败: ${assetDir}`, err);
        }
      }
    } catch (err) {
      console.error('删除实况资源文件时出错:', err);
    }
    
    // 无论文件删除是否成功，都删除数据库记录
    try {
      await pool.execute('DELETE FROM live_media_variants WHERE asset_id=?', [id]);
      await pool.execute('DELETE FROM live_media_assets WHERE id=? AND owner_user_id=?', [id, userId]);
    } catch (err) {
      console.error('删除实况资源数据库记录失败:', err);
      return false;
    }
    
    return true;
  }
};


