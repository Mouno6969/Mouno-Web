import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { site } from "./constants";

const cookieName = "rys_admin_session";
const maxAgeSeconds = 60 * 60 * 24 * 7;

type SessionPayload = {
  username: string;
  exp: number;
  nonce: string;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters in production.");
    }
    return "development-only-session-secret-change-before-production";
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || site.adminUsername;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;
  return safeEqual(username.trim(), expectedUsername) && safeEqual(password, expectedPassword);
}

export function createSessionToken(username: string) {
  const payload: SessionPayload = {
    username,
    exp: Date.now() + maxAgeSeconds * 1000,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token?: string) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    if (!payload.username || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSession(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(cookieName)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
