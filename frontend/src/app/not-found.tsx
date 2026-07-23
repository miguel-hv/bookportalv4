import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-2 text-4xl font-bold text-gray-800">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Página no encontrada</h2>
        <p className="mb-6 text-gray-600">
          La página que estás buscando no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
