import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // face-sign backend
      '/api/dashboard': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // serve-backend (auth, orgs, users, billing)
      '/api': {
        target: 'http://localhost:51619',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/serve-api/, '/api'),
      },
    },
  },
})
