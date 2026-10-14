'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Card, CardHeader, Drawer } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import styles from './RecentTransactions.module.css'

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getTransactions({ limit: 5 }, { signal: controller.signal })
      .then((res) => setTransactions(res.data))
      .catch(() => setHasError(true))
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <Card padding="none">
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {isLoading && <p className={styles.message}>Loading…</p>}
      {!isLoading && hasError && (
        <p className={styles.message}>We couldn&apos;t load your transactions. Please try again later.</p>
      )}
      {!isLoading && !hasError && !transactions?.length && (
        <p className={styles.message}>No transactions yet.</p>
      )}
      {transactions?.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} timestamp="datetime" />
      ))}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && (
          <TransactionDetails
            key={selected.id}
            id={selected.id}
            initialData={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Drawer>
    </Card>
  )
}
