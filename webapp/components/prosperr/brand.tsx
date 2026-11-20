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
        <path key={i} d={d} fill="none" stroke={tone === 'dark' ? '#0d0d0d' : '#ffffff'} strokeOpacity={tone === 'dark' ? 0.09 : 0.12} strokeWidth={1.2} />
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
    <Tag className={cn('font-display font-semibold tracking-[-0.035em] leading-[1.02] text-[#0d0d0d] dark:text-white text-balance', className)}>
      {children}
      {muted && <> <span className="text-[#a1a1aa]">{muted}</span></>}
    </Tag>
  )
}

/** Grey rounded panel with contour lines and a centred dark-green icon. */
export function IconPanel({ children, seed = 1, className }: { children: React.ReactNode; seed?: number; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[1.5rem] bg-[#efefef] dark:bg-gray-800 flex items-center justify-center text-[#0a4a1f]', className)}>
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
export function PillLink({ href, children, variant = 'primary', className }: { href: string; children: React.ReactNode; variant?: 'primary' | 'outline' | 'white'; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
        variant === 'primary' && 'bg-[#0a4a1f] text-[#ffffff] hover:bg-[#053f1a]',
        variant === 'outline' && 'border border-[#0d0d0d] text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-[#ffffff] dark:border-gray-300 dark:text-gray-100',
        variant === 'white' && 'bg-[#ffffff] text-[#0a4a1f] hover:bg-[#f3f3f5]',
        className
      )}
    >
      {children}
      <ArrowUpRight className="w-4 h-4" />
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
