import { useQueries, useQuery } from '@tanstack/react-query'
import type { Currency, Rate, Wallet } from '@/types/api'
import { getRate } from '@/lib/api/endpoints'
import { totalInBase, type RatesToBase } from './convert'

const RATE_STALE_MS = 60_000

export const rateKey = (from: Currency, to: Currency) => ['rate', from, to] as const

const fetchRate = async (from: Currency, to: Currency, signal?: AbortSignal): Promise<Rate> =>
  (await getRate(from, to, { signal })).data

/** One exchange rate. Shared (and deduplicated) between the rates widget and the balance total. */
export function useRateQuery(from: Currency, to: Currency) {
  return useQuery({
    queryKey: rateKey(from, to),
    queryFn: ({ signal }) => fetchRate(from, to, signal),
    staleTime: RATE_STALE_MS,
  })
}

export type BalanceTotal =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | {
      status: 'ready'
      total: number
      /** True when at least one wallet had to be converted, so the figure is an estimate. */
      converted: boolean
      /** The oldest rate timestamp used (ISO), when any conversion happened. */
      asOf: string | null
    }

/** Total of all wallets expressed in `base`, from the shared rate queries. */
export function useBalanceTotal(wallets: readonly Wallet[], base: Currency): BalanceTotal {
  const foreign = [...new Set(wallets.map((w) => w.currency).filter((c) => c !== base))]

  const results = useQueries({
    queries: foreign.map((currency) => ({
      queryKey: rateKey(currency, base),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchRate(currency, base, signal),
      staleTime: RATE_STALE_MS,
    })),
  })

  if (foreign.length === 0) {
    return { status: 'ready', total: totalInBase(wallets, base, {}) ?? 0, converted: false, asOf: null }
  }
  if (results.some((r) => r.isError && !r.data)) {
    return { status: 'error', retry: () => results.forEach((r) => void r.refetch()) }
  }
  if (results.some((r) => !r.data)) return { status: 'loading' }

  const rates: RatesToBase = {}
  let asOf: string | null = null
  foreign.forEach((currency, index) => {
    const rate = results[index].data
    if (!rate) return
    rates[currency] = rate.rate
    if (asOf === null || rate.updatedAt < asOf) asOf = rate.updatedAt
  })

  const total = totalInBase(wallets, base, rates)
  if (total === null) return { status: 'loading' }
  return { status: 'ready', total, converted: true, asOf }
}
