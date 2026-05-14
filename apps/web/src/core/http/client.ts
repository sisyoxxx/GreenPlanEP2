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
  (res) => {
    const apiRes = res.data as { success: boolean; message?: string; data: unknown }
    return apiRes.data as any
  },
  (err) => {
    const status = err.response?.status
    const message = err.response?.data?.message || ''
    if (status === 401) {
      const store = useAuthStore()
      const hadToken = !!store.accessToken
      store.logout()
      if (hadToken && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        alert(message || '登录已过期，请重新登录')
        window.location.assign('/login')
      }
    }
    if (status === 403) {
      alert(message || '权限不足，无法访问该资源')
    }
    return Promise.reject(err)
  }
)
