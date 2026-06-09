'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User, PaginatedResponse } from '@/lib/auth-types'

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-lg border border-gray-100">
      <div className="h-5 w-32 rounded bg-gray-200 mb-3" />
      <div className="h-4 w-40 rounded bg-gray-200" />
    </div>
  )
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchUsers = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/users?page=${pageNum}&size=20`)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: PaginatedResponse<User> = await res.json()
      setUsers((prev) => [...prev, ...data.content])
      setHasMore(pageNum + 1 < data.totalPages)
      setPage(pageNum + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers(0)
  }, [fetchUsers])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loading && hasMore) {
          fetchUsers(page)
        }
      },
      { rootMargin: '100px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, hasMore, page, fetchUsers])

  // --- Initial loading state (skeleton) ---
  if (loading && users.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Usuarios
        </h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // --- Error state (with retry) ---
  if (error && users.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Usuarios
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
          <p className="text-gray-600">Error al cargar usuarios</p>
          <button
            onClick={() => fetchUsers(0)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // --- Empty state ---
  if (!loading && users.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Usuarios
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
          <p className="text-gray-600">No hay usuarios todavía</p>
        </div>
      </div>
    )
  }

  // --- Users loaded ---
  return (
    <div className="w-full max-w-5xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Usuarios
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl bg-white p-6 shadow-lg border border-gray-100"
          >
            <p className="text-lg font-semibold text-gray-800">
              @{user.name}
            </p>
            {user.createdAt && (
              <p className="mt-1 text-sm text-gray-500">
                Miembro desde: {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Error banner when loading more pages fails */}
      {error && users.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <p className="text-gray-600">Error al cargar usuarios</p>
          <button
            onClick={() => fetchUsers(page)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading indicator for subsequent pages */}
      {loading && users.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}

      {/* Sentinel element — triggers next page load when visible */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      )}
    </div>
  )
}
