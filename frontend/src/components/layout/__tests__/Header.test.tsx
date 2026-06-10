import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Header from '../Header'

// -----------------------------------------------------------------------
// Mock next/navigation — useRouter and usePathname
// -----------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// -----------------------------------------------------------------------
// Mock AuthProvider — useAuth
// -----------------------------------------------------------------------
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

const mockUseRouter = useRouter as jest.Mock
const mockUsePathname = usePathname as jest.Mock
const mockUseAuth = useAuth as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()

  // Default router mock
  mockUseRouter.mockReturnValue({ push: jest.fn() })

  // Default pathname
  mockUsePathname.mockReturnValue('/')

  // Default auth: not loading, not authenticated
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  })
})

describe('Header', () => {
  // -------------------------------------------------------------------
  // 1. Loading state — skeleton placeholders
  // -------------------------------------------------------------------
  it('renders skeleton placeholders when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    const { container } = render(<Header />)

    // Skeleton containers should be present
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(1)

    // Should NOT show any auth-related text or links
    expect(screen.queryByText('Iniciar sesión')).not.toBeInTheDocument()
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument()
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument()
    expect(screen.queryByText('Reseñas')).not.toBeInTheDocument()
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()

    // Logo should still be visible
    expect(screen.getByText('Bookportal')).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 2. Unauthenticated state — login / register links
  // -------------------------------------------------------------------
  it('shows login and register links when not authenticated', () => {
    render(<Header />)

    // Links appear twice (desktop + mobile dropdown)
    const loginLinks = screen.getAllByRole('link', { name: /iniciar sesión/i })
    expect(loginLinks.length).toBe(2)

    const registerLinks = screen.getAllByRole('link', { name: /registrarse/i })
    expect(registerLinks.length).toBe(2)

    // Should NOT show logout button
    expect(
      screen.queryByRole('button', { name: /cerrar sesión/i }),
    ).not.toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 3. Authenticated state — user name and logout button
  // -------------------------------------------------------------------
  it('shows user name and logout button when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'TestUser' },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    })

    render(<Header />)

    // User name appears twice (desktop + mobile dropdown)
    const nameElements = screen.getAllByText('TestUser')
    expect(nameElements.length).toBe(2)

    // Logout button appears twice
    const logoutButtons = screen.getAllByRole('button', {
      name: /cerrar sesión/i,
    })
    expect(logoutButtons.length).toBe(2)

    // Should NOT show login/register links
    expect(
      screen.queryByRole('link', { name: /iniciar sesión/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /registrarse/i }),
    ).not.toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 4. Active link highlighting
  // -------------------------------------------------------------------
  it('highlights the active nav link based on pathname', () => {
    mockUsePathname.mockReturnValue('/reviews')

    render(<Header />)

    // Nav links appear twice (desktop + mobile dropdown)
    const reviewsLinks = screen.getAllByRole('link', { name: /reseñas/i })
    expect(reviewsLinks.length).toBe(2)

    const usersLinks = screen.getAllByRole('link', { name: /usuarios/i })
    expect(usersLinks.length).toBe(2)

    // At least one reviews link has the active class
    reviewsLinks.forEach((link) => {
      expect(link).toHaveClass('text-blue-600')
      expect(link).toHaveClass('border-b-2')
    })

    // Users links should NOT have the active class
    usersLinks.forEach((link) => {
      expect(link).toHaveClass('text-gray-600')
      expect(link).not.toHaveClass('text-blue-600')
    })
  })

  // -------------------------------------------------------------------
  // 5. Active link for nested routes (e.g. /reviews/add)
  // -------------------------------------------------------------------
  it('highlights the parent nav link on nested routes', () => {
    mockUsePathname.mockReturnValue('/reviews/add')

    render(<Header />)

    const reviewsLinks = screen.getAllByRole('link', { name: /reseñas/i })
    const usersLinks = screen.getAllByRole('link', { name: /usuarios/i })

    // /reviews/add should match /reviews via startsWith — all reviews links active
    reviewsLinks.forEach((link) => {
      expect(link).toHaveClass('text-blue-600')
    })

    // Users links should NOT have the active class
    usersLinks.forEach((link) => {
      expect(link).toHaveClass('text-gray-600')
    })
  })

  // -------------------------------------------------------------------
  // 6. Mobile menu toggle
  // -------------------------------------------------------------------
  it('opens and closes the mobile menu when hamburger is clicked', () => {
    render(<Header />)

    const hamburger = screen.getByRole('button', {
      name: /menú de navegación/i,
    })
    expect(hamburger).toBeInTheDocument()

    // Initially closed
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // Click to open
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // Click to close
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  // -------------------------------------------------------------------
  // 7. Logout action — calls logout() and redirects to /
  // -------------------------------------------------------------------
  it('calls logout and redirects to home on logout click', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined)
    const mockPush = jest.fn()

    mockUseRouter.mockReturnValue({ push: mockPush })
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'TestUser' },
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: mockLogout,
    })

    render(<Header />)

    // Logout buttons appear twice — click the desktop one (first)
    const logoutButtons = screen.getAllByRole('button', {
      name: /cerrar sesión/i,
    })
    fireEvent.click(logoutButtons[0])

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  // -------------------------------------------------------------------
  // 8. Mobile menu — close on outside click
  // -------------------------------------------------------------------
  it('closes the mobile menu when clicking outside', () => {
    render(<Header />)

    const hamburger = screen.getByRole('button', {
      name: /menú de navegación/i,
    })

    // Open menu
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // Simulate outside click on document body
    fireEvent.mouseDown(document.body)

    // Menu should close
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })
})
