import { Skeleton } from '@/components/ui'
import { TransactionListSkeleton } from './TransactionList'
import filterStyles from './TransactionFilters.module.css'
import styles from './TransactionsView.module.css'
import fallbackStyles from './TransactionsFallback.module.css'

/**
 * First paint before the client view is ready (useSearchParams needs a Suspense boundary). Mirrors the
 * real layout, so the header and filter bar are already in place when the list area fills in: only the
 * list area changes, as the design specifies.
 */
export function TransactionsFallback() {
  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>&nbsp;</p>
      </header>

      <div className={filterStyles.filters} aria-hidden>
        {(
          [
            ['Search', filterStyles.search],
            ['Type', filterStyles.type],
            ['Status', filterStyles.status],
          ] as const
        ).map(([label, area]) => (
          <div key={label} className={`${area} ${fallbackStyles.field}`}>
            <span className={fallbackStyles.label}>{label}</span>
            <Skeleton width="100%" height={40} radius="var(--radius-md)" />
          </div>
        ))}
      </div>

      <TransactionListSkeleton />
    </div>
  )
}
