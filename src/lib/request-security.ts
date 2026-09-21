import "server-only";

import { headers } from "next/headers";

type RateLimitEntry = { count: number; resetAt: number };
const limits = new Map<string, RateLimitEntry>();

export async function clientIdentifier() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = limits.get(key);
  if (!current || current.resetAt <= now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}