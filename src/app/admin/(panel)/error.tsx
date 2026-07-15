"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-site flex min-h-[60vh] items-center justify-center py-12">
      <div className="max-w-lg border bg-white p-8 text-center">
        <p className="text-kicker">Error temporal</p>
        <h1 className="mt-3 text-3xl">No pudimos cargar el panel.</h1>
        <p className="text-muted-foreground mt-4">
          Vuelve a intentarlo. Si el problema continúa, revisa la configuración
          del servicio.
        </p>
        <Button onClick={reset} className="mt-6">
          Reintentar
        </Button>
      </div>
    </main>
  );
}
