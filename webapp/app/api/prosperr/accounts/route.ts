import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCrmUser } from '@/lib/prosperr/session'
import { visibleAccountsWhere, unauthorized, forbidden } from '@/lib/prosperr/accountAccess'
import {
  SIZE_BUCKETS, STAGES, sizeBucketFor, cityTier, normalizeAccountName, normalizeDomain,
} from '@/lib/prosperr/constants'

// GET /api/prosperr/accounts — list with filters, scoped by the zone rule.
export async function GET(req: NextRequest) {
  const user = await getCrmUser()
  if (!user) return unauthorized()

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim()
  const stage = sp.get('stage')
  const status = sp.get('status')
  const size = sp.get('size')
  const city = sp.get('city')
  const owner = sp.get('owner') // 'me' → accounts I own (AE) or source (BDR)

  const filters: Prisma.CrmAccountWhereInput[] = [visibleAccountsWhere(user)]
  if (q) {
    filters.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
        { stakeholders: { some: { OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { emails: { has: q.toLowerCase() } },
          { linkedinUrl: { contains: q, mode: 'insensitive' } },
        ] } } },
      ],
    })
  }
  if (stage && (STAGES as readonly string[]).includes(stage)) filters.push({ stage })
  if (status === 'ACTIVE' || status === 'INACTIVE') filters.push({ status })
  if (city) filters.push({ city })
  const bucket = SIZE_BUCKETS.find((b) => b.key === size)
  if (bucket) filters.push({ licensePotential: { gte: bucket.min, ...(Number.isFinite(bucket.max) ? { lte: bucket.max } : {}) } })
  if (owner === 'me') {
    filters.push(user.role === 'AE' ? { aeOwnerId: user.id } : { OR: [{ createdById: user.id }, { stakeholders: { some: { bdrOwnerId: user.id } } }] })
  }

  const rows = await prisma.crmAccount.findMany({
    where: { AND: filters },
    orderBy: [{ updatedAt: 'desc' }],
    take: 500,
    select: {
      id: true, name: true, domain: true, city: true, industry: true, licensePotential: true,
      stage: true, status: true, zone: true, nextStep: true, nextStepAt: true, lastActivityAt: true,
      inactiveReason: true, revisitAt: true,
      aeOwner: { select: { id: true, name: true } },
      opportunity: { select: { temperature: true, expectedMrr: true } },
      stakeholders: { select: { department: true, level: true, engagement: true, bdrOwner: { select: { id: true, name: true } } } },
    },
  })

  const accounts = rows.map((a) => {
    const bdrs = new Map<string, string>()
    for (const s of a.stakeholders) if (s.bdrOwner) bdrs.set(s.bdrOwner.id, s.bdrOwner.name ?? '—')
    const engagedDepts = new Set(
      a.stakeholders.filter((s) => ['CONNECTED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED'].includes(s.engagement)).map((s) => s.department)
    )
    return {
      id: a.id, name: a.name, domain: a.domain, city: a.city, cityTier: cityTier(a.city), industry: a.industry,
      licensePotential: a.licensePotential, sizeBucket: sizeBucketFor(a.licensePotential),
      stage: a.stage, status: a.status, zone: a.zone,
      nextStep: a.nextStep, nextStepAt: a.nextStepAt, lastActivityAt: a.lastActivityAt,
      inactiveReason: a.inactiveReason, revisitAt: a.revisitAt,
      ae: a.aeOwner, bdrs: [...bdrs].map(([id, name]) => ({ id, name })),
      temperature: a.opportunity?.temperature ?? null, expectedMrr: a.opportunity?.expectedMrr ?? null,
      stakeholderCount: a.stakeholders.length,
      coverage: { FINANCE: engagedDepts.has('FINANCE'), HR: engagedDepts.has('HR'), PAYROLL: engagedDepts.has('PAYROLL') },
    }
  })

  return NextResponse.json({ accounts, role: user.role })
}

// POST /api/prosperr/accounts — create a prospect. Duplicates are shown, never silently created.
export async function POST(req: NextRequest) {
  const user = await getCrmUser()
  if (!user) return unauthorized()
  if (user.role === 'AE') return forbidden('AEs receive accounts from the assignment queue; BDRs create prospects.')

  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (name.length < 2) return NextResponse.json({ error: 'Enter the company name.' }, { status: 400 })

  const normalizedName = normalizeAccountName(name)
  const domain = normalizeDomain(body?.website ?? body?.domain)
  const licenses = body?.licensePotential === '' || body?.licensePotential == null ? null : Number(body.licensePotential)
  if (licenses != null && (!Number.isFinite(licenses) || licenses < 0)) {
    return NextResponse.json({ error: 'License potential must be a positive number.' }, { status: 400 })
  }

  // Dedupe on name OR domain (PRD duplicate rules).
  const existing = await prisma.crmAccount.findFirst({
    where: { OR: [{ normalizedName }, ...(domain ? [{ domain }] : [])] },
    select: { id: true, name: true, zone: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: `${existing.name} already exists. Join it and add your own stakeholders instead of creating a duplicate.`, duplicate: existing },
      { status: 409 }
    )
  }

  const account = await prisma.crmAccount.create({
    data: {
      name,
      normalizedName,
      domain,
      website: domain ? `https://${domain}` : null,
      industry: body?.industry?.trim() || null,
      city: body?.city?.trim() || null,
      licensePotential: licenses,
      leadSource: body?.leadSource?.trim() || null,
      createdById: user.id,
      lastActivityAt: new Date(),
    },
    select: { id: true, name: true },
  })
  return NextResponse.json({ account }, { status: 201 })
}
