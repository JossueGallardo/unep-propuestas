import "server-only";

import { getOptionalEnv } from "@/lib/env";
import { TURNSTILE_ACTION } from "@/lib/security/turnstile-constants";

type TurnstileResponse = {
  success: boolean;
  action?: string;
  hostname?: string;
};

const TURNSTILE_TIMEOUT_MS = 5_000;

export function getTurnstileSiteKey() {
  const siteKey = getOptionalEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  const secretKey = getOptionalEnv("TURNSTILE_SECRET_KEY");
  return siteKey && secretKey ? siteKey : undefined;
}

export async function verifyTurnstile(token: string, expectedHostname: string) {
  if (!getTurnstileSiteKey()) return true;
  const secret = getOptionalEnv("TURNSTILE_SECRET_KEY");
  if (!secret || !token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
      },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    return (
      result.success === true &&
      result.action === TURNSTILE_ACTION &&
      result.hostname?.toLowerCase() === expectedHostname.toLowerCase()
    );
  } catch {
    return false;
  }
}
