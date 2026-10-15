import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { jsonResponse, renderWithQuery } from '@/lib/testing/render'
import ConvertPage from './page'

const ME = {
  id: 'u',
  firstName: 'A',
  lastName: 'T',
  email: 'a@x.co',
  avatarUrl: null,
  tier: 'verified',
  wallets: [
    { currency: 'NGN', balance: 124_583_050 },
    { currency: 'USD', balance: 234_075 },
  ],
}

const CONVERTED = {
  data: {
    id: 'txn_cnv1',
    from: 'USD',
    to: 'NGN',
    amount: 1000,
    fee: 15,
    rate: 1530.25,
    received: 1_530_250,
    status: 'successful',
  },
}

type Post = { headers: Headers; body: string }
let posts: Post[]
let convertImpl: () => Promise<Response>

beforeEach(() => {
  posts = []
  convertImpl = async () => jsonResponse(CONVERTED)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/convert')) {
        posts.push({ headers: new Headers(init?.headers), body: String(init?.body) })
        return convertImpl()
      }
      if (url.includes('/rates')) {
        return jsonResponse({
          data: { from: 'USD', to: 'NGN', rate: 1530.25, updatedAt: '2026-10-15T09:30:00.000Z' },
        })
      }
      return jsonResponse({ data: ME })
    })
  )
})

afterEach(() => vi.unstubAllGlobals())

async function fillAndFindButton() {
  renderWithQuery(<ConvertPage />)
  await userEvent.type(screen.getByLabelText('Amount'), '10')
  await screen.findByText(/Balance:/)
  return screen.getByRole('button', { name: 'Convert' })
}

describe('Convert page submission safety', () => {
  it('sends one request with an idempotency key even when double-clicked', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    convertImpl = async () => {
      await gate
      return jsonResponse(CONVERTED)
    }
    const button = await fillAndFindButton()

    await userEvent.dblClick(button)
    release()
    await screen.findByText(/Conversion successful/)

    expect(posts).toHaveLength(1)
    expect(posts[0].headers.get('Idempotency-Key')).toMatch(/\S{8,}/)
    expect(JSON.parse(posts[0].body)).toEqual({ from: 'USD', to: 'NGN', amount: 1000 })
  })

  it('does not claim success when the outcome is unknown, and reuses the key on retry', async () => {
    let calls = 0
    convertImpl = async () => {
      calls += 1
      if (calls === 1) throw new TypeError('Failed to fetch')
      return jsonResponse(CONVERTED)
    }
    const button = await fillAndFindButton()

    await userEvent.click(button)
    expect(
      await screen.findByText(/couldn’t confirm whether this conversion went through/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Conversion successful/)).not.toBeInTheDocument()

    // Same intent again (same pair and amount).
    await userEvent.click(screen.getByRole('button', { name: 'Convert' }))
    await waitFor(() => expect(posts).toHaveLength(2))
    expect(posts[1].headers.get('Idempotency-Key')).toBe(posts[0].headers.get('Idempotency-Key'))
  })

  it('shows the server message for a definite refusal', async () => {
    convertImpl = async () =>
      jsonResponse(
        { error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient balance for this conversion' } },
        422
      )
    const button = await fillAndFindButton()
    await userEvent.click(button)
    expect(await screen.findByText('Insufficient balance for this conversion')).toBeInTheDocument()
  })
})
