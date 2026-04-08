const express = require('express');
const { pool } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const NginxConfigManager = require('../services/nginxConfigService');

const router = express.Router();

// 创建Nginx配置管理器实例
let nginxManager;
try {
  nginxManager = new NginxConfigManager();
} catch (error) {
  console.error('Failed to create NginxConfigManager:', error);
  nginxManager = null;
}

/**
 * 测试Nginx配置API是否可用
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Nginx配置API可用',
    timestamp: new Date().toISOString(),
    managerStatus: nginxManager ? 'initialized' : 'failed'
  });
});

/**
 * 获取Nginx配置状态
 */
router.get('/status', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    const status = await nginxManager.getConfigStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('获取Nginx配置状态失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取Nginx配置状态失败',
      error: error.message 
    });
  }
}));

/**
 * 更新Nginx配置
 */
router.post('/update', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    const updated = await nginxManager.checkAndUpdateConfig();
    
    if (updated) {
      res.json({
        success: true,
        message: 'Nginx配置已更新并重新加载',
        data: await nginxManager.getConfigStatus()
      });
    } else {
      res.json({
        success: true,
        message: 'Nginx配置无需更新',
        data: await nginxManager.getConfigStatus()
      });
    }
  } catch (error) {
    console.error('更新Nginx配置失败:', error);
    res.status(500).json({ 
      success: false,
      message: '更新Nginx配置失败',
      error: error.message 
    });
  }
}));

/**
 * 强制更新Nginx配置
 */
router.post('/force-update', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    const currentLimitGB = await nginxManager.getCurrentFileSizeLimit();
    await nginxManager.updateConfig(currentLimitGB);
    await nginxManager.applyConfig();
    
    res.json({
      success: true,
      message: 'Nginx配置已强制更新并重新加载',
      data: await nginxManager.getConfigStatus()
    });
  } catch (error) {
    console.error('强制更新Nginx配置失败:', error);
    res.status(500).json({ 
      success: false,
      message: '强制更新Nginx配置失败',
      error: error.message 
    });
  }
}));

/**
 * 测试Nginx配置
 */
router.post('/test-config', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    await nginxManager.testConfig();
    res.json({
      success: true,
      message: 'Nginx配置测试通过'
    });
  } catch (error) {
    console.error('Nginx配置测试失败:', error);
    res.status(500).json({ 
      success: false,
      message: 'Nginx配置测试失败',
      error: error.message 
    });
  }
}));

/**
 * 获取系统设置并建议Nginx配置
 */
router.get('/suggest', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    const [result] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['max_file_size']
    );
    
    if (result.length > 0) {
      const maxFileSizeBytes = parseInt(result[0].setting_value);
      const limitGB = Math.ceil(maxFileSizeBytes / (1024 * 1024 * 1024)) + 1;
      const suggestedLimit = Math.min(limitGB, 10); // 最大10GB
      
      res.json({
        success: true,
        data: {
          currentSetting: maxFileSizeBytes,
          currentSettingMB: Math.round(maxFileSizeBytes / (1024 * 1024)),
          suggestedNginxLimit: suggestedLimit,
          suggestedNginxLimitGB: suggestedLimit,
          explanation: `基于当前设置 ${Math.round(maxFileSizeBytes / (1024 * 1024))}MB，建议Nginx限制设置为 ${suggestedLimit}GB`,
          suggestedConfig: nginxManager ? nginxManager.getSuggestedNginxConfig(suggestedLimit) : null
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          currentSetting: 0,
          currentSettingMB: 0,
          suggestedNginxLimit: 2,
          suggestedNginxLimitGB: 2,
          explanation: '未找到文件大小设置，建议Nginx限制设置为 2GB',
          suggestedConfig: nginxManager ? nginxManager.getSuggestedNginxConfig(2) : null
        }
      });
    }
  } catch (error) {
    console.error('获取建议配置失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取建议配置失败',
      error: error.message 
    });
  }
}));

/**
 * 获取建议的Nginx配置内容
 */
router.get('/config-template', authenticateToken, asyncHandler(async (req, res) => {
  // 检查用户权限
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }

  try {
    const currentLimitGB = nginxManager ? await nginxManager.getCurrentFileSizeLimit() : 2;
    const suggestedConfig = nginxManager ? nginxManager.getSuggestedNginxConfig(currentLimitGB) : null;
    
    res.json({
      success: true,
      data: {
        configContent: suggestedConfig,
        configPath: nginxManager ? nginxManager.nginxConfigPath : '/www/server/panel/vhost/nginx/dist.conf',
        instructions: [
          '1. 备份当前Nginx配置文件',
          '2. 编辑配置文件，添加文件大小限制',
          '3. 测试配置: nginx -t',
          '4. 重启Nginx: systemctl restart nginx'
        ]
      }
    });
  } catch (error) {
    console.error('获取配置模板失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取配置模板失败',
      error: error.message 
    });
  }
}));

module.exports = router;
