const axios = require('axios');

async function testSettingsAPI() {
  try {
    console.log('🔧 开始测试设置API...');
    
    // 先测试获取设置
    console.log('📥 测试获取设置...');
    const getResponse = await axios.get('http://localhost:3000/api/admin/settings', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoienlsIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM1NzQ4MjQ5LCJleHAiOjE3MzU3NTE4NDl9.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
      }
    });
    console.log('✅ 获取设置成功:', getResponse.data);
    
    // 测试保存设置
    console.log('📤 测试保存安全设置...');
    const settings = {
      min_password_length: '8',
      enable_login_lock: 'true',
      max_login_attempts: '5',
      lockout_duration: '15',
      session_timeout: '120'
    };
    
    const putResponse = await axios.put('http://localhost:3000/api/admin/settings', {
      settings: settings
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoienlsIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM1NzQ4MjQ5LCJleHAiOjE3MzU3NTE4NDl9.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
      }
    });
    console.log('✅ 保存设置成功:', putResponse.data);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('❌ 响应状态:', error.response.status);
      console.error('❌ 响应数据:', error.response.data);
    }
  }
}

testSettingsAPI();
