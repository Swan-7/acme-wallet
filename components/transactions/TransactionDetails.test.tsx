import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import type { Transaction } from '@/types/api'
import { renderWithQuery } from '@/lib/testing/render'
import { TransactionDetails } from './TransactionDetails'

const tx = (over: Partial<Transaction> = {}): Transaction => ({
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120_000,
  fee: 1_200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
  ...over,
})

const renderDetails = (t: Transaction) =>
  renderWithQuery(<TransactionDetails id={t.id} initialData={t} onClose={() => {}} />)

describe('TransactionDetails summary', () => {
  it('shows amount, fee and the total of a debit (amount + fee)', () => {
    renderDetails(tx())
    expect(screen.getAllByText('GH₵1,200.00').length).toBeGreaterThan(0)
    expect(screen.getByText('GH₵12.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵1,212.00')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('shows the total of a conversion: its fee is already in the row currency', () => {
    // From the mock: a USD->NGN conversion row is NGN, with the fee converted at the same rate.
    renderDetails(
      tx({ type: 'conversion', currency: 'NGN', amount: 3_060_500, fee: 45_908, counterparty: null })
    )
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('₦31,064.08')).toBeInTheDocument()
  })

  it('omits the counterparty row when there is none', () => {
    renderDetails(tx({ counterparty: null, type: 'card_payment', fee: 0 }))
    expect(screen.queryByText('Counterparty')).not.toBeInTheDocument()
  })

  it('does not render hostile markup', () => {
    const { container } = renderDetails(tx({ narration: 'Pay <img src=x onerror="alert(1)"> now' }))
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getAllByText('Pay now').length).toBeGreaterThan(0)
  })
})

describe('copy reference', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('confirms with "Copied" for a moment, then goes back', async () => {
    // userEvent.setup() installs its own clipboard, so replace it afterwards.
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderDetails(tx())

    await user.click(screen.getByRole('button', { name: 'Copy reference' }))

    expect(writeText).toHaveBeenCalledWith('ACM-48213377')
    expect(screen.getByText('Copied')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1600)
    })
    expect(screen.queryByText('Copied')).not.toBeInTheDocument()
  })

  it('says so when the clipboard is unavailable instead of failing silently', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })
    renderDetails(tx())
    await user.click(screen.getByRole('button', { name: 'Copy reference' }))
    expect(await screen.findByText('Couldn’t copy')).toBeInTheDocument()
  })
})
