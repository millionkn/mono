import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/template-admin/',
  resolve: {
    alias: {
      '@src': '/src',
    }
  },
  server: {
    port: 4000,
    host: true,
    proxy: {
      '/template-admin/api': {
        target: 'http://localhost:3000',
        ws: true,
        rewrite: (path) => path.replace(/^\/template-admin\/api/, '')
      }
    }
  },
})
