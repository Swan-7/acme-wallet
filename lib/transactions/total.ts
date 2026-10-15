import type { Transaction } from '@/types/api'

/**
 * The "Total" line of the details summary: amount + fee.
 *
 * API.md: `fee` is charged on top of `amount`, in the transaction's own `currency`, so both are always
 * in the same currency and the sum is well defined for every type. That includes conversions: the
 * history row is recorded in the target currency with its fee already converted at the conversion rate,
 * so the total is the value of what was paid, expressed in that currency.
 */
export function transactionTotal(tx: Pick<Transaction, 'amount' | 'fee'>): number {
  return tx.amount + tx.fee
}
