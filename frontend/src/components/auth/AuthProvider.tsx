'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, LoginInput, RegisterInput } from '@/lib/auth-types'

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function fetchSession(): Promise<User | null> {
  const res = await fetch('/api/auth/session')
  if (!res.ok) return null
  const data = await res.json()
  return data.user ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error de conexión' }))
      throw new Error(error.message || 'Error al iniciar sesión')
    }

    const sessionUser = await fetchSession()
    setUser(sessionUser)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error de conexión' }))
      throw new Error(error.message || 'Error al registrarse')
    }

    const sessionUser = await fetchSession()
    setUser(sessionUser)
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
