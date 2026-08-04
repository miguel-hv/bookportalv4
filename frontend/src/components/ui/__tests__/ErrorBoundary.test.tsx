import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws when rendered — used to trigger the boundary
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('kaboom')
  }
  return <p>Contenido seguro</p>
}

const originalError = console.error

beforeEach(() => {
  // Silence React's expected "uncaught error" noise from boundary tests
  console.error = jest.fn()
})

afterEach(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>Contenido seguro</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Contenido seguro')).toBeInTheDocument()
  })

  it('shows the default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument()
  })

  it('recovers after pressing the reset button', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    // The boundary shows the fallback after the throw
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()

    // Re-render with healthy children, then reset
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(screen.getByText('Contenido seguro')).toBeInTheDocument()
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument()
  })

  it('uses a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Fallo personalizado</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Fallo personalizado')).toBeInTheDocument()
  })

  it('passes the error to a functional fallback', () => {
    render(
      <ErrorBoundary fallback={(error) => <p>Error: {error.message}</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Error: kaboom')).toBeInTheDocument()
  })
})
