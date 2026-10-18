import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CopyEmailButton } from '@/components/CopyEmailButton'

const CONTACT_EMAIL = 'hello@4hope.app'

const TOPICS = [
  {
    kicker: '// SUPPORT',
    title: 'Need a hand',
    description: 'Sign-in trouble, a broken lobby, a wrong score, or anything that feels unfair.',
    cta: 'Send message',
    subject: '[SUPPORT] ',
    body: 'Email you signed in with:\n\nWhat happened:\n\nPage or lobby ID (if any):\n',
  },
  {
    kicker: '// YOUR DATA',
    title: 'Delete my data',
    description: 'Ask us to remove your account and everything tied to it.',
    cta: 'Request deletion',
    subject: '[DATA REQUEST] ',
    body: 'Email you signed in with:\n\nWhat should we delete (account, lobbies, everything):\n',
  },
  {
    kicker: '// HELLO',
    title: 'Anything else',
    description: 'Press, sponsors, collabs, or just saying hi.',
    cta: 'Say hi',
    subject: '[HELLO] ',
    body: '',
  },
]

function mailto(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

interface ContactSectionProps {
  discordUrl: string
}

export function ContactSection({ discordUrl }: ContactSectionProps) {
  return (
    <section id="contact" className="relative isolate w-full scroll-mt-16 overflow-hidden bg-ink-1000 px-8 py-20 sm:px-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-10 h-8 w-[220px] -rotate-[32deg] rounded-md bg-gold-500 sm:-right-16 sm:-top-4 sm:h-12 sm:w-[360px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[186px] -top-10 h-8 w-[220px] -rotate-[32deg] rounded-md bg-gold-500 sm:-right-[200px] sm:-top-4 sm:h-12 sm:w-[360px]" />

      <div className="relative">
        <span className="font-mono text-lg uppercase tracking-[0.16em] text-gold-500">{'// contact'}</span>
        <h2 className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
          Talk to the squad
        </h2>
        <p className="mt-6 max-w-[560px] text-white/70">
          Pick what you need and your email app opens with the details ready to fill in.
        </p>
        {discordUrl ? (
          <p className="mt-3 text-sm text-white/60">
            Not an email person?{' '}
            <a
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 py-2 text-white underline-offset-4 hover:text-gold-500 hover:underline"
            >
              Find us on Discord
              <ArrowUpRight
                size={14}
                className="text-gold-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TOPICS.map((topic) => (
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
            {'// replies in ~3 days'}
          </span>
        </div>
      </div>
    </section>
  )
}
