'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bug, Menu } from 'lucide-react'
import RoleSwitcher from '@/components/prosperr/RoleSwitcher'
import { ProsperrLogo } from '@/components/ProsperrLogo'

interface Tab {
  label: string
  href: string
  disabled?: boolean
  showBadge?: boolean
}

const TABS: Tab[] = [
  { label: 'Accounts', href: '/accounts' },
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

interface TopBarProps {
  activePath: string
  onMenuClick?: () => void
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
    <header className="h-14 flex items-center gap-2 border-b border-[#101312]/80 dark:border-gray-800 bg-[#efefef] dark:bg-gray-950 backdrop-blur px-2 sm:px-5 flex-shrink-0 sticky top-0 z-20">
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

      <RoleSwitcher />

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
