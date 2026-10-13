import type { TransactionStatus, TransactionType } from '@/types/api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  conversion: 'Conversion',
  card_payment: 'Card payment',
  bill_payment: 'Bill payment',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
}

/** Types that add money to the wallet they are recorded in. */
const CREDIT_TYPES: ReadonlySet<TransactionType> = new Set<TransactionType>([
  'deposit',
  'transfer_in',
  'conversion',
])

export const isCreditType = (type: TransactionType): boolean => CREDIT_TYPES.has(type)
