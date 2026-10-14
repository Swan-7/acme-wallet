import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsView } from '@/components/transactions/TransactionsView'
import { TransactionListSkeleton } from '@/components/transactions/TransactionList'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // useSearchParams (inside the view) requires a Suspense boundary for production prerendering.
  return (
    <Suspense fallback={<TransactionListSkeleton />}>
      <TransactionsView />
    </Suspense>
  )
}
