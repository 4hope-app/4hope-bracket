import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy — 4Hope',
  description: 'What data 4Hope keeps, why, for how long, and how to get it deleted.',
}

const EMAIL = 'hello@4hope.app'

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="// privacy"
      title="Your data, plain and simple"
      updated="October 18, 2026"
      intro={
        <p>
          4Hope is a hobby project run by players. We keep only what the site needs to work, we don&apos;t sell it, and
          you can ask us to delete it any time.
        </p>
      }
      sections={[
        {
          heading: 'What we keep and why',
          body: (
            <ul>
              <li>
                <strong>Account:</strong> your Google email, the player name and display name you choose, and your
                Google profile photo URL. Used to sign you in and show your profile.
              </li>
              <li>
                <strong>Profile photo:</strong> only if you upload a custom one.
              </li>
              <li>
                <strong>Riot account:</strong> if you link it, your Riot ID, server, rank, LP and icon, fetched from the
                Riot Games API. Used to show your stats on your profile and in lobbies.
              </li>
              <li>
                <strong>Team:</strong> which team you belong to.
              </li>
              <li>
                <strong>Lobbies:</strong> the lobbies you create, with the names and Riot IDs the host types in for
                participants, and the scores they record.
              </li>
            </ul>
          ),
        },
        {
          heading: 'Who else touches it',
          body: (
            <ul>
              <li>
                <strong>Google:</strong> sign-in. You can revoke 4Hope&apos;s access any time from your Google account.
              </li>
              <li>
                <strong>Riot Games:</strong> we query their API for rank and icon data.
              </li>
              <li>
                <strong>Google Cloud (Firestore):</strong> where we store the data above.
              </li>
              <li>
                <strong>Vercel:</strong> hosting, plus anonymous visit and speed statistics that don&apos;t use cookies
                or identify you.
              </li>
            </ul>
          ),
        },
        {
          id: 'cookies',
          heading: 'Cookies',
          body: (
            <>
              <p>
                We use one cookie: the session cookie that keeps you signed in. The site also uses your browser&apos;s
                session storage for lobby functionality; it clears when you close the tab.
              </p>
              <p>
                No advertising, no tracking pixels, no third-party analytics cookies. Fonts are served from our own
                domain, so your browser doesn&apos;t contact Google Fonts. Because we only use what&apos;s strictly
                needed, there&apos;s no cookie banner. If that ever changes, we&apos;ll ask first.
              </p>
            </>
          ),
        },
        {
          heading: 'How long we keep it',
          body: (
            <>
              <p>
                Your account data stays until you ask us to delete it. We don&apos;t delete inactive accounts
                automatically. Lobbies stay until the host deletes them or you ask us to remove your data from them.
              </p>
              <p>Backups may keep copies for a short time after deletion before they are cleared.</p>
            </>
          ),
        },
        {
          heading: 'Delete or change your data',
          body: (
            <>
              <p>You can do some of it yourself:</p>
              <ul>
                <li>Delete a lobby you created, from your profile.</li>
                <li>Unlink your Riot account.</li>
                <li>Remove your custom photo.</li>
                <li>Leave a team.</li>
              </ul>
              <p>
                For everything else, including deleting your whole account, email{' '}
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent('[DATA REQUEST] ')}`}>{EMAIL}</a> from the
                address you signed in with. We delete your data within <strong>30 days</strong>.
              </p>
              <p>
                Were you added to a lobby by someone else, without an account? Email us the Riot ID and we&apos;ll
                remove it.
              </p>
            </>
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
