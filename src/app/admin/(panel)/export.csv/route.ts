import type { NextRequest } from "next/server";

import { proposalsToCsv } from "@/lib/admin/csv";
import { MAX_CSV_ROWS, parseAdminFilters } from "@/lib/admin/filters";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const filters = parseAdminFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const { supabase } = await requireAdmin();
  let query = supabase.from("proposals").select("*");

  if (filters.search)
    query = query.textSearch("search_document", filters.search, {
      type: "websearch",
      config: "spanish",
    });
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.anonymous)
    query = query.eq("is_anonymous", filters.anonymous === "yes");
  if (filters.from)
    query = query.gte("created_at", `${filters.from}T00:00:00-05:00`);
  if (filters.to)
    query = query.lte("created_at", `${filters.to}T23:59:59.999-05:00`);

  const { data, error } = await query
    .order("created_at", { ascending: filters.sort === "oldest" })
    .range(0, MAX_CSV_ROWS);
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
