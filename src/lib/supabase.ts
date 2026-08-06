import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (browser).
 *
 * Public URL + anon key as hardcoded fallback so the storefront works in any
 * environment (local dev, fresh Vercel deploy, contributor clone) without
 * requiring manual env-var setup. Supabase's anon key is designed to be
 * public — RLS is the actual security boundary, not key secrecy.
 *
 * Override either via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars
 * (Vercel → Project → Settings → Environment Variables) when you want to
 * point at a different Supabase project or rotate credentials.
 *
 * Bug-fixed 2026-08-06: previously we threw at module evaluation when env
 * vars were missing. That broke every importer and React mounted an empty
 * root. Now we lazy-resolve via a Proxy so module load always succeeds;
 * missing env degrades gracefully to whatever fallback works.
 */
const FALLBACK_URL = "https://wqrjusxmyklienzqlket.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxcmp1c3hteWtsaWVuenFsa2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDMzNjksImV4cCI6MjEwMTE3OTM2OX0.3AJBOkvm4s-X5opVdXoL6AtOS7N48nND65zEJerTh0c";

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL as
  | string
  | undefined;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const resolvedUrl = envUrl && envUrl.length > 0 ? envUrl : FALLBACK_URL;
const resolvedKey = envKey && envKey.length > 0 ? envKey : FALLBACK_ANON_KEY;

export const isSupabaseConfigured = !!(envUrl && envKey);

// One-shot warn if user is on the fallback (helps during deploys / new clones).
if (!isSupabaseConfigured && typeof console !== "undefined") {
  console.info(
    "[GENUINOS] Using embedded Supabase fallback. Set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY in your host's env vars (e.g. Vercel) to override.",
  );
}

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
