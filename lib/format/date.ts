const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Shown when a timestamp cannot be parsed. Intl would otherwise throw a RangeError and crash the render. */
export const INVALID_DATE_TEXT = '—'

function safeFormat(formatter: Intl.DateTimeFormat, iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? INVALID_DATE_TEXT : formatter.format(date)
}

/** "Wed, 30 Sep 2026" (viewer's local time zone) */
export const formatDate = (iso: string) => safeFormat(dateFormatter, iso)

/** "14:22" (viewer's local time zone) */
export const formatTime = (iso: string) => safeFormat(timeFormatter, iso)

/** "Wed, 30 Sep 2026, 14:22" (viewer's local time zone) */
export const formatDateTime = (iso: string) => safeFormat(dateTimeFormatter, iso)
