import type { ProposalRow } from "@/lib/supabase/types";
import {
  getCategoryLabel,
  getCommunityRoleLabel,
  getStatusLabel,
} from "@/lib/constants";

function protectSpreadsheetFormula(value: string) {
  return /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
}

export function csvCell(value: unknown) {
  const text = protectSpreadsheetFormula(value == null ? "" : String(value));
  return `"${text.replaceAll('"', '""')}"`;
}

export function proposalsToCsv(rows: ProposalRow[]) {
  const headers = [
    "Referencia",
    "Fecha",
    "Anónima",
    "Nombre",
    "Relación",
    "Curso o área",
    "Categoría",
    "Categoría personalizada",
    "Título",
    "Descripción",
    "Beneficio esperado",
    "Estado",
    "Revisada el",
    "Archivada el",
  ];
  const lines = rows.map((row) =>
    [
      row.reference_code,
      row.created_at,
      row.is_anonymous ? "Sí" : "No",
      row.submitter_name,
      getCommunityRoleLabel(row.community_role),
      row.course_or_area,
      getCategoryLabel(row.category),
      row.custom_category,
      row.title,
      row.description,
      row.expected_benefit,
      getStatusLabel(row.status),
      row.reviewed_at,
      row.archived_at,
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${headers.map(csvCell).join(",")}\r\n${lines.join("\r\n")}\r\n`;
}
