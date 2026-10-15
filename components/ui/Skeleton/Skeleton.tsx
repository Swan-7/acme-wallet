import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  /** Fully round, for avatars. */
  circle?: boolean
  /** Corner radius when not a pill, e.g. a form-control placeholder. */
  radius?: CSSProperties['borderRadius']
  className?: string
}

/** Decorative loading placeholder. Pair it with a visible or screen-reader-only status message. */
export function Skeleton({ width, height = 12, circle, radius, className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height, borderRadius: circle ? undefined : radius }}
      aria-hidden
    />
  )
}
