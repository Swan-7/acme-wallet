import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  tone?: 'primary' | 'danger'
  title: string
  description?: string
  /** Typically a Button. */
  action?: ReactNode
  /** Use "alert" for failures so assistive tech announces them. */
  role?: 'status' | 'alert'
  className?: string
}

export function EmptyState({
  icon,
  tone = 'primary',
  title,
  description,
  action,
  role,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.root, className)} role={role}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={22} />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
