import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACT_AS_COOKIE, isDemoMode } from '@/lib/prosperr/session'

// Demo-only "View as": lets the presenter switch between BDR / AE / Manager views.
// Disabled unless PROSPERR_DEMO_MODE=true. Only seeded @prosperr.test team users
// can be impersonated, never a real account.
export async function POST(req: NextRequest) {
  if (!isDemoMode()) return NextResponse.json({ error: 'View-as is only available in demo mode.' }, { status: 403 })
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const userId: string | null = typeof body.userId === 'string' ? body.userId : null
  const res = NextResponse.json({ ok: true })

  if (!userId || userId === session.user.id) {
    res.cookies.delete(ACT_AS_COOKIE)
    return res
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, crmActive: true } })
  if (!target?.crmActive || !target.email.endsWith('@prosperr.test')) {
    return NextResponse.json({ error: 'You can only view as a demo team member.' }, { status: 400 })
  }
  res.cookies.set(ACT_AS_COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 })
  return res
}
