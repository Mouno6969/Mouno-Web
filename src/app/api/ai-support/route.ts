import { NextResponse } from "next/server";
import { AI_SUPPORT_MAX_MESSAGE_LENGTH, askWebsiteAiSupport } from "@/lib/aiSupport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { message?: unknown; question?: unknown } | null;
    const rawMessage = typeof body?.message === "string" ? body.message : typeof body?.question === "string" ? body.question : "";
    const message = rawMessage.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (message.length > AI_SUPPORT_MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message is too long. Maximum ${AI_SUPPORT_MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
    }

    const result = await askWebsiteAiSupport(message);
    if (!result) {
      return NextResponse.json({ error: "AI Support is temporarily unavailable. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ answer: result.answer, provider: result.provider });
  } catch {
    return NextResponse.json({ error: "AI Support is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
