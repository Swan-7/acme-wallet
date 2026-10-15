'use client'
import { useState } from 'react'
import type { Wallet } from '@/types/api'
import { Button, Card, Money, Skeleton } from '@/components/ui'
import { formatTime } from '@/lib/format'
import { useBalanceTotal } from '@/lib/rates/queries'
import styles from './BalanceSummary.module.css'

const BASE = 'NGN'

export function BalanceSummary({ wallets }: { wallets: Wallet[] }) {
  const [hidden, setHidden] = useState(false)
  const balance = useBalanceTotal(wallets, BASE)

  return (
    <Card className={styles.card}>
      <div role="status" aria-live="polite" aria-busy={balance.status === 'loading'}>
        <p className={styles.label}>Total balance</p>

        {balance.status === 'loading' && (
          <>
            <Skeleton width={220} height={34} className={styles.totalSkeleton} />
            <Skeleton width={240} height={12} className={styles.noteSkeleton} />
          </>
        )}

        {balance.status === 'error' && (
          <>
            <p className={styles.total}>—</p>
            <p className={styles.note}>
              Exchange rates are unavailable, so the total can&apos;t be worked out right now.{' '}
              <button type="button" className={styles.retry} onClick={balance.retry}>
                Try again
              </button>
            </p>
          </>
        )}

        {balance.status === 'ready' && (
          <>
            <p className={styles.total}>
              {hidden ? '••••••' : <Money amount={balance.total} currency={BASE} />}
            </p>
            <p className={styles.note}>
              {balance.converted
                ? `Approximate sum of all wallets in ${BASE}, converted at current rates${
                    balance.asOf ? ` (as of ${formatTime(balance.asOf)})` : ''
                  }.`
                : `Sum of all wallets in ${BASE}.`}
            </p>
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        iconLeft={hidden ? 'eye' : 'eye-off'}
        onClick={() => setHidden(!hidden)}
        disabled={balance.status !== 'ready'}
      >
        {hidden ? 'Show' : 'Hide'}
      </Button>
    </Card>
  )
}
