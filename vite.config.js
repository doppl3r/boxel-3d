import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: false, // Disable hot reload on save
  },
  plugins: [vue()],
  base: './',
    build: {
        emptyOutDir: true
    }
  }
)
