-- CreateTable
CREATE TABLE "Promoter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "code" TEXT NOT NULL,
    "solWallet" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RewardPool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "amount" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OutboundClick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promoterId" INTEGER,
    "code" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutboundClick_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "Promoter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralClaim" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promoterId" INTEGER,
    "code" TEXT NOT NULL,
    "displayName" TEXT,
    "contactHandle" TEXT,
    "solWallet" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAmount" TEXT,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferralClaim_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "Promoter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promoterId" INTEGER,
    "code" TEXT NOT NULL,
    "solWallet" TEXT NOT NULL,
    "requestedAmount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WithdrawalRequest_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "Promoter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Promoter_code_key" ON "Promoter"("code");

-- CreateIndex
CREATE INDEX "OutboundClick_code_idx" ON "OutboundClick"("code");

-- CreateIndex
CREATE INDEX "OutboundClick_platform_idx" ON "OutboundClick"("platform");

-- CreateIndex
CREATE INDEX "OutboundClick_createdAt_idx" ON "OutboundClick"("createdAt");

-- CreateIndex
CREATE INDEX "ReferralClaim_code_idx" ON "ReferralClaim"("code");

-- CreateIndex
CREATE INDEX "ReferralClaim_status_idx" ON "ReferralClaim"("status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_code_idx" ON "WithdrawalRequest"("code");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");
