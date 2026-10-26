import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

const title = 'Lobbies — TFT & League leaderboards | 4Hope'
const description =
  'Browse open and live lobbies, join a squad and follow the leaderboard in real time. Create your own lobby on 4Hope.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website', siteName: '4Hope' },
  twitter: { card: 'summary', title, description },
}

export default function TournamentLeaderboardLayout({ children }: { children: React.ReactNode }) {
  const discordUrl = process.env.DISCORD_URL ?? ''
  return (
    <>
      <Navigation discordUrl={discordUrl} />
      {children}
    </>
  )
}
