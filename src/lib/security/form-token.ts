import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = 1;
export const FORM_TOKEN_MIN_AGE_MS = 3_000;
export const FORM_TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1_000;

type FormTokenPayload = {
  v: number;
  iat: number;
  nonce: string;
};

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createFormToken(secret: string, nowMs = Date.now()) {
  const payload: FormTokenPayload = {
    v: TOKEN_VERSION,
    iat: nowMs,
    nonce: randomBytes(12).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

export type FormTokenVerification =
  | { valid: true; issuedAt: number }
  | {
      valid: false;
      reason: "malformed" | "signature" | "too_fast" | "expired";
    };

export function verifyFormToken(
  token: string,
  secret: string,
  nowMs = Date.now(),
): FormTokenVerification {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra)
    return { valid: false, reason: "malformed" };

  const expected = sign(encoded, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return { valid: false, reason: "signature" };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString(),
    ) as FormTokenPayload;
    if (
      payload.v !== TOKEN_VERSION ||
      !Number.isFinite(payload.iat) ||
      !payload.nonce
    ) {
      return { valid: false, reason: "malformed" };
    }
    const age = nowMs - payload.iat;
    if (age < FORM_TOKEN_MIN_AGE_MS)
      return { valid: false, reason: "too_fast" };
    if (age > FORM_TOKEN_MAX_AGE_MS || age < 0)
      return { valid: false, reason: "expired" };
    return { valid: true, issuedAt: payload.iat };
  } catch {
    return { valid: false, reason: "malformed" };
  }
}
