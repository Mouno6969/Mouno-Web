"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/format";
import { containsRequiredHashtag, findPromoterByXIdentifier } from "@/lib/twitter";

export async function submitPromoterPost(formData: FormData) {
  const identifier = cleanText(formData.get("xIdentifier"), 180);
  const postUrl = cleanText(formData.get("postUrl"), 260);
  const postText = cleanText(formData.get("postText"), 1000);

  if (!identifier || !postUrl) redirect("/promoters/posts?error=missing");
  const promoter = await findPromoterByXIdentifier(identifier);
  if (!promoter || !promoter.active) redirect("/promoters/posts?error=promoter");

  const existing = await prisma.promoterPost.findUnique({ where: { postUrl } });
  if (existing) redirect("/promoters/posts?error=duplicate");

  const hasRequiredHashtag = containsRequiredHashtag(postText);
  await prisma.promoterPost.create({
    data: {
      promoterId: promoter.id,
      postUrl,
      postText: postText || null,
      hasRequiredHashtag,
      status: "PENDING",
    },
  });

  redirect(`/promoters/posts?submitted=1&hashtag=${hasRequiredHashtag ? "1" : "0"}`);
}
