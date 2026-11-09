'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui'
import { CountrySelect } from '@/components/CountrySelect'

/** Nudge for the signed-in player: pick a country (or opt out) if they haven't, or sign in / link Riot if they haven't. */
export function CountryPrompt({ targetCountryName }: { targetCountryName?: string }) {
  const { status } = useSession()
  const [country, setCountry] = useState<string | null | undefined>(undefined)
  const [hasRiot, setHasRiot] = useState(false)
  const [pick, setPick] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.exists) return
        setCountry(d.profile?.country ?? null)
        setHasRiot(Boolean(d.profile?.riot?.verified))
      })
      .catch(() => {})
  }, [status])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/profile/country', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: pick }),
    })
    setSaving(false)
    if (res.ok) setCountry(pick)
  }

  if (status === 'unauthenticated') {
    return (
      <p className="mt-6 text-sm text-white/70">
        <Link href="/login?callbackUrl=/profile" className="text-gold-500 underline">Sign in</Link> and link your Riot ID to join the ladder.
      </p>
    )
  }
  if (status !== 'authenticated' || country === undefined) return null

  if (country === null) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-gold-500/40 p-4">
        <p className="text-sm text-white/80">Pick your country so you show up in your country&apos;s ladder.</p>
        <div className="w-56"><CountrySelect value={pick} onChange={setPick} allowHidden /></div>
        <Button disabled={!pick || saving} onClick={save}>Save country</Button>
      </div>
    )
  }
  if (!hasRiot) {
    return (
      <p className="mt-6 text-sm text-white/70">
        <Link href="/profile" className="text-gold-500 underline">Link your Riot ID</Link> to get on the ladder{targetCountryName ? ` for ${targetCountryName}` : ''}.
      </p>
    )
  }
  return null
}
