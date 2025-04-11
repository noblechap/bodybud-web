import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import crypto from 'crypto-browserify'

export default defineConfig({
  plugins: [vue()],
  base: '/bodybud-web/',
  resolve: {
    alias: {
      crypto: 'crypto-browserify',  
    },
  },
})
