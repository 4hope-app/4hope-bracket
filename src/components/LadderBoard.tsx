'use client'

import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Input } from '@/components/ui'
import { LADDER_PAGE_SIZE, tierLabel } from '@/lib/ladder'
import type { LadderRow } from '@/lib/ladderData'

const MONO = "var(--font-mono, 'Roboto Mono', monospace)"
const PODIUM_RING = { 1: 'ring-gold-500', 2: 'ring-white/60', 3: 'ring-[#B4763A]' } as const

interface Props {
  initialRows: LadderRow[]
  total: number
  /** ISO code when this board is a country ladder. */
  country?: string
}

/** Podium + rows. Server renders the first page (so crawlers see it); this adds "See more" and search. */
export function LadderBoard({ initialRows, total: initialTotal, country }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [total, setTotal] = useState(initialTotal)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const first = useRef(true)

  const fetchPage = async (offset: number, query: string, after?: string) => {
    const params = new URLSearchParams({ offset: String(offset), q: query })
    if (after) params.set('after', after)
    if (country) params.set('country', country)
    const res = await fetch(`/api/ladder?${params}`)
    if (!res.ok) throw new Error('failed')
    return (await res.json()) as { rows: LadderRow[]; total: number }
  }

  // Debounced search: replaces the list; clearing it restores the first page.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const h = setTimeout(() => {
      fetchPage(0, q).then((d) => (setRows(d.rows), setTotal(d.total))).catch(() => {})
    }, 250)
    return () => clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const more = async () => {
    setLoading(true)
    try {
      const d = await fetchPage(rows.length, q, rows[rows.length - 1]?.username)
      setRows((r) => [...r, ...d.rows])
      setTotal(d.total)
    } finally {
      setLoading(false)
    }
  }

  const searching = q.trim() !== ''
  const top = searching ? [] : rows.slice(0, 3)
  const podium = [top[1], top[0], top[2]].filter(Boolean) as LadderRow[]
  const rest = searching ? rows : rows.slice(3)

  return (
    <div>
      <Input placeholder="Search a player or Riot ID" value={q} onChange={(e) => setQ(e.target.value)} maxLength={40} wrapperClassName="mt-6 max-w-sm" />

      {podium.length > 0 && (
        <div className="mt-6 grid grid-cols-3 items-end gap-3">
          {podium.map((r) => {
            const winner = r.position === 1
            return (
              <div key={r.username} className={`flex flex-col items-center rounded-[14px] border p-4 text-center ${winner ? 'border-gold-500 bg-gold-500/10 pb-8' : 'border-white/10 bg-white/5'}`}>
                <Avatar src={r.photoURL} name={r.name} size="xl" className={`ring-4 ${PODIUM_RING[r.position as 1 | 2 | 3]}`} />
                <p className="mt-3 max-w-full truncate font-display text-lg font-black uppercase">
                  {r.gameName}<span className="text-sm text-white/50">#{r.tagLine}</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-white/80">{tierLabel(r.tier, r.rank)}</p>
                <p className="text-sm text-white/60"><span className="font-bold text-white">{r.lp.toLocaleString()}</span> LP</p>
                <p className={`mt-3 font-display text-4xl font-black ${winner ? 'text-gold-500' : 'text-white/70'}`}>{r.position}</p>
              </div>
            )
          })}
        </div>
      )}

      <ol className="mt-4 space-y-2">
        {rest.map((r) => (
          <li key={r.username} className="flex items-center gap-4 rounded-[14px] border border-white/10 px-4 py-2.5">
            <span className="w-10 font-display text-xl font-black text-white/50">{r.position}</span>
            <Avatar src={r.photoURL} name={r.name} size="md" />
            <span className="min-w-0 flex-1 truncate font-semibold">{r.gameName}<span className="text-white/50">#{r.tagLine}</span></span>
            {r.country && !country && <span className="hidden text-xs text-white/40 sm:block" style={{ fontFamily: MONO }}>{r.country}</span>}
            <span className="w-28 text-right text-sm text-white/80">{tierLabel(r.tier, r.rank)}</span>
            <span className="w-24 text-right text-sm"><span className="font-bold">{r.lp.toLocaleString()}</span> <span className="text-white/50">LP</span></span>
          </li>
        ))}
      </ol>

      {searching && rows.length === 0 && <p className="mt-6 text-white/60">No player matches that search.</p>}
      {!searching && rows.length < total && (
        <div className="mt-5 flex justify-center">
          <Button variant="subtle" disabled={loading} onClick={more}>
            {loading ? 'Loading…' : `See more (${Math.min(LADDER_PAGE_SIZE, total - rows.length)} of ${total - rows.length} left)`}
          </Button>
        </div>
      )}
    </div>
  )
}
