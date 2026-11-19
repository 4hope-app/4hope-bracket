'use client'

import { StatusErrorPage } from '@/components/StatusErrorPage'
import { useT } from '@/components/LangProvider'

export default function NotFound() {
  const d = useT().status.notFound
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? ''

  return (
    <StatusErrorPage
      discordUrl={discordUrl}
      kicker={d.kicker}
      code="404"
      heading={d.heading}
      description={d.description}
      actions={[
        { label: d.home, href: '/', variant: 'primary' },
        { label: d.report, href: discordUrl, external: true, variant: 'subtle' },
      ]}
      links={[
        { label: d.rosterLink, href: '/#roster' },
        { label: d.homeLink, href: '/' },
      ]}
    />
  )
}
