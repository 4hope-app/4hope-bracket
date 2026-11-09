import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { tierLabel } from '@/lib/ladder'
import type { LadderRow } from '@/lib/ladderData'

interface Props {
  rows: LadderRow[]
  kicker?: string
  heading?: string
}

/** Home teaser: the top of the global ladder, with a way into the full /ladder page. */
export function LadderSection({ rows, kicker = '// TFT · ranked', heading = 'The ladder' }: Props) {
  return (
    <section className="relative isolate w-full overflow-hidden bg-ink-1000 px-8 py-20 sm:px-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-10 h-8 w-[220px] -rotate-[32deg] rounded-md bg-gold-500 sm:-right-16 sm:-top-4 sm:h-12 sm:w-[360px]" />

      <span className="relative font-mono text-lg uppercase tracking-[0.16em] text-gold-500">{kicker}</span>
      <h2 className="relative mb-10 mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
        {heading}
      </h2>

      {rows.length === 0 ? (
        <p className="relative max-w-xl text-white/70">Nobody is ranked yet. Link your Riot ID and take the first spot.</p>
      ) : (
        <ol className="relative space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`flex items-center gap-4 rounded-2xl border bg-ink-800 p-4 ${r.position === 1 ? 'border-gold-500' : 'border-white/10'}`}>
              <span className={`w-10 text-center font-display text-3xl font-black ${r.position === 1 ? 'text-gold-500' : 'text-white/50'}`}>{r.position}</span>
              <Avatar src={r.photoURL} name={r.name} size="lg" ring={r.position === 1} />
              <span className="min-w-0 flex-1 truncate font-display text-lg font-extrabold text-white">
                {r.gameName}<span className="text-sm font-normal text-white/50">#{r.tagLine}</span>
              </span>
              <span className="hidden font-mono text-xs uppercase tracking-[0.06em] text-gold-500 sm:block">{tierLabel(r.tier, r.rank)}</span>
              <span className="font-mono text-sm text-white/70">{r.lp.toLocaleString()} LP</span>
            </li>
          ))}
        </ol>
      )}

      <div className="relative mt-8">
        <Link href="/ladder" className="inline-flex h-12 items-center rounded-lg bg-gold-500 px-5 font-display font-bold text-ink-1000 transition-colors hover:bg-gold-400">
          See full ladder
        </Link>
      </div>
    </section>
  )
}
