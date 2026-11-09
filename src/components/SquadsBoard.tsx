'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Avatar, Button, Input } from '@/components/ui'
import { LADDER_PAGE_SIZE, tierLabel } from '@/lib/ladder'
import type { SquadRow } from '@/lib/squadData'

const MONO = "var(--font-mono, 'Roboto Mono', monospace)"
const PODIUM_RING = { 1: 'ring-gold-500', 2: 'ring-white/60', 3: 'ring-[#B4763A]' } as const

/** Podium + rows for /squads. Server renders the first page; this adds "See more" and search. */
export function SquadsBoard({ initialRows, total: initialTotal }: { initialRows: SquadRow[]; total: number }) {
  const [rows, setRows] = useState(initialRows)
  const [total, setTotal] = useState(initialTotal)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const first = useRef(true)

  const fetchPage = async (offset: number, query: string, after?: string) => {
    const params = new URLSearchParams({ offset: String(offset), q: query })
    if (after) params.set('after', after)
    const res = await fetch(`/api/squads?${params}`)
    if (!res.ok) throw new Error('failed')
    return (await res.json()) as { rows: SquadRow[]; total: number }
  }

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const h = setTimeout(() => {
      fetchPage(0, q).then((d) => (setRows(d.rows), setTotal(d.total))).catch(() => {})
    }, 250)
    return () => clearTimeout(h)
  }, [q])

  const more = async () => {
    setLoading(true)
    try {
      const d = await fetchPage(rows.length, q, rows[rows.length - 1]?.slug)
      setRows((r) => [...r, ...d.rows])
      setTotal(d.total)
    } finally {
      setLoading(false)
    }
  }

  const searching = q.trim() !== ''
  const top = searching ? [] : rows.slice(0, 3)
  const podium = [top[1], top[0], top[2]].filter(Boolean) as SquadRow[]
  const rest = searching ? rows : rows.slice(3)

  return (
    <div>
      <Input placeholder="Search a squad" value={q} onChange={(e) => setQ(e.target.value)} maxLength={24} wrapperClassName="mt-6 max-w-sm" />

      {podium.length > 0 && (
        <div className="mt-6 grid grid-cols-3 items-end gap-3">
          {podium.map((r) => {
            const winner = r.position === 1
            return (
              <Link key={r.slug} href={`/squads/${r.slug}`} className={`flex flex-col items-center rounded-[14px] border p-4 text-center transition hover:border-gold-500 ${winner ? 'border-gold-500 bg-gold-500/10 pb-8' : 'border-white/10 bg-white/5'}`}>
                <Avatar src={r.logoURL} name={r.name} size="xl" className={`ring-4 ${PODIUM_RING[r.position as 1 | 2 | 3]}`} />
                <p className="mt-3 max-w-full truncate font-display text-lg font-black uppercase">{r.name}</p>
                <p className="mt-1 text-sm font-semibold text-white/80">{tierLabel(r.tier, r.rank)}</p>
                <p className="text-sm text-white/60"><span className="font-bold text-white">{r.lp.toLocaleString()}</span> LP avg</p>
                <p className={`mt-3 font-display text-4xl font-black ${winner ? 'text-gold-500' : 'text-white/70'}`}>{r.position}</p>
              </Link>
            )
          })}
        </div>
      )}

      <ol className="mt-4 space-y-2">
        {rest.map((r) => (
          <li key={r.slug}>
            <Link href={`/squads/${r.slug}`} className="flex items-center gap-4 rounded-[14px] border border-white/10 px-4 py-2.5 transition hover:border-gold-500">
              <span className="w-10 font-display text-xl font-black text-white/50">{r.position}</span>
              <Avatar src={r.logoURL} name={r.name} size="md" />
              <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
              <span className="hidden text-xs text-white/40 sm:block" style={{ fontFamily: MONO }}>{r.rankedCount}/{r.memberCount} RANKED</span>
              <span className="w-28 text-right text-sm text-white/80">{tierLabel(r.tier, r.rank)}</span>
              <span className="w-24 text-right text-sm"><span className="font-bold">{r.lp.toLocaleString()}</span> <span className="text-white/50">LP</span></span>
            </Link>
          </li>
        ))}
      </ol>

      {searching && rows.length === 0 && <p className="mt-6 text-white/60">No squad matches that search.</p>}
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
