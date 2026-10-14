import { formatDate, formatTime } from '@/lib/format'
import { groupByDay } from './group'
import { getInitials } from './initials'
import { getPageItems } from '@/lib/pagination'
import { applyTransactionParams, hasActiveFilters, parseTransactionParams, toApiQuery } from './params'

describe('parseTransactionParams', () => {
  const parse = (qs: string) => parseTransactionParams(new URLSearchParams(qs))

  it('returns defaults for an empty query', () => {
    expect(parse('')).toEqual({ q: '', type: null, status: null, page: 1, tx: null })
  })

  it('accepts known values', () => {
    expect(parse('q=netflix&type=card_payment&status=failed&page=3&tx=txn_255s')).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
      tx: 'txn_255s',
    })
  })

  it.each([
    ['type=hack', 'type'],
    ['type=toString', 'type'],
    ['type=__proto__', 'type'],
    ['status=reversed', 'status'],
  ])('drops unknown filter value %s', (qs, key) => {
    expect(parse(qs)[key as 'type' | 'status']).toBeNull()
  })

  it.each(['0', '-1', '1.5', 'abc', '', '1e3', '9999999', ' 2'])(
    'falls back to page 1 for page=%j',
    (page) => {
      expect(parse(`page=${encodeURIComponent(page)}`).page).toBe(1)
    }
  )

  it.each(['../me', 'a/b', 'x?y=1', '<script>', 'a'.repeat(65), ''])('rejects tx=%j', (tx) => {
    expect(parse(`tx=${encodeURIComponent(tx)}`).tx).toBeNull()
  })

  it('trims and caps the search text', () => {
    expect(parse('q=%20%20hello%20').q).toBe('hello')
    expect(parse(`q=${'a'.repeat(500)}`).q).toHaveLength(100)
  })
})

describe('applyTransactionParams', () => {
  it('keeps parameters it does not own, e.g. the mock __scenario flag', () => {
    const next = applyTransactionParams(new URLSearchParams('__scenario=slow&page=4'), { page: 5 })
    expect(next.get('__scenario')).toBe('slow')
    expect(next.get('page')).toBe('5')
  })

  it('omits defaults so URLs stay canonical', () => {
    const next = applyTransactionParams(new URLSearchParams('page=3&type=deposit'), {
      page: 1,
      type: null,
    })
    expect(next.toString()).toBe('')
  })

  it('resets the page when the search or a filter changes', () => {
    const base = new URLSearchParams('page=7&tx=txn_1')
    expect(applyTransactionParams(base, { q: 'netflix' }).get('page')).toBeNull()
    expect(applyTransactionParams(base, { status: 'pending' }).get('page')).toBeNull()
    expect(applyTransactionParams(base, { type: 'deposit' }).get('page')).toBeNull()
  })

  it('does not reset the page when only the open transaction changes', () => {
    const next = applyTransactionParams(new URLSearchParams('page=7'), { tx: 'txn_1' })
    expect(next.get('page')).toBe('7')
    expect(next.get('tx')).toBe('txn_1')
  })

  it('does not mutate its input', () => {
    const base = new URLSearchParams('page=2')
    applyTransactionParams(base, { page: 3 })
    expect(base.get('page')).toBe('2')
  })
})

describe('hasActiveFilters / toApiQuery', () => {
  it('detects any narrowing', () => {
    expect(hasActiveFilters({ q: '', type: null, status: null })).toBe(false)
    expect(hasActiveFilters({ q: 'a', type: null, status: null })).toBe(true)
    expect(hasActiveFilters({ q: '', type: 'deposit', status: null })).toBe(true)
    expect(hasActiveFilters({ q: '', type: null, status: 'failed' })).toBe(true)
  })

  it('maps to the API query without empty values', () => {
    const query = toApiQuery({ q: '', type: null, status: 'pending', page: 2, tx: 'txn_1' })
    expect(query).toEqual({ page: 2, limit: 20, q: undefined, type: undefined, status: 'pending' })
  })
})

describe('getPageItems', () => {
  it('shows every page for short lists', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('matches the design near the start', () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, 3, 'ellipsis', 12])
    expect(getPageItems(2, 12)).toEqual([1, 2, 3, 'ellipsis', 12])
    expect(getPageItems(3, 12)).toEqual([1, 2, 3, 4, 'ellipsis', 12])
  })

  it('collapses both sides in the middle', () => {
    expect(getPageItems(6, 12)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 12])
  })

  it('fills a single-page gap instead of an ellipsis', () => {
    expect(getPageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 12])
    expect(getPageItems(9, 12)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12])
  })

  it('mirrors the start near the end', () => {
    expect(getPageItems(12, 12)).toEqual([1, 'ellipsis', 10, 11, 12])
    expect(getPageItems(11, 12)).toEqual([1, 'ellipsis', 10, 11, 12])
  })

  it('stays bounded and clamps out-of-range input', () => {
    expect(getPageItems(500, 100_000).length).toBeLessThanOrEqual(7)
    expect(getPageItems(99, 12)).toEqual(getPageItems(12, 12))
    expect(getPageItems(0, 0)).toEqual([1])
  })
})

describe('getInitials', () => {
  it.each([
    ['Ada Okafor', 'AO'],
    ['Kwame Mensah', 'KM'],
    ['Okonkwo-Adeyemi Logistics & Haulage International Ltd', 'OA'],
    ['Madonna', 'M'],
    ['  tunde   bakare ', 'TB'],
    ['& Co', 'C'],
    ['', ''],
  ])('%j -> %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected)
  })
})

describe('groupByDay', () => {
  const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min)
  const tx = (date: Date, id: string) => ({ id, createdAt: date.toISOString() })

  it('labels today, yesterday and older days, in a single ordered pass', () => {
    const now = at(2026, 10, 13, 15)
    const items = [
      tx(at(2026, 10, 13, 14, 22), 'a'),
      tx(at(2026, 10, 13, 9, 3), 'b'),
      tx(at(2026, 10, 12, 23, 59), 'c'),
      tx(at(2026, 10, 5, 10, 15), 'd'),
    ]
    const groups = groupByDay(items, now)
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', formatDate(items[3].createdAt)])
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([['a', 'b'], ['c'], ['d']])
  })

  it('treats 00:00 and 23:59 as the same calendar day', () => {
    const now = at(2026, 10, 13, 12)
    const groups = groupByDay([tx(at(2026, 10, 13, 23, 59), 'a'), tx(at(2026, 10, 13, 0, 0), 'b')], now)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Today')
  })

  it('crosses month and year boundaries for "Yesterday"', () => {
    const now = at(2027, 1, 1, 8)
    const groups = groupByDay([tx(at(2026, 12, 31, 20), 'a')], now)
    expect(groups[0].label).toBe('Yesterday')
  })

  it('groups unparseable timestamps instead of throwing', () => {
    const groups = groupByDay([{ createdAt: 'nope', id: 'x' }])
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Unknown date')
  })

  it('returns no groups for no items', () => {
    expect(groupByDay([])).toEqual([])
  })
})

describe('date formatting', () => {
  it('returns a placeholder for invalid timestamps rather than throwing', () => {
    expect(formatDate('not-a-date')).toBe('—')
    expect(formatTime('')).toBe('—')
  })

  it('uses 24-hour time', () => {
    const iso = new Date(2026, 9, 5, 7, 5).toISOString()
    expect(formatTime(iso)).toBe('07:05')
  })
})
