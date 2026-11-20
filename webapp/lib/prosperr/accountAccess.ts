// Server helpers that combine the CRM session with RBAC for account routes.
import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { can, canViewAccount, isLeadership, type AccountAccessContext, type CrmAction } from './rbac'
import type { CrmUser } from './session'

/** Prisma filter: accounts this user may see (zone rule from the PRD). */
export function visibleAccountsWhere(user: CrmUser): Prisma.CrmAccountWhereInput {
  if (user.role === 'MANAGER' || user.role === 'ADMIN') return {}
  if (user.role === 'AE') return { zone: 'PIPELINE' }
  return {
    OR: [
      { zone: 'PIPELINE' },
      { createdById: user.id },
      { stakeholders: { some: { bdrOwnerId: user.id } } },
    ],
  }
}

export async function loadAccessContext(accountId: string): Promise<AccountAccessContext | null> {
  const acc = await prisma.crmAccount.findUnique({
    where: { id: accountId },
    select: { zone: true, aeOwnerId: true, createdById: true, stakeholders: { select: { bdrOwnerId: true } } },
  })
  if (!acc) return null
  return {
    zone: acc.zone,
    aeOwnerId: acc.aeOwnerId,
    createdById: acc.createdById,
    stakeholderBdrIds: acc.stakeholders.map((s) => s.bdrOwnerId).filter((x): x is string => !!x),
  }
}

export function permissionsFor(user: CrmUser, ctx: AccountAccessContext) {
  const actions: CrmAction[] = ['ADD_STAKEHOLDER', 'LOG_ACTIVITY', 'EDIT_ACCOUNT_DETAILS', 'EDIT_SQL', 'EDIT_MEETINGS', 'EDIT_DEAL', 'MOVE_INACTIVE', 'REACTIVATE', 'ASSIGN_AE']
  return Object.fromEntries(actions.map((a) => [a, can(user, a, ctx)])) as Record<CrmAction, boolean>
}

export { can, canViewAccount, isLeadership }

export const unauthorized = () => NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
export const forbidden = (msg = 'You do not have access to this account.') => NextResponse.json({ error: msg }, { status: 403 })
export const notFound = () => NextResponse.json({ error: 'Account not found.' }, { status: 404 })
