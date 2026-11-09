import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

const title = 'Ladder — TFT ranked by country | 4Hope'
const description = 'The 4Hope ladder: linked TFT players ranked by Riot tier and LP, worldwide or by country.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website', siteName: '4Hope' },
  twitter: { card: 'summary', title, description },
}

export default function LadderLayout({ children }: { children: React.ReactNode }) {
  const discordUrl = process.env.DISCORD_URL ?? ''
  return (
    <>
      <Navigation discordUrl={discordUrl} />
      {children}
    </>
  )
}
