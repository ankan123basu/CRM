import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCrmUser } from '@/lib/prosperr/session'
import { visibleAccountsWhere, unauthorized } from '@/lib/prosperr/accountAccess'
import { STAGES } from '@/lib/prosperr/constants'

// GET /api/prosperr/home — the numbers behind the Home page, for the current user.
export async function GET() {
  const user = await getCrmUser()
  if (!user) return unauthorized()

  const now = new Date()
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999)
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0)
  const inAWeek = new Date(now.getTime() + 7 * 86_400_000)
  const leadership = user.role === 'MANAGER' || user.role === 'ADMIN'
  const visible = visibleAccountsWhere(user)

  // "Mine": AE → accounts they own; BDR → accounts they source; leadership → all.
  const mine = leadership ? {} : user.role === 'AE'
    ? { aeOwnerId: user.id }
    : { OR: [{ createdById: user.id }, { stakeholders: { some: { bdrOwnerId: user.id } } }] }

  const taskWhere = leadership ? {} : { assigneeId: user.id }

  const [overdue, dueToday, noNextStep, upcomingMeetings, missingOutcome, revivalDue, stageGroups, firstTask] = await Promise.all([
    prisma.crmTask.count({ where: { ...taskWhere, status: 'OPEN', dueAt: { lt: startOfToday } } }),
    prisma.crmTask.count({ where: { ...taskWhere, status: 'OPEN', dueAt: { gte: startOfToday, lte: endOfToday } } }),
    prisma.crmAccount.count({ where: { AND: [visible, mine, { status: 'ACTIVE', nextStepAt: null }] } }),
    prisma.crmMeeting.count({ where: { status: { in: ['SCHEDULED', 'RESCHEDULED'] }, scheduledFor: { gte: now, lte: inAWeek }, account: { AND: [visible, mine] } } }),
    prisma.crmMeeting.count({ where: { status: { in: ['SCHEDULED', 'RESCHEDULED'] }, scheduledFor: { lt: now }, account: { AND: [visible, mine] } } }),
    prisma.crmAccount.count({ where: { AND: [visible, { status: 'INACTIVE', revisitAt: { lte: endOfToday } }] } }),
    prisma.crmAccount.groupBy({ by: ['stage'], where: { AND: [visible, mine, { status: 'ACTIVE' }] }, _count: true }),
    prisma.crmTask.findFirst({
      where: { ...taskWhere, status: 'OPEN', dueAt: { lte: endOfToday } },
      orderBy: { dueAt: 'asc' },
      select: { title: true, accountId: true, account: { select: { name: true } } },
    }),
  ])

  const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<string, number>
  for (const g of stageGroups) byStage[g.stage] = g._count

  return NextResponse.json({
    user: { name: user.name, role: user.role },
    counts: { overdue, dueToday, noNextStep, upcomingMeetings, missingOutcome, revivalDue },
    byStage,
    firstTask,
  })
}
