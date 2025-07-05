-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "fullName" TEXT,
    "followers" INTEGER,
    "following" INTEGER,
    "posts" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isBusiness" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "externalUrl" TEXT,
    "profilePicUrl" TEXT,
    "businessCategory" TEXT,
    "highlightsCount" INTEGER,
    "recentPostsCount" INTEGER,
    "externalLinks" TEXT,
    "locationInfo" TEXT,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL,
    "lastScraped" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "profile_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "followers" INTEGER,
    "following" INTEGER,
    "posts" INTEGER,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBusiness" BOOLEAN NOT NULL DEFAULT false,
    "avgLikes" REAL,
    "avgComments" REAL,
    "storyActive" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign" TEXT,
    CONSTRAINT "profile_snapshots_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "bioScore" REAL,
    "visionScore" REAL,
    "leadTier" TEXT,
    "leadPriority" TEXT,
    "bioAnalysis" TEXT,
    "businessType" TEXT,
    "urgencyLevel" TEXT,
    "pitchScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "temperature" TEXT,
    "assignedTo" TEXT,
    "notes" TEXT,
    "contactAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastContacted" DATETIME,
    "responseStatus" TEXT,
    "searchKeyword" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "screenshotPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "leads_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leads_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "campaign" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 1,
    "maxLeads" INTEGER,
    "scraperType" TEXT NOT NULL DEFAULT 'apify',
    "leadsFound" INTEGER NOT NULL DEFAULT 0,
    "successRate" REAL,
    "avgProcessingTime" REAL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "lead_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT,
    "direction" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT,
    "outcome" TEXT,
    "scheduledAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_interactions_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campaign_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaign" TEXT NOT NULL,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "hotLeads" INTEGER NOT NULL DEFAULT 0,
    "qualifiedLeads" INTEGER NOT NULL DEFAULT 0,
    "convertedLeads" INTEGER NOT NULL DEFAULT 0,
    "avgBioScore" REAL,
    "avgFollowers" REAL,
    "verifiedPercent" REAL,
    "businessPercent" REAL,
    "topBusinessTypes" TEXT,
    "avgResponseRate" REAL,
    "bestPerformingKeywords" TEXT,
    "lastCalculated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "market_intelligence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessType" TEXT NOT NULL,
    "avgFollowers" REAL,
    "growthRate" REAL,
    "engagement" REAL,
    "marketSaturation" REAL,
    "opportunityScore" REAL,
    "topLocations" TEXT,
    "trendingKeywords" TEXT,
    "seasonalTrends" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFrom" DATETIME NOT NULL,
    "dataTo" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profile_engagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "avgLikes" REAL,
    "avgComments" REAL,
    "avgShares" REAL,
    "engagementRate" REAL,
    "postsPerWeek" REAL,
    "storyFrequency" REAL,
    "peakHours" TEXT,
    "topHashtags" TEXT,
    "influencerScore" REAL,
    "brandSafety" REAL,
    "analyzedFrom" DATETIME NOT NULL,
    "analyzedTo" DATETIME NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profile_engagement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scraping_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "campaign" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 1,
    "scraperType" TEXT NOT NULL DEFAULT 'apify',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" REAL NOT NULL DEFAULT 0,
    "profilesFound" INTEGER NOT NULL DEFAULT 0,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "sessionsRun" INTEGER NOT NULL DEFAULT 0,
    "leadsGenerated" INTEGER NOT NULL DEFAULT 0,
    "successRate" REAL,
    "avgProcessingTime" REAL,
    "avgBioScore" REAL,
    "hotLeadPercent" REAL,
    "verifiedPercent" REAL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "uptime" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_analytics_campaign_key" ON "campaign_analytics"("campaign");

-- CreateIndex
CREATE UNIQUE INDEX "system_metrics_date_key" ON "system_metrics"("date");
