'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function FriendCodeBox({ code }: { code: string | null }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard indisponível, ignora
    }
  }

  return (
    <button
      onClick={copy}
      disabled={!code}
      className="flex w-full items-center justify-between rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-3 transition-colors hover:border-primary/40 disabled:opacity-60"
    >
      <span className="font-mono text-lg font-bold tracking-widest">
        {code ?? '------'}
      </span>
      {copied ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Check className="h-4 w-4" /> Copiado
        </span>
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )
}