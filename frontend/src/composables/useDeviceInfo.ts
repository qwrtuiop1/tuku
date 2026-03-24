/**
 * 设备信息检测 composable
 * 立即在组件初始化时获取，无需等待 onMounted
 */
export const useDeviceInfo = () => {
  const ua = navigator.userAgent

  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(ua)
  const isWechat = /MicroMessenger/i.test(ua)
  const isQQ = /QQ\//i.test(ua)
  const isChrome = /Chrome\/\d/i.test(ua)
  const isSafari = /Safari\/\d/i.test(ua) && !isChrome

  const isAndroidChrome = isAndroid && isChrome
  const isAndroidQQ = isAndroid && isQQ
  const isAndroidWechat = isAndroid && isWechat

  /**
   * 获取设备简短标识（用于日志/调试）
   */
  const deviceLabel = (() => {
    if (isAndroidQQ) return 'Android QQ'
    if (isAndroidWechat) return 'Android Wechat'
    if (isAndroidChrome) return 'Android Chrome'
    if (isAndroid) return 'Android'
    if (isIOS) return 'iOS'
    return 'Desktop'
  })()

  /**
   * 根据设备类型返回最优的 accept 属性
   * 解决 Android 系统相册默认过滤 GIF 的问题
   */
  const getOptimalAccept = () => {
    if (isIOS) {
      return 'image/*,image/heic,image/heif,video/*,video/quicktime'
    }
    // Android：显式添加 image/gif，避免系统相册默认过滤
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff']
    const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.3gp', '.m4v']
    const mimes = [
      'image/*',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
      'video/*',
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ]
    const exts = [...imageExts, ...videoExts]
    return [...mimes, ...exts].join(',')
  }

  /**
   * 获取系统原生 picker 是否支持 showOpenFilePicker
   * Chrome 86+ / Edge 86+ / Opera 72+ 支持（桌面/Android均可）
   */
  const supportsFileSystemAccess = 'showOpenFilePicker' in window

  /**
   * capture 属性：控制调起哪个系统组件
   * - 'environment'：后置摄像头
   * - 'user'：前置摄像头
   * - 不设置：相册选择器
   * Android 上不设置 capture 或设为 'gallery' 可强制走相册（减少GIF过滤问题）
   */
  const getCaptureAttr = () => {
    if (isAndroid) return 'implementation="filesystem"' // 仅作提示，真实行为由 accept 控制
    return undefined
  }

  return {
    ua,
    isIOS,
    isAndroid,
    isMobile,
    isWechat,
    isQQ,
    isChrome,
    isSafari,
    isAndroidChrome,
    isAndroidQQ,
    isAndroidWechat,
    deviceLabel,
    getOptimalAccept,
    supportsFileSystemAccess,
    getCaptureAttr,
  }
}
