'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang, useT } from '@/components/LangProvider'
import { languages, localizePath, parsePathname, type Lang } from '@/i18n/utils'

/** ES / EN toggle. Keeps the current page (and query string) and only swaps the language. */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const lang = useLang()
  const d = useT()
  const pathname = usePathname()
  const { path } = parsePathname(pathname)

  return (
    <nav
      aria-label={d.a11y.language}
      className={`inline-flex gap-0.5 rounded-full border border-white/10 bg-ink-800 p-[3px] ${className}`}
    >
      {(Object.keys(languages) as Lang[]).map((l) => (
        <Link
          key={l}
          href={localizePath(path, l)}
          // Keep the query and hash. Read at click time so this component needs no Suspense
          // boundary (useSearchParams would force every page that shows the menu to be dynamic).
          onClick={(e) => {
            const { search, hash } = window.location
            e.currentTarget.href = `${localizePath(path, l)}${search}${hash}`
          }}
          hrefLang={l}
          lang={l}
          prefetch={false}
          aria-current={l === lang ? 'true' : undefined}
          aria-label={`${l.toUpperCase()} · ${languages[l]}`}
          className={`min-w-9 rounded-full px-[9px] py-[5px] text-center font-mono text-xs font-medium tracking-[0.08em] no-underline transition-colors ${
            l === lang ? 'bg-ink-700 text-white' : 'text-white/55 hover:text-white'
          }`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </nav>
  )
}
