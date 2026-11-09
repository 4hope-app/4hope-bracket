import Link from 'next/link'
import { CountryPrompt } from '@/components/CountryPrompt'
import { LadderBoard } from '@/components/LadderBoard'
import { countryName, countrySlug } from '@/lib/countries'
import type { LadderRow } from '@/lib/ladderData'

const MONO = "var(--font-mono, 'Roboto Mono', monospace)"

interface Props {
  title: string
  rows: LadderRow[]
  total: number
  updatedAt: string | null
  /** ISO code for a country ladder. */
  country?: string
  counts: Record<string, number>
  /** A country page with nobody on it: show the "be the first" state. */
  empty?: boolean
}

/** Shared by /ladder and /ladder/[country]. Server component: the first page of the ranking is in the HTML. */
export function LadderView({ title, rows, total, updatedAt, country, counts, empty }: Props) {
  const countries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const name = country ? countryName(country) : undefined
  return (
    <main className="arena mx-auto min-h-screen max-w-5xl px-4 pt-28 pb-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-500" style={{ fontFamily: MONO }}>{'// TFT ranked'}</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.02em]">{title}</h1>
      {country && (
        <p className="mt-2 text-sm"><Link href="/ladder" className="text-white/60 underline underline-offset-4 hover:text-gold-500">Back to the global ladder</Link></p>
      )}
      <p className="mt-2 text-sm text-white/50">
        Ordered by Riot tier, division and LP.
        {updatedAt && ` Last update: ${new Date(updatedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC.`}
      </p>

      <CountryPrompt targetCountryName={name} />

      {empty ? (
        <section className="mt-8 rounded-[14px] border border-white/10 p-8 text-center">
          <h2 className="font-display text-2xl font-black uppercase">Nobody from {name} on the ladder yet.</h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">Be the first. Link your Riot ID, put {name} on your profile and take the top spot.</p>
          <Link href="/profile" className="mt-5 inline-flex h-12 items-center rounded-lg bg-gold-500 px-5 font-display font-bold text-ink-1000 hover:bg-gold-400">Be the first</Link>
        </section>
      ) : (
        <LadderBoard key={country ?? 'global'} initialRows={rows} total={total} country={country} />
      )}

      {countries.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-black uppercase">Ladders by country</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {countries.map(([code, n]) => (
              <li key={code}>
                <Link href={`/ladder/${countrySlug(code)}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm hover:border-gold-500">
                  {countryName(code)} <span className="text-white/50" style={{ fontFamily: MONO }}>{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
