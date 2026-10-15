import type { MouseEventHandler, ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './Button.module.css'

export interface ButtonProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  iconLeft?: IconName
  iconRight?: IconName
  fullWidth?: boolean
  disabled?: boolean
  /** Defaults to "button" so a Button inside a <form> never submits by accident. */
  type?: 'button' | 'submit' | 'reset'
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  'aria-label'?: string
  'aria-busy'?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  disabled,
  type = 'button',
  onClick,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
