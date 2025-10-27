const express = require('express');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// 获取维护模式状态（公共接口，无需认证）
router.get('/maintenance-status', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['maintenance_mode']
    );
    
    const maintenanceMode = result.length > 0 ? result[0].setting_value === 'true' : false;
    
    res.json({
      maintenance_mode: maintenanceMode,
      message: maintenanceMode ? '系统正在维护中' : '系统正常运行'
    });
  } catch (error) {
    console.error('获取维护模式状态失败:', error);
    res.status(500).json({ 
      maintenance_mode: false,
      message: '无法获取维护状态' 
    });
  }
}));

// 获取系统基本信息（公共接口，无需认证）
router.get('/info', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?, ?)',
      ['system_name', 'system_description', 'system_version', 'max_file_size', 'max_upload_files', 'config_version', 'allowed_image_types', 'allowed_video_types']
    );
    
    const settings = {};
    result.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({
      system_name: settings.system_name || '图库系统',
      system_description: settings.system_description || '一个功能强大的图库管理系统',
      system_version: settings.system_version || '1.0.0',
      max_file_size: Math.round(parseInt(settings.max_file_size) / (1024 * 1024)) || 100, // 将字节转换为MB
      max_upload_files: parseInt(settings.max_upload_files) || 10, // 默认10个文件
      allowed_image_types: (settings.allowed_image_types || 'jpg,jpeg,png,gif,webp,svg').split(',').map(s => s.trim()).filter(Boolean),
      allowed_video_types: (settings.allowed_video_types || 'mp4,webm,mov,avi,mkv,m4v,flv,wmv,mpeg,mpg,3gp,ts,m2ts,ogv').split(',').map(s => s.trim()).filter(Boolean),
      config_version: settings.config_version || null
    });
  } catch (error) {
    console.error('获取系统信息失败:', error);
    res.status(500).json({ 
      system_name: '图库系统',
      system_description: '一个功能强大的图库管理系统',
      system_version: '1.0.0',
      max_file_size: 100, // 默认100MB
      max_upload_files: 10, // 默认10个文件
      config_version: null
    });
  }
}));

// 获取分享功能状态（公共接口）
router.get('/share-status', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
      ['sharing_enabled', 'share_disabled_at']
    );
    const map = {};
    rows.forEach(r => { map[r.setting_key] = r.setting_value });
    const sharingEnabled = map.sharing_enabled !== 'false'; // 默认开启
    const shareDisabledAt = map.share_disabled_at || null;
    res.json({ sharing_enabled: sharingEnabled, share_disabled_at: shareDisabledAt });
  } catch (error) {
    res.json({ sharing_enabled: true, share_disabled_at: null });
  }
}));

module.exports = router;
