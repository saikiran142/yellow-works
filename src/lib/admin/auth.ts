import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "tyw_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;

const sha = (s: string): Buffer => createHash("sha256").update(s).digest();

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function passwordOk(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(sha(input), sha(expected));
}

const sign = (payload: string): string => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("hex");

export function createSessionToken(now = Date.now()): string {
  const exp = String(now + SESSION_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || Number(exp) < now) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(mac);
  return good.length === got.length && timingSafeEqual(good, got);
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MS / 1000,
};
