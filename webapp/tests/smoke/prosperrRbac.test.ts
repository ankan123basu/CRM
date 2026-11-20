import { describe, it, expect } from 'vitest'
import { can, canViewAccount, type AccountAccessContext } from '@/lib/prosperr/rbac'
import {
  sizeBucketFor, cityTier, normalizeAccountName, normalizeDomain, normalizeLinkedIn, normalizePhone,
  DESIGNATION_SEED,
} from '@/lib/prosperr/constants'

const bdr = { id: 'bdr1', role: 'BDR' as const }
const otherBdr = { id: 'bdr2', role: 'BDR' as const }
const ae = { id: 'ae1', role: 'AE' as const }
const otherAe = { id: 'ae2', role: 'AE' as const }
const manager = { id: 'm1', role: 'MANAGER' as const }

const prospect: AccountAccessContext = { zone: 'PROSPECTING', aeOwnerId: null, createdById: 'bdr1', stakeholderBdrIds: ['bdr1'] }
const pipeline: AccountAccessContext = { zone: 'PIPELINE', aeOwnerId: 'ae1', createdById: 'bdr1', stakeholderBdrIds: ['bdr1'] }

describe('Prosperr RBAC — prospecting zone is private', () => {
  it('owning BDR and leadership can see a prospect; other BDRs and AEs cannot', () => {
    expect(canViewAccount(bdr, prospect)).toBe(true)
    expect(canViewAccount(manager, prospect)).toBe(true)
    expect(canViewAccount(otherBdr, prospect)).toBe(false)
    expect(canViewAccount(ae, prospect)).toBe(false)
  })

  it('a BDR who owns any stakeholder on the account can see it (M2-9 join)', () => {
    expect(canViewAccount(otherBdr, { ...prospect, stakeholderBdrIds: ['bdr1', 'bdr2'] })).toBe(true)
  })

  it('only the sourcing BDR edits SQL details before L1', () => {
    expect(can(bdr, 'EDIT_SQL', prospect)).toBe(true)
    expect(can(otherBdr, 'EDIT_SQL', prospect)).toBe(false)
    expect(can(ae, 'EDIT_SQL', prospect)).toBe(false)
  })
})

describe('Prosperr RBAC — pipeline zone is open, edits by owner', () => {
  it('everyone can view a pipeline account', () => {
    for (const u of [bdr, otherBdr, ae, otherAe, manager]) expect(canViewAccount(u, pipeline)).toBe(true)
  })

  it('only the owning AE (or leadership) edits meetings and deal fields', () => {
    expect(can(ae, 'EDIT_MEETINGS', pipeline)).toBe(true)
    expect(can(otherAe, 'EDIT_MEETINGS', pipeline)).toBe(false)
    expect(can(bdr, 'EDIT_DEAL', pipeline)).toBe(false)
    expect(can(manager, 'EDIT_DEAL', pipeline)).toBe(true)
  })

  it('BDRs and AEs can add stakeholders and log activities in the pipeline zone', () => {
    expect(can(otherBdr, 'ADD_STAKEHOLDER', pipeline)).toBe(true)
    expect(can(otherAe, 'LOG_ACTIVITY', pipeline)).toBe(true)
  })

  it('only leadership assigns AEs; BDRs reactivate, AEs do not', () => {
    expect(can(manager, 'ASSIGN_AE')).toBe(true)
    expect(can(ae, 'ASSIGN_AE')).toBe(false)
    expect(can(bdr, 'REACTIVATE', pipeline)).toBe(true)
    expect(can(ae, 'REACTIVATE', pipeline)).toBe(false)
  })
})

describe('Prosperr reference helpers', () => {
  it('computes size buckets at the PRD boundaries', () => {
    expect(sizeBucketFor(250)).toBe('SMALL')
    expect(sizeBucketFor(251)).toBe('MEDIUM')
    expect(sizeBucketFor(1000)).toBe('LARGE')
    expect(sizeBucketFor(1001)).toBe('ENTERPRISE')
    expect(sizeBucketFor(null)).toBeNull()
  })

  it('tiers ICP cities', () => {
    expect(cityTier('Gurugram')).toBe('P0')
    expect(cityTier('Mumbai')).toBe('P1')
    expect(cityTier('Pune')).toBe('OUT')
  })

  it('normalises dedupe keys', () => {
    expect(normalizeAccountName('Acko Insurance Pvt. Ltd.')).toBe('acko insurance')
    expect(normalizeDomain('https://www.Acko.com/careers')).toBe('acko.com')
    expect(normalizeLinkedIn('https://linkedin.com/in/jane-doe/?utm=x')).toBe('https://www.linkedin.com/in/jane-doe')
    expect(normalizePhone('+91 98450-12345')).toBe('9845012345')
  })

  it('seeds all 56 designations from Appendix B with unique titles', () => {
    expect(DESIGNATION_SEED).toHaveLength(56)
    expect(new Set(DESIGNATION_SEED.map((d) => d[0])).size).toBe(56)
  })
})
