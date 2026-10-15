import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import { jsonResponse, renderWithQuery } from '@/lib/testing/render'
import { BalanceSummary } from './BalanceSummary'

const WALLETS = [
  { currency: 'NGN' as const, balance: 124_583_050 },
  { currency: 'USD' as const, balance: 234_075 },
  { currency: 'GHS' as const, balance: 85_020 },
]

const RATES: Record<string, number> = { USD: 1530.25, GHS: 98.4 }
const UPDATED_AT = '2026-10-15T09:30:00.000Z'

const rateBody = (from: string) => ({ data: { from, to: 'NGN', rate: RATES[from], updatedAt: UPDATED_AT } })

function stubRates(handler?: (from: string) => Response | Promise<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const from = new URL(String(input), 'http://x').searchParams.get('from') ?? ''
      return handler ? handler(from) : jsonResponse(rateBody(from))
    })
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('BalanceSummary', () => {
  it('shows a skeleton, then the converted total with an "approximate" note', async () => {
    stubRates()
    renderWithQuery(<BalanceSummary wallets={WALLETS} />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    // 124,583,050 + 358,193,269 + 8,365,968 = 491,142,287 kobo
    expect(await screen.findByText('₦4,911,422.87')).toBeInTheDocument()
    expect(screen.getByText(/Approximate sum of all wallets in NGN/)).toBeInTheDocument()
    expect(screen.queryByText('₦1,249,021.45')).not.toBeInTheDocument() // the old naive sum
  })

  it('needs no rates and does not say "approximate" for a single-currency balance', async () => {
    stubRates()
    renderWithQuery(<BalanceSummary wallets={[WALLETS[0]]} />)
    expect(await screen.findByText('₦1,245,830.50')).toBeInTheDocument()
    expect(screen.getByText('Sum of all wallets in NGN.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows no total (not a partial one) when a rate cannot be fetched, and can retry', async () => {
    let failing = true
    stubRates((from) =>
      failing && from === 'GHS'
        ? jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'x' } }, 500)
        : jsonResponse(rateBody(from))
    )
    renderWithQuery(<BalanceSummary wallets={WALLETS} />)

    expect(await screen.findByText(/Exchange rates are unavailable/)).toBeInTheDocument()
    expect(screen.queryByText(/₦/)).not.toBeInTheDocument()

    failing = false
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('₦4,911,422.87')).toBeInTheDocument()
  })

  it('hides and shows the figure', async () => {
    stubRates()
    renderWithQuery(<BalanceSummary wallets={WALLETS} />)
    await screen.findByText('₦4,911,422.87')
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }))
    expect(screen.getByText('••••••')).toBeInTheDocument()
    expect(screen.queryByText('₦4,911,422.87')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Show' })).toBeEnabled())
  })
})
