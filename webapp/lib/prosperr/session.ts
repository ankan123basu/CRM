// Server-side: resolve the CRM user for an API route or server component.
//
// Demo mode ("view as"): when PROSPERR_DEMO_MODE=true the signed-in user may
// act as another active CRM user via the `prosperr_act_as` cookie, so the BDR /
// AE / Manager views can be shown live in a demo. It is OFF unless that env var
// is set, and must stay off in production.

import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ROLES, type CrmRole } from './constants'

export const ACT_AS_COOKIE = 'prosperr_act_as'
export const isDemoMode = () => process.env.PROSPERR_DEMO_MODE === 'true'

export interface CrmUser {
  id: string
  name: string | null
  email: string
  role: CrmRole
  /** Signed-in user's own id (differs from `id` while acting as someone else). */
  realUserId: string
  actingAs: boolean
}

function toRole(r: string | null | undefined): CrmRole {
  return (ROLES as readonly string[]).includes(r ?? '') ? (r as CrmRole) : 'BDR'
}

export async function getCrmUser(): Promise<CrmUser | null> {
  const session = await auth()
  const realId = session?.user?.id
  if (!realId) return null

  const real = await prisma.user.findUnique({
    where: { id: realId },
    select: { id: true, name: true, email: true, crmRole: true, crmActive: true },
  })
  if (!real || !real.crmActive) return null

  if (isDemoMode()) {
    const actAsId = (await cookies()).get(ACT_AS_COOKIE)?.value
    if (actAsId && actAsId !== real.id) {
      const other = await prisma.user.findUnique({
        where: { id: actAsId },
        select: { id: true, name: true, email: true, crmRole: true, crmActive: true },
      })
      if (other?.crmActive) {
        return { id: other.id, name: other.name, email: other.email, role: toRole(other.crmRole), realUserId: real.id, actingAs: true }
      }
    }
  }

  return { id: real.id, name: real.name, email: real.email, role: toRole(real.crmRole), realUserId: real.id, actingAs: false }
}
