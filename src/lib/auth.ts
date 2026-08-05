import { supabase } from "./supabase";

export type AuthUser = { id: string; email: string } | null;

/** Devuelve el usuario autenticado actual, o null si no hay sesión. */
export async function getAuthUser(): Promise<AuthUser> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? "" };
}

/** Verifica si el usuario autenticado tiene rol admin en la tabla profiles. */
export async function hasAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return data.role === "admin";
}

/** Inicia sesión y devuelve si el usuario es realmente admin. */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message || "No se pudo iniciar sesión.",
    };
  }

  const admin = await hasAdminRole(data.user.id);
  if (!admin) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Este usuario no tiene permisos de administrador.",
    };
  }

  return { ok: true };
}

/** Cierra la sesión actual. */
export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}