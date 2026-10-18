import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms — 4Hope',
  description: 'The ground rules for using 4Hope and its player-run lobbies.',
}

const EMAIL = 'hello@4hope.app'
const REPORT_BODY =
  'Lobby ID (6 digits):\n\nRiot ID of the player:\n\nWhat happened:\n\nProof (link to clip or screenshot):\n'

export default function TermsPage() {
  return (
    <LegalPage
      kicker="// terms"
      title="Ground rules"
      updated="October 18, 2026"
      intro={
        <p>
          4Hope is a hobby project for a gaming crew. By using the site you agree to these basics. Keep it fair, keep it
          fun.
        </p>
      }
      sections={[
        {
          heading: 'Your account',
          body: (
            <p>
              Sign in with a Google account. You are responsible for what you post under it. Only link your own Riot
              account to your profile, and don&apos;t impersonate other players.
            </p>
          ),
        },
        {
          heading: 'Lobbies',
          body: (
            <>
              <p>
                Lobbies are created and run by players, not by 4Hope. The host decides who joins and records the scores.
                Each lobby&apos;s rules are set by its host, so check the lobby description before you join.
              </p>
              <ul>
                <li>Only add players who agreed to take part. Players can ask to be removed at any time.</li>
                <li>Record real results. Fake or edited scores are not okay.</li>
                <li>Hosts can remove players who cheat or break the rules of their lobby.</li>
                <li>Be respectful in names, descriptions and chat. No harassment or hate.</li>
              </ul>
            </>
          ),
        },
        {
          heading: 'Cheating and reports',
          body: (
            <p>
              Saw a fake score or something unfair? Tell the host first. If that doesn&apos;t fix it, email{' '}
              <a href={`mailto:${EMAIL}?subject=${encodeURIComponent('[CHEAT REPORT] Lobby ')}&body=${encodeURIComponent(REPORT_BODY)}`}>
                {EMAIL}
              </a>{' '}
              with the lobby ID, the Riot ID of the player, what happened, and <strong>proof</strong>: a screenshot or a
              clip. Reports without proof can&apos;t be checked, so we may not act on them. We can remove lobbies or
              accounts that abuse the site.
            </p>
          ),
        },
        {
          heading: 'Riot Games',
          body: (
            <p>
              4Hope isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
              anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated
              properties are trademarks or registered trademarks of Riot Games, Inc.
            </p>
          ),
        },
        {
          heading: 'As-is',
          body: (
            <p>
              The site is free and provided as is, with no promise it will always be online or error-free. We may change
              or remove features. Your data is handled as described in our <a href="/privacy">privacy page</a>.
            </p>
          ),
        },
        {
          heading: 'Questions',
          body: (
            <p>
              Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We usually reply within 3 days.
            </p>
          ),
        },
      ]}
    />
  )
}
