'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; the address stays visible so it can be copied by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-gold-500 hover:text-ink-1000"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
