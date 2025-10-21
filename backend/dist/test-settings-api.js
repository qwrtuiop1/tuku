const axios = require('axios');

// API配置
const API_BASE_URL = 'https://tukubackend.vtart.cn/api';

async function testSettingsAPI() {
  try {
    console.log('🔍 测试设置API...');
    
    // 测试获取设置API
    const response = await axios.get(`${API_BASE_URL}/admin/settings`);
    
    if (response.data.success) {
      console.log('✅ API调用成功');
      const settings = response.data.settings;
      
      console.log('\n📋 通知相关设置:');
      
      // 检查通知频率设置
      console.log('📧 邮件通知频率:', settings.email_frequency?.value || '未设置');
      console.log('🔔 系统通知频率:', settings.system_frequency?.value || '未设置');
      
      // 检查其他通知设置
      console.log('📬 启用邮件通知:', settings.enable_email_notification?.value || '未设置');
      console.log('🔔 启用系统通知:', settings.enable_system_notification?.value || '未设置');
      console.log('📅 通知保留天数:', settings.notification_retention_days?.value || '未设置');
      
      // 检查用户通知偏好设置
      console.log('\n👤 用户通知偏好设置:');
      console.log('🔐 登录通知:', settings.enable_login_notification?.value || '未设置');
      console.log('📤 上传通知:', settings.enable_upload_notification?.value || '未设置');
      console.log('⚠️ 存储警告:', settings.enable_storage_warning?.value || '未设置');
      console.log('🛡️ 安全提醒:', settings.enable_security_alert?.value || '未设置');
      console.log('🔧 维护通知:', settings.enable_maintenance_notification?.value || '未设置');
      
      // 显示所有设置键
      console.log('\n📝 所有设置键:');
      Object.keys(settings).forEach(key => {
        if (key.includes('notification') || key.includes('frequency') || key.includes('email') || key.includes('system')) {
          console.log(`  ${key}: ${settings[key]?.value || '未设置'}`);
        }
      });
      
    } else {
      console.log('❌ API调用失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 执行测试
testSettingsAPI().catch(console.error);

