import { NextResponse, type NextRequest } from "next/server";

import { getRequiredEnv } from "@/lib/env";
import { verifyFormToken } from "@/lib/security/form-token";
import { readJsonBody } from "@/lib/security/json-body";
import {
  getClientIp,
  hashClientIdentifier,
  isSameOriginRequest,
} from "@/lib/security/request";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { createPublicServerClient } from "@/lib/supabase/server";
import {
  normalizeProposalInput,
  proposalFormSchema,
} from "@/lib/validation/proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 25_000;

function errorResponse(
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return NextResponse.json(
    { message, ...(fieldErrors ? { fieldErrors } : {}) },
    { status, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return errorResponse("La solicitud no es válida.", 403);
  }
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return errorResponse("El formato de la solicitud no es válido.", 415);
  }
  const bodyResult = await readJsonBody(request, MAX_REQUEST_BYTES);
  if (!bodyResult.ok && bodyResult.reason === "too_large") {
    return errorResponse("La solicitud es demasiado grande.", 413);
  }
  if (!bodyResult.ok) {
    return errorResponse("El formulario no contiene datos válidos.", 400);
  }
  const body = bodyResult.value;

  const parsed = proposalFormSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Revisa los campos señalados antes de enviar.",
      400,
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }
  if (parsed.data.website.trim()) {
    return errorResponse("No pudimos validar el formulario.", 400);
  }

  const hmacSecret = getRequiredEnv("RATE_LIMIT_HMAC_SECRET");
  const tokenResult = verifyFormToken(parsed.data.formToken, hmacSecret);
  if (!tokenResult.valid) {
    return errorResponse(
      "El formulario expiró o se envió demasiado rápido. Inténtalo nuevamente.",
      400,
    );
  }

  const rateLimitKey = hashClientIdentifier(
    getClientIp(request.headers),
    hmacSecret,
  );
  const turnstileValid = await verifyTurnstile(
    parsed.data.turnstileToken,
    request.nextUrl.hostname,
  );
  if (!turnstileValid) {
    return errorResponse(
      "No pudimos completar la verificación contra abuso.",
      400,
    );
  }

  const normalized = normalizeProposalInput(parsed.data);
  const supabase = createPublicServerClient();
  const { data, error } = await supabase.rpc("submit_proposal", {
    p_rpc_secret: getRequiredEnv("PROPOSAL_RPC_SECRET"),
    p_rate_limit_key: rateLimitKey,
    p_is_anonymous: normalized.isAnonymous,
    p_submitter_name: normalized.submitterName,
    p_community_role: normalized.communityRole,
    p_course_or_area: normalized.courseOrArea,
    p_category: normalized.category,
    p_custom_category: normalized.customCategory,
    p_title: normalized.title,
    p_description: normalized.description,
    p_expected_benefit: normalized.expectedBenefit,
  });

  if (error) {
    if (error.message.includes("UNEP_RATE_LIMIT")) {
      return errorResponse(
        "Has enviado varias propuestas recientemente. Espera unos minutos antes de intentarlo otra vez.",
        429,
      );
    }
    return errorResponse(
      "No pudimos guardar la propuesta en este momento. Inténtalo más tarde.",
      503,
    );
  }
  if (typeof data !== "string" || !/^UNEP-[A-F0-9]{12}$/.test(data)) {
    return errorResponse(
      "No pudimos confirmar la propuesta en este momento.",
      503,
    );
  }

  return NextResponse.json(
    { referenceCode: data },
    { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
