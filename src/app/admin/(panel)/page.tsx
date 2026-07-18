import { ArrowLeft, ArrowRight, Inbox, Layers3 } from "lucide-react";
import Link from "next/link";

import { AdminFiltersForm } from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  applyProposalFilters,
  filtersToSearchParams,
  parseAdminFilters,
  type SearchParams,
} from "@/lib/admin/filters";
import { requireAdmin } from "@/lib/admin/auth";
import { getCategoryLabel, getStatusLabel } from "@/lib/constants";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Counts = {
  total: number;
  nueva: number;
  revisada: number;
  archivada: number;
};

function parseCounts(value: Json): Counts {
  const empty = { total: 0, nueva: 0, revisada: 0, archivada: 0 };
  if (!value || Array.isArray(value) || typeof value !== "object") return empty;
  return {
    total: Number(value.total ?? 0),
    nueva: Number(value.nueva ?? 0),
    revisada: Number(value.revisada ?? 0),
    archivada: Number(value.archivada ?? 0),
  };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseAdminFilters(await searchParams);
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("proposals")
    .select(
      "id, reference_code, is_anonymous, submitter_name, category, status, title, created_at",
      { count: "exact" },
    );
  query = applyProposalFilters(query, filters);

  const offset = (filters.page - 1) * ADMIN_PAGE_SIZE;
  const [{ data, count, error }, countsResult] = await Promise.all([
    query.range(offset, offset + ADMIN_PAGE_SIZE - 1),
    supabase.rpc("get_proposal_counts"),
  ]);

  if (error || countsResult.error) {
    throw new Error("No se pudieron cargar las propuestas.");
  }

  const rows = data ?? [];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const counts = parseCounts(countsResult.data ?? null);

  return (
    <main id="contenido" className="container-site py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-kicker">Panel privado</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Propuestas</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Datos en hora de Ecuador continental
        </p>
      </div>

      <section
        aria-label="Resumen"
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {(
          [
            ["Total", counts.total],
            ["Nuevas", counts.nueva],
            ["Revisadas", counts.revisada],
            ["Archivadas", counts.archivada],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="border bg-white p-4 sm:p-5">
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-heading mt-2 text-3xl">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <AdminFiltersForm filters={filters} />
      </div>

      <section aria-labelledby="resultados" className="mt-6 border bg-white">
        <div className="flex items-center justify-between gap-4 border-b p-4 sm:p-5">
          <div>
            <h2 id="resultados" className="text-xl">
              Resultados
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {total} propuesta{total === 1 ? "" : "s"}
            </p>
          </div>
          <Layers3
            className="text-muted-foreground size-5"
            aria-hidden="true"
          />
        </div>

        {rows.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <Inbox
              className="text-muted-foreground size-9"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-xl">No hay resultados</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Prueba con filtros menos restrictivos.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Propuesta</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>
                      <span className="sr-only">Abrir</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">
                        {row.reference_code}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-md truncate font-semibold">
                          {row.title}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {row.is_anonymous ? "Anónima" : row.submitter_name}
                        </p>
                      </TableCell>
                      <TableCell>{getCategoryLabel(row.category)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "nueva" ? "default" : "secondary"
                          }
                        >
                          {getStatusLabel(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatAdminDate(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/propuestas/${row.id}`}>
                            Ver <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/admin/propuestas/${row.id}`}
                  className="block p-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs">
                      {row.reference_code}
                    </span>
                    <Badge
                      variant={row.status === "nueva" ? "default" : "secondary"}
                    >
                      {getStatusLabel(row.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 font-semibold">{row.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {getCategoryLabel(row.category)} ·{" "}
                    {formatAdminDate(row.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        <nav
          aria-label="Paginación"
          className="flex items-center justify-between gap-4 border-t p-4 sm:p-5"
        >
          <Button
            asChild
            variant="outline"
            size="sm"
            aria-disabled={filters.page <= 1}
            className={
              filters.page <= 1 ? "pointer-events-none opacity-50" : ""
            }
          >
            <Link
              href={`/admin?${filtersToSearchParams(filters, { page: String(filters.page - 1) })}`}
            >
              <ArrowLeft aria-hidden="true" />
              Anterior
            </Link>
          </Button>
          <span className="text-muted-foreground text-sm">
            Página {Math.min(filters.page, pages)} de {pages}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            aria-disabled={filters.page >= pages}
            className={
              filters.page >= pages ? "pointer-events-none opacity-50" : ""
            }
          >
            <Link
              href={`/admin?${filtersToSearchParams(filters, { page: String(filters.page + 1) })}`}
            >
              Siguiente
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </section>
    </main>
  );
}
