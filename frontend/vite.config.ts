import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://backend:3000',  // This is correct for docker internal networking
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api prefix when forwarding
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
