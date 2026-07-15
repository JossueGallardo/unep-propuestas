"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string };

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Las credenciales no son correctas." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene acceso administrativo." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function updateStatus(
  formData: FormData,
  status: "revisada" | "archivada",
) {
  const id = String(formData.get("id") ?? "");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    throw new Error("Identificador de propuesta no válido.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("proposals")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error("No se pudo actualizar el estado de la propuesta.");
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/propuestas/${id}`);
}

export async function markReviewedAction(formData: FormData) {
  await updateStatus(formData, "revisada");
}

export async function archiveAction(formData: FormData) {
  await updateStatus(formData, "archivada");
}
