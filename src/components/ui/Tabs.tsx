import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: string[]
  value: string
  onChange: (value: string) => void
  /** Text shown for each tab id (defaults to the id). */
  labels?: Record<string, string>
  /** Tabs listed here are plain links to another page (never "active") instead of switching tabs. */
  hrefs?: Record<string, string>
  className?: string
}

export function Tabs({ tabs, value, onChange, labels, hrefs, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-white/10', className)}>
      {tabs.map((tab) => {
        const href = hrefs?.[tab]
        const active = !href && tab === value
        const classes = cn(
          'relative inline-flex items-center gap-1 px-3.5 py-2.5 font-display text-sm font-bold tracking-[0.03em] uppercase no-underline transition-colors',
          active ? 'text-white' : 'text-white/50 hover:text-white/80',
        )
        const label = labels?.[tab] ?? tab
        const underline = (
          <span
            className={cn('absolute inset-x-0 -bottom-px h-[2.5px] rounded-sm transition-colors', active ? 'bg-gold-500' : 'bg-transparent')}
          />
        )
        return href ? (
          <a key={tab} href={href} className={classes}>
            {label}
            {/* Arrow = this tab leaves bracket for another site. */}
            <ArrowUpRight size={14} aria-hidden="true" className="shrink-0" />
            {underline}
          </a>
        ) : (
          <button key={tab} type="button" onClick={() => onChange(tab)} className={classes}>
            {label}
            {underline}
          </button>
        )
      })}
    </div>
  )
}
