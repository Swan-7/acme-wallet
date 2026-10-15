import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { FakeNavigation } from './testing/navigation'
import { TransactionsView } from './TransactionsView'

vi.mock('next/navigation', async () => (await import('./testing/navigation')).navigationMock)

const tx = (over: Partial<Transaction> = {}): Transaction => ({
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 1549,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: new Date().toISOString(),
  ...over,
})

let requests: string[]

beforeEach(() => {
  requests = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requests.push(url)
      const body = url.includes('/transactions/')
        ? { data: tx() }
        : { data: [tx()], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }
      return new Response(JSON.stringify(body), { status: 200 })
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderView(initialUrl?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <FakeNavigation initialUrl={initialUrl}>
        <TransactionsView />
      </FakeNavigation>
    </QueryClientProvider>
  )
}

describe('TransactionsView filters', () => {
  it('lists transactions and shows the count', async () => {
    renderView()
    expect(await screen.findByText('Card payment - Netflix')).toBeInTheDocument()
    expect(screen.getByText('1 transaction')).toBeInTheDocument()
  })

  it('never renders upstream narration as HTML and hides markup noise', async () => {
    vi.mocked(fetch).mockImplementationOnce(
      async () =>
        new Response(
          JSON.stringify({
            data: [tx({ narration: 'Bill payment - Spectranet <img src=x onerror="window.__pwned=1">' })],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          })
        )
    )
    const { container } = renderView()
    expect(await screen.findByText('Bill payment - Spectranet')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('changing the type select requests filtered data', async () => {
    renderView()
    await screen.findByText('Card payment - Netflix')
    await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByRole('option', { name: 'Deposit' }))
    await waitFor(() => expect(requests.some((u) => u.includes('type=deposit'))).toBe(true))
    expect(screen.getByRole('combobox', { name: 'Type' })).toHaveTextContent('Deposit')
  })

  it('changing the status select requests filtered data', async () => {
    renderView()
    await screen.findByText('Card payment - Netflix')
    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(screen.getByRole('option', { name: 'Failed' }))
    await waitFor(() => expect(requests.some((u) => u.includes('status=failed'))).toBe(true))
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Failed')
  })

  it('typing in search shows the text and requests q after the debounce', async () => {
    renderView()
    await screen.findByText('Card payment - Netflix')
    const input = screen.getByLabelText('Search')
    await userEvent.type(input, 'netflix')
    expect(input).toHaveValue('netflix')
    await waitFor(() => expect(requests.some((u) => u.includes('q=netflix'))).toBe(true), { timeout: 2000 })
    expect(input).toHaveValue('netflix')
  })

  it('Clear filters resets the controls', async () => {
    renderView('/transactions?type=deposit&q=abc')
    await screen.findByText('Card payment - Netflix')
    const clear = screen.getByRole('button', { name: 'Clear filters' })
    await userEvent.click(clear)
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Type' })).toHaveTextContent('All types'))
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })

  it('opens the details drawer from a row and from ?tx=', async () => {
    renderView('/transactions?tx=txn_1')
    const dialog = await screen.findByRole('dialog', { name: 'Transaction details' })
    expect(await within(dialog).findByText('ACM-1')).toBeInTheDocument()
  })
})
