export type Role = 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER'

export interface LoginPayload {
  username: string
  password: string
}

export interface UserProfile {
  id: number
  username: string
  role: Role
  nickname?: string | null
  avatarDataUrl?: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserProfile
}
