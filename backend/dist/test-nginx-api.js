// 测试Nginx配置API是否可用
console.log('=== 测试Nginx配置API ===');

// 1. 测试健康检查
fetch('https://tukubackend.vtart.cn/api/health')
  .then(response => {
    console.log('健康检查状态:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('健康检查结果:', data);
  })
  .catch(error => {
    console.error('健康检查失败:', error);
  });

// 2. 测试Nginx配置状态
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  fetch('https://tukubackend.vtart.cn/api/nginx-config/status', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => {
    console.log('Nginx配置状态响应:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Nginx配置状态结果:', data);
  })
  .catch(error => {
    console.error('Nginx配置状态失败:', error);
  });
} else {
  console.log('未找到认证token，请先登录');
}

// 3. 测试系统设置
fetch('https://tukubackend.vtart.cn/api/system/info')
  .then(response => {
    console.log('系统信息状态:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('系统信息结果:', data);
  })
  .catch(error => {
    console.error('系统信息失败:', error);
  });

console.log('=== 测试完成 ===');
