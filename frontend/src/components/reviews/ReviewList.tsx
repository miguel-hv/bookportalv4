'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReviewResponse, PaginatedResponse } from '@/lib/auth-types'

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
      <div className="mb-3 h-5 w-48 rounded bg-gray-200" />
      <div className="mb-3 h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </div>
  )
}

export default function ReviewList() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchReviews = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/reviews?page=${pageNum}&size=10`)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: PaginatedResponse<ReviewResponse> = await res.json()
      setReviews((prev) => [...prev, ...data.content])
      setHasMore(pageNum + 1 < data.totalPages)
      setPage(pageNum + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchReviews(0)
  }, [fetchReviews])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loading && hasMore) {
          fetchReviews(page)
        }
      },
      { rootMargin: '100px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, hasMore, page, fetchReviews])

  // --- Initial loading state (skeleton) ---
  if (loading && reviews.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Reseñas
        </h1>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // --- Error state (with retry) ---
  if (error && reviews.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Reseñas
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
          <p className="text-gray-600">Error al cargar reseñas</p>
          <button
            onClick={() => fetchReviews(0)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // --- Empty state ---
  if (!loading && reviews.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Reseñas
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
          <p className="text-gray-600">No hay reseñas todavía</p>
        </div>
      </div>
    )
  }

  // --- Reviews loaded ---
  return (
    <div className="w-full max-w-5xl py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Reseñas
      </h1>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl bg-white p-6 shadow-lg border border-gray-100"
          >
            <p className="text-lg font-bold text-gray-800">
              {review.bookTitle}
            </p>
            <p className="mt-2 text-gray-600">{review.reviewText}</p>
            <p className="mt-3 text-sm text-gray-500">
              por {review.userName} — {formatDate(review.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {/* Error banner when loading more pages fails */}
      {error && reviews.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <p className="text-gray-600">Error al cargar reseñas</p>
          <button
            onClick={() => fetchReviews(page)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading indicator for subsequent pages */}
      {loading && reviews.length > 0 && (
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
