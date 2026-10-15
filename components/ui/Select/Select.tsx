'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  fieldClassName?: string
}

const TYPEAHEAD_RESET_MS = 600

/**
 * Single-select control following the WAI-ARIA "select-only combobox" pattern. The option panel is
 * ordinary DOM (styled to the design), so it looks and behaves the same in every browser and webview,
 * unlike a native <select> popup. Focus never leaves the trigger; the active option is announced with
 * aria-activedescendant.
 */
export function Select({
  label,
  hideLabel,
  options,
  value,
  onChange,
  disabled,
  fieldClassName,
}: SelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', timer: undefined as ReturnType<typeof setTimeout> | undefined })

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const last = options.length - 1

  // Close on any pointer press outside the component.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the active option visible when navigating a long list with the keyboard.
  useEffect(() => {
    if (!open) return
    const element = listRef.current?.children[active] as HTMLElement | undefined
    element?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active])

  useEffect(() => () => clearTimeout(typeahead.current.timer), [])

  const openList = () => {
    setActive(selectedIndex)
    setOpen(true)
  }

  const commit = (index: number) => {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    setOpen(false)
  }

  const findByPrefix = (prefix: string, from: number) => {
    const needle = prefix.toLocaleLowerCase()
    for (let step = 0; step < options.length; step++) {
      const index = (from + step) % options.length
      if (options[index].label.toLocaleLowerCase().startsWith(needle)) return index
    }
    return -1
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openList()
        else setActive((index) => Math.min(index + 1, last))
        return
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openList()
        else setActive((index) => Math.max(index - 1, 0))
        return
      case 'Home':
        if (open) {
          event.preventDefault()
          setActive(0)
        }
        return
      case 'End':
        if (open) {
          event.preventDefault()
          setActive(last)
        }
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) openList()
        else commit(active)
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        return
      case 'Tab':
        setOpen(false)
        return
    }

    // Type-ahead: jump to the next option starting with the typed characters.
    if (event.key.length === 1) {
      const state = typeahead.current
      clearTimeout(state.timer)
      state.text += event.key
      state.timer = setTimeout(() => (state.text = ''), TYPEAHEAD_RESET_MS)
      const from =
        state.text.length === 1 ? (open ? active : selectedIndex) + 1 : open ? active : selectedIndex
      const index = findByPrefix(state.text, from)
      if (index >= 0) {
        if (open) setActive(index)
        else commit(index)
      }
    }
  }

  return (
    <Field label={label} hideLabel={hideLabel} className={fieldClassName}>
      {(control) => (
        <div ref={rootRef} className={styles.root}>
          <button
            {...control}
            type="button"
            role="combobox"
            className={cx(styles.trigger, open && styles.open)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open ? `${listId}-${active}` : undefined}
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onKeyDown}
          >
            <span className={styles.value}>{options[selectedIndex]?.label}</span>
            <Icon name="chevron-down" size={16} className={styles.chevron} />
          </button>

          {open && (
            <ul ref={listRef} id={listId} role="listbox" aria-label={label} className={styles.list}>
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cx(
                    styles.option,
                    index === active && styles.active,
                    index === selectedIndex && styles.selected
                  )}
                  // Keep focus on the trigger while the pointer is used.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => index !== active && setActive(index)}
                  onClick={() => commit(index)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Field>
  )
}
