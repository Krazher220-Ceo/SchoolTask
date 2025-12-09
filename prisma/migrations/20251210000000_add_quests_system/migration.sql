-- AlterTable
ALTER TABLE "Quest" ADD COLUMN "epReward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AssignedQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "AssignedQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssignedQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignedQuest_questId_userId_periodDate_key" ON "AssignedQuest"("questId", "userId", "periodDate");

-- CreateIndex
CREATE INDEX "AssignedQuest_userId_period_periodDate_idx" ON "AssignedQuest"("userId", "period", "periodDate");

-- CreateIndex
CREATE INDEX "AssignedQuest_period_periodDate_idx" ON "AssignedQuest"("period", "periodDate");

