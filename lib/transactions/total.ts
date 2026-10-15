import type { Transaction } from '@/types/api'
import { isCreditType } from '@/lib/format'

/**
 * The "Total" line of the details summary, or null when it cannot be stated truthfully from this record.
 *
 * - Debits (withdrawal, transfer out, card, bill): amount + fee. API.md: the fee is charged on top.
 * - Credits without a fee: the amount.
 * - Conversions: the history row is in the *target* currency (amount = received) while the fee was
 *   charged in the *source* currency, so adding them would produce a number that never moved anywhere.
 * - Credits that carry a fee: not specified by the API, so we do not guess.
 */
export function transactionTotal(tx: Pick<Transaction, 'type' | 'amount' | 'fee'>): number | null {
  if (tx.type === 'conversion') return null
  if (isCreditType(tx.type)) return tx.fee === 0 ? tx.amount : null
  return tx.amount + tx.fee
}
