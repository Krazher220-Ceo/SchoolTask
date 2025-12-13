-- CreateTable: FeedEvent
CREATE TABLE IF NOT EXISTS "FeedEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" TEXT,
    "category" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Duel
CREATE TABLE IF NOT EXISTS "Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creatorScore" INTEGER NOT NULL DEFAULT 0,
    "opponentScore" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Duel_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: DuelParticipant
CREATE TABLE IF NOT EXISTS "DuelParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "duelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DuelParticipant_duelId_fkey" FOREIGN KEY ("duelId") REFERENCES "Duel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DuelParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Challenge
CREATE TABLE IF NOT EXISTS "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetEP" INTEGER NOT NULL,
    "currentEP" INTEGER NOT NULL DEFAULT 0,
    "reward" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: ChallengeParticipant
CREATE TABLE IF NOT EXISTS "ChallengeParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "epContributed" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeParticipant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Guild
CREATE TABLE IF NOT EXISTS "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "creatorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalEP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guild_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: GuildMember
CREATE TABLE IF NOT EXISTS "GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "epContributed" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Season
CREATE TABLE IF NOT EXISTS "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "theme" TEXT,
    "bonusCategory" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: SeasonRating
CREATE TABLE IF NOT EXISTS "SeasonRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ep" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeasonRating_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeasonRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Recommendation
CREATE TABLE IF NOT EXISTS "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "shownAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add column to Task for Guild
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "guildId" TEXT;

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "FeedEvent_userId_idx" ON "FeedEvent"("userId");
CREATE INDEX IF NOT EXISTS "FeedEvent_type_idx" ON "FeedEvent"("type");
CREATE INDEX IF NOT EXISTS "FeedEvent_category_idx" ON "FeedEvent"("category");
CREATE INDEX IF NOT EXISTS "FeedEvent_createdAt_idx" ON "FeedEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "FeedEvent_highlight_idx" ON "FeedEvent"("highlight");
CREATE INDEX IF NOT EXISTS "FeedEvent_pinned_idx" ON "FeedEvent"("pinned");

CREATE INDEX IF NOT EXISTS "Duel_creatorId_idx" ON "Duel"("creatorId");
CREATE INDEX IF NOT EXISTS "Duel_opponentId_idx" ON "Duel"("opponentId");
CREATE INDEX IF NOT EXISTS "Duel_status_idx" ON "Duel"("status");
CREATE INDEX IF NOT EXISTS "Duel_endsAt_idx" ON "Duel"("endsAt");

CREATE UNIQUE INDEX IF NOT EXISTS "DuelParticipant_duelId_userId_key" ON "DuelParticipant"("duelId", "userId");
CREATE INDEX IF NOT EXISTS "DuelParticipant_userId_idx" ON "DuelParticipant"("userId");

CREATE INDEX IF NOT EXISTS "Challenge_creatorId_idx" ON "Challenge"("creatorId");
CREATE INDEX IF NOT EXISTS "Challenge_type_idx" ON "Challenge"("type");
CREATE INDEX IF NOT EXISTS "Challenge_status_idx" ON "Challenge"("status");
CREATE INDEX IF NOT EXISTS "Challenge_endsAt_idx" ON "Challenge"("endsAt");

CREATE UNIQUE INDEX IF NOT EXISTS "ChallengeParticipant_challengeId_userId_key" ON "ChallengeParticipant"("challengeId", "userId");
CREATE INDEX IF NOT EXISTS "ChallengeParticipant_userId_idx" ON "ChallengeParticipant"("userId");

CREATE INDEX IF NOT EXISTS "Guild_isActive_idx" ON "Guild"("isActive");
CREATE INDEX IF NOT EXISTS "Guild_totalEP_idx" ON "Guild"("totalEP");

CREATE UNIQUE INDEX IF NOT EXISTS "GuildMember_guildId_userId_key" ON "GuildMember"("guildId", "userId");
CREATE INDEX IF NOT EXISTS "GuildMember_userId_idx" ON "GuildMember"("userId");
CREATE INDEX IF NOT EXISTS "GuildMember_guildId_idx" ON "GuildMember"("guildId");

CREATE INDEX IF NOT EXISTS "Season_isActive_idx" ON "Season"("isActive");
CREATE INDEX IF NOT EXISTS "Season_startDate_idx" ON "Season"("startDate");
CREATE INDEX IF NOT EXISTS "Season_endDate_idx" ON "Season"("endDate");

CREATE UNIQUE INDEX IF NOT EXISTS "SeasonRating_seasonId_userId_key" ON "SeasonRating"("seasonId", "userId");
CREATE INDEX IF NOT EXISTS "SeasonRating_seasonId_position_idx" ON "SeasonRating"("seasonId", "position");
CREATE INDEX IF NOT EXISTS "SeasonRating_userId_idx" ON "SeasonRating"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Recommendation_userId_type_itemId_key" ON "Recommendation"("userId", "type", "itemId");
CREATE INDEX IF NOT EXISTS "Recommendation_userId_idx" ON "Recommendation"("userId");
CREATE INDEX IF NOT EXISTS "Recommendation_type_idx" ON "Recommendation"("type");
CREATE INDEX IF NOT EXISTS "Recommendation_score_idx" ON "Recommendation"("score");

CREATE INDEX IF NOT EXISTS "Task_guildId_idx" ON "Task"("guildId");

-- Add foreign key for Task.guildId
ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

