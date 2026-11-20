'use client'

import Link from 'next/link'
import { Menu, Plus, Bug } from 'lucide-react'
import { cn } from '@/lib/cn'
import RoleSwitcher from '@/components/prosperr/RoleSwitcher'
import { ProsperrLogo } from '@/components/ProsperrLogo'

// prosperr.io-style navigation: quiet text links, the current page marked with a
// green underline, and a single green pill CTA on the right.
const TABS = [
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
  return (
    <header className="h-16 flex items-center gap-2 sm:gap-3 border-b border-[#101312]/80 dark:border-gray-800 bg-[#efefef] dark:bg-gray-950 px-2 sm:px-6 flex-shrink-0 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="md:hidden flex-shrink-0 p-2 -ml-1 rounded-full text-[#101312] dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        title="Open menu"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <Link href="/dashboard" className="md:hidden flex-1 min-w-0" aria-label="Home">
        <ProsperrLogo size={24} />
      </Link>

      <nav className="hidden md:flex items-center gap-7 flex-1 min-w-0 overflow-x-auto no-scrollbar h-full">
        {TABS.map((tab) => {
          const active = activePath === tab.href || activePath.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative h-full flex items-center whitespace-nowrap text-[15px] font-medium transition-colors',
                active ? 'text-[#053f1a] dark:text-[#4ae386]' : 'text-[#101312] dark:text-gray-300 hover:text-[#053f1a]'
              )}
            >
              {tab.label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-[#053f1a] dark:bg-[#4ae386]" />}
            </Link>
          )
        })}
      </nav>

      <span suppressHydrationWarning className="hidden xl:inline text-sm text-[#56645a] dark:text-gray-400 tabular-nums whitespace-nowrap">
        {todayIST()} · IST
      </span>

      <RoleSwitcher />

      <Link
        href="/report-issue"
        title="Report an issue"
        aria-label="Report an issue"
        className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full text-[#101312] dark:text-gray-300 border border-[#101312]/15 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      >
        <Bug className="w-4 h-4" />
      </Link>

      <Link
        href="/accounts?new=1"
        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#053f1a] text-[#ffffff] px-3 sm:px-5 h-10 text-sm font-medium hover:bg-[#0a5a26] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add account</span>
      </Link>
    </header>
  )
}
