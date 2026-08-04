import { apiRequest, apiGet, apiPost, ApiError } from '../api-client'

const mockFetch = jest.fn()

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch as unknown as typeof fetch
})

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

function emptyResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({}),
    json: async () => {
      throw new Error('no json')
    },
    text: async () => '',
  } as unknown as Response
}

describe('api-client', () => {
  it('GET parses JSON responses', async () => {
    mockFetch.mockResolvedValue(jsonResponse(200, { id: 1, name: 'book' }))

    const data = await apiGet<{ id: number; name: string }>('/api/books/1')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/books/1',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(data).toEqual({ id: 1, name: 'book' })
  })

  it('POST serializes the body and sets Content-Type', async () => {
    mockFetch.mockResolvedValue(jsonResponse(201, { ok: true }))

    await apiPost('/api/books', { title: 'Dune' })

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"title":"Dune"}')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('throws ApiError with status, errorCode and path on non-ok JSON', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(400, {
        error: 'Bad Request',
        message: 'title: must not be blank',
        errorCode: 'ERR_VALIDATION',
        path: '/api/books',
      }),
    )

    const error = (await apiPost('/api/books', { title: '' }).catch(
      (e) => e,
    )) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.errorCode).toBe('ERR_VALIDATION')
    expect(error.path).toBe('/api/books')
    expect(error.message).toBe('title: must not be blank')
  })

  it('falls back to HTTP status when the error body has no message', async () => {
    mockFetch.mockResolvedValue(emptyResponse(500))

    const error = (await apiGet('/api/books').catch((e) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.errorCode).toBe('ERR_UNKNOWN')
    expect(error.message).toBe('HTTP 500')
  })

  it('does not throw when throwOnError is false', async () => {
    mockFetch.mockResolvedValue(jsonResponse(404, { message: 'gone' }))

    const data = await apiGet('/api/books/999', { throwOnError: false })

    expect(data).toEqual({ message: 'gone' })
  })

  it('does not set Content-Type for FormData bodies', async () => {
    mockFetch.mockResolvedValue(jsonResponse(200, {}))
    const formData = new FormData()

    await apiRequest('/api/upload', { method: 'POST', body: formData })

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(init.body).toBe(formData)
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })
})
