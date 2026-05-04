"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { cleanText } from "@/lib/format";
import { calculatePoints, calculateVerified, containsRequiredHashtag, extractXHandle, normalizeHandle, normalizeXProfileUrl, parseCount, recalculatePostCommentTotals } from "@/lib/twitter";
import type { PostStatus, WithdrawalStatus } from "@prisma/client";

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateRewardPool(formData: FormData) {
  await requireAdmin();
  await prisma.rewardPool.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      amount: cleanText(formData.get("amount"), 80),
      description: cleanText(formData.get("description"), 500),
      active: formData.get("active") === "on",
    },
    update: {
      amount: cleanText(formData.get("amount"), 80),
      description: cleanText(formData.get("description"), 500),
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createPromoter(formData: FormData) {
  await requireAdmin();
  const displayName = cleanText(formData.get("displayName"), 100);
  const rawProfile = cleanText(formData.get("xProfileUrl"), 180);
  const xProfileUrl = normalizeXProfileUrl(rawProfile);
  const xHandle = extractXHandle(rawProfile);
  const followerCount = parseCount(formData.get("followerCount"));
  const accountAge = cleanText(formData.get("accountAge"), 80);

  if (!displayName || !xProfileUrl || !xHandle) redirect("/admin?error=promoter");

  try {
    await prisma.promoter.create({
      data: {
        displayName,
        xProfileUrl,
        xHandle,
        followerCount,
        accountAge: accountAge || null,
        criteriaAccepted: formData.get("criteriaAccepted") === "on",
        verified: calculateVerified(followerCount),
        solWallet: cleanText(formData.get("solWallet"), 120) || null,
        active: true,
      },
    });
  } catch {
    redirect("/admin?error=duplicate-promoter");
  }
  revalidatePath("/admin");
}

export async function updatePromoter(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const displayName = cleanText(formData.get("displayName"), 100);
  const rawProfile = cleanText(formData.get("xProfileUrl"), 180);
  const xProfileUrl = normalizeXProfileUrl(rawProfile);
  const xHandle = extractXHandle(rawProfile);
  const followerCount = parseCount(formData.get("followerCount"));
  const accountAge = cleanText(formData.get("accountAge"), 80);
  const verificationMode = cleanText(formData.get("verificationMode"), 20);
  const verified = verificationMode === "verified" ? true : verificationMode === "unverified" ? false : calculateVerified(followerCount);

  if (!id || !displayName || !xProfileUrl || !xHandle) redirect("/admin?error=promoter");

  await prisma.promoter.update({
    where: { id },
    data: {
      displayName,
      xProfileUrl,
      xHandle,
      followerCount,
      accountAge: accountAge || null,
      criteriaAccepted: formData.get("criteriaAccepted") === "on",
      verified,
      solWallet: cleanText(formData.get("solWallet"), 120) || null,
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin");
}

export async function updatePost(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const likeCount = parseCount(formData.get("likeCount"));
  const repostCount = parseCount(formData.get("repostCount"));
  const eligibleCommentCount = parseCount(formData.get("eligibleCommentCount"));
  const totalCommentCount = parseCount(formData.get("totalCommentCount"));
  const postText = cleanText(formData.get("postText"), 1000);
  const manualHashtag = formData.get("hasRequiredHashtag") === "on";
  const hasRequiredHashtag = manualHashtag || containsRequiredHashtag(postText);
  const status = cleanText(formData.get("status"), 20) as PostStatus;

  await prisma.promoterPost.update({
    where: { id },
    data: {
      postText: postText || null,
      hasRequiredHashtag,
      status,
      likeCount,
      repostCount,
      eligibleCommentCount,
      totalCommentCount: Math.max(totalCommentCount, eligibleCommentCount),
      points: calculatePoints(likeCount, eligibleCommentCount, repostCount),
      adminNote: cleanText(formData.get("adminNote"), 500) || null,
    },
  });
  revalidatePath("/admin");
}

export async function upsertCommentEngagement(formData: FormData) {
  await requireAdmin();
  const postId = Number(formData.get("postId"));
  const commenterHandle = normalizeHandle(cleanText(formData.get("commenterHandle"), 80));
  const commentCount = parseCount(formData.get("commentCount"));
  const eligibleCount = Math.min(commentCount, 2);

  if (!postId || !commenterHandle) redirect("/admin?error=comment");

  await prisma.postCommentEngagement.upsert({
    where: { postId_commenterHandle: { postId, commenterHandle } },
    create: { postId, commenterHandle, commentCount, eligibleCount },
    update: { commentCount, eligibleCount },
  });
  await recalculatePostCommentTotals(postId);
  revalidatePath("/admin");
}

export async function updateWithdrawal(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = cleanText(formData.get("status"), 20) as WithdrawalStatus;
  await prisma.withdrawalRequest.update({
    where: { id },
    data: {
      status,
      adminNote: cleanText(formData.get("adminNote"), 500) || null,
    },
  });
  revalidatePath("/admin");
}
