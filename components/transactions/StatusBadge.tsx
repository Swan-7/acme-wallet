import type { TransactionStatus } from '@/types/api'
import { Badge } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS } from '@/lib/format'
import { STATUS_TONES } from './presentation'

export function StatusBadge({ status, className }: { status: TransactionStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONES[status]} dot className={className}>
      {TRANSACTION_STATUS_LABELS[status]}
    </Badge>
  )
}
