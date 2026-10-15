import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** True for failures that may succeed on a second attempt (network, 5xx). */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500
  }
}

export const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError'

function isErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== 'object' || body === null || !('error' in body)) return false
  const { error } = body as { error: unknown }
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch (err) {
    // Cancellation is not a failure: let callers (and TanStack Query) see the AbortError untouched.
    if (isAbortError(err)) throw err
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server.')
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = undefined
  }

  if (!res.ok) {
    if (isErrorBody(body)) throw new ApiError(res.status, body.error.code, body.error.message)
    throw new ApiError(res.status, 'UNKNOWN_ERROR', `Request failed with status ${res.status}.`)
  }

  if (typeof body !== 'object' || body === null || !('data' in body)) {
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'The server returned an unexpected response.')
  }
  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
