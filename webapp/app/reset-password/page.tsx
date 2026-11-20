'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Check, Loader2, Link2Off } from 'lucide-react'
import { Headline, Sparkle } from '@/components/prosperr/brand'
import { AuthShell, authInput, authLabel, authPrimary } from '@/components/prosperr/AuthShell'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('The two passwords do not match.'); return }
    setLoading(true); setError(null)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error ?? 'This link has expired. Request a new one.'); setLoading(false); return }
    router.push('/login?reset=1')
  }

  if (!token) return (
    <div className="text-center py-2">
      <span className="mx-auto mb-5 flex w-14 h-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Link2Off className="w-7 h-7" />
      </span>
      <Headline as="h2" className="text-3xl" muted="isn't valid.">This link</Headline>
      <p className="text-sm text-[#56645a] mt-3 mb-7">Reset links work once and expire after an hour. Ask for a fresh one.</p>
      <Link href="/forgot-password" className={authPrimary}>Request a new link <ArrowUpRight className="w-4 h-4" /></Link>
    </div>
  )

  const long = password.length >= 8
  const same = confirm.length > 0 && password === confirm
  return (
    <>
      <p className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] text-[#053f1a] px-3 py-1 text-xs font-medium">
        <Sparkle className="w-3 h-3" /> Almost there
      </p>
      <Headline as="h2" className="mt-3 text-3xl sm:text-4xl" muted="new password.">Set a</Headline>
      <p className="text-sm text-[#56645a] dark:text-gray-400 mt-2 mb-7">Choose something only you know. You&apos;ll use it to sign in from now on.</p>
      {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl mb-4">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className={authLabel}>New password</label>
          <input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={authInput} />
        </div>
        <div>
          <label htmlFor="confirm-password" className={authLabel}>Confirm password</label>
          <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirm}
            onChange={e => setConfirm(e.target.value)} placeholder="Type it again" className={authInput} />
        </div>
        <ul className="ml-2 space-y-1 text-xs">
          <li className={`inline-flex items-center gap-1 w-full ${long ? 'text-[#053f1a]' : 'text-[#a1a1aa]'}`}><Check className="w-3.5 h-3.5" /> At least 8 characters</li>
          <li className={`inline-flex items-center gap-1 w-full ${same ? 'text-[#053f1a]' : 'text-[#a1a1aa]'}`}><Check className="w-3.5 h-3.5" /> Both passwords match</li>
        </ul>
        <button type="submit" disabled={loading} className={authPrimary}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Save new password <ArrowUpRight className="w-4 h-4" /></>}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      headerCta={{ href: '/login', label: 'Sign in' }}
      hero={{
        title: 'A fresh password, and straight back to your pipeline.',
        subtitle: 'Your accounts, stakeholders and history are exactly where you left them.',
      }}
    >
      <Suspense fallback={<div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#a1a1aa]" /></div>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  )
}
