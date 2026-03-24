const NginxConfigManager = require('./nginxConfigService');

/**
 * Nginx配置自动更新服务
 * 定期检查系统设置变化并自动更新Nginx配置
 */
class NginxAutoUpdateService {
  constructor() {
    this.nginxManager = new NginxConfigManager();
    this.checkInterval = 5 * 60 * 1000; // 5分钟检查一次
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * 启动自动更新服务
   */
  start() {
    if (this.isRunning) {
      console.log('Nginx自动更新服务已在运行');
      return;
    }

    console.log('启动Nginx自动更新服务...');
    this.isRunning = true;

    // 立即执行一次检查
    this.checkAndUpdate();

    // 设置定时检查
    this.intervalId = setInterval(() => {
      this.checkAndUpdate();
    }, this.checkInterval);

    console.log(`Nginx自动更新服务已启动，检查间隔: ${this.checkInterval / 1000}秒`);
  }

  /**
   * 停止自动更新服务
   */
  stop() {
    if (!this.isRunning) {
      console.log('Nginx自动更新服务未运行');
      return;
    }

    console.log('停止Nginx自动更新服务...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Nginx自动更新服务已停止');
  }

  /**
   * 检查并更新配置
   */
  async checkAndUpdate() {
    try {
      console.log('检查Nginx配置是否需要更新...');
      const updated = await this.nginxManager.checkAndUpdateConfig();
      
      if (updated) {
        console.log('✅ Nginx配置已自动更新');
      } else {
        console.log('ℹ️ Nginx配置无需更新');
      }
    } catch (error) {
      console.error('❌ Nginx配置自动更新失败:', error);
    }
  }

  /**
   * 手动触发检查
   */
  async manualCheck() {
    console.log('手动触发Nginx配置检查...');
    await this.checkAndUpdate();
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * 设置检查间隔
   */
  setCheckInterval(intervalMs) {
    if (intervalMs < 60000) { // 最小1分钟
      throw new Error('检查间隔不能少于1分钟');
    }

    this.checkInterval = intervalMs;

    if (this.isRunning) {
      this.stop();
      this.start();
    }

    console.log(`Nginx检查间隔已更新为: ${intervalMs / 1000}秒`);
  }
}

// 创建全局实例
const nginxAutoUpdateService = new NginxAutoUpdateService();

module.exports = nginxAutoUpdateService;
