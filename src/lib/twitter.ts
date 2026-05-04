import { prisma } from "./prisma";

export const pointRules = {
  like: 2,
  comment: 1,
  repost: 3,
  maxEligibleCommentsPerUser: 2,
};

export function parseCount(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value || "0").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateVerified(followerCount: number) {
  return followerCount >= 1000;
}

export function calculatePoints(likeCount: number, eligibleCommentCount: number, repostCount: number) {
  return likeCount * pointRules.like + eligibleCommentCount * pointRules.comment + repostCount * pointRules.repost;
}

export function containsRequiredHashtag(value: string | null | undefined) {
  return /(^|\s)#(RefundYourSol|RYS)\b/i.test(value || "");
}

export function normalizeHandle(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15);
}

export function extractXHandle(value: string) {
  const input = value.trim();
  if (!input) return "";
  if (input.startsWith("@") || /^[a-zA-Z0-9_]{1,15}$/.test(input)) return normalizeHandle(input);
  try {
    const parsed = new URL(input.startsWith("http") ? input : `https://${input}`);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.endsWith("x.com") && !host.endsWith("twitter.com")) return "";
    const [handle] = parsed.pathname.split("/").filter(Boolean);
    return normalizeHandle(handle || "");
  } catch {
    return "";
  }
}

export function normalizeXProfileUrl(value: string) {
  const handle = extractXHandle(value);
  return handle ? `https://x.com/${handle}` : "";
}

export function displayHandle(handle: string | null | undefined) {
  return handle ? `@${handle.replace(/^@/, "")}` : "—";
}

export async function findPromoterByXIdentifier(value: string) {
  const handle = extractXHandle(value);
  const profileUrl = normalizeXProfileUrl(value);
  if (!handle && !profileUrl) return null;
  return prisma.promoter.findFirst({
    where: {
      OR: [
        profileUrl ? { xProfileUrl: profileUrl } : undefined,
        handle ? { xHandle: handle } : undefined,
      ].filter(Boolean) as { xProfileUrl?: string; xHandle?: string }[],
    },
  });
}

export async function recalculatePostCommentTotals(postId: number) {
  const aggregate = await prisma.postCommentEngagement.aggregate({
    where: { postId },
    _sum: { commentCount: true, eligibleCount: true },
  });
  const post = await prisma.promoterPost.findUnique({ where: { id: postId } });
  if (!post) return null;
  const totalCommentCount = aggregate._sum.commentCount || 0;
  const eligibleCommentCount = aggregate._sum.eligibleCount || 0;
  return prisma.promoterPost.update({
    where: { id: postId },
    data: {
      totalCommentCount,
      eligibleCommentCount,
      points: calculatePoints(post.likeCount, eligibleCommentCount, post.repostCount),
    },
  });
}
