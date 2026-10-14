'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ApiError } from '@/lib/api/client'

/** Network failures and 5xx are retried once (the API fails ~3% of requests); 4xx never are. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < 1 && error instanceof ApiError && error.isRetryable
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        retryDelay: 600,
        // A refetch that takes seconds under load is more disruptive than a slightly stale list.
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  // useState (not a module constant) so each browser session / test gets its own cache.
  const [client] = useState(createQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
