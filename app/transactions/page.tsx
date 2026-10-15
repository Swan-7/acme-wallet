import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsFallback, TransactionsView } from '@/components/transactions'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // useSearchParams (inside the view) requires a Suspense boundary for production prerendering.
  return (
    <Suspense fallback={<TransactionsFallback />}>
      <TransactionsView />
    </Suspense>
  )
}
