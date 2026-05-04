import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { socialLinks } from "@/lib/constants";
import type { Platform } from "@prisma/client";

const platformMap: Record<string, { db: Platform; url: string }> = {
  telegram: { db: "TELEGRAM", url: socialLinks.telegram },
  discord: { db: "DISCORD", url: socialLinks.discord },
  twitter: { db: "TWITTER", url: socialLinks.twitter },
  x: { db: "TWITTER", url: socialLinks.twitter },
};

function hashIp(value: string | null) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const target = platformMap[platform.toLowerCase()] || platformMap.telegram;
  const code = request.nextUrl.searchParams.get("code")?.trim() || "";

  if (code) {
    const promoter = await prisma.promoter.findUnique({ where: { code } });

    if (promoter?.active) {
      await prisma.outboundClick.create({
        data: {
          promoterId: promoter.id,
          code: promoter.code,
          platform: target.db,
          ipHash: hashIp(request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip")),
          userAgent: request.headers.get("user-agent")?.slice(0, 220) || null,
        },
      });
    }
  }

  return NextResponse.redirect(target.url, 302);
}
