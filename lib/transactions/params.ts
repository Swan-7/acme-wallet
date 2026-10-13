import type { TransactionStatus, TransactionType } from '@/types/api'
import type { TransactionQuery } from '@/lib/api/endpoints'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

/** Rows per page. The design's "Showing 1–20 of 237" assumes the API default. */
export const PAGE_SIZE = 20

/** Upper bound for the search text: keeps URLs and API requests small. */
export const SEARCH_MAX_LENGTH = 100

export interface TransactionParams {
  q: string
  type: TransactionType | null
  status: TransactionStatus | null
  page: number
  /** Id of the transaction shown in the details drawer. */
  tx: string | null
}

export const DEFAULT_PARAMS: TransactionParams = { q: '', type: null, status: null, page: 1, tx: null }

const PAGE_PATTERN = /^[1-9]\d{0,5}$/
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

// Object.hasOwn: a plain `in` check would accept "toString" and friends.
const isType = (value: string): value is TransactionType => Object.hasOwn(TRANSACTION_TYPE_LABELS, value)
const isStatus = (value: string): value is TransactionStatus =>
  Object.hasOwn(TRANSACTION_STATUS_LABELS, value)

export function normaliseSearch(value: string): string {
  return value.trim().slice(0, SEARCH_MAX_LENGTH).trim()
}

interface ReadableParams {
  get(name: string): string | null
}

/**
 * Read the page state from a query string. Anything that is not a known, well-formed value falls back to
 * its default, so user-controlled URLs can never reach the API unvalidated.
 */
export function parseTransactionParams(search: ReadableParams): TransactionParams {
  const type = search.get('type')
  const status = search.get('status')
  const page = search.get('page')
  const tx = search.get('tx')

  return {
    q: normaliseSearch(search.get('q') ?? ''),
    type: type !== null && isType(type) ? type : null,
    status: status !== null && isStatus(status) ? status : null,
    page: page !== null && PAGE_PATTERN.test(page) ? Number(page) : 1,
    tx: tx !== null && ID_PATTERN.test(tx) ? tx : null,
  }
}

/**
 * Produce the next query string from the current one and a patch.
 * - Starts from `current`, so parameters we do not own (e.g. `__scenario`) survive navigation.
 * - Default values are removed, keeping URLs canonical and shareable.
 * - Changing the search or a filter resets the page, unless the patch sets it explicitly.
 */
export function applyTransactionParams(
  current: URLSearchParams,
  patch: Partial<TransactionParams>
): URLSearchParams {
  const next = new URLSearchParams(current)
  const set = (key: string, value: string | null | undefined) => {
    if (value) next.set(key, value)
    else next.delete(key)
  }

  if ('q' in patch) set('q', normaliseSearch(patch.q ?? ''))
  if ('type' in patch) set('type', patch.type)
  if ('status' in patch) set('status', patch.status)
  if ('tx' in patch) set('tx', patch.tx)

  const filtersChanged = 'q' in patch || 'type' in patch || 'status' in patch
  if ('page' in patch) set('page', patch.page && patch.page > 1 ? String(patch.page) : null)
  else if (filtersChanged) next.delete('page')

  return next
}

/** Anything that narrows the list: drives the "Clear filters" action and the empty-state copy. */
export const hasActiveFilters = (params: Pick<TransactionParams, 'q' | 'type' | 'status'>): boolean =>
  params.q !== '' || params.type !== null || params.status !== null

export function toApiQuery(params: TransactionParams): TransactionQuery {
  return {
    page: params.page,
    limit: PAGE_SIZE,
    q: params.q || undefined,
    type: params.type ?? undefined,
    status: params.status ?? undefined,
  }
}
