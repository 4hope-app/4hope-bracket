import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CopyEmailButton } from '@/components/CopyEmailButton'
import type { Dictionary } from '@/i18n/utils'

const CONTACT_EMAIL = 'hello@4hope.app'

function mailto(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

interface ContactSectionProps {
  copy: Dictionary['contact']
  discordUrl: string
  discordSupportUrl?: string
}

export function ContactSection({ copy, discordUrl, discordSupportUrl }: ContactSectionProps) {
  const discordHref = discordSupportUrl || discordUrl

  return (
    <section id="contact" className="relative isolate w-full scroll-mt-16 overflow-hidden bg-ink-1000 py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-10 h-8 w-[220px] -rotate-[32deg] rounded-md bg-gold-500 sm:-right-16 sm:-top-4 sm:h-12 sm:w-[360px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[186px] -top-10 h-8 w-[220px] -rotate-[32deg] rounded-md bg-gold-500 sm:-right-[200px] sm:-top-4 sm:h-12 sm:w-[360px]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 md:px-8">
        <span className="font-mono text-lg uppercase tracking-[0.16em] text-gold-500">{copy.kicker}</span>
        <h2 className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
          {copy.title}
        </h2>
        <p className="mt-6 max-w-[560px] text-white/70">
          {copy.lead}
        </p>
        {discordHref ? (
          <p className="mt-3 text-sm text-white/60">
            {copy.discordLead}{' '}
            <a
              href={discordHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 py-2 text-white underline-offset-4 hover:text-gold-500 hover:underline"
            >
              {copy.discordLink}
              <ArrowUpRight
                size={14}
                className="text-gold-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.topics.map((topic) => (
            <a
              key={topic.title}
              href={mailto(topic.subject, topic.body)}
              className="group block no-underline"
            >
              <Card
                tone="arena"
                className="flex h-full flex-col p-6 transition-shadow group-hover:shadow-[0_0_0_1px_var(--gold-500)]"
              >
                <div className="mb-2 font-mono text-[11px] tracking-[0.16em] text-gold-500">{topic.kicker}</div>
                <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-white">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{topic.description}</p>
                <div className="mt-auto flex items-center gap-2 pt-4 font-display text-sm font-extrabold uppercase tracking-wide text-gold-500">
                  {topic.cta}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1.5" />
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <Mail size={16} className="shrink-0 text-white/50" aria-hidden="true" />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-sm text-white no-underline hover:text-gold-500"
          >
            {CONTACT_EMAIL}
          </a>
          <CopyEmailButton email={CONTACT_EMAIL} />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
            {copy.replies}
          </span>
        </div>
      </div>
    </section>
  )
}
