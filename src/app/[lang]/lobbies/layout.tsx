import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { isLang, t } from '@/i18n/utils'

export async function generateMetadata({ params }: LayoutProps<'/[lang]/lobbies'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const title = t(lang).meta.lobbiesTitle
  const description = t(lang).meta.lobbiesDescription
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: '4Hope' },
    twitter: { card: 'summary', title, description },
  }
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
