// 800MB视频上传问题诊断脚本
// 在浏览器控制台运行此脚本

console.log('=== 开始诊断800MB视频上传问题 ===');

// 1. 测试CORS
console.log('\n1. 测试CORS...');
fetch('https://tukubackend.vtart.cn/api/cors-test')
  .then(response => {
    console.log('CORS测试响应状态:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('CORS测试成功:', data);
  })
  .catch(error => {
    console.error('CORS测试失败:', error);
  });

// 2. 测试健康检查
console.log('\n2. 测试健康检查...');
fetch('https://tukubackend.vtart.cn/api/health')
  .then(response => {
    console.log('健康检查响应状态:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('健康检查成功:', data);
  })
  .catch(error => {
    console.error('健康检查失败:', error);
  });

// 3. 测试文件上传配置
console.log('\n3. 测试文件上传配置...');
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  fetch('https://tukubackend.vtart.cn/api/files/test-config', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => {
    console.log('配置测试响应状态:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('配置测试成功:', data);
  })
  .catch(error => {
    console.error('配置测试失败:', error);
  });
} else {
  console.log('未找到认证token，跳过配置测试');
}

// 4. 测试文件上传端点
console.log('\n4. 测试文件上传端点...');
fetch('https://tukubackend.vtart.cn/api/upload-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({test: 'data'})
})
.then(response => {
  console.log('上传测试响应状态:', response.status);
  return response.json();
})
.then(data => {
  console.log('上传测试成功:', data);
})
.catch(error => {
  console.error('上传测试失败:', error);
});

// 5. 检查网络信息
console.log('\n5. 网络信息:');
console.log('当前域名:', window.location.hostname);
console.log('当前协议:', window.location.protocol);
console.log('用户代理:', navigator.userAgent);

console.log('\n=== 诊断完成 ===');
console.log('请查看上述测试结果，确定问题所在');
