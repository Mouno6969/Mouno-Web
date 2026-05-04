-- CreateTable
CREATE TABLE "Promoter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "xProfileUrl" TEXT NOT NULL,
    "xHandle" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "solWallet" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
CREATE TABLE "PromoterPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promoterId" INTEGER NOT NULL,
    "postUrl" TEXT NOT NULL,
    "postText" TEXT,
    "hasRequiredHashtag" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "repostCount" INTEGER NOT NULL DEFAULT 0,
    "eligibleCommentCount" INTEGER NOT NULL DEFAULT 0,
    "totalCommentCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromoterPost_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "Promoter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostCommentEngagement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "commenterHandle" TEXT NOT NULL,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "eligibleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostCommentEngagement_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PromoterPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promoterId" INTEGER NOT NULL,
    "solWallet" TEXT NOT NULL,
    "requestedAmount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WithdrawalRequest_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "Promoter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Promoter_xProfileUrl_key" ON "Promoter"("xProfileUrl");

-- CreateIndex
CREATE UNIQUE INDEX "PromoterPost_postUrl_key" ON "PromoterPost"("postUrl");

-- CreateIndex
CREATE INDEX "PromoterPost_promoterId_idx" ON "PromoterPost"("promoterId");

-- CreateIndex
CREATE INDEX "PromoterPost_status_idx" ON "PromoterPost"("status");

-- CreateIndex
CREATE INDEX "PromoterPost_hasRequiredHashtag_idx" ON "PromoterPost"("hasRequiredHashtag");

-- CreateIndex
CREATE INDEX "PostCommentEngagement_commenterHandle_idx" ON "PostCommentEngagement"("commenterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "PostCommentEngagement_postId_commenterHandle_key" ON "PostCommentEngagement"("postId", "commenterHandle");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_promoterId_idx" ON "WithdrawalRequest"("promoterId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");
