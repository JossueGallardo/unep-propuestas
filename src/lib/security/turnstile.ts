import { getOptionalEnv } from "@/lib/env";

type TurnstileResponse = {
  success: boolean;
};

export function isTurnstileEnabled() {
  return Boolean(
    getOptionalEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY") &&
    getOptionalEnv("TURNSTILE_SECRET_KEY"),
  );
}

export async function verifyTurnstile(token: string, remoteIp: string) {
  if (!isTurnstileEnabled()) return true;
  const secret = getOptionalEnv("TURNSTILE_SECRET_KEY");
  if (!secret || !token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp,
  });
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        cache: "no-store",
      },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    return result.success === true;
  } catch {
    return false;
  }
}
