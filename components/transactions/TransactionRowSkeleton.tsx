import { Skeleton } from '@/components/ui'
import styles from './TransactionRowSkeleton.module.css'

/**
 * Placeholder for one TransactionRow, sized to the design's loading frame:
 * 40px circle, 120x12 + 260x10 bars, and a 176px end column with 96x12 + 40x10 bars.
 */
export function TransactionRowSkeleton() {
  return (
    <div className={styles.row}>
      <Skeleton circle width={40} height={40} />
      <span className={styles.main}>
        <Skeleton width={120} height={12} />
        <Skeleton width={260} height={10} />
      </span>
      <span className={styles.end}>
        <Skeleton width={96} height={12} />
        <Skeleton width={40} height={10} className={styles.endSecond} />
      </span>
    </div>
  )
}
