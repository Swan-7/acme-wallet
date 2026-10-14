import type { TransactionStatus, TransactionType } from '@/types/api'
import type { BadgeTone, IconName } from '@/components/ui'

export const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

export const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}
