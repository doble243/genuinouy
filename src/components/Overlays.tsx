import { useEffect, useMemo, useRef, useState } from "react";
import { uy } from "../lib/data";
import { useStore } from "../lib/store";
import { openProductFromOverlay } from "../lib/overlayActions";
import { Arrow, Close, Heart, LogoWatermark, Minus, Plus, Search } from "./ui";
import { currentCustomer } from "../lib/customerSession";
import {
  listSavedCarts,
  saveCart,
  deleteSavedCart,
  type SavedCart,
  type SavedCartLine,
} from "../lib/savedCarts";

/* ------------------------- CARRITO ------------------------- */
export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    lines,
    setQty,
    remove,
    add,
    total,
    count,
    notify,
    setSelectedProduct,
  } = useStore();
  const free = total >= 4500;
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [savingName, setSavingName] = useState("");
  const [savedExpanded, setSavedExpanded] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const customerId = useMemo(() => currentCustomer()?.id || null, [cartOpen]);

  const refreshSaved = useMemo(
    () => async () => {
      setLoadingSaved(true);
      try {
        const rows = await listSavedCarts(customerId);
        setSavedCarts(rows);
      } finally {
        setLoadingSaved(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    if (cartOpen) refreshSaved();
  }, [cartOpen, refreshSaved]);

  const lineSnapshots: SavedCartLine[] = useMemo(
    () =>
      lines.map((l) => ({
        productId: l.product.id,
        productName: l.product.name,
        productBrand: l.product.brand,
        productImage: l.product.image,
        productPrice: l.product.price,
        size: l.size,
        qty: l.qty,
      })),
    [lines],
  );

  const handleSaveCart = async () => {
    if (!lines.length) return;
    const name = savingName.trim() || `Carrito ${new Date().toLocaleDateString("es-UY")}`;
    const res = await saveCart(customerId, name, lineSnapshots);
    if (res.ok) {
      notify(`Guardamos "${name}"`, "success", "Carrito guardado");
      setSavingName("");
      refreshSaved();
    } else {
      notify(res.error || "No se pudo guardar", "error");
    }
  };

  const handleLoadSaved = (sc: SavedCart) => {
    if (!Array.isArray(sc.items) || sc.items.length === 0) return;
    let added = 0;
    for (const it of sc.items) {
      // we need a Product-like object for store.add(); build minimal version
      const product = {
        id: it.productId,
        name: it.productName,
        brand: it.productBrand || "",
        price: it.productPrice,
        image: it.productImage || "",
        hover: it.productImage || "",
        sizes: [it.size],
      } as any;
      for (let i = 0; i < it.qty; i++) {
        add(product, it.size);
        added += 1;
      }
    }
    notify(
      added === 1 ? "1 producto cargado" : `${added} productos cargados`,
      "success",
      sc.name,
    );
  };

  const handleDeleteSaved = async (id: string) => {
    const ok = await deleteSavedCart(id);
    if (ok) {
      notify("Carrito eliminado", "info");
      refreshSaved();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[80] ${cartOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!cartOpen}
    >
      <div
        onClick={() => setCartOpen(false)}
        className={`absolute inset-0 bg-obsidian/50 transition-opacity duration-300 ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-bone transition-transform duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Carrito"
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink/8 px-5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.18em]">
            Carrito {count > 0 && <span className="text-smoke">({count})</span>}
          </h2>
          <button
            aria-label="Cerrar carrito"
            onClick={() => setCartOpen(false)}
            className="grid h-10 w-10 place-items-center text-ink/70 transition-colors hover:text-ink"
          >
            <Close className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
            <LogoWatermark
              tone="dark"
              opacity={0.04}
              className="absolute left-1/2 top-1/2 w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
            <p className="relative text-[15px] font-semibold">
              Tu carrito está vacío
            </p>
            <p className="relative mt-1.5 text-[13px] text-smoke">
              Empezá por los recién llegados.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="relative mt-6 bg-ink px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-bone"
            >
              Seguir viendo
            </button>

            {savedCarts.length > 0 && (
              <div className="relative mt-8 w-full px-2 text-left">
                <button
                  onClick={() => setSavedExpanded((v) => !v)}
                  className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-smoke"
                >
                  <span>Tus carritos guardados ({savedCarts.length})</span>
                  <span>{savedExpanded ? "−" : "+"}</span>
                </button>
                {savedExpanded && (
                  <ul className="mt-3 space-y-2">
                    {savedCarts.map((sc) => (
                      <li
                        key={sc.id}
                        className="flex items-center justify-between border border-ink/12 px-3 py-2 text-[12px]"
                      >
                        <span className="truncate">{sc.name}</span>
                        <button
                          onClick={() => handleLoadSaved(sc)}
                          className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-2 hover:underline"
                        >
                          Cargar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {savedCarts.length > 0 && (
              <div className="border-b border-ink/8 px-5 py-3">
                <button
                  onClick={() => setSavedExpanded((v) => !v)}
                  className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-smoke"
                >
                  <span>
                    Carritos guardados ({savedCarts.length})
                  </span>
                  <span>{savedExpanded ? "−" : "+"}</span>
                </button>
                {savedExpanded && (
                  <ul className="mt-3 space-y-1.5">
                    {savedCarts.map((sc) => (
                      <li
                        key={sc.id}
                        className="flex items-center justify-between gap-2 border border-ink/12 px-3 py-2 text-[12px]"
                      >
                        <span className="truncate font-semibold">{sc.name}</span>
                        <span className="text-[10.5px] text-smoke">
                          {sc.items.length} ítem{sc.items.length === 1 ? "" : "s"}
                        </span>
                        <div className="flex shrink-0 gap-2 text-[11px]">
                          <button
                            onClick={() => handleLoadSaved(sc)}
                            className="font-semibold uppercase tracking-[0.12em] text-ink underline-offset-2 hover:underline"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => handleDeleteSaved(sc.id)}
                            className="text-smoke underline-offset-2 hover:text-ink hover:underline"
                          >
                            Borrar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5">
              {lines.map((l) => {
                const openProduct = () =>
                  openProductFromOverlay(l.product, setCartOpen, setSelectedProduct);
                const lineProductContext = l.variant
                  ? `Variante ${l.variant.label}`
                  : `Talle ${l.size}`;
                const lineProductAriaLabel = `Ver detalle de ${l.product.brand} ${l.product.name}, ${lineProductContext}`;

                return (
                  <div
                    key={l.key}
                    className="flex gap-4 border-b border-ink/8 py-4"
                  >
                    <button
                      type="button"
                      onClick={openProduct}
                      className="shrink-0"
                      aria-label={lineProductAriaLabel}
                    >
                      <img
                        src={l.variant?.image || l.product.image}
                        alt=""
                        className="h-24 w-20 bg-bone-200 object-cover"
                        loading="lazy"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={openProduct}
                        className="-mx-1 block w-[calc(100%+0.5rem)] px-1 py-0.5 text-left transition-colors hover:bg-bone-200"
                        aria-label={lineProductAriaLabel}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">
                          {l.product.brand}
                        </span>
                        <span className="mt-0.5 block truncate text-[14px] font-semibold">
                          {l.product.name}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-smoke">
                          {l.variant
                            ? l.variant.label
                            : `Talle ${l.size}`}
                        </span>
                      </button>
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center border border-ink/12">
                          <button
                            aria-label="Restar"
                            onClick={() => setQty(l.key, l.qty - 1)}
                            className="grid h-8 w-8 place-items-center text-ink/70 hover:text-ink"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-[13px] font-semibold">
                            {l.qty}
                          </span>
                          <button
                            aria-label="Sumar"
                            onClick={() => setQty(l.key, l.qty + 1)}
                            className="grid h-8 w-8 place-items-center text-ink/70 hover:text-ink"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[14px] font-bold">
                          {uy(l.product.price * l.qty)}
                        </span>
                      </div>
                      <button
                        onClick={() => remove(l.key)}
                        className="mt-2 text-[11px] text-smoke underline underline-offset-2 hover:text-ink"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="shrink-0 border-t border-ink/8 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-smoke">Subtotal</span>
                <span className="text-[20px] font-extrabold tracking-[-0.02em]">
                  {uy(total)}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-smoke">
                {free ? (
                  <span className="font-semibold text-gold-600">
                    Envío bonificado a todo el país
                  </span>
                ) : (
                  "Envío calculado al finalizar la compra"
                )}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  placeholder="Nombre del carrito"
                  className="flex-1 border border-ink/15 bg-transparent px-3 py-2 text-[12.5px] outline-none transition-colors focus:border-ink"
                />
                <button
                  onClick={handleSaveCart}
                  disabled={loadingSaved}
                  className="shrink-0 border border-ink/15 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/80 transition-colors hover:border-ink hover:bg-ink hover:text-bone disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  window.location.hash = "#checkout";
                }}
                className="group mt-3 flex w-full items-center justify-center gap-2 bg-ink py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-bone transition-colors hover:bg-obsidian"
              >
                Finalizar compra
                <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------- FAVORITOS ------------------------- */
export function WishDrawer() {
  const {
    wishOpen,
    setWishOpen,
    wishProducts,
    toggleWish,
    clearWish,
    add,
    setSelectedProduct,
  } = useStore();

  return (
    <div
      className={`fixed inset-0 z-[80] ${wishOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!wishOpen}
    >
      <div
        onClick={() => setWishOpen(false)}
        className={`absolute inset-0 bg-obsidian/50 transition-opacity duration-300 ${
          wishOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-bone transition-transform duration-[380ms] ease-[var(--ease-out-expo)] ${
          wishOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Favoritos"
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink/8 px-5">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.18em]">
            Favoritos{" "}
            {wishProducts.length > 0 && (
              <span className="text-smoke">({wishProducts.length})</span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            {wishProducts.length > 0 && (
              <button
                onClick={clearWish}
                className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                Vaciar
              </button>
            )}
            <button
              aria-label="Cerrar favoritos"
              onClick={() => setWishOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>
        </header>

        {wishProducts.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
            <LogoWatermark
              tone="dark"
              opacity={0.04}
              className="absolute left-1/2 top-1/2 w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
            <Heart className="relative h-7 w-7 text-smoke" />
            <p className="relative mt-3 text-[15px] font-semibold">
              Todavía no guardaste nada
            </p>
            <p className="relative mt-1.5 text-[13px] text-smoke">
              Tocá el corazón en cualquier par para guardarlo acá.
            </p>
            <button
              onClick={() => setWishOpen(false)}
              className="relative mt-6 bg-ink px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-obsidian"
            >
              Ver championes
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {wishProducts.map((p) => (
              <div key={p.id} className="flex gap-4 border-b border-ink/8 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setWishOpen(false);
                    setSelectedProduct(p);
                  }}
                  className="shrink-0"
                  aria-label={`Ver ${p.brand} ${p.name}`}
                >
                  <img
                    src={p.image}
                    alt=""
                    className="h-24 w-20 bg-bone-200 object-cover"
                    loading="lazy"
                  />
                </button>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">
                    {p.brand}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[14px] font-bold">{uy(p.price)}</p>

                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setWishOpen(false);
                        add(p, p.sizes[Math.floor(p.sizes.length / 2)]);
                      }}
                      disabled={p.inStock === false}
                      className="border border-ink/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/80 transition-colors hover:border-ink hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink/80"
                    >
                      {p.inStock === false ? "Sin stock" : "Agregar"}
                    </button>
                    <button
                      onClick={() => toggleWish(p.id)}
                      className="text-[11px] text-smoke underline underline-offset-2 transition-colors hover:text-ink"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

/* ------------------------- BUSCADOR ------------------------- */
const SUGGEST = ["Air Jordan 1", "New Balance 574", "Retro running", "Ofertas"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSelectedProduct, allProducts } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
    setQ("");
  }, [searchOpen]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const seen = new Set<string>();
    return allProducts
      .filter((p) => {
        const hit = `${p.brand} ${p.name}`.toLowerCase().includes(s);
        if (!hit || seen.has(p.brand + p.name)) return false;
        seen.add(p.brand + p.name);
        return true;
      })
      .slice(0, 6);
  }, [q, allProducts]);

  return (
    <div
      className={`fixed inset-0 z-[85] ${searchOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!searchOpen}
    >
      <div
        onClick={() => setSearchOpen(false)}
        className={`absolute inset-0 bg-obsidian/50 transition-opacity duration-300 ${
          searchOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 top-0 bg-bone transition-transform duration-[340ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          searchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        role="dialog"
        aria-label="Buscar"
      >
        <div className="edge mx-auto max-w-[1000px] py-4 md:py-6">
          <div className="flex items-center gap-3 border-b border-ink/15 pb-3">
            <Search className="h-5 w-5 shrink-0 text-smoke" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar championes, marcas…"
              className="w-full bg-transparent text-[17px] font-medium tracking-[-0.01em] outline-none placeholder:text-smoke/70 md:text-[22px]"
            />
            <button
              aria-label="Cerrar búsqueda"
              onClick={() => setSearchOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center text-ink/70 hover:text-ink"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          {!q && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
              {SUGGEST.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="text-[13px] font-medium text-smoke transition-colors hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {q && (
            <div className="max-h-[60vh] overflow-y-auto pt-3">
              {results.length === 0 ? (
                <p className="py-6 text-[14px] text-smoke">
                  Sin resultados para “{q}”.
                </p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      openProductFromOverlay(p, setSearchOpen, setSelectedProduct)
                    }
                    aria-label={`Ver detalle de ${p.brand} ${p.name}`}
                    className="flex w-full items-center gap-4 border-b border-ink/6 py-3 text-left transition-colors hover:bg-bone-200"
                  >
                    <img
                      src={p.image}
                      alt=""
                      className="h-14 w-14 shrink-0 bg-bone-200 object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">
                        {p.brand}
                      </span>
                      <span className="block truncate text-[14px] font-semibold">
                        {p.name}
                      </span>
                    </span>
                    <span className="text-[14px] font-bold">{uy(p.price)}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
