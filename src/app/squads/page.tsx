import type { Metadata } from 'next'
import { MIN_SQUAD_RANKED_MEMBERS } from '@/lib/ladder'
import { getSquads } from '@/lib/squadData'
import { getSiteUrl, isIndexableEnv } from '@/lib/siteUrl'
import { SquadsBoard } from '@/components/SquadsBoard'

export const dynamic = 'force-dynamic'

const title = 'TFT Squads ranking — best teams | 4Hope'
const description = 'Which squad is on top? 4Hope ranks squads by the average Riot rank of their best five players.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${getSiteUrl()}/squads` },
  robots: isIndexableEnv() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { title, description, type: 'website', siteName: '4Hope', url: `${getSiteUrl()}/squads` },
  twitter: { card: 'summary', title, description },
}

export default async function SquadsPage() {
  const { rows, total } = await getSquads()
  return (
    <main className="arena mx-auto min-h-screen max-w-5xl px-4 pt-28 pb-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold-500" style={{ fontFamily: "var(--font-mono, 'Roboto Mono', monospace)" }}>{'// TFT ranked'}</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.02em]">Squads</h1>
      <p className="mt-2 text-sm text-white/50">
        Average Riot rank of each squad&apos;s best 5 players. A squad needs {MIN_SQUAD_RANKED_MEMBERS} ranked players with a linked Riot ID to be listed.
      </p>
      {total === 0 ? (
        <p className="mt-8 text-white/60">No squad is ranked yet. Create one, invite your crew and link your Riot IDs.</p>
      ) : (
        <SquadsBoard initialRows={rows} total={total} />
      )}
    </main>
  )
}
