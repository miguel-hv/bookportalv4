import type { ReviewResponse } from '@/lib/auth-types'

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export default function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
      <p className="text-lg font-bold text-gray-800">
        {review.bookTitle}
      </p>
      <p className="mt-2 text-gray-600">{review.reviewText}</p>
      <p className="mt-3 text-sm text-gray-500">
        por {review.userName} — {formatDate(review.createdAt)}
      </p>
    </div>
  )
}
