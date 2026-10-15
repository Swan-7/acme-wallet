import { Card, Skeleton } from '@/components/ui'
import { cx } from '@/lib/cx'
import balanceStyles from './BalanceSummary.module.css'
import styles from './DashboardSkeletons.module.css'

/** Same footprint as BalanceSummary: label line, large total, and the Hide button slot. */
export function BalanceSummarySkeleton() {
  return (
    <Card className={balanceStyles.card}>
      <div role="status" aria-label="Loading balance" className={styles.balance}>
        <Skeleton width={96} height={13} />
        <Skeleton width={220} height={34} />
      </div>
    </Card>
  )
}

/** Same footprint as WalletCard (132px tall, 24px padding). */
export function WalletCardSkeleton() {
  return (
    <article className={cx(styles.wallet)} aria-hidden>
      <Skeleton width={88} height={13} />
      <Skeleton width={150} height={22} />
    </article>
  )
}
