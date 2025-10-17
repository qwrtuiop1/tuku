#!/bin/bash

# 存储路径迁移脚本
# 将storage文件夹从backend/dist/storage移动到backend/storage

echo "🚀 开始迁移存储路径..."

# 设置路径变量
OLD_STORAGE_PATH="/www/wwwroot/tuku/backend/dist/storage"
NEW_STORAGE_PATH="/www/wwwroot/tuku/backend/storage"

# 检查旧路径是否存在
if [ ! -d "$OLD_STORAGE_PATH" ]; then
    echo "❌ 旧存储路径不存在: $OLD_STORAGE_PATH"
    echo "请检查路径是否正确"
    exit 1
fi

# 检查新路径是否已存在
if [ -d "$NEW_STORAGE_PATH" ]; then
    echo "⚠️  新存储路径已存在: $NEW_STORAGE_PATH"
    echo "是否要覆盖现有目录? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ 操作已取消"
        exit 1
    fi
    echo "🗑️  删除现有目录..."
    rm -rf "$NEW_STORAGE_PATH"
fi

# 创建新目录
echo "📁 创建新存储目录..."
mkdir -p "$NEW_STORAGE_PATH"

# 移动文件
echo "📦 移动存储文件..."
mv "$OLD_STORAGE_PATH"/* "$NEW_STORAGE_PATH/" 2>/dev/null || true

# 检查移动结果
if [ -d "$NEW_STORAGE_PATH" ] && [ "$(ls -A "$NEW_STORAGE_PATH" 2>/dev/null)" ]; then
    echo "✅ 存储文件移动成功"
    
    # 显示新目录内容
    echo "📋 新存储目录内容:"
    ls -la "$NEW_STORAGE_PATH"
    
    # 设置权限
    echo "🔐 设置目录权限..."
    chown -R www:www "$NEW_STORAGE_PATH"
    chmod -R 755 "$NEW_STORAGE_PATH"
    
    echo "✅ 权限设置完成"
    
    # 询问是否删除旧目录
    echo "🗑️  是否删除旧存储目录? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$OLD_STORAGE_PATH"
        echo "✅ 旧存储目录已删除"
    else
        echo "ℹ️  旧存储目录保留: $OLD_STORAGE_PATH"
    fi
    
else
    echo "❌ 存储文件移动失败"
    exit 1
fi

echo "🎉 存储路径迁移完成!"
echo "新存储路径: $NEW_STORAGE_PATH"
echo ""
echo "📝 下一步操作:"
echo "1. 更新环境变量 UPLOAD_PATH=/www/wwwroot/tuku/backend/storage"
echo "2. 执行数据库迁移脚本: migrate_storage_path.sql"
echo "3. 重启后端服务"
