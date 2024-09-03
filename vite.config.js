import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './build',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        v2: path.resolve(__dirname, 'v2/index.html')
      },
    }
  },
  plugins: [vue()],
  resolve: {
    alias: { // Resolve html sanitizer paths
      'source-map-js': path.resolve('jsconfig.json'),
      'path': path.resolve('jsconfig.json'),
      'url': path.resolve('jsconfig.json'),
      'fs': path.resolve('jsconfig.json')
    }
  },
  server: {
    hmr: false, // Disable hot reload on save
  }
})
