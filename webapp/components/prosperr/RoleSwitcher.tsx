'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye, Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Me {
  user: { id: string; name: string | null; role: string }
  actingAs: boolean
  realUserId: string
  demoMode: boolean
  team: { id: string; name: string | null; role: string }[]
}

const ROLE_LABEL: Record<string, string> = { BDR: 'BDR', AE: 'AE', MANAGER: 'Manager', ADMIN: 'Admin' }
const ROLE_ORDER = ['ADMIN', 'MANAGER', 'AE', 'BDR']

/**
 * Shows the current CRM role. In demo mode (PROSPERR_DEMO_MODE=true) it becomes
 * a "View as" menu so a presenter can switch between BDR, AE and Manager views.
 */
export default function RoleSwitcher() {
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/prosperr/me').then((r) => (r.ok ? r.json() : null)).then(setMe).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  async function viewAs(userId: string | null) {
    setSwitching(userId ?? 'self')
    setError(null)
    const res = await fetch('/api/prosperr/act-as', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
    if (res.ok) window.location.reload()
    else {
      setError((await res.json().catch(() => null))?.error ?? 'Could not switch view.')
      setSwitching(null)
    }
  }

  if (!me) return null
  const roleLabel = ROLE_LABEL[me.user.role] ?? me.user.role
  const chip = (
    <span className="flex items-center gap-2 min-w-0">
      {me.demoMode && <Eye className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="max-w-[110px] truncate hidden sm:inline">{me.user.name ?? 'You'}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 bg-violet-100 text-violet-800">{roleLabel}</span>
    </span>
  )

  if (!me.demoMode) {
    return <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">{chip}</div>
  }

  const grouped = ROLE_ORDER.map((r) => ({ role: r, people: me.team.filter((t) => t.role === r) })).filter((g) => g.people.length)

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Demo: view the CRM as another team member"
        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
          me.actingAs ? 'bg-violet-50 border-violet-300 text-violet-900' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50')}
      >
        {chip}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 py-2">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Demo · view as</p>
          {me.actingAs && (
            <button onClick={() => viewAs(null)} className="w-full text-left px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-gray-50">
              Back to my own view
            </button>
          )}
          {grouped.map((g) => (
            <div key={g.role} className="py-1">
              <p className="px-4 py-1 text-[11px] font-semibold text-violet-700">{ROLE_LABEL[g.role]}</p>
              {g.people.map((p) => (
                <button
                  key={p.id}
                  onClick={() => viewAs(p.id === me.realUserId ? null : p.id)}
                  disabled={switching !== null}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === me.user.id && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          ))}
          {error && <p className="px-4 pt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
