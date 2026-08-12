import { supabase } from "./supabase";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  active: boolean;
  min_purchase?: number;
  created_at?: string;
}

// Cupones de reserva por defecto si Supabase aún no tiene la tabla
const FALLBACK_COUPONS: Record<string, Omit<Coupon, "id">> = {
  GENUINOS10: {
    code: "GENUINOS10",
    discount_type: "percentage",
    discount_value: 10,
    active: true,
  },
  GENUINOS15: {
    code: "GENUINOS15",
    discount_type: "percentage",
    discount_value: 15,
    active: true,
  },
  BIENVENIDA: {
    code: "BIENVENIDA",
    discount_type: "fixed",
    discount_value: 500,
    active: true,
  },
};

export async function validateCoupon(codeRaw: string): Promise<{
  ok: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Ingresá un código de cupón" };

  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .single();

    if (!error && data) {
      return { ok: true, coupon: data as Coupon };
    }
  } catch (err) {
    console.warn("[GENUINOS] Supabase coupons fetch fallback:", err);
  }

  // Fallback local
  const fb = FALLBACK_COUPONS[code];
  if (fb && fb.active) {
    return {
      ok: true,
      coupon: {
        id: `fb-${code}`,
        ...fb,
      },
    };
  }

  return { ok: false, error: "Código de cupón inválido o expirado" };
}

export function calculateDiscount(total: number, coupon: Coupon | null): number {
  if (!coupon || !coupon.active) return 0;
  if (coupon.min_purchase && total < coupon.min_purchase) return 0;

  if (coupon.discount_type === "percentage") {
    return Math.round((total * coupon.discount_value) / 100);
  }
  if (coupon.discount_type === "fixed") {
    return Math.min(total, coupon.discount_value);
  }
  return 0;
}

export async function listAdminCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data as Coupon[];
  } catch {
    /* fallback below */
  }

  return Object.entries(FALLBACK_COUPONS).map(([code, c]) => ({
    id: `fb-${code}`,
    ...c,
  }));
}

export async function saveAdminCoupon(
  coupon: Omit<Coupon, "id"> & { id?: string }
): Promise<Coupon> {
  try {
    const payload = {
      code: coupon.code.toUpperCase().trim(),
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      active: coupon.active,
      min_purchase: coupon.min_purchase ? Number(coupon.min_purchase) : null,
    };

    // Los ids "fb-" son fallbacks locales (no existen en la DB). En lugar de
    // insertar a ciegas, buscamos por código: si el cupón ya existe en la DB
    // (materializado en una sesión anterior) lo actualizamos; si no, lo
    // insertamos. Así el fallback se materializa con un id real al editarlo
    // y la edición persiste entre sesiones.
    if (coupon.id && !coupon.id.startsWith("fb-")) {
      const { data, error } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", coupon.id)
        .select()
        .single();
      if (!error && data) return data as Coupon;
    } else {
      const { data: existing, error: findErr } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", payload.code)
        .maybeSingle();

      if (!findErr && existing) {
        // El cupón con ese código ya está en la DB. Solo lo actualizamos si
        // es el mismo cupón que estamos editando (o si no veníamos editando
        // uno con id propio, ej. creación con código existente).
        if (coupon.id && existing.id !== coupon.id) {
          // Renombrar un cupón a un código que ya ocupa otro cupón: no
          // mutamos la fila ajena; dejamos que el flujo inserte y falle
          // (o degrade) como antes.
          throw new Error("Código de cupón ya existe");
        }
        const { data, error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
        if (!error && data) return data as Coupon;
      } else {
        const { data, error } = await supabase
          .from("coupons")
          .insert(payload)
          .select()
          .single();
        if (!error && data) return data as Coupon;
      }
    }
  } catch (err) {
    console.warn("[GENUINOS] Failed saving coupon in DB:", err);
  }

  return {
    id: coupon.id || `coupon-${Date.now()}`,
    code: coupon.code.toUpperCase().trim(),
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.discount_value),
    active: coupon.active,
  };
}
