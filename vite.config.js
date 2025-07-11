import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // alias '@' wskazuje na folder 'src'
      '@': path.resolve(__dirname, 'src'),
    },
  },
})