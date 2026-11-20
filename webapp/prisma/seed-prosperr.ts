/**
 * Prosperr Sales CRM — demo seed.
 *
 *   npm run db:seed:prosperr
 *
 * Safety:
 *  - Only touches the Prosperr CRM tables (CrmAccount, Stakeholder, …) and the
 *    seeded team users (@prosperr.test). OutreachAI tables are never modified.
 *  - Refuses to run unless DATABASE_URL points at localhost, or --force is passed.
 *  - Seeded team users get NO password, so nobody can sign in as them. Use the
 *    demo "View as" switcher (PROSPERR_DEMO_MODE=true) to see their views.
 *  - Accounts and people are fictional; e-mail domains use the reserved
 *    .example TLD. Only the five live customers named in the PRD appear as Won.
 *
 * Deterministic: a seeded PRNG makes every run produce the same data.
 */
import { PrismaClient } from '@prisma/client'
import {
  DESIGNATION_SEED, normalizeDesignation, normalizeAccountName, INACTIVE_REASONS,
} from '../lib/prosperr/constants'

const prisma = new PrismaClient()

// ── Guard ────────────────────────────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL ?? ''
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(dbUrl) && !process.argv.includes('--force')) {
  console.error('✋ Refusing to seed: DATABASE_URL is not a local database. Pass --force if you are sure.')
  process.exit(1)
}

// ── Deterministic randomness ─────────────────────────────────────────────────
let seed = 20261120
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const chance = (p: number) => rand() < p

const NOW = new Date()
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000)
const atHour = (d: Date, h: number, m = 0) => { const x = new Date(d); x.setHours(h, m, 0, 0); return x }

// ── Team (names from the PRD) ────────────────────────────────────────────────
const TEAM = [
  { key: 'jasim', name: 'Jasim', role: 'BDR' },
  { key: 'paramita', name: 'Paramita', role: 'BDR' },
  { key: 'satya', name: 'Satya', role: 'BDR' },
  { key: 'suneeth', name: 'Suneeth', role: 'BDR' },
  { key: 'rutuja', name: 'Rutuja', role: 'BDR' },
  { key: 'shivangi', name: 'Shivangi', role: 'BDR' },
  { key: 'mahesh', name: 'Mahesh', role: 'AE' },
  { key: 'kavya', name: 'Kavya', role: 'AE' },
  { key: 'shruti', name: 'Shruti Singh', role: 'AE' },
  { key: 'shashank', name: 'Shashank', role: 'AE' },
  { key: 'jeevitha', name: 'Jeevitha', role: 'AE' },
  { key: 'salesmanager', name: 'Sales Manager', role: 'MANAGER' },
] as const

// ── Fictional companies ──────────────────────────────────────────────────────
const PREFIX = ['Vayu', 'Kaveri', 'Tarang', 'Meru', 'Sahyadri', 'Indus', 'Nilgiri', 'Aravalli', 'Deccan', 'Ganga',
  'Konark', 'Satpura', 'Vindhya', 'Narmada', 'Himalay', 'Thar', 'Malabar', 'Godavari', 'Chola', 'Kalinga',
  'Ajanta', 'Lotus', 'Saffron', 'Peacock', 'Banyan', 'Monsoon', 'Tulsi', 'Kesar', 'Brahma', 'Neelam']
const SUFFIX = ['Logistics', 'Health', 'Software', 'Capital', 'Foods', 'Motors', 'Retail', 'Pharma', 'Infra',
  'Analytics', 'Fintech', 'Insurance', 'Labs', 'Energy', 'Telecom', 'Edtech', 'Systems', 'Payments']
const INDUSTRY: Record<string, string> = {
  Logistics: 'Logistics', Health: 'Healthcare', Software: 'IT Services', Capital: 'Financial Services', Foods: 'FMCG',
  Motors: 'Automotive', Retail: 'Retail', Pharma: 'Pharma', Infra: 'Infrastructure', Analytics: 'IT Services',
  Fintech: 'Fintech', Insurance: 'Insurance', Labs: 'SaaS', Energy: 'Energy', Telecom: 'Telecom', Edtech: 'Edtech',
  Systems: 'IT Services', Payments: 'Fintech',
}
const CITY_WEIGHTED = ['Bengaluru', 'Bengaluru', 'Bengaluru', 'Gurugram', 'Gurugram', 'Delhi', 'Noida', 'Mumbai',
  'Chennai', 'Hyderabad', 'Pune', 'Faridabad', 'Ghaziabad']

// Current customers named in the PRD's customer-proof snippet.
const CUSTOMERS = [
  { name: 'Livspace', domain: 'livspace.com', city: 'Bengaluru', industry: 'Home Interiors' },
  { name: 'Piaggio Automobiles', domain: 'piaggio.co.in', city: 'Mumbai', industry: 'Automotive' },
  { name: 'Acko Insurance', domain: 'acko.com', city: 'Bengaluru', industry: 'Insurance' },
  { name: 'Druva', domain: 'druva.com', city: 'Pune', industry: 'SaaS' },
  { name: 'PhysicsWallah', domain: 'pw.live', city: 'Noida', industry: 'Edtech' },
]

const FIRST = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Arjun', 'Kavitha', 'Siddharth', 'Meera',
  'Rahul', 'Divya', 'Karthik', 'Sneha', 'Aditya', 'Pooja', 'Nikhil', 'Isha', 'Varun', 'Lakshmi', 'Manish', 'Ritu',
  'Harish', 'Swati', 'Gaurav', 'Deepa', 'Tarun', 'Nandini', 'Pranav', 'Shalini']
const LAST = ['Sharma', 'Iyer', 'Reddy', 'Menon', 'Gupta', 'Nair', 'Rao', 'Kapoor', 'Mehta', 'Bose', 'Pillai',
  'Verma', 'Joshi', 'Banerjee', 'Kulkarni', 'Chopra', 'Desai', 'Agarwal', 'Shetty', 'Malhotra']

// Stage mix: most accounts stall early, as in the sheets (84% of inactive stalled at L1).
const STAGE_PLAN: { stage: string; count: number; inactive?: number }[] = [
  { stage: 'PROSPECT', count: 22 },
  { stage: 'SQL', count: 5 },
  { stage: 'L1', count: 14, inactive: 6 },
  { stage: 'MULTITHREADING', count: 4 },
  { stage: 'L2', count: 6, inactive: 1 },
  { stage: 'L3', count: 3, inactive: 1 },
  { stage: 'NEGOTIATION', count: 2 },
  { stage: 'LOST', count: 2 },
]

const OUTCOMES_FOR_HISTORY = ['DID_NOT_PICK', 'DID_NOT_PICK', 'CALL_LATER', 'ASKED_DETAILS', 'EMAIL_SENT',
  'SWITCHED_OFF', 'REMINDED', 'NOT_INTERESTED']

async function resetCrmData() {
  // Children first. Only Prosperr CRM tables.
  await prisma.auditLog.deleteMany()
  await prisma.assignmentHistory.deleteMany()
  await prisma.sqlRecord.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.crmMeeting.deleteMany()
  await prisma.crmTask.deleteMany()
  await prisma.crmActivity.deleteMany()
  await prisma.sequenceEnrollment.deleteMany()
  await prisma.stakeholder.updateMany({ data: { referredById: null } })
  await prisma.stakeholder.deleteMany()
  await prisma.crmAccount.deleteMany()
  await prisma.salesTarget.deleteMany()
}

async function main() {
  console.log('🌱 Seeding Prosperr CRM demo data…')
  await resetCrmData()

  // ── Settings + designation map ─────────────────────────────────────────────
  const settings: Record<string, unknown> = {
    inactivityDays: { default: 60, byStage: {} },
    callRetry: { workingDaysBetween: 2, maxTries: 6, revisitDaysAfterMax: 30 },
    sizeBuckets: { smallMax: 250, mediumMax: 500, largeMax: 1000 },
    icp: { p0Cities: ['Bengaluru', 'Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad'], p1Cities: ['Chennai', 'Mumbai'], minLicenses: 250, smallShareMax: 0.2 },
    sequence: { steps: [{ key: 'INTRO', day: 0 }, { key: 'FOLLOWUP1', day: 2 }, { key: 'FOLLOWUP2', day: 5 }, { key: 'REMINDER', day: 7 }], window: { start: '09:30', end: '18:30', tz: 'Asia/Kolkata' } },
    aeCapacityWeights: { default: 1, L2: 1.5, L3: 1.5, NEGOTIATION: 1.5 },
    productLink: 'https://www.prosperr.io/flexi-benefit-plan',
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.crmSetting.upsert({ where: { key }, update: { value: value as object }, create: { key, value: value as object } })
  }
  for (const [title, level, department, priorityRank] of DESIGNATION_SEED) {
    const normalized = normalizeDesignation(title)
    await prisma.designationLevel.upsert({
      where: { normalized },
      update: { title, level, department, priorityRank },
      create: { title, normalized, level, department, priorityRank, rightPoc: true, rightPocLargeOnly: level === 'L5' && department === 'PAYROLL' },
    })
  }

  // ── Team users (no passwords) ──────────────────────────────────────────────
  const users: Record<string, { id: string; role: string; name: string }> = {}
  for (const t of TEAM) {
    const email = `${t.key}@prosperr.test`
    const u = await prisma.user.upsert({
      where: { email },
      update: { name: t.name, crmRole: t.role, crmActive: true },
      create: { email, name: t.name, crmRole: t.role, password: null, plan: 'free', onboardingCompleted: true },
    })
    users[t.key] = { id: u.id, role: t.role, name: t.name }
  }
  // Admins: comma-separated e-mails in PROSPERR_ADMIN_EMAILS (e.g. your local demo login).
  for (const email of (process.env.PROSPERR_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim()).filter(Boolean)) {
    await prisma.user.updateMany({ where: { email }, data: { crmRole: 'ADMIN', crmActive: true } })
  }
  const bdrs = TEAM.filter((t) => t.role === 'BDR').map((t) => users[t.key])
  const aes = TEAM.filter((t) => t.role === 'AE').map((t) => users[t.key])
  const manager = users.salesmanager

  const designations = await prisma.designationLevel.findMany()
  const byLevel = (lv: string[]) => designations.filter((d) => lv.includes(d.level))

  // ── Build the account list ─────────────────────────────────────────────────
  type Plan = { name: string; domain: string; city: string; industry: string; stage: string; inactive: boolean }
  const plans: Plan[] = []
  const usedNames = new Set<string>()
  for (const p of STAGE_PLAN) {
    for (let i = 0; i < p.count; i++) {
      let name = ''
      do { name = `${pick(PREFIX)} ${pick(SUFFIX)}` } while (usedNames.has(name))
      usedNames.add(name)
      const slug = name.toLowerCase().replace(/\s+/g, '')
      plans.push({
        name, domain: `${slug}.example`, city: pick(CITY_WEIGHTED), industry: INDUSTRY[name.split(' ')[1]] ?? 'Other',
        stage: p.stage, inactive: i < (p.inactive ?? 0),
      })
    }
  }
  for (const c of CUSTOMERS) plans.push({ ...c, stage: c.name === 'Druva' ? 'IMPLEMENTATION' : 'WON', inactive: false })

  let accountCount = 0, stakeholderCount = 0, activityCount = 0, taskCount = 0, meetingCount = 0
  const order = ['PROSPECT', 'SQL', 'L1', 'MULTITHREADING', 'L2', 'L3', 'NEGOTIATION', 'WON', 'IMPLEMENTATION']

  for (const [idx, plan] of plans.entries()) {
    const reached = (s: string) => plan.stage === 'LOST' ? order.indexOf(s) <= order.indexOf('L2') : order.indexOf(plan.stage) >= order.indexOf(s)
    const pipeline = reached('L1')
    const sourcingBdr = bdrs[idx % bdrs.length]
    const coBdr = chance(0.2) ? bdrs[(idx + 1) % bdrs.length] : null // M2-9: several BDRs on one account
    const ae = pipeline ? aes[idx % aes.length] : null

    // License potential: skew to Medium+ but keep ~20% Small, as the team targets.
    const licenses = chance(0.2) ? int(80, 250) : chance(0.45) ? int(251, 500) : chance(0.6) ? int(501, 1000) : int(1001, 6000)
    const createdAt = days(-int(20, 160))
    const lastActivityAt = plan.inactive ? days(-int(65, 140)) : days(-int(0, pipeline ? 40 : 12))
    const l1BookedAt = pipeline ? days(-int(15, 90)) : null

    const inactiveReason = plan.inactive ? pick(INACTIVE_REASONS.filter((r) => r.key !== 'OTHER')) : null
    const account = await prisma.crmAccount.create({
      data: {
        name: plan.name,
        normalizedName: normalizeAccountName(plan.name),
        domain: plan.domain,
        website: `https://${plan.domain}`,
        industry: plan.industry,
        city: plan.city,
        employeeCount: Math.round(licenses * (1.1 + rand())),
        licensePotential: licenses,
        leadSource: pick(['Apollo', 'Apollo', 'LinkedIn', 'Referral', 'Inbound']),
        stage: plan.stage,
        status: plan.inactive ? 'INACTIVE' : 'ACTIVE',
        zone: pipeline ? 'PIPELINE' : 'PROSPECTING',
        icpFit: plan.city === 'Hyderabad' || plan.city === 'Pune' ? 'NO' : 'YES',
        intent: plan.city === 'Mumbai' || plan.city === 'Chennai' ? pick(['HIGH', 'MEDIUM']) : null,
        inactiveReason: inactiveReason?.key ?? null,
        inactiveRemark: inactiveReason ? 'SPOC stopped responding after L1; tried CFO office twice.' : null,
        inactiveAt: plan.inactive ? days(-int(5, 60)) : null,
        revisitAt: inactiveReason?.needsRevisit ? days(int(-5, 30)) : null,
        lastStageBeforeInactive: plan.inactive ? plan.stage : null,
        nextStep: plan.inactive ? null : pipeline ? pick(['Share commercials', 'Book L2 with CHRO', 'Send FBP calculator', 'Follow up on documents', 'Intro to Payroll head']) : pick(['Call CFO', 'Send intro email', 'Find Finance head', 'Call back after board meeting']),
        nextStepAt: plan.inactive ? null : chance(0.12) ? null : days(int(-4, 10)), // a few with no next step → hygiene
        lastActivityAt,
        l1BookedAt,
        aeOwnerId: ae?.id ?? null,
        sqlBdrId: reached('SQL') ? sourcingBdr.id : null,
        createdById: sourcingBdr.id,
        createdAt,
      },
    })
    accountCount++

    // ── Stakeholders: senior first, sometimes a referral chain to a junior ────
    const n = pipeline ? int(3, 5) : int(1, 4)
    const people: { id: string; level: string; bdrId: string }[] = []
    const usedTitles = new Set<string>()
    for (let s = 0; s < n; s++) {
      const pool = s === 0 ? byLevel(['L1', 'L2']) : byLevel(['L1', 'L2', 'L3', 'L4', 'L5'])
      let d = pick(pool)
      for (let tries = 0; usedTitles.has(d.title) && tries < 10; tries++) d = pick(pool)
      usedTitles.add(d.title)
      const first = pick(FIRST), last = pick(LAST)
      const owner = coBdr && s === n - 1 ? coBdr : sourcingBdr
      const referrer = s > 0 && ['L3', 'L4', 'L5'].includes(d.level) && chance(0.7) ? people.find((p) => ['L1', 'L2'].includes(p.level)) : undefined
      const engagement = !pipeline
        ? pick(['NOT_CONTACTED', 'NOT_CONTACTED', 'CONTACTED', 'CONNECTED', 'FOLLOW_UP_PENDING', 'UNRESPONSIVE'])
        : s === 0 ? pick(['MEETING_COMPLETED', 'CONNECTED', 'UNRESPONSIVE']) : pick(['CONNECTED', 'CONTACTED', 'MEETING_SCHEDULED', 'NOT_CONTACTED', 'REFERRED'])
      const st = await prisma.stakeholder.create({
        data: {
          accountId: account.id,
          firstName: first,
          lastName: last,
          designation: d.title,
          department: d.department,
          level: d.level,
          priorityRank: d.priorityRank,
          role: s === 0 ? 'DECISION_MAKER' : pick(['INFLUENCER', 'EXECUTOR', 'ECONOMIC_BUYER']),
          rightPoc: d.rightPoc && (!d.rightPocLargeOnly || licenses > 500),
          primarySpoc: s === 0,
          emails: [`${first}.${last}@${plan.domain}`.toLowerCase()],
          phones: [{ number: `+91 9${int(100000000, 999999999)}`, invalid: chance(0.08) }],
          linkedinUrl: `https://www.linkedin.com/in/${first}-${last}-${int(1000, 9999)}`.toLowerCase(),
          engagement,
          connectionType: referrer ? 'JUNIOR_VIA_SENIOR' : ['L1', 'L2'].includes(d.level) ? 'DIRECT_SENIOR' : 'DIRECT_JUNIOR',
          referredById: referrer?.id ?? null,
          callAttempts: engagement === 'NOT_CONTACTED' ? 0 : int(1, 6),
          lastInteractionAt: engagement === 'NOT_CONTACTED' ? null : days(-int(0, plan.inactive ? 120 : 20)),
          nextFollowUpAt: engagement === 'NOT_CONTACTED' || plan.inactive ? null : days(int(-3, 7)),
          bdrOwnerId: owner.id,
          createdAt,
        },
      })
      people.push({ id: st.id, level: d.level, bdrId: owner.id })
      stakeholderCount++

      // History: a handful of touches per contacted stakeholder.
      if (engagement !== 'NOT_CONTACTED') {
        const touches = int(1, 5)
        for (let t = 0; t < touches; t++) {
          const when = new Date(createdAt.getTime() + (t + 1) * int(1, 6) * 86_400_000)
          if (when > NOW) break
          await prisma.crmActivity.create({
            data: {
              accountId: account.id, stakeholderId: st.id,
              type: chance(0.75) ? 'CALL' : pick(['EMAIL', 'WHATSAPP', 'LINKEDIN']),
              outcome: pick(OUTCOMES_FOR_HISTORY),
              remark: chance(0.4) ? pick(['Asked to call after quarter close', 'Interested in wage-code angle', 'Forwarded to payroll team', 'Wants a one-pager first']) : null,
              zone: 'PROSPECTING', occurredAt: when, loggedById: owner.id,
            },
          })
          activityCount++
        }
        if (referrer) {
          await prisma.crmActivity.create({
            data: { accountId: account.id, stakeholderId: referrer.id, type: 'REFERRAL', outcome: 'REFERRED', remark: `Referred us to ${first} ${last}`, zone: 'PROSPECTING', occurredAt: days(-int(10, 40)), loggedById: owner.id },
          })
          activityCount++
        }
      }

      // Open BDR tasks drive My Day: overdue, due today, upcoming.
      if (!pipeline && !plan.inactive && ['CONTACTED', 'FOLLOW_UP_PENDING', 'CONNECTED'].includes(engagement)) {
        const due = pick([-2, -1, 0, 0, 0, 1, 2, 4])
        await prisma.crmTask.create({
          data: {
            accountId: account.id, stakeholderId: st.id, type: 'CALL', source: 'RULE',
            title: `Call ${first} ${last} (${d.title})`,
            dueAt: atHour(days(due), int(10, 17), pick([0, 30])), assigneeId: owner.id, createdById: owner.id,
          },
        })
        taskCount++
      }
    }

    // ── SQL record ───────────────────────────────────────────────────────────
    if (reached('SQL')) {
      await prisma.sqlRecord.create({
        data: {
          accountId: account.id,
          status: plan.stage === 'SQL' ? 'PENDING_QUALIFICATION' : 'QUALIFIED',
          criteria: { stakeholder: true, licenses: licenses > 250, location: true, bant: true },
          bant: {
            budget: { value: pick(['COST_NEUTRAL', 'BUDGET_AVAILABLE']), note: 'Cost-neutral FBP fits current CTC' },
            authority: { value: 'CFO_SIGNS', note: 'CFO signs off; CHRO influences' },
            need: { value: pick(['FBP', 'PAYROLL', 'BOTH']), note: 'Take-home dip after new labour codes' },
            timeline: { value: pick(['THIS_QUARTER', 'NEXT_QUARTER']), note: 'Before April payroll cycle' },
          },
          businessRelevance: pick(['FBP', 'BOTH']),
          connectionType: 'DIRECT_SENIOR',
          smallException: licenses <= 250,
          smallReason: licenses <= 250 ? 'High-growth startup, CFO is champion' : null,
          submittedById: sourcingBdr.id,
          submittedAt: l1BookedAt ?? days(-int(1, 5)),
          validatedById: plan.stage === 'SQL' ? null : manager.id,
          validatedAt: plan.stage === 'SQL' ? null : l1BookedAt,
        },
      })
    }

    // ── Assignment, meetings, opportunity ────────────────────────────────────
    if (ae) {
      await prisma.assignmentHistory.create({
        data: { accountId: account.id, fromAeId: null, toAeId: ae.id, byId: manager.id, reason: 'Least-loaded AE', at: l1BookedAt ?? createdAt },
      })
      const levels = (['L1', 'L2', 'L3'] as const).filter((l) => reached(l === 'L1' ? 'L1' : l))
      for (const [mi, lv] of levels.entries()) {
        const isLast = mi === levels.length - 1
        const scheduledFor = isLast && !plan.inactive && ['L1', 'L2', 'L3', 'MULTITHREADING'].includes(plan.stage) && chance(0.35)
          ? atHour(days(int(1, 9)), int(11, 16))          // upcoming
          : atHour(days(-int(3 + (levels.length - mi) * 12, 20 + (levels.length - mi) * 15)), int(11, 16))
        const upcoming = scheduledFor > NOW
        const noOutcome = !upcoming && isLast && chance(0.15) // hygiene: meeting with no outcome
        await prisma.crmMeeting.create({
          data: {
            accountId: account.id, levels: [lv], stakeholderIds: people.slice(0, 2).map((p) => p.id),
            bookedAt: new Date(scheduledFor.getTime() - int(3, 10) * 86_400_000),
            bookedById: lv === 'L1' ? sourcingBdr.id : ae.id,
            scheduledFor,
            status: upcoming || noOutcome ? 'SCHEDULED' : plan.inactive && isLast ? pick(['COMPLETED', 'NO_SHOW']) : 'COMPLETED',
            outcome: upcoming || noOutcome ? null : lv === 'L1' ? pick(['COMPLETED_QUALIFIED', 'COMPLETED_FOLLOW_UP']) : 'COMPLETED_QUALIFIED',
            notes: upcoming ? null : pick(['Walked through FBP demo; CFO keen on wage-code angle.', 'CHRO wants employee FAQ deck.', 'Discussed TDS compliance under both regimes.']),
            exitStepDone: !upcoming && !noOutcome && !(isLast && ['L1', 'L2'].includes(plan.stage)),
            exitStepLink: !upcoming && !noOutcome ? 'https://drive.example/prosperr-docs' : null,
          },
        })
        meetingCount++
      }
      const temp = ['WON', 'IMPLEMENTATION', 'NEGOTIATION'].includes(plan.stage) ? 'HOT' : plan.inactive || plan.stage === 'LOST' ? 'COLD' : pick(['HOT', 'WARM', 'WARM', 'COLD'])
      await prisma.opportunity.create({
        data: {
          accountId: account.id,
          temperature: temp,
          temperatureHistory: [{ value: temp, at: (l1BookedAt ?? createdAt).toISOString(), by: ae.id }],
          licenseCount: licenses,
          expectedMrr: licenses * pick([90, 100, 120]),
          stagnationReason: plan.stage === 'L1' && licenses > 500 && chance(0.5) ? 'Waiting on CFO bandwidth after audit season' : null,
          closeDate: ['WON', 'IMPLEMENTATION'].includes(plan.stage) ? days(-int(5, 60)) : days(int(20, 120)),
          outcome: ['WON', 'IMPLEMENTATION'].includes(plan.stage) ? 'WON' : plan.stage === 'LOST' ? 'LOST' : null,
          lostReason: plan.stage === 'LOST' ? pick(['Competitor selected', 'Pricing']) : null,
          implementationStarted: plan.stage === 'IMPLEMENTATION',
        },
      })
      // AE follow-up task, some overdue.
      if (!plan.inactive && !['WON', 'LOST', 'IMPLEMENTATION'].includes(plan.stage)) {
        await prisma.crmTask.create({
          data: { accountId: account.id, type: 'FOLLOW_UP', source: 'MANUAL', title: `${plan.name}: ${account.nextStep ?? 'Follow up'}`, dueAt: atHour(days(int(-3, 5)), 15), assigneeId: ae.id, createdById: ae.id },
        })
        taskCount++
      }
      await prisma.auditLog.create({
        data: { entity: 'ACCOUNT', entityId: account.id, accountId: account.id, field: 'aeOwnerId', oldValue: null, newValue: ae.id, actorId: manager.id, at: l1BookedAt ?? createdAt },
      })
    }
  }

  // ── Targets for this month ──────────────────────────────────────────────────
  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1)
  for (const b of bdrs) {
    await prisma.salesTarget.create({ data: { userId: b.id, period: 'MONTH', periodStart: monthStart, metric: 'L1_DONE', value: 8, setById: manager.id } })
    await prisma.salesTarget.create({ data: { userId: b.id, period: 'MONTH', periodStart: monthStart, metric: 'L1_BOOKED', value: 10, setById: manager.id } })
  }
  for (const a of aes) {
    await prisma.salesTarget.create({ data: { userId: a.id, period: 'MONTH', periodStart: monthStart, metric: 'L2', value: 4, setById: manager.id } })
    await prisma.salesTarget.create({ data: { userId: a.id, period: 'MONTH', periodStart: monthStart, metric: 'WON', value: 1, setById: manager.id } })
  }

  console.log(`✅ ${accountCount} accounts · ${stakeholderCount} stakeholders · ${activityCount} activities · ${meetingCount} meetings · ${taskCount} open tasks`)
  console.log(`   Team: ${bdrs.length} BDRs, ${aes.length} AEs, 1 manager · ${DESIGNATION_SEED.length} designations mapped`)
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
