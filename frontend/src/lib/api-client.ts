/**
 * Centralized API client for Bookportal.
 *
 * All fetch calls go through this module to ensure consistent:
 * - Error parsing (backend ErrorResponse format)
 * - Error throwing (ApiError class)
 * - Logging and debugging
 */

export interface ApiErrorData {
  error: string
  message: string
  errorCode?: string
  timestamp?: string
  path?: string
}

export class ApiError extends Error {
  public readonly status: number
  public readonly errorCode: string
  public readonly path?: string

  constructor(status: number, data: ApiErrorData) {
    super(data.message || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.errorCode = data.errorCode ?? 'ERR_UNKNOWN'
    this.path = data.path
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** If true, throws ApiError on non-ok responses (default: true) */
  throwOnError?: boolean
}

/**
 * Performs an API request against the Next.js API routes.
 *
 * @param url - The API path (e.g. "/api/reviews?page=0&size=10")
 * @param options - Fetch options with optional structured body
 * @returns Parsed JSON response
 * @throws ApiError on non-ok responses (unless throwOnError: false)
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, throwOnError = true, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    body:
      body !== undefined
        ? body instanceof FormData
          ? body // FormData must NOT be serialized — fetch sets the boundary
          : JSON.stringify(body)
        : undefined,
  })

  // Parse response body (may be JSON or empty)
  let data: unknown
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    const text = await res.text()
    data = text || null
  }

  if (!res.ok && throwOnError) {
    const errorData: ApiErrorData =
      data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)
        ? (data as ApiErrorData)
        : { error: 'Unknown error', message: `HTTP ${res.status}` }

    throw new ApiError(res.status, errorData)
  }

  return data as T
}

/** Convenience: GET request */
export async function apiGet<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/** Convenience: POST request */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'POST', body })
}
