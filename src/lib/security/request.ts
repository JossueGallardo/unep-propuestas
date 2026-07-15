import { createHmac } from "node:crypto";

import type { NextRequest } from "next/server";

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.trim();
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unavailable";
  return process.env.NODE_ENV === "development"
    ? "local-development"
    : "unavailable";
}

export function hashClientIdentifier(identifier: string, secret: string) {
  return createHmac("sha256", secret).update(identifier).digest("hex");
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === request.nextUrl.protocol &&
      parsed.host === request.nextUrl.host
    );
  } catch {
    return false;
  }
}
