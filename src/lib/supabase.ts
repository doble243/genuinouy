import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as
  | string
  | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing VITE_SUPABASE_URL. Copy .env.example to .env and fill in your Supabase project URL.",
  );
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your anon public key.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
