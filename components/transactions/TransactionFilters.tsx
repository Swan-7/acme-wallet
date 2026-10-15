'use client'
import type { KeyboardEvent } from 'react'
import type { TransactionStatus, TransactionType } from '@/types/api'
import { Button, Select, Input, type SelectOption } from '@/components/ui'
import { cx } from '@/lib/cx'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { SEARCH_MAX_LENGTH } from '@/lib/transactions/params'
import styles from './TransactionFilters.module.css'
import { useMediaQuery } from './useMediaQuery'

const ALL = ''

const TYPE_OPTIONS: SelectOption[] = [
  { value: ALL, label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: ALL, label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export interface TransactionFiltersProps {
  searchText: string
  onSearchTextChange: (value: string) => void
  onSearchSubmit: () => void
  type: TransactionType | null
  onTypeChange: (value: string) => void
  status: TransactionStatus | null
  onStatusChange: (value: string) => void
  showClear: boolean
  onClear: () => void
}

export function TransactionFilters({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  type,
  onTypeChange,
  status,
  onStatusChange,
  showClear,
  onClear,
}: TransactionFiltersProps) {
  const isNarrow = useMediaQuery('(max-width: 640px)')

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter commits immediately; skip while an IME composition is confirming a candidate.
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) onSearchSubmit()
  }

  return (
    <form
      className={styles.filters}
      role="search"
      aria-label="Filter transactions"
      onSubmit={(event) => event.preventDefault()}
    >
      <Input
        label="Search"
        leadingIcon="search"
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isNarrow ? 'Search reference, name…' : 'Search by reference, name or narration'}
        maxLength={SEARCH_MAX_LENGTH}
        autoComplete="off"
        spellCheck={false}
        inputMode="search"
        enterKeyHint="search"
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type ?? ALL}
        onChange={onTypeChange}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status ?? ALL}
        onChange={onStatusChange}
        fieldClassName={styles.status}
      />
      {/* Always laid out so the search field keeps its width; inert (unfocusable, hidden from AT) while idle. */}
      <div className={cx(styles.clear, !showClear && styles.clearIdle)} inert={!showClear}>
        <Button variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </form>
  )
}
