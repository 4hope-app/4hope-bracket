import type { Metadata } from 'next'
import { getCountryCounts, getLadder } from '@/lib/ladderData'
import { getSiteUrl, isIndexableEnv } from '@/lib/siteUrl'
import { LadderView } from './LadderView'

export const dynamic = 'force-dynamic'

const title = 'TFT Ladder — top ranked players | 4Hope'
const description = 'The 4Hope TFT ladder: linked players ranked by Riot tier and LP. See the global top or browse the ladder of your country.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${getSiteUrl()}/ladder` },
  robots: isIndexableEnv() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { title, description, type: 'website', siteName: '4Hope', url: `${getSiteUrl()}/ladder` },
  twitter: { card: 'summary', title, description },
}

export default async function LadderPage() {
  const [page, counts] = await Promise.all([getLadder(), getCountryCounts()])
  return <LadderView title="Ladder global" counts={counts} {...page} />
}
