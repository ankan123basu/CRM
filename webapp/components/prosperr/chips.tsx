// Small, shared Prosperr status chips. One visual language for stage, size,
// temperature, level and engagement across every CRM page.
import { cn } from '@/lib/cn'
import {
  STAGE_LABEL, ENGAGEMENT_LABEL, SIZE_BUCKETS, type Stage, type Engagement,
} from '@/lib/prosperr/constants'

const base = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap leading-5'

export function StageChip({ stage, inactive }: { stage: string; inactive?: boolean }) {
  const won = stage === 'WON' || stage === 'IMPLEMENTATION'
  const lost = stage === 'LOST'
  const pipeline = ['L1', 'MULTITHREADING', 'L2', 'L3', 'NEGOTIATION'].includes(stage)
  return (
    <span
      className={cn(
        base,
        inactive
          ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700'
          : won
            ? 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50'
            : lost
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
              : pipeline
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
      )}
    >
      {STAGE_LABEL[stage as Stage] ?? stage}
      {inactive && <span className="font-medium opacity-70">· inactive</span>}
    </span>
  )
}

export function SizeChip({ bucket, licenses }: { bucket: string | null; licenses: number | null }) {
  if (!bucket) return <span className="text-xs text-gray-400">—</span>
  const label = SIZE_BUCKETS.find((b) => b.key === bucket)?.label ?? bucket
  return (
    <span className="inline-flex flex-col leading-tight">
      <span className={cn('text-sm font-semibold', bucket === 'SMALL' ? 'text-gray-500' : 'text-gray-900 dark:text-white')}>{label}</span>
      <span className="text-[11px] text-gray-500 tabular-nums">{licenses?.toLocaleString('en-IN')} licenses</span>
    </span>
  )
}

export function TempChip({ temperature }: { temperature: string | null }) {
  if (!temperature) return <span className="text-xs text-gray-400">—</span>
  const cls = {
    HOT: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
    WARM: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    COLD: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/50',
  }[temperature] ?? ''
  return <span className={cn(base, cls)}>{temperature[0] + temperature.slice(1).toLowerCase()}</span>
}

export function LevelChip({ level }: { level: string | null }) {
  if (!level) {
    return <span className={cn(base, 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50')} title="Designation not in the admin map yet">Unmapped</span>
  }
  const senior = level === 'L1' || level === 'L2'
  return (
    <span
      className={cn(base, senior
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700')}
      title={senior ? 'Qualifies an SQL directly' : 'Qualifies only when referred by an L1 or L2'}
    >
      {level}
    </span>
  )
}

const ENGAGED = ['CONNECTED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED']
export function EngagementChip({ engagement }: { engagement: string }) {
  const cls = ENGAGED.includes(engagement)
    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
    : engagement === 'UNRESPONSIVE' || engagement === 'NOT_RELEVANT'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
      : engagement === 'NOT_CONTACTED'
        ? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700'
        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
  return <span className={cn(base, cls)}>{ENGAGEMENT_LABEL[engagement as Engagement] ?? engagement}</span>
}

/** "today", "in 3 days", "5 days ago" — relative to now, for next steps and touches. */
export function relativeDay(d: string | Date | null | undefined): string {
  if (!d) return '—'
  const ms = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  const n = Math.round(ms / 86_400_000)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  return n > 0 ? `in ${n} days` : `${-n} days ago`
}

export function isOverdue(d: string | Date | null | undefined) {
  return !!d && new Date(d).setHours(23, 59, 59, 999) < Date.now()
}
