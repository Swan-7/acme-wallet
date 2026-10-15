import { screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { jsonResponse, renderWithQuery } from '@/lib/testing/render'
import { RatesWidget } from './RatesWidget'

afterEach(() => vi.unstubAllGlobals())

describe('RatesWidget', () => {
  it('shows skeletons while loading, then the rates and the update time', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const from = new URL(String(input), 'http://x').searchParams.get('from')
        return jsonResponse({
          data: {
            from,
            to: 'NGN',
            rate: from === 'USD' ? 1530.25 : 98.4,
            updatedAt: '2026-10-15T09:30:00.000Z',
          },
        })
      })
    )
    const { container } = renderWithQuery(<RatesWidget base="NGN" />)

    expect(container.querySelectorAll('span[aria-hidden]').length).toBeGreaterThan(0)
    expect(screen.queryByText('—')).not.toBeInTheDocument()

    expect(await screen.findByText('1530.25 NGN')).toBeInTheDocument()
    expect(screen.getByText('98.4 NGN')).toBeInTheDocument()
    expect(screen.getByText(/^Updated \d{2}:\d{2}$/)).toBeInTheDocument()
    expect(container.querySelectorAll('span[aria-hidden]').length).toBe(0)
  })

  it('degrades to a dash with a retry when the rates fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'x' } }, 500))
    )
    renderWithQuery(<RatesWidget base="NGN" />)
    expect(await screen.findByText(/Some rates are unavailable/)).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})
