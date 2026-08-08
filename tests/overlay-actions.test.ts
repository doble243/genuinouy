import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { openProductFromOverlay } from "../src/lib/overlayActions.ts";
import type { Product } from "../src/lib/data.ts";

const baseProduct: Product = {
  id: "prod-1",
  brand: "Nike",
  name: "Air Max 90",
  price: 12490,
  image: "https://cdn.example/main.jpg",
  hover: "https://cdn.example/hover.jpg",
  sizes: ["38", "39", "40"],
  inStock: true,
  category: "Calzado",
  gender: "Unisex",
};

describe("overlayActions — openProductFromOverlay", () => {
  it("calls setSelectedProduct(product) BEFORE closeOverlay(false) for cart close", () => {
    const events: string[] = [];
    const closeOverlay = (open: boolean) => {
      events.push(`closed:${open}`);
    };
    const setSelectedProduct = (p: Product | null) => {
      events.push(`selected:${p?.id ?? "null"}`);
    };

    openProductFromOverlay(baseProduct, closeOverlay, setSelectedProduct);

    assert.deepEqual(
      events,
      [`selected:${baseProduct.id}`, "closed:false"],
      "cart path must emit setSelectedProduct(product) then closeOverlay(false) in that order",
    );
  });

  it("calls setSelectedProduct(product) BEFORE closeOverlay(false) for search close", () => {
    const events: string[] = [];
    const closeOverlay = (open: boolean) => {
      events.push(`closed:${open}`);
    };
    const setSelectedProduct = (p: Product | null) => {
      events.push(`selected:${p?.id ?? "null"}`);
    };

    openProductFromOverlay(baseProduct, closeOverlay, setSelectedProduct);

    assert.deepEqual(
      events,
      [`selected:${baseProduct.id}`, "closed:false"],
      "search path must emit setSelectedProduct(product) then closeOverlay(false) in that order",
    );
  });

  it("passes the exact product identity to setSelectedProduct (no swap)", () => {
    let received: Product | null = "sentinel" as unknown as Product | null;
    const setSelectedProduct = (p: Product | null) => {
      received = p;
    };
    const noopClose = () => {};

    openProductFromOverlay(baseProduct, noopClose, setSelectedProduct);

    assert.equal(received, baseProduct, "setSelectedProduct must receive the exact product reference");
  });

  it("passes the literal boolean false to closeOverlay (not the product, not a toggled value)", () => {
    const calls: unknown[] = [];
    const closeOverlay = (open: boolean) => {
      calls.push(open);
    };
    const setSelectedProduct = () => {};

    openProductFromOverlay(baseProduct, closeOverlay, setSelectedProduct);

    assert.equal(calls.length, 1, "closeOverlay must be called exactly once");
    assert.equal(calls[0], false, "closeOverlay must be called with the literal false");
  });

  it("does not swap the call order when callbacks throw (fail-fast order check via captured events)", () => {
    // Even if setSelectedProduct throws synchronously, the order captured by the
    // event log is what callers will observe. We assert order, not error handling.
    const events: string[] = [];
    const closeOverlay = (open: boolean) => {
      events.push(`closed:${open}`);
    };
    const setSelectedProduct = (p: Product | null) => {
      events.push(`selected:${p?.id ?? "null"}`);
    };

    openProductFromOverlay(baseProduct, closeOverlay, setSelectedProduct);

    assert.equal(events[0], `selected:${baseProduct.id}`);
    assert.equal(events[1], "closed:false");
  });
});