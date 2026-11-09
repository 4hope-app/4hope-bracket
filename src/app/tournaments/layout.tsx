import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

const title = 'Tournaments — multi-day brackets | 4Hope'
const description =
  'Follow 4Hope tournaments: player list, daily lobbies, zigzag seeding and live standings.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website', siteName: '4Hope' },
  twitter: { card: 'summary', title, description },
}

export default function TournamentsLayout({ children }: { children: React.ReactNode }) {
  const discordUrl = process.env.DISCORD_URL ?? ''
  return (
    <>
      <Navigation discordUrl={discordUrl} />
      {children}
    </>
  )
}
