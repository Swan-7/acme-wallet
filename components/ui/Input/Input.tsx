'use client'
import { useRef, type InputHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon, type IconName } from '../Icon'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  hideLabel?: boolean
  hint?: ReactNode
  error?: string
  leadingIcon?: IconName
  fieldClassName?: string
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  leadingIcon,
  fieldClassName,
  className,
  ...rest
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Any press inside the field box (icon, padding) focuses the input, so the whole box is a click target.
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== inputRef.current && inputRef.current && !inputRef.current.disabled) {
      event.preventDefault()
      inputRef.current.focus()
    }
  }

  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} className={fieldClassName}>
      {(control) => (
        <div className={styles.control} onMouseDown={focusInput}>
          {leadingIcon && <Icon name={leadingIcon} size={16} className={styles.icon} />}
          <input
            ref={inputRef}
            className={cx(styles.input, leadingIcon && styles.withIcon, error && styles.invalid, className)}
            aria-invalid={error ? true : undefined}
            {...rest}
            {...control}
          />
        </div>
      )}
    </Field>
  )
}
