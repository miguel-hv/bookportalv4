'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function AuthStatus() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-gray-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
        Cargando...
      </span>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        Conectado como <span className="font-semibold text-gray-800">{user!.name}</span>
      </span>
      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
