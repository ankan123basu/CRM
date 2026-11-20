'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Loader2, X, AlertTriangle, Building2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { STAGES, STAGE_LABEL, SIZE_BUCKETS, CITIES, formatDateIST, INR, type Stage } from '@/lib/prosperr/constants'
import { StageChip, SizeChip, TempChip, relativeDay, isOverdue } from '@/components/prosperr/chips'

interface AccountRow {
  id: string
  name: string
  domain: string | null
  city: string | null
  cityTier: 'P0' | 'P1' | 'OUT'
  industry: string | null
  licensePotential: number | null
  sizeBucket: string | null
  stage: string
  status: string
  zone: string
  nextStep: string | null
  nextStepAt: string | null
  lastActivityAt: string | null
  inactiveReason: string | null
  revisitAt: string | null
  ae: { id: string; name: string | null } | null
  bdrs: { id: string; name: string }[]
  temperature: string | null
  expectedMrr: number | null
  stakeholderCount: number
  coverage: { FINANCE: boolean; HR: boolean; PAYROLL: boolean }
}

const STATUS_TABS = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: '', label: 'All' },
]

export default function AccountsPage() {
  const [rows, setRows] = useState<AccountRow[]>([])
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [stage, setStage] = useState('')
  const [size, setSize] = useState('')
  const [city, setCity] = useState('')
  const [mine, setMine] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const sp = new URLSearchParams()
    if (q.trim()) sp.set('q', q.trim())
    if (status) sp.set('status', status)
    if (stage) sp.set('stage', stage)
    if (size) sp.set('size', size)
    if (city) sp.set('city', city)
    if (mine) sp.set('owner', 'me')
    try {
      const res = await fetch(`/api/prosperr/accounts?${sp}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not load accounts.')
      setRows(data.accounts)
      setRole(data.role)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load accounts.')
    } finally {
      setLoading(false)
    }
  }, [q, status, stage, size, city, mine])

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0)
    return () => clearTimeout(t)
  }, [load, q])

  const summary = useMemo(() => {
    const noNext = rows.filter((r) => r.status === 'ACTIVE' && !r.nextStepAt).length
    const overdue = rows.filter((r) => r.status === 'ACTIVE' && isOverdue(r.nextStepAt)).length
    const mrr = rows.reduce((s, r) => s + (r.status === 'ACTIVE' ? r.expectedMrr ?? 0 : 0), 0)
    return { noNext, overdue, mrr }
  }, [rows])

  const subtitle =
    role === 'BDR' ? 'Your prospects, plus every account from L1 onwards.'
      : role === 'AE' ? 'Every account from L1 booking onwards. Prospecting stays with the BDRs.'
        : 'Every prospect and pipeline account across the team.'

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        {role && role !== 'AE' && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add account
          </button>
        )}
      </header>

      {/* Summary strip: hygiene at a glance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Accounts in view" value={loading ? '—' : rows.length.toLocaleString('en-IN')} />
        <Stat label="No dated next step" value={loading ? '—' : String(summary.noNext)} tone={summary.noNext ? 'warn' : undefined} />
        <Stat label="Next step overdue" value={loading ? '—' : String(summary.overdue)} tone={summary.overdue ? 'bad' : undefined} />
        <Stat label="Expected MRR (active)" value={loading ? '—' : INR(summary.mrr)} />
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative w-full xl:flex-1 xl:min-w-[280px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="account-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search accounts, people, e-mail or LinkedIn"
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setStatus(t.key)}
                className={cn('px-3.5 py-1 rounded-full text-sm font-semibold transition-colors', status === t.key ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Select id="f-stage" value={stage} onChange={setStage} label="Stage" options={STAGES.map((s) => [s, STAGE_LABEL[s as Stage]])} />
          <Select id="f-size" value={size} onChange={setSize} label="Size" options={SIZE_BUCKETS.map((b) => [b.key, b.label])} />
          <Select id="f-city" value={city} onChange={setCity} label="City" options={CITIES.map((c) => [c, c])} />
          <button
            onClick={() => setMine((m) => !m)}
            className={cn('px-3.5 py-2 rounded-full border text-sm font-semibold transition-colors', mine ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300')}
          >
            Mine
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={load} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">Try again</button>
          </div>
        ) : loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-8 h-8 mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No accounts match these filters</p>
            <p className="text-xs text-gray-500 mt-1">Clear a filter, or add a new account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="text-left border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900">
                  {['Account', 'Stage', 'Size', 'Coverage', 'Owners', 'Temp · MRR', 'Next step'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r) => (
                  <AccountRowView key={r.id} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddAccountModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function AccountRowView({ r }: { r: AccountRow }) {
  const router = useRouter()
  const inactive = r.status === 'INACTIVE'
  const overdue = !inactive && isOverdue(r.nextStepAt)
  return (
    <tr onClick={() => router.push(`/accounts/${r.id}`)} className="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/accounts/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-gray-900 dark:text-white hover:text-blue-700">
          {r.name}
        </Link>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
          <span>{r.city ?? '—'}</span>
          {r.cityTier !== 'OUT' && <span className="rounded px-1 text-[10px] font-bold bg-violet-100 text-violet-800">{r.cityTier}</span>}
          {r.industry && <span>· {r.industry}</span>}
        </div>
      </td>
      <td className="px-4 py-3"><StageChip stage={r.stage} inactive={inactive} /></td>
      <td className="px-4 py-3"><SizeChip bucket={r.sizeBucket} licenses={r.licensePotential} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" title="Engaged functions: Finance · HR · Payroll">
          {(['FINANCE', 'HR', 'PAYROLL'] as const).map((d) => (
            <span
              key={d}
              className={cn('w-7 h-6 rounded-full text-[10px] font-bold flex items-center justify-center', r.coverage[d] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}
            >
              {d === 'FINANCE' ? 'F' : d === 'HR' ? 'H' : 'P'}
            </span>
          ))}
          <span className="text-xs text-gray-500 ml-1 tabular-nums">{r.stakeholderCount}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs">
        <div className="text-gray-900 dark:text-gray-100 font-medium">{r.ae?.name ? `AE · ${r.ae.name}` : <span className="text-gray-400">No AE</span>}</div>
        <div className="text-gray-500 truncate max-w-[180px]">BDR · {r.bdrs.map((b) => b.name).join(', ') || '—'}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 items-start">
          <TempChip temperature={r.temperature} />
          {r.expectedMrr != null && <span className="text-xs text-gray-500 tabular-nums">{INR(r.expectedMrr)}/mo</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-xs max-w-[240px]">
        {inactive ? (
          <span className="text-gray-500">Revisit {r.revisitAt ? relativeDay(r.revisitAt) : '—'}</span>
        ) : r.nextStepAt ? (
          <>
            <div className="text-gray-900 dark:text-gray-100 truncate">{r.nextStep ?? 'Follow up'}</div>
            <div className={cn('font-semibold', overdue ? 'text-red-600' : 'text-gray-500')} title={formatDateIST(r.nextStepAt)}>
              {overdue ? 'Overdue · ' : ''}{relativeDay(r.nextStepAt)}
            </div>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700"><AlertTriangle className="w-3.5 h-3.5" /> No next step</span>
        )}
      </td>
    </tr>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'bad' }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn('font-display text-2xl font-bold tabular-nums mt-0.5', tone === 'bad' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-gray-900 dark:text-white')}>{value}</p>
    </div>
  )
}

function Select({ id, value, onChange, label, options }: { id: string; value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <option value="">{label}: all</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function AddAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', website: '', city: 'Bengaluru', industry: '', licensePotential: '', leadSource: 'Apollo' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicate, setDuplicate] = useState<{ id: string; name: string } | null>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setDuplicate(null)
    try {
      const res = await fetch('/api/prosperr/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (res.status === 409) { setDuplicate(data.duplicate); setError(data.error); return }
      if (!res.ok) throw new Error(data.error ?? 'Could not create the account.')
      router.push(`/accounts/${data.account.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add account</h2>
            <p className="text-sm text-gray-500 mt-1">We check the name and website for duplicates first.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <Field label="Company name" id="acc-name"><input id="acc-name" required value={form.name} onChange={set('name')} className={input} placeholder="e.g. Kaveri Health" /></Field>
        <Field label="Website" id="acc-web"><input id="acc-web" value={form.website} onChange={set('website')} className={input} placeholder="kaverihealth.com" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" id="acc-city">
            <select id="acc-city" value={form.city} onChange={set('city')} className={input}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="License potential" id="acc-lic"><input id="acc-lic" type="number" min={0} value={form.licensePotential} onChange={set('licensePotential')} className={input} placeholder="e.g. 800" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry" id="acc-ind"><input id="acc-ind" value={form.industry} onChange={set('industry')} className={input} placeholder="Fintech" /></Field>
          <Field label="Lead source" id="acc-src">
            <select id="acc-src" value={form.leadSource} onChange={set('leadSource')} className={input}>{['Apollo', 'LinkedIn', 'Referral', 'Inbound', 'Event'].map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
        </div>
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
            {duplicate && <Link href={`/accounts/${duplicate.id}?join=1`} className="block mt-1 font-semibold text-blue-700 hover:underline">Join {duplicate.name} →</Link>}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create account
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
