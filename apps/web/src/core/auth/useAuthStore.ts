import { defineStore } from 'pinia'
import { http } from '../http/client'
import type { AuthResponse, LoginPayload, Role, UserProfile } from './types'

interface AuthState {
  accessToken: string
  refreshToken: string
  user: UserProfile | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem('gp2_accessToken') || '',
    refreshToken: localStorage.getItem('gp2_refreshToken') || '',
    user: JSON.parse(localStorage.getItem('gp2_user') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    role: (state): Role | null => state.user?.role ?? null
  },
  actions: {
    async login(payload: LoginPayload) {
      const res = await http.post('/api/auth/login', payload) as { data: AuthResponse }
      this.applyAuth(res.data)
    },
    async register(payload: { username: string; password: string; roleCode: Role }) {
      const res = await http.post('/api/auth/register', payload) as { data: AuthResponse }
      this.applyAuth(res.data)
    },
    applyAuth(data: AuthResponse) {
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = data.user
      localStorage.setItem('gp2_accessToken', data.accessToken)
      localStorage.setItem('gp2_refreshToken', data.refreshToken)
      localStorage.setItem('gp2_user', JSON.stringify(data.user))
    },
    logout() {
      this.accessToken = ''
      this.refreshToken = ''
      this.user = null
      localStorage.removeItem('gp2_accessToken')
      localStorage.removeItem('gp2_refreshToken')
      localStorage.removeItem('gp2_user')
    }
  }
})
