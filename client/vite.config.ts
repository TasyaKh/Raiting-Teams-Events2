import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
        // '/api': "http://localhost:3000"
    //  '/api': "http://rating-teams-events.ovz1.j37315531.m1yvm.vps.myjino.ru"
     '/api': "https://d61dfe40ebfa.vps.myjino.ru"
    }
  }
})
