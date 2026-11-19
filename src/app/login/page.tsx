import { redirect } from 'next/navigation'
import { getHomeUrl, getSiteUrl } from '@/lib/siteUrl'

// Login lives on the home site (shared session cookie on .4hope.app).
// Bounce there and come back to the page the user wanted.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  // Only allow same-site relative paths ("/x", not "//evil.com").
  const path = callbackUrl && /^\/(?!\/)/.test(callbackUrl) ? callbackUrl : '/register'
  const back = `${getSiteUrl()}${path}`
  redirect(`${getHomeUrl()}/login?callbackUrl=${encodeURIComponent(back)}`)
}
