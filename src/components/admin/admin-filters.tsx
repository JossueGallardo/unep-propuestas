import { Download, Filter, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { proposalCategories, proposalStatuses } from "@/lib/constants";
import type { AdminFilters } from "@/lib/admin/filters";

export function AdminFiltersForm({ filters }: { filters: AdminFilters }) {
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "page" && value && value !== "newest")
      exportParams.set(key, String(value));
  }

  return (
    <form method="get" className="border bg-white p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="search"
              name="search"
              defaultValue={filters.search}
              placeholder="Referencia, título o contenido"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          >
            <option value="">Todos</option>
            {proposalStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          >
            <option value="">Todas</option>
            {proposalCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="anonymous">Anonimato</Label>
          <select
            id="anonymous"
            name="anonymous"
            defaultValue={filters.anonymous}
            className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          >
            <option value="">Todas</option>
            <option value="yes">Anónimas</option>
            <option value="no">Con nombre</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">Hasta</Label>
          <Input id="to" name="to" type="date" defaultValue={filters.to} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Orden</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
        <Button type="submit">
          <Filter aria-hidden="true" />
          Aplicar filtros
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Limpiar</Link>
        </Button>
        <Button asChild variant="outline" className="sm:ml-auto">
          <Link href={`/admin/export.csv?${exportParams}`}>
            <Download aria-hidden="true" />
            Exportar CSV
          </Link>
        </Button>
      </div>
    </form>
  );
}
