'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, ArrowUpRight, PhoneCall, Handshake, BarChart3, ShieldCheck } from 'lucide-react'
import { Headline, Sparkle, Topo, AnnouncementBar, StatsGrid, IconPanel, Tag } from '@/components/prosperr/brand'
import { Seal } from '@/components/prosperr/Seal'
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
    <div className="min-h-screen flex flex-col bg-[#efefef] dark:bg-gray-950">
      <AnnouncementBar>
        <span className="inline-flex items-center gap-2">
          <Sparkle className="w-3.5 h-3.5" /> The Prosperr Benefits sales CRM, from first call to signed FBP
        </span>
      </AnnouncementBar>

      {/* Header, as on prosperr.io: logo, quiet nav, one green pill. Sticks while scrolling. */}
      <header className="sticky top-0 z-30 bg-[#efefef]/95 dark:bg-gray-950/95 backdrop-blur border-b border-[#101312]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-8 h-16 sm:h-[5.5rem]">
          <Link href="/login" aria-label="Prosperr Sales CRM" className="flex items-center gap-3">
            <ProsperrLogo size={32} />
            <span className="hidden sm:inline-flex items-center rounded-full border border-[#101312]/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#56645a]">Sales CRM</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-8">
            {[['#workflow', 'Workflow'], ['#roles', 'Who it’s for'], ['#help', 'Help']].map(([href, label]) => (
              <a key={href} href={href} className="hidden md:inline text-base font-medium text-[#101312] dark:text-gray-200 hover:text-[#053f1a] transition-colors">
                {label}
              </a>
            ))}
            <a href="#sign-in" className="inline-flex items-center gap-1.5 rounded-full bg-[#053f1a] text-[#ffffff] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium hover:bg-[#0a5a26] transition-colors">
              Sign in <ArrowUpRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* Dark hero, like prosperr.io's photo hero */}
      <section className="relative overflow-hidden bg-[#101312] text-[#efefef]">
        <Topo seed={5} rings={11} tone="light" />
        <div aria-hidden className="absolute -left-40 -bottom-40 w-[620px] h-[620px] rounded-full opacity-35" style={{ background: 'radial-gradient(circle, #0d5a28 0%, transparent 62%)' }} />
        <div aria-hidden className="absolute right-0 top-0 w-[520px] h-[520px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #d7b773 0%, transparent 60%)' }} />
        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-8 py-8 sm:py-20 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-12 items-center">
          <div className="min-w-0 order-2 lg:order-1">
            <h1 className="font-display font-normal text-[2.1rem] sm:text-6xl leading-[1.05] tracking-[-0.04em] text-balance">
              A sales CRM for a team that no longer fits a spreadsheet.
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-[#efefef]/80 max-w-xl">
              Accounts, stakeholders and next steps for Prosperr Benefits, managed in one place.
            </p>
            <div className="mt-8 hidden sm:flex flex-wrap gap-2">
              {['CFO', 'CHRO', 'Head of Payroll', 'C&B', 'Total Rewards'].map((t) => (
                <span key={t} className="rounded-full border border-[#ffffff]/25 px-3.5 py-1 text-sm text-[#efefef]/85">{t}</span>
              ))}
            </div>
          </div>

          {/* Sign-in card */}
          <div id="sign-in" className="scroll-mt-28 order-1 lg:order-2 w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end rounded-[1.75rem] bg-white dark:bg-gray-900 text-[#101312] p-7 sm:p-9 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)]">
            <p suppressHydrationWarning className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f0] text-[#053f1a] px-3 py-1 text-xs font-medium">
              <Sparkle className="w-3 h-3" /> {greeting}
            </p>
            <Headline as="h2" className="mt-3 text-3xl sm:text-4xl" muted="to Prosperr CRM.">Welcome</Headline>
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
          </div>
        </div>
      </section>

      {/* Lined grid, like prosperr.io's stats block */}
      <section id="workflow" className="scroll-mt-24 max-w-[1240px] w-full mx-auto sm:border-x border-[#d4d8d3] dark:border-gray-800">
        <StatsGrid items={[
          { label: 'Prospecting', value: 'Calls & sequences', accent: true },
          { label: 'Qualification', value: 'ICP & BANT', accent: true },
          { label: 'Pipeline', value: 'L1 → L2 → L3' },
          { label: 'Revival', value: 'Nothing goes cold' },
        ]} />
      </section>

      {/* Roles, in the Tax / Wealth / Credit card style */}
      <section id="roles" className="scroll-mt-24 max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <Headline as="h2" className="text-[2rem] sm:text-5xl text-center max-w-3xl mx-auto" muted="for every seat on the team.">
          One CRM,
        </Headline>
        <div className="mt-10 sm:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: PhoneCall, title: 'BDRs', body: 'A daily call queue, two-click outcomes and follow-ups that schedule themselves.', tags: ['My Day', 'Calls', 'Sequences'] },
            { icon: Handshake, title: 'Account Executives', body: 'Every L1, L2 and L3 with its checklist, stakeholders and next step.', tags: ['Meetings', 'Multithreading'] },
            { icon: BarChart3, title: 'Sales Managers', body: 'SQL approvals, AE assignment by capacity, targets and the leak report.', tags: ['SQL queue', 'Targets'] },
            { icon: ShieldCheck, title: 'Admins', body: 'Designation map, ICP rules, picklists and who can edit what.', tags: ['Settings', 'Audit'] },
          ].map(({ icon: Icon, title, body, tags }, i) => (
            <div key={title} className="rounded-[1.75rem] bg-white dark:bg-gray-900 p-2.5 flex flex-col">
              <IconPanel seed={i * 2 + 3} className="h-36">
                <Icon className="w-14 h-14" strokeWidth={2.3} />
              </IconPanel>
              <div className="px-3 pt-5 pb-3 flex-1 flex flex-col">
                <p className="font-display text-2xl font-normal tracking-[-0.02em] text-[#101312] dark:text-white">{title}</p>
                <p className="mt-2 text-sm text-[#56645a] dark:text-gray-400 flex-1">{body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((t) => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Green banner, like prosperr.io's "One subscription that handles all of this." */}
        <div className="mt-10 rounded-[1.75rem] bg-[#053f1a] text-[#ffffff] px-6 sm:px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <p className="flex items-start gap-3 font-display text-2xl sm:text-3xl font-normal tracking-[-0.03em] leading-tight">
            <Sparkle className="w-6 h-6 mt-1 flex-shrink-0" />
            One place for every account, from first call to signed FBP.
          </p>
          <a href="#sign-in" className="inline-flex items-center gap-2 self-start md:self-auto whitespace-nowrap rounded-full bg-[#ffffff] text-[#053f1a] px-6 py-3 text-base font-medium hover:bg-[#efefef] transition-colors">
            Sign in <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Dark footer, like prosperr.io: headline + seals, link columns, contact row */}
      <footer id="help" className="mt-auto bg-[#0d0d0d] text-[#efefef]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-16 sm:pt-20 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
            <p className="font-display font-normal text-[2.1rem] sm:text-5xl leading-[1.06] tracking-[-0.04em] max-w-xl">
              Your pipeline deserves the highest standards.
            </p>
            <div className="flex items-center gap-4">
              <Seal ring="Role-based access" center="RBAC" sub="BDR · AE · MGR" />
              <Seal ring="Every change logged" center="AUDIT" sub="Full history" />
            </div>
          </div>

          <div className="mt-14 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {[
              { title: 'Workflow', items: ['Prospecting', 'SQL qualification', 'AE assignment', 'L1–L3 meetings', 'Revival'] },
              { title: 'Built for', items: ['BDRs', 'Account Executives', 'Sales Managers', 'Admins'] },
              { title: 'Standards', items: ['Owner on every account', 'Dated next step', 'Reason on every move', 'IST · ₹ · DD Mon YYYY'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-lg font-medium">{col.title}</p>
                <ul className="mt-5 space-y-3 text-[#efefef]/60">
                  {col.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-lg font-medium">Help</p>
              <ul className="mt-5 space-y-3 text-[#efefef]/60">
                <li><Link href="/forgot-password" className="hover:text-[#efefef] transition-colors">Reset your password</Link></li>
                <li><Link href="/signup" className="hover:text-[#efefef] transition-colors">Request access</Link></li>
                <li><a href="#sign-in" className="hover:text-[#efefef] transition-colors">Sign in</a></li>
              </ul>
            </div>
          </div>

          <p className="mt-14 text-[#efefef]/80">
            <span className="font-medium text-[#efefef]">Need access?</span> Ask your sales manager to add you to the team
            <span className="text-[#efefef]/40"> · </span>
            <Link href="/forgot-password" className="hover:text-[#efefef]">Forgot password</Link>
          </p>
        </div>
        <div className="border-t border-[#ffffff]/10">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#efefef]/45">
            <span>© {new Date().getFullYear()} Prosperr · Sales CRM</span>
            <span>Internal tool for the Prosperr B2B sales team. Access is limited to team members.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
