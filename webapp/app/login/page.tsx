'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, ArrowUpRight } from 'lucide-react'
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
      {/* Announcement strip, as on prosperr.io */}
      <div className="bg-[#053f1a] text-[#ffffff] text-xs sm:text-sm font-medium text-center py-2.5 px-4">
        Prosperr Sales CRM · one source of truth from first call to implementation
      </div>

      <div className="flex-1 grid lg:grid-cols-[1.1fr_1fr]">
        {/* ── Brand panel ── */}
        <section
          className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-[#ffffff]"
          style={{ background: 'radial-gradient(120% 90% at 10% 0%, #0d5a28 0%, #053f1a 45%, #021a0c 100%)' }}
        >
          <div
            aria-hidden
            className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #4ae386 0%, transparent 65%)' }}
          />
          <ProsperrLogo tone="light" size={30} product="Sales CRM" />

          <div className="relative max-w-xl">
            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.02] tracking-tight text-balance">
              Every account. An owner. A dated next step.
            </h1>
            <p className="mt-5 text-lg text-[#ffffff]/75 max-w-md">
              From a BDR&apos;s first call to the L3 negotiation, with every stakeholder threaded in.
            </p>

            {/* Stage rail: the journey this CRM tracks */}
            <ol className="mt-10 flex flex-wrap items-center gap-2 text-sm font-semibold">
              {['Prospect', 'SQL', 'L1', 'L2', 'L3', 'Won'].map((stage, i, all) => (
                <li key={stage} className="flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1.5 rounded-full border ${
                      stage === 'Won'
                        ? 'bg-[#d7b773] border-[#d7b773] text-[#053f1a]'
                        : 'border-[#ffffff]/25 bg-[#ffffff]/5'
                    }`}
                  >
                    {stage}
                  </span>
                  {i < all.length - 1 && <span className="text-[#ffffff]/35">→</span>}
                </li>
              ))}
            </ol>
          </div>

          <dl className="relative grid grid-cols-3 gap-6 border-t border-[#ffffff]/15 pt-6 max-w-xl">
            {[
              ['248', 'active accounts'],
              ['297', 'inactive, ready to revive'],
              ['2,226', 'contacts to migrate'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-bold tabular-nums">{n}</dt>
                <dd className="text-xs text-[#ffffff]/60 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Sign-in form ── */}
        <section className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <ProsperrLogo size={30} product="Sales CRM" />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-[0_20px_60px_-30px_rgba(5,63,26,0.35)] p-8 sm:p-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-7">Sign in with your Prosperr work account.</p>

              <button
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-2.5 border border-gray-300 dark:border-gray-700 rounded-full py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400">or use email</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Work email
                  </label>
                  <input id="email" type="email" required value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="name@prosperr.io"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>
                  </div>
                  <input id="password" type="password" required autoComplete="current-password" value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors text-sm shadow-sm">
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-7">
                New to the team?{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">Create an account</Link>
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Internal tool · Access is limited to the Prosperr sales team
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
