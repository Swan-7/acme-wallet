import { useId, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Field.module.css'

/** What a control needs to be wired to its Field: the label target and the hint/error description. */
export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
}

export interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  /** Visually hide the label (it is still rendered). */
  hideLabel?: boolean
  className?: string
  /** Render prop so the control receives the generated id and aria-describedby. */
  children: (control: FieldControlProps) => ReactNode
}

/** Label + control + hint/error. Used by Input and Select. */
export function Field({ label, hint, error, hideLabel, className, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={cx(styles.label, hideLabel && 'visually-hidden')}>
        {label}
      </label>
      {children({ id, 'aria-describedby': hasMessage ? messageId : undefined })}
      {error ? (
        <p id={messageId} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
