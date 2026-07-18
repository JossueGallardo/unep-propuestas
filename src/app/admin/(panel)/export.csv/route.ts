import type { NextRequest } from "next/server";

import { proposalsToCsv } from "@/lib/admin/csv";
import { requireAdmin } from "@/lib/admin/auth";
import {
  applyProposalFilters,
  MAX_CSV_ROWS,
  parseAdminFilters,
} from "@/lib/admin/filters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const filters = parseAdminFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const { supabase } = await requireAdmin();
  const query = applyProposalFilters(
    supabase.from("proposals").select("*"),
    filters,
  );

  const { data, error } = await query.range(0, MAX_CSV_ROWS);
  if (error)
    return new Response("No se pudo generar la exportación.", { status: 500 });
  if ((data?.length ?? 0) > MAX_CSV_ROWS)
    return new Response(
      "Hay más de 10.000 resultados. Aplica filtros más específicos.",
      { status: 422 },
    );

  return new Response(proposalsToCsv(data ?? []), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": 'attachment; filename="unep-propuestas.csv"',
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
