export type PageItem = number | 'ellipsis'

/**
 * Page numbers to render: always the first and last page, the current page with one neighbour each side,
 * and (to match the design's "1 2 3 … 12") the first three pages when near the start, or the last three
 * near the end. A gap of exactly one page is filled with that page rather than an ellipsis.
 * The result has a bounded size regardless of `totalPages`.
 */
export function getPageItems(page: number, totalPages: number): PageItem[] {
  const last = Math.max(1, Math.floor(totalPages))
  const current = Math.min(Math.max(1, Math.floor(page)), last)

  const wanted = new Set<number>([1, last, current - 1, current, current + 1])
  if (current <= 2) for (let p = 1; p <= 3; p++) wanted.add(p)
  if (current >= last - 1) for (let p = last - 2; p <= last; p++) wanted.add(p)

  const pages = [...wanted].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b)

  const items: PageItem[] = []
  for (const [index, p] of pages.entries()) {
    const previous = pages[index - 1]
    if (previous !== undefined) {
      const gap = p - previous
      if (gap === 2) items.push(previous + 1)
      else if (gap > 2) items.push('ellipsis')
    }
    items.push(p)
  }
  return items
}
