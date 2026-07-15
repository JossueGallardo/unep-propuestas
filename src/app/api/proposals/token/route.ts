import { NextResponse } from "next/server";

import { getRequiredEnv } from "@/lib/env";
import {
  createFormToken,
  FORM_TOKEN_MAX_AGE_MS,
} from "@/lib/security/form-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const token = createFormToken(getRequiredEnv("RATE_LIMIT_HMAC_SECRET"));
  return NextResponse.json(
    {
      token,
      expiresAt: new Date(Date.now() + FORM_TOKEN_MAX_AGE_MS).toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
