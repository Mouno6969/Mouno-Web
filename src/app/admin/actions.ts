"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { cleanText } from "@/lib/format";
import type { ReviewStatus, WithdrawalStatus } from "@prisma/client";

function makeCode(value: string) {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42);
  return base || `promoter-${Math.random().toString(36).slice(2, 8)}`;
}

async function uniqueCode(seed: string) {
  const base = makeCode(seed);
  let code = base;
  let suffix = 1;
  while (await prisma.promoter.findUnique({ where: { code } })) {
    suffix += 1;
    code = `${base}-${suffix}`;
  }
  return code;
}

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
  const name = cleanText(formData.get("name"), 100);
  if (!name) redirect("/admin?error=promoter-name");
  const requestedCode = cleanText(formData.get("code"), 80);
  const code = await uniqueCode(requestedCode || name);

  await prisma.promoter.create({
    data: {
      name,
      handle: cleanText(formData.get("handle"), 100) || null,
      code,
      solWallet: cleanText(formData.get("solWallet"), 120) || null,
      active: true,
    },
  });
  revalidatePath("/admin");
}

export async function setPromoterActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.promoter.update({ where: { id }, data: { active: formData.get("active") === "true" } });
  revalidatePath("/admin");
}

export async function updateClaim(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = cleanText(formData.get("status"), 20) as ReviewStatus;
  await prisma.referralClaim.update({
    where: { id },
    data: {
      status,
      approvedAmount: cleanText(formData.get("approvedAmount"), 80) || null,
      adminNote: cleanText(formData.get("adminNote"), 500) || null,
    },
  });
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
