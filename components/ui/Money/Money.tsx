import type { Currency } from '@/types/api'
import { cx } from '@/lib/cx'
import { formatMoney } from '@/lib/format/money'
import styles from './Money.module.css'

export interface MoneyProps {
  /** Minor units. Always non-negative; use `sign` to show direction. */
  amount: number
  currency: Currency
  /** Prefix with + or −. */
  sign?: 'credit' | 'debit'
  className?: string
}

export function Money({ amount, currency, sign, className }: MoneyProps) {
  // Format the magnitude once and add the sign ourselves, so the glyph is the typographic minus (U+2212)
  // used in the design rather than a hyphen.
  const prefix = sign === 'credit' ? '+' : sign === 'debit' ? '−' : ''
  return (
    <span className={cx(styles.money, className)}>
      {prefix}
      {formatMoney(amount, currency)}
    </span>
  )
}
