'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Loader2, Phone, Mail, Plus, X, Lock, CalendarClock, ShieldCheck, History,
  Globe, Star, CornerDownRight, AlertTriangle, CheckCircle2, Circle, Link2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  DEPARTMENT_LABEL, LEVELS, INACTIVE_REASONS, CALL_OUTCOMES, INR, formatDateIST,
  type Department,
} from '@/lib/prosperr/constants'
import { StageChip, TempChip, LevelChip, EngagementChip, relativeDay, isOverdue } from '@/components/prosperr/chips'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

const ENGAGED = ['CONNECTED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED']
const DEPTS: Department[] = ['FINANCE', 'HR', 'PAYROLL', 'OTHER']
const outcomeLabel = (k: string | null) => CALL_OUTCOMES.find((o) => o.key === k)?.label ?? k?.replace(/_/g, ' ').toLowerCase() ?? ''

export default function AccountDetailPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}>
      <AccountDetail />
    </Suspense>
  )
}

function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const join = useSearchParams().get('join') === '1'
  const [data, setData] = useState<Any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/prosperr/accounts/${id}${join ? '?join=1' : ''}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Could not load this account.')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this account.')
    }
  }, [id, join])

  useEffect(() => { load() }, [load])

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <Lock className="w-8 h-8 mx-auto text-gray-300" />
        <p className="mt-3 font-semibold text-gray-900 dark:text-white">{error}</p>
        <Link href="/accounts" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">Back to accounts</Link>
      </div>
    )
  }
  if (!data) return <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>

  const { account: a, stakeholders, activities, meetings, tasks, opportunity, sql, assignments, audit, permissions, viewer } = data
  const inactive = a.status === 'INACTIVE'
  const canAdd = permissions.ADD_STAKEHOLDER || (viewer.role === 'BDR' && a.zone === 'PROSPECTING')
  const reason = INACTIVE_REASONS.find((r) => r.key === a.inactiveReason)

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <Link href="/accounts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Accounts
      </Link>

      {/* ── Header ── */}
      <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StageChip stage={a.stage} inactive={inactive} />
              <span className={cn('text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', a.zone === 'PIPELINE' ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-600')}>
                {a.zone === 'PIPELINE' ? 'Pipeline · shared' : 'Prospecting · private'}
              </span>
              {a.icpFit === 'NO' && <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700">Outside ICP</span>}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-[-0.035em] leading-[1.02] text-[#0d0d0d] dark:text-white">{a.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blue-700"><Globe className="w-3.5 h-3.5" />{a.domain}</a>}
              <span>{a.city ?? 'City unknown'}{a.cityTier !== 'OUT' ? ` · ${a.cityTier} city` : ''}</span>
              {a.industry && <span>{a.industry}</span>}
              {a.leadSource && <span>Source: {a.leadSource}</span>}
            </div>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm xl:min-w-[520px]">
            <Fact label="License potential" value={a.licensePotential != null ? `${a.licensePotential.toLocaleString('en-IN')}` : '—'} sub={a.sizeBucket ? a.sizeBucket[0] + a.sizeBucket.slice(1).toLowerCase() : undefined} />
            <Fact label="Expected MRR" value={INR(opportunity?.expectedMrr)} />
            <Fact label="Temperature" value={<TempChip temperature={opportunity?.temperature ?? null} />} />
            <Fact label="Last activity" value={relativeDay(a.lastActivityAt)} sub={formatDateIST(a.lastActivityAt)} />
            <Fact label="AE owner" value={a.ae?.name ?? 'Unassigned'} />
            <Fact label="SQL credit" value={a.sqlBdr?.name ?? '—'} />
            <Fact label="L1 booked" value={formatDateIST(a.l1BookedAt)} />
            <Fact label="Created by" value={a.createdBy?.name ?? '—'} />
          </dl>
        </div>

        {inactive ? (
          <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-gray-900 dark:text-white">Inactive since {formatDateIST(a.inactiveAt)}</span>
            <span className="text-gray-600 dark:text-gray-300">Reason: {reason?.label ?? a.inactiveReason ?? '— missing reason'}</span>
            {a.revisitAt && <span className={cn('font-semibold', isOverdue(a.revisitAt) ? 'text-red-600' : 'text-gray-600')}>Revisit {relativeDay(a.revisitAt)}</span>}
            {a.inactiveRemark && <span className="text-gray-500 w-full">“{a.inactiveRemark}”</span>}
          </div>
        ) : (
          <div className={cn('mt-6 rounded-2xl px-4 py-3 text-sm flex flex-wrap items-center gap-x-3 gap-y-1 border',
            !a.nextStepAt ? 'bg-amber-50 border-amber-200 text-amber-800' : isOverdue(a.nextStepAt) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-900')}>
            <CalendarClock className="w-4 h-4" />
            {a.nextStepAt ? (
              <><span className="font-semibold">Next step:</span> {a.nextStep ?? 'Follow up'} <span className="font-semibold">· {relativeDay(a.nextStepAt)}</span> <span className="opacity-70">({formatDateIST(a.nextStepAt)})</span></>
            ) : (
              <span className="font-semibold">No dated next step. Every active account needs an owner and a date.</span>
            )}
          </div>
        )}
      </section>

      {viewer.joining && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-900">
          <p className="font-semibold">Another BDR is already prospecting {a.name}.</p>
          <p className="mt-0.5">You can see who is taken below. Add your own stakeholders to join the account; their contact details and history stay private to them.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <AccountXRay stakeholders={stakeholders} />

          {/* ── Stakeholders ── */}
          <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">Stakeholders</h2>
                <p className="text-sm text-gray-500">By function, in priority order: CFO, CHRO, Finance head, HR head, C&amp;B, Total Rewards, Payroll.</p>
              </div>
              {canAdd && (
                <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold flex-shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            <div className="mt-5 space-y-6">
              {DEPTS.map((d) => {
                const list = stakeholders.filter((s: Any) => s.department === d)
                if (!list.length) return null
                return (
                  <div key={d}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#053f1a] mb-2">{DEPARTMENT_LABEL[d]} · {list.length}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {list.map((s: Any) => <StakeholderCard key={s.id} s={s} />)}
                    </div>
                  </div>
                )
              })}
              {stakeholders.length === 0 && <p className="text-sm text-gray-500">No stakeholders yet. Add the CFO or CHRO first.</p>}
            </div>
          </section>

          {/* ── Timeline ── */}
          <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">Timeline</h2>
            {viewer.restricted && <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Prospecting zone: you see your own touches only.</p>}
            <ol className="mt-4 relative border-l border-gray-200 dark:border-gray-700 ml-2 space-y-4">
              {activities.length === 0 && <li className="pl-5 text-sm text-gray-500">No activity yet.</li>}
              {activities.slice(0, 40).map((x: Any) => {
                const who = stakeholders.find((s: Any) => s.id === x.stakeholderId)
                return (
                  <li key={x.id} className="pl-5 relative">
                    <span className={cn('absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full', x.type === 'REFERRAL' ? 'bg-violet-400' : x.type === 'CALL' ? 'bg-blue-600' : 'bg-gray-300')} />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-semibold">{x.type === 'REFERRAL' ? 'Referral' : x.type[0] + x.type.slice(1).toLowerCase()}</span>
                      {who && <> · {who.firstName} {who.lastName ?? ''}</>}
                      {x.outcome && <span className="text-gray-500"> · {outcomeLabel(x.outcome)}</span>}
                    </p>
                    {x.remark && <p className="text-sm text-gray-600 dark:text-gray-400">{x.remark}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateIST(x.occurredAt)} · {x.loggedBy?.name}</p>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        {/* ── Right rail ── */}
        <aside className="space-y-6 min-w-0">
          <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">Open tasks</h2>
            <ul className="mt-3 space-y-2">
              {tasks.length === 0 && <li className="text-sm text-gray-500">Nothing open.</li>}
              {tasks.map((t: Any) => (
                <li key={t.id} className="text-sm">
                  <p className="text-gray-900 dark:text-gray-100">{t.title}</p>
                  <p className={cn('text-xs font-semibold', isOverdue(t.dueAt) ? 'text-red-600' : 'text-gray-500')}>
                    {isOverdue(t.dueAt) ? 'Overdue · ' : ''}{relativeDay(t.dueAt)} · {t.assignee?.name}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">Meetings</h2>
            <ul className="mt-3 space-y-3">
              {meetings.length === 0 && <li className="text-sm text-gray-500">No meetings booked yet.</li>}
              {meetings.map((m: Any) => {
                const past = new Date(m.scheduledFor) < new Date()
                const missingOutcome = past && m.status === 'SCHEDULED'
                return (
                  <li key={m.id} className="flex gap-3">
                    <span className="font-display font-bold text-sm w-12 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">{m.levels.join('+')}</span>
                    <div className="min-w-0 text-sm">
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">{formatDateIST(m.scheduledFor)} <span className="font-normal text-gray-500">· {m.status.replace('_', ' ').toLowerCase()}</span></p>
                      {missingOutcome && <p className="text-xs font-semibold text-red-600 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Outcome not recorded</p>}
                      {m.outcome && <p className="text-xs text-gray-500">{m.outcome.replace(/_/g, ' ').toLowerCase()}</p>}
                      <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                        {m.exitStepDone ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Circle className="w-3 h-3" />}
                        Exit step {m.levels.includes('L1') ? '(documents shared)' : m.levels.includes('L2') ? '(commercials sent)' : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          {sql && (
            <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">SQL</h2>
                <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', sql.status === 'QUALIFIED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
                  {sql.status.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {(['budget', 'authority', 'need', 'timeline'] as const).map((k) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-gray-500">{k}</dt>
                    <dd className="text-gray-900 dark:text-gray-100">{sql.bant?.[k]?.value?.replace(/_/g, ' ').toLowerCase() ?? '—'}</dd>
                  </div>
                ))}
              </dl>
              {sql.smallException && <p className="mt-3 text-xs text-amber-700">Small-account exception: {sql.smallReason}</p>}
              <p className="mt-3 text-xs text-gray-400">Submitted {formatDateIST(sql.submittedAt)}</p>
            </section>
          )}

          <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white inline-flex items-center gap-2"><History className="w-4 h-4" /> History</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {assignments.map((h: Any) => (
                <li key={h.id}><span className="font-semibold">Assigned to {h.toAeName}</span> by {h.byName} · <span className="text-gray-500">{formatDateIST(h.at)}</span>{h.reason && <span className="block text-xs text-gray-500">{h.reason}</span>}</li>
              ))}
              {audit.filter((l: Any) => l.field !== 'aeOwnerId').map((l: Any) => (
                <li key={l.id} className="text-gray-700 dark:text-gray-300">{l.field}: {l.oldValue ?? '—'} → {l.newValue} <span className="text-xs text-gray-500">· {l.actorName} · {formatDateIST(l.at)}</span></li>
              ))}
              {!assignments.length && !audit.length && <li className="text-gray-500">No changes recorded yet.</li>}
            </ul>
          </section>
        </aside>
      </div>

      {showAdd && <AddStakeholderModal accountId={a.id} stakeholders={stakeholders} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); if (join) window.location.href = `/accounts/${a.id}`; else load() }} />}
    </div>
  )
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900 dark:text-white truncate">{value}</dd>
      {sub && <dd className="text-[11px] text-gray-400">{sub}</dd>}
    </div>
  )
}

/** Coverage of Finance / HR / Payroll against seniority L1–L5 (M7-4). */
function AccountXRay({ stakeholders }: { stakeholders: Any[] }) {
  const grid = useMemo(() => {
    const g: Record<string, Record<string, Any[]>> = {}
    for (const d of ['FINANCE', 'HR', 'PAYROLL']) { g[d] = {}; for (const l of LEVELS) g[d][l] = [] }
    for (const s of stakeholders) if (g[s.department] && s.level) g[s.department][s.level].push(s)
    return g
  }, [stakeholders])

  const gaps = (['FINANCE', 'HR', 'PAYROLL'] as const).filter((d) => !stakeholders.some((s) => s.department === d && ENGAGED.includes(s.engagement)))
  const seniorEngaged = stakeholders.some((s) => ['L1', 'L2'].includes(s.level) && ENGAGED.includes(s.engagement))

  return (
    <section className="bg-white dark:bg-gray-900 rounded-[1.75rem] border border-[#e6e6e8] dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#0d0d0d] dark:text-white">Account X-ray</h2>
          <p className="text-sm text-gray-500">Who we reach, by function and seniority.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className={cn('px-2.5 py-1 rounded-full', seniorEngaged ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
            {seniorEngaged ? 'Senior (L1/L2) engaged' : 'No senior engaged yet'}
          </span>
          {gaps.length > 0 && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Uncovered: {gaps.map((g) => DEPARTMENT_LABEL[g]).join(', ')}</span>}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="w-24" />
              {LEVELS.map((l) => <th key={l} className="text-xs font-semibold text-gray-500 pb-1">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {(['FINANCE', 'HR', 'PAYROLL'] as const).map((d) => (
              <tr key={d}>
                <th className="text-left text-sm font-semibold text-gray-900 dark:text-white pr-2">{DEPARTMENT_LABEL[d]}</th>
                {LEVELS.map((l) => {
                  const people = grid[d][l]
                  const engaged = people.some((p: Any) => ENGAGED.includes(p.engagement))
                  const cold = people.length > 0 && !engaged
                  return (
                    <td key={l} className={cn('h-12 rounded-xl text-center align-middle text-xs px-1',
                      engaged ? 'bg-blue-600 text-white' : cold ? 'bg-violet-100 text-violet-800' : 'bg-gray-50 dark:bg-gray-800/60 text-gray-300')}
                      title={people.map((p: Any) => `${p.firstName} ${p.lastName ?? ''} — ${p.designation}`).join('\n')}>
                      {people.length ? people.map((p: Any) => p.firstName).join(', ') : '·'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4">
        <span><span className="inline-block w-2.5 h-2.5 rounded bg-blue-600 mr-1 align-middle" />Engaged</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded bg-violet-100 mr-1 align-middle" />Known, not engaged</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded bg-gray-100 mr-1 align-middle" />Gap</span>
      </p>
    </section>
  )
}

function StakeholderCard({ s }: { s: Any }) {
  if (s.taken) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4 bg-gray-50/60 dark:bg-gray-800/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{s.firstName} {s.lastName}</p>
            <p className="text-xs text-gray-500">{s.designation}</p>
          </div>
          <LevelChip level={s.level} />
        </div>
        <p className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Being worked by {s.bdrOwner?.name ?? 'another BDR'}</p>
      </div>
    )
  }
  const phones = (s.phones ?? []) as { number: string; invalid: boolean }[]
  return (
    <div className="rounded-[1.5rem] border border-[#e6e6e8] dark:border-gray-700 p-4 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            {s.firstName} {s.lastName}
            {s.primarySpoc && <span title="Primary SPOC"><Star className="w-3.5 h-3.5 text-violet-500 fill-violet-400" /></span>}
          </p>
          <p className="text-xs text-gray-500 truncate">{s.designation ?? 'No designation'}{s.role === 'DECISION_MAKER' ? ' · Decision maker' : ''}</p>
        </div>
        <LevelChip level={s.level} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <EngagementChip engagement={s.engagement} />
        {s.rightPoc && <span className="text-[11px] font-semibold text-green-700 inline-flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" /> Right POC</span>}
      </div>
      {s.referredBy && (
        <p className="mt-2 text-xs text-violet-700 inline-flex items-center gap-1"><CornerDownRight className="w-3 h-3" /> Referred by {s.referredBy.firstName} {s.referredBy.lastName ?? ''}</p>
      )}
      <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
        {phones.map((p) => (
          <p key={p.number} className={cn('flex items-center gap-1.5 tabular-nums', p.invalid && 'line-through text-gray-400')}>
            <Phone className="w-3 h-3" /> <a href={`tel:${p.number.replace(/\s/g, '')}`} className="hover:text-blue-700">{p.number}</a>
            <a href={`https://wa.me/${p.number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-700 font-semibold hover:underline">WhatsApp</a>
          </p>
        ))}
        {(s.emails ?? []).map((e: string) => <p key={e} className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" /> {e}</p>)}
        {s.linkedinUrl && <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-700"><Link2 className="w-3 h-3" /> LinkedIn</a>}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap justify-between gap-2 text-[11px] text-gray-500">
        <span>BDR · {s.bdrOwner?.name ?? '—'} · {s.callAttempts} tries</span>
        <span className={cn(isOverdue(s.nextFollowUpAt) && 'text-red-600 font-semibold')}>
          {s.nextFollowUpAt ? `Follow-up ${relativeDay(s.nextFollowUpAt)}` : s.lastInteractionAt ? `Last touch ${relativeDay(s.lastInteractionAt)}` : 'Not contacted'}
        </span>
      </div>
    </div>
  )
}

function AddStakeholderModal({ accountId, stakeholders, onClose, onSaved }: { accountId: string; stakeholders: Any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', designation: '', department: 'FINANCE', email: '', phone: '', linkedinUrl: '', referredById: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const seniors = stakeholders.filter((s) => !s.taken && ['L1', 'L2'].includes(s.level))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/prosperr/accounts/${accountId}/stakeholders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add the stakeholder.')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the stakeholder.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#0d0d0d] dark:text-white">Add stakeholder</h2>
            <p className="text-sm text-gray-500 mt-1">Level comes from the designation map. We check e-mail, LinkedIn and phone for duplicates.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <L id="sh-first" label="First name"><input id="sh-first" required value={form.firstName} onChange={set('firstName')} className={input} /></L>
          <L id="sh-last" label="Last name"><input id="sh-last" value={form.lastName} onChange={set('lastName')} className={input} /></L>
        </div>
        <L id="sh-desig" label="Designation"><input id="sh-desig" value={form.designation} onChange={set('designation')} className={input} placeholder="e.g. CFO, Head of Payroll" list="designation-hints" /></L>
        <datalist id="designation-hints">{['CFO', 'CHRO', 'Head of Finance', 'Finance Controller', 'Director HR', 'Head of Compensation and Benefits', 'Head Of Payroll', 'Payroll Lead', 'HR Manager'].map((d) => <option key={d} value={d} />)}</datalist>
        <L id="sh-dept" label="Department (used if the designation isn't mapped)">
          <select id="sh-dept" value={form.department} onChange={set('department')} className={input}>{DEPTS.map((d) => <option key={d} value={d}>{DEPARTMENT_LABEL[d]}</option>)}</select>
        </L>
        <div className="grid grid-cols-2 gap-3">
          <L id="sh-email" label="E-mail"><input id="sh-email" type="email" value={form.email} onChange={set('email')} className={input} /></L>
          <L id="sh-phone" label="Phone"><input id="sh-phone" value={form.phone} onChange={set('phone')} className={input} placeholder="+91 98…" /></L>
        </div>
        <L id="sh-li" label="LinkedIn URL"><input id="sh-li" value={form.linkedinUrl} onChange={set('linkedinUrl')} className={input} /></L>
        {seniors.length > 0 && (
          <L id="sh-ref" label="Referred by (an L1/L2 at this account)">
            <select id="sh-ref" value={form.referredById} onChange={set('referredById')} className={input}>
              <option value="">Not referred</option>
              {seniors.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName ?? ''} · {s.designation}</option>)}
            </select>
          </L>
        )}
        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add stakeholder
          </button>
        </div>
      </form>
    </div>
  )
}

function L({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
