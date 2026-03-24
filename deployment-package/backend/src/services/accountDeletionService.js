const { pool } = require('../config/database')
const fs = require('fs-extra')
const path = require('path')

async function deleteUserCompletely(userId, options = {}) {
  const { deleteSystemLogs = false } = options
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 分享（文件）
    try { await connection.execute('DELETE FROM file_share_reviews WHERE owner_user_id=? OR file_id IN (SELECT id FROM files WHERE user_id=?)', [userId, userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM file_shares WHERE owner_user_id=? OR file_id IN (SELECT id FROM files WHERE user_id=?)', [userId, userId]) } catch (_) {}

    // 实况相关
    try { await connection.execute('DELETE FROM live_media_share_reviews WHERE asset_id IN (SELECT id FROM live_media_assets WHERE owner_user_id=?)', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM live_media_shares WHERE asset_id IN (SELECT id FROM live_media_assets WHERE owner_user_id=?)', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM live_media_variants WHERE asset_id IN (SELECT id FROM live_media_assets WHERE owner_user_id=?)', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM live_media_assets WHERE owner_user_id=?', [userId]) } catch (_) {}

    // 偏好/通知/趋势/登录令牌/登录日志
    try { await connection.execute('DELETE FROM user_preferences WHERE user_id=?', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM user_notification_settings WHERE user_id=?', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM user_trends WHERE user_id=?', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM user_tokens WHERE user_id=?', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM user_login_logs WHERE user_id=?', [userId]) } catch (_) {}

    if (deleteSystemLogs) {
      try { await connection.execute('DELETE FROM system_logs WHERE user_id=?', [userId]) } catch (_) {}
    }

    // 文件/文件夹
    try { await connection.execute('DELETE FROM files WHERE user_id=?', [userId]) } catch (_) {}
    try { await connection.execute('DELETE FROM folders WHERE user_id=?', [userId]) } catch (_) {}

    // 用户
    await connection.execute('DELETE FROM users WHERE id=?', [userId])

    await connection.commit()
  } catch (e) {
    try { await connection.rollback() } catch (_) {}
    throw e
  } finally {
    connection.release()
  }

  // 清理磁盘目录（尽力而为）
  try {
    const baseUploadPath = process.env.UPLOAD_PATH || '/www/wwwroot/tuku/backend/storage'
    const userDir = path.join(baseUploadPath, 'users', `user_${userId}`)
    await fs.remove(userDir)
  } catch (_) {}
}

module.exports = { deleteUserCompletely }


