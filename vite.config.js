import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 9567,
    proxy: {
      '/api': {
        target: 'http://localhost:1988',
        changeOrigin: true,
        secure: false,        // 如果是 https 可能需要這個
        ws: true,            // 如果有 websocket 需要這個
        credentials: true    // 允許攜帶認證信息
      }
    }
  }
})