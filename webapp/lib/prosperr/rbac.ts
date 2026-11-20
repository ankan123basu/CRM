// Prosperr Sales CRM — role-based access (PRD "Users, roles and permissions").
//
// Two visibility zones:
//   PROSPECTING (before L1 is booked) → private: a BDR sees only accounts where
//                                       they own a stakeholder; leadership sees all.
//   PIPELINE    (from L1 booking)     → open to everyone; edit rights by role/owner.
//
// Pure functions only (no DB, no Next imports) so they are unit-testable and
// usable from client components to hide controls the user cannot use.

import type { CrmRole } from './constants'

export interface CrmActor {
  id: string
  role: CrmRole
}

export interface AccountAccessContext {
  zone: string                 // PROSPECTING | PIPELINE
  aeOwnerId: string | null
  createdById: string
  /** BDR owner ids of the account's stakeholders. */
  stakeholderBdrIds: string[]
}

export const isLeadership = (a: CrmActor) => a.role === 'MANAGER' || a.role === 'ADMIN'

/** BDR "sourced" the account: created it or owns at least one stakeholder on it. */
export function isSourcingBdr(a: CrmActor, acc: AccountAccessContext): boolean {
  return a.role === 'BDR' && (acc.createdById === a.id || acc.stakeholderBdrIds.includes(a.id))
}

export const isOwningAe = (a: CrmActor, acc: AccountAccessContext) => a.role === 'AE' && acc.aeOwnerId === a.id

export function canViewAccount(a: CrmActor, acc: AccountAccessContext): boolean {
  if (acc.zone === 'PIPELINE') return true
  if (isLeadership(a)) return true
  return isSourcingBdr(a, acc)
}

export type CrmAction =
  | 'ADD_STAKEHOLDER'
  | 'LOG_ACTIVITY'
  | 'EDIT_ACCOUNT_DETAILS'   // firmographics, licenses, city
  | 'EDIT_SQL'               // SQL checklist before L1; qualification corrections after L1
  | 'EDIT_MEETINGS'          // L1/L2/L3 meetings and outcomes
  | 'EDIT_DEAL'              // stage, temperature, MRR, Won/Lost
  | 'MOVE_INACTIVE'
  | 'REACTIVATE'
  | 'ASSIGN_AE'
  | 'MANAGE_SETTINGS'

export function can(a: CrmActor, action: CrmAction, acc?: AccountAccessContext): boolean {
  if (action === 'MANAGE_SETTINGS' || action === 'ASSIGN_AE') return isLeadership(a)
  if (!acc) return false
  if (!canViewAccount(a, acc)) return false
  if (isLeadership(a)) return true

  const prospecting = acc.zone === 'PROSPECTING'
  switch (action) {
    case 'ADD_STAKEHOLDER':
    case 'LOG_ACTIVITY':
      // Prospecting: BDRs only (AEs cannot even see it). Pipeline: BDR + AE.
      return prospecting ? a.role === 'BDR' : a.role === 'BDR' || a.role === 'AE'
    case 'EDIT_ACCOUNT_DETAILS':
    case 'EDIT_SQL':
      return prospecting ? isSourcingBdr(a, acc) : isOwningAe(a, acc)
    case 'EDIT_MEETINGS':
    case 'EDIT_DEAL':
    case 'MOVE_INACTIVE':
      return !prospecting && isOwningAe(a, acc)
    case 'REACTIVATE':
      return a.role === 'BDR'
    default:
      return false
  }
}
