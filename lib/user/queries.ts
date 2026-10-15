import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/api/endpoints'

/** The signed-in user. Shared by the navbar menu and the dashboard, so it is requested once. */
export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async ({ signal }) => (await getMe({ signal })).data,
    staleTime: 60_000,
  })
}
