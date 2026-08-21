-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'SETTLED');

-- CreateEnum
CREATE TYPE "ExpenseDraftStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'MEMBER_JOINED';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "budgetId" TEXT,
ADD COLUMN     "draftId" TEXT,
ADD COLUMN     "fundId" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tripEndDate" DATE,
ADD COLUMN     "tripStartDate" DATE;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "oneSignalPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "UserGroupPreference" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "recentOrder" INTEGER,
    "defaultSplitJson" TEXT,

    CONSTRAINT "UserGroupPreference_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "GroupFund" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "targetAmount" INTEGER NOT NULL,

    CONSTRAINT "GroupFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundContribution" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "contributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allocatedAmount" INTEGER NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundReserve" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "FundReserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseDraft" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "status" "ExpenseDraftStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRule" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "ruleText" TEXT NOT NULL,
    "policy" JSONB NOT NULL,

    CONSTRAINT "GroupRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_participantId_key" ON "GroupMember"("participantId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupFund_groupId_key" ON "GroupFund"("groupId");

-- CreateIndex
CREATE INDEX "FundContribution_fundId_idx" ON "FundContribution"("fundId");

-- CreateIndex
CREATE INDEX "Budget_fundId_idx" ON "Budget"("fundId");

-- CreateIndex
CREATE INDEX "FundReserve_fundId_idx" ON "FundReserve"("fundId");

-- CreateIndex
CREATE INDEX "ExpenseDraft_groupId_status_idx" ON "ExpenseDraft"("groupId", "status");

-- CreateIndex
CREATE INDEX "GroupRule_groupId_idx" ON "GroupRule"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_draftId_key" ON "Expense"("draftId");

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupPreference" ADD CONSTRAINT "UserGroupPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupPreference" ADD CONSTRAINT "UserGroupPreference_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupFund" ADD CONSTRAINT "GroupFund_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "GroupFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "GroupFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundReserve" ADD CONSTRAINT "FundReserve_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "GroupFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseDraft" ADD CONSTRAINT "ExpenseDraft_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseDraft" ADD CONSTRAINT "ExpenseDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRule" ADD CONSTRAINT "GroupRule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "GroupFund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ExpenseDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

