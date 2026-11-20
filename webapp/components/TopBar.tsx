'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Bug, ChevronDown, Building2, User, Menu } from 'lucide-react'
import { ProsperrLogo } from '@/components/ProsperrLogo'

interface Tab {
  label: string
  href: string
  disabled?: boolean
  showBadge?: boolean
}

const TABS: Tab[] = [
  { label: 'Accounts', href: '/companies' },
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'Meetings', href: '/bookings' },
  { label: 'Dashboards', href: '/dashboards' },
]

// Locale per PRD: IST, dates as DD Mon YYYY.
function todayIST() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(new Date())
}

interface WorkspaceEntry {
  id: string
  name: string
  role: string
}

interface TopBarProps {
  activePath: string
  onMenuClick?: () => void
}

function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceEntry | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceEntry[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/profile').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/workspaces').then((r) => (r.ok ? r.json() : null)),
    ]).then(([profile, data]) => {
      if (!data) return
      const all: WorkspaceEntry[] = [
        ...(data.owned ?? []).map((w: WorkspaceEntry) => ({ ...w, role: 'owner' })),
        ...(data.member ?? []),
      ]
      setWorkspaces(all)
      if (profile?.workspaceId) {
        const found = all.find((w) => w.id === profile.workspaceId)
        setActiveWorkspace(found ?? null)
      }
    })
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function switchTo(id: string | 'personal') {
    // The [id]/switch route accepts "personal" as a special id to clear active workspace
    await fetch(`/api/workspaces/${id}/switch`, { method: 'POST' })
    if (id === 'personal') {
      setActiveWorkspace(null)
    } else {
      const found = workspaces.find((w) => w.id === id) ?? null
      setActiveWorkspace(found)
    }
    setOpen(false)
    window.location.reload()
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
      >
        {activeWorkspace ? <Building2 className="w-3.5 h-3.5 flex-shrink-0" /> : <User className="w-3.5 h-3.5 flex-shrink-0" />}
        <span className="max-w-[120px] truncate">{activeWorkspace?.name ?? 'Personal'}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <button
            onClick={() => switchTo('personal')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!activeWorkspace ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Personal</span>
          </button>
          {workspaces.length > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />}
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => switchTo(ws.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${activeWorkspace?.id === ws.id ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate text-left">{ws.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TopBar({ activePath, onMenuClick }: TopBarProps) {
  const [hotLeadsCount, setHotLeadsCount] = useState<number>(0)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.hotLeadsCount != null) {
          setHotLeadsCount(data.hotLeadsCount)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <header className="h-14 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-[#f3f3f5]/90 dark:bg-gray-950 backdrop-blur px-2 sm:px-5 flex-shrink-0 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="md:hidden flex-shrink-0 p-2 -ml-1 mr-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Open menu"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Link href="/dashboard" className="md:hidden flex-1 min-w-0" aria-label="Home">
        <ProsperrLogo size={22} />
      </Link>
      <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activePath === tab.href || activePath.startsWith(tab.href + '/')
          const count = tab.showBadge ? hotLeadsCount : 0

          if (tab.disabled) {
            return (
              <span
                key={tab.href}
                className="relative flex flex-shrink-0 whitespace-nowrap items-center gap-1.5 px-3 h-9 text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed select-none"
              >
                {tab.label}
              </span>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-shrink-0 whitespace-nowrap items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900'
              }`}
            >
              {tab.label}
              {tab.showBadge && count > 0 && (
                <span className="ml-0.5 min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <WorkspaceSwitcher />

      <span className="hidden lg:inline text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap px-2">
        {todayIST()} · IST
      </span>

      <Link
        href="/report-issue"
        className="flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
      >
        <Bug className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Report issue</span>
      </Link>
    </header>
  )
}
