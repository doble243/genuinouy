import { supabase } from "./supabase";
import type { AdminOrderRow } from "./orders";

/**
 * Self-service account queries for the /#cuenta view.
 *
 * Customers come back and want to see their order history. We use phone as
 * the local identity key (UR: WhatsApp-first culture). If the user opted
 * into magic-link, we also resolve by email.
 *
 * Note: phone variants are tried because customers enter the same number in
 * multiple formats (+598 9xx / +5989xx / 598xxx...).
 */

export type PhoneVariant = "+59891400100" | "+598 914 00 100";

function phoneVariants(raw: string): string[] {
  const out = new Set<string>();
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (!digits) return [];
  out.add(digits);
  if (digits.startsWith("598")) {
    out.add("+" + digits);
  } else {
    out.add("598" + digits);
    out.add("+598" + digits);
  }
  return Array.from(out);
}

export async function listOrdersByPhone(
  phone: string,
): Promise<AdminOrderRow[]> {
  const variants = phoneVariants(phone);
  if (!variants.length) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_id,customer_name,customer_phone,customer_email,customer_address,notes,status,total_amount,created_at,updated_at",
    )
    .in("customer_phone", variants)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as AdminOrderRow[];
}

export async function listOrdersByCustomerId(
  customerId: string,
): Promise<AdminOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_id,customer_name,customer_phone,customer_email,customer_address,notes,status,total_amount,created_at,updated_at",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as AdminOrderRow[];
}
