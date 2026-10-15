import { formatDate } from '@/lib/format'

export interface DayGroup<T> {
  /** Local calendar day as YYYYMMDD, or 0 when the timestamp is invalid. */
  key: number
  /** "Today", "Yesterday" or e.g. "Mon, 5 Oct 2026". */
  label: string
  items: T[]
}

const INVALID_DAY = 0

/** Local calendar day as an integer, so days compare with `===` and no per-row string formatting. */
function dayKey(date: Date): number {
  if (Number.isNaN(date.getTime())) return INVALID_DAY
  return date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate()
}

/**
 * Group consecutive items that fall on the same local calendar day. Single pass, O(n); relies on the API
 * already returning newest first rather than re-sorting.
 *
 * "Today" and "Yesterday" are compared as calendar days, not as `now - 24h`, so DST changes and the hours
 * around midnight are handled correctly.
 */
export function groupByDay<T extends { createdAt: string }>(
  items: readonly T[],
  now: Date = new Date()
): DayGroup<T>[] {
  const todayKey = dayKey(now)
  const yesterdayKey = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))

  const groups: DayGroup<T>[] = []
  for (const item of items) {
    const key = dayKey(new Date(item.createdAt))
    const last = groups.at(-1)
    if (last && last.key === key) {
      last.items.push(item)
      continue
    }
    const label =
      key === INVALID_DAY
        ? 'Unknown date'
        : key === todayKey
          ? 'Today'
          : key === yesterdayKey
            ? 'Yesterday'
            : formatDate(item.createdAt)
    groups.push({ key, label, items: [item] })
  }
  return groups
}
