import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { mapProductToAdminProduct } from "../src/lib/adminProductMapper.ts";
import type { Product } from "../src/lib/data.ts";

const baseProduct: Product = {
  id: "prod-1",
  brand: "Nike",
  name: "Air Max 90",
  price: 12490,
  image: "https://cdn.example/main.jpg",
  hover: "https://cdn.example/hover.jpg",
  isNew: true,
  sizes: ["38", "39", "40"],
  inStock: true,
  category: "Calzado",
  gender: "Unisex",
  description: "Air Max clásico",
  sku: "NIKE-AM90-001",
  availableQuantity: 7,
  images: ["https://cdn.example/main.jpg", "https://cdn.example/hover.jpg"],
  featured: false,
};

describe("adminProductMapper — mapProductToAdminProduct", () => {
  it("preserves the existing product fields with the same fallbacks as before", () => {
    const result = mapProductToAdminProduct(baseProduct, 0);
    assert.equal(result.id, "prod-1");
    assert.equal(result.brand, "Nike");
    assert.equal(result.name, "Air Max 90");
    assert.equal(result.price, 12490);
    assert.equal(result.compareAt, undefined);
    assert.equal(result.image, "https://cdn.example/main.jpg");
    assert.equal(result.hover, "https://cdn.example/hover.jpg");
    assert.equal(result.isNew, true);
    assert.deepEqual(result.sizes, ["38", "39", "40"]);
    assert.equal(result.sku, "NIKE-AM90-001");
    assert.equal(result.stock, 7);
    assert.equal(result.inStock, true);
    assert.equal(result.category, "Calzado");
    assert.equal(result.gender, "Unisex");
    assert.equal(result.description, "Air Max clásico");
    assert.deepEqual(result.images, [
      "https://cdn.example/main.jpg",
      "https://cdn.example/hover.jpg",
    ]);
    assert.equal(result.featured, false);
  });

  it("preserves the variants array from the source product", () => {
    const productWithVariants: Product = {
      ...baseProduct,
      variants: [
        {
          id: "var-1",
          type: "color",
          value: "Negro",
          label: "Negro",
          sku: "NIKE-AM90-001-NEGRO",
          stock: 3,
        },
        {
          id: "var-2",
          type: "color",
          value: "Blanco",
          label: "Blanco",
          sku: "NIKE-AM90-001-BLANCO",
        },
      ],
    };
    const result = mapProductToAdminProduct(productWithVariants, 0);
    assert.ok(Array.isArray(result.variants));
    assert.equal(result.variants?.length, 2);
    assert.equal(result.variants?.[0].id, "var-1");
    assert.equal(result.variants?.[1].value, "Blanco");
  });

  it("returns variants as an empty array when the source product omits variants", () => {
    const result = mapProductToAdminProduct(baseProduct, 0);
    assert.ok(Array.isArray(result.variants));
    assert.equal(result.variants?.length, 0);
  });

  it("keeps the same fallback SKU pattern as the inline mapping", () => {
    const productWithoutSku: Product = {
      ...baseProduct,
      sku: undefined,
    };
    const result = mapProductToAdminProduct(productWithoutSku, 4);
    assert.equal(result.sku, "GEN-NI-104");
  });

  it("derives stock from availableQuantity when available, falling back to 5 when inStock", () => {
    const a = mapProductToAdminProduct(
      { ...baseProduct, availableQuantity: 0, inStock: true },
      0,
    );
    const b = mapProductToAdminProduct(
      { ...baseProduct, availableQuantity: undefined, inStock: true },
      0,
    );
    const c = mapProductToAdminProduct(
      { ...baseProduct, availableQuantity: undefined, inStock: false },
      0,
    );
    assert.equal(a.stock, 0);
    assert.equal(b.stock, 5);
    assert.equal(c.stock, 0);
  });

  it("falls back to a synthetic images list when the source has none", () => {
    const productWithoutImages: Product = {
      ...baseProduct,
      images: undefined,
    };
    const result = mapProductToAdminProduct(productWithoutImages, 0);
    assert.deepEqual(result.images, [
      "https://cdn.example/main.jpg",
      "https://cdn.example/hover.jpg",
    ]);
  });

  it("falls back to Calzado/Unisex when category or gender are missing", () => {
    const minimal: Product = {
      ...baseProduct,
      category: undefined,
      gender: undefined,
    };
    const result = mapProductToAdminProduct(minimal, 0);
    assert.equal(result.category, "Calzado");
    assert.equal(result.gender, "Unisex");
  });
});
