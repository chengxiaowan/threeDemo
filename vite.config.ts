import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  build:{
    emptyOutDir: false,
  },
  server:{
    host:"0.0.0.0",
    port:3001,
    proxy: {
      '/ajax': 'http://localhost:7336',
    },
  }
})
