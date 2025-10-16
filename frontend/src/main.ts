import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import './styles/index.scss'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  // 过滤掉第三方扩展的错误
  if (err instanceof Error) {
    const errorMessage = err.message.toLowerCase()
    const errorStack = err.stack?.toLowerCase() || ''
    
    // 扩展错误过滤列表
    const thirdPartyPatterns = [
      'apm', 'extension', 'content_script', 'blockui',
      'volcano.zuoyebang.com', 'apmplus', 'monitor_web',
      'v[w] is not a function', 'chrome-extension',
      'moz-extension', 'safari-extension'
    ]
    
    if (thirdPartyPatterns.some(pattern => 
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    )) {
      return // 忽略第三方扩展错误
    }
  }
  
  // 显示用户友好的错误信息
  if (typeof err === 'string') {
  } else if (err instanceof Error) {
  }
}

// 全局未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  
  // 过滤掉第三方扩展的错误
  if (reason && typeof reason === 'string') {
    const errorMessage = reason.toLowerCase()
    const thirdPartyPatterns = [
      'apm', 'extension', 'content_script', 'blockui',
      'volcano.zuoyebang.com', 'apmplus', 'monitor_web',
      'chrome-extension', 'moz-extension', 'safari-extension'
    ]
    
    if (thirdPartyPatterns.some(pattern => errorMessage.includes(pattern))) {
      event.preventDefault() // 阻止错误显示
      return
    }
  }
  
  // 阻止默认的错误处理
  event.preventDefault()
})

// 全局控制台错误过滤
const originalConsoleError = console.error
console.error = (...args) => {
  const message = args.join(' ').toLowerCase()
  
  // 过滤第三方扩展错误
  const thirdPartyPatterns = [
    'apm', 'extension', 'content_script', 'blockui',
    'volcano.zuoyebang.com', 'apmplus', 'monitor_web',
    'v[w] is not a function', 'chrome-extension',
    'moz-extension', 'safari-extension', 'net::err_connection_closed'
  ]
  
  if (thirdPartyPatterns.some(pattern => message.includes(pattern))) {
    return // 不显示第三方错误
  }
  
  originalConsoleError.apply(console, args)
}

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')




