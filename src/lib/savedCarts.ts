import { supabase } from "./supabase";

/**
 * Saved carts persistence — lets the customer park the current cart under
 * a name and resume it later, without losing items between visits.
 */

export type SavedCartLine = {
  productId: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  productPrice: number;
  size: string;
  qty: number;
};

export type SavedCart = {
  id: string;
  customer_id: string | null;
  name: string;
  items: SavedCartLine[];
  created_at: string;
  updated_at: string;
};

export type SaveResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

export async function listSavedCarts(
  customerId: string | null,
): Promise<SavedCart[]> {
  let q = supabase
    .from("saved_carts")
    .select("id,customer_id,name,items,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (customerId) q = q.eq("customer_id", customerId);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as SavedCart[]).map((row) => ({
    ...row,
    items: Array.isArray(row.items) ? (row.items as SavedCartLine[]) : [],
  }));
}

export async function saveCart(
  customerId: string | null,
  name: string,
  lines: SavedCartLine[],
): Promise<SaveResult> {
  const cleanedName = (name || "").trim();
  if (!cleanedName) return { ok: false, error: "Ponele un nombre al carrito." };
  if (!lines || lines.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }
  const { data, error } = await supabase
    .from("saved_carts")
    .insert([
      {
        customer_id: customerId,
        name: cleanedName,
        items: lines,
      },
    ])
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message || "No pudimos guardar el carrito." };
  }
  return { ok: true, id: data.id };
}

export async function deleteSavedCart(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("saved_carts")
    .delete()
    .eq("id", id);
  return !error;
}
