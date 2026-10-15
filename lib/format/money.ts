import type { Currency } from '@/types/api'

const MINOR_UNITS_PER_MAJOR: Record<Currency, number> = { NGN: 100, USD: 100, GHS: 100 }

const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: Currency, signDisplay: Intl.NumberFormatOptions['signDisplay']) {
  const cacheKey = `${currency}:${signDisplay}`
  let formatter = formatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay,
    })
    formatters.set(cacheKey, formatter)
  }
  return formatter
}

/**
 * Minor units as an exact decimal string ("150050" -> "1500.50"). Only integer operations are used: the
 * remainder and the exact quotient, never `minor / 100`, so there is no float rounding to go wrong.
 */
function toDecimalString(minor: number, perMajor: number): string {
  if (!Number.isSafeInteger(minor)) throw new RangeError('amount must be a safe integer in minor units')
  const negative = minor < 0
  const abs = Math.abs(minor)
  const fraction = abs % perMajor
  const whole = (abs - fraction) / perMajor // exact: abs - fraction is a multiple of perMajor
  const digits = String(perMajor).length - 1
  return `${negative ? '-' : ''}${whole}.${String(fraction).padStart(digits, '0')}`
}

/**
 * Format an amount in minor units, e.g. formatMoney(150050, 'NGN') -> "₦1,500.50".
 * Use `signDisplay: 'always'` with a negative value for debits.
 *
 * Intl.NumberFormat reads a decimal *string* as an exact decimal, so the value is never turned into a
 * float on its way to the screen.
 */
export function formatMoney(
  minor: number,
  currency: Currency,
  { signDisplay = 'auto' }: { signDisplay?: Intl.NumberFormatOptions['signDisplay'] } = {}
): string {
  const decimal = toDecimalString(minor, MINOR_UNITS_PER_MAJOR[currency])
  return getFormatter(currency, signDisplay).format(decimal as `${number}`)
}

/** Parse user input like "1,500.5" into minor units (150050). Returns null if invalid or unsafe. */
export function parseMoney(input: string, currency: Currency): number | null {
  const cleaned = input.replace(/,/g, '').trim()
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null
  const [whole, fraction = ''] = cleaned.split('.')
  const minor = Number(whole) * MINOR_UNITS_PER_MAJOR[currency] + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(minor) ? minor : null
}
