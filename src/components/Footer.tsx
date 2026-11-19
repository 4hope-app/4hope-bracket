'use client'

import Link from 'next/link'
import { useLang, useLocalizePath, useT } from '@/components/LangProvider'
import { getHomeUrl } from '@/lib/siteUrl'
import { localizePath } from '@/i18n/utils'

/** The only mailbox 4Hope has. Never localized. */
const CONTACT_EMAIL = 'hello@4hope.app'
const DISCLAIMER_ID = 'riot-disclaimer'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const LINK_CLASS = 'inline-flex items-center gap-2 text-sm text-white/55 no-underline hover:text-white hover:underline'

function FooterLinkItem({ link }: { link: FooterLink }) {
  const props = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  // Hash-only and mailto links are plain anchors; internal pages use next/link.
  const internal = link.href.startsWith('/') && !link.external
  return internal ? (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={LINK_CLASS} {...props}>
      {link.label}
    </a>
  )
}

/** Same footer as the home site: brand, four link columns, Riot disclaimer and copyright. */
export function Footer() {
  const lang = useLang()
  const f = useT().footer
  const localize = useLocalizePath()
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? ''

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: f.product,
      links: [
        { label: f.links.home, href: `${getHomeUrl()}${localizePath('/', lang)}`, external: true },
        { label: f.links.lobbies, href: localize('/lobbies') },
        { label: f.links.roster, href: localize('/#roster') },
      ],
    },
    {
      title: f.community,
      links: discordUrl ? [{ label: f.links.discord, href: discordUrl, external: true }] : [],
    },
    {
      title: f.legal,
      links: [
        { label: f.links.terms, href: localize('/terms') },
        { label: f.links.privacy, href: localize('/privacy') },
        { label: f.links.cookies, href: localize('/privacy#cookies') },
        { label: f.links.disclaimer, href: `#${DISCLAIMER_ID}` },
      ],
    },
    {
      title: f.contact,
      links: [
        { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
        { label: f.links.contactSection, href: localize('/#contact') },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/10 bg-ink-900 pb-8 pt-12">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
        <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
          <div className="flex max-w-[280px] flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="4HOPE" width={44} height={55} loading="lazy" className="h-[55px] w-[44px] object-contain" />
            <p className="text-sm text-white/55">{f.tagline}</p>
          </div>
          <nav className="grid grid-cols-2 gap-6 sm:grid-cols-4" aria-label="Footer">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-gold-500">{`// ${col.title}`}</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <hr className="my-8 border-0 border-t border-white/10" />
        <p id={DISCLAIMER_ID} lang="en" className="mb-3 max-w-[80ch] text-xs text-white/55">
          {f.disclaimer}
        </p>
        <p className="text-xs text-white/55">{`© ${new Date().getFullYear()} 4HOPE · ${f.rights}`}</p>
      </div>
    </footer>
  )
}
