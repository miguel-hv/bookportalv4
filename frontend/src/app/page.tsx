'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const url = apiUrl ? `${apiUrl}/api/welcome` : '/api/welcome'

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setMessage(data.message)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Error al conectar con el servidor')
        setLoading(false)
      })
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Bookportal</h1>

        {loading && (
          <p className="text-gray-500">Cargando...</p>
        )}

        {error && (
          <p className="text-red-600">
            Error: {error}
          </p>
        )}

        {!loading && !error && message && (
          <p className="text-xl text-gray-700">{message}</p>
        )}
      </div>
    </main>
  )
}
