// Prosperr brand primitives, modelled on prosperr.io:
//  - Topo: the faint topographic contour lines behind every icon panel
//  - Sparkle: the four-point star used next to headlines and banners
//  - Headline: near-black display type with a muted second phrase
//  - IconPanel: grey rounded panel + contours + a chunky dark-green icon
//  - PillLink / ArrowPill: the site's pill CTAs ("Log In / Sign Up ↗", "Know More →")
import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Deterministic contour rings: irregular closed curves, like a map's elevation lines. */
function contourPaths(seed: number, rings: number, w: number, h: number) {
  const cx = w * (0.45 + ((seed * 37) % 10) / 100)
  const cy = h * (0.55 + ((seed * 53) % 10) / 100)
  const paths: string[] = []
  for (let r = 1; r <= rings; r++) {
    const base = (Math.max(w, h) / rings) * r * 0.62
    const pts: [number, number][] = []
    const steps = 48
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2
      const wobble =
        1 +
        0.13 * Math.sin(3 * t + seed + r * 0.35) +
        0.07 * Math.sin(5 * t - seed * 1.7 + r * 0.2) +
        0.04 * Math.sin(9 * t + r)
      pts.push([cx + Math.cos(t) * base * wobble * 1.15, cy + Math.sin(t) * base * wobble * 0.85])
    }
    // Smooth closed curve through the points (Catmull-Rom → cubic Bézier).
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
    for (let i = 0; i < steps; i++) {
      const p0 = pts[(i - 1 + steps) % steps], p1 = pts[i], p2 = pts[(i + 1) % steps], p3 = pts[(i + 2) % steps]
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    paths.push(d)
  }
  return paths
}

export function Topo({ seed = 1, rings = 7, className, tone = 'dark' }: { seed?: number; rings?: number; className?: string; tone?: 'dark' | 'light' }) {
  const w = 400, h = 300
  return (
    <svg aria-hidden viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}>
      {contourPaths(seed, rings, w, h).map((d, i) => (
        <path key={i} d={d} fill="none" stroke={tone === 'dark' ? '#0d0d0d' : '#ffffff'} strokeOpacity={tone === 'dark' ? 0.09 : 0.06} strokeWidth={1.2} />
      ))}
    </svg>
  )
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('w-5 h-5', className)} fill="currentColor">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
    </svg>
  )
}

/** Big Prosperr headline: `children` in near-black, `muted` continues in grey. */
export function Headline({ children, muted, as: Tag = 'h1', className }: { children: React.ReactNode; muted?: React.ReactNode; as?: 'h1' | 'h2'; className?: string }) {
  return (
    <Tag className={cn('font-display font-medium tracking-[-0.035em] leading-[1.05] text-[#101312] dark:text-white text-balance', className)}>
      {children}
      {muted && <> <span className="text-[#a1a1aa]">{muted}</span></>}
    </Tag>
  )
}

/** Grey rounded panel with contour lines and a centred dark-green icon. */
export function IconPanel({ children, seed = 1, className }: { children: React.ReactNode; seed?: number; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[1.5rem] bg-[#efefef] dark:bg-gray-800 flex items-center justify-center text-[#053f1a]', className)}>
      <Topo seed={seed} />
      <div className="relative">{children}</div>
    </div>
  )
}

/** Outlined pill tag, as used for "Salary · Capital gains · RSUs" on prosperr.io. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-[#dcdcde] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-[#121212] dark:text-gray-200 whitespace-nowrap', className)}>
      {children}
    </span>
  )
}

/** Primary dark-green pill with ↗, like "Log In / Sign Up ↗". */
export function PillLink({ href, children, variant = 'primary', className, arrow = true }: { href: string; children: React.ReactNode; variant?: 'primary' | 'outline' | 'white' | 'hero' | 'ghost-dark'; className?: string; arrow?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
        variant === 'primary' && 'bg-[#053f1a] text-[#ffffff] hover:bg-[#0a5a26]',
        variant === 'outline' && 'border border-[#0d0d0d] text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-[#ffffff] dark:border-gray-300 dark:text-gray-100',
        variant === 'white' && 'bg-[#ffffff] text-[#053f1a] hover:bg-[#efefef]',
        // On dark heroes, like "Book A Demo Call ↗" / "View Plans" on prosperr.io
        variant === 'hero' && 'bg-[#053f1a] text-[#ffffff] border-2 border-[#ffffff]/55 hover:bg-[#0a5a26] px-6 py-3 text-base',
        variant === 'ghost-dark' && 'border border-[#ffffff]/35 text-[#efefef] hover:bg-[#ffffff]/10 px-6 py-3 text-base',
        className
      )}
    >
      {children}
      {arrow && <ArrowUpRight className="w-4 h-4" />}
    </Link>
  )
}

/** White pill with a black round arrow, like "Know More →". */
export function ArrowPill({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-[#ffffff] border border-[#dcdcde] pl-5 pr-1.5 py-1.5 text-sm font-semibold text-[#0d0d0d] hover:border-[#0d0d0d] transition-colors', className)}>
      {children}
      <span className="w-8 h-8 rounded-full bg-[#0d0d0d] text-[#ffffff] flex items-center justify-center"><ArrowRight className="w-4 h-4" /></span>
    </Link>
  )
}

/** Dark-green strip above the header, like prosperr.io's "Earn rewards worth up to ₹1.5L ↗". */
export function AnnouncementBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#053f1a] text-[#efefef] text-sm font-medium text-center px-4 py-2.5">
      {children}
    </div>
  )
}

/** Uppercase tracked label, as above the stats and "PROSPERR ONE". */
export function Eyebrow({ children, className, tone = 'dark' }: { children: React.ReactNode; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <p className={cn('text-[10px] sm:text-sm font-medium uppercase tracking-[0.12em]', tone === 'dark' ? 'text-[#56645a] dark:text-gray-400' : 'text-[#c4cbc6]', className)}>
      {children}
    </p>
  )
}

/**
 * prosperr.io's stats block: a 2-column grid separated by 1px divider lines,
 * centred uppercase labels and large Bricolage numbers.
 */
export function StatsGrid({ items }: { items: { label: string; value: React.ReactNode; accent?: boolean; href?: string; tone?: 'bad' | 'warn' }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-[#d4d8d3] dark:bg-gray-800 border-y border-[#d4d8d3] dark:border-gray-800">
      {items.map((it) => {
        const inner = (
          <>
            <Eyebrow>{it.label}</Eyebrow>
            <p className={cn('mt-3 font-display font-medium tracking-[-0.03em] leading-none tabular-nums',
              typeof it.value === 'number' ? (it.accent ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-3xl sm:text-4xl md:text-5xl') : 'text-xl sm:text-3xl md:text-[2.5rem]',
              it.tone === 'bad' ? 'text-red-700' : it.tone === 'warn' ? 'text-amber-700' : it.accent ? 'text-[#053f1a] dark:text-[#4ae386]' : 'text-[#101312] dark:text-white')}>
              {it.value}
            </p>
          </>
        )
        const cls = 'bg-[#efefef] dark:bg-gray-950 px-3 sm:px-6 py-7 sm:py-10 md:py-12 text-center flex flex-col items-center justify-center'
        return it.href
          ? <Link key={it.label} href={it.href} className={cn(cls, 'hover:bg-[#e6e8e5] transition-colors')}>{inner}</Link>
          : <div key={it.label} className={cls}>{inner}</div>
      })}
    </div>
  )
}
