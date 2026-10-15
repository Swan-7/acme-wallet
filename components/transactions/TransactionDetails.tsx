'use client'
import { useEffect, useRef, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, EmptyState, Icon, Money, Skeleton } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { formatDateTime, formatMoney, isCreditType, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { useTransactionQuery } from '@/lib/transactions/queries'
import { displayText } from '@/lib/transactions/text'
import { StatusBadge } from './StatusBadge'
import { TransactionAvatar } from './TransactionAvatar'
import styles from './TransactionDetails.module.css'

export interface TransactionDetailsProps {
  id: string
  /** A transaction we already have (from the list), shown immediately without a request. */
  initialData?: Transaction
  /** Called by the "Back to transactions" action in the not-found state. */
  onClose: () => void
}

export function TransactionDetails({ id, initialData, onClose }: TransactionDetailsProps) {
  const query = useTransactionQuery(id, initialData)

  if (query.data) return <Loaded transaction={query.data} />

  if (query.isPending) return <DetailsSkeleton />

  if (query.error instanceof ApiError && query.error.status === 404) {
    return (
      <EmptyState
        size="sm"
        icon="search"
        title="Transaction not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Button variant="secondary" onClick={onClose}>
            Back to transactions
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      size="sm"
      role="alert"
      icon="alert"
      tone="danger"
      title="We couldn’t load this transaction"
      description="Check your connection and try again."
      action={
        <Button iconLeft="refresh" onClick={() => void query.refetch()}>
          Try again
        </Button>
      }
    />
  )
}

function Loaded({ transaction: tx }: { transaction: Transaction }) {
  const isCredit = isCreditType(tx.type)
  // Fee is charged on top of the amount, in the transaction's own currency (API.md).
  const total = tx.amount + tx.fee

  return (
    <div className={styles.root}>
      <section className={styles.hero} aria-label="Summary">
        <TransactionAvatar transaction={tx} size="lg" />
        <p className={styles.narration}>{displayText(tx.narration)}</p>
        <p className={styles.amount}>
          <Money amount={tx.amount} currency={tx.currency} sign={isCredit ? 'credit' : 'debit'} />
        </p>
        <StatusBadge status={tx.status} />
      </section>

      <section aria-labelledby="tx-details-heading">
        <h3 id="tx-details-heading" className={styles.sectionTitle}>
          Details
        </h3>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton value={tx.reference} />
            </dd>
          </div>
          <Row label="Date">{formatDateTime(tx.createdAt)}</Row>
          <Row label="Type">{TRANSACTION_TYPE_LABELS[tx.type]}</Row>
          {tx.counterparty && <Row label="Counterparty">{displayText(tx.counterparty)}</Row>}
          <Row label="Narration">{displayText(tx.narration)}</Row>
        </dl>
      </section>

      <section aria-labelledby="tx-summary-heading">
        <h3 id="tx-summary-heading" className={styles.sectionTitle}>
          Summary
        </h3>
        <dl className={styles.list}>
          <Row label="Amount">{formatMoney(tx.amount, tx.currency)}</Row>
          <Row label="Fee">{formatMoney(tx.fee, tx.currency)}</Row>
          <div className={styles.total}>
            <dt>Total</dt>
            <dd>{formatMoney(total, tx.currency)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission). The reference stays selectable.
    }
  }

  return (
    <>
      <button type="button" className={styles.copy} onClick={copy} aria-label="Copy reference">
        <Icon name="copy" size={16} />
      </button>
      <span className="visually-hidden" role="status">
        {copied ? 'Reference copied' : ''}
      </span>
    </>
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.root} role="status" aria-label="Loading transaction">
      <div className={styles.hero}>
        <Skeleton circle width={48} height={48} />
        <Skeleton width={160} height={12} />
        <Skeleton width={200} height={24} />
        <Skeleton width={84} height={22} />
      </div>
      <div className={styles.skeletonRows}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <Skeleton width={90} height={12} />
            <Skeleton width={140} height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}
