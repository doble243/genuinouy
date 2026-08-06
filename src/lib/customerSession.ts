import { supabase } from "./supabase";

/**
 * Customer session model (whatsapp-guest by default, magic-link upgraded).
 *
 * Resolves a customer row in public.customers by phone or email. Idempotent:
 * - looks up by phone first (Uruguay's local trust key)
 * - falls back to email lookup
 * - inserts a new customer if not found
 * - updates name/email if the existing record drifted
 *
 * Caches the resolved customer_id locally in localStorage so checkout/saved_carts
 * can correlate orders across sessions.
 */

export type CustomerType = "minorista" | "mayorista";
export type AuthMode = "guest" | "magic-link";

export type CustomerSnapshot = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  customerType: CustomerType;
  authMode: AuthMode;
  createdAt: string;
};

const STORAGE_KEY = "genuinos:customer:v1";

export function readCustomerSession(): CustomerSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.id) return null;
    return parsed as CustomerSnapshot;
  } catch {
    return null;
  }
}

export function writeCustomerSession(customer: CustomerSnapshot | null): void {
  if (typeof window === "undefined") return;
  try {
    if (customer) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearCustomerSession(): void {
  writeCustomerSession(null);
}

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  customer_type: CustomerType | null;
};

function rowToSnapshot(
  row: CustomerRow,
  name: string,
  email: string | undefined,
  authMode: AuthMode,
): CustomerSnapshot {
  return {
    id: row.id,
    name,
    phone: row.phone,
    email: email || row.email || undefined,
    customerType: (row.customer_type || "minorista") as CustomerType,
    authMode,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Resolves the customer_id given the basic contact info.
 *
 * Strategy:
 *   1. SELECT by phone (most common case for whatsapp-guest).
 *   2. If not found and email provided, SELECT by email.
 *   3. If still not found, INSERT as new row (customer_type = 'minorista'
 *      by default; admin upgrades to 'mayorista' from the panel).
 *   4. If found, UPDATE non-conflicting fields (name only; do not overwrite
 *      customer_type since admin controls that).
 */
export async function resolveCustomer(input: {
  name: string;
  phone: string;
  email?: string;
  authMode?: AuthMode;
}): Promise<CustomerSnapshot | null> {
  const authMode: AuthMode = input.authMode || "guest";
  const phone = (input.phone || "").trim();
  const name = (input.name || "").trim();
  const email = input.email?.trim() || undefined;

  if (!phone || !name) return null;

  let existing: CustomerRow | null = null;

  const byPhone = await supabase
    .from("customers")
    .select("id,name,phone,email,customer_type")
    .eq("phone", phone)
    .maybeSingle();

  if (!byPhone.error && byPhone.data) {
    existing = byPhone.data as CustomerRow;
  } else if (email) {
    const byEmail = await supabase
      .from("customers")
      .select("id,name,phone,email,customer_type")
      .eq("email", email)
      .maybeSingle();
    if (!byEmail.error && byEmail.data) {
      existing = byEmail.data as CustomerRow;
    }
  }

  if (existing) {
    if (existing.name !== name || (email && existing.email !== email)) {
      await supabase
        .from("customers")
        .update({ name, email: email || existing.email })
        .eq("id", existing.id);
    }
    return rowToSnapshot(existing, name, email, authMode);
  }

  const insert = await supabase
    .from("customers")
    .insert([
      {
        name,
        phone,
        email: email || null,
        customer_type: "minorista",
      },
    ])
    .select("id,name,phone,email,customer_type")
    .single();

  if (insert.error || !insert.data) {
    console.warn("[customerSession] create failed", insert.error);
    return null;
  }

  return rowToSnapshot(insert.data as CustomerRow, name, email, authMode);
}

/**
 * Look up an existing customer row by phone only (no resolution / creation).
 * Useful when the user is browsing and we just want to see if they've ordered before.
 */
export async function findCustomerByPhone(
  phone: string,
): Promise<CustomerSnapshot | null> {
  if (!phone) return null;
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,phone,email,customer_type")
    .eq("phone", phone)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as CustomerRow;
  return rowToSnapshot(row, row.name, row.email || undefined, "guest");
}

/**
 * Look up by auth user email (magic-link authenticated).
 * Returns null if no customer row matches (first-time auth user).
 */
export async function findCustomerByEmail(
  email: string,
): Promise<CustomerSnapshot | null> {
  if (!email) return null;
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,phone,email,customer_type")
    .eq("email", email)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as CustomerRow;
  return rowToSnapshot(row, row.name, row.email || undefined, "magic-link");
}

/**
 * Returns the active customer or null. Does NOT auto-resolve; if you need a
 * customer_id, call resolveCustomer() or sign-in flow explicitly.
 */
export function currentCustomer(): CustomerSnapshot | null {
  return readCustomerSession();
}
