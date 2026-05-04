"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/format";

export async function submitReferralClaim(code: string, formData: FormData) {
  const promoter = await prisma.promoter.findUnique({ where: { code } });
  if (!promoter || !promoter.active) redirect(`/r/${encodeURIComponent(code)}?error=invalid`);

  const solWallet = cleanText(formData.get("solWallet"), 120);
  if (!solWallet) redirect(`/r/${encodeURIComponent(code)}?error=wallet`);

  await prisma.referralClaim.create({
    data: {
      promoterId: promoter.id,
      code: promoter.code,
      displayName: cleanText(formData.get("displayName"), 100) || null,
      contactHandle: cleanText(formData.get("contactHandle"), 100) || null,
      solWallet,
    },
  });

  redirect(`/r/${encodeURIComponent(code)}?submitted=1`);
}
