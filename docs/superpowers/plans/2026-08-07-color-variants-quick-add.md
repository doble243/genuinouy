# Color Variant Quick-Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix destructive variant editing and replace the manual variant form with a color-first quick-add flow where the admin enters only the color value and the system generates type, label, and SKU.

**Architecture:** Isolate color normalization and variant creation in a pure TypeScript utility, isolate the store-to-admin product mapping so variant preservation is testable, and keep the existing JSONB variant schema. The admin modal will reuse the existing stock/image controls but require only the color field; after each add it resets to a fresh color draft so consecutive additions stay fast.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Node 24 built-in test runner, Supabase JSONB.

**Design reference:** `docs/superpowers/specs/2026-08-07-color-variants-design.md`

**Commit policy:** Do not commit unless the user explicitly requests it. Keep each task as an isolated reviewable work unit in the working tree.

---

## File map

- Create `src/lib/variantUtils.ts`: pure normalization, duplicate detection, SKU generation, and color-variant construction.
- Create `src/lib/adminProductMapper.ts`: pure store `Product` to `AdminProduct` mapping that preserves variants.
- Create `tests/variant-utils.test.ts`: behavior-first tests for value-only color generation.
- Create `tests/admin-product-mapper.test.ts`: regression test proving existing variants survive the admin mapping.
- Modify `src/components/admin/AdminPanel.tsx`: use the tested mapper instead of the lossy inline object literal.
- Modify `src/components/admin/AdminProductFormModal.tsx`: color-only quick-add UI, automatic fields, duplicate validation, consecutive adds.
- Modify `src/lib/store.tsx`: include input variants in optimistic product creation.

---

### Task 1: Specify automatic color variant behavior

**Files:**
- Create: `tests/variant-utils.test.ts`
- Create later in GREEN: `src/lib/variantUtils.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/variant-utils.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  createColorVariant,
  hasDuplicateColor,
  normalizeSkuPart,
} from "../src/lib/variantUtils.ts";

const existing = {
  id: "black-id",
  type: "color" as const,
  value: "Negro",
  label: "Negro",
  image: null,
  sku: "GEN-123456-NEGRO",
  stock: 1,
  in_stock: true,
};

test("creates a color variant from the color value only", () => {
  const variant = createColorVariant({
    id: "variant-id",
    color: "  Negro mate  ",
    productSku: "GEN-123456",
  });

  assert.deepEqual(variant, {
    id: "variant-id",
    type: "color",
    value: "Negro mate",
    label: "Negro mate",
    image: null,
    sku: "GEN-123456-NEGRO-MATE",
    stock: 1,
    in_stock: true,
  });
});

test("normalizes accents and separators for generated SKUs", () => {
  assert.equal(normalizeSkuPart("  Azul océano / edición 2  "), "AZUL-OCEANO-EDICION-2");
});

test("detects duplicate color values independent of case, accents, and whitespace", () => {
  assert.equal(hasDuplicateColor([existing], " negro "), true);
  assert.equal(hasDuplicateColor([existing], "NEGRO"), true);
  assert.equal(hasDuplicateColor([existing], "Blanco"), false);
});

test("marks zero-stock colors as unavailable", () => {
  const variant = createColorVariant({
    id: "variant-id",
    color: "Blanco",
    productSku: "GEN-123456",
    stock: 0,
  });

  assert.equal(variant.stock, 0);
  assert.equal(variant.in_stock, false);
});

test("rejects an empty color", () => {
  assert.throws(
    () => createColorVariant({ id: "variant-id", color: "   ", productSku: "GEN-123456" }),
    /color is required/i,
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/variant-utils.test.ts
```

Expected: FAIL because `src/lib/variantUtils.ts` does not exist.

- [ ] **Step 3: Implement the minimal pure helper**

Create `src/lib/variantUtils.ts`:

```ts
import type { ProductVariant } from "./data";

const removeDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function normalizeColor(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSkuPart(value: string): string {
  return removeDiacritics(normalizeColor(value))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function colorKey(value: string): string {
  return removeDiacritics(normalizeColor(value)).toLocaleLowerCase("es");
}

export function hasDuplicateColor(
  variants: readonly ProductVariant[],
  color: string,
): boolean {
  const candidate = colorKey(color);
  return variants.some(
    (variant) =>
      variant.type === "color" && colorKey(variant.value || variant.label) === candidate,
  );
}

type CreateColorVariantInput = {
  id: string;
  color: string;
  productSku: string;
  image?: string | null;
  stock?: number;
};

export function createColorVariant({
  id,
  color,
  productSku,
  image = null,
  stock = 1,
}: CreateColorVariantInput): ProductVariant {
  const normalizedColor = normalizeColor(color);
  if (!normalizedColor) throw new Error("Color is required");

  const safeStock = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 1;
  const productPart = normalizeSkuPart(productSku) || "GEN";
  const colorPart = normalizeSkuPart(normalizedColor) || "COLOR";

  return {
    id,
    type: "color",
    value: normalizedColor,
    label: normalizedColor,
    image,
    sku: `${productPart}-${colorPart}`,
    stock: safeStock,
    in_stock: safeStock > 0,
  };
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
node --test tests/variant-utils.test.ts
```

Expected: 5 tests pass.

---

### Task 2: Preserve variants when opening the admin editor

**Files:**
- Create: `tests/admin-product-mapper.test.ts`
- Create: `src/lib/adminProductMapper.ts`
- Modify: `src/components/admin/AdminPanel.tsx:1-45`

- [ ] **Step 1: Write the failing regression test**

Create `tests/admin-product-mapper.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import type { Product } from "../src/lib/data.ts";
import { mapProductToAdminProduct } from "../src/lib/adminProductMapper.ts";

const product: Product = {
  id: "product-id",
  brand: "Nike",
  name: "Air Max",
  price: 4990,
  image: "main.webp",
  hover: "hover.webp",
  sizes: ["40"],
  sku: "GEN-123456",
  variants: [
    {
      id: "black-id",
      type: "color",
      value: "Negro",
      label: "Negro",
      image: null,
      sku: "GEN-123456-NEGRO",
      stock: 1,
      in_stock: true,
    },
  ],
};

test("preserves product variants in the admin edit model", () => {
  const adminProduct = mapProductToAdminProduct(product, 0);
  assert.deepEqual(adminProduct.variants, product.variants);
});
```

- [ ] **Step 2: Run the mapper test and verify RED**

Run:

```bash
node --test tests/admin-product-mapper.test.ts
```

Expected: FAIL because `src/lib/adminProductMapper.ts` does not exist.

- [ ] **Step 3: Implement the mapper**

Create `src/lib/adminProductMapper.ts`:

```ts
import type { Product } from "./data";
import type { AdminProduct } from "../types/admin";

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
    variants: product.variants,
  };
}
```

- [ ] **Step 4: Replace the lossy inline mapping**

In `src/components/admin/AdminPanel.tsx`, add:

```ts
import { mapProductToAdminProduct } from "../../lib/adminProductMapper";
```

Replace the complete inline `storeProducts.map((p, index) => ({ ... }))` block with:

```ts
const products: AdminProduct[] = storeProducts.map(mapProductToAdminProduct);
```

- [ ] **Step 5: Run mapper and utility tests**

Run:

```bash
node --test tests/admin-product-mapper.test.ts tests/variant-utils.test.ts
```

Expected: all tests pass.

---

### Task 3: Replace manual variant metadata with color-only quick add

**Files:**
- Modify: `src/components/admin/AdminProductFormModal.tsx:66-115, 535-916`

- [ ] **Step 1: Import tested helpers**

Add:

```ts
import { createColorVariant, hasDuplicateColor } from "../../lib/variantUtils";
```

Keep `newVariantId()` in this component because ID generation is browser-specific.

- [ ] **Step 2: Add a reusable blank color draft**

Below `newVariantId()`, add:

```ts
function newColorVariantDraft(): ProductVariant {
  return {
    id: newVariantId(),
    type: "color",
    value: "",
    label: "",
    image: null,
    sku: "",
    stock: 1,
    in_stock: true,
  };
}
```

Initialize draft state with the factory:

```ts
const [variantDraft, setVariantDraft] = useState<ProductVariant>(
  newColorVariantDraft,
);
```

In both branches of the form initialization effect, replace `setVariantDraft(null)` with:

```ts
setVariantDraft(newColorVariantDraft());
```

- [ ] **Step 3: Replace the Type/Valor/Etiqueta/SKU fields**

Remove the type selector, label input, and SKU input. Keep one required field:

```tsx
<div>
  <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-smoke mb-1">
    Color
  </label>
  <input
    type="text"
    value={variantDraft.value}
    onChange={(event) =>
      setVariantDraft((current) => ({
        ...current,
        value: event.target.value,
      }))
    }
    placeholder="Ej.: Negro, Blanco, Azul océano"
    autoComplete="off"
    className="w-full border border-bone-300 rounded-lg px-2.5 py-2 text-[12px] font-bold bg-white"
  />
  <p className="mt-1 text-[10px] text-smoke">
    La etiqueta y el SKU se generan automáticamente.
  </p>
</div>
```

Keep stock and image as optional controls; they must not block creation.

- [ ] **Step 4: Replace the old two-field validation and append logic**

Replace the button handler that checks both `variantDraft.value` and `variantDraft.label` with:

```ts
const color = variantDraft.value.trim();
if (!color) {
  alert("Ingresá un color para la variante.");
  return;
}
if (hasDuplicateColor(variants, color)) {
  alert("Ese color ya fue agregado.");
  return;
}

const nextVariant = createColorVariant({
  id: variantDraft.id || newVariantId(),
  color,
  productSku: sku,
  image: variantDraft.image,
  stock: variantDraft.stock,
});

setVariants((current) => [...current, nextVariant]);
setVariantDraft(newColorVariantDraft());
setVariantImagePicker("gallery");
```

Change the button label to:

```tsx
+ Agregar color
```

The old message `Ingresá al menos Valor y Etiqueta para la variante.` must no longer exist in the file.

- [ ] **Step 5: Keep the quick-add form ready after every add**

Remove the conditional branch that hides the editor behind `+ Agregar variante`. Render the compact color editor continuously. Change the cancel action to a non-destructive reset:

```ts
setVariantDraft(newColorVariantDraft());
setVariantImagePicker("gallery");
```

Label that action `Limpiar` instead of `Cancelar`.

- [ ] **Step 6: Allow inline stock adjustments on created rows**

Replace the read-only `stock {v.stock ?? 0}` text with:

```tsx
<label className="flex items-center gap-1 text-[10px] font-bold text-smoke">
  Stock
  <input
    type="number"
    min="0"
    value={v.stock ?? 0}
    onChange={(event) => {
      const stock = Math.max(0, Number.parseInt(event.target.value, 10) || 0);
      setVariants((current) =>
        current.map((variant) =>
          variant.id === v.id
            ? { ...variant, stock, in_stock: stock > 0 }
            : variant,
        ),
      );
    }}
    className="w-14 rounded border border-bone-300 bg-white px-1.5 py-1 text-center"
  />
</label>
```

- [ ] **Step 7: Verify the obsolete validation is gone**

Run:

```bash
rg "Ingresá al menos Valor y Etiqueta|VARIANT_TYPES|Etiqueta|SKU \(opcional\)" src/components/admin/AdminProductFormModal.tsx
```

Expected: no match for the removed manual variant controls or old validation.

---

### Task 4: Keep optimistic state and persistence consistent

**Files:**
- Modify: `src/lib/store.tsx` in the optimistic `tempProduct` created by `createProduct`
- Review: `src/lib/adminService.ts` update payload guard

- [ ] **Step 1: Preserve newly entered variants in optimistic creation**

In the `tempProduct` object inside `createProduct`, add:

```ts
variants: input.variants ?? [],
```

This prevents a newly created product from briefly appearing without its colors before the API response replaces the optimistic record.

- [ ] **Step 2: Confirm update semantics remain non-destructive**

Keep the existing explicit guard in `src/lib/adminService.ts`:

```ts
if (input.variants !== undefined) dbPayload.variants = input.variants;
```

Do not replace it with `input.variants ?? []`, because that would turn an omitted field into a destructive empty-array write.

- [ ] **Step 3: Run focused tests**

Run:

```bash
node --test tests/variant-utils.test.ts tests/admin-product-mapper.test.ts
```

Expected: all tests pass.

---

### Task 5: Assign or replace a photo after a color already exists

**Files:**
- Modify: `src/lib/variantUtils.ts`
- Modify: `tests/variant-utils.test.ts`
- Modify: `src/components/admin/AdminProductFormModal.tsx:608-699`

- [ ] **Step 1: Write the failing pure update test**

Add to `tests/variant-utils.test.ts`:

```ts
import { updateVariantImage } from "../src/lib/variantUtils.ts";

test("updates only the selected variant image without mutating the source list", () => {
  const variants = [
    { id: "black", type: "color" as const, value: "Negro", label: "Negro", image: null },
    { id: "white", type: "color" as const, value: "Blanco", label: "Blanco", image: "white.webp" },
  ];

  const updated = updateVariantImage(variants, "black", "black.webp");

  assert.equal(updated[0].image, "black.webp");
  assert.equal(updated[1].image, "white.webp");
  assert.equal(variants[0].image, null);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/variant-utils.test.ts
```

Expected: FAIL because `updateVariantImage` does not exist.

- [ ] **Step 3: Implement the pure image updater**

Add to `src/lib/variantUtils.ts`:

```ts
export function updateVariantImage(
  variants: readonly ProductVariant[],
  variantId: string,
  image: string | null,
): ProductVariant[] {
  return variants.map((variant) =>
    variant.id === variantId ? { ...variant, image } : variant,
  );
}
```

- [ ] **Step 4: Add active-row photo editing state**

In `AdminProductFormModal.tsx`, add state alongside the existing quick-add image state:

```ts
const [photoVariantId, setPhotoVariantId] = useState<string | null>(null);
const photoVariantFileInputRef = useRef<HTMLInputElement>(null);
```

Add a helper that delegates all local mutation to the pure updater:

```ts
const handleVariantImageChange = (variantId: string, image: string | null) => {
  setVariants((current) => updateVariantImage(current, variantId, image));
  setPhotoVariantId(null);
};
```

- [ ] **Step 5: Add an `Asignar foto` action to every created row**

Inside each variant row (`variants.map`), add a button beside the stock/availability controls:

```tsx
<button
  type="button"
  onClick={() => setPhotoVariantId(photoVariantId === v.id ? null : v.id)}
  className="border border-gold-500/60 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-700 hover:bg-gold-50"
>
  {v.image ? "Cambiar foto" : "Asignar foto"}
</button>
```

Only one row may be expanded at a time, keyed by `variant.id`.

- [ ] **Step 6: Render the inline gallery/upload picker for the selected row**

Immediately after the selected row, render a picker when `photoVariantId === v.id`:

```tsx
{photoVariantId === v.id && (
  <div className="mt-2 border border-gold-500/30 bg-white p-3 space-y-2">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setVariantImagePicker("gallery")}
        className={variantImagePicker === "gallery" ? "bg-obsidian text-bone px-3 py-1.5 text-[10px] font-bold uppercase" : "bg-bone-200 text-ink px-3 py-1.5 text-[10px] font-bold uppercase"}
      >
        De la galería
      </button>
      <button
        type="button"
        onClick={() => setVariantImagePicker("upload")}
        className={variantImagePicker === "upload" ? "bg-obsidian text-bone px-3 py-1.5 text-[10px] font-bold uppercase" : "bg-bone-200 text-ink px-3 py-1.5 text-[10px] font-bold uppercase"}
      >
        Subir nueva
      </button>
      {v.image && (
        <button
          type="button"
          onClick={() => handleVariantImageChange(v.id, null)}
          className="ml-auto text-[10px] font-bold text-rose-600 hover:underline"
        >
          Quitar foto
        </button>
      )}
    </div>

    {variantImagePicker === "gallery" ? (
      images.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => handleVariantImageChange(v.id, image)}
              className="relative aspect-square overflow-hidden rounded-lg border-2 border-bone-300 hover:border-gold-500"
              title="Asignar esta foto"
            >
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-bone-300 px-3 py-3 text-center text-[11px] text-smoke">
          Subí primero una imagen a la galería del producto.
        </p>
      )
    ) : (
      <>
        <input
          ref={photoVariantFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const url = await uploadImageToCloudinary(file);
              setImages((current) => (current.includes(url) ? current : [url, ...current]));
              handleVariantImageChange(v.id, url);
            } catch (error) {
              console.error("Variant image upload failed:", error);
              alert("No se pudo subir la imagen a Cloudinary.");
            } finally {
              if (photoVariantFileInputRef.current) photoVariantFileInputRef.current.value = "";
            }
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => photoVariantFileInputRef.current?.click()}
          className="w-full border border-dashed border-gold-500/50 rounded-lg px-3 py-2 text-[11px] font-bold text-gold-600 hover:bg-gold-50"
        >
          Subir foto de esta variante (webp automático)
        </button>
      </>
    )}
  </div>
)}
```

Use a wrapper inside the list item or a sibling keyed by the same variant so the picker remains visually attached to the correct row.

- [ ] **Step 7: Reset the active photo row when the modal resets**

In `resetVariantEditor` and the `useEffect` that initializes the product, add:

```ts
setPhotoVariantId(null);
setVariantImagePicker("gallery");
```

- [ ] **Step 8: Run focused tests and inspect the deprecated flow**

Run:

```bash
node --test tests/variant-utils.test.ts tests/admin-product-mapper.test.ts
rg "Asignar foto|Cambiar foto|Quitar foto|Ingresá al menos Valor y Etiqueta" src/components/admin/AdminProductFormModal.tsx
```

Expected: all tests pass; the new row actions exist; the old manual validation message has no matches.

---

### Task 6: Verify the complete variant flow

**Files:**
- Verify only: all changed files

- [ ] **Step 1: Type-check production code**

Run:

```bash
npx tsc --noEmit
```

Expected: exit code 0.

- [ ] **Step 2: Build the production bundle**

Run:

```bash
npm run build
```

Expected: Vite build succeeds.

- [ ] **Step 3: Perform a browser smoke test**

Run the app and verify:

1. Open an existing product that already has variants.
2. Confirm its variants are still present.
3. Enter only `Negro` in the color field and click `Agregar color`.
4. Confirm label `Negro` and generated SKU ending in `-NEGRO` appear.
5. Immediately add `Blanco` without reopening the editor.
6. Attempt to add ` negro ` and confirm duplicate rejection.
7. Save, reopen the product, and confirm both colors remain.
8. Open the product in the storefront, select a color, add it to the cart, and confirm the selected color follows the item.

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git diff --check
git diff --stat
git status --short
```

Expected: no whitespace errors; only the planned files changed. Do not commit unless the user explicitly requests it.
