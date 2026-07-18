import {
  proposalCategories,
  proposalStatuses,
  type ProposalCategory,
  type ProposalStatus,
} from "@/lib/constants";

export const ADMIN_PAGE_SIZE = 25;
export const MAX_CSV_ROWS = 10_000;

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year!, month! - 1, day!));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month! - 1 &&
    parsed.getUTCDate() === day
    ? value
    : "";
}

export function parseAdminFilters(params: SearchParams) {
  const categoryValue = first(params.category) ?? "";
  const statusValue = first(params.status) ?? "";
  const anonymousValue = first(params.anonymous) ?? "";
  const sortValue = first(params.sort) === "oldest" ? "oldest" : "newest";
  const rawPage = Number(first(params.page) ?? "1");

  return {
    search: (first(params.search) ?? "").trim().slice(0, 120),
    category: proposalCategories.some((item) => item.value === categoryValue)
      ? (categoryValue as ProposalCategory)
      : "",
    status: proposalStatuses.some((item) => item.value === statusValue)
      ? (statusValue as ProposalStatus)
      : "",
    anonymous:
      anonymousValue === "yes" ? "yes" : anonymousValue === "no" ? "no" : "",
    from: validDate(first(params.from)),
    to: validDate(first(params.to)),
    sort: sortValue,
    page:
      Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100_000) : 1,
  } as const;
}

export type AdminFilters = ReturnType<typeof parseAdminFilters>;

type ProposalFilterQuery<T> = {
  textSearch: (
    column: string,
    query: string,
    options: { type: "websearch"; config: "spanish" },
  ) => T;
  eq: (column: string, value: string | boolean) => T;
  gte: (column: string, value: string) => T;
  lte: (column: string, value: string) => T;
  order: (column: string, options: { ascending: boolean }) => T;
};

export function applyProposalFilters<T extends ProposalFilterQuery<T>>(
  query: T,
  filters: AdminFilters,
): T {
  let next = query;
  if (filters.search) {
    next = next.textSearch("search_document", filters.search, {
      type: "websearch",
      config: "spanish",
    });
  }
  if (filters.category) next = next.eq("category", filters.category);
  if (filters.status) next = next.eq("status", filters.status);
  if (filters.anonymous)
    next = next.eq("is_anonymous", filters.anonymous === "yes");
  if (filters.from)
    next = next.gte("created_at", `${filters.from}T00:00:00-05:00`);
  if (filters.to)
    next = next.lte("created_at", `${filters.to}T23:59:59.999-05:00`);
  return next.order("created_at", {
    ascending: filters.sort === "oldest",
  });
}

export function filtersToSearchParams(
  filters: AdminFilters,
  overrides: Record<string, string> = {},
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.anonymous) params.set("anonymous", filters.anonymous);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  for (const [key, value] of Object.entries(overrides)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params.toString();
}
