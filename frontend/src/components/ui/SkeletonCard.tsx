export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-lg border border-gray-100">
      <div className="mb-3 h-5 w-48 rounded bg-gray-200" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-gray-200 ${
            i === lines - 1 ? 'w-32' : 'w-full'
          } ${i > 0 ? 'mt-3' : ''}`}
        />
      ))}
    </div>
  )
}
