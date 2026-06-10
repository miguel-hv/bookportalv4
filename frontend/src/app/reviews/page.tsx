import type { Metadata } from 'next'
import ReviewList from '@/components/reviews/ReviewList'

export const metadata: Metadata = {
  title: 'Reseñas — Bookportal',
}

export default function ReviewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <ReviewList />
    </main>
  )
}
