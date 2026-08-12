/**
 * Tipos del dominio de reseñas de productos (tabla `product_reviews`).
 *
 * Campos opcionales (`title`, `body`, `size`, `photo_url`) se mapean desde la
 * base como `null` cuando no existen — la UI decide cómo renderizarlos
 * (chip de talle omitido, placeholder de foto, etc.).
 */

export type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number; // 1..5 (CHECK en base)
  title?: string | null;
  body?: string | null;
  size?: string | null;
  photo_url?: string | null;
  verified_purchase: boolean;
  approved: boolean;
  featured: boolean;
  sort_order: number;
  created_at?: string;
};

export type CreateReviewInput = {
  productId: string;
  customerName: string;
  rating: number;
  title?: string;
  body?: string;
  size?: string;
  photoUrl?: string;
  verifiedPurchase?: boolean;
  approved?: boolean;
  featured?: boolean;
  sortOrder?: number;
};

export type UpdateReviewInput = Partial<CreateReviewInput>;
