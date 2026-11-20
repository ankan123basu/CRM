import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCrmUser, isDemoMode } from '@/lib/prosperr/session'

// Who am I in the CRM (role, act-as state) + the team list for the demo switcher.
export async function GET() {
  const user = await getCrmUser()
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const demo = isDemoMode()
  const team = demo
    ? await prisma.user.findMany({
        where: { crmActive: true, OR: [{ email: { endsWith: '@prosperr.test' } }, { id: user.realUserId }] },
        select: { id: true, name: true, crmRole: true },
        orderBy: [{ crmRole: 'asc' }, { name: 'asc' }],
      })
    : []

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    actingAs: user.actingAs,
    realUserId: user.realUserId,
    demoMode: demo,
    team: team.map((t) => ({ id: t.id, name: t.name, role: t.crmRole })),
  })
}
