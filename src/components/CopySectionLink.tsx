'use client'

import { useState } from 'react'
import { Check, Link as LinkIcon } from 'lucide-react'

export function CopySectionLink({ id, label }: { id: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
      window.history.replaceState(null, '', `#${id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; jumping to the anchor still gives a shareable URL.
      window.location.hash = id
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `Link to ${label} copied` : `Copy link to ${label}`}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all hover:bg-white/10 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/heading:opacity-100 ${
        copied ? 'text-gold-500 sm:opacity-100' : 'text-white/50 hover:text-white'
      }`}
    >
      {copied ? <Check size={16} /> : <LinkIcon size={16} />}
    </button>
  )
}
