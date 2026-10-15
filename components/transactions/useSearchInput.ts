'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { normaliseSearch } from '@/lib/transactions/params'

const DEBOUNCE_MS = 300

/**
 * Text box state for a search that is committed to the URL.
 * - Typing is debounced; Enter commits immediately.
 * - The box adopts external URL changes (Back/Forward, "Clear filters") without clobbering what the user
 *   is typing when the URL change is just our own commit coming back.
 */
export function useSearchInput(urlValue: string, onCommit: (value: string) => void) {
  const [text, setText] = useState(urlValue)
  const [seenUrlValue, setSeenUrlValue] = useState(urlValue)
  const [lastCommitted, setLastCommitted] = useState(urlValue)

  // Adjust state during render when the URL changed (documented React pattern; avoids an effect + flash).
  if (urlValue !== seenUrlValue) {
    setSeenUrlValue(urlValue)
    if (urlValue !== lastCommitted) {
      setText(urlValue)
      setLastCommitted(urlValue)
    }
  }

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const textRef = useRef(text)
  useEffect(() => {
    textRef.current = text
  }, [text])
  useEffect(() => () => clearTimeout(timer.current), [])

  const commit = useCallback(
    (value: string) => {
      clearTimeout(timer.current)
      const normalised = normaliseSearch(value)
      setLastCommitted(normalised)
      onCommit(normalised)
    },
    [onCommit]
  )

  const onChange = useCallback(
    (value: string) => {
      setText(value)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        // The box may have been reset by Back/Clear filters while this timer was pending.
        if (textRef.current === value) commit(value)
      }, DEBOUNCE_MS)
    },
    [commit]
  )

  return { text, onChange, commitNow: () => commit(text) }
}
