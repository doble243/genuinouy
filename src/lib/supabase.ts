import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (browser).
 *
 * Bug-fixed 2026-08-06: previously we threw at module evaluation when env
 * vars were missing. That propagated to every importer (supabase, adminService,
 * customerSession, etc.) and React mounted with an empty root → white screen
 * on any deployment whose host did not yet have VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY set (e.g. fresh Vercel project).
 *
 * Now we lazily resolve and warn once. The module always loads successfully;
 * individual data calls fail with a clear message if env is missing, and the
 * storefront falls back to local data so the UI keeps rendering.
 */
let _client: SupabaseClient | null = null;
let _warned = false;

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL as
  | string
  | undefined;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = !!(envUrl && envKey);

function resolveSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!isSupabaseConfigured) {
    if (!_warned && typeof console !== "undefined") {
      console.warn(
        "[GENUINOS] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing. " +
          "Live data calls will fail; the UI uses local fallback where available. " +
          "Set the env vars in your host (e.g. Vercel → Project → Settings → Environment Variables) " +
          "and trigger a rebuild for full functionality.",
      );
      _warned = true;
    }
    throw new Error(
      "Supabase env not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing)",
    );
  }
  _client = createClient(envUrl!, envKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

/**
 * Lazy proxy. Accessing any property/method triggers `resolveSupabase()`,
 * which throws only at call time (not module load). This means React can
 * always mount the app, and consumers see clear failure messages instead of
 * a white screen.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const client = resolveSupabase();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
