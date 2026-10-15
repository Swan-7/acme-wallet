/**
 * Upstream narration is untrusted free text and can contain markup (see API.md). React already escapes it
 * so it is inert, but showing "<img src=x onerror=...>" to a person is just noise. Drop tag-shaped
 * fragments for display; the value is still rendered as text, never as HTML.
 */
const TAG_PATTERN = /<\/?[a-z][^>]*>/gi

export function displayText(value: string): string {
  const cleaned = value.replace(TAG_PATTERN, '').replace(/\s+/g, ' ').trim()
  return cleaned
}
