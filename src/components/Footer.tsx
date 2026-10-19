import Link from 'next/link'

const LINK_CLASS = 'no-underline transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/10 bg-white/[0.03] px-5 py-6 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-white/55">
      <span>
        <span className="font-medium text-gold-500">4Hope</span>.app &copy; 2026
      </span>
      <Link href="/privacy" className={LINK_CLASS}>
        Privacy
      </Link>
      <Link href="/terms" className={LINK_CLASS}>
        Terms
      </Link>
      <Link href="/privacy#cookies" className={`${LINK_CLASS} sm:absolute sm:right-10`}>
        Cookies
      </Link>
    </footer>
  )
}
