import { memo } from 'react'
import type { Transaction } from '@/types/api'
import { Money } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatDateTime, formatTime, isCreditType, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
  /**
   * "time" under a day heading (the date is already on screen); "datetime" when rows are shown without
   * day headings, e.g. the dashboard.
   */
  timestamp?: 'time' | 'datetime'
}

export const TransactionRow = memo(function TransactionRow({
  transaction: tx,
  onSelect,
  timestamp = 'time',
}: TransactionRowProps) {
  const isCredit = isCreditType(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <span className={styles.avatar}>
        <TransactionAvatar transaction={tx} />
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        {/* Untrusted upstream text: shown exactly as received, always as text and never as HTML. */}
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <StatusBadge status={tx.status} className={styles.status} />
      <Money
        amount={tx.amount}
        currency={tx.currency}
        sign={isCredit ? 'credit' : 'debit'}
        // A failed credit never arrived, so it is not drawn as money received.
        className={cx(styles.amount, isCredit && tx.status !== 'failed' && styles.credit)}
      />
      <span className={cx(styles.meta, timestamp === 'time' && styles.metaHiddenOnMobile)}>
        {timestamp === 'time' ? formatTime(tx.createdAt) : formatDateTime(tx.createdAt)}
      </span>
    </button>
  )
})
