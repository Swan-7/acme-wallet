'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  applyTransactionParams,
  parseTransactionParams,
  type TransactionParams,
} from '@/lib/transactions/params'

export type NavigationMode = 'push' | 'replace'

/**
 * The URL is the single source of truth for page, filters, search and the open transaction.
 * `navigate` merges a patch onto the *current* query string (preserving unknown params) and either pushes a
 * history entry (user actions, so Back works) or replaces it (corrections such as clamping a page).
 */
export function useTransactionParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Keep `navigate` referentially stable while always reading the latest query string.
  const latest = useRef(searchParams)
  useEffect(() => {
    latest.current = searchParams
  }, [searchParams])

  const params = useMemo(() => parseTransactionParams(searchParams), [searchParams])

  const navigate = useCallback(
    (patch: Partial<TransactionParams>, mode: NavigationMode = 'push') => {
      const next = applyTransactionParams(new URLSearchParams(latest.current.toString()), patch)
      const query = next.toString()
      router[mode](query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname]
  )

  return { params, navigate, router }
}
