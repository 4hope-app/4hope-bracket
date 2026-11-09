'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { countryOptions } from '@/lib/countries'

interface CountrySelectProps {
  value: string
  onChange: (code: string) => void
  /** Adds a leading "all" option with this label (used as a filter). */
  allLabel?: string
  /** Restrict to these codes (e.g. countries that have ranked players). */
  only?: string[]
  className?: string
}

/** Native select (keyboard + mobile friendly, type-to-jump) styled like the form inputs. */
export function CountrySelect({ value, onChange, allLabel, only, className }: CountrySelectProps) {
  const options = useMemo(() => {
    const all = countryOptions()
    return only ? all.filter((o) => only.includes(o.code)) : all
  }, [only])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-[42px] w-full rounded-lg border border-white/15 bg-ink-900 px-3 text-[15px] text-white',
        'focus:border-gold-500 focus:outline-none focus:ring-[3px] focus:ring-gold-500/26',
        className,
      )}
    >
      {allLabel ? <option value="">{allLabel}</option> : <option value="">Select your country</option>}
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.name}
        </option>
      ))}
    </select>
  )
}
