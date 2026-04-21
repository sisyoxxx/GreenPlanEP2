import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = process.env.VITE_API_TARGET || env.VITE_API_TARGET || 'http://localhost:8081'
  const port = Number(process.env.VITE_PORT || env.VITE_PORT || 5175)

  return {
    plugins: [
      VueDevTools(),
      vue()
    ],
    server: {
      port,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          configure: (proxy) => {
            // Avoid backend CORS rejections in dev when Spring's CORS is configured
            // with a fixed allow-list and Vite picks another port (5173/5176/...).
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin')
            })
          }
        }
      }
    }
  }
})
