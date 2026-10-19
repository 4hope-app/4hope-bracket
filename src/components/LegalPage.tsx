import type { ReactNode } from 'react'
import { CopySectionLink } from '@/components/CopySectionLink'
import { Navigation } from '@/components/Navigation'

export interface LegalSection {
  id?: string
  heading: string
  body: ReactNode
}

interface LegalPageProps {
  kicker: string
  title: string
  updated: string
  intro: ReactNode
  sections: LegalSection[]
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function LegalPage({ kicker, title, updated, intro, sections }: LegalPageProps) {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? ''

  return (
    <>
      <Navigation discordUrl={discordUrl} />
      <main className="bg-ink-1000 px-6 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-[720px]">
          <span className="font-mono text-sm uppercase tracking-[0.16em] text-gold-500">{kicker}</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-none tracking-[-0.02em] text-white">
            {title}
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">Last updated {updated}</p>
          <div className="mt-8 text-white/70">{intro}</div>

          {sections.map((section) => {
            const id = section.id ?? slugify(section.heading)
            return (
              <section key={section.heading} id={id} className="mt-10 scroll-mt-20 border-t border-white/10 pt-8">
                <div className="group/heading flex items-center gap-2">
                  <h2 className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-white">
                    {section.heading}
                  </h2>
                  <CopySectionLink id={id} label={section.heading} />
                </div>
                <div className="mt-3 space-y-3 leading-relaxed text-white/70 [&_a]:text-gold-500 [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white">
                  {section.body}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
