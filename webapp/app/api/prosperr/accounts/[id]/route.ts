import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCrmUser } from '@/lib/prosperr/session'
import {
  loadAccessContext, permissionsFor, canViewAccount, isLeadership, unauthorized, forbidden, notFound,
} from '@/lib/prosperr/accountAccess'
import { sizeBucketFor, cityTier } from '@/lib/prosperr/constants'

// GET /api/prosperr/accounts/:id — full account page payload.
// Prospecting zone: a BDR sees their own stakeholders in full, and only
// name / designation / owner for stakeholders other BDRs have claimed (M2-9).
// Pipeline zone: everything, including prospecting history (decision 13).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCrmUser()
  if (!user) return unauthorized()
  const { id } = await params

  const ctx = await loadAccessContext(id)
  if (!ctx) return notFound()
  if (!canViewAccount(user, ctx)) {
    // M2-9 "join" view: a BDR who tried to add an account that already exists
    // sees only who is taken (name, designation, BDR), never contact details or
    // history, and can add their own stakeholders.
    const joining = req.nextUrl.searchParams.get('join') === '1' && user.role === 'BDR' && ctx.zone === 'PROSPECTING'
    if (!joining) return forbidden()
    const j = await prisma.crmAccount.findUnique({
      where: { id },
      select: {
        id: true, name: true, domain: true, website: true, city: true, industry: true, stage: true, status: true, zone: true,
        stakeholders: {
          orderBy: [{ priorityRank: 'asc' }, { createdAt: 'asc' }],
          select: { id: true, firstName: true, lastName: true, designation: true, department: true, level: true, priorityRank: true, bdrOwner: { select: { id: true, name: true } } },
        },
      },
    })
    if (!j) return notFound()
    const { stakeholders: people, ...acc } = j
    return NextResponse.json({
      account: { ...acc, cityTier: cityTier(acc.city), licensePotential: null, sizeBucket: null },
      stakeholders: people.map((s) => ({ ...s, taken: true })),
      activities: [], meetings: [], tasks: [], opportunity: null, sql: null, assignments: [], audit: [],
      permissions: { ADD_STAKEHOLDER: true },
      viewer: { id: user.id, role: user.role, restricted: true, joining: true },
    })
  }

  const a = await prisma.crmAccount.findUnique({
    where: { id },
    include: {
      aeOwner: { select: { id: true, name: true } },
      sqlBdr: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      stakeholders: {
        orderBy: [{ priorityRank: 'asc' }, { level: 'asc' }, { createdAt: 'asc' }],
        include: { bdrOwner: { select: { id: true, name: true } }, referredBy: { select: { id: true, firstName: true, lastName: true } } },
      },
      activities: { orderBy: { occurredAt: 'desc' }, take: 200, include: { loggedBy: { select: { id: true, name: true } } } },
      meetings: { orderBy: { scheduledFor: 'desc' } },
      tasks: { where: { status: 'OPEN' }, orderBy: { dueAt: 'asc' }, include: { assignee: { select: { id: true, name: true } } } },
      opportunity: true,
      sqlRecords: { orderBy: { submittedAt: 'desc' }, take: 1 },
      assignments: { orderBy: { at: 'desc' } },
      auditLogs: { orderBy: { at: 'desc' }, take: 50 },
    },
  })
  if (!a) return notFound()

  const restricted = a.zone === 'PROSPECTING' && !isLeadership(user)
  const ownsStakeholder = (bdrId: string | null) => !restricted || bdrId === user.id

  const stakeholders = a.stakeholders.map((s) =>
    ownsStakeholder(s.bdrOwnerId)
      ? { ...s, taken: false }
      : {
          id: s.id, firstName: s.firstName, lastName: s.lastName, designation: s.designation,
          department: s.department, level: s.level, priorityRank: s.priorityRank, bdrOwner: s.bdrOwner,
          taken: true, // claimed by another BDR — contact details and history hidden
        }
  )
  const visibleStakeholderIds = new Set(stakeholders.filter((s) => !s.taken).map((s) => s.id))
  const activities = a.activities.filter((x) => !restricted || x.loggedById === user.id || (x.stakeholderId && visibleStakeholderIds.has(x.stakeholderId)))

  // Resolve user names for history rows.
  const userIds = new Set<string>()
  a.assignments.forEach((h) => { userIds.add(h.toAeId); userIds.add(h.byId); if (h.fromAeId) userIds.add(h.fromAeId) })
  a.auditLogs.forEach((l) => userIds.add(l.actorId))
  a.meetings.forEach((m) => userIds.add(m.bookedById))
  const names = Object.fromEntries(
    (await prisma.user.findMany({ where: { id: { in: [...userIds] } }, select: { id: true, name: true } })).map((u) => [u.id, u.name])
  )

  return NextResponse.json({
    account: {
      id: a.id, name: a.name, domain: a.domain, website: a.website, linkedinUrl: a.linkedinUrl,
      industry: a.industry, subIndustry: a.subIndustry, city: a.city, cityTier: cityTier(a.city),
      employeeCount: a.employeeCount, licensePotential: a.licensePotential, sizeBucket: sizeBucketFor(a.licensePotential),
      leadSource: a.leadSource, stage: a.stage, status: a.status, zone: a.zone, icpFit: a.icpFit,
      intent: a.intent, inactiveReason: a.inactiveReason, inactiveRemark: a.inactiveRemark, inactiveAt: a.inactiveAt,
      revisitAt: a.revisitAt, nextStep: a.nextStep, nextStepAt: a.nextStepAt, lastActivityAt: a.lastActivityAt,
      l1BookedAt: a.l1BookedAt, createdAt: a.createdAt,
      ae: a.aeOwner, sqlBdr: a.sqlBdr, createdBy: a.createdBy,
    },
    stakeholders,
    activities,
    meetings: a.meetings.map((m) => ({ ...m, bookedByName: names[m.bookedById] ?? null })),
    tasks: restricted ? a.tasks.filter((t) => t.assigneeId === user.id) : a.tasks,
    opportunity: a.opportunity,
    sql: a.sqlRecords[0] ?? null,
    assignments: a.assignments.map((h) => ({ ...h, toAeName: names[h.toAeId], fromAeName: h.fromAeId ? names[h.fromAeId] : null, byName: names[h.byId] })),
    audit: a.auditLogs.map((l) => ({ ...l, actorName: names[l.actorId] ?? null })),
    permissions: permissionsFor(user, ctx),
    viewer: { id: user.id, role: user.role, restricted },
  })
}
