/**
 * Date of the current Terms and Privacy Policy. It is shown as "Last updated" on both pages and stored with each
 * account's consent, so bump it whenever either page's text changes. Steps (changelog entry, git tag) are in
 * LEGAL_CHANGELOG.md.
 */
export const TERMS_VERSION = '2026-10-18'

export const TERMS_UPDATED_LABEL = new Date(`${TERMS_VERSION}T00:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})
