import { memo, useMemo } from 'react'
import type { Transaction } from '@/types/api'
import { Skeleton } from '@/components/ui'
import { cx } from '@/lib/cx'
import { groupByDay } from '@/lib/transactions/group'
import { TransactionRow } from './TransactionRow'
import { TransactionRowSkeleton } from './TransactionRowSkeleton'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  transactions: readonly Transaction[]
  onSelect: (transaction: Transaction) => void
  /** Fresh data is on its way; the rows shown are the previous result. */
  isRefreshing?: boolean
}

/** Transactions grouped under day headings (Today / Yesterday / date), inside the list card. */
export const TransactionList = memo(function TransactionList({
  transactions,
  onSelect,
  isRefreshing,
}: TransactionListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions])

  return (
    <div className={styles.card} data-refreshing={isRefreshing ? '' : undefined}>
      {groups.map((group, index) => (
        <section key={`${group.key}-${index}`} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.label}</h2>
          <ul className={styles.items}>
            {group.items.map((tx) => (
              <li key={tx.id} className={styles.item}>
                <TransactionRow transaction={tx} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
})

/** First-load placeholder: a day heading and six rows, as in the design. */
export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={cx(styles.card, styles.skeletonCard)} role="status" aria-label="Loading transactions">
      <div className={styles.groupTitle}>
        <Skeleton width={64} height={10} />
      </div>
      <div>
        {Array.from({ length: rows }, (_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
