import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  /** Fully round, for avatars. */
  circle?: boolean
  className?: string
}

/** Decorative loading placeholder. Pair it with a visible or screen-reader-only status message. */
export function Skeleton({ width, height = 12, circle, className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height }}
      aria-hidden
    />
  )
}
