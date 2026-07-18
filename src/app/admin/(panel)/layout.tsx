import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="bg-secondary min-h-screen">
      <header className="border-b bg-white">
        <div className="container-site flex h-20 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            <Image
              src="/brand/logo.jpeg"
              alt=""
              width={44}
              height={44}
              className="size-11 object-cover"
            />
            <span>
              UNEP{" "}
              <span className="text-muted-foreground hidden font-normal sm:inline">
                / Propuestas
              </span>
            </span>
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" aria-label="Cerrar sesión">
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
