import { Navigation } from '@/components/Navigation'
import { TitleSlide } from '@/components/TitleSlide'
import { LadderSection } from '@/components/LadderSection'
import { ContactSection } from '@/components/ContactSection'
import { getLadder } from '@/lib/ladderData'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? ''
  const discordSupportUrl = process.env.NEXT_PUBLIC_DISCORD_SUPPORT_URL ?? ''
  const teamDescription = process.env.TEAM_DESCRIPTION ?? ''
  const heroKicker = process.env.HERO_KICKER
  const heroHeading: [string, string] = [
    process.env.HERO_HEADING_LINE_1 ?? 'Play',
    process.env.HERO_HEADING_LINE_2 ?? 'for keeps',
  ]

  const { rows: topPlayers } = await getLadder({ limit: 5 })

  return (
    <>
      <Navigation discordUrl={discordUrl} />

      <div id="home" className="scroll-mt-16">
        <TitleSlide
          kicker={heroKicker}
          heading={heroHeading}
          subheading={teamDescription}
          discordUrl={discordUrl}
        />
      </div>

      <div id="ladder" className="scroll-mt-16">
        <LadderSection rows={topPlayers} />
      </div>

      <ContactSection discordUrl={discordUrl} discordSupportUrl={discordSupportUrl} />

    </>
  )
}
