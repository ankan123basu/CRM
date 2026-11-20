'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PhoneCall, Handshake, BarChart3, Loader2 } from 'lucide-react'
import { Headline, IconPanel, Sparkle, Tag, PillLink, ArrowPill, Topo, StatsGrid } from '@/components/prosperr/brand'
import { STAGE_LABEL, type Stage } from '@/lib/prosperr/constants'
import { cn } from '@/lib/cn'
import { useGreeting } from '@/lib/prosperr/useGreeting'

interface HomeData {
  user: { name: string | null; role: string }
  counts: { overdue: number; dueToday: number; noNextStep: number; upcomingMeetings: number; missingOutcome: number; revivalDue: number }
  byStage: Record<string, number>
  firstTask: { title: string; accountId: string | null; account: { name: string } | null } | null
}

const FUNNEL: Stage[] = ['PROSPECT', 'SQL', 'L1', 'MULTITHREADING', 'L2', 'L3', 'NEGOTIATION', 'WON']

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<HomeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const greeting = useGreeting() ?? 'Hello'

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/prosperr/home')
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) throw new Error(j.error ?? 'Could not load your day.')
        setData(j)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your day.'))
  }, [status])

  if (error) {
    return <div className="p-10 text-center text-sm text-red-600">{error}</div>
  }
  if (!data) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
  }

  const firstName = (data.user.name ?? 'there').split(' ')[0]
  const c = data.counts
  const callsWaiting = c.overdue + c.dueToday
  const role = data.user.role
  const leadership = role === 'MANAGER' || role === 'ADMIN'

  const workspaces = [
    { icon: PhoneCall, seed: 2, title: 'Prospecting', href: '/accounts', tags: ['Accounts', 'Stakeholders', 'Calls', 'Sequences', 'Referrals'] },
    { icon: Handshake, seed: 4, title: 'Pipeline', href: '/pipeline', tags: ['SQL', 'L1', 'L2', 'L3', 'Negotiation'] },
    { icon: BarChart3, seed: 6, title: 'Insights', href: '/dashboards', tags: ['Funnel', 'Targets', 'Hygiene', 'Revival'] },
  ]

  return (
    <div className="pb-12">
      {/* ── Dark hero band, like prosperr.io ── */}
      <section className="relative overflow-hidden bg-[#101312] text-[#efefef]">
        <Topo seed={5} rings={11} tone="light" />
        <div aria-hidden className="absolute -left-40 -bottom-48 w-[560px] h-[560px] rounded-full opacity-35" style={{ background: 'radial-gradient(circle, #0d5a28 0%, transparent 62%)' }} />
        <div className="relative max-w-[1240px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[#c4cbc6]">
            <Sparkle className="w-3.5 h-3.5 text-[#4ae386]" />
            {role === 'BDR' ? 'Prospecting' : role === 'AE' ? 'Your pipeline' : 'Team view'}
          </p>
          <h1 className="mt-3 font-display font-normal text-4xl md:text-6xl leading-[1.05] tracking-[-0.04em] max-w-3xl text-balance">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-3 text-lg md:text-xl text-[#efefef]/80 max-w-2xl">
            Every account needs an owner and a dated next step. Start with what&apos;s overdue.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PillLink href="/accounts" variant="hero">Open accounts</PillLink>
            <PillLink href="/pipeline" variant="ghost-dark" arrow={false}>View pipeline</PillLink>
          </div>
        </div>
      </section>

      {/* ── Lined stats grid, like prosperr.io ── */}
      <section className="max-w-[1240px] mx-auto sm:border-x border-[#d4d8d3] dark:border-gray-800">
        <StatsGrid items={[
          { label: 'Calls and follow-ups due', value: callsWaiting, accent: true, tone: c.overdue ? 'bad' : undefined, href: '/accounts' },
          { label: 'Accounts with no next step', value: c.noNextStep, accent: true, tone: c.noNextStep ? 'warn' : undefined, href: '/accounts' },
          { label: 'Meetings this week', value: c.upcomingMeetings, href: '/accounts' },
          { label: 'Inactive, ready to revive', value: c.revivalDue, href: '/accounts' },
        ]} />
        <p className="px-6 py-3 text-center text-xs text-[#56645a] border-b border-[#d4d8d3] dark:border-gray-800">
          {c.overdue} overdue · {c.dueToday} due today{c.missingOutcome ? ` · ${c.missingOutcome} past meetings need an outcome` : ''}
        </p>
      </section>

      <div className="px-4 md:px-8 pt-12 max-w-[1240px] mx-auto space-y-12">
      {/* ── Workspaces, in the Tax / Wealth / Credit card style ── */}
      <section className="space-y-6">
        <Headline as="h2" className="text-3xl md:text-5xl text-center mx-auto max-w-2xl" muted="managed in one place.">
          Your accounts, pipeline and numbers,
        </Headline>
        <div className="grid md:grid-cols-3 gap-4">
          {workspaces.map(({ icon: Icon, seed, title, href, tags }) => (
            <Link key={title} href={href} className="rounded-[1.75rem] bg-white dark:bg-gray-900 p-2.5 transition-shadow hover:shadow-[0_24px_60px_-34px_rgba(5,63,26,0.5)]">
              <IconPanel seed={seed} className="h-44">
                <Icon className="w-16 h-16" strokeWidth={2.4} />
              </IconPanel>
              <div className="px-3 pt-5 pb-3">
                <p className="font-display text-2xl font-normal tracking-[-0.02em] text-[#101312] dark:text-white">{title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Dark-green banner: the one thing to do next ── */}
      <section className="rounded-[1.75rem] bg-[#053f1a] text-[#ffffff] px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="flex items-start gap-3 font-display text-2xl md:text-3xl font-normal tracking-[-0.03em] leading-tight">
            <Sparkle className="w-6 h-6 mt-1 flex-shrink-0" />
            {data.firstTask
              ? <span>Start with: {data.firstTask.title}</span>
              : <span>Nothing due today. Line up tomorrow&apos;s calls.</span>}
          </p>
          {data.firstTask?.account && !data.firstTask.title.includes(data.firstTask.account.name) && <p className="mt-1 ml-9 text-sm text-[#ffffff]/70">{data.firstTask.account.name}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {data.firstTask?.accountId
            ? <PillLink href={`/accounts/${data.firstTask.accountId}`} variant="white">Open account</PillLink>
            : <PillLink href="/accounts" variant="white">Open accounts</PillLink>}
          <Link href="/pipeline" className="inline-flex items-center rounded-full border border-[#ffffff]/60 px-5 py-2.5 text-sm font-semibold hover:bg-[#ffffff]/10 transition-colors">
            Pipeline
          </Link>
        </div>
      </section>

      {/* ── Funnel ── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <Headline as="h2" className="text-3xl md:text-4xl" muted={leadership ? 'across the team.' : 'that you own.'}>
            Active accounts,
          </Headline>
          <ArrowPill href="/accounts">All accounts</ArrowPill>
        </div>
        <div className="rounded-[1.75rem] bg-white dark:bg-gray-900 p-5 md:p-6 overflow-x-auto">
          <ol className="grid grid-cols-8 gap-2 min-w-[880px]">
            {FUNNEL.map((s) => {
              const n = data.byStage[s] ?? 0
              const highlight = s === 'L1'
              return (
                <li key={s}>
                  <div
                    className={cn('rounded-[1.25rem] px-4 py-4 h-full',
                      highlight ? 'bg-[#053f1a] text-[#ffffff]' : 'bg-[#efefef] dark:bg-gray-800 text-[#0d0d0d] dark:text-white')}
                  >
                    <p className={cn('text-[11px] font-semibold uppercase tracking-wider truncate', highlight ? 'text-[#ffffff]/70' : 'text-[#52525b] dark:text-gray-400')}>
                      {STAGE_LABEL[s]}
                    </p>
                    <p className="font-display text-3xl font-medium tabular-nums mt-1">{n}</p>
                    {highlight && <p className="text-[11px] mt-1 text-[#ffffff]/70">Where most deals stall</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
      </div>
    </div>
  )
}
