const { pool } = require('../config/database');

class TrendService {
  // 收集用户趋势数据
  static async collectUserTrends(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 获取用户当前的文件统计
      const [files] = await pool.execute(`
        SELECT 
          file_type,
          file_size,
          created_at
        FROM files 
        WHERE user_id = ?
      `, [userId]);
      
      const [folders] = await pool.execute(`
        SELECT 
          id,
          parent_folder_id,
          folder_name,
          created_at
        FROM folders 
        WHERE user_id = ?
      `, [userId]);
      
      // 计算统计数据
      let totalFiles = files.length;
      let totalSize = 0;
      let imageCount = 0;
      let videoCount = 0;
      let imageSize = 0;
      let videoSize = 0;
      
      files.forEach(file => {
        const size = file.file_size || 0;
        totalSize += size;
        
        if (file.file_type === 'image') {
          imageCount++;
          imageSize += size;
        } else if (file.file_type === 'video') {
          videoCount++;
          videoSize += size;
        }
      });
      
      const folderCount = folders.length;
      const otherFiles = totalFiles - imageCount - videoCount;
      const otherSize = totalSize - imageSize - videoSize;
      
      // 检查是否已存在今日数据
      const [existing] = await pool.execute(`
        SELECT id FROM user_trends 
        WHERE user_id = ? AND trend_date = ?
      `, [userId, today]);
      
      if (existing.length > 0) {
        // 更新现有数据
        await pool.execute(`
          UPDATE user_trends SET
            total_files = ?,
            total_size = ?,
            image_count = ?,
            image_size = ?,
            video_count = ?,
            video_size = ?,
            folder_count = ?,
            other_files = ?,
            other_size = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND trend_date = ?
        `, [
          totalFiles, totalSize, imageCount, imageSize,
          videoCount, videoSize, folderCount, otherFiles, otherSize,
          userId, today
        ]);
      } else {
        // 插入新数据
        await pool.execute(`
          INSERT INTO user_trends (
            user_id, trend_date, total_files, total_size,
            image_count, image_size, video_count, video_size,
            folder_count, other_files, other_size
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId, today, totalFiles, totalSize,
          imageCount, imageSize, videoCount, videoSize,
          folderCount, otherFiles, otherSize
        ]);
      }
      
      // 计算变化趋势
      await this.calculateTrendChanges(userId, today);
      
      return {
        success: true,
        data: {
          totalFiles,
          totalSize,
          imageCount,
          videoCount,
          imageSize,
          videoSize,
          folderCount,
          otherFiles,
          otherSize
        }
      };
    } catch (error) {
      console.error('收集用户趋势数据失败:', error);
      // 返回默认数据而不是抛出错误
      return {
        success: true,
        data: {
          totalFiles: 0,
          totalSize: 0,
          imageCount: 0,
          videoCount: 0,
          imageSize: 0,
          videoSize: 0,
          folderCount: 0,
          otherFiles: 0,
          otherSize: 0
        }
      };
    }
  }
  
  // 计算趋势变化
  static async calculateTrendChanges(userId, currentDate) {
    try {
      // 获取昨天的数据
      const yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
      
      const [yesterdayData] = await pool.execute(`
        SELECT * FROM user_trends 
        WHERE user_id = ? AND trend_date = ?
      `, [userId, yesterdayStr]);
      
      const [todayData] = await pool.execute(`
        SELECT * FROM user_trends 
        WHERE user_id = ? AND trend_date = ?
      `, [userId, currentDate]);
      
      if (yesterdayData.length === 0 || todayData.length === 0) {
        return; // 没有足够的数据计算变化
      }
      
      const yesterdayRecord = yesterdayData[0];
      const todayRecord = todayData[0];
      
      // 计算各种变化
      const changes = [
        {
          type: 'files',
          value: todayRecord.total_files - yesterdayRecord.total_files,
          percentage: yesterdayRecord.total_files > 0 ? 
            ((todayRecord.total_files - yesterdayRecord.total_files) / yesterdayRecord.total_files * 100) : 0
        },
        {
          type: 'size',
          value: todayRecord.total_size - yesterdayRecord.total_size,
          percentage: yesterdayRecord.total_size > 0 ? 
            ((todayRecord.total_size - yesterdayRecord.total_size) / yesterdayRecord.total_size * 100) : 0
        },
        {
          type: 'images',
          value: todayRecord.image_count - yesterdayRecord.image_count,
          percentage: yesterdayRecord.image_count > 0 ? 
            ((todayRecord.image_count - yesterdayRecord.image_count) / yesterdayRecord.image_count * 100) : 0
        },
        {
          type: 'videos',
          value: todayRecord.video_count - yesterdayRecord.video_count,
          percentage: yesterdayRecord.video_count > 0 ? 
            ((todayRecord.video_count - yesterdayRecord.video_count) / yesterdayRecord.video_count * 100) : 0
        },
        {
          type: 'folders',
          value: todayRecord.folder_count - yesterdayRecord.folder_count,
          percentage: yesterdayRecord.folder_count > 0 ? 
            ((todayRecord.folder_count - yesterdayRecord.folder_count) / yesterdayRecord.folder_count * 100) : 0
        }
      ];
      
      // 删除今日的旧变化数据
      await pool.execute(`
        DELETE FROM trend_changes 
        WHERE user_id = ? AND change_date = ?
      `, [userId, currentDate]);
      
      // 插入新的变化数据
      for (const change of changes) {
        await pool.execute(`
          INSERT INTO trend_changes (
            user_id, change_date, change_type, change_value, change_percentage
          ) VALUES (?, ?, ?, ?, ?)
        `, [userId, currentDate, change.type, change.value, change.percentage]);
      }
      
    } catch (error) {
      console.error('计算趋势变化失败:', error);
    }
  }
  
  // 获取用户趋势数据
  static async getUserTrends(userId, days = 7) {
    try {
      const [trends] = await pool.execute(`
        SELECT 
          trend_date,
          total_files,
          total_size,
          image_count,
          image_size,
          video_count,
          video_size,
          folder_count,
          other_files,
          other_size
        FROM user_trends 
        WHERE user_id = ? 
        ORDER BY trend_date DESC 
        LIMIT ${parseInt(days)}
      `, [userId]);
      
      // 获取最新的变化数据
      const [changes] = await pool.execute(`
        SELECT 
          change_type,
          change_value,
          change_percentage
        FROM trend_changes 
        WHERE user_id = ? 
        AND change_date = (
          SELECT MAX(change_date) FROM trend_changes WHERE user_id = ?
        )
      `, [userId, userId]);
      
      // 组织变化数据
      const changeMap = {};
      changes.forEach(change => {
        changeMap[change.change_type] = {
          value: change.change_value,
          percentage: change.change_percentage
        };
      });
      
      return {
        success: true,
        data: {
          trends: trends.reverse(), // 按时间正序排列
          changes: changeMap
        }
      };
    } catch (error) {
      console.error('获取用户趋势数据失败:', error);
      // 返回默认数据而不是抛出错误
      return {
        success: true,
        data: {
          trends: [],
          changes: {
            files: { value: 0, percentage: 0 },
            size: { value: 0, percentage: 0 },
            images: { value: 0, percentage: 0 },
            videos: { value: 0, percentage: 0 },
            folders: { value: 0, percentage: 0 }
          }
        }
      };
    }
  }
  
  // 为所有用户收集趋势数据
  static async collectAllUsersTrends() {
    try {
      const [users] = await pool.execute('SELECT id FROM users');
      
      for (const user of users) {
        await this.collectUserTrends(user.id);
      }
      
      console.log(`已为 ${users.length} 个用户收集趋势数据`);
    } catch (error) {
      console.error('批量收集用户趋势数据失败:', error);
    }
  }
}

module.exports = TrendService;
