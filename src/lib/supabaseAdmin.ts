/**
 * Server-only Supabase client with the service_role key.
 *
 * DO NOT IMPORT THIS FILE FROM A REACT/VITE COMPONENT.
 * - Vite only embeds `import.meta.env.VITE_*` variables in the client bundle.
 * - `SUPABASE_SERVICE_ROLE_KEY` has no `VITE_` prefix, so this file becomes a
 *   no-op in the browser: `supabaseAdmin` is `null` and any caller crashes
 *   loudly if it tries to use it from a component.
 * - Use this only from Edge Functions, webhooks, or Node scripts that run
 *   outside the user's browser.
 *
 * If you need to bypass RLS for an admin-only operation, call this from an
 * Edge Function — never from the storefront.
 */
const SUPABASE_URL = process?.env?.VITE_SUPABASE_URL ?? process?.env?.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process?.env?.SUPABASE_SERVICE_ROLE_KEY;

function makeAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  // Lazy-load to avoid bundling supabase-js in a second instance for the
  // browser. The dynamic import is intentional.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@supabase/supabase-js");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin: ReturnType<typeof makeAdminClient> =
  typeof window === "undefined" ? makeAdminClient() : null;
