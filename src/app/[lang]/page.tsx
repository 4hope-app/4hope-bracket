import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { TitleSlide } from '@/components/TitleSlide'
import { RoastSlide } from '@/components/RoastSlide'
import { ContactSection } from '@/components/ContactSection'
import { fetchAllRoastPlayerStats, parseRoastPlayers } from '@/api/riot/roster'
import { getSiteUrl } from '@/lib/siteUrl'
import { isLang, localizePath, t } from '@/i18n/utils'

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const base = getSiteUrl()
  return {
    alternates: {
      canonical: `${base}${localizePath('/', lang)}`,
      languages: { es: `${base}/`, en: `${base}/en`, 'x-default': `${base}/` },
    },
  }
}

function initialsOf(name: string): string {
  // Riot IDs here share a "4H " team prefix, so strip it before taking initials
  // or every player collapses to the same "4H" tag.
  const withoutTeamPrefix = name.replace(/^4H\s+/i, '')
  return withoutTeamPrefix.slice(0, 2).toUpperCase()
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const d = t(lang)
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? ''
  const discordSupportUrl = process.env.NEXT_PUBLIC_DISCORD_SUPPORT_URL ?? ''
  // The env overrides are English copy, so they only apply to the English page.
  const en = lang === 'en'
  const teamDescription = (en && process.env.TEAM_DESCRIPTION) || d.hero.subtitle
  const heroKicker = (en && process.env.HERO_KICKER) || d.hero.kicker
  const heroHeading: [string, string] = [
    (en && process.env.HERO_HEADING_LINE_1) || d.hero.line1,
    (en && process.env.HERO_HEADING_LINE_2) || d.hero.line2,
  ]

  const liveStats = await fetchAllRoastPlayerStats()

  const players = liveStats.length > 0
    ? liveStats.map((stats) => ({
        initials: initialsOf(stats.displayName),
        name: stats.displayName,
        tier: `${stats.tier}${stats.rank ? ` ${stats.rank}` : ''}`,
        lp: stats.lp,
        region: stats.region,
        avatarUrl: stats.avatarUrl,
        ladderRank: stats.ladderRank,
      }))
    : parseRoastPlayers(process.env.ROAST_PLAYERS).map((player) => ({
        initials: initialsOf(player.displayName),
        name: player.displayName,
        tier: d.roster.unranked,
        lp: 0,
        region: player.platform,
      }))

  return (
    <>
      <Navigation discordUrl={discordUrl} />

      <div id="home" className="scroll-mt-16">
        <TitleSlide
          kicker={heroKicker}
          heading={heroHeading}
          subheading={teamDescription}
          discordUrl={discordUrl}
          cta={d.hero.cta}
        />
      </div>

      <div id="roster" className="scroll-mt-16">
        <RoastSlide kicker={d.roster.kicker} heading={d.roster.heading} players={players} />
      </div>

      <ContactSection copy={d.contact} discordUrl={discordUrl} discordSupportUrl={discordSupportUrl} />

    </>
  )
}
