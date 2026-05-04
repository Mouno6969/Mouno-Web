-- AlterTable
ALTER TABLE "RewardPool" ADD COLUMN "campaignStartAt" DATETIME;
ALTER TABLE "RewardPool" ADD COLUMN "campaignEndAt" DATETIME;

-- AlterTable
ALTER TABLE "WithdrawalRequest" ADD COLUMN "payoutTxHash" TEXT;
