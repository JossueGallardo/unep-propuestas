import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main
      id="contenido"
      className="bg-secondary flex min-h-screen items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md border bg-white p-7 shadow-[0_18px_60px_rgba(33,27,27,0.08)] sm:p-10">
        <div className="flex items-center justify-between border-b pb-6">
          <Image
            src="/brand/logo.jpeg"
            alt="UNEP"
            width={64}
            height={64}
            className="size-16 object-cover"
            priority
          />
          <LockKeyhole className="text-brand size-6" aria-hidden="true" />
        </div>
        <p className="text-kicker mt-7">Área restringida</p>
        <h1 className="mt-2 text-4xl">Administración</h1>
        <p className="text-muted-foreground mt-3 leading-6">
          Accede con la cuenta autorizada por UNEP. No existe registro público.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
