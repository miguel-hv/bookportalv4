'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReviewResponse, PaginatedResponse } from '@/lib/auth-types'
import ReviewCard from './ReviewCard'
import ListPageHeader from '../ui/ListPageHeader'
import SkeletonCard from '../ui/SkeletonCard'
import ErrorMessage from '../ui/ErrorMessage'
import EmptyMessage from '../ui/EmptyMessage'
import LoadingSpinner from '../ui/LoadingSpinner'

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
        <ListPageHeader
          title="Reseñas"
          action={{ label: '+ Nueva reseña', href: '/reviews/add' }}
        />
        <div className="space-y-6">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    )
  }

  // --- Error state (with retry) ---
  if (error && reviews.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <ListPageHeader
          title="Reseñas"
          action={{ label: '+ Nueva reseña', href: '/reviews/add' }}
        />
        <ErrorMessage message="Error al cargar reseñas" onRetry={() => fetchReviews(0)} />
      </div>
    )
  }

  // --- Empty state ---
  if (!loading && reviews.length === 0) {
    return (
      <div className="w-full max-w-5xl py-8">
        <ListPageHeader
          title="Reseñas"
          action={{ label: '+ Nueva reseña', href: '/reviews/add' }}
        />
        <EmptyMessage message="No hay reseñas todavía" />
      </div>
    )
  }

  // --- Reviews loaded ---
  return (
    <div className="w-full max-w-5xl py-8">
      <ListPageHeader
        title="Reseñas"
        action={{ label: '+ Nueva reseña', href: '/reviews/add' }}
      />

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Error banner when loading more pages fails */}
      {error && reviews.length > 0 && (
        <div className="mt-6">
          <ErrorMessage message="Error al cargar reseñas" onRetry={() => fetchReviews(page)} />
        </div>
      )}

      {/* Loading indicator for subsequent pages */}
      {loading && reviews.length > 0 && <LoadingSpinner />}

      {/* Sentinel element — triggers next page load when visible */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      )}
    </div>
  )
}
