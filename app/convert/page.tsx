'use client'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import type { Conversion, Currency } from '@/types/api'
import { CURRENCIES } from '@/types/api'
import { Button, Card, Input, Money, Select } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { convert } from '@/lib/api/endpoints'
import { parseMoney } from '@/lib/format'
import { useRateQuery } from '@/lib/rates/queries'
import { useMeQuery } from '@/lib/user/queries'
import styles from './page.module.css'

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }))

/** crypto.randomUUID needs a secure context; fall back for plain-http LAN testing. */
function newIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ConvertPage() {
  const [from, setFrom] = useState<Currency>('USD')
  const [to, setTo] = useState<Currency>('NGN')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<Conversion | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const queryClient = useQueryClient()
  const user = useMeQuery().data
  // Keyed by the pair, so a rate for a previous pair is never shown while the new one loads.
  const rate = useRateQuery(from, to).data

  // Single-flight lock (state updates are async, so a fast double-tap could otherwise submit twice) and
  // the idempotency key for the current intent. The key is kept across an unconfirmed outcome so a manual
  // retry of the same conversion is recognisable as the same request.
  const inFlight = useRef(false)
  const attempt = useRef<{ signature: string; key: string } | null>(null)
  const value = parseMoney(amount, from) ?? 0
  const fee = Math.round(value * 0.015)
  const youGet = rate ? Math.floor(value * rate.rate) : 0
  const wallet = user?.wallets.find((w) => w.currency === from)
  const canSubmit = value > 0 && from !== to && !submitting

  const handleConvert = async () => {
    if (!canSubmit || inFlight.current) return
    inFlight.current = true
    setError('')
    setSubmitting(true)

    const signature = `${from}:${to}:${value}`
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: newIdempotencyKey() }
    const key = attempt.current.key

    try {
      const res = await convert({ from, to, amount: value }, { headers: { 'Idempotency-Key': key } })
      attempt.current = null
      setResult(res.data)
      setAmount('')
    } catch (err) {
      if (err instanceof ApiError && !err.isRetryable) {
        // The server definitively refused it (validation, insufficient funds): a fresh intent next time.
        attempt.current = null
        setError(err.message)
      } else {
        // Network drop or 5xx: we do not know whether the conversion was applied. Say so, and reconcile
        // against the server rather than claiming success or failure.
        setError(
          'We couldn’t confirm whether this conversion went through. Check your transactions before trying again.'
        )
      }
    } finally {
      // Whatever happened, balances and history may have changed: refresh them from the server.
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Convert currency</h1>

      <Card>
        <div className={styles.row}>
          <Select
            label="From"
            options={CURRENCY_OPTIONS}
            value={from}
            onChange={(e) => setFrom(e.target.value as Currency)}
            fieldClassName={styles.currency}
          />
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={
              wallet ? (
                <>
                  Balance: <Money amount={wallet.balance} currency={from} />
                </>
              ) : (
                'Balance: …'
              )
            }
            fieldClassName={styles.amount}
          />
        </div>

        <Select
          label="To"
          options={CURRENCY_OPTIONS}
          value={to}
          onChange={(e) => setTo(e.target.value as Currency)}
          fieldClassName={styles.to}
        />

        <dl className={styles.summary}>
          <div className={styles.summaryRow}>
            <dt>Rate</dt>
            <dd>{rate ? `1 ${from} = ${rate.rate} ${to}` : '…'}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Fee (1.5%)</dt>
            <dd>
              <Money amount={fee} currency={from} />
            </dd>
          </div>
          <div className={styles.summaryTotal}>
            <dt>You get</dt>
            <dd>
              <Money amount={youGet} currency={to} />
            </dd>
          </div>
        </dl>

        {error && <p className={styles.error}>{error}</p>}

        <Button fullWidth onClick={handleConvert} disabled={!canSubmit}>
          {submitting ? 'Converting…' : 'Convert'}
        </Button>
      </Card>

      {result && (
        <Card className={styles.success}>
          Conversion successful. You received <Money amount={result.received} currency={result.to} />.
        </Card>
      )}
    </div>
  )
}
