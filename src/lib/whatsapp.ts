import type { AdminOrderItem } from "./orders";

/**
 * WhatsApp deep-link helpers. All produce `https://wa.me/<digits>?text=<msg>`.
 * `<digits>` is the phone with all non-digit characters stripped (the `?text`
 * param carries the pre-filled first message WhatsApp opens).
 */

const STATUS_LABEL: Record<string, string> = {
  pending: "Nuevo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_LINES: Record<string, string> = {
  pending:
    "estamos consultando stock de tu pedido y te avisaremos a la brevedad con la confirmación. ¡Gracias por elegir GENUINOS!",
  confirmed:
    "lo confirmamos y entró a preparación. ¿Coordinamos entrega y pago ahora? Te avisamos cuando salga a reparto.",
  preparing:
    "lo estamos armando. Te avisamos cuando esté listo para enviar.",
  shipped:
    "ya va en camino a tu dirección con el seguimiento correspondiente.",
  delivered:
    "ya fue entregado. ¡Gracias por confiar en GENUINOS! Si quedó alguna duda o querés hacer cambio de talle, escribinos sin problema.",
  cancelled:
    "tuvo un cambio. Escribinos para que veamos opciones y ayudarte a encontrar algo que te encaje.",
};

/**
 * Normalize a Uruguayan phone number to the digits-only E.164-ish format
 * WhatsApp expects in `wa.me/<digits>` URLs.
 *
 * Uruguay mobile convention is to write the leading 0 when dialing locally
 * (e.g. `091 234 567`), but the international form — what WhatsApp matches
 * against — is `+598 9XX XXX XXX` (no leading 0, country code 598 first).
 *
 * Behavior:
 *   ""                          → ""
 *   "091234567"                 → "59891234567"   (strip leading 0, add 598)
 *   "0 9 1234 5678"             → "598912345678"  (spaces stripped, 0 dropped)
 *   "59899123456"               → "59899123456"   (already has prefix, kept)
 *   "+598 99 123 456"           → "59899123456"   (clean formatting)
 *   "991234567"                 → "598991234567"  (no prefix → prepend 598)
 *
 * Detection rule: if the digit string starts with "598" and is at least 11
 * digits long (mobile = 12, landline = 11), it's already in international
 * format and we keep it as-is. Otherwise we drop leading zeros and prepend
 * "598".
 */
export function normalizeUruguayPhone(
  raw: string | null | undefined,
): string {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("598") && d.length >= 11) return d;
  const stripped = d.replace(/^0+/, "");
  return "598" + stripped;
}

function waUrl(phone: string | null | undefined, text: string): string | null {
  const p = normalizeUruguayPhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

/**
 * Customer-facing message (used in /cuenta). Generic template — the customer
 * is asking, so we don't presume a status.
 */
export function customerWhatsappUrl(
  phone: string | null | undefined,
  orderNumber: string,
): string | null {
  const text = `Hola! Quiero saber sobre mi pedido ${orderNumber} en GENUINOS.`;
  return waUrl(phone, text);
}

/**
 * Generic admin→customer / customer→admin opener when there is NO order
 * context (e.g. admin looking at the customer list, or a follow-up after
 * the order is delivered). Always includes a greeting + the brand name so
 * the customer knows who is contacting them.
 */
export function genericWhatsappUrl(
  phone: string | null | undefined,
  customerName?: string | null,
  hint?: string,
): string | null {
  const firstName = (customerName || "").trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola ${firstName}, ` : "Hola, ";
  const tail = hint
    ? ` ${hint}`
    : " ¿Te podemos ayudar con algo?";
  const text = `${greeting}te escribimos de GENUINOS.${tail}`;
  return waUrl(phone, text);
}

/** Alias kept for readability in the customer-list surfaces. */
export const customerAccountWhatsappUrl = genericWhatsappUrl;

/**
 * Admin-facing message tailored to the order's current status. Includes the
 * customer's first name (when available) and a status-specific line that
 * tells them where the order stands + what the next step is.
 */
export function adminWhatsappUrl(
  phone: string | null | undefined,
  orderNumber: string,
  status: string,
  customerName?: string | null,
): string | null {
  const statusLabel = STATUS_LABEL[status] || status;
  const statusLine = STATUS_LINES[status] ||
    "estamos siguiendo tu pedido. Cualquier consulta, acá estamos.";
  const firstName = (customerName || "").trim().split(/\s+/)[0];
  const greeting = firstName
    ? `Hola ${firstName}, `
    : "Hola, ";
  const text = `${greeting}te escribimos de GENUINOS por tu pedido ${orderNumber} (estado: ${statusLabel}). ${statusLine.charAt(0).toUpperCase()}${statusLine.slice(1)}`;
  return waUrl(phone, text);
}

/**
 * Compact variant thumbnail resolver: prefers the variant-specific photo
 * captured at order time (`variant_image`), falls back to the product's
 * primary image (looked up via the in-memory product cache).
 */
export function variantThumb(
  item: Pick<AdminOrderItem, "variant_image" | "product_id">,
  productImage?: string | null,
): string | null {
  if (item.variant_image) return item.variant_image;
  if (productImage) return productImage;
  return null;
}
