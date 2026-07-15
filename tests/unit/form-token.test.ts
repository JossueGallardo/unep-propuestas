import { describe, expect, it } from "vitest";

import {
  FORM_TOKEN_MAX_AGE_MS,
  createFormToken,
  verifyFormToken,
} from "@/lib/security/form-token";

const secret = "un-secreto-de-pruebas-con-entropia";
const issuedAt = 1_700_000_000_000;

describe("tokens de formulario", () => {
  it("acepta un token firmado después de tres segundos", () => {
    const token = createFormToken(secret, issuedAt);
    expect(verifyFormToken(token, secret, issuedAt + 3_000)).toEqual({
      valid: true,
      issuedAt,
    });
  });

  it("rechaza envíos demasiado rápidos", () => {
    const token = createFormToken(secret, issuedAt);
    expect(verifyFormToken(token, secret, issuedAt + 2_999)).toEqual({
      valid: false,
      reason: "too_fast",
    });
  });

  it("rechaza expiración, secreto incorrecto y manipulación", () => {
    const token = createFormToken(secret, issuedAt);
    expect(
      verifyFormToken(token, secret, issuedAt + FORM_TOKEN_MAX_AGE_MS + 1),
    ).toEqual({ valid: false, reason: "expired" });
    expect(verifyFormToken(token, "otro-secreto", issuedAt + 4_000)).toEqual({
      valid: false,
      reason: "signature",
    });
    expect(verifyFormToken(`${token}x`, secret, issuedAt + 4_000).valid).toBe(
      false,
    );
  });
});
