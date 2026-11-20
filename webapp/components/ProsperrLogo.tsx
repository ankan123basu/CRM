import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * Prosperr brand lock-up: the X-arrow mark + "PROSPERR.IO" wordmark,
 * matching the header on prosperr.io. `tone="light"` is for dark surfaces.
 */
export function ProsperrLogo({
  tone = 'dark',
  showWordmark = true,
  size = 28,
  product,
  className,
}: {
  tone?: 'dark' | 'light'
  showWordmark?: boolean
  size?: number
  /** Optional product tag shown after the wordmark, e.g. "Sales CRM". */
  product?: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full flex-shrink-0',
          tone === 'light' ? 'bg-white shadow-sm' : ''
        )}
        style={{ width: size + (tone === 'light' ? 6 : 0), height: size + (tone === 'light' ? 6 : 0) }}
      >
        <Image src="/brand/prosperr-mark-512.png" alt="Prosperr" width={size} height={size} priority />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display font-extrabold tracking-tight whitespace-nowrap',
              // Navy wordmark on light surfaces (as on prosperr.io); white on dark ones.
              tone === 'light' ? 'text-[#ffffff]' : 'text-[#212f63] dark:text-[#ffffff]'
            )}
            style={{ fontSize: Math.round(size * 0.68) }}
          >
            PROSPERR.IO
          </span>
          {product && (
            <span
              className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap"
              style={{ color: 'var(--prosperr-gold)' }}
            >
              {product}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
