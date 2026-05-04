import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const posts = await prisma.promoterPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { promoter: true },
  });
  const rows = [
    ["id", "promoterDisplayName", "promoterXHandle", "postUrl", "status", "hasRequiredHashtag", "likeCount", "totalCommentCount", "eligibleCommentCount", "repostCount", "points", "internalAdminNote", "createdAt", "updatedAt"],
    ...posts.map((post) => [
      post.id,
      post.promoter.displayName,
      post.promoter.xHandle,
      post.postUrl,
      post.status,
      post.hasRequiredHashtag,
      post.likeCount,
      post.totalCommentCount,
      post.eligibleCommentCount,
      post.repostCount,
      post.points,
      post.adminNote,
      post.createdAt,
      post.updatedAt,
    ]),
  ];
  return csvResponse("posts.csv", rows);
}
