'use client'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * Right-hand drawer (bottom sheet on small screens) built on the native <dialog> element, which gives us
 * a focus trap, an inert page behind it, Escape handling and focus restoration for free.
 * It is controlled: Escape and backdrop clicks call `onClose`, and the parent decides whether to close.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: keep the dialog open until the parent flips `open`, so state never drifts from the DOM.
        event.preventDefault()
        onClose()
      }}
      // The panel fills the dialog, so a click whose target is the dialog itself landed on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <div className={styles.panel}>
          <span className={styles.grabber} aria-hidden />
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
