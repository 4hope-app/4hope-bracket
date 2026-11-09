import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { countryName, countrySlug, matchCountryParam } from '@/lib/countries'
import { MIN_INDEXABLE_PLAYERS } from '@/lib/ladder'
import { getCountryCounts, getLadder } from '@/lib/ladderData'
import { getSiteUrl, isIndexableEnv } from '@/lib/siteUrl'
import { LadderView } from '../LadderView'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ country: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = matchCountryParam((await params).country)
  if (match.kind === 'none') return { title: 'Ladder', robots: { index: false, follow: false } }
  if (match.kind === 'redirect') return { robots: { index: false, follow: true } }
  const name = countryName(match.code)
  const counts = await getCountryCounts()
  const indexable = isIndexableEnv() && (counts[match.code] ?? 0) >= MIN_INDEXABLE_PLAYERS
  const url = `${getSiteUrl()}/ladder/${countrySlug(match.code)}`
  const title = `${name} TFT Ladder — top ranked players | 4Hope`
  const description = `The best TFT players from ${name}, ranked by Riot tier and LP on the 4Hope ladder.`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, type: 'website', siteName: '4Hope', url },
    twitter: { card: 'summary', title, description },
  }
}

export default async function CountryLadderPage({ params }: Props) {
  const match = matchCountryParam((await params).country)
  if (match.kind === 'none') notFound()
  if (match.kind === 'redirect') permanentRedirect(`/ladder/${countrySlug(match.code)}`)

  const [page, counts] = await Promise.all([getLadder({ country: match.code }), getCountryCounts()])
  const name = countryName(match.code)
  return (
    <LadderView title={`Ladder · ${name}`} country={match.code} counts={counts} empty={page.total === 0} {...page} />
  )
}
