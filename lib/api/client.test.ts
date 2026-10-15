import { afterEach, vi } from 'vitest'
import { api, ApiError } from './client'

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn<typeof fetch>(async () => impl())
  vi.stubGlobal('fetch', fn)
  return fn
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('api client', () => {
  it('returns the parsed body on success', async () => {
    mockFetch(async () => json({ data: [1], meta: { page: 1 } }))
    await expect(api.get('/x')).resolves.toEqual({ data: [1], meta: { page: 1 } })
  })

  it('throws ApiError with the server code on 4xx', async () => {
    mockFetch(async () => json({ error: { code: 'NOT_FOUND', message: 'nope' } }, 404))
    await expect(api.get('/x')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND', isRetryable: false })
  })

  it('marks 5xx as retryable', async () => {
    mockFetch(async () => json({ error: { code: 'INTERNAL_ERROR', message: 'boom' } }, 500))
    await expect(api.get('/x')).rejects.toMatchObject({ status: 500, isRetryable: true })
  })

  it('throws ApiError for a non-JSON error response', async () => {
    mockFetch(async () => new Response('<html>Bad gateway</html>', { status: 502 }))
    const err = await api.get('/x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' })
  })

  it('throws INVALID_RESPONSE for a 200 without data', async () => {
    mockFetch(async () => json({ nope: true }))
    await expect(api.get('/x')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('wraps network failures as retryable ApiError(0)', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(api.get('/x')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR', isRetryable: true })
  })

  it('passes AbortError through untouched', async () => {
    mockFetch(async () => {
      throw new DOMException('aborted', 'AbortError')
    })
    await expect(api.get('/x')).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('only sends Content-Type when there is a body, and never logs bodies', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fn = mockFetch(async () => json({ data: {} }))
    await api.get('/x')
    await api.post('/y', { a: 1 })
    const getHeaders = fn.mock.calls[0][1]?.headers as Headers
    const postHeaders = fn.mock.calls[1][1]?.headers as Headers
    expect(getHeaders.has('Content-Type')).toBe(false)
    expect(postHeaders.get('Content-Type')).toBe('application/json')
    expect(log).not.toHaveBeenCalled()
  })
})
