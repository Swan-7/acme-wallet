'use client'
import type { Currency } from '@/types/api'
import { Card, CardHeader, Skeleton } from '@/components/ui'
import { formatTime } from '@/lib/format'
import { useRateQuery } from '@/lib/rates/queries'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

function RateRow({ quote, base }: { quote: Currency; base: Currency }) {
  const query = useRateQuery(quote, base)
  const rate = query.data

  return (
    <div className={styles.row}>
      <dt>1 {quote}</dt>
      <dd className={styles.value}>
        {rate ? `${rate.rate} ${base}` : query.isError ? '—' : <Skeleton width={84} height={14} />}
      </dd>
    </div>
  )
}

export function RatesWidget({ base }: { base: Currency }) {
  const usd = useRateQuery('USD', base)
  const ghs = useRateQuery('GHS', base)
  const loading = (!usd.data && !usd.isError) || (!ghs.data && !ghs.isError)
  const failed = usd.isError || ghs.isError
  const updatedAt = usd.data?.updatedAt

  return (
    <Card>
      <CardHeader title="Today's rates" />
      <dl className={styles.list}>
        {QUOTES.map((quote) => (
          <RateRow key={quote} quote={quote} base={base} />
        ))}
      </dl>
      {loading && <Skeleton width={96} height={12} className={styles.updatedSkeleton} />}
      {!loading && updatedAt && <p className={styles.updated}>Updated {formatTime(updatedAt)}</p>}
      {failed && (
        <p className={styles.updated}>
          Some rates are unavailable.{' '}
          <button
            type="button"
            className={styles.retry}
            onClick={() => {
              void usd.refetch()
              void ghs.refetch()
            }}
          >
            Try again
          </button>
        </p>
      )}
    </Card>
  )
}
