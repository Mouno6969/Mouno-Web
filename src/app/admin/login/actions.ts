"use server";

import { redirect } from "next/navigation";
import { setAdminSession, verifyCredentials } from "@/lib/auth";
import { cleanText } from "@/lib/format";

export async function loginAdmin(formData: FormData) {
  const username = cleanText(formData.get("username"), 80);
  const password = String(formData.get("password") || "");

  if (!verifyCredentials(username, password)) redirect("/admin/login?error=1");

  await setAdminSession(username);
  redirect("/admin");
}
