const { pool } = require('../config/database');

class SettingsHistoryService {
  /**
   * 记录用户设置变更历史
   * @param {number} userId - 用户ID
   * @param {string} settingType - 设置类型 (preferences, notifications, profile)
   * @param {string} settingKey - 设置键名
   * @param {any} oldValue - 旧值
   * @param {any} newValue - 新值
   * @param {string} changeReason - 变更原因
   * @param {object} req - Express请求对象
   */
  static async recordSettingChange(userId, settingType, settingKey, oldValue, newValue, changeReason = '用户修改', req = null) {
    try {
      const ipAddress = req ? (req.ip || req.connection.remoteAddress || 'unknown') : 'unknown';
      const userAgent = req ? req.get('User-Agent') || 'unknown' : 'unknown';
      
      await pool.execute(
        'INSERT INTO user_settings_history (user_id, setting_type, setting_key, old_value, new_value, change_reason, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          settingType,
          settingKey,
          JSON.stringify(oldValue),
          JSON.stringify(newValue),
          changeReason,
          ipAddress,
          userAgent
        ]
      );
      
      console.log(`📝 用户 ${userId} 设置变更已记录: ${settingType}.${settingKey}`);
    } catch (error) {
      console.error('记录设置变更历史失败:', error);
      // 不抛出错误，避免影响主要功能
    }
  }

  /**
   * 获取用户设置变更历史
   * @param {number} userId - 用户ID
   * @param {string} settingType - 设置类型 (可选)
   * @param {number} limit - 限制数量
   * @param {number} offset - 偏移量
   */
  static async getUserSettingsHistory(userId, settingType = null, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT 
          id,
          setting_type,
          setting_key,
          old_value,
          new_value,
          change_reason,
          ip_address,
          user_agent,
          created_at
        FROM user_settings_history 
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      if (settingType) {
        query += ' AND setting_type = ?';
        params.push(settingType);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [history] = await pool.execute(query, params);
      
      // 解析JSON值
      const parsedHistory = history.map(record => ({
        ...record,
        old_value: record.old_value ? JSON.parse(record.old_value) : null,
        new_value: record.new_value ? JSON.parse(record.new_value) : null
      }));
      
      return parsedHistory;
    } catch (error) {
      console.error('获取用户设置历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户设置统计信息
   * @param {number} userId - 用户ID
   */
  static async getUserSettingsStats(userId) {
    try {
      // 获取总变更次数
      const [totalChanges] = await pool.execute(
        'SELECT COUNT(*) as total FROM user_settings_history WHERE user_id = ?',
        [userId]
      );

      // 获取各类型变更次数
      const [typeStats] = await pool.execute(
        'SELECT setting_type, COUNT(*) as count FROM user_settings_history WHERE user_id = ? GROUP BY setting_type',
        [userId]
      );

      // 获取最近变更时间
      const [lastChange] = await pool.execute(
        'SELECT created_at FROM user_settings_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      return {
        totalChanges: totalChanges[0].total,
        typeStats: typeStats.reduce((acc, stat) => {
          acc[stat.setting_type] = stat.count;
          return acc;
        }, {}),
        lastChangeAt: lastChange.length > 0 ? lastChange[0].created_at : null
      };
    } catch (error) {
      console.error('获取用户设置统计失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期的设置历史记录
   * @param {number} daysToKeep - 保留天数
   */
  static async cleanupOldHistory(daysToKeep = 90) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM user_settings_history WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysToKeep]
      );
      
      console.log(`🧹 清理了 ${result.affectedRows} 条过期设置历史记录`);
      return result.affectedRows;
    } catch (error) {
      console.error('清理设置历史记录失败:', error);
      throw error;
    }
  }
}

module.exports = SettingsHistoryService;





