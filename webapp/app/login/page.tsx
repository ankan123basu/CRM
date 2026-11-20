'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, ArrowUpRight } from 'lucide-react'
import { Headline, Sparkle } from '@/components/prosperr/brand'
import { AuthShell, GoogleIcon } from '@/components/prosperr/AuthShell'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  // Time-of-day greeting in IST, so the card feels personal on first and later visits.
  const hourIST = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  const greeting = hourIST < 12 ? 'Good morning' : hourIST < 17 ? 'Good afternoon' : 'Good evening'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    if (!result?.ok) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <AuthShell
      onLoginPage
      extended
      headerCta={{ href: '#card', label: 'Sign in' }}
      hero={{
        title: 'A sales CRM for a team that no longer fits a spreadsheet.',
        subtitle: 'Accounts, stakeholders and next steps for Prosperr Benefits, managed in one place.',
        tags: ['CFO', 'CHRO', 'Head of Payroll', 'C&B', 'Total Rewards'],
      }}
    >
            <p suppressHydrationWarning className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] text-[#053f1a] px-3 py-1 text-xs font-medium">
              <Sparkle className="w-3 h-3" /> {greeting}
            </p>
            <Headline as="h2" className="mt-3 text-3xl sm:text-[2.6rem]">
              Welcome to <span className="block text-prosperr-gradient font-semibold pb-1">Prosperr CRM.</span>
            </Headline>
            <p className="text-sm text-[#56645a] dark:text-gray-400 mt-2 mb-7">Sign in with your Prosperr work account. First time here? Use the e-mail your manager added you with.</p>

            <button
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 border border-[#d4d8d3] dark:border-gray-700 rounded-full py-3 text-sm font-medium text-[#101312] dark:text-gray-200 hover:border-[#101312] transition-colors disabled:opacity-60"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#d4d8d3] dark:bg-gray-700" />
              <span className="text-xs text-[#a1a1aa]">or with e-mail</span>
              <div className="flex-1 h-px bg-[#d4d8d3] dark:bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#101312] dark:text-gray-300 mb-1.5">Work e-mail</label>
                <input id="email" type="email" required autoComplete="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="name@prosperr.io"
                  className="w-full px-5 py-3 border border-[#d4d8d3] dark:border-gray-700 rounded-full text-sm text-[#101312] dark:text-gray-100 bg-[#f7f7f7] dark:bg-gray-800 placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#053f1a] focus:border-transparent transition"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-[#101312] dark:text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-[#053f1a] hover:underline">Forgot password?</Link>
                </div>
                <input id="password" type="password" required autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-5 py-3 border border-[#d4d8d3] dark:border-gray-700 rounded-full text-sm text-[#101312] dark:text-gray-100 bg-[#f7f7f7] dark:bg-gray-800 placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#053f1a] focus:border-transparent transition"
                />
              </div>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#053f1a] hover:bg-[#0a5a26] disabled:opacity-60 text-[#ffffff] font-medium py-3.5 rounded-full transition-colors text-base">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowUpRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-[#56645a] mt-7">
              No account yet?{' '}
              <Link href="/signup" className="text-[#053f1a] font-medium hover:underline">Request access</Link>
            </p>
    </AuthShell>
  )
}
