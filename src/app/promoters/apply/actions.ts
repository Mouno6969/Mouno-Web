"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/format";
import { calculateVerified, normalizeXProfileUrl, extractXHandle, parseCount } from "@/lib/twitter";

export async function applyPromoter(formData: FormData) {
  const displayName = cleanText(formData.get("displayName"), 100);
  const rawProfile = cleanText(formData.get("xProfileUrl"), 180);
  const xProfileUrl = normalizeXProfileUrl(rawProfile);
  const xHandle = extractXHandle(rawProfile);
  const followerCount = parseCount(formData.get("followerCount"));

  if (!displayName || !xProfileUrl || !xHandle) redirect("/promoters/apply?error=missing");

  const existing = await prisma.promoter.findUnique({ where: { xProfileUrl } });
  if (existing) redirect(`/promoters/apply?exists=1&verified=${existing.verified ? "1" : "0"}`);

  const promoter = await prisma.promoter.create({
    data: {
      displayName,
      xProfileUrl,
      xHandle,
      followerCount,
      verified: calculateVerified(followerCount),
      solWallet: cleanText(formData.get("solWallet"), 120) || null,
    },
  });

  redirect(`/promoters/apply?submitted=1&verified=${promoter.verified ? "1" : "0"}`);
}
