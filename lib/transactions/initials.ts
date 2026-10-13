/**
 * Up to two initials from a display name, for the avatar. Splits on whitespace and hyphens so
 * "Okonkwo-Adeyemi Logistics" gives "OA". Tokens without a letter (e.g. "&") are skipped.
 */
export function getInitials(name: string, max = 2): string {
  let initials = ''
  let count = 0
  for (const token of name.split(/[\s-]+/u)) {
    const letter = token.match(/\p{L}/u)?.[0]
    if (!letter) continue
    initials += letter.toLocaleUpperCase('en')
    count += 1
    if (count >= max) break
  }
  return initials
}
