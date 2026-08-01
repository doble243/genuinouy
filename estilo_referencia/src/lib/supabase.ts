import { createClient } from "@supabase/supabase-js";

const meta = import.meta as unknown as { env?: Record<string, string> };

const SUPABASE_URL =
  meta.env?.VITE_SUPABASE_URL ||
  "https://wqrjusxmyklienzqlket.supabase.co";

const SUPABASE_ANON_KEY =
  meta.env?.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxcmp1c3hteWtsaWVuenFsa2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDMzNjksImV4cCI6MjEwMTE3OTM2OX0.3AJBOkvm4s-X5opVdXoL6AtOS7N48nND65zEJerTh0c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
