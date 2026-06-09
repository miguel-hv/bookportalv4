import { render, screen, waitFor } from '@testing-library/react'
import UserList from '../UserList'

// -----------------------------------------------------------------------
// Mock IntersectionObserver — we don't test infinite scroll in unit tests,
// we only need it to not throw when the component mounts.
// -----------------------------------------------------------------------
beforeAll(() => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
})

// -----------------------------------------------------------------------
// Mock global.fetch — restore original after each test
// -----------------------------------------------------------------------
let originalFetch: typeof global.fetch

beforeAll(() => {
  originalFetch = global.fetch
})

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  global.fetch = originalFetch
})

describe('UserList', () => {
  // -------------------------------------------------------------------
  // 1. Skeleton loading state
  // -------------------------------------------------------------------
  it('renders skeleton loading on mount while fetch is pending', () => {
    // Keep the promise pending indefinitely → component stays in loading
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    )

    const { container } = render(<UserList />)

    // Expect the heading
    expect(screen.getByText('Usuarios')).toBeInTheDocument()

    // Expect 3 skeleton cards (animate-pulse divs)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)
  })

  // -------------------------------------------------------------------
  // 2. Successful fetch — user cards rendered
  // -------------------------------------------------------------------
  it('renders user cards when fetch succeeds', async () => {
    const users = [
      { id: 1, name: 'alice', createdAt: '2024-01-15T00:00:00.000Z' },
      { id: 2, name: 'bob', createdAt: '2024-02-20T00:00:00.000Z' },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        content: users,
        totalPages: 1,
        totalElements: 2,
        number: 0,
        size: 20,
      }),
    })

    render(<UserList />)

    // Wait for the users to appear
    await waitFor(() => {
      expect(screen.getByText('@alice')).toBeInTheDocument()
    })

    expect(screen.getByText('@bob')).toBeInTheDocument()

    // Formatted date check (UTCDate → dd/mm/yyyy)
    expect(
      screen.getByText(/Miembro desde: 15\/01\/2024/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Miembro desde: 20\/02\/2024/),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 3. Failed fetch — error state with retry
  // -------------------------------------------------------------------
  it('renders error state when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument()
    })

    // Retry button should be present
    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 4. Empty response — "No hay usuarios" message
  // -------------------------------------------------------------------
  it('shows "No hay usuarios" when empty array is returned', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 20,
      }),
    })

    render(<UserList />)

    await waitFor(() => {
      expect(
        screen.getByText('No hay usuarios todavía'),
      ).toBeInTheDocument()
    })
  })
})
