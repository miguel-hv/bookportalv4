import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../RegisterForm'

// ----------------------------------------------------------------
// Mock next/navigation — useRouter is a jest.fn() we can control
// ----------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// ----------------------------------------------------------------
// Mock AuthProvider — useAuth is a jest.fn() we can control per test
// ----------------------------------------------------------------
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

const getForm = () =>
  screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!

beforeEach(() => {
  jest.clearAllMocks()

  // Default router mock
  ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })

  // Default auth mock — register does nothing by default
  ;(useAuth as jest.Mock).mockReturnValue({
    register: jest.fn(),
    user: null,
    loading: false,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  })
})

// -----------------------------------------------------------------
// Helper to fill in valid password fields (used in username tests)
// -----------------------------------------------------------------
async function fillPasswords(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Contraseña'), 'ValidP4ss!')
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'ValidP4ss!')
}

describe('RegisterForm', () => {
  // -------------------------------------------------------------------
  // 1. Render smoke test
  // -------------------------------------------------------------------
  it('renders the form with all fields', () => {
    render(<RegisterForm />)

    expect(
      screen.getByRole('heading', { name: /crear cuenta/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /crear cuenta/i }),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 2. Empty form submission
  // -------------------------------------------------------------------
  it('shows error when submitting empty form', () => {
    render(<RegisterForm />)
    fireEvent.submit(getForm())
    expect(screen.getByText('Completá todos los campos')).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 3. Username with spaces
  // -------------------------------------------------------------------
  it('shows validation error for username with spaces', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
      'user name',
    )
    await fillPasswords(user)
    fireEvent.submit(getForm())

    expect(
      screen.getByText('El nombre solo puede contener letras y números'),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 4. Username with special chars
  // -------------------------------------------------------------------
  it('shows validation error for username with special chars', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
      'user@name',
    )
    await fillPasswords(user)
    fireEvent.submit(getForm())

    expect(
      screen.getByText('El nombre solo puede contener letras y números'),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 5. Username with accented chars
  // -------------------------------------------------------------------
  it('shows validation error for username with accented chars', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
      'usuário',
    )
    await fillPasswords(user)
    fireEvent.submit(getForm())

    expect(
      screen.getByText('El nombre solo puede contener letras y números'),
    ).toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 6. Valid alphanumeric username
  // -------------------------------------------------------------------
  it('does NOT show error for valid alphanumeric username and calls register', async () => {
    const mockRegister = jest.fn().mockResolvedValue(undefined)
    const mockPush = jest.fn()

    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      user: null,
      loading: false,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    })

    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
      'username123',
    )
    await fillPasswords(user)
    fireEvent.submit(getForm())

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'username123',
        password: 'ValidP4ss!',
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    // No validation errors should be visible
    expect(
      screen.queryByText('Completá todos los campos'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('El nombre solo puede contener letras y números'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Las contraseñas no coinciden'),
    ).not.toBeInTheDocument()
  })

  // -------------------------------------------------------------------
  // 7. Passwords don't match
  // -------------------------------------------------------------------
  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(
      screen.getByRole('textbox', { name: /nombre de usuario/i }),
      'username123',
    )
    await user.type(screen.getByLabelText('Contraseña'), 'password1')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'password2')
    fireEvent.submit(getForm())

    expect(
      screen.getByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument()
  })
})
