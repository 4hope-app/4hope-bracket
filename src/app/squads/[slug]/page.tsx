import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { countryName } from '@/lib/countries'
import { MIN_SQUAD_RANKED_MEMBERS, SQUAD_SCORE_MEMBERS, tierLabel } from '@/lib/ladder'
import { getSquad } from '@/lib/squadData'
import { getSiteUrl, isIndexableEnv } from '@/lib/siteUrl'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }
const MONO = "var(--font-mono, 'Roboto Mono', monospace)"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug
  const found = await getSquad(slug.toLowerCase())
  if (found.kind !== 'found') return { title: 'Squad', robots: { index: false, follow: false } }
  const s = found.squad
  const url = `${getSiteUrl()}/squads/${s.slug}`
  const title = `${s.name} — TFT squad | 4Hope`
  const description = `${s.name}: ${s.memberCount} player${s.memberCount === 1 ? '' : 's'}${s.tier ? `, average rank ${tierLabel(s.tier, s.rank)}` : ''}${s.position ? ` (#${s.position} on the 4Hope squads ranking)` : ''}.`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isIndexableEnv() && s.rankedCount >= MIN_SQUAD_RANKED_MEMBERS ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, type: 'website', siteName: '4Hope', url },
    twitter: { card: 'summary', title, description },
  }
}

export default async function SquadPage({ params }: Props) {
  const slug = (await params).slug
  const found = await getSquad(slug.toLowerCase())
  if (found.kind === 'none') notFound()
  if (found.kind === 'redirect') permanentRedirect(`/squads/${found.slug}`)
  if (found.kind !== 'found') notFound()
  const s = found.squad
  if (slug !== s.slug) permanentRedirect(`/squads/${s.slug}`)

  return (
    <main className="arena mx-auto min-h-screen max-w-4xl px-4 pt-28 pb-16">
      <p className="text-sm"><Link href="/squads" className="text-white/60 underline underline-offset-4 hover:text-gold-500">All squads</Link></p>
      <header className="mt-4 flex items-center gap-5">
        <Avatar src={s.logoURL} name={s.name} size="xl" ring />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-500" style={{ fontFamily: MONO }}>{`// Squad${s.code ? ` · ${s.code}` : ''}${s.country ? ` · ${countryName(s.country)}` : ''}`}</p>
          <h1 className="truncate font-display text-4xl font-black uppercase tracking-[-0.02em]">{s.name}</h1>
          <p className="mt-1 text-sm text-white/60">
            {s.position ? (
              <>#{s.position} · average <span className="font-semibold text-white">{tierLabel(s.tier, s.rank)}</span> · {s.lp.toLocaleString()} LP</>
            ) : (
              <>Not ranked yet — needs {MIN_SQUAD_RANKED_MEMBERS} players with a linked, ranked Riot ID.</>
            )}
          </p>
        </div>
      </header>

      <h2 className="mt-10 font-display text-xl font-black uppercase">Players</h2>
      <p className="mt-1 text-xs text-white/50" style={{ fontFamily: MONO }}>{`// TOP ${SQUAD_SCORE_MEMBERS} RANKED COUNT TOWARD THE AVERAGE`}</p>
      <ul className="mt-3 space-y-2">
        {s.members.map((m) => (
          <li key={m.username} className={`flex items-center gap-4 rounded-[14px] border px-4 py-2.5 ${m.counts ? 'border-gold-500/40' : 'border-white/10'}`}>
            <Avatar src={m.photoURL} name={m.name} size="md" />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {m.name}
              {m.isManager && <span className="ml-2 text-xs uppercase text-gold-500" style={{ fontFamily: MONO }}>Manager</span>}
            </span>
            {m.country && <span className="hidden text-xs text-white/40 sm:block" style={{ fontFamily: MONO }}>{m.country}</span>}
            <span className="w-28 text-right text-sm text-white/80">{m.tier ? tierLabel(m.tier, m.rank) : 'Unranked'}</span>
            <span className="w-24 text-right text-sm">{m.tier ? <><span className="font-bold">{m.lp.toLocaleString()}</span> <span className="text-white/50">LP</span></> : <span className="text-white/30">–</span>}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
