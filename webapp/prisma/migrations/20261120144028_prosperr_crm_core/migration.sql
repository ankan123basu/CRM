-- Prosperr Sales CRM core tables (PRD v1).
-- Additive only: new tables + two new User columns. No existing table is altered otherwise.

ALTER TABLE "User" ADD COLUMN     "crmActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "crmRole" TEXT NOT NULL DEFAULT 'BDR';

CREATE TABLE "CrmAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "domain" TEXT,
    "website" TEXT,
    "linkedinUrl" TEXT,
    "industry" TEXT,
    "subIndustry" TEXT,
    "city" TEXT,
    "employeeCount" INTEGER,
    "licensePotential" INTEGER,
    "leadSource" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'PROSPECT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "zone" TEXT NOT NULL DEFAULT 'PROSPECTING',
    "icpFit" TEXT,
    "intent" TEXT,
    "intentReason" TEXT,
    "inactiveReason" TEXT,
    "inactiveRemark" TEXT,
    "inactiveAt" TIMESTAMP(3),
    "revisitAt" TIMESTAMP(3),
    "lastStageBeforeInactive" TEXT,
    "nextStep" TEXT,
    "nextStepAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "l1BookedAt" TIMESTAMP(3),
    "aeOwnerId" TEXT,
    "sqlBdrId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "designation" TEXT,
    "department" TEXT NOT NULL DEFAULT 'OTHER',
    "level" TEXT,
    "priorityRank" INTEGER NOT NULL DEFAULT 8,
    "role" TEXT,
    "rightPoc" BOOLEAN NOT NULL DEFAULT false,
    "primarySpoc" BOOLEAN NOT NULL DEFAULT false,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phones" JSONB NOT NULL DEFAULT '[]',
    "linkedinUrl" TEXT,
    "engagement" TEXT NOT NULL DEFAULT 'NOT_CONTACTED',
    "connectionType" TEXT,
    "referredById" TEXT,
    "doNotContact" BOOLEAN NOT NULL DEFAULT false,
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastInteractionAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "bdrOwnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "stakeholderId" TEXT,
    "type" TEXT NOT NULL,
    "outcome" TEXT,
    "remark" TEXT,
    "zone" TEXT NOT NULL DEFAULT 'PROSPECTING',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmTask" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "stakeholderId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CALL',
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "assigneeId" TEXT NOT NULL,
    "createdById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmMeeting" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "levels" TEXT[],
    "stakeholderIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookedById" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "outcome" TEXT,
    "notes" TEXT,
    "nextStep" TEXT,
    "checklist" JSONB NOT NULL DEFAULT '{}',
    "exitStepDone" BOOLEAN NOT NULL DEFAULT false,
    "exitStepLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMeeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "temperature" TEXT,
    "temperatureHistory" JSONB NOT NULL DEFAULT '[]',
    "expectedMrr" INTEGER,
    "licenseCount" INTEGER,
    "stagnationReason" TEXT,
    "closeDate" TIMESTAMP(3),
    "outcome" TEXT,
    "lostReason" TEXT,
    "implementationStarted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SqlRecord" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_QUALIFICATION',
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "bant" JSONB NOT NULL DEFAULT '{}',
    "businessRelevance" TEXT,
    "connectionType" TEXT,
    "smallException" BOOLEAN NOT NULL DEFAULT false,
    "smallReason" TEXT,
    "rejectionReason" TEXT,
    "originalValues" JSONB,
    "submittedById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "SqlRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssignmentHistory" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fromAeId" TEXT,
    "toAeId" TEXT NOT NULL,
    "byId" TEXT NOT NULL,
    "reason" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SequenceEnrollment" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "sequenceKey" TEXT NOT NULL DEFAULT 'DEFAULT',
    "step" TEXT NOT NULL DEFAULT 'INTRO',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "lastSentAt" TIMESTAMP(3),
    "nextSendAt" TIMESTAMP(3),
    "threadId" TEXT,
    "stopReason" TEXT,
    "fromMissedCall" BOOLEAN NOT NULL DEFAULT false,
    "startedById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SequenceEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "setById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DesignationLevel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "priorityRank" INTEGER NOT NULL DEFAULT 8,
    "rightPoc" BOOLEAN NOT NULL DEFAULT true,
    "rightPocLargeOnly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DesignationLevel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmSetting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "accountId" TEXT,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "actorId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrmAccount_normalizedName_key" ON "CrmAccount"("normalizedName");

CREATE UNIQUE INDEX "CrmAccount_domain_key" ON "CrmAccount"("domain");

CREATE INDEX "CrmAccount_stage_idx" ON "CrmAccount"("stage");

CREATE INDEX "CrmAccount_status_idx" ON "CrmAccount"("status");

CREATE INDEX "CrmAccount_zone_idx" ON "CrmAccount"("zone");

CREATE INDEX "CrmAccount_aeOwnerId_idx" ON "CrmAccount"("aeOwnerId");

CREATE INDEX "CrmAccount_revisitAt_idx" ON "CrmAccount"("revisitAt");

CREATE INDEX "Stakeholder_accountId_idx" ON "Stakeholder"("accountId");

CREATE INDEX "Stakeholder_bdrOwnerId_idx" ON "Stakeholder"("bdrOwnerId");

CREATE INDEX "Stakeholder_linkedinUrl_idx" ON "Stakeholder"("linkedinUrl");

CREATE INDEX "CrmActivity_accountId_occurredAt_idx" ON "CrmActivity"("accountId", "occurredAt");

CREATE INDEX "CrmActivity_stakeholderId_idx" ON "CrmActivity"("stakeholderId");

CREATE INDEX "CrmActivity_loggedById_occurredAt_idx" ON "CrmActivity"("loggedById", "occurredAt");

CREATE INDEX "CrmTask_assigneeId_status_dueAt_idx" ON "CrmTask"("assigneeId", "status", "dueAt");

CREATE INDEX "CrmTask_accountId_idx" ON "CrmTask"("accountId");

CREATE INDEX "CrmMeeting_accountId_scheduledFor_idx" ON "CrmMeeting"("accountId", "scheduledFor");

CREATE INDEX "CrmMeeting_status_scheduledFor_idx" ON "CrmMeeting"("status", "scheduledFor");

CREATE UNIQUE INDEX "Opportunity_accountId_key" ON "Opportunity"("accountId");

CREATE INDEX "SqlRecord_accountId_idx" ON "SqlRecord"("accountId");

CREATE INDEX "SqlRecord_status_idx" ON "SqlRecord"("status");

CREATE INDEX "AssignmentHistory_accountId_idx" ON "AssignmentHistory"("accountId");

CREATE INDEX "AssignmentHistory_toAeId_idx" ON "AssignmentHistory"("toAeId");

CREATE INDEX "SequenceEnrollment_stakeholderId_idx" ON "SequenceEnrollment"("stakeholderId");

CREATE INDEX "SequenceEnrollment_status_nextSendAt_idx" ON "SequenceEnrollment"("status", "nextSendAt");

CREATE UNIQUE INDEX "SalesTarget_userId_period_periodStart_metric_key" ON "SalesTarget"("userId", "period", "periodStart", "metric");

CREATE UNIQUE INDEX "DesignationLevel_title_key" ON "DesignationLevel"("title");

CREATE UNIQUE INDEX "DesignationLevel_normalized_key" ON "DesignationLevel"("normalized");

CREATE INDEX "AuditLog_accountId_at_idx" ON "AuditLog"("accountId", "at");

CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

ALTER TABLE "CrmAccount" ADD CONSTRAINT "CrmAccount_aeOwnerId_fkey" FOREIGN KEY ("aeOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmAccount" ADD CONSTRAINT "CrmAccount_sqlBdrId_fkey" FOREIGN KEY ("sqlBdrId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmAccount" ADD CONSTRAINT "CrmAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_bdrOwnerId_fkey" FOREIGN KEY ("bdrOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CrmMeeting" ADD CONSTRAINT "CrmMeeting_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmMeeting" ADD CONSTRAINT "CrmMeeting_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SqlRecord" ADD CONSTRAINT "SqlRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssignmentHistory" ADD CONSTRAINT "AssignmentHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SequenceEnrollment" ADD CONSTRAINT "SequenceEnrollment_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
