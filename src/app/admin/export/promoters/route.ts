import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const promoters = await prisma.promoter.findMany({
    orderBy: { createdAt: "desc" },
    include: { posts: true },
  });
  const rows = [
    ["id", "displayName", "xHandle", "xProfileUrl", "followerCount", "verified", "active", "solWallet", "totalVerifiedPoints", "createdAt", "updatedAt"],
    ...promoters.map((promoter) => [
      promoter.id,
      promoter.displayName,
      promoter.xHandle,
      promoter.xProfileUrl,
      promoter.followerCount,
      promoter.verified,
      promoter.active,
      promoter.solWallet,
      promoter.posts.filter((post) => post.status === "VERIFIED").reduce((sum, post) => sum + post.points, 0),
      promoter.createdAt,
      promoter.updatedAt,
    ]),
  ];
  return csvResponse("promoters.csv", rows);
}
