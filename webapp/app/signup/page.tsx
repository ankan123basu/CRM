'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, ArrowUpRight, Check } from 'lucide-react'
import { Headline, Sparkle } from '@/components/prosperr/brand'
import { AuthShell, GoogleIcon, OrDivider, authInput, authLabel, authPrimary } from '@/components/prosperr/AuthShell'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Could not create your account. Try again.')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', { email, password, redirect: false })
    if (!result?.ok) {
      setError('Your account is ready, but we could not sign you in. Go to Sign in.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  const strong = password.length >= 8

  return (
    <AuthShell
      extended
      headerCta={{ href: '/login', label: 'Sign in' }}
      hero={{
        title: 'Join the team that sells Prosperr Benefits.',
        subtitle: 'Your accounts, calls and meetings, ready from your first day. One login for every stage of the funnel.',
        tags: ['BDR', 'Account Executive', 'Sales Manager'],
      }}
    >
      <p className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] text-[#053f1a] px-3 py-1 text-xs font-medium">
        <Sparkle className="w-3 h-3" /> New to the team
      </p>
      <Headline as="h2" className="mt-3 text-3xl sm:text-[2.6rem]">
        Join <span className="block text-prosperr-gradient font-semibold pb-1">Prosperr CRM.</span>
      </Headline>
      <p className="text-sm text-[#56645a] dark:text-gray-400 mt-2 mb-7">Use your Prosperr work e-mail. Your manager sets your role after you join.</p>

      <button
        onClick={() => handleOAuth('google')}
        disabled={oauthLoading !== null}
        className="w-full flex items-center justify-center gap-2.5 border border-[#d4d8d3] dark:border-gray-700 rounded-full py-3 text-sm font-medium text-[#101312] dark:text-gray-200 hover:border-[#101312] transition-colors disabled:opacity-60"
      >
        {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Sign up with Google
      </button>

      <OrDivider label="or with e-mail" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={authLabel}>Full name</label>
          <input id="name" type="text" required autoComplete="name" value={name}
            onChange={e => setName(e.target.value)} placeholder="e.g. Paramita Sen" className={authInput} />
        </div>
        <div>
          <label htmlFor="email" className={authLabel}>Work e-mail</label>
          <input id="email" type="email" required autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="name@prosperr.io" className={authInput} />
        </div>
        <div>
          <label htmlFor="password" className={authLabel}>Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={authInput} />
          <p className={`mt-2 ml-2 text-xs inline-flex items-center gap-1 ${strong ? 'text-[#053f1a]' : 'text-[#a1a1aa]'}`}>
            <Check className="w-3.5 h-3.5" /> At least 8 characters
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">{error}</div>
        )}

        <button type="submit" disabled={loading} className={authPrimary}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating your account…</> : <>Create account <ArrowUpRight className="w-4 h-4" /></>}
        </button>
      </form>

      {/* What happens next: three steps, so a new joiner knows what to expect */}
      <ol className="mt-7 grid grid-cols-3 gap-2 text-center">
        {['Create account', 'Manager sets your role', 'Start with My Day'].map((step, i) => (
          <li key={step} className="rounded-2xl bg-[#efefef] dark:bg-gray-800 px-2 py-3">
            <span className="mx-auto mb-1.5 flex w-6 h-6 items-center justify-center rounded-full bg-[#053f1a] text-[#ffffff] text-xs font-medium">{i + 1}</span>
            <span className="block text-[11px] leading-tight text-[#56645a] dark:text-gray-400">{step}</span>
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-[#56645a] mt-7">
        Already on the team?{' '}
        <Link href="/login" className="text-[#053f1a] font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
