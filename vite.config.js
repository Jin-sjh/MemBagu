import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Supabase 独立分片，仅在登录/同步时加载
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // highlight.js 独立分片，仅在查看题目详情时加载
          if (id.includes('node_modules/highlight.js')) {
            return 'vendor-highlight'
          }
          // marked 独立分片
          if (id.includes('node_modules/marked')) {
            return 'vendor-marked'
          }
          // Vue 相关库独立分片（可以被浏览器缓存复用）
          if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
            return 'vendor-vue'
          }
        }
      }
    }
  }
})
