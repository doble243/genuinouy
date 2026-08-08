# Color Variant Quick-Add Design

**Date:** 2026-08-07  
**Status:** Approved for implementation

## Problem

The current product variant editor is not reliable for existing products because `AdminPanel` drops the `variants` field while mapping store products into admin products. Opening and saving a product can therefore replace persisted variants with an empty array.

The editor is also too slow for the first intended use case: adding several color variants. It currently requires manual entry of type, value, label, SKU, stock, and image for every variant.

## Goals

- Make color variants the primary quick-add workflow.
- Add one color at a time without reopening or resetting the editor.
- Generate the display label and variant SKU automatically.
- Keep image selection optional during creation and allow assigning or replacing an image after creation.
- Preserve existing variants when editing and saving a product.
- Prevent duplicate colors in the same product.
- Keep the existing storefront, cart, and order variant model compatible.

## Non-goals

- Bulk paste/import of multiple colors.
- New database tables or a new variant schema.
- Supporting combinations such as color + size in this slice.
- Reworking the existing product gallery or order presentation.

## Approved UX

The Variants section will use a compact color-first flow:

1. The admin enters only a color name. This is the only required input for quick creation.
2. The system defaults stock to `1`; stock remains editable on the created row.
3. The admin clicks `Agregar color`.
4. The system validates the color, creates the variant locally, and immediately renders it in the existing variant list.
5. The input remains available for the next color.
6. The created row can be edited for stock, availability, and image, or removed before saving the product.

The quick-add path must not ask for or validate a manually entered label, type, or SKU. The existing `Ingresá al menos Valor y Etiqueta para la variante.` validation is removed from this flow.

Each quick-created variant uses:

```ts
{
  id: generatedUuid,
  type: "color",
  value: trimmedColor,
  label: trimmedColor,
  image: null,
  sku: generatedVariantSku,
  stock: enteredStockOrOne,
  in_stock: enteredStockOrOne > 0
}
```

A missing variant image is intentional. Existing storefront and order code already supports falling back to the product image.

## SKU and normalization rules

- The base is the product SKU currently in the form. The existing automatic product SKU generation remains the fallback for new products.
- The color fragment is normalized for identifiers:
  - trim whitespace;
  - remove accents;
  - uppercase;
  - replace non-alphanumeric runs with `-`;
  - remove leading/trailing separators.
- The generated SKU is `<PRODUCT-SKU>-<COLOR-FRAGMENT>`.
- Example: product SKU `GEN-123456`, color `Negro mate` produces `GEN-123456-NEGRO-MATE`.
- Duplicate colors are compared case-insensitively after trimming and are rejected. This prevents two variants from generating the same SKU.
- Existing variant SKUs are not silently regenerated when the product SKU is later edited; generated identifiers remain stable after creation.

## Data flow and safeguards

### Admin loading

`AdminPanel` must include `variants: p.variants` in its store-product mapping. The edit modal then initializes its local variant state from the loaded array.

### Admin editing

The modal owns a local `ProductVariant[]` while it is open. Adding, toggling, editing, and removing variants changes this local array only. The complete array is submitted with the product payload.

### Persistence

The update path must preserve the distinction between:

- `variants: undefined`: the caller did not intend to modify variants;
- `variants: []`: the caller explicitly removed all variants.

The current product save flow will provide the complete array from the modal. Defensive update logic must avoid converting a missing field into an accidental destructive write.

### Storefront and orders

No schema change is needed. The existing `ProductVariant` JSONB shape and order-item variant columns remain the source of truth. The storefront continues to display the selected color, use its image when present, and fall back to the product image otherwise. Cart and checkout continue to key and persist variants by `variant.id`.

### Variant photo assignment after creation

Every persisted variant row will expose an `Asignar foto` action. The action stays attached to that specific variant and opens a compact inline picker below the row.

The picker supports:

- selecting one of the product gallery images;
- uploading a new image to Cloudinary using the existing webp upload flow;
- replacing an existing variant image;
- removing the variant image so storefront fallback to the product image resumes.

Selecting or uploading an image updates only the matching variant by `variant.id` in local state. It must not create a second variant, change the color, or alter another row. The final image URL is persisted as part of the existing `variants` array when the product is saved. Uploaded images are also added to the product gallery so they can be reused for another color.

## Implementation boundaries

- `src/lib/variantUtils.ts`: pure color normalization, SKU generation, duplicate detection, and variant construction helpers.
- `src/components/admin/AdminProductFormModal.tsx`: compact color quick-add UI and helper integration; preserve image, stock, availability, and removal controls.
- `src/components/admin/AdminPanel.tsx`: preserve `variants` while mapping store products.
- `src/lib/adminService.ts` and `src/lib/store.tsx`: retain explicit variant update semantics and include variants in optimistic creation state where appropriate.
- Existing storefront/cart/order files should only change if validation exposes a regression in the already-wired variant flow.

## Validation plan

The implementation must prove:

1. A color creates a `type: "color"` variant with matching `value` and `label`.
2. Accented and multi-word colors produce deterministic SKU fragments.
3. Duplicate colors are rejected without mutating the variant list.
4. Multiple colors can be added consecutively in one open editor.
5. Existing variants survive admin load and a no-change save.
6. A variant without an image remains valid and uses product-image fallback.
7. An existing variant can select a gallery image after creation and only that variant changes.
8. An existing variant can upload a new image after creation, and the upload is reusable in the gallery.
9. Removing a variant image restores product-image fallback.
10. Explicit removal persists, while an omitted variants field does not wipe data.
11. TypeScript and the Vite production build pass.

Because the repository has no configured test script and contains legacy test imports, pure helper behavior should be covered with the lightest runnable test harness available during implementation, followed by `tsc` and Vite build verification.

## Rollback

The change is isolated to admin variant editing and pure helper logic. If the quick-add UI introduces a regression, revert the UI/helper changes while retaining the `AdminPanel` mapping fix, which is independently required to prevent data loss.
