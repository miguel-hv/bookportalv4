'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Header() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Silently handle logout failure — header stays in authenticated state
    }
    router.push('/')
  }

  const linkClasses = (href: string) =>
    `transition-colors rounded px-3 py-2 ${
      isActive(pathname, href)
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-600 hover:text-blue-600'
    }`

  // --- Loading skeleton ---
  if (loading) {
    return (
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold text-gray-800">Bookportal</span>
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          Bookportal
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/reviews" className={linkClasses('/reviews')}>
            Reseñas
          </Link>
          <Link href="/users" className={linkClasses('/users')}>
            Usuarios
          </Link>
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <span className="text-gray-700 truncate max-w-[150px]">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Menú de navegación"
          aria-expanded={menuOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        ref={dropdownRef}
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t bg-white shadow-lg">
          <nav className="flex flex-col gap-2 px-4 py-4">
            <Link href="/reviews" className={linkClasses('/reviews')}>
              Reseñas
            </Link>
            <Link href="/users" className={linkClasses('/users')}>
              Usuarios
            </Link>
          </nav>
          <hr className="mx-4 border-gray-200" />
          <div className="flex flex-col gap-2 px-4 py-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-gray-700 truncate">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm text-center"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
