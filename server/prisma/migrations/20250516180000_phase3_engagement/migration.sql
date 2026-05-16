-- User sign-in streak fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signInStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signInCycleDay" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSignInDate" DATE;

-- SignInRewardConfig
CREATE TABLE "SignInRewardConfig" (
    "day" INTEGER NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "nftRewardId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignInRewardConfig_pkey" PRIMARY KEY ("day")
);

-- UserDailyClaim
CREATE TABLE "UserDailyClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimDate" DATE NOT NULL,
    "cycleDay" INTEGER NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "nftRewardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDailyClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserDailyClaim_userId_claimDate_key" ON "UserDailyClaim"("userId", "claimDate");
CREATE INDEX "UserDailyClaim_userId_idx" ON "UserDailyClaim"("userId");

ALTER TABLE "UserDailyClaim" ADD CONSTRAINT "UserDailyClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PointsTransaction
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PointsTransaction_userId_createdAt_idx" ON "PointsTransaction"("userId", "createdAt");
CREATE INDEX "PointsTransaction_type_idx" ON "PointsTransaction"("type");

ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NFTReward
CREATE TABLE "NFTReward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL,
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NFTReward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NFTReward_rarity_idx" ON "NFTReward"("rarity");

-- UserNFT
CREATE TABLE "UserNFT" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nftRewardId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNFT_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserNFT_userId_idx" ON "UserNFT"("userId");
CREATE INDEX "UserNFT_nftRewardId_idx" ON "UserNFT"("nftRewardId");

ALTER TABLE "UserNFT" ADD CONSTRAINT "UserNFT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserNFT" ADD CONSTRAINT "UserNFT_nftRewardId_fkey" FOREIGN KEY ("nftRewardId") REFERENCES "NFTReward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Task extensions
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'DAILY';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "cooldownHours" INTEGER;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "targetProgress" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "Task_category_idx" ON "Task"("category");

-- UserTask extensions
ALTER TABLE "UserTask" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserTask" ADD COLUMN IF NOT EXISTS "lastCompletedAt" TIMESTAMP(3);

-- Leaderboard unique per user+type
DROP INDEX IF EXISTS "LeaderboardEntry_type_value_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "LeaderboardEntry_userId_type_key" ON "LeaderboardEntry"("userId", "type");

-- Event extensions
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

-- EventReward
CREATE TABLE "EventReward" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "nftRewardId" TEXT,
    "milestone" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "EventReward_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventReward_eventId_idx" ON "EventReward"("eventId");

ALTER TABLE "EventReward" ADD CONSTRAINT "EventReward_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventReward" ADD CONSTRAINT "EventReward_nftRewardId_fkey" FOREIGN KEY ("nftRewardId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UserEventProgress
CREATE TABLE "UserEventProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEventProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserEventProgress_userId_eventId_key" ON "UserEventProgress"("userId", "eventId");
CREATE INDEX "UserEventProgress_userId_idx" ON "UserEventProgress"("userId");

ALTER TABLE "UserEventProgress" ADD CONSTRAINT "UserEventProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserEventProgress" ADD CONSTRAINT "UserEventProgress_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ShopItem extensions
ALTER TABLE "ShopItem" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "ShopItem" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

-- ShopOrder
CREATE TABLE "ShopOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "costPoints" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShopOrder_userId_idx" ON "ShopOrder"("userId");
CREATE INDEX "ShopOrder_createdAt_idx" ON "ShopOrder"("createdAt");

ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FKs for SignInRewardConfig and UserDailyClaim
ALTER TABLE "SignInRewardConfig" ADD CONSTRAINT "SignInRewardConfig_nftRewardId_fkey" FOREIGN KEY ("nftRewardId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserDailyClaim" ADD CONSTRAINT "UserDailyClaim_nftRewardId_fkey" FOREIGN KEY ("nftRewardId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_rewardNftId_fkey" FOREIGN KEY ("rewardNftId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShopItem" ADD CONSTRAINT "ShopItem_rewardNftId_fkey" FOREIGN KEY ("rewardNftId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
