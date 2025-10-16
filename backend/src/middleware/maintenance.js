const { pool } = require('../config/database');

/**
 * 维护模式中间件
 * 检查系统是否处于维护模式，如果是则只允许管理员访问
 */
const checkMaintenanceMode = async (req, res, next) => {
  try {
    // 获取维护模式设置
    const [settings] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['maintenance_mode']
    );
    
    const isMaintenanceMode = settings.length > 0 && settings[0].setting_value === 'true';
    
    if (isMaintenanceMode) {
      // 维护模式下，检查用户是否为管理员
      if (!req.user || req.user.role !== 'admin') {
        return res.status(503).json({
          message: '系统正在维护中，请稍后再试',
          code: 'MAINTENANCE_MODE',
          maintenance: true
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('检查维护模式失败:', error);
    // 如果检查失败，允许访问（避免维护模式检查导致系统完全无法访问）
    next();
  }
};

/**
 * 注册控制中间件
 * 检查是否允许新用户注册
 */
const checkRegistrationEnabled = async (req, res, next) => {
  try {
    // 获取注册设置
    const [settings] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['enable_registration']
    );
    
    const isRegistrationEnabled = settings.length > 0 && settings[0].setting_value === 'true';
    
    if (!isRegistrationEnabled) {
      return res.status(403).json({
        message: '系统暂不开放注册，请联系管理员',
        code: 'REGISTRATION_DISABLED'
      });
    }
    
    next();
  } catch (error) {
    console.error('检查注册设置失败:', error);
    // 如果检查失败，默认允许注册
    next();
  }
};

module.exports = {
  checkMaintenanceMode,
  checkRegistrationEnabled
};




