export interface User {
  id: number
  name: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface SessionResponse {
  user: User | null
}

export interface AuthError {
  message: string
  status?: number
}

export interface LoginInput {
  name: string
  password: string
}

export interface RegisterInput {
  name: string
  password: string
}
