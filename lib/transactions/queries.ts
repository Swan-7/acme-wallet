import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Transaction } from '@/types/api'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { PAGE_SIZE, toApiQuery, type TransactionParams } from './params'

/** Only the fields that change the result set: opening a drawer must not refetch the list. */
/** How often to re-check while a transaction is pending. Paused automatically in background tabs. */
const PENDING_POLL_MS = 15_000

type ListParams = Pick<TransactionParams, 'q' | 'type' | 'status' | 'page'>

export const transactionKeys = {
  list: (params: ListParams, limit: number) =>
    ['transactions', 'list', params.q, params.type, params.status, params.page, limit] as const,
  detail: (id: string) => ['transactions', 'detail', id] as const,
}

/**
 * One page of transactions. While the next page / filter result loads, the previous one stays available
 * (`placeholderData`), as the design requires. The abort signal cancels superseded requests.
 */
export function useTransactionsQuery(params: ListParams, limit: number = PAGE_SIZE) {
  return useQuery({
    queryKey: transactionKeys.list(params, limit),
    queryFn: async ({ signal }) => {
      const res = await getTransactions({ ...toApiQuery({ ...params, tx: null }), limit }, { signal })
      if (!res.meta) throw new Error('Missing pagination metadata')
      return { items: res.data, meta: res.meta }
    },
    placeholderData: keepPreviousData,
    // Reconcile: while any visible transaction is still pending, re-check instead of leaving it stale.
    refetchInterval: (query) =>
      query.state.data?.items.some((tx) => tx.status === 'pending') ? PENDING_POLL_MS : false,
  })
}

/** A single transaction. `initialData` (from the list or dashboard) avoids a request when we already have it. */
export function useTransactionQuery(id: string, initialData?: Transaction) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async ({ signal }) => (await getTransaction(id, { signal })).data,
    initialData,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? PENDING_POLL_MS : false),
  })
}
