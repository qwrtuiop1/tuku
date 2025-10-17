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
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?, ?)',
      ['system_name', 'system_description', 'system_version']
    );
    
    const settings = {};
    result.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({
      system_name: settings.system_name || '图库系统',
      system_description: settings.system_description || '一个功能强大的图库管理系统',
      system_version: settings.system_version || '1.0.0'
    });
  } catch (error) {
    console.error('获取系统信息失败:', error);
    res.status(500).json({ 
      system_name: '图库系统',
      system_description: '一个功能强大的图库管理系统',
      system_version: '1.0.0'
    });
  }
}));

module.exports = router;
