import type { SelectHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  fieldClassName?: string
}

export function Select({ label, hideLabel, options, fieldClassName, className, ...rest }: SelectProps) {
  return (
    <Field label={label} hideLabel={hideLabel} className={fieldClassName}>
      {(control) => (
        <div className={styles.control}>
          <select className={cx(styles.select, className)} {...rest} {...control}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={16} className={styles.chevron} />
        </div>
      )}
    </Field>
  )
}
