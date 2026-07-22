'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User, PaginatedResponse } from '@/lib/auth-types'
import UserCard from './UserCard'
import ListPageHeader from '../ui/ListPageHeader'
import SkeletonCard from '../ui/SkeletonCard'
import ErrorMessage from '../ui/ErrorMessage'
import EmptyMessage from '../ui/EmptyMessage'
import LoadingSpinner from '../ui/LoadingSpinner'

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
        <ListPageHeader title="Usuarios" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      </div>
    )
  }

  // --- Error state (with retry) ---
  if (error && users.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <ListPageHeader title="Usuarios" />
        <ErrorMessage message="Error al cargar usuarios" onRetry={() => fetchUsers(0)} />
      </div>
    )
  }

  // --- Empty state ---
  if (!loading && users.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <ListPageHeader title="Usuarios" />
        <EmptyMessage message="No hay usuarios todavía" />
      </div>
    )
  }

  // --- Users loaded ---
  return (
    <div className="w-full max-w-5xl py-8">
      <ListPageHeader title="Usuarios" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Error banner when loading more pages fails */}
      {error && users.length > 0 && (
        <div className="mt-6">
          <ErrorMessage message="Error al cargar usuarios" onRetry={() => fetchUsers(page)} />
        </div>
      )}

      {/* Loading indicator for subsequent pages */}
      {loading && users.length > 0 && <LoadingSpinner />}

      {/* Sentinel element — triggers next page load when visible */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      )}
    </div>
  )
}
