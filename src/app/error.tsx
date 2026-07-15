"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);

  return (
    <main
      id="contenido"
      className="container-site flex min-h-[70vh] items-center py-16"
    >
      <div className="border-l-brand max-w-2xl border-l-4 pl-7">
        <p className="text-kicker">Algo salió mal</p>
        <h1 className="mt-3 text-4xl">No pudimos cargar esta página.</h1>
        <p className="text-muted-foreground mt-4">
          Puedes intentarlo nuevamente. Si el problema continúa, vuelve más
          tarde.
        </p>
        <Button type="button" className="mt-7" onClick={reset}>
          Intentar de nuevo
        </Button>
      </div>
    </main>
  );
}
