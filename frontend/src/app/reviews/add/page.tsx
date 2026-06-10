import type { Metadata } from 'next'
import AddReviewForm from '@/components/reviews/AddReviewForm'

export const metadata: Metadata = {
  title: 'Nueva Reseña — Bookportal',
}

export default function AddReviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <AddReviewForm />
    </main>
  )
}
