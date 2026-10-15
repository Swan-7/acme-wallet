import type { Transaction } from '@/types/api'
import { Icon } from '@/components/ui'
import { cx } from '@/lib/cx'
import { getInitials } from '@/lib/transactions/initials'
import { TYPE_ICONS } from './presentation'
import styles from './TransactionAvatar.module.css'

export interface TransactionAvatarProps {
  transaction: Pick<Transaction, 'type' | 'counterparty'>
  size?: 'md' | 'lg'
}

/** Initials of the counterparty when there is one, otherwise the icon for the transaction type. */
export function TransactionAvatar({ transaction, size = 'md' }: TransactionAvatarProps) {
  const initials = transaction.counterparty ? getInitials(transaction.counterparty) : ''
  return (
    <span className={cx(styles.avatar, styles[size])} aria-hidden>
      {initials || <Icon name={TYPE_ICONS[transaction.type]} size={size === 'lg' ? 22 : 18} />}
    </span>
  )
}
