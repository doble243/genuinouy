import type { AdminProduct } from "../types/admin";
import type { Product } from "./data";

/**
 * Maps a store Product (Supabase-shaped) to the AdminProduct shape used by
 * the admin UI. Kept as a pure function so the AdminPanel preservation bug
 * (variants being silently dropped on edit) is reproducible from a unit
 * test — see tests/admin-product-mapper.test.ts.
 *
 * All fallbacks intentionally mirror the original inline mapping in
 * src/components/admin/AdminPanel.tsx so behavior is preserved when the
 * AdminPanel swaps to this helper.
 */
export function mapProductToAdminProduct(
  product: Product,
  index: number,
): AdminProduct {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    price: product.price,
    compareAt: product.compareAt,
    image: product.image,
    hover: product.hover || product.image,
    isNew: product.isNew,
    sizes: product.sizes,
    sku:
      product.sku ||
      `GEN-${product.brand.slice(0, 2).toUpperCase()}-${100 + index}`,
    stock:
      product.availableQuantity !== undefined
        ? product.availableQuantity
        : product.inStock !== false
          ? 5
          : 0,
    inStock: product.inStock !== false,
    category: product.category || "Calzado",
    gender: product.gender || "Unisex",
    description: product.description,
    images:
      product.images && product.images.length > 0
        ? product.images
        : [product.image, product.hover || product.image],
    featured: product.featured,
    // Critical: carry the variants so editing an existing product does not
    // silently wipe its variants array on save.
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
}
