'use client'
import { useEffect, useState } from 'react'
import type { Currency, Rate } from '@/types/api'
import { Card, CardHeader } from '@/components/ui'
import { getRate } from '@/lib/api/endpoints'
import { formatTime } from '@/lib/format'
import styles from './RatesWidget.module.css'

const QUOTES: Currency[] = ['USD', 'GHS']

export function RatesWidget({ base }: { base: Currency }) {
  const [rates, setRates] = useState<Rate[]>()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all(QUOTES.map((quote) => getRate(quote, base, { signal: controller.signal })))
      .then((results) => setRates(results.map((res) => res.data)))
      .catch(() => {
        // Rates render as "—" when unavailable.
      })
    return () => controller.abort()
  }, [base])
  const updatedAt = rates?.[0]?.updatedAt

  return (
    <Card>
      <CardHeader title="Today's rates" />
      <dl className={styles.list}>
        {QUOTES.map((quote, i) => {
          const rate = rates?.[i]
          return (
            <div key={quote} className={styles.row}>
              <dt>1 {quote}</dt>
              <dd className={styles.value}>{rate ? `${rate.rate} ${base}` : '—'}</dd>
            </div>
          )
        })}
      </dl>
      {updatedAt && <p className={styles.updated}>Updated {formatTime(updatedAt)}</p>}
    </Card>
  )
}
