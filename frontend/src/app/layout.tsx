import type { Metadata } from 'next'
import { AuthProvider } from '@/components/auth/AuthProvider'
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
