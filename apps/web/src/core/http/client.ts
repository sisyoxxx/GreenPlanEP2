import axios from 'axios'
import { useAuthStore } from '../auth/useAuthStore'

export const http = axios.create({
  // Use same-origin requests by default. In dev, Vite proxy will forward `/api`
  // to the backend. In production/preview, you can override via `VITE_API_BASE_URL`.
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || ''),
  timeout: 10000
})

http.interceptors.request.use((config) => {
  // Skip ngrok browser warning page (free tier) during demo deployments
  config.headers['ngrok-skip-browser-warning'] = '1'
  const store = useAuthStore()
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    // 401: 认证失效，需要重新登录
    if (status === 401) {
      const store = useAuthStore()
      const hadToken = !!store.accessToken
      store.logout()
      if (hadToken && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    // 403: 权限不足，不自动登出，只抛出错误让调用方处理
    return Promise.reject(err)
  }
)
