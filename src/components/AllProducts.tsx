import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { ProductCard } from "./ProductCard";
import { Reveal, SectionHead } from "./ui";

export function AllProducts() {
  const { products, brandFilter, setBrandFilter } = useStore();

  // Estados de filtros adicionales
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Marcas únicas
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
  }, [products]);

  // Categorías únicas
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  // Talles únicos disponibles en los productos
  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (Array.isArray(p.sizes)) {
        for (const s of p.sizes) set.add(String(s));
      }
    }
    return Array.from(set).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [products]);

  // Colores / Variantes únicas
  const uniqueColors = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v.name) set.add(v.name.trim());
        }
      }
    }
    return Array.from(set);
  }, [products]);

  // Rango máximo de precios
  const highestPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  // Conteo de filtros activos
  const activeCount =
    (brandFilter ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (sizeFilter ? 1 : 0) +
    (colorFilter ? 1 : 0) +
    (maxPrice !== null && maxPrice < highestPrice ? 1 : 0);

  const clearAllFilters = () => {
    setBrandFilter(null);
    setCategoryFilter(null);
    setSizeFilter(null);
    setColorFilter(null);
    setMaxPrice(null);
  };

  // Filtrado compuesto
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (sizeFilter && (!p.sizes || !p.sizes.map(String).includes(sizeFilter))) return false;
      if (colorFilter) {
        const hasColor = p.variants?.some(
          (v) => v.name.toLowerCase().includes(colorFilter.toLowerCase())
        );
        if (!hasColor) return false;
      }
      if (maxPrice !== null && p.price > maxPrice) return false;
      return true;
    });
  }, [products, brandFilter, categoryFilter, sizeFilter, colorFilter, maxPrice]);

  return (
    <section id="productos" className="py-14 md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Todos los productos" link="Ver nuevos" />
        </Reveal>

        {/* Toolbar de Filtros */}
        <Reveal className="mt-6 md:mt-8">
          {/* Botón de toggle en móvil */}
          <div className="flex items-center justify-between gap-4 md:hidden">
            <button
              type="button"
              onClick={() => setShowFiltersMobile((prev) => !prev)}
              className="flex items-center gap-2 border border-ink/20 bg-bone px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              <span>Filtros</span>
              {activeCount > 0 && (
                <span className="grid h-4 w-4 place-items-center rounded-full bg-gold-500 text-[10px] text-ink">
                  {activeCount}
                </span>
              )}
            </button>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-smoke hover:text-ink"
              >
                Limpiar ({activeCount})
              </button>
            )}
          </div>

          {/* Panel de Filtros completo */}
          <div
            className={`mt-4 space-y-4 border-y border-ink/10 py-5 transition-all md:block ${
              showFiltersMobile ? "block" : "hidden md:block"
            }`}
          >
            {/* Fila 1: Marcas y Categorías */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Categorías */}
              {uniqueCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                    Categoría:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <Chip
                      active={categoryFilter === null}
                      onClick={() => setCategoryFilter(null)}
                    >
                      Todas
                    </Chip>
                    {uniqueCategories.map((cat) => (
                      <Chip
                        key={cat}
                        active={categoryFilter === cat}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Marcas */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                  Marca:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Chip
                    active={brandFilter === null}
                    onClick={() => setBrandFilter(null)}
                  >
                    Todas
                  </Chip>
                  {uniqueBrands.map((brand) => (
                    <Chip
                      key={brand}
                      active={brandFilter === brand}
                      onClick={() => setBrandFilter(brand)}
                    >
                      {brand}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Fila 2: Talles, Colores y Precio */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
              <div className="flex flex-wrap items-center gap-4">
                {/* Talles */}
                {uniqueSizes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                      Talle:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <Chip
                        active={sizeFilter === null}
                        onClick={() => setSizeFilter(null)}
                      >
                        Todos
                      </Chip>
                      {uniqueSizes.map((s) => (
                        <Chip
                          key={s}
                          active={sizeFilter === s}
                          onClick={() => setSizeFilter(s)}
                        >
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colores */}
                {uniqueColors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                      Color:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <Chip
                        active={colorFilter === null}
                        onClick={() => setColorFilter(null)}
                      >
                        Todos
                      </Chip>
                      {uniqueColors.map((c) => (
                        <Chip
                          key={c}
                          active={colorFilter === c}
                          onClick={() => setColorFilter(c)}
                        >
                          {c}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Reset en desktop */}
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-smoke hover:text-ink md:block"
                >
                  Limpiar filtros ({activeCount})
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Listado o mensaje de filtro vacío */}
        {filtered.length === 0 ? (
          <div className="mt-12 rounded-sm border border-ink/10 p-8 text-center">
            <p className="text-[15px] font-semibold text-ink">
              No encontramos productos con los filtros seleccionados.
            </p>
            <p className="mt-1 text-[13px] text-smoke">
              Probá quitar o cambiar los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 bg-ink px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-bone"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ease-out ${
        active
          ? "border-gold-500 bg-gold-500 text-ink"
          : "border-ink/15 bg-bone text-ink/80 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
