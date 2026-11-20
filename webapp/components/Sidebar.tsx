'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { ProsperrLogo } from '@/components/ProsperrLogo'
import {
  ChevronLeft, ChevronRight, ChevronDown, X,
  Bell, Moon, Sun, ExternalLink,
  Home, Users, User,
  CheckSquare, Inbox, CalendarDays, Calendar,
  BarChart2, Shield, Flame, Activity,
  Settings, LogOut, ShieldCheck,
  TrendingUp, Building2, GitBranch, Phone, ListChecks,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Notification {
  id: string
  type: 'followup' | 'reply'
  title: string
  body: string
  href: string
  at: string | null
}

// Fix 3: added 'live' badge kind for the Extension link
type Badge = { kind: 'beta' } | { kind: 'soon' } | { kind: 'live' } | null

interface NavItemDef {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: Badge
  disabled?: boolean
  // Fix 2: exact=true forces pathname === href matching (prevents /settings matching /settings/team)
  exact?: boolean
}

// ── Nav structure (Prosperr Sales CRM) ────────────────────────────────────────
const NAV_TOP: NavItemDef[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
]

const NAV_PROSPECT: NavItemDef[] = [
  { href: '/accounts', label: 'Accounts', icon: Building2 },
  { href: '/contacts', label: 'Stakeholders', icon: User },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/sequences', label: 'Email Sequences', icon: GitBranch },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
]

const NAV_PIPELINE: NavItemDef[] = [
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/bookings', label: 'Meetings', icon: Calendar },
]

const NAV_INSIGHTS: NavItemDef[] = [
  { href: '/dashboards', label: 'Dashboards', icon: BarChart2 },
  { href: '/analytics', label: 'Reports', icon: Activity },
]

// Hackathon roadmap — each lane ships one of these (see team plan).
const NAV_COMING_SOON: NavItemDef[] = [
  { href: '/my-day', label: 'My Day', icon: CalendarDays, badge: { kind: 'soon' }, disabled: true },
  { href: '/sql', label: 'SQL Queue', icon: ListChecks, badge: { kind: 'soon' }, disabled: true },
  { href: '/inactive', label: 'Inactive & Revival', icon: Flame, badge: { kind: 'soon' }, disabled: true },
  { href: '/targets', label: 'Targets', icon: Shield, badge: { kind: 'soon' }, disabled: true },
]

// ── Small sub-components ──────────────────────────────────────────────────────

function BadgeLabel({ badge, collapsed }: { badge: Badge; collapsed: boolean }) {
  if (!badge || collapsed) return null
  if (badge.kind === 'beta') {
    return (
      <span className="rounded-full text-[10px] px-2 py-0.5 bg-[#053f1a] text-[#ffffff] font-semibold leading-none">
        Beta
      </span>
    )
  }
  if (badge.kind === 'live') {
    return (
      <span className="rounded-full text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 font-medium leading-none">
        Live
      </span>
    )
  }
  return (
    <span className="rounded-full text-[10px] px-2 py-0.5 border border-gray-300 dark:border-gray-700 text-gray-500 font-semibold leading-none">
      Soon
    </span>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge = null,
  disabled = false,
  exact = false,
  collapsed,
}: NavItemDef & { collapsed: boolean }) {
  const pathname = usePathname()
  // Fix 2: exact=true skips the startsWith check, preventing /settings from activating on /settings/team
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== '/dashboard' && !disabled && pathname.startsWith(href + '/'))

  const baseClasses =
    'flex items-center gap-2.5 px-3 rounded-full text-sm transition-all h-9 relative'

  // Dark forest rail: the active item is a solid white pill, like prosperr.io's CTAs.
  const activeClasses = isActive
    ? 'bg-[#053f1a] text-[#ffffff] font-semibold shadow-sm'
    : 'text-gray-600 dark:text-gray-400 hover:bg-[#efefef] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'

  const disabledClasses = disabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : ''

  const inner = (
    <>
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          <BadgeLabel badge={badge} collapsed={collapsed} />
        </>
      )}
    </>
  )

  if (disabled) {
    return (
      <div
        title={collapsed ? label : undefined}
        className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
    >
      {inner}
    </Link>
  )
}

function SectionLabel({
  label,
  collapsed,
  isOpen,
  onToggle,
}: {
  label: string
  collapsed: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  if (collapsed) return <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-2" />
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-3 mb-1 mt-4 group"
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] group-hover:text-gray-700 transition-colors">
        {label}
      </p>
      <ChevronDown
        className={`w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-all duration-200 ${isOpen ? '' : '-rotate-90'}`}
      />
    </button>
  )
}

// ── NotificationBell ──────────────────────────────────────────────────────────
function NotificationBell({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setNotifs(d.notifications ?? [])
        setUnread(d.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="relative flex items-center gap-2.5 px-3 h-9 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-[#efefef] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 w-full transition-colors"
      >
        <div className="relative flex-shrink-0">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#053f1a] text-[#ffffff] text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        {!collapsed && <span className="truncate">Notifications</span>}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </span>
            {unread > 0 && (
              <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                {unread} new
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                All caught up! 🎉
              </div>
            ) : (
              notifs.map((n) => (
                <a
                  key={n.id}
                  href={n.href}
                  target={n.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {n.type === 'followup' ? '⏰' : '💬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {n.body}
                    </p>
                  </div>
                  {n.href.startsWith('http') && (
                    <ExternalLink className="w-3 h-3 text-gray-300 flex-shrink-0 mt-1" />
                  )}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── DarkModeToggle ────────────────────────────────────────────────────────────
function DarkModeToggle({ collapsed }: { collapsed: boolean }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="flex items-center gap-2.5 px-3 h-9 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-[#efefef] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 w-full transition-colors"
    >
      <span className="flex-shrink-0">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
      {!collapsed && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
} = {}) {
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [closedSections, setClosedSections] = useState<Set<string>>(new Set(['coming-soon']))

  function toggleSection(key: string) {
    setClosedSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const userEmail = session?.user?.email ?? ''
  const userName = (session?.user?.name ?? '').trim() || userEmail
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('') || (userEmail[0] ?? '?').toUpperCase()
  
  return (
    <aside
      className={`flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen flex-shrink-0
        fixed inset-y-0 left-0 z-50 transition-transform duration-200
        md:static md:z-auto md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${
        collapsed ? 'w-[260px] md:w-16' : 'w-[260px]'
      }`}
    >
      {/* ── Logo ── */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 px-2 py-4 border-b border-gray-200 dark:border-gray-800">
          <ProsperrLogo showWordmark={false} size={26} />
          <button
            onClick={() => setCollapsed(false)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
            title="Expand"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" aria-label="Prosperr Sales CRM home">
            <ProsperrLogo size={26} product="Sales CRM" />
          </Link>
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:block text-gray-400 hover:text-gray-700 p-1 rounded"
            title="Collapse"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-700 p-1 rounded"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto no-scrollbar">
        <div className="space-y-0.5">
          {NAV_TOP.map((item) => (
            <NavItem key={item.href} {...item} collapsed={collapsed} />
          ))}
        </div>

        <SectionLabel
          label="Prospecting"
          collapsed={collapsed}
          isOpen={!closedSections.has('prospect')}
          onToggle={() => toggleSection('prospect')}
        />
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${closedSections.has('prospect') ? 'max-h-0 opacity-0' : 'max-h-80 opacity-100'}`}>
          <div className="space-y-0.5">
            {NAV_PROSPECT.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>
        <SectionLabel
          label="Pipeline"
          collapsed={collapsed}
          isOpen={!closedSections.has('pipeline')}
          onToggle={() => toggleSection('pipeline')}
        />
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${closedSections.has('pipeline') ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'}`}>
          <div className="space-y-0.5">
            {NAV_PIPELINE.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>
        <SectionLabel
          label="Insights"
          collapsed={collapsed}
          isOpen={!closedSections.has('insights')}
          onToggle={() => toggleSection('insights')}
        />
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${closedSections.has('insights') ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'}`}>
          <div className="space-y-0.5">
            {NAV_INSIGHTS.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>
        <SectionLabel
          label="Shipping this sprint"
          collapsed={collapsed}
          isOpen={!closedSections.has('coming-soon')}
          onToggle={() => toggleSection('coming-soon')}
        />
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${closedSections.has('coming-soon') ? 'max-h-0 opacity-0' : 'max-h-52 opacity-100'}`}>
          <div className="space-y-0.5">
            {NAV_COMING_SOON.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* Utility row */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
          <NotificationBell collapsed={collapsed} />
          <DarkModeToggle collapsed={collapsed} />
          <NavItem href="/settings/team" label="Team" icon={Users} collapsed={collapsed} />
          {/* exact=true so /settings doesn't activate when on /settings/team */}
          <NavItem href="/settings" label="Settings" icon={Settings} exact collapsed={collapsed} />
          {session?.user?.isAdmin && (
            <NavItem href="/admin/users" label="Admin · Users" icon={ShieldCheck} collapsed={collapsed} />
          )}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800">
        {userEmail ? (
          collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-[#053f1a] rounded-full flex items-center justify-center text-xs font-bold text-[#ffffff]">
                {userInitials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-2xl bg-[#efefef] dark:bg-gray-900 px-2.5 py-2">
              <div className="w-8 h-8 bg-[#053f1a] rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#ffffff]">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-[10px] text-gray-500 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign out"
                className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : null}
      </div>
    </aside>
  )
}
