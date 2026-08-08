import type { Product } from "./data";

/**
 * Pure action helper for "open this product from any overlay".
 *
 * Both SearchOverlay and CartDrawer hand the selected product off to the
 * ProductDetail modal and close themselves in the same gesture. Centralizing
 * the action here lets us assert the event order once and reuse it from
 * every overlay, instead of re-reading JSX per overlay.
 *
 * Action contract:
 *   1. setSelectedProduct(product)  — caller mutates the modal target first
 *      so ProductDetail has the product the moment any overlay unmounts.
 *   2. closeOverlay(false)          — then the overlay flips closed.
 */
export type CloseOverlay = (open: boolean) => void;
export type SetSelectedProduct = (p: Product | null) => void;

export function openProductFromOverlay(
  product: Product,
  closeOverlay: CloseOverlay,
  setSelectedProduct: SetSelectedProduct,
): void {
  setSelectedProduct(product);
  closeOverlay(false);
}