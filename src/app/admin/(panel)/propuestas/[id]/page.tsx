import { Archive, ArrowLeft, CheckCircle2, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveAction, markReviewedAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getCategoryLabel,
  getCommunityRoleLabel,
  getStatusLabel,
} from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-bold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-2 leading-7 whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}

export default async function ProposalDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudo consultar la propuesta.");
  if (!proposal) notFound();

  return (
    <main id="contenido" className="container-site py-8 sm:py-12">
      <Button asChild variant="ghost" className="-ml-2">
        <Link href="/admin">
          <ArrowLeft aria-hidden="true" />
          Volver al panel
        </Link>
      </Button>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <article className="border bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
            <span className="font-mono text-sm">{proposal.reference_code}</span>
            <Badge
              variant={proposal.status === "nueva" ? "default" : "secondary"}
            >
              {getStatusLabel(proposal.status)}
            </Badge>
          </div>
          <h1 className="mt-7 text-3xl leading-tight sm:text-4xl">
            {proposal.title}
          </h1>
          <dl className="mt-8 grid gap-7">
            <Field label="Descripción" value={proposal.description} />
            <Field
              label="Beneficio esperado"
              value={proposal.expected_benefit}
            />
          </dl>
        </article>

        <aside className="space-y-5">
          <section className="border bg-white p-5">
            <div className="flex items-center gap-2">
              <UserRound className="text-brand size-5" aria-hidden="true" />
              <h2 className="text-lg">Datos</h2>
            </div>
            <dl className="mt-5 grid gap-5">
              <Field
                label="Anonimato"
                value={proposal.is_anonymous ? "Sí" : "No"}
              />
              <Field label="Nombre" value={proposal.submitter_name} />
              <Field
                label="Relación"
                value={getCommunityRoleLabel(proposal.community_role)}
              />
              <Field label="Curso o área" value={proposal.course_or_area} />
              <Field
                label="Categoría"
                value={
                  proposal.custom_category ||
                  getCategoryLabel(proposal.category)
                }
              />
              <Field
                label="Recibida"
                value={formatAdminDate(proposal.created_at)}
              />
              <Field
                label="Revisada"
                value={formatAdminDate(proposal.reviewed_at)}
              />
              <Field
                label="Archivada"
                value={formatAdminDate(proposal.archived_at)}
              />
            </dl>
          </section>
          {proposal.status !== "archivada" && (
            <section className="border bg-white p-5">
              <h2 className="text-lg">Acciones</h2>
              <div className="mt-4 grid gap-3">
                {proposal.status === "nueva" && (
                  <form action={markReviewedAction}>
                    <input type="hidden" name="id" value={proposal.id} />
                    <Button type="submit" className="w-full">
                      <CheckCircle2 aria-hidden="true" />
                      Marcar revisada
                    </Button>
                  </form>
                )}
                <form action={archiveAction}>
                  <input type="hidden" name="id" value={proposal.id} />
                  <Button type="submit" variant="outline" className="w-full">
                    <Archive aria-hidden="true" />
                    Archivar
                  </Button>
                </form>
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
