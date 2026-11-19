import { redirect } from 'next/navigation'
import { getHomeUrl, getSiteUrl } from '@/lib/siteUrl'
import { defaultLang, isLang, localizePath, parsePathname } from '@/i18n/utils'

// Login lives on the home site (shared session cookie on .4hope.app).
// Bounce there and come back to the page the user wanted.
export default async function LoginPage({ params, searchParams }: PageProps<'/[lang]/login'>) {
  const { lang: rawLang } = await params
  const lang = isLang(rawLang) ? rawLang : defaultLang
  const { callbackUrl: rawCallback } = await searchParams
  const callbackUrl = typeof rawCallback === 'string' ? rawCallback : undefined
  // Only allow same-site relative paths ("/x", not "//evil.com").
  const path = callbackUrl && /^\/(?!\/)/.test(callbackUrl) ? callbackUrl : '/register'
  // Come back in the same language: add the /en prefix unless the path already has it.
  const back = `${getSiteUrl()}${localizePath(parsePathname(path).path, lang)}`
  redirect(`${getHomeUrl()}${localizePath('/login', lang)}?callbackUrl=${encodeURIComponent(back)}`)
}
