import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeForComparison,
  normalizeForSku,
  buildVariantSku,
  isDuplicateColor,
  buildColorVariant,
  updateVariantImage,
} from "../src/lib/variantUtils.ts";

describe("variantUtils — normalizeForComparison", () => {
  it("lowercases, trims and collapses whitespace", () => {
    assert.equal(normalizeForComparison("  Negro Mate "), "negromate");
    assert.equal(normalizeForComparison("Blanco   Perla"), "blancoperla");
  });

  it("removes accents from common Spanish characters", () => {
    assert.equal(normalizeForComparison("Negro Mático"), "negromatico");
    assert.equal(normalizeForComparison("Azúl Cielo"), "azulcielo");
  });

  it("treats different cases/whitespace as equal", () => {
    assert.equal(
      normalizeForComparison("Negro Mate"),
      normalizeForComparison("  negro   mate "),
    );
    assert.equal(
      normalizeForComparison("Rojo MÁtico"),
      normalizeForComparison("rojo matico"),
    );
  });
});

describe("variantUtils — normalizeForSku", () => {
  it("uppercases, removes accents, collapses separators into single hyphens", () => {
    assert.equal(normalizeForSku("Negro mate"), "NEGRO-MATE");
    assert.equal(normalizeForSku("Azúl cielo"), "AZUL-CIELO");
    assert.equal(
      normalizeForSku("  Rojo  /  Mático  "),
      "ROJO-MATICO",
    );
  });

  it("strips characters that are not letters or digits", () => {
    assert.equal(normalizeForSku("Negro & mate!!"), "NEGRO-MATE");
    assert.equal(normalizeForSku("100% Algodón"), "100-ALGODON");
  });

  it("trims leading and trailing hyphens", () => {
    assert.equal(normalizeForSku("  ---Negro---  "), "NEGRO");
    assert.equal(normalizeForSku("/Azul/"), "AZUL");
  });
});

describe("variantUtils — buildVariantSku", () => {
  it("appends the normalized color suffix to the product SKU", () => {
    assert.equal(buildVariantSku("GEN-123456", "Negro mate"), "GEN-123456-NEGRO-MATE");
    assert.equal(buildVariantSku("JOR-AJ1-8392", "Azúl cielo"), "JOR-AJ1-8392-AZUL-CIELO");
  });

  it("works when the product SKU is missing or empty", () => {
    assert.equal(buildVariantSku(undefined, "Negro"), "NEGRO");
    assert.equal(buildVariantSku("", "Negro"), "NEGRO");
  });

  it("removes accents and normalizes whitespace in the color before appending", () => {
    assert.equal(
      buildVariantSku("GEN-123456", "  Rojo  Mático "),
      "GEN-123456-ROJO-MATICO",
    );
  });
});

describe("variantUtils — isDuplicateColor", () => {
  const baseVariants = [
    {
      id: "v1",
      type: "color" as const,
      value: "Negro mate",
      label: "Negro mate",
      sku: "GEN-1-NEGRO-MATE",
    },
    {
      id: "v2",
      type: "color" as const,
      value: "Mático",
      label: "Mático",
      sku: "GEN-1-MATICO",
    },
    {
      id: "v3",
      type: "size" as const,
      value: "42",
      label: "42",
    },
  ];

  it("returns true for an exact-match duplicate color", () => {
    assert.equal(isDuplicateColor(baseVariants, "Negro mate"), true);
  });

  it("is case-insensitive and trims whitespace", () => {
    assert.equal(isDuplicateColor(baseVariants, "  negro   MATE "), true);
  });

  it("is accent-insensitive", () => {
    assert.equal(isDuplicateColor(baseVariants, "Matico"), true);
    assert.equal(isDuplicateColor(baseVariants, "mático"), true);
    assert.equal(isDuplicateColor(baseVariants, "MATICO"), true);
  });

  it("returns false for a different color", () => {
    assert.equal(isDuplicateColor(baseVariants, "Blanco"), false);
  });

  it("ignores non-color variants", () => {
    assert.equal(isDuplicateColor(baseVariants, "42"), false);
  });

  it("returns false for an empty list", () => {
    assert.equal(isDuplicateColor([], "Negro"), false);
  });
});

describe("variantUtils — buildColorVariant", () => {
  it("builds a color variant with auto-filled label, type and sku", () => {
    const variant = buildColorVariant({
      color: "Negro mate",
      productSku: "GEN-123456",
    });
    assert.equal(variant.type, "color");
    assert.equal(variant.value, "Negro mate");
    assert.equal(variant.label, "Negro mate");
    assert.equal(variant.sku, "GEN-123456-NEGRO-MATE");
    assert.ok(variant.id && variant.id.length > 0);
    assert.equal(variant.image ?? null, null);
    assert.equal(variant.stock, 1);
    assert.equal(variant.in_stock, true);
  });

  it("trims the color before assigning value and label", () => {
    const variant = buildColorVariant({
      color: "  Azul  cielo  ",
      productSku: "GEN-1",
    });
    assert.equal(variant.value, "Azul  cielo");
    assert.equal(variant.label, "Azul  cielo");
  });

  it("accepts an optional image, defaulting to null", () => {
    const v1 = buildColorVariant({ color: "Negro", productSku: "GEN-1" });
    const v2 = buildColorVariant({
      color: "Negro",
      productSku: "GEN-1",
      image: "https://cdn.example/x.jpg",
    });
    assert.equal(v1.image ?? null, null);
    assert.equal(v2.image, "https://cdn.example/x.jpg");
  });

  it("clamps stock to a non-negative integer and defaults to 1", () => {
    const v1 = buildColorVariant({ color: "Negro", productSku: "GEN-1" });
    const v2 = buildColorVariant({ color: "Negro", productSku: "GEN-1", stock: 7 });
    const v3 = buildColorVariant({ color: "Negro", productSku: "GEN-1", stock: -3 });
    assert.equal(v1.stock, 1);
    assert.equal(v2.stock, 7);
    assert.equal(v3.stock, 0);
  });
});

describe("variantUtils — updateVariantImage", () => {
  const baseVariants: {
    id: string;
    type: "color";
    value: string;
    label: string;
    sku: string;
    image?: string | null;
  }[] = [
    { id: "v1", type: "color", value: "Negro", label: "Negro", sku: "X-1" },
    { id: "v2", type: "color", value: "Blanco", label: "Blanco", sku: "X-2" },
  ];

  it("returns a new array with only the matching variant image updated", () => {
    const next = updateVariantImage(baseVariants, "v1", "https://cdn/x.jpg");
    assert.notEqual(next, baseVariants, "must return a new array reference");
    assert.equal(next.length, 2);
    assert.equal(next[0].id, "v1");
    assert.equal(next[0].image, "https://cdn/x.jpg");
    // The updated variant object itself is a new reference (immutability).
    assert.notEqual(next[0], baseVariants[0]);
    // Other variants are untouched.
    assert.equal(next[1].id, "v2");
    assert.equal(next[1].image, undefined);
    assert.equal(next[1], baseVariants[1], "non-matching variants keep same reference");
  });

  it("accepts null to clear the variant image (storefront fallback)", () => {
    const withImage = [
      { ...baseVariants[0], image: "https://cdn/x.jpg" },
      baseVariants[1],
    ];
    const next = updateVariantImage(withImage, "v1", null);
    assert.equal(next[0].image ?? null, null);
  });

  it("accepts undefined as equivalent to null for clearing the image", () => {
    const withImage = [
      { ...baseVariants[0], image: "https://cdn/x.jpg" },
      baseVariants[1],
    ];
    const next = updateVariantImage(withImage, "v1", undefined);
    assert.equal(next[0].image ?? null, null);
  });

  it("does not mutate the input array or any variant object", () => {
    const input = [
      { ...baseVariants[0] },
      { ...baseVariants[1] },
    ];
    const inputSnapshot = JSON.parse(JSON.stringify(input));
    updateVariantImage(input, "v1", "https://cdn/y.jpg");
    assert.deepEqual(input, inputSnapshot);
  });

  it("preserves every other field of the matched variant", () => {
    const next = updateVariantImage(baseVariants, "v2", "https://cdn/z.jpg");
    assert.equal(next[1].id, "v2");
    assert.equal(next[1].type, "color");
    assert.equal(next[1].value, "Blanco");
    assert.equal(next[1].label, "Blanco");
    assert.equal(next[1].sku, "X-2");
    assert.equal(next[1].image, "https://cdn/z.jpg");
  });

  it("handles an empty variants array without crashing", () => {
    const next = updateVariantImage([], "v1", "https://cdn/x.jpg");
    assert.deepEqual(next, []);
    assert.notEqual(next, [] as { id: string }[], "must still return a new array");
  });
});
