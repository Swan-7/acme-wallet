'use client'
import { Button, Card, EmptyState } from '@/components/ui'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { BalanceSummarySkeleton, WalletCardSkeleton } from '@/components/dashboard/DashboardSkeletons'
import { CURRENCIES } from '@/types/api'
import { useMeQuery } from '@/lib/user/queries'
import styles from './page.module.css'

export default function DashboardPage() {
  const me = useMeQuery()
  const user = me.data

  if (me.isError && !user) {
    return (
      <div className={styles.page}>
        <Card>
          <EmptyState
            role="alert"
            icon="alert"
            tone="danger"
            title="We couldn’t load your account"
            description="Check your connection and try again."
            action={
              <Button iconLeft="refresh" onClick={() => void me.refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>{user ? `Welcome back, ${user.firstName}` : 'Welcome back'}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      {user ? <BalanceSummary wallets={user.wallets} /> : <BalanceSummarySkeleton />}

      <div className={styles.wallets}>
        {user
          ? user.wallets.map((wallet) => <WalletCard key={wallet.currency} wallet={wallet} />)
          : CURRENCIES.map((currency) => <WalletCardSkeleton key={currency} />)}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
