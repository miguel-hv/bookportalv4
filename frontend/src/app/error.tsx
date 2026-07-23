'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ErrorPage]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-2 text-4xl font-bold text-red-600">500</h1>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Error interno del servidor</h2>
        <p className="mb-6 text-gray-600">
          Algo salió mal. Ya registramos el error y lo vamos a revisar.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
