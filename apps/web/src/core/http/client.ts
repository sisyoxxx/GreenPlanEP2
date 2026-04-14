import axios from 'axios'
import { useAuthStore } from '../auth/useAuthStore'

export const http = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const store = useAuthStore()
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      const store = useAuthStore()
      store.logout()
    }
    return Promise.reject(err)
  }
)
