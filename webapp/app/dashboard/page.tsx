'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, MessageSquare, Mail, TrendingUp, Phone, Building2, ArrowUpRight,
  Target, CalendarDays, ListChecks, Flame,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DashboardStats {
  totalLeads: number
  activeCampaigns: number
  totalContacts: number
  totalReplies: number
  replies?: number  // legacy alias
  replyRate: string
  hotLeadsCount?: number
  emailsSent?: number
  sparklineEmailsSent?: number[]
  sparklineReplies?: number[]
}

interface PipelineStats {
  totalPipeline: number
  openDeals: number
  wonThisMonth: number
  avgDealSize: number
  closeRate: number
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------
function Sparkline({ data, color = '#3b82f6' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 80, h = 24, pts = data.length
  const points = data.map((v, i) => {
    const x = (i / (pts - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null)

  // Redirect if not authed
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [dashRes, pipelineRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/deals/stats'),
      ])
      if (dashRes.ok) {
        const data = await dashRes.json()
        setStats(data)
      }
      if (pipelineRes.ok) {
        const data = await pipelineRes.json()
        setPipelineStats(data)
      }
    } catch {
      // ignore fetch errors
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    const t = setTimeout(() => fetchStats(), 0)
    return () => clearTimeout(t)
  }, [status, fetchStats])

  if (status === 'loading') {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
    )
  }

  if (!session) return null

  const firstName = (session.user?.name ?? session.user?.email ?? 'there').split(/[ @]/)[0]
  const inr = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const hourIST = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  const greeting = hourIST < 12 ? 'Good morning' : hourIST < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Hero band ── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 md:p-10 text-[#ffffff]"
        style={{ background: 'radial-gradient(120% 120% at 0% 0%, #0d5a28 0%, #053f1a 50%, #021a0c 100%)' }}
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #4ae386 0%, transparent 65%)' }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b773]">Prosperr Sales CRM</p>
        <h1 className="relative mt-3 text-3xl md:text-5xl font-bold leading-[1.05] max-w-2xl">
          {greeting}, {firstName}.
        </h1>
        <p className="relative mt-3 text-[#ffffff]/75 max-w-xl">
          Every account needs an owner and a dated next step. Start with today&apos;s calls, then move what&apos;s stuck.
        </p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link href="/calls" className="inline-flex items-center gap-2 rounded-full bg-[#ffffff] text-[#053f1a] px-5 py-3 text-sm font-semibold hover:bg-[#f3f3f5] transition-colors">
            <Phone className="w-4 h-4" /> Log a call <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/companies" className="inline-flex items-center gap-2 rounded-full border border-[#ffffff]/30 px-5 py-3 text-sm font-semibold hover:bg-[#ffffff]/10 transition-colors">
            <Building2 className="w-4 h-4" /> Add account
          </Link>
          <Link href="/pipeline" className="inline-flex items-center gap-2 rounded-full border border-[#ffffff]/30 px-5 py-3 text-sm font-semibold hover:bg-[#ffffff]/10 transition-colors">
            <TrendingUp className="w-4 h-4" /> Open pipeline
          </Link>
        </div>
      </section>

      {/* ── Key numbers ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded mb-2 w-16" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-24" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={<Users className="w-5 h-5" />} color="text-blue-700 bg-blue-50" value={stats?.totalContacts ?? 0} label="Stakeholders" />
            <StatCard icon={<Target className="w-5 h-5" />} color="text-violet-700 bg-violet-50" value={pipelineStats?.openDeals ?? 0} label="Open opportunities" />
            <StatCard
              icon={<Mail className="w-5 h-5" />} color="text-blue-700 bg-blue-50"
              value={stats?.emailsSent ?? 0} label="Sequence emails sent"
              sparkline={stats?.sparklineEmailsSent} sparklineColor="#0a4a1f"
            />
            <StatCard
              icon={<MessageSquare className="w-5 h-5" />} color="text-violet-700 bg-violet-50"
              value={stats?.totalReplies ?? stats?.replies ?? 0} label="Replies"
              sparkline={stats?.sparklineReplies} sparklineColor="#a87a3e"
            />
          </>
        )}
      </section>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* ── Pipeline ── */}
        <Link
          href="/pipeline"
          className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pipeline</h2>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">View board →</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expected MRR</p>
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statsLoading ? '—' : inr(pipelineStats?.totalPipeline ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statsLoading ? '—' : pipelineStats?.openDeals ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Win rate</p>
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {statsLoading ? '—' : `${pipelineStats?.closeRate ?? 0}%`}
              </p>
            </div>
          </div>

          {/* Lifecycle rail from the PRD */}
          <ol className="mt-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {['Prospect', 'SQL', 'L1', 'Multithreading', 'L2', 'L3', 'Negotiation', 'Won'].map((stage, i, all) => (
              <li key={stage} className="flex items-center gap-1.5">
                <span className={`px-3 py-1 rounded-full ${stage === 'Won' ? 'bg-violet-400 text-[#053f1a]' : 'bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-gray-200'}`}>
                  {stage}
                </span>
                {i < all.length - 1 && <span className="text-gray-300">›</span>}
              </li>
            ))}
          </ol>
        </Link>

        {/* ── Roadmap for this sprint ── */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping this sprint</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">New workspaces for the sales team.</p>
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { icon: CalendarDays, title: 'My Day', body: 'Overdue and due calls, then untouched stakeholders' },
              { icon: ListChecks, title: 'SQL Queue', body: 'ICP checks, BANT and AE assignment' },
              { icon: Flame, title: 'Inactive & Revival', body: '60-day flag, reasons and revisit dates' },
              { icon: Target, title: 'Targets', body: 'L1 booked and done against target, live' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3 py-3">
                <span className="w-9 h-9 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  color,
  value,
  label,
  sparkline,
  sparklineColor,
}: {
  icon: React.ReactNode
  color: string
  value: string | number
  label: string
  sparkline?: number[]
  sparklineColor?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-full flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sparkline && sparkline.length >= 2 && (
          <div className="mt-1.5">
            <Sparkline data={sparkline} color={sparklineColor} />
          </div>
        )}
      </div>
    </div>
  )
}
