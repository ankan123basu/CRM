// Prosperr Sales CRM — reference lists from the Consolidated PRD v1.
// These are the starting values; admins will edit them in Settings (M10-1).
// Keep this file free of server-only imports so client components can use it.

export const ROLES = ['BDR', 'AE', 'MANAGER', 'ADMIN'] as const
export type CrmRole = (typeof ROLES)[number]

export const STAGES = [
  'PROSPECT', 'SQL', 'L1', 'MULTITHREADING', 'L2', 'L3', 'NEGOTIATION', 'WON', 'LOST', 'IMPLEMENTATION',
] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_LABEL: Record<Stage, string> = {
  PROSPECT: 'Prospect', SQL: 'SQL', L1: 'L1', MULTITHREADING: 'Multithreading', L2: 'L2', L3: 'L3',
  NEGOTIATION: 'Negotiation', WON: 'Won', LOST: 'Lost', IMPLEMENTATION: 'Implementation',
}

/** Stages at or after L1 booking live in the shared pipeline zone. */
export const PIPELINE_STAGES: Stage[] = ['L1', 'MULTITHREADING', 'L2', 'L3', 'NEGOTIATION', 'WON', 'LOST', 'IMPLEMENTATION']

export const ACCOUNT_STATUS = ['ACTIVE', 'INACTIVE'] as const
export const ZONES = ['PROSPECTING', 'PIPELINE'] as const

export const DEPARTMENTS = ['FINANCE', 'HR', 'PAYROLL', 'OTHER'] as const
export type Department = (typeof DEPARTMENTS)[number]
export const DEPARTMENT_LABEL: Record<Department, string> = {
  FINANCE: 'Finance', HR: 'HR', PAYROLL: 'Payroll', OTHER: 'Other',
}

export const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'] as const
export type StakeholderLevel = (typeof LEVELS)[number]

export const ENGAGEMENT = [
  'NOT_CONTACTED', 'CONTACTED', 'CONNECTED', 'MEETING_SCHEDULED', 'MEETING_COMPLETED',
  'FOLLOW_UP_PENDING', 'UNRESPONSIVE', 'NOT_RELEVANT', 'REFERRED',
] as const
export type Engagement = (typeof ENGAGEMENT)[number]
export const ENGAGEMENT_LABEL: Record<Engagement, string> = {
  NOT_CONTACTED: 'Not contacted', CONTACTED: 'Contacted', CONNECTED: 'Connected',
  MEETING_SCHEDULED: 'Meeting scheduled', MEETING_COMPLETED: 'Meeting completed',
  FOLLOW_UP_PENDING: 'Follow-up pending', UNRESPONSIVE: 'Unresponsive',
  NOT_RELEVANT: 'Not relevant', REFERRED: 'Referred to another stakeholder',
}

export const CONNECTION_TYPES = ['DIRECT_SENIOR', 'JUNIOR_VIA_SENIOR', 'DIRECT_JUNIOR'] as const
export const CONNECTION_TYPE_LABEL: Record<(typeof CONNECTION_TYPES)[number], string> = {
  DIRECT_SENIOR: 'Direct senior',
  JUNIOR_VIA_SENIOR: 'Junior via senior referral',
  DIRECT_JUNIOR: 'Direct junior without senior endorsement',
}

export const STAKEHOLDER_ROLES = ['DECISION_MAKER', 'ECONOMIC_BUYER', 'INFLUENCER', 'EXECUTOR'] as const

export const TEMPERATURES = ['HOT', 'WARM', 'COLD'] as const
export type Temperature = (typeof TEMPERATURES)[number]

export const SQL_STATUS = [
  'PENDING_QUALIFICATION', 'QUALIFIED', 'REJECTED_ICP', 'PENDING_SENIOR_CONNECTION',
  'MEETING_BOOKED', 'NO_SHOW', 'DISQUALIFIED',
] as const

export const L1_OUTCOMES = [
  'COMPLETED_QUALIFIED', 'COMPLETED_FOLLOW_UP', 'COMPLETED_NOT_INTERESTED', 'NO_SHOW', 'RESCHEDULED', 'DISQUALIFIED',
] as const

export const MEETING_STATUS = ['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] as const

// ── Inactive reasons (merged sheet + BRD) ───────────────────────────────────
export const INACTIVE_REASONS = [
  { key: 'SPOC_UNRESPONSIVE', label: 'SPOC unresponsive', needsRevisit: true },
  { key: 'JUNIOR_SPOC_NO_ACCESS', label: 'Junior SPOC – no access to decision maker', needsRevisit: false },
  { key: 'DM_UNAVAILABLE', label: 'Decision maker unavailable', needsRevisit: true },
  { key: 'NO_ALIGNMENT', label: 'No internal alignment / decision making', needsRevisit: false },
  { key: 'NO_REQUIREMENT', label: 'No requirement', needsRevisit: false },
  { key: 'BUDGET', label: 'Budget', needsRevisit: false },
  { key: 'PRICING', label: 'Pricing', needsRevisit: false },
  { key: 'PRODUCT_FIT', label: 'Product fit', needsRevisit: false },
  { key: 'COMPETITOR', label: 'Competitor selected', needsRevisit: false },
  { key: 'COMPLIANCE', label: 'Compliance / legal issue', needsRevisit: false },
  { key: 'TIMELINE_DEFERRED', label: 'Timeline deferred', needsRevisit: true },
  { key: 'ON_HOLD', label: 'On hold', needsRevisit: true },
  { key: 'OTHER', label: 'Other (remark required)', needsRevisit: false },
] as const

// ── Size buckets (M1-4) ─────────────────────────────────────────────────────
export const SIZE_BUCKETS = [
  { key: 'SMALL', label: 'Small', min: 0, max: 250 },
  { key: 'MEDIUM', label: 'Medium', min: 251, max: 500 },
  { key: 'LARGE', label: 'Large', min: 501, max: 1000 },
  { key: 'ENTERPRISE', label: 'Enterprise', min: 1001, max: Infinity },
] as const
export type SizeBucket = (typeof SIZE_BUCKETS)[number]['key']

export function sizeBucketFor(licenses: number | null | undefined): SizeBucket | null {
  if (licenses == null) return null
  return SIZE_BUCKETS.find((b) => licenses >= b.min && licenses <= b.max)?.key ?? null
}

// ── ICP cities (decision 1) ─────────────────────────────────────────────────
export const ICP_CITIES_P0 = ['Bengaluru', 'Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad']
export const ICP_CITIES_P1 = ['Chennai', 'Mumbai']
export const CITIES = [...ICP_CITIES_P0, ...ICP_CITIES_P1, 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Other']

export function cityTier(city: string | null | undefined): 'P0' | 'P1' | 'OUT' {
  if (!city) return 'OUT'
  if (ICP_CITIES_P0.includes(city)) return 'P0'
  if (ICP_CITIES_P1.includes(city)) return 'P1'
  return 'OUT'
}

// ── Call outcomes and their rules (BDR calling) ─────────────────────────────
export const CALL_OUTCOMES = [
  { key: 'DID_NOT_PICK', label: 'Did not pick', engagement: 'CONTACTED', next: 'Call again in 2 working days; offer sequence' },
  { key: 'SWITCHED_OFF', label: 'Switched off', engagement: 'CONTACTED', next: 'Call again in 2 working days' },
  { key: 'CALLS_BARRED', label: 'Incoming calls barred', engagement: 'CONTACTED', next: 'Call again in 2 working days' },
  { key: 'CALL_LATER', label: 'Call later', engagement: 'FOLLOW_UP_PENDING', next: 'Task at the chosen date' },
  { key: 'CALL_AFTER_MONTH', label: 'Call after a month', engagement: 'FOLLOW_UP_PENDING', next: 'Task in 30 days' },
  { key: 'ASKED_DETAILS', label: 'Asked details', engagement: 'CONNECTED', next: 'Send template; call in 2–3 days' },
  { key: 'EMAIL_SENT', label: 'Email sent', engagement: 'CONNECTED', next: 'Call in 2–3 days' },
  { key: 'REMINDED', label: 'Reminded over the phone', engagement: null, next: 'None' },
  { key: 'L1_BOOKED', label: 'Demo / L1 booked', engagement: 'MEETING_SCHEDULED', next: 'Open L1 booking + SQL checklist' },
  { key: 'REFERRED', label: 'Referred', engagement: 'REFERRED', next: 'Create or link referred stakeholder' },
  { key: 'NOT_RIGHT_STAKEHOLDER', label: 'Not the right stakeholder', engagement: 'REFERRED', next: 'Create or link referred stakeholder' },
  { key: 'NOT_INTERESTED', label: 'Not interested', engagement: 'NOT_RELEVANT', next: 'Revisit in 90 days' },
  { key: 'ALREADY_USING', label: 'Already using something', engagement: 'NOT_RELEVANT', next: 'Revisit in 90 days' },
  { key: 'NOT_POSSIBLE', label: 'Not possible', engagement: 'NOT_RELEVANT', next: 'None' },
  { key: 'WRONG_ICP', label: 'Wrong ICP', engagement: 'NOT_RELEVANT', next: 'Account ICP fit = No' },
  { key: 'NOT_ASSOCIATED', label: 'Not associated anymore', engagement: 'NOT_RELEVANT', next: 'None' },
  { key: 'WRONG_NUMBER', label: 'Wrong number / invalid', engagement: null, next: 'Mark number invalid' },
] as const
export type CallOutcomeKey = (typeof CALL_OUTCOMES)[number]['key']

// ── Stakeholder priority (product review, replaces BRD 4.2) ─────────────────
export const PRIORITY_ORDER = [
  'CFO', 'CHRO', 'Head of Finance / Finance Controller', 'Head of HR',
  'Head of Compensation & Benefits', 'Head of Total Rewards', 'Payroll Head / Manager', 'Other',
]

// ── Designation map seed (Appendix B: 56 titles) ────────────────────────────
// [title, level, department, priorityRank]
export const DESIGNATION_SEED: [string, StakeholderLevel, Department, number][] = [
  ['CFO', 'L1', 'FINANCE', 1],
  ['CHRO', 'L1', 'HR', 2],
  ['Vice President Finance', 'L1', 'FINANCE', 3],
  ['Senior Vice President - Business CFO & Head Corporate FP&A', 'L1', 'FINANCE', 1],
  ['Head of Finance', 'L1', 'FINANCE', 3],
  ['Global Finance Director', 'L1', 'FINANCE', 3],
  ['Vice President Human Resources', 'L1', 'HR', 4],
  ['National Head HR', 'L1', 'HR', 4],
  ['Human Resources Director & Head', 'L1', 'HR', 4],
  ['Finance Controller', 'L2', 'FINANCE', 3],
  ['AVP-HR', 'L2', 'HR', 4],
  ['AVP Finance', 'L2', 'FINANCE', 3],
  ['Director HR', 'L2', 'HR', 4],
  ['Director Finance', 'L2', 'FINANCE', 3],
  ['Senior Director Finance', 'L2', 'FINANCE', 3],
  ['Senior Director - C&B and HR Operations', 'L2', 'HR', 5],
  ['Director Human Resources Operations', 'L2', 'HR', 4],
  ['Global C & B Leader', 'L2', 'HR', 5],
  ['Director - Total Rewards', 'L2', 'HR', 6],
  ['Director - Compensation & Benefits', 'L2', 'HR', 5],
  ['Head - Compensation, Benefits & Operations', 'L2', 'HR', 5],
  ['Head of Compensation and Benefits', 'L2', 'HR', 5],
  ['Head Total Rewards & HR Ops', 'L2', 'HR', 6],
  ['GM HR', 'L2', 'HR', 4],
  ['Associate Director - HR', 'L2', 'HR', 4],
  ['Associate Director - Head of Payroll, Benefits and Compliance', 'L2', 'PAYROLL', 7],
  ['Head Of Payroll', 'L3', 'PAYROLL', 7],
  ['Payroll Lead', 'L3', 'PAYROLL', 7],
  ['Lead - Payroll and Compensation & Benefits', 'L3', 'PAYROLL', 7],
  ['HR Payroll Lead', 'L3', 'PAYROLL', 7],
  ['Finance Lead', 'L3', 'FINANCE', 8],
  ['Lead C&B', 'L3', 'HR', 5],
  ['Head comp and ops', 'L3', 'HR', 5],
  ['People Ops Lead', 'L3', 'HR', 8],
  ['Senior Manager C&B and Payroll', 'L3', 'PAYROLL', 7],
  ['Senior Manager - Finance', 'L4', 'FINANCE', 8],
  ['Senior Manager C&B', 'L4', 'HR', 8],
  ['Senior Manager - Compensation & Benefits', 'L4', 'HR', 8],
  ['Senior Manager Payroll/ Compliances', 'L4', 'PAYROLL', 7],
  ['Senior Manager - Payroll Benefit Specialist', 'L4', 'PAYROLL', 7],
  ['Senior Payroll Manager', 'L4', 'PAYROLL', 7],
  ['Senior Manager - Global Total Rewards, HR Transformation, Analytics & Excellence', 'L4', 'HR', 6],
  ['Manager Payroll / Head of Payroll', 'L5', 'PAYROLL', 7],
  ['Payroll Manager, C&B', 'L5', 'PAYROLL', 7],
  ['Sr. Manager Rewards', 'L5', 'HR', 6],
  ['Total Rewards Manager', 'L5', 'HR', 6],
  ['Manager Total Rewards', 'L5', 'HR', 6],
  ['Manager Talent Excellence - C&B', 'L5', 'HR', 8],
  ['HR Operations & Payroll', 'L5', 'PAYROLL', 7],
  ['HR Manager', 'L5', 'HR', 8],
  ['Senior Manager People & Culture', 'L5', 'HR', 8],
  ['Assistant Manager HR Ops and Payroll', 'L5', 'PAYROLL', 7],
  ['Assistant Manager Payroll', 'L5', 'PAYROLL', 7],
  ['Assistant Manager - Accounts', 'L5', 'FINANCE', 8],
  ['Associate Manager II - HRBP', 'L5', 'HR', 8],
  ['Sr HR - Payroll & Operations', 'L5', 'PAYROLL', 7],
]

/** Normalise a designation for lookups: lower-case, collapse punctuation and spaces. */
export function normalizeDesignation(title: string): string {
  return title.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Normalise an account name for dedupe ("Acko Insurance Pvt. Ltd." == "acko insurance"). */
export function normalizeAccountName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(private|pvt|limited|ltd|llp|inc|corp|corporation|technologies|technology|india)\b\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Strip protocol, www and path so "https://www.acko.com/x" → "acko.com". */
export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null
  const d = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0]
  return d || null
}

/** Strip query params and trailing slash from a LinkedIn URL (migration clean-up rule). */
export function normalizeLinkedIn(url: string | null | undefined): string | null {
  if (!url) return null
  const u = url.trim().split(/[?#]/)[0].replace(/\/+$/, '')
  return u ? u.replace(/^http:\/\//, 'https://').replace('://linkedin.com', '://www.linkedin.com') : null
}

/** Keep the last 10 digits so "+91 98450-12345" == "9845012345". */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits || null
}

export const INR = (n: number | null | undefined) =>
  n == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

/** PRD locale: DD Mon YYYY in IST. */
export function formatDateIST(d: Date | string | null | undefined): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(d))
}
