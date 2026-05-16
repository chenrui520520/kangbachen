-- Phase 6: Lore, community, campaigns, docs

CREATE TABLE "LoreFaction" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "colorTheme" TEXT NOT NULL DEFAULT 'violet',
    "motto" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreFaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoreRegion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "mapX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "mapY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "factionId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreRegion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoreCharacter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "factionId" TEXT,
    "regionId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreCharacter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoreCreature" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "regionId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreCreature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoreArtifact" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'rare',
    "factionId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreArtifact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoreTimeline" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "era" TEXT,
    "yearLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "factionId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoreTimeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityRole" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CommunityRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlphaPass" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "AlphaPass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InviteTier" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minReferrals" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InviteTier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "imageUrl" TEXT,
    "frameStyle" TEXT,
    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCommunityProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT,
    "alphaPassId" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "inviteTierKey" TEXT NOT NULL DEFAULT 'initiate',
    "title" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserCommunityProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "narrative" TEXT,
    "bannerUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignQuest" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskKey" TEXT NOT NULL,
    "targetProgress" INTEGER NOT NULL DEFAULT 1,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "parentQuestId" TEXT,
    "branchKey" TEXT,
    CONSTRAINT "CampaignQuest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCampaignProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserCampaignProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoreFaction_slug_locale_key" ON "LoreFaction"("slug", "locale");
CREATE INDEX "LoreFaction_published_locale_idx" ON "LoreFaction"("published", "locale");

CREATE UNIQUE INDEX "LoreRegion_slug_locale_key" ON "LoreRegion"("slug", "locale");
CREATE INDEX "LoreRegion_published_locale_idx" ON "LoreRegion"("published", "locale");

CREATE UNIQUE INDEX "LoreCharacter_slug_locale_key" ON "LoreCharacter"("slug", "locale");
CREATE INDEX "LoreCharacter_published_locale_idx" ON "LoreCharacter"("published", "locale");
CREATE INDEX "LoreCharacter_factionId_idx" ON "LoreCharacter"("factionId");

CREATE UNIQUE INDEX "LoreCreature_slug_locale_key" ON "LoreCreature"("slug", "locale");
CREATE INDEX "LoreCreature_published_locale_idx" ON "LoreCreature"("published", "locale");

CREATE UNIQUE INDEX "LoreArtifact_slug_locale_key" ON "LoreArtifact"("slug", "locale");
CREATE INDEX "LoreArtifact_published_locale_idx" ON "LoreArtifact"("published", "locale");

CREATE UNIQUE INDEX "LoreTimeline_slug_locale_key" ON "LoreTimeline"("slug", "locale");
CREATE INDEX "LoreTimeline_published_locale_sortOrder_idx" ON "LoreTimeline"("published", "locale", "sortOrder");

CREATE UNIQUE INDEX "CommunityRole_key_key" ON "CommunityRole"("key");
CREATE UNIQUE INDEX "AlphaPass_key_key" ON "AlphaPass"("key");
CREATE UNIQUE INDEX "InviteTier_key_key" ON "InviteTier"("key");
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

CREATE UNIQUE INDEX "UserCommunityProfile_userId_key" ON "UserCommunityProfile"("userId");

CREATE UNIQUE INDEX "Campaign_slug_locale_key" ON "Campaign"("slug", "locale");
CREATE INDEX "Campaign_active_startsAt_endsAt_idx" ON "Campaign"("active", "startsAt", "endsAt");

CREATE INDEX "CampaignQuest_campaignId_stepOrder_idx" ON "CampaignQuest"("campaignId", "stepOrder");

CREATE UNIQUE INDEX "UserCampaignProgress_userId_questId_key" ON "UserCampaignProgress"("userId", "questId");
CREATE INDEX "UserCampaignProgress_userId_campaignId_idx" ON "UserCampaignProgress"("userId", "campaignId");

CREATE UNIQUE INDEX "DocArticle_slug_locale_category_key" ON "DocArticle"("slug", "locale", "category");
CREATE INDEX "DocArticle_category_locale_published_idx" ON "DocArticle"("category", "locale", "published");

ALTER TABLE "LoreRegion" ADD CONSTRAINT "LoreRegion_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "LoreFaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoreCharacter" ADD CONSTRAINT "LoreCharacter_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "LoreFaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoreCharacter" ADD CONSTRAINT "LoreCharacter_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "LoreRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoreCreature" ADD CONSTRAINT "LoreCreature_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "LoreRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoreArtifact" ADD CONSTRAINT "LoreArtifact_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "LoreFaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoreTimeline" ADD CONSTRAINT "LoreTimeline_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "LoreFaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCommunityProfile" ADD CONSTRAINT "UserCommunityProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCommunityProfile" ADD CONSTRAINT "UserCommunityProfile_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CommunityRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserCommunityProfile" ADD CONSTRAINT "UserCommunityProfile_alphaPassId_fkey" FOREIGN KEY ("alphaPassId") REFERENCES "AlphaPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CampaignQuest" ADD CONSTRAINT "CampaignQuest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserCampaignProgress" ADD CONSTRAINT "UserCampaignProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCampaignProgress" ADD CONSTRAINT "UserCampaignProgress_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCampaignProgress" ADD CONSTRAINT "UserCampaignProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "CampaignQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
