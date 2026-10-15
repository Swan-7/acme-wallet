'use client'
import Link from 'next/link'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, CardHeader, Drawer, EmptyState } from '@/components/ui'
import { TransactionDetails, TransactionRow } from '@/components/transactions'
import { TransactionRowSkeleton } from '@/components/transactions/TransactionRowSkeleton'
import { DEFAULT_PARAMS } from '@/lib/transactions/params'
import { useTransactionsQuery } from '@/lib/transactions/queries'
import styles from './RecentTransactions.module.css'

const RECENT_COUNT = 5

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const query = useTransactionsQuery(DEFAULT_PARAMS, RECENT_COUNT)
  const transactions = query.data?.items

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

      {transactions ? (
        transactions.length > 0 ? (
          <ul className={styles.list}>
            {transactions.map((tx) => (
              <li key={tx.id} className={styles.item}>
                <TransactionRow transaction={tx} onSelect={setSelected} timestamp="datetime" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            role="status"
            icon="inbox"
            title="No transactions yet"
            description="When you add money, send a transfer or pay with your card, it will show up here."
          />
        )
      ) : query.isError ? (
        <EmptyState
          role="alert"
          icon="alert"
          tone="danger"
          title="We couldn’t load your transactions"
          description="Check your connection and try again."
          action={
            <Button iconLeft="refresh" onClick={() => void query.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <div role="status" aria-label="Loading transactions">
          {Array.from({ length: RECENT_COUNT }, (_, i) => (
            <TransactionRowSkeleton key={i} />
          ))}
        </div>
      )}

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
