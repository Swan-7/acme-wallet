'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Drawer, EmptyState, Pagination } from '@/components/ui'
import { hasActiveFilters, PAGE_SIZE } from '@/lib/transactions/params'
import { useTransactionsQuery } from '@/lib/transactions/queries'
import { TransactionDetails } from './TransactionDetails'
import { TransactionFilters } from './TransactionFilters'
import { TransactionList, TransactionListSkeleton } from './TransactionList'
import { useSearchInput } from './useSearchInput'
import { useTransactionParams } from './useTransactionParams'
import styles from './TransactionsView.module.css'

function subtitle(total: number | undefined, filtered: boolean): string {
  if (total === undefined) return ' ' // reserve the line so the layout does not jump
  if (filtered) return `${total.toLocaleString('en')} ${total === 1 ? 'result' : 'results'}`
  return `${total.toLocaleString('en')} ${total === 1 ? 'transaction' : 'transactions'}`
}

export function TransactionsView() {
  const { params, navigate, router } = useTransactionParams()
  const query = useTransactionsQuery(params)
  const filtered = hasActiveFilters(params)

  const search = useSearchInput(
    params.q,
    useCallback((q: string) => navigate({ q }), [navigate])
  )

  const { data } = query
  const totalPages = data?.meta.totalPages

  // A shared or stale link can point past the last page: land on the last one rather than an empty list.
  useEffect(() => {
    if (totalPages !== undefined && params.page > totalPages) navigate({ page: totalPages }, 'replace')
  }, [params.page, totalPages, navigate])

  // Whether the drawer was opened by an in-app action. If so, closing it is "Back" (no history litter);
  // for a deep link there is nothing to go back to inside the app, so we replace the URL instead.
  const openedInApp = useRef(false)

  const openTransaction = useCallback(
    (tx: Transaction) => {
      openedInApp.current = true
      navigate({ tx: tx.id })
    },
    [navigate]
  )

  const closeTransaction = useCallback(() => {
    if (openedInApp.current) {
      openedInApp.current = false
      router.back()
    } else {
      navigate({ tx: null }, 'replace')
    }
  }, [navigate, router])

  const clearFilters = useCallback(() => navigate({ q: '', type: null, status: null }), [navigate])

  const isRefreshing = query.isFetching && query.isPlaceholderData
  const items = data?.items
  const meta = data?.meta
  const openTx = params.tx ? items?.find((tx) => tx.id === params.tx) : undefined

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {subtitle(meta?.total, filtered)}
        </p>
      </header>

      <TransactionFilters
        searchText={search.text}
        onSearchTextChange={search.onChange}
        onSearchSubmit={search.commitNow}
        type={params.type}
        onTypeChange={(value) => navigate({ type: (value || null) as typeof params.type })}
        status={params.status}
        onStatusChange={(value) => navigate({ status: (value || null) as typeof params.status })}
        showClear={filtered || search.text.trim() !== ''}
        onClear={clearFilters}
      />

      <div className={styles.results} aria-busy={query.isFetching}>
        {items ? (
          items.length === 0 ? (
            <EmptyResults filtered={filtered} onClear={clearFilters} />
          ) : (
            <TransactionList transactions={items} onSelect={openTransaction} isRefreshing={isRefreshing} />
          )
        ) : query.isError ? (
          <div className={styles.stateCard}>
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
          </div>
        ) : (
          <TransactionListSkeleton />
        )}
      </div>

      {meta && items && items.length > 0 && (
        <footer className={styles.footer}>
          <p className={styles.range}>
            Showing {(meta.page - 1) * PAGE_SIZE + 1}–{(meta.page - 1) * PAGE_SIZE + items.length} of{' '}
            {meta.total.toLocaleString('en')}
          </p>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onChange={(page) => navigate({ page })}
            label="Transactions pages"
          />
        </footer>
      )}

      <Drawer open={params.tx !== null} title="Transaction details" onClose={closeTransaction}>
        {params.tx && (
          <TransactionDetails
            key={params.tx}
            id={params.tx}
            initialData={openTx}
            onClose={() => navigate({ tx: null }, 'replace')}
          />
        )}
      </Drawer>
    </div>
  )
}

function EmptyResults({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className={styles.stateCard}>
      {filtered ? (
        <EmptyState
          role="status"
          icon="search"
          title="No transactions match your filters"
          description="Try a different search term or remove some filters."
          action={
            <Button variant="secondary" onClick={onClear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          role="status"
          icon="inbox"
          title="No transactions yet"
          description="When you add money, send a transfer or pay with your card, it will show up here."
        />
      )}
    </div>
  )
}
