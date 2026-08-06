import { supabase } from "./supabase";

/**
 * Customer-side authentication: magic-link via Supabase Auth.
 *
 * Uses the project's anonymous auth audience. The customer's `auth.users`
 * row is independent of the `customers` table (we treat them as parallel
 * records; resolution happens in customerSession.resolveCustomer()).
 *
 * Sharing the same supabase client with admin auth means there's only ever
 * one auth.session at a time per browser. For MVP this is acceptable:
 * the storefront and admin are distinct URLs (#admin vs /checkout) so
 * cross-contamination is unlikely in practice.
 */

export type MagicLinkResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Sends a magic link to the given email. The browser then receives a
 * redirect that lands at /cuenta (configured below).
 */
export async function sendCustomerMagicLink(
  email: string,
  options?: { redirectTo?: string },
): Promise<MagicLinkResult> {
  const trimmed = (email || "").trim();
  if (!trimmed) return { ok: false, error: "Ingresá un email válido." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "El formato del email no es válido." };
  }
  const redirectTo =
    options?.redirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/?cuenta=1`
      : undefined);

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    message: "Te enviamos un link al mail. Revisá tu bandeja (y spam).",
  };
}

/** Get the current authenticated customer email, or null if not signed in. */
export async function getCustomerAuthEmail(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email ?? null;
}

/** Sign out the current customer (clears Supabase auth session). */
export async function signOutCustomer(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Subscribe to auth state changes (e.g. magic-link landing).
 * Returns the unsubscribe function.
 */
export function onCustomerAuthChange(
  cb: (email: string | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}

/**
 * After a magic-link login, attempt to bind the auth user to a customer row.
 * If a customer with the matching email already exists, return that snapshot.
 * Otherwise the caller should treat the auth user as a brand-new customer
 * and gather name/phone via the checkout form (resolveCustomer handles that).
 */
export async function bindAuthToCustomer(): Promise<string | null> {
  const email = await getCustomerAuthEmail();
  if (!email) return null;
  const { findCustomerByEmail } = await import("./customerSession");
  const existing = await findCustomerByEmail(email);
  return existing?.id ?? null;
}
