// Audit trail (M10-2): owner, stage, status, temperature, reason and SQL changes.
import type { Prisma } from '@prisma/client'

type Tx = Prisma.TransactionClient

const str = (v: unknown) => (v == null ? null : v instanceof Date ? v.toISOString() : String(v))

/**
 * Write one AuditLog row per changed field. Call inside the same transaction
 * as the update so history and data never disagree.
 */
export async function auditChanges(
  tx: Tx,
  opts: {
    entity: 'ACCOUNT' | 'STAKEHOLDER' | 'OPPORTUNITY' | 'SQL' | 'MEETING'
    entityId: string
    accountId: string | null
    actorId: string
    before: Record<string, unknown>
    after: Record<string, unknown>
    fields: string[]
  }
) {
  const rows = opts.fields
    .filter((f) => f in opts.after && str(opts.before[f]) !== str(opts.after[f]))
    .map((f) => ({
      entity: opts.entity,
      entityId: opts.entityId,
      accountId: opts.accountId,
      field: f,
      oldValue: str(opts.before[f]),
      newValue: str(opts.after[f]),
      actorId: opts.actorId,
    }))
  if (rows.length) await tx.auditLog.createMany({ data: rows })
  return rows.length
}
