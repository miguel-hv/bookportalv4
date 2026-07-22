interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg border border-gray-100">
      <p className="text-gray-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Reintentar
      </button>
    </div>
  )
}
