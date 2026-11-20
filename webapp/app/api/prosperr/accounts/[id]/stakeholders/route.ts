import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCrmUser } from '@/lib/prosperr/session'
import { loadAccessContext, can, unauthorized, forbidden, notFound } from '@/lib/prosperr/accountAccess'
import {
  DEPARTMENTS, normalizeDesignation, normalizeLinkedIn, normalizePhone,
} from '@/lib/prosperr/constants'

// POST /api/prosperr/accounts/:id/stakeholders — add a stakeholder.
// Level, department and priority come from the admin designation map (M1-5);
// unmatched titles are saved with level = null (shown as "Unmapped", go to review).
// Duplicates match on e-mail, LinkedIn URL or normalised phone across ALL accounts.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCrmUser()
  if (!user) return unauthorized()
  const { id: accountId } = await params

  const ctx = await loadAccessContext(accountId)
  if (!ctx) return notFound()
  // A BDR may join a prospecting account owned by someone else by adding their
  // own stakeholder (M2-9), so allow BDRs here even before they own one.
  const joining = user.role === 'BDR' && ctx.zone === 'PROSPECTING'
  if (!joining && !can(user, 'ADD_STAKEHOLDER', ctx)) return forbidden('You cannot add stakeholders to this account.')

  const b = await req.json().catch(() => null)
  const firstName = typeof b?.firstName === 'string' ? b.firstName.trim() : ''
  if (!firstName) return NextResponse.json({ error: 'Enter the first name.' }, { status: 400 })

  const email = typeof b?.email === 'string' && b.email.trim() ? b.email.trim().toLowerCase() : null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'That e-mail address looks invalid.' }, { status: 400 })
  const phone = typeof b?.phone === 'string' && b.phone.trim() ? b.phone.trim() : null
  const linkedinUrl = normalizeLinkedIn(b?.linkedinUrl)
  const designation = typeof b?.designation === 'string' && b.designation.trim() ? b.designation.trim() : null

  // Duplicate check.
  const or = [
    ...(email ? [{ emails: { has: email } }] : []),
    ...(linkedinUrl ? [{ linkedinUrl }] : []),
  ]
  const dupe = or.length
    ? await prisma.stakeholder.findFirst({ where: { OR: or }, select: { id: true, firstName: true, lastName: true, account: { select: { id: true, name: true } } } })
    : null
  let phoneDupe = null
  const normPhone = normalizePhone(phone)
  if (!dupe && normPhone) {
    // Narrow by the last 4 digits in SQL (parameterised), then compare exactly.
    const tail = `%${normPhone.slice(-4)}%`
    const ids = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "Stakeholder" WHERE phones::text LIKE ${tail} LIMIT 50`
    const candidates = ids.length
      ? await prisma.stakeholder.findMany({ where: { id: { in: ids.map((r) => r.id) } }, select: { id: true, firstName: true, lastName: true, phones: true, account: { select: { id: true, name: true } } } })
      : []
    phoneDupe = candidates.find((c) => (c.phones as { number: string }[]).some((p) => normalizePhone(p.number) === normPhone)) ?? null
  }
  const match = dupe ?? phoneDupe
  if (match) {
    return NextResponse.json(
      { error: `${match.firstName} ${match.lastName ?? ''} already exists at ${match.account.name}.`.replace(/\s+/g, ' '), duplicate: match },
      { status: 409 }
    )
  }

  // Designation map lookup.
  const mapped = designation
    ? await prisma.designationLevel.findUnique({ where: { normalized: normalizeDesignation(designation) } })
    : null
  const department = mapped?.department ?? ((DEPARTMENTS as readonly string[]).includes(b?.department) ? b.department : 'OTHER')

  const referredById = typeof b?.referredById === 'string' && b.referredById ? b.referredById : null
  if (referredById) {
    const ref = await prisma.stakeholder.findFirst({ where: { id: referredById, accountId } })
    if (!ref) return NextResponse.json({ error: 'The referring stakeholder must be on the same account.' }, { status: 400 })
  }

  const stakeholder = await prisma.$transaction(async (tx) => {
    const s = await tx.stakeholder.create({
      data: {
        accountId,
        firstName,
        lastName: typeof b?.lastName === 'string' && b.lastName.trim() ? b.lastName.trim() : null,
        designation,
        department,
        level: mapped?.level ?? null,
        priorityRank: mapped?.priorityRank ?? 8,
        rightPoc: mapped?.rightPoc ?? false,
        emails: email ? [email] : [],
        phones: phone ? [{ number: phone, invalid: false }] : [],
        linkedinUrl,
        referredById,
        connectionType: referredById ? 'JUNIOR_VIA_SENIOR' : mapped && ['L1', 'L2'].includes(mapped.level) ? 'DIRECT_SENIOR' : mapped ? 'DIRECT_JUNIOR' : null,
        bdrOwnerId: user.role === 'BDR' ? user.id : null,
      },
    })
    await tx.crmActivity.create({
      data: {
        accountId, stakeholderId: s.id, type: 'NOTE', zone: ctx.zone, loggedById: user.id,
        remark: `Added ${firstName}${designation ? ` (${designation})` : ''}${mapped ? '' : designation ? ' · designation not in map, sent for review' : ''}`,
      },
    })
    await tx.crmAccount.update({ where: { id: accountId }, data: { lastActivityAt: new Date() } })
    return s
  })

  return NextResponse.json({ stakeholder, mapped: !!mapped }, { status: 201 })
}
