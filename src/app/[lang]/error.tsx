'use client'

import { useEffect } from 'react'
import { StatusErrorPage } from '@/components/StatusErrorPage'
import { useT } from '@/components/LangProvider'

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  const d = useT().status.error

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusErrorPage
      discordUrl={process.env.NEXT_PUBLIC_DISCORD_URL ?? ''}
      kicker={d.kicker}
      code="500"
      heading={d.heading}
      description={d.description}
      actions={[
        { label: d.retry, onClick: retry, variant: 'primary' },
        { label: d.home, href: '/', variant: 'subtle' },
      ]}
    />
  )
}
