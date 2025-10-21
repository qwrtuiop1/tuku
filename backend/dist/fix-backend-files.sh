#!/bin/bash

echo "🔧 开始修复后端文件..."

# 进入后端目录
cd /www/wwwroot/tuku/backend/dist

# 备份原文件
echo "📋 备份原文件..."
cp src/services/databaseInitService.js src/services/databaseInitService.js.backup
cp src/services/nginxConfigService.js src/services/nginxConfigService.js.backup

# 修复 databaseInitService.js
echo "🔧 修复 databaseInitService.js..."
sed -i "s/const pool = require('..\/config\/database');/const { pool } = require('..\/config\/database');/" src/services/databaseInitService.js

# 添加 enhance_notification_settings.sql 到初始化脚本列表
sed -i "s/'fix_notification_frequency.sql'/'enhance_notification_settings.sql',\n      'fix_notification_frequency.sql'/" src/services/databaseInitService.js

# 添加 enhance_notification_settings.sql 的检查逻辑
cat > /tmp/db_init_fix.js << 'EOF'
const fs = require('fs');

// 读取文件
let content = fs.readFileSync('src/services/databaseInitService.js', 'utf8');

// 替换检查逻辑
const oldCheck = `        // 检查是否已经执行过（通过检查特定记录）
        if (scriptName === 'fix_notification_frequency.sql') {`;

const newCheck = `        // 检查是否已经执行过（通过检查特定记录）
        if (scriptName === 'enhance_notification_settings.sql') {
          // 检查 notification_history 表是否存在
          try {
            await pool.execute('SELECT 1 FROM notification_history LIMIT 1');
            console.log(\`✅ 脚本 \${scriptName} 已执行过（notification_history 表存在），跳过\`);
            continue;
          } catch (error) {
            console.log(\`📋 脚本 \${scriptName} 需要执行（notification_history 表不存在）\`);
          }
        } else if (scriptName === 'fix_notification_frequency.sql') {`;

content = content.replace(oldCheck, newCheck);

// 写回文件
fs.writeFileSync('src/services/databaseInitService.js', content);
console.log('✅ databaseInitService.js 修复完成');
EOF

node /tmp/db_init_fix.js

# 修复 nginxConfigService.js
echo "🔧 修复 nginxConfigService.js..."
cat > /tmp/nginx_fix.js << 'EOF'
const fs = require('fs');

// 读取文件
let content = fs.readFileSync('src/services/nginxConfigService.js', 'utf8');

// 添加 null 检查
const oldCode = `      const currentLimitGB = await this.getCurrentFileSizeLimit();
      const config = await this.readNginxConfig();
      
      // 检查当前配置中的限制`;

const newCode = `      const currentLimitGB = await this.getCurrentFileSizeLimit();
      const config = await this.readNginxConfig();
      
      // 如果配置文件不存在或无法读取，跳过更新
      if (!config) {
        console.log('Nginx配置文件不存在或无法读取，跳过配置更新');
        return false;
      }
      
      // 检查当前配置中的限制`;

content = content.replace(oldCode, newCode);

// 写回文件
fs.writeFileSync('src/services/nginxConfigService.js', content);
console.log('✅ nginxConfigService.js 修复完成');
EOF

node /tmp/nginx_fix.js

# 清理临时文件
rm -f /tmp/db_init_fix.js /tmp/nginx_fix.js

echo "✅ 所有文件修复完成！"
echo "📋 修复内容："
echo "  1. 修复了数据库连接问题 (const { pool })"
echo "  2. 添加了 enhance_notification_settings.sql 到初始化脚本"
echo "  3. 添加了 notification_history 表检查逻辑"
echo "  4. 添加了 Nginx 配置 null 检查"

echo "🚀 现在可以重新启动服务："
echo "  pkill -f 'node src/app.js'"
echo "  nohup npm start > backend.log 2>&1 &"

