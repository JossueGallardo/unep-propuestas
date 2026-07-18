import { describe, expect, it } from "vitest";

import { csvCell, proposalsToCsv } from "@/lib/admin/csv";
import { filtersToSearchParams, parseAdminFilters } from "@/lib/admin/filters";
import { hashClientIdentifier } from "@/lib/security/request";
import type { ProposalRow } from "@/lib/supabase/types";

describe("identificador HMAC", () => {
  it("es determinista, irreversible en la salida y de 64 hexadecimales", () => {
    const value = hashClientIdentifier("203.0.113.42", "secreto");
    expect(value).toMatch(/^[a-f0-9]{64}$/);
    expect(value).toBe(hashClientIdentifier("203.0.113.42", "secreto"));
    expect(value).not.toContain("203.0.113.42");
    expect(value).not.toBe(hashClientIdentifier("203.0.113.43", "secreto"));
  });
});

describe("filtros administrativos", () => {
  it("acepta valores permitidos y sanea el resto", () => {
    expect(
      parseAdminFilters({
        status: "nueva",
        category: "academico",
        anonymous: "yes",
        sort: "oldest",
        page: "2",
        search: "  biblioteca  ",
      }),
    ).toMatchObject({
      status: "nueva",
      category: "academico",
      anonymous: "yes",
      sort: "oldest",
      page: 2,
      search: "biblioteca",
    });
    expect(
      parseAdminFilters({
        status: "hack",
        category: "hack",
        page: "-4",
        from: "2026-02-31",
        to: "14/07/2026",
      }),
    ).toMatchObject({
      status: "",
      category: "",
      page: 1,
      from: "",
      to: "",
    });
  });

  it("conserva filtros al paginar", () => {
    const filters = parseAdminFilters({ search: "patio", status: "revisada" });
    const params = new URLSearchParams(
      filtersToSearchParams(filters, { page: "3" }),
    );
    expect(params.get("search")).toBe("patio");
    expect(params.get("status")).toBe("revisada");
    expect(params.get("page")).toBe("3");
  });
});

describe("CSV", () => {
  it("escapa comillas y neutraliza fórmulas", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell('texto "citado"')).toBe('"texto ""citado"""');
  });

  it("incluye BOM UTF-8 y una fila completa", () => {
    const row: ProposalRow = {
      id: "00000000-0000-4000-8000-000000000001",
      reference_code: "UNEP-ABCDEF123456",
      is_anonymous: true,
      submitter_name: null,
      community_role: "estudiante",
      course_or_area: "Tercero A",
      category: "academico",
      custom_category: null,
      title: "Una propuesta",
      description: "Descripción suficientemente extensa",
      expected_benefit: null,
      status: "nueva",
      created_at: "2026-07-14T12:00:00Z",
      reviewed_at: null,
      archived_at: null,
      search_document: null,
    };
    const csv = proposalsToCsv([row]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("UNEP-ABCDEF123456");
    expect(csv).toContain('"Sí"');
    expect(csv.endsWith("\r\n")).toBe(true);
  });
});
