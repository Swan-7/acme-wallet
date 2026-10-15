import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/** Minimal stand-in for next/navigation: a URL held in React state, with push/replace/back. */
interface NavState {
  search: URLSearchParams
  push: (url: string) => void
  replace: (url: string) => void
  back: () => void
}

const NavContext = createContext<NavState | null>(null)

const parse = (url: string) => new URLSearchParams(url.split('?')[1] ?? '')

export function FakeNavigation({
  initialUrl = '/transactions',
  children,
}: {
  initialUrl?: string
  children: ReactNode
}) {
  const [stack, setStack] = useState<string[]>([initialUrl])
  const current = stack[stack.length - 1]
  const push = useCallback((url: string) => setStack((s) => [...s, url]), [])
  const replace = useCallback((url: string) => setStack((s) => [...s.slice(0, -1), url]), [])
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const value = useMemo(
    () => ({ search: parse(current), push, replace, back }),
    [current, push, replace, back]
  )
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('FakeNavigation missing')
  return ctx
}

export const navigationMock = {
  usePathname: () => '/transactions',
  useSearchParams: () => useNav().search,
  useRouter: () => {
    const { push, replace, back } = useNav()
    return { push, replace, back }
  },
}
