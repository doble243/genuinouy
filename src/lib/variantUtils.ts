import type { ProductVariant } from "./data";

/**
 * Pure helpers for the admin "color quick-add" variant workflow.
 *
 * All normalization is intentionally ASCII-friendly so the same SKU and
 * duplicate-detection rules apply regardless of locale. The helpers never
 * touch React state directly — the form component owns that.
 */

/** Removes accents using Unicode NFD decomposition. Works for Spanish tildes,
 *  ñ → n, ü → u, etc. without a hardcoded allowlist. */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Canonical form used to compare two colors case/whitespace/accent-insensitively.
 *  Internal whitespace is collapsed so "Negro   mate" and "Negro mate" match. */
export function normalizeForComparison(s: string): string {
  return stripAccents(String(s ?? "").trim().toLowerCase()).replace(/\s+/g, "");
}

/** Canonical form used to build a SKU-friendly slug from a color label.
 *  - Accents removed (Mático → MATICO)
 *  - Uppercase
 *  - Non-alphanumeric characters become a single hyphen
 *  - Leading and trailing hyphens are trimmed */
export function normalizeForSku(s: string): string {
  const stripped = stripAccents(String(s ?? "").trim().toUpperCase());
  return stripped
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds the SKU for a color variant by joining the product SKU and the
 *  normalized color. When the product SKU is missing/empty the result is
 *  just the color slug (still non-empty and unique per color). */
export function buildVariantSku(
  productSku: string | undefined | null,
  color: string,
): string {
  const colorSlug = normalizeForSku(color);
  const base = (productSku ?? "").trim();
  if (!base) return colorSlug || "VARIANT";
  if (!colorSlug) return base;
  return `${base}-${colorSlug}`;
}

/** Returns true when `color` collides with any color variant already present
 *  in `existing`. Case, whitespace and accents are ignored. Non-color
 *  variants (size/other) are skipped. */
export function isDuplicateColor(
  existing: ProductVariant[],
  color: string,
): boolean {
  const target = normalizeForComparison(color);
  if (!target) return false;
  return existing.some(
    (v) => v.type === "color" && normalizeForComparison(v.value) === target,
  );
}

/** Small id factory used by buildColorVariant. Kept inside this module so
 *  tests are deterministic in any environment (Node or browser). */
function newVariantId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as { randomUUID?: () => string }).randomUUID === "function"
  ) {
    return (crypto as { randomUUID: () => string }).randomUUID();
  }
  return `var-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export type BuildColorVariantInput = {
  color: string;
  productSku?: string | undefined | null;
  /** Optional variant image. When undefined the variant has no image and the
   *  storefront keeps its existing fallback to the product image. */
  image?: string | null;
  /** Optional stock. Defaults to 1 (matches the pre-existing UX). Negative
   *  values are clamped to 0 so the variant is shown as out of stock. */
  stock?: number;
};

/** Constructs a ProductVariant ready to be appended to the variants array.
 *  The caller is responsible for duplicate detection (see isDuplicateColor)
 *  and for keeping the editor visible after the row is added. */
export function buildColorVariant(input: BuildColorVariantInput): ProductVariant {
  const trimmedColor = input.color.trim();
  const stock = Math.max(0, Math.floor(input.stock ?? 1));
  return {
    id: newVariantId(),
    type: "color",
    value: trimmedColor,
    label: trimmedColor,
    sku: buildVariantSku(input.productSku, trimmedColor),
    image: input.image ?? null,
    stock,
    in_stock: stock > 0,
  };
}

/** Returns a NEW variants array where only the variant with `variantId` has its
 *  `image` updated. Every other variant is returned by reference (cheap React
 *  re-render). Passing `null` or `undefined` clears the image so the storefront
 *  falls back to the product image.
 *
 *  Pure: never mutates the input array or any variant object inside it. */
export function updateVariantImage(
  variants: ProductVariant[],
  variantId: string,
  image: string | null | undefined,
): ProductVariant[] {
  return variants.map((v) =>
    v.id === variantId ? { ...v, image: image ?? null } : v,
  );
}
