import { cx } from '@/lib/cx'
import { getPageItems } from '@/lib/pagination'
import { Icon } from '../Icon'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  /** Accessible name of the <nav> landmark. */
  label?: string
  className?: string
}

/**
 * Numbered pagination on wide screens; "Prev · Page x of y · Next" on narrow ones.
 * Only one of the two variants is exposed to assistive tech at a time (the other is display: none).
 */
export function Pagination({ page, totalPages, onChange, label = 'Pagination', className }: PaginationProps) {
  const items = getPageItems(page, totalPages)
  const isFirst = page <= 1
  const isLast = page >= totalPages

  const prev = (
    <button
      type="button"
      className={cx(styles.step, styles.prev)}
      disabled={isFirst}
      onClick={() => onChange(page - 1)}
      aria-label="Previous page"
    >
      <Icon name="chevron-left" size={16} />
      <span className={styles.stepLabel}>Previous</span>
      <span className={styles.stepLabelShort}>Prev</span>
    </button>
  )
  const next = (
    <button
      type="button"
      className={cx(styles.step, styles.next)}
      disabled={isLast}
      onClick={() => onChange(page + 1)}
      aria-label="Next page"
    >
      <span className={styles.stepLabel}>Next</span>
      <span className={styles.stepLabelShort}>Next</span>
      <Icon name="chevron-right" size={16} />
    </button>
  )

  return (
    <nav aria-label={label} className={cx(styles.root, className)}>
      {prev}
      <ol className={styles.pages}>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`gap-${index}`} className={styles.ellipsis} aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={cx(styles.page, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                onClick={() => item !== page && onChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ol>
      <span className={styles.summary} aria-live="polite">
        Page {page} of {totalPages}
      </span>
      {next}
    </nav>
  )
}
