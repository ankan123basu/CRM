'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, ArrowUpRight, PhoneCall, BadgeCheck, Handshake } from 'lucide-react'
import { Headline, IconPanel, Sparkle, Tag } from '@/components/prosperr/brand'
import { ProsperrLogo } from '@/components/ProsperrLogo'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

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
    <div className="min-h-screen flex flex-col bg-[#f3f3f5] dark:bg-gray-950">
      {/* Header, as on prosperr.io: logo left, a single pill CTA right */}
      <header className="border-b border-[#0d0d0d]/80 bg-[#f3f3f5]/95 dark:bg-gray-950">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-8 h-16 sm:h-20">
          <ProsperrLogo size={30} />
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0a4a1f] text-[#ffffff] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold">
            Sales CRM
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        {/* ── Story ── */}
        <section className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a4a1f]">
            <Sparkle className="w-4 h-4" /> For the Prosperr B2B sales team
          </p>
          <Headline className="mt-4 text-[2.6rem] sm:text-6xl">
            Every account, stakeholder and next step,
            <span className="text-[#a1a1aa]"> managed in one place.</span>
          </Headline>
          <p className="mt-5 text-lg text-[#52525b] dark:text-gray-400 max-w-lg">
            From a BDR&apos;s first call to a signed Flexi Benefit Plan, with every CFO, CHRO and payroll head threaded in.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {[
              { icon: PhoneCall, title: 'Prospecting', tags: ['Calls', 'Sequences', 'Referrals'] },
              { icon: BadgeCheck, title: 'Qualification', tags: ['ICP checks', 'BANT', 'SQL'] },
              { icon: Handshake, title: 'Pipeline', tags: ['L1–L3', 'Multithreading', 'Revival'] },
            ].map(({ icon: Icon, title, tags }, i) => (
              <div key={title} className="rounded-[1.75rem] bg-white dark:bg-gray-900 p-2 shadow-[0_1px_0_rgba(13,13,13,0.04)]">
                <IconPanel seed={i + 2} className="h-24 sm:h-28">
                  <Icon className="w-10 h-10" strokeWidth={2.25} />
                </IconPanel>
                <div className="px-2 pt-3 pb-2">
                  <p className="font-display text-lg font-semibold text-[#0d0d0d] dark:text-white">{title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => <Tag key={t} className="text-xs px-2.5 py-0.5">{t}</Tag>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sign-in card ── */}
        <section className="w-full max-w-md lg:justify-self-end">
          <div className="rounded-[2rem] bg-white dark:bg-gray-900 p-7 sm:p-9 shadow-[0_30px_80px_-40px_rgba(5,63,26,0.35)]">
            <Headline as="h2" className="text-3xl sm:text-4xl" muted="Sign in.">Welcome back.</Headline>
            <p className="text-sm text-[#52525b] dark:text-gray-400 mt-2 mb-7">Use your Prosperr work account.</p>

            <button
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 border border-[#dcdcde] dark:border-gray-700 rounded-full py-3 text-sm font-semibold text-[#0d0d0d] dark:text-gray-200 hover:border-[#0d0d0d] transition-colors disabled:opacity-60"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#dcdcde] dark:bg-gray-700" />
              <span className="text-xs text-[#a1a1aa]">or with e-mail</span>
              <div className="flex-1 h-px bg-[#dcdcde] dark:bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#121212] dark:text-gray-300 mb-1.5">Work e-mail</label>
                <input id="email" type="email" required autoComplete="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="name@prosperr.io"
                  className="w-full px-5 py-3 border border-[#dcdcde] dark:border-gray-700 rounded-full text-sm text-[#0d0d0d] dark:text-gray-100 bg-[#f9f9fa] dark:bg-gray-800 placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#0a4a1f] focus:border-transparent transition"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-[#121212] dark:text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[#0a4a1f] hover:underline">Forgot password?</Link>
                </div>
                <input id="password" type="password" required autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-5 py-3 border border-[#dcdcde] dark:border-gray-700 rounded-full text-sm text-[#0d0d0d] dark:text-gray-100 bg-[#f9f9fa] dark:bg-gray-800 placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#0a4a1f] focus:border-transparent transition"
                />
              </div>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0a4a1f] hover:bg-[#053f1a] disabled:opacity-60 text-[#ffffff] font-semibold py-3.5 rounded-full transition-colors text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowUpRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-[#52525b] mt-7">
              New to the team?{' '}
              <Link href="/signup" className="text-[#0a4a1f] font-semibold hover:underline">Request access</Link>
            </p>
          </div>
          <p className="text-center text-xs text-[#a1a1aa] mt-5">Internal tool for the Prosperr sales team.</p>
        </section>
      </main>
    </div>
  )
}
