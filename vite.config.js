import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './build',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        v1: path.resolve(__dirname, 'v1/index.html'),
        v2: path.resolve(__dirname, 'v2/index.html')
      },
      treeshake: false
    }
  },
  css: {
    preprocessorOptions : {
      scss: {
        api: "modern",
      }        
    } 
  },
  plugins: [
    topLevelAwait(),
    vue(),
    wasm()
  ],
  resolve: {
    alias: { // Resolve html sanitizer paths
      'source-map-js': path.resolve('jsconfig.json'),
      'path': path.resolve('jsconfig.json'),
      'url': path.resolve('jsconfig.json'),
      'fs': path.resolve('jsconfig.json')
    }
  },
  server: {
    hmr: false, // Disable hot reload on save,
  }
})
