import { useMemo } from 'react'
import type { Transaction } from '@/types/api'
import { Skeleton } from '@/components/ui'
import { groupByDay } from '@/lib/transactions/group'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  transactions: readonly Transaction[]
  onSelect: (transaction: Transaction) => void
  /** Fresh data is on its way; the rows shown are the previous result. */
  isRefreshing?: boolean
}

/** Transactions grouped under day headings (Today / Yesterday / date), inside the list card. */
export function TransactionList({ transactions, onSelect, isRefreshing }: TransactionListProps) {
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
}

/** First-load placeholder: a day heading and six rows, as in the design. */
export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.card} role="status" aria-label="Loading transactions">
      <div className={styles.groupTitle}>
        <Skeleton width={64} height={10} />
      </div>
      <ul className={styles.items}>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className={styles.skeletonRow}>
            <Skeleton circle width={40} height={40} />
            <span className={styles.skeletonMain}>
              <Skeleton width={110} height={12} />
              <Skeleton width="min(240px, 100%)" height={10} />
            </span>
            <span className={styles.skeletonEnd}>
              <Skeleton width={84} height={12} />
              <Skeleton width={36} height={10} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
