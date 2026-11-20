'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Loader2, MailCheck } from 'lucide-react'
import { Headline, Sparkle } from '@/components/prosperr/brand'
import { AuthShell, authInput, authLabel, authPrimary } from '@/components/prosperr/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok && res.status >= 500) throw new Error()
      setSent(true)
    } catch {
      setError('We could not send the link right now. Try again in a minute.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      headerCta={{ href: '/login', label: 'Sign in' }}
      hero={{
        title: 'Locked out? You will be back on your calls in a minute.',
        subtitle: 'We e-mail a secure link to reset your password. It works once and expires in an hour.',
      }}
    >
      {sent ? (
        <div className="text-center py-2">
          <span className="mx-auto mb-5 flex w-14 h-14 items-center justify-center rounded-full bg-[#eef7f0] text-[#053f1a]">
            <MailCheck className="w-7 h-7" />
          </span>
          <Headline as="h2" className="text-3xl" muted="inbox.">Check your</Headline>
          <p className="text-sm text-[#56645a] mt-3 mb-7">
            If <strong className="text-[#101312]">{email}</strong> is on the team, a reset link is on its way. It expires in 1 hour.
          </p>
          <Link href="/login" className={authPrimary}>Back to sign in <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] text-[#053f1a] px-3 py-1 text-xs font-medium">
            <Sparkle className="w-3 h-3" /> Password help
          </p>
          <Headline as="h2" className="mt-3 text-3xl sm:text-4xl" muted="password?">Forgot your</Headline>
          <p className="text-sm text-[#56645a] dark:text-gray-400 mt-2 mb-7">Enter your work e-mail and we&apos;ll send you a reset link.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className={authLabel}>Work e-mail</label>
              <input id="email" type="email" required autoComplete="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="name@prosperr.io" className={authInput} />
            </div>
            {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">{error}</div>}
            <button type="submit" disabled={loading} className={authPrimary}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send reset link <ArrowUpRight className="w-4 h-4" /></>}
            </button>
          </form>
          <div className="mt-7 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#053f1a] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthShell>
  )
}
