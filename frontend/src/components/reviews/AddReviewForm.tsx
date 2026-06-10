'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function AddReviewForm() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const [bookTitle, setBookTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Wait for session to resolve before checking auth
  if (loading) {
    return null
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!bookTitle.trim() || !reviewText.trim()) {
      setError('Completá todos los campos')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: bookTitle.trim(),
          reviewText: reviewText.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Error al crear la reseña' }))
        throw new Error(body.message || `HTTP ${res.status}`)
      }

      router.push('/reviews')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Nueva reseña</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="review-book-title" className="mb-1 block text-sm font-medium text-gray-700">
            Título del libro
          </label>
          <input
            id="review-book-title"
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            disabled={submitting}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Ej: Cien años de soledad"
          />
        </div>

        <div>
          <label htmlFor="review-text" className="mb-1 block text-sm font-medium text-gray-700">
            Reseña
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={submitting}
            required
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 resize-y"
            placeholder="Escribí tu reseña..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Publicando...' : 'Publicar reseña'}
        </button>
      </form>
    </div>
  )
}
