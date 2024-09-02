import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: false, // Disable hot reload on save
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
  base: './',
    build: {
      outDir: './build',
      emptyOutDir: true
    }
  }
)
