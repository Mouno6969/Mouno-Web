"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/format";

export async function submitWithdrawalRequest(formData: FormData) {
  const code = cleanText(formData.get("code"), 80);
  const solWallet = cleanText(formData.get("solWallet"), 120);
  const requestedAmount = cleanText(formData.get("requestedAmount"), 80);

  if (!code || !solWallet || !requestedAmount) redirect("/withdraw?error=missing");

  const promoter = await prisma.promoter.findUnique({ where: { code } });
  if (!promoter || !promoter.active) redirect("/withdraw?error=code");

  await prisma.withdrawalRequest.create({
    data: {
      promoterId: promoter.id,
      code: promoter.code,
      solWallet,
      requestedAmount,
      message: cleanText(formData.get("message"), 500) || null,
    },
  });

  redirect("/withdraw?submitted=1");
}
