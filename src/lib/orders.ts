import { supabase } from "./supabase";
import {
  resolveCustomer,
  type CustomerSnapshot,
} from "./customerSession";

/**
 * Order creation service.
 *
 * IMPORTANT: never trust prices from the client. We re-fetch every product
 * from the database, recompute unit_price * quantity, and only insert the
 * canonical numbers into the order. The customer-controlled CartLine
 * (price from render time) is used for display only.
 *
 * Flow:
 *   1. resolveCustomer() — phone-first, email fallback, create-if-missing.
 *   2. Re-fetch products by id; reject if any product went out of stock or
 *      amount requested exceeds available_quantity.
 *   3. Insert orders row with denormalized customer snapshot
 *      (id is FK, name/phone/email/address are snapshots that survive
 *       even if customer data changes later — required for historical
 *       accuracy).
 *   4. Insert order_items rows with subtotal = quantity * unit_price.
 *
 * The trigger trg_orders_assign_number generates order_number = 'GEN-YYYYMMDD-NNNN'.
 */

export type CartLineInput = {
  productId: string;
  quantity: number;
  unitType?: string;
  variant?: {
    id: string;
    label: string;
    image?: string;
  };
};

export type SubmitOrderInput = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  };
  lines: CartLineInput[];
  shippingNotes?: string;
};

export type SubmitOrderResult = {
  ok: boolean;
  orderId?: string;
  orderNumber?: string;
  customer?: CustomerSnapshot;
  total?: number;
  error?: string;
};

type DbProductSlice = {
  id: string;
  name: string;
  price: number;
  in_stock: boolean | null;
  available_quantity: number | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function submitOrder(
  input: SubmitOrderInput,
): Promise<SubmitOrderResult> {
  // 1. Resolve / create customer (whatsapp-guest or magic-link, both work)
  const customer = await resolveCustomer({
    name: input.customer.name,
    phone: input.customer.phone,
    email: input.customer.email,
  });
  if (!customer) {
    return { ok: false, error: "No pudimos identificar al cliente." };
  }

  // 2. Validate lines
  const lines = (input.lines || []).filter(
    (l) => l.productId && l.quantity && l.quantity > 0,
  );
  if (lines.length === 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  const productIds = [...new Set(lines.map((l) => l.productId))];
  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select("id,name,price,in_stock,available_quantity")
    .in("id", productIds);

  if (productsErr) {
    return {
      ok: false,
      error: `No pudimos validar los productos (${productsErr.message})`,
    };
  }
  if (!products || products.length === 0) {
    return { ok: false, error: "Los productos del carrito ya no están disponibles." };
  }

  const byId = new Map((products as DbProductSlice[]).map((p) => [p.id, p]));
  type ValidatedLine = {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unitType: string;
    productVariantId: string | null;
    variantLabel: string | null;
    variantImage: string | null;
  };

  const validated: ValidatedLine[] = [];
  let total = 0;

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product) {
      return {
        ok: false,
        error: `Uno de los productos ya no está disponible.`,
      };
    }
    if (product.in_stock === false) {
      return { ok: false, error: `Sin stock: ${product.name}` };
    }
    if (
      product.available_quantity != null &&
      product.available_quantity < line.quantity
    ) {
      return {
        ok: false,
        error: `Stock insuficiente para ${product.name} (disponible: ${product.available_quantity})`,
      };
    }

    const quantity = Math.max(1, Math.floor(line.quantity));
    const unitPrice = Number(product.price) || 0;
    const subtotal = round2(quantity * unitPrice);

    validated.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      subtotal,
      unitType: line.unitType || "unidad",
      productVariantId: line.variant?.id ?? null,
      variantLabel: line.variant?.label ?? null,
      variantImage: line.variant?.image ?? null,
    });
    total = round2(total + subtotal);
  }

  // 3. Insert order (denormalized customer snapshot + legacy columns for
  //    backward compatibility with the existing schema)
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        customer_address: input.customer.address || null,
        // legacy columns that existed in the schema pre-migration
        phone: customer.phone,
        address: input.customer.address || null,
        city: "Montevideo",
        total_amount: total,
        // status left to DB default ("pending")
        notes: input.shippingNotes || input.customer.notes || null,
      },
    ])
    .select("id,order_number,status")
    .single();

  if (orderErr || !order) {
    return {
      ok: false,
      error: orderErr?.message || "No se pudo registrar la orden.",
    };
  }

  // 4. Insert order_items
  const items = validated.map((v) => ({
    order_id: order.id,
    product_id: v.productId,
    product_name: v.productName,
    quantity: v.quantity,
    unit_price: v.unitPrice,
    subtotal: v.subtotal,
    unit_type: v.unitType,
    // Variant snapshot — all null when order has no variants
    product_variant_id: v.productVariantId,
    variant_label: v.variantLabel,
    variant_image: v.variantImage,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(items);

  if (itemsErr) {
    return {
      ok: false,
      error: itemsErr.message,
      orderId: order.id,
    };
  }

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    customer,
    total,
  };
}

/**
 * Admin: list orders with a filter (status / recent).
 * Used by the admin panel.
 */
export type AdminOrderRow = {
  id: string;
  order_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  notes: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export async function listAdminOrders(filter?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<AdminOrderRow[]> {
  let q = supabase
    .from("orders")
    .select(
      "id,order_number,customer_id,customer_name,customer_phone,customer_email,customer_address,notes,status,total_amount,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (filter?.status) q = q.eq("status", filter.status);
  if (filter?.fromDate) q = q.gte("created_at", filter.fromDate);
  if (filter?.toDate) q = q.lte("created_at", filter.toDate);
  if (filter?.limit) q = q.limit(filter.limit);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as AdminOrderRow[];
}

/**
 * Admin: list items of an order (for the detail panel).
 */
export type AdminOrderItem = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  unit_type: string | null;
  product_variant_id: string | null;
  variant_label: string | null;
  variant_image: string | null;
  created_at: string;
};

export async function listAdminOrderItems(
  orderId: string,
): Promise<AdminOrderItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id,product_id,product_name,quantity,unit_price,subtotal,unit_type,product_variant_id,variant_label,variant_image,created_at",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as AdminOrderItem[];
}

// Allow-listed statuses to update (DB side may have a CHECK we don't know;
// these were observed working with default 'pending'). Admin can manually
// change via SQL if a status not in this list is needed.
const VALID_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(
  orderId: string,
  nextStatus: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!VALID_STATUSES.includes(nextStatus as OrderStatus)) {
    return { ok: false, error: `Estado inválido: ${nextStatus}` };
  }
  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
