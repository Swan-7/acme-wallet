import type { Currency, Wallet } from '@/types/api'

/**
 * Rates arrive as floats with at most six significant figures (API.md). Scaling by 1e12 turns every such
 * rate into an exact integer, so the multiplication below is done in BigInt and never accumulates float
 * error, however large the balance.
 */
const RATE_SCALE = 1_000_000_000_000
const RATE_SCALE_BIG = BigInt(RATE_SCALE)

/**
 * Convert an amount in minor units using `rate` (units of target per unit of source), rounding half up to
 * the nearest minor unit. Integer in, integer out.
 */
export function convertMinor(minor: number, rate: number): number {
  if (!Number.isSafeInteger(minor)) throw new RangeError('amount must be a safe integer in minor units')
  if (!Number.isFinite(rate) || rate < 0) throw new RangeError('rate must be a finite, non-negative number')

  const product = BigInt(minor) * BigInt(Math.round(rate * RATE_SCALE))
  const negative = product < 0n
  const magnitude = negative ? -product : product
  const rounded = (magnitude + RATE_SCALE_BIG / 2n) / RATE_SCALE_BIG
  return Number(negative ? -rounded : rounded)
}

export type RatesToBase = Partial<Record<Currency, number>>

/**
 * Sum every wallet in `base`, converting the others at their rate to `base`.
 * Returns null when a needed rate is missing, because a partial sum would silently understate the total.
 */
export function totalInBase(wallets: readonly Wallet[], base: Currency, rates: RatesToBase): number | null {
  let total = 0
  for (const wallet of wallets) {
    if (wallet.currency === base) {
      total += wallet.balance
      continue
    }
    const rate = rates[wallet.currency]
    if (rate === undefined) return null
    total += convertMinor(wallet.balance, rate)
  }
  return total
}
