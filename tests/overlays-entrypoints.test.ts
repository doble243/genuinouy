import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const overlaysPath = join(__dirname, "..", "src", "components", "Overlays.tsx");
const src = readFileSync(overlaysPath, "utf8");

/**
 * Extract the body of a named exported function so we can make assertions
 * scoped to that component without coupling to the rest of the file.
 */
function sliceBetween(startMarker: string, endMarker: string | null): string {
  const start = src.indexOf(startMarker);
  if (start < 0) {
    throw new Error(`Start marker not found: ${startMarker}`);
  }
  if (endMarker === null) {
    return src.slice(start);
  }
  const end = src.indexOf(endMarker, start + startMarker.length);
  if (end < 0) {
    throw new Error(`End marker not found after ${startMarker}: ${endMarker}`);
  }
  return src.slice(start, end);
}

const searchSection = sliceBetween(
  "export function SearchOverlay()",
  null,
);
const cartSection = sliceBetween(
  "export function CartDrawer()",
  "/* ------------------------- FAVORITOS",
);

function getCartLinesBlock(): string {
  const mapStart = cartSection.indexOf("{lines.map((l) =>");
  assert.ok(mapStart >= 0, "CartDrawer lines.map block must exist");
  const mapEnd = cartSection.indexOf("\n            </div>", mapStart);
  assert.ok(mapEnd >= 0, "CartDrawer lines.map block must have a closing container");
  return cartSection.slice(mapStart, mapEnd);
}

function getCartLineButtons(linesBlock: string): string[] {
  return linesBlock.match(/<button\b[\s\S]*?<\/button>/g) ?? [];
}

describe("Overlays.tsx — SearchOverlay entrypoint", () => {
  it("destructures setSelectedProduct (and no longer pulls add) from useStore", () => {
    const destructure = searchSection.match(/const\s*\{\s*[\s\S]*?\}\s*=\s*useStore\(\)/);
    assert.ok(destructure, "SearchOverlay must call useStore()");
    assert.match(
      destructure![0],
      /\bsetSelectedProduct\b/,
      "SearchOverlay must destructure setSelectedProduct from useStore",
    );
    assert.doesNotMatch(
      destructure![0],
      /\badd\b/,
      "SearchOverlay must not pull add() from useStore anymore",
    );
    assert.match(destructure![0], /\bsetSearchOpen\b/, "setSearchOpen still required");
    assert.match(destructure![0], /\ballProducts\b/, "allProducts still required");
  });

  it("result click source wires the overlay action helper with p / setSearchOpen / setSelectedProduct and never calls add()", () => {
    const mapStart = searchSection.indexOf("results.map((p) => (");
    assert.ok(mapStart >= 0, "results.map must exist in SearchOverlay");
    const slice = searchSection.slice(mapStart);

    // Structural wiring check: this test only proves the JSX wires the helper
    // with the right arguments. Runtime event order is asserted in
    // tests/overlay-actions.test.ts.
    assert.match(
      slice,
      /openProductFromOverlay\(\s*p\s*,\s*setSearchOpen\s*,\s*setSelectedProduct\s*\)/,
      "result click must invoke openProductFromOverlay(p, setSearchOpen, setSelectedProduct)",
    );
    assert.doesNotMatch(
      slice,
      /\badd\s*\(/,
      "result click must not call add(...) — opening ProductDetail must not mutate the cart",
    );
    assert.doesNotMatch(
      slice,
      /p\.sizes\[Math\.floor\(p\.sizes\.length\s*\/\s*2\)\]/,
      "result click must not auto-pick an arbitrary middle size",
    );
  });

  it("result button exposes an accessible aria-label", () => {
    const mapStart = searchSection.indexOf("results.map((p) => (");
    const slice = searchSection.slice(mapStart);
    assert.match(
      slice,
      /aria-label=\{`Ver detalle de \$\{p\.brand\} \$\{p\.name\}`\}/,
      "result button must have aria-label naming the product",
    );
  });
});

describe("Overlays.tsx — CartDrawer entrypoint", () => {
  it("destructures setSelectedProduct from useStore", () => {
    const destructure = cartSection.match(/const\s*\{\s*[\s\S]*?\}\s*=\s*useStore\(\)/);
    assert.ok(destructure, "CartDrawer must call useStore()");
    assert.match(
      destructure![0],
      /\bsetSelectedProduct\b/,
      "CartDrawer must destructure setSelectedProduct from useStore",
    );
  });

  it("cart line product image is wrapped in a clickable button with aria-label", () => {
    const linesBlock = getCartLinesBlock();
    const [imageButton] = getCartLineButtons(linesBlock);
    assert.ok(imageButton, "cart line image button must exist");
    assert.match(
      imageButton,
      /onClick=\{\s*([A-Za-z_$][\w$]*)\s*\}/,
      "cart line product image must use the per-line product handler",
    );
    assert.match(
      imageButton,
      /aria-label=\{lineProductAriaLabel\}/,
      "cart line product image must use the shared product aria-label",
    );
    assert.match(
      imageButton,
      /<img[\s\S]*?l\.variant\?\.image\s*\|\|\s*l\.product\.image[\s\S]*?<\/button>/,
      "cart line product image must remain inside its button",
    );
  });

  it("cart line brand/name/variant text is wrapped in a clickable button with matching aria context", () => {
    const linesBlock = getCartLinesBlock();
    const [, infoButton] = getCartLineButtons(linesBlock);
    assert.ok(infoButton, "cart line info button must exist");
    assert.match(
      infoButton,
      /onClick=\{\s*([A-Za-z_$][\w$]*)\s*\}/,
      "cart line info must use the per-line product handler",
    );
    assert.match(
      infoButton,
      /aria-label=\{lineProductAriaLabel\}/,
      "cart line info must use the shared product aria-label",
    );
    assert.match(
      infoButton,
      /<span[\s\S]*?l\.product\.name[\s\S]*?l\.variant[\s\S]*?<\/button>/,
      "cart line brand/name/variant must remain inside the clickable info button",
    );
  });

  it("cart line product buttons share product and variant/size aria context", () => {
    const linesBlock = getCartLinesBlock();
    const productButtons = getCartLineButtons(linesBlock).slice(0, 2);
    assert.equal(
      productButtons.length,
      2,
      "expected image and info product buttons for each cart line",
    );

    const ariaLabels = productButtons.map((button, index) => {
      const match = button.match(/aria-label=\{([^}]+)\}/);
      assert.ok(match, `cart line product button ${index + 1} must have an aria-label`);
      return match![1];
    });
    assert.equal(
      ariaLabels[0],
      ariaLabels[1],
      "cart line image and info buttons must use the same aria-label expression",
    );
    assert.match(
      linesBlock,
      /const\s+lineProductContext\s*=\s*l\.variant\s*\?\s*`Variante \$\{l\.variant\.label\}`\s*:\s*`Talle \$\{l\.size\}`/,
      "cart line aria context must include a capitalized Talle fallback",
    );
    assert.match(
      linesBlock,
      /const\s+lineProductAriaLabel\s*=\s*`Ver detalle de \$\{l\.product\.brand\} \$\{l\.product\.name\}, \$\{lineProductContext\}`/,
      "cart line aria-label must include the product and variant/size context",
    );
  });

  it("both cart line product handlers' source wires the overlay action helper with l.product / setCartOpen / setSelectedProduct and never calls add()", () => {
    const linesBlock = getCartLinesBlock();
    const productButtons = getCartLineButtons(linesBlock).slice(0, 2);
    assert.equal(productButtons.length, 2, "expected image and info product buttons");

    const handlerNames = productButtons.map((button, index) => {
      const match = button.match(/onClick=\{\s*([A-Za-z_$][\w$]*)\s*\}/);
      assert.ok(match, `cart line product button ${index + 1} must have an onClick handler`);
      return match![1];
    });
    assert.equal(
      handlerNames[0],
      handlerNames[1],
      "both cart line product buttons must share the per-line handler",
    );

    // Structural wiring check: arrow body may be a block { ... } OR a single
    // expression. Match either, and then assert the helper wiring inside it.
    // Runtime event order is asserted in tests/overlay-actions.test.ts.
    const handler = linesBlock.match(
      /const\s+([A-Za-z_$][\w$]*)\s*=\s*\(\)\s*=>\s*(?:\{[\s\S]*?\}|openProductFromOverlay\([\s\S]*?\);)/,
    );
    assert.ok(handler, "CartDrawer must define a local per-line product handler");
    assert.equal(handler![1], handlerNames[0], "both buttons must reference that local handler");
    assert.match(
      handler![0],
      /openProductFromOverlay\(\s*l\.product\s*,\s*setCartOpen\s*,\s*setSelectedProduct\s*\)/,
      "product handler must wire l.product through openProductFromOverlay with setCartOpen + setSelectedProduct",
    );
    assert.doesNotMatch(handler![0], /\badd\s*\(/, "product handler must not call add()");
    for (const button of productButtons) {
      assert.doesNotMatch(button, /\badd\s*\(/, "product button must not call add()");
    }
  });

  it("preserves qty, remove, and variant/size display controls", () => {
    const linesBlock = getCartLinesBlock();
    assert.match(
      linesBlock,
      /setQty\(\s*l\.key,\s*l\.qty\s*-\s*1\s*\)/,
      "Restar control preserved",
    );
    assert.match(
      linesBlock,
      /setQty\(\s*l\.key,\s*l\.qty\s*\+\s*1\s*\)/,
      "Sumar control preserved",
    );
    assert.match(linesBlock, /remove\(\s*l\.key\s*\)/, "Quitar control preserved");
    assert.match(
      linesBlock,
      /l\.variant\s*\?\s*l\.variant\.label\s*:\s*`Talle \$\{l\.size\}`/,
      "variant label / size display preserved in the clickable info block",
    );
    assert.match(
      linesBlock,
      /uy\(\s*l\.product\.price\s*\*\s*l\.qty\s*\)/,
      "line subtotal preserved",
    );
  });

  it("does not nest buttons: cart line click target is a sibling of qty / remove", () => {
    const linesBlock = getCartLinesBlock();
    // We expect at least 5 sibling buttons per cart line: image, info, restar, sumar, quitar.
    const openButtons = getCartLineButtons(linesBlock);
    assert.ok(
      openButtons.length >= 5,
      `expected >=5 buttons per cart line (image, info, restar, sumar, quitar), got ${openButtons.length}`,
    );
    for (const btn of openButtons) {
      // Skip past this button's own opening <button ...> tag before checking for nested <button>.
      const ownOpenEnd = btn.indexOf(">");
      assert.ok(ownOpenEnd >= 0, "each <button must have a matching closing >");
      const body = btn.slice(ownOpenEnd + 1);
      const innerButtonMatches = body.match(/<button\b/g);
      assert.equal(
        innerButtonMatches,
        null,
        `found nested <button> inside another button: ${btn.slice(0, 80)}...`,
      );
    }
  });

  it("preserves save-cart and checkout controls at the drawer level", () => {
    assert.match(cartSection, /handleSaveCart/, "save-cart handler preserved");
    assert.match(cartSection, />\s*Guardar\s*</, "save-cart button label preserved");
    assert.match(cartSection, /Finalizar compra/, "checkout button label preserved");
    assert.match(
      cartSection,
      /window\.location\.hash\s*=\s*"#checkout"/,
      "checkout navigation preserved",
    );
  });
});
