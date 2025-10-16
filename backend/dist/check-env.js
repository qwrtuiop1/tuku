#!/usr/bin/env node

// 环境变量检查脚本
require('dotenv').config();

console.log('🔍 检查环境变量配置...\n');

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT',
  'NODE_ENV'
];

let hasErrors = false;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: 未设置`);
    hasErrors = true;
  } else if (envVar === 'JWT_SECRET' && value === 'your_jwt_secret_key_here') {
    console.log(`❌ ${envVar}: 使用默认占位符值`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar}: 已设置`);
  }
});

console.log('\n📋 当前配置:');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '***已设置***' : '未设置'}`);
console.log(`DB_HOST: ${process.env.DB_HOST || '未设置'}`);
console.log(`DB_USER: ${process.env.DB_USER || '未设置'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || '未设置'}`);
console.log(`PORT: ${process.env.PORT || '3000'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

if (hasErrors) {
  console.log('\n❌ 环境变量配置有问题！');
  console.log('请检查 .env 文件或环境变量设置');
  process.exit(1);
} else {
  console.log('\n✅ 环境变量配置正常！');
  process.exit(0);
}
