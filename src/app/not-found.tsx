import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="contenido"
      className="container-site flex min-h-screen items-center py-16"
    >
      <div className="border-l-brand max-w-2xl border-l-4 pl-7">
        <p className="text-kicker">Error 404</p>
        <h1 className="mt-3 text-5xl">Esta página no existe.</h1>
        <p className="text-muted-foreground mt-5 text-lg">
          La dirección puede haber cambiado o estar escrita de forma incorrecta.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
