import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        v1: path.resolve(__dirname, 'v1/index.html'),
        v2: path.resolve(__dirname, 'v2/index.html')
      },
      treeshake: true // was false for Rapier.js build
    },
    target: "es2022"
  },
  css: {
    preprocessorOptions : {
      scss: {
        api: "modern",
      }        
    } 
  },
  plugins: [
    vue(),
    wasm()
  ],
  resolve: {
    alias: [
      { find: 'source-map-js', replacement: path.resolve('jsconfig.json') },
      { find: 'path', replacement: path.resolve('jsconfig.json') },
      { find: 'url', replacement: path.resolve('jsconfig.json') },
      { find: 'fs', replacement: path.resolve('jsconfig.json') }
    ]
  },
  server: {
    hmr: false, // Disable hot reload on save,
  }
})
