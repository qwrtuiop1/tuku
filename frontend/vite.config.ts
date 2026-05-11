import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// PWA 支持（需要先运行 npm install 安装 vite-plugin-pwa）
// 安装后取消下面注释即可启用
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          'element-plus': [
            'ElMessage',
            'ElMessageBox',
            'ElNotification',
            'ElLoading'
          ]
        }
      ],
      dts: resolve(__dirname, 'src/typings/auto-imports.d.ts')
    }),
    Components({
      resolvers: [ElementPlusResolver({ resolveIcons: true })],
      dts: resolve(__dirname, 'src/typings/components.d.ts')
    }),
    // PWA 配置（安装 vite-plugin-pwa 后取消注释）
    // VitePWA({ registerType: 'autoUpdate', manifest: false, workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'], runtimeCaching: [...] } })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 开发环境指向远程服务器
        target: 'https://tukubackend.vtart.cn',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          virtualScroller: ['vue-virtual-scroller']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue-virtual-scroller']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})

