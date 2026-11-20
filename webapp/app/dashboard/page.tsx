'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PhoneCall, CalendarClock, CalendarCheck2, RotateCcw, Loader2 } from 'lucide-react'
import { Headline, IconPanel, Sparkle, Tag, PillLink, ArrowPill } from '@/components/prosperr/brand'
import { STAGE_LABEL, type Stage } from '@/lib/prosperr/constants'
import { cn } from '@/lib/cn'

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
  const hourIST = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  const greeting = hourIST < 12 ? 'Good morning' : hourIST < 17 ? 'Good afternoon' : 'Good evening'
  const c = data.counts
  const callsWaiting = c.overdue + c.dueToday
  const role = data.user.role
  const leadership = role === 'MANAGER' || role === 'ADMIN'

  const cards = [
    {
      icon: PhoneCall, seed: 2, title: 'Calls and follow-ups', value: callsWaiting,
      detail: c.overdue ? `${c.overdue} overdue · ${c.dueToday} due today` : `${c.dueToday} due today`,
      tags: ['Overdue first', 'Then today'], href: '/accounts', tone: c.overdue ? 'bad' : undefined,
    },
    {
      icon: CalendarClock, seed: 4, title: 'No dated next step', value: c.noNextStep,
      detail: c.noNextStep ? 'Every active account needs an owner and a date' : 'Every account has a next step',
      tags: ['Pipeline hygiene'], href: '/accounts', tone: c.noNextStep ? 'warn' : undefined,
    },
    {
      icon: CalendarCheck2, seed: 6, title: 'Meetings this week', value: c.upcomingMeetings,
      detail: c.missingOutcome ? `${c.missingOutcome} past meetings need an outcome` : 'All past meetings have outcomes',
      tags: ['L1', 'L2', 'L3'], href: '/accounts', tone: c.missingOutcome ? 'warn' : undefined,
    },
    {
      icon: RotateCcw, seed: 8, title: 'Ready to revive', value: c.revivalDue,
      detail: 'Inactive accounts whose revisit date has come',
      tags: ['Revisit date reached'], href: '/accounts', tone: undefined,
    },
  ] as const

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-[1240px] mx-auto space-y-10">
      {/* ── Headline ── */}
      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a4a1f]">
          <Sparkle className="w-4 h-4" />
          {role === 'BDR' ? 'Prospecting' : role === 'AE' ? 'Your pipeline' : 'Team view'}
        </p>
        <Headline className="mt-3 text-4xl md:text-6xl" muted="Here's your day.">
          {greeting}, {firstName}.
        </Headline>
      </header>

      {/* ── Four focus cards, in prosperr.io's card style ── */}
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, seed, title, value, detail, tags, href, tone }) => (
          <Link key={title} href={href} className="group rounded-[1.75rem] bg-white dark:bg-gray-900 p-2 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(5,63,26,0.45)]">
            <IconPanel seed={seed} className="h-32">
              <Icon className="w-12 h-12" strokeWidth={2.25} />
            </IconPanel>
            <div className="px-3 pt-4 pb-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-xl font-semibold text-[#0d0d0d] dark:text-white">{title}</p>
                <p className={cn('font-display text-3xl font-semibold tabular-nums', tone === 'bad' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-[#0d0d0d] dark:text-white')}>{value}</p>
              </div>
              <p className="text-sm text-[#52525b] dark:text-gray-400 mt-1">{detail}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => <Tag key={t} className="text-xs px-2.5 py-0.5">{t}</Tag>)}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Dark-green banner: the one thing to do next ── */}
      <section className="rounded-[1.75rem] bg-[#0a4a1f] text-[#ffffff] px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="flex items-start gap-3 font-display text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-tight">
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
            {FUNNEL.map((s, i) => {
              const n = data.byStage[s] ?? 0
              const highlight = s === 'L1'
              return (
                <li key={s}>
                  <div
                    className={cn('rounded-[1.25rem] px-4 py-4 h-full',
                      highlight ? 'bg-[#0a4a1f] text-[#ffffff]' : 'bg-[#f3f3f5] dark:bg-gray-800 text-[#0d0d0d] dark:text-white')}
                  >
                    <p className={cn('text-[11px] font-semibold uppercase tracking-wider truncate', highlight ? 'text-[#ffffff]/70' : 'text-[#52525b] dark:text-gray-400')}>
                      {STAGE_LABEL[s]}
                    </p>
                    <p className="font-display text-3xl font-semibold tabular-nums mt-1">{n}</p>
                    {highlight && <p className="text-[11px] mt-1 text-[#ffffff]/70">Where most deals stall</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}
