// 诊断脚本 - 检查后端通知设置API
const axios = require('axios');

const API_BASE_URL = 'https://tukubackend.vtart.cn/api';

async function diagnoseNotificationSettings() {
  console.log('🔍 开始诊断通知设置问题...\n');
  
  try {
    // 1. 检查后端连接
    console.log('1️⃣ 检查后端连接...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ 后端连接正常');
    } catch (error) {
      console.log('❌ 后端连接失败:', error.message);
      return;
    }
    
    // 2. 检查系统设置API（需要管理员权限）
    console.log('\n2️⃣ 检查系统设置API...');
    try {
      // 这里需要管理员token，我们先检查API是否存在
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token' // 测试用token
        }
      });
      console.log('✅ 系统设置API可访问');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 系统设置API存在（需要认证）');
      } else {
        console.log('❌ 系统设置API问题:', error.response?.status, error.message);
      }
    }
    
    // 3. 检查数据库字段（通过API间接检查）
    console.log('\n3️⃣ 检查通知设置字段...');
    console.log('📋 需要检查的字段:');
    console.log('   - email_frequency');
    console.log('   - system_frequency');
    console.log('   - enable_login_notification');
    console.log('   - enable_upload_notification');
    console.log('   - enable_storage_warning');
    console.log('   - enable_security_alert');
    console.log('   - enable_maintenance_notification');
    
    console.log('\n🔧 建议的解决方案:');
    console.log('1. 确保后端已部署最新版本（包含databaseInitService.js）');
    console.log('2. 重启后端服务');
    console.log('3. 检查后端启动日志，确认数据库初始化成功');
    console.log('4. 手动执行SQL脚本（如果自动初始化失败）');
    
    console.log('\n📝 手动执行SQL脚本:');
    console.log(`
USE tuku;
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('email_frequency', 'realtime', '邮件通知频率'),
('system_frequency', 'realtime', '系统通知频率'),
('enable_login_notification', 'true', '是否启用登录通知'),
('enable_upload_notification', 'true', '是否启用文件上传通知'),
('enable_storage_warning', 'true', '是否启用存储空间警告'),
('enable_security_alert', 'true', '是否启用安全提醒'),
('enable_maintenance_notification', 'true', '是否启用系统维护通知');
    `);
    
  } catch (error) {
    console.error('❌ 诊断过程中出错:', error.message);
  }
}

// 运行诊断
diagnoseNotificationSettings();
