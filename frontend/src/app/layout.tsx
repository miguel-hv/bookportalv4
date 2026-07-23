import type { Metadata } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Header from '@/components/layout/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookportal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ErrorBoundary>
            <Header />
            <div className="pt-16">{children}</div>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
