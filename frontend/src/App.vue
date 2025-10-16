<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 初始化时检查登录状态
  authStore.checkAuth()
})
</script>

<style lang="scss">
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f5f7fa;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background: #f5f7fa;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #a8a8a8;
  }
}

// Element Plus 样式覆盖
.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.el-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.el-input__wrapper {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
  
  &.is-focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
}

.el-select .el-input__wrapper {
  border-radius: 8px;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-dialog__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 24px;
  
  .el-dialog__title {
    font-weight: 600;
    color: #2c3e50;
  }
}

.el-dialog__body {
  padding: 24px;
}

.el-dialog__footer {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.el-message-box {
  border-radius: 12px;
  overflow: hidden;
}

.el-message-box__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 24px;
  
  .el-message-box__title {
    font-weight: 600;
    color: #2c3e50;
  }
}

.el-message-box__content {
  padding: 24px;
}

.el-message-box__btns {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

// 动画类
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease;
}

.scale-enter-from {
  transform: scale(0.9);
}

.scale-leave-to {
  transform: scale(0.9);
}

// 工具类
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-8 {
  gap: 8px;
}

.gap-12 {
  gap: 12px;
}

.gap-16 {
  gap: 16px;
}

.gap-20 {
  gap: 20px;
}

.gap-24 {
  gap: 24px;
}

.mb-8 {
  margin-bottom: 8px;
}

.mb-12 {
  margin-bottom: 12px;
}

.mb-16 {
  margin-bottom: 16px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mb-24 {
  margin-bottom: 24px;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12 {
  margin-top: 12px;
}

.mt-16 {
  margin-top: 16px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-24 {
  margin-top: 24px;
}

.p-8 {
  padding: 8px;
}

.p-12 {
  padding: 12px;
}

.p-16 {
  padding: 16px;
}

.p-20 {
  padding: 20px;
}

.p-24 {
  padding: 24px;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.rounded {
  border-radius: 8px;
}

.rounded-lg {
  border-radius: 12px;
}

.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// 响应式工具类
@media (max-width: 768px) {
  .mobile-hidden {
    display: none !important;
  }
  
  .mobile-full {
    width: 100% !important;
  }
  
  .mobile-center {
    text-align: center !important;
  }
}

@media (max-width: 480px) {
  .mobile-sm-hidden {
    display: none !important;
  }
  
  .mobile-sm-full {
    width: 100% !important;
  }
}
</style>
