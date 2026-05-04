"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/format";
import { findPromoterByXIdentifier } from "@/lib/twitter";

export async function submitWithdrawalRequest(formData: FormData) {
  const identifier = cleanText(formData.get("xIdentifier"), 180);
  const solWallet = cleanText(formData.get("solWallet"), 120);
  const requestedAmount = cleanText(formData.get("requestedAmount"), 80);

  if (!identifier || !solWallet || !requestedAmount) redirect("/withdraw?error=missing");

  const promoter = await findPromoterByXIdentifier(identifier);
  if (!promoter || !promoter.active) redirect("/withdraw?error=promoter");

  await prisma.withdrawalRequest.create({
    data: {
      promoterId: promoter.id,
      solWallet,
      requestedAmount,
      message: cleanText(formData.get("message"), 500) || null,
    },
  });

  redirect("/withdraw?submitted=1");
}
