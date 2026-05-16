-- Phase 7: Event tasks, slug/locale, shop eventSlug

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "locale" TEXT NOT NULL DEFAULT 'en';

UPDATE "Event" SET "slug" = 'echoes-beneath-blackveil', "locale" = 'en' WHERE "slug" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "slug" SET NOT NULL;

DROP INDEX IF EXISTS "Event_slug_locale_key";
CREATE UNIQUE INDEX "Event_slug_locale_key" ON "Event"("slug", "locale");

CREATE TABLE IF NOT EXISTS "EventTask" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskKey" TEXT NOT NULL,
    "targetProgress" INTEGER NOT NULL DEFAULT 1,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "rewardNftId" TEXT,
    CONSTRAINT "EventTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserEventTaskProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserEventTaskProgress_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ShopItem" ADD COLUMN IF NOT EXISTS "eventSlug" TEXT;

CREATE INDEX IF NOT EXISTS "EventTask_eventId_stepOrder_idx" ON "EventTask"("eventId", "stepOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "UserEventTaskProgress_userId_taskId_key" ON "UserEventTaskProgress"("userId", "taskId");
CREATE INDEX IF NOT EXISTS "UserEventTaskProgress_userId_eventId_idx" ON "UserEventTaskProgress"("userId", "eventId");
CREATE INDEX IF NOT EXISTS "ShopItem_eventSlug_idx" ON "ShopItem"("eventSlug");

ALTER TABLE "EventTask" DROP CONSTRAINT IF EXISTS "EventTask_eventId_fkey";
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventTask" DROP CONSTRAINT IF EXISTS "EventTask_rewardNftId_fkey";
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_rewardNftId_fkey" FOREIGN KEY ("rewardNftId") REFERENCES "NFTReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserEventTaskProgress" DROP CONSTRAINT IF EXISTS "UserEventTaskProgress_userId_fkey";
ALTER TABLE "UserEventTaskProgress" ADD CONSTRAINT "UserEventTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserEventTaskProgress" DROP CONSTRAINT IF EXISTS "UserEventTaskProgress_eventId_fkey";
ALTER TABLE "UserEventTaskProgress" ADD CONSTRAINT "UserEventTaskProgress_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserEventTaskProgress" DROP CONSTRAINT IF EXISTS "UserEventTaskProgress_taskId_fkey";
ALTER TABLE "UserEventTaskProgress" ADD CONSTRAINT "UserEventTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "EventTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
