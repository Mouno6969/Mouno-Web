import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const withdrawals = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { promoter: true },
  });
  const rows = [
    ["id", "promoterDisplayName", "promoterXHandle", "solWallet", "requestedAmount", "status", "payoutTxHash", "message", "internalAdminNote", "createdAt", "updatedAt"],
    ...withdrawals.map((request) => [
      request.id,
      request.promoter.displayName,
      request.promoter.xHandle,
      request.solWallet,
      request.requestedAmount,
      request.status,
      request.payoutTxHash,
      request.message,
      request.adminNote,
      request.createdAt,
      request.updatedAt,
    ]),
  ];
  return csvResponse("withdrawals.csv", rows);
}
