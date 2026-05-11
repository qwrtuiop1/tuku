<template>
  <div class="help-center-page">
    <div class="page-header">
      <h1 class="page-title">帮助中心</h1>
      <p class="page-subtitle">常见问题与使用指南</p>
    </div>

    <div class="help-content">
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item title="如何上传文件？" name="upload">
          <div class="help-answer">
            <p>上传文件非常简单：</p>
            <ol>
              <li>在左侧菜单点击"文件管理"进入文件页面</li>
              <li>点击页面左上角的"上传"按钮</li>
              <li>选择要上传的图片或视频文件</li>
              <li>等待上传完成，系统会自动生成缩略图</li>
            </ol>
            <p class="tip">支持的文件格式：图片（jpg、png、gif、webp等），视频（mp4、mov、webm等）</p>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何创建文件夹？" name="folder">
          <div class="help-answer">
            <p>整理您的文件：</p>
            <ol>
              <li>在文件管理页面，点击"新建"按钮</li>
              <li>输入文件夹名称</li>
              <li>点击确认即可创建文件夹</li>
              <li>在当前目录下点击新建的文件夹即可进入</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何分享文件？" name="share">
          <div class="help-answer">
            <p>分享您的文件给他人：</p>
            <ol>
              <li>打开文件预览（点击文件缩略图）</li>
              <li>在右侧详情面板点击"分享"按钮</li>
              <li>系统会生成一个分享链接</li>
              <li>复制链接发送给需要的人即可</li>
            </ol>
            <p class="tip">分享链接包含访问令牌，收到链接的人可以直接查看和下载文件</p>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何使用标签分类？" name="tags">
          <div class="help-answer">
            <p>标签帮助您更好地整理文件：</p>
            <ol>
              <li>打开左侧菜单中的"标签管理"</li>
              <li>创建新的标签（如"工作"、"旅行"、"家庭"等）</li>
              <li>为标签选择不同的颜色方便区分</li>
              <li>在文件管理中，点击文件右键菜单选择"添加标签"</li>
              <li>点击标签即可筛选出所有相关文件</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何创建相册？" name="albums">
          <div class="help-answer">
            <p>相册是整理同类照片的好方法：</p>
            <ol>
              <li>在左侧菜单点击"我的相册"</li>
              <li>点击"新建相册"按钮</li>
              <li>输入相册名称和描述（可选）</li>
              <li>创建完成后，点击相册进入</li>
              <li>使用"添加文件"按钮将照片加入相册</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="回收站是什么？如何使用？" name="recycle">
          <div class="help-answer">
            <p>回收站保护您的文件不被误删：</p>
            <ol>
              <li>删除的文件不会立即消失，而是进入回收站</li>
              <li>默认保留30天，之后自动清理</li>
              <li>可以在回收站中恢复误删的文件</li>
              <li>也可以手动彻底删除不再需要的文件</li>
            </ol>
            <p class="tip">可在"个人设置"中修改回收站保留时间（7天/15天/30天/60天/永久）</p>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何批量下载文件？" name="download">
          <div class="help-answer">
            <p>一次下载多个文件：</p>
            <ol>
              <li>在文件管理页面，按住Ctrl键点击多个文件进行选择</li>
              <li>或者使用Shift键进行范围选择</li>
              <li>选中后点击工具栏中的"批量下载"按钮</li>
              <li>系统会将所有选中的文件打包为zip进行下载</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="忘记了密码怎么办？" name="password">
          <div class="help-answer">
            <p>重置密码步骤：</p>
            <ol>
              <li>在登录页面点击"忘记密码"</li>
              <li>输入您的注册邮箱地址</li>
              <li>系统会发送一封重置密码的邮件</li>
              <li>点击邮件中的链接，按照指示设置新密码</li>
            </ol>
            <p class="tip">如果没有收到邮件，请检查垃圾邮件文件夹</p>
          </div>
        </el-collapse-item>

        <el-collapse-item title="如何修改头像？" name="avatar">
          <div class="help-answer">
            <p>个性化您的账户：</p>
            <ol>
              <li>点击右上角的用户头像或名称</li>
              <li>在下拉菜单中选择"个人资料"</li>
              <li>点击头像上的相机图标</li>
              <li>选择新头像图片上传即可</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="存储空间不足怎么办？" name="storage">
          <div class="help-answer">
            <p>管理您的存储空间：</p>
            <ol>
              <li>在右上角可以看到当前存储使用量</li>
              <li>清理不需要的文件（删除后会进入回收站）</li>
              <li>清空回收站可以彻底释放空间</li>
              <li>如需更多空间，请联系管理员</li>
            </ol>
            <p class="tip">定期清理回收站可以释放大量空间</p>
          </div>
        </el-collapse-item>

        <el-collapse-item title="图片可以旋转吗？" name="rotate">
          <div class="help-answer">
            <p>是的，支持图片旋转：</p>
            <ol>
              <li>打开图片预览</li>
              <li>在图片下方的工具栏中点击旋转按钮（向左或向右）</li>
              <li>预览会实时显示旋转效果</li>
              <li>点击"保存"按钮将旋转保存到原文件</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item title="全局搜索怎么用？" name="search">
          <div class="help-answer">
            <p>快速找到您想要的文件：</p>
            <ol>
              <li>在文件管理页面顶部的搜索框中输入关键词</li>
              <li>支持按文件名搜索</li>
              <li>可以筛选文件类型（图片/视频）</li>
              <li>可以按上传日期范围筛选</li>
              <li>支持按名称、时间、大小排序</li>
            </ol>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref('upload')
</script>

<style lang="scss" scoped>
.help-center-page {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px;
  }

  .page-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
}

.help-content {
  :deep(.el-collapse-item__header) {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
  }

  :deep(.el-collapse-item__content) {
    padding-top: 12px;
  }
}

.help-answer {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;

  p {
    margin: 0 0 8px;
  }

  ol {
    margin: 0 0 12px;
    padding-left: 20px;

    li {
      margin-bottom: 4px;
    }
  }

  .tip {
    background: #f0f9ff;
    border-left: 3px solid #409eff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    color: #1e40af;
  }
}
</style>
