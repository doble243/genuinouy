import { supabase } from "./supabase";
import type {
  Review,
  CreateReviewInput,
  UpdateReviewInput,
} from "../types/reviews";

/**
 * Capa de datos para reseñas de productos (tabla `product_reviews`).
 * Espeja el estilo de `src/lib/heroService.ts`: llamadas directas a supabase,
 * mapeo DbRow → dominio y errores lanzados (throw on error).
 *
 * RLS: anon solo ve `approved = true`; el admin ve todo (profiles.role).
 */

export type DbReviewRow = {
  id: string;
  product_id?: string | null;
  customer_name?: string | null;
  rating?: number | null;
  title?: string | null;
  body?: string | null;
  size?: string | null;
  photo_url?: string | null;
  verified_purchase?: boolean | null;
  approved?: boolean | null;
  featured?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
};

/**
 * Mapea una fila de la base de datos Supabase al tipo Review de la UI.
 */
export function mapDbToReview(item: DbReviewRow): Review {
  return {
    id: String(item.id),
    product_id: String(item.product_id || ""),
    customer_name: item.customer_name || "",
    rating: Number(item.rating) || 1,
    title: item.title || null,
    body: item.body || null,
    size: item.size || null,
    photo_url: item.photo_url || null,
    verified_purchase: Boolean(item.verified_purchase),
    approved: Boolean(item.approved),
    featured: Boolean(item.featured),
    sort_order: Number(item.sort_order) || 0,
    created_at: item.created_at || undefined,
  };
}

/**
 * Reseñas aprobadas de un producto, para el storefront.
 * Solo `approved = true` (el RLS además lo garantiza). Orden: más recientes
 * primero.
 */
export async function fetchApprovedByProduct(
  productId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Error al obtener las reseñas del producto: ${error.message}`
    );
  }
  return (data || []).map(mapDbToReview);
}

/**
 * Reseñas aprobadas y destacadas, para el carrusel de la home.
 * Orden: `sort_order` asc con `created_at` desc como tiebreak.
 */
export async function fetchFeaturedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("approved", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Error al obtener las reseñas destacadas: ${error.message}`
    );
  }
  return (data || []).map(mapDbToReview);
}

/**
 * Todas las reseñas (admin ve todas, incluidas pendientes). El panel admin
 * ordena igual que el carrusel para que el reorden ▲/▼ sea predecible.
 */
export async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener las reseñas: ${error.message}`);
  }
  return (data || []).map(mapDbToReview);
}

/**
 * Crea una reseña. `sort_order` por defecto = máximo actual + 1
 * (mismo patrón que heroService).
 */
export async function createReview(
  input: CreateReviewInput
): Promise<Review> {
  const { data: orderRows, error: orderErr } = await supabase
    .from("product_reviews")
    .select("sort_order");

  if (orderErr) {
    throw new Error(`Error al crear la reseña: ${orderErr.message}`);
  }
  const maxOrder = (orderRows || []).reduce(
    (max, row) => Math.max(max, Number(row.sort_order) || 0),
    0
  );

  const dbPayload = {
    product_id: input.productId,
    customer_name: input.customerName,
    rating: input.rating,
    title: input.title || null,
    body: input.body || null,
    size: input.size || null,
    photo_url: input.photoUrl || null,
    verified_purchase:
      input.verifiedPurchase !== undefined ? input.verifiedPurchase : false,
    approved: input.approved !== undefined ? input.approved : false,
    featured: input.featured !== undefined ? input.featured : false,
    sort_order: input.sortOrder !== undefined ? input.sortOrder : maxOrder + 1,
  };

  const { data, error } = await supabase
    .from("product_reviews")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear la reseña: ${error.message}`);
  }
  if (!data) {
    throw new Error("No se obtuvieron datos tras crear la reseña.");
  }

  return mapDbToReview(data);
}

/**
 * Actualiza una reseña existente por su ID (acepta `sortOrder` para reordenar).
 */
export async function updateReview(
  id: string,
  input: UpdateReviewInput
): Promise<Review> {
  const dbPayload: Record<string, any> = {};

  if (input.productId !== undefined) dbPayload.product_id = input.productId;
  if (input.customerName !== undefined)
    dbPayload.customer_name = input.customerName;
  if (input.rating !== undefined) dbPayload.rating = input.rating;
  if (input.title !== undefined) dbPayload.title = input.title || null;
  if (input.body !== undefined) dbPayload.body = input.body || null;
  if (input.size !== undefined) dbPayload.size = input.size || null;
  if (input.photoUrl !== undefined) dbPayload.photo_url = input.photoUrl || null;
  if (input.verifiedPurchase !== undefined)
    dbPayload.verified_purchase = input.verifiedPurchase;
  if (input.approved !== undefined) dbPayload.approved = input.approved;
  if (input.featured !== undefined) dbPayload.featured = input.featured;
  if (input.sortOrder !== undefined) dbPayload.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from("product_reviews")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar la reseña: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No se encontró la reseña con ID ${id}.`);
  }

  return mapDbToReview(data);
}

/**
 * Elimina una reseña por su ID.
 */
export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) {
    throw new Error(`Error al eliminar la reseña: ${error.message}`);
  }
}

/**
 * Atajo para aprobar / desaprobar una reseña (gate de visibilidad en storefront).
 */
export async function setReviewApproved(
  id: string,
  approved: boolean
): Promise<Review> {
  return updateReview(id, { approved });
}

/**
 * Atajo para marcar / desmarcar una reseña como destacada (carrusel de home).
 */
export async function setReviewFeatured(
  id: string,
  featured: boolean
): Promise<Review> {
  return updateReview(id, { featured });
}
