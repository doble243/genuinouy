import { useEffect, useMemo, useState } from "react";
import { uy, type Product, type ProductVariant } from "../lib/data";
import { useStore } from "../lib/store";
import { ChevronLeft, ChevronRight, Close, Heart } from "./ui";
import { ProductCard } from "./ProductCard";

export function ProductDetail() {
  const {
    selectedProduct,
    setSelectedProduct,
    products,
    add,
    notify,
    wish,
    toggleWish,
  } = useStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const open = selectedProduct !== null;
  const product = selectedProduct;
  const liked = product !== null && wish.includes(product.id);

  const hasVariants = !!(
    product?.variants && product.variants.length > 0
  );

  // Reset local state whenever the selected product changes
  useEffect(() => {
    setSelectedSize(null);
    setSelectedVariant(null);
    setActiveImage(product?.image ?? null);
  }, [product?.id, product?.image]);

  const images = useMemo<string[]>(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      list.push(...product.images);
    }
    if (!list.includes(product.image)) list.unshift(product.image);
    if (!list.includes(product.hover)) list.push(product.hover);
    // dedupe
    return Array.from(new Set(list));
  }, [product]);

  const related = useMemo<Product[]>(() => {
    if (!product) return [];
    return products
      .filter((p) => p.brand === product.brand && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  // Either pick a variant (preferred when present) or a fallback size from
  // the legacy sizes[] array. canAdd requires ONE of them.
  const canAdd =
    product !== null &&
    product.inStock !== false &&
    (selectedVariant !== null || selectedSize !== null);

  const currentIndex = useMemo(() => {
    if (!product) return -1;
    return products.findIndex((p) => p.id === product.id);
  }, [product, products]);

  const prevProduct = useMemo(() => {
    if (currentIndex <= 0) return null;
    return products[currentIndex - 1];
  }, [currentIndex, products]);

  const nextProduct = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= products.length - 1) return null;
    return products[currentIndex + 1];
  }, [currentIndex, products]);

  function close() {
    setSelectedProduct(null);
  }

  function handleAdd() {
    if (!product) return;
    if (selectedVariant) {
      add(
        product,
        selectedVariant.value,
        selectedVariant,
      );
      notify(
        `${product.name} (${selectedVariant.label}) agregado al carrito`,
        "success",
        "Carrito",
      );
    } else if (selectedSize) {
      add(product, selectedSize);
      notify(
        `${product.name} (talle ${selectedSize}) agregado al carrito`,
        "success",
        "Carrito",
      );
    } else {
      return;
    }
    close();
  }

  /**
   * When a variant is selected, swap the main image to the variant photo
   * (if assigned). This is what gives the customer visual confirmation
   * they picked the right colorway / size.
   */
  function pickVariant(v: ProductVariant) {
    setSelectedVariant(v);
    setActiveImage(v.image || activeImage || product?.image || null);
  }

  function pickSize(size: string) {
    setSelectedSize(size);
    setSelectedVariant(null);
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-obsidian/55 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-bone shadow-2xl transition-transform duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)] md:max-w-[560px] lg:max-w-[640px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Detalle del producto"
      >
        {product && (
          <>
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink/8 px-5">
              <div className="flex items-center gap-1">
                <button
                  aria-label="Producto anterior"
                  onClick={() => prevProduct && setSelectedProduct(prevProduct)}
                  disabled={!prevProduct}
                  className={`grid h-10 w-10 place-items-center transition-colors ${
                    prevProduct
                      ? "text-ink/70 hover:text-ink"
                      : "cursor-not-allowed text-ink/20"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Producto siguiente"
                  onClick={() => nextProduct && setSelectedProduct(nextProduct)}
                  disabled={!nextProduct}
                  className={`grid h-10 w-10 place-items-center transition-colors ${
                    nextProduct
                      ? "text-ink/70 hover:text-ink"
                      : "cursor-not-allowed text-ink/20"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
                Detalle
              </p>
              <button
                aria-label="Cerrar detalle"
                onClick={close}
                className="grid h-10 w-10 place-items-center text-ink/70 transition-colors hover:text-ink"
              >
                <Close className="h-5 w-5" />
              </button>
            </header>

            {/* Body: scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              <div className="relative overflow-hidden bg-bone-200">
                <div className="aspect-[4/5] w-full">
                  <img
                    src={activeImage ?? product.image}
                    alt={`${product.brand} ${product.name}`}
                    className="h-full w-full object-cover transition-opacity duration-500"
                    key={activeImage ?? product.image}
                  />
                </div>
                {product.compareAt && (
                  <span className="absolute left-3 top-3 bg-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                    Oferta
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="track no-scrollbar flex gap-2 overflow-x-auto px-5 pt-3">
                  {images.map((src) => {
                    const isActive = (activeImage ?? product.image) === src;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActiveImage(src)}
                        aria-label="Cambiar imagen"
                        className={`h-16 w-16 shrink-0 overflow-hidden border transition-colors duration-200 ${
                          isActive ? "border-ink" : "border-ink/10 hover:border-ink/40"
                        }`}
                      >
                        <img
                          src={src}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Meta */}
              <div className="px-5 pb-6 pt-5 md:px-7">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                  {product.brand}
                </p>
                <h2 className="mt-1.5 text-[24px] font-extrabold leading-[1.05] tracking-[-0.025em] md:text-[32px]">
                  {product.name}
                </h2>

                <div className="mt-4 flex items-baseline gap-3">
                  <span
                    className={`text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px] ${
                      product.compareAt ? "text-gold-600" : "text-ink"
                    }`}
                  >
                    {uy(product.price)}
                  </span>
                  {product.compareAt && (
                    <span className="text-[14px] text-smoke line-through">
                      {uy(product.compareAt)}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <p
                  className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    product.inStock === false ? "text-smoke" : "text-ink/70"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.inStock === false ? "bg-smoke" : "bg-gold-500"
                    }`}
                  />
                  {product.inStock === false ? "Sin stock" : "Disponible"}
                </p>

                {/* Description */}
                {product.description && (
                  <p className="mt-5 text-[13.5px] leading-relaxed text-ink/80">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="border-t border-ink/8 px-5 pb-8 pt-6 md:px-7">
                  <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
                    Productos relacionados
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {related.map((rp) => (
                      <ProductCard key={rp.id} p={rp} size="sm" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky bottom action area — always visible on mobile */}
            <div className="shrink-0 border-t border-ink/8 bg-bone/95 px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] backdrop-blur-md shadow-[0_-12px_28px_-18px_rgba(0,0,0,0.18)] md:px-7 md:pt-5">
              {hasVariants ? (
                <>
                  <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
                    Variantes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product!.variants!.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const disabled = v.in_stock === false;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => pickVariant(v)}
                          title={disabled ? "Agotado" : v.label}
                          className={`group flex items-center gap-2 border px-2.5 py-2 text-[12.5px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                            disabled
                              ? "cursor-not-allowed border-ink/8 bg-bone-200 text-smoke"
                              : isSelected
                                ? "border-gold-500 bg-gold-500 text-ink"
                                : "border-ink/15 bg-bone text-ink hover:border-ink"
                          }`}
                        >
                          <span className="h-7 w-7 shrink-0 overflow-hidden bg-bone-300 border border-ink/10">
                            {v.image ? (
                              <img
                                src={v.image}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-[10px] text-smoke">
                                —
                              </span>
                            )}
                          </span>
                          <span className="font-bold">{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
                    Talle
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      const disabled = product.inStock === false;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={disabled}
                          onClick={() => pickSize(s)}
                          className={`min-w-[52px] border px-3 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                            disabled
                              ? "cursor-not-allowed border-ink/8 bg-bone-200 text-smoke"
                              : isSelected
                              ? "border-gold-500 bg-gold-500 text-ink"
                              : "border-ink/15 bg-bone text-ink hover:border-ink"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!canAdd}
                  className={`flex-1 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                    canAdd
                      ? "bg-ink text-bone hover:bg-gold-500 hover:text-ink"
                      : "cursor-not-allowed bg-ink/15 text-smoke"
                  }`}
                >
                  {selectedVariant
                    ? `Agregar al carrito · ${selectedVariant.label}`
                    : "Agregar al carrito"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWish(selectedProduct.id)}
                  aria-pressed={liked}
                  aria-label={
                    liked ? "Quitar de favoritos" : "Guardar en favoritos"
                  }
                  className={`grid w-14 shrink-0 place-items-center border transition-colors duration-300 ${
                    liked
                      ? "border-gold-500 text-gold-600"
                      : "border-ink/15 text-ink/70 hover:border-ink hover:text-ink"
                  }`}
                >
                  <Heart
                    className="h-5 w-5"
                    fill={liked ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
