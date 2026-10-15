import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsFallback } from '@/components/transactions/TransactionsFallback'
import { TransactionsView } from '@/components/transactions/TransactionsView'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // useSearchParams (inside the view) requires a Suspense boundary for production prerendering.
  return (
    <Suspense fallback={<TransactionsFallback />}>
      <TransactionsView />
    </Suspense>
  )
}
