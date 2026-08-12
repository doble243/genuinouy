import { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { ProductCard } from "./ProductCard";
import { Reveal, SectionHead } from "./ui";
import { uy } from "../lib/data";

/**
 * Catálogo de productos con filtros unificados.
 *
 * Filtros disponibles: Modelo (derivado de `category` del CSV — columna
 * "Categoría/Modelo"), Marca, Talle, Color y Precio máx.
 *
 * Nota de datos: la columna original mezcla marcas y el flag "Nuevos
 * Ingresos" dentro de "Categoría". Para que los filtros no se repitan,
 * "Modelo" excluye:
 *   - cualquier valor que ya sea una marca (Adidas, LV, New Balance, …)
 *   - el flag "Nuevos Ingresos" (no es un modelo)
 * y así solo quedan los modelos reales (Campus, Samba, Dunk, …).
 *
 * En desktop los filtros son una grilla de selects uniformes (alineada);
 * en mobile se abren en un bottom sheet con secciones plegables.
 */
export function AllProducts() {
  const { products, brandFilter, setBrandFilter } = useStore();

  // Estados de filtros adicionales
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Marcas únicas
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
  }, [products]);

  // Modelos únicos: categorías del CSV menos marcas y el flag "Nuevos Ingresos".
  const uniqueModels = useMemo(() => {
    const brandSet = new Set(uniqueBrands);
    return Array.from(
      new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))
    )
      .filter((cat) => cat !== "Nuevos Ingresos" && !brandSet.has(cat))
      .sort((a, b) => a.localeCompare(b));
  }, [products, uniqueBrands]);

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
    (modelFilter ? 1 : 0) +
    (sizeFilter ? 1 : 0) +
    (colorFilter ? 1 : 0) +
    (maxPrice !== null && maxPrice < highestPrice ? 1 : 0);

  const clearAllFilters = () => {
    setBrandFilter(null);
    setModelFilter(null);
    setSizeFilter(null);
    setColorFilter(null);
    setMaxPrice(null);
  };

  // Filtrado compuesto
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (modelFilter && p.category !== modelFilter) return false;
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
  }, [products, brandFilter, modelFilter, sizeFilter, colorFilter, maxPrice]);

  return (
    <section id="productos" className="py-14 md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Todos los productos" link="Ver nuevos" />
        </Reveal>

        <Reveal className="mt-6 md:mt-8">
          <ProductFilters
            uniqueBrands={uniqueBrands}
            uniqueModels={uniqueModels}
            uniqueSizes={uniqueSizes}
            uniqueColors={uniqueColors}
            highestPrice={highestPrice}
            activeCount={activeCount}
            filteredCount={filtered.length}
            brandFilter={brandFilter}
            modelFilter={modelFilter}
            sizeFilter={sizeFilter}
            colorFilter={colorFilter}
            maxPrice={maxPrice}
            showMobile={showFiltersMobile}
            onToggleMobile={() => setShowFiltersMobile((prev) => !prev)}
            onCloseMobile={() => setShowFiltersMobile(false)}
            onBrandChange={setBrandFilter}
            onModelChange={setModelFilter}
            onSizeChange={setSizeFilter}
            onColorChange={setColorFilter}
            onMaxPriceChange={setMaxPrice}
            onClearAll={clearAllFilters}
          />
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

/* =====================================================================
 * Filtros
 * ===================================================================== */

type ProductFiltersProps = {
  uniqueBrands: string[];
  uniqueModels: string[];
  uniqueSizes: string[];
  uniqueColors: string[];
  highestPrice: number;
  activeCount: number;
  filteredCount: number;
  brandFilter: string | null;
  modelFilter: string | null;
  sizeFilter: string | null;
  colorFilter: string | null;
  maxPrice: number | null;
  showMobile: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onBrandChange: (v: string | null) => void;
  onModelChange: (v: string | null) => void;
  onSizeChange: (v: string | null) => void;
  onColorChange: (v: string | null) => void;
  onMaxPriceChange: (v: number | null) => void;
  onClearAll: () => void;
};

function ProductFilters(props: ProductFiltersProps) {
  const {
    uniqueBrands,
    uniqueModels,
    uniqueSizes,
    uniqueColors,
    highestPrice,
    activeCount,
    filteredCount,
    brandFilter,
    modelFilter,
    sizeFilter,
    colorFilter,
    maxPrice,
    showMobile,
    onToggleMobile,
    onCloseMobile,
    onBrandChange,
    onModelChange,
    onSizeChange,
    onColorChange,
    onMaxPriceChange,
    onClearAll,
  } = props;

  // Opciones de precio: cortes redondeados hasta el máximo real.
  const priceOptions = useMemo(() => {
    if (highestPrice <= 0) return [] as number[];
    const step = highestPrice > 20000 ? 5000 : highestPrice > 10000 ? 3000 : 1500;
    const out: number[] = [];
    for (let p = step; p < highestPrice; p += step) out.push(p);
    return out;
  }, [highestPrice]);

  // Formato de precio compartido con el resto de la app (src/lib/data.ts).
  const formatPrice = uy;

  return (
    <>
      {/* ===== Desktop: grilla de selects uniformes ===== */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-5">
        <FilterSelect
          label="Modelo"
          value={modelFilter ?? ""}
          onChange={(v) => onModelChange(v || null)}
          options={uniqueModels}
          placeholder="Todos"
        />
        <FilterSelect
          label="Marca"
          value={brandFilter ?? ""}
          onChange={(v) => onBrandChange(v || null)}
          options={uniqueBrands}
          placeholder="Todas"
        />
        <FilterSelect
          label="Talle"
          value={sizeFilter ?? ""}
          onChange={(v) => onSizeChange(v || null)}
          options={uniqueSizes}
          placeholder="Todos"
        />
        <FilterSelect
          label="Color"
          value={colorFilter ?? ""}
          onChange={(v) => onColorChange(v || null)}
          options={uniqueColors}
          placeholder="Todos"
        />
        <FilterSelect
          label="Precio máx."
          value={maxPrice === null ? "" : String(maxPrice)}
          onChange={(v) => onMaxPriceChange(v ? Number(v) : null)}
          options={priceOptions.map(String)}
          placeholder="Sin límite"
          formatOption={(v) => formatPrice(Number(v))}
        />
        {activeCount > 0 && (
          <div className="col-span-full mt-1 flex justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-smoke hover:text-ink"
            >
              Limpiar filtros ({activeCount})
            </button>
          </div>
        )}
      </div>

      {/* ===== Mobile: botón + bottom sheet ===== */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onToggleMobile}
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
              onClick={onClearAll}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-smoke hover:text-ink"
            >
              Limpiar ({activeCount})
            </button>
          )}
        </div>

        {showMobile && (
          <MobileFiltersSheet
            uniqueBrands={uniqueBrands}
            uniqueModels={uniqueModels}
            uniqueSizes={uniqueSizes}
            uniqueColors={uniqueColors}
            priceOptions={priceOptions}
            formatPrice={formatPrice}
            activeCount={activeCount}
            filteredCount={filteredCount}
            brandFilter={brandFilter}
            modelFilter={modelFilter}
            sizeFilter={sizeFilter}
            colorFilter={colorFilter}
            maxPrice={maxPrice}
            onBrandChange={onBrandChange}
            onModelChange={onModelChange}
            onSizeChange={onSizeChange}
            onColorChange={onColorChange}
            onMaxPriceChange={onMaxPriceChange}
            onClearAll={onClearAll}
            onClose={onCloseMobile}
          />
        )}
      </div>
    </>
  );
}

/** Select nativo estilizado, uniforme para la grilla desktop. */
function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  formatOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  formatOption?: (v: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border border-ink/15 bg-bone px-3 text-[12px] font-semibold text-ink outline-none transition-colors hover:border-ink/40 focus:border-ink"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {formatOption ? formatOption(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ===================== Mobile bottom sheet ===================== */

type SheetProps = {
  uniqueBrands: string[];
  uniqueModels: string[];
  uniqueSizes: string[];
  uniqueColors: string[];
  priceOptions: number[];
  formatPrice: (v: number) => string;
  activeCount: number;
  filteredCount: number;
  brandFilter: string | null;
  modelFilter: string | null;
  sizeFilter: string | null;
  colorFilter: string | null;
  maxPrice: number | null;
  onBrandChange: (v: string | null) => void;
  onModelChange: (v: string | null) => void;
  onSizeChange: (v: string | null) => void;
  onColorChange: (v: string | null) => void;
  onMaxPriceChange: (v: number | null) => void;
  onClearAll: () => void;
  onClose: () => void;
};

function MobileFiltersSheet(props: SheetProps) {
  const {
    uniqueBrands,
    uniqueModels,
    uniqueSizes,
    uniqueColors,
    priceOptions,
    formatPrice,
    activeCount,
    filteredCount,
    brandFilter,
    modelFilter,
    sizeFilter,
    colorFilter,
    maxPrice,
    onBrandChange,
    onModelChange,
    onSizeChange,
    onColorChange,
    onMaxPriceChange,
    onClearAll,
    onClose,
  } = props;

  // Sección del acordeón abierta ("" = ninguna). Modelo abre por defecto.
  const [open, setOpen] = useState<string>("modelo");

  // Convención del repo (como lightbox/ui.tsx): lock del scroll del body y
  // Escape cierra mientras el sheet está montado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de productos"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar filtros"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-ink/50"
      />

      {/* Panel */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-bone">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink">
            Filtros
            {activeCount > 0 && (
              <span className="ml-2 text-gold-600">({activeCount})</span>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center border border-ink/15 text-[13px] font-bold text-ink"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <SheetSection
            id="modelo"
            open={open}
            onToggle={setOpen}
            title="Modelo"
          >
            <div className="flex flex-wrap gap-1.5">
              <SheetChip
                active={modelFilter === null}
                onClick={() => onModelChange(null)}
              >
                Todos
              </SheetChip>
              {uniqueModels.map((m) => (
                <SheetChip
                  key={m}
                  active={modelFilter === m}
                  onClick={() => onModelChange(m)}
                >
                  {m}
                </SheetChip>
              ))}
            </div>
          </SheetSection>

          <SheetSection id="marca" open={open} onToggle={setOpen} title="Marca">
            <div className="flex flex-wrap gap-1.5">
              <SheetChip
                active={brandFilter === null}
                onClick={() => onBrandChange(null)}
              >
                Todas
              </SheetChip>
              {uniqueBrands.map((b) => (
                <SheetChip
                  key={b}
                  active={brandFilter === b}
                  onClick={() => onBrandChange(b)}
                >
                  {b}
                </SheetChip>
              ))}
            </div>
          </SheetSection>

          <SheetSection id="talle" open={open} onToggle={setOpen} title="Talle">
            <div className="flex flex-wrap gap-1.5">
              <SheetChip
                active={sizeFilter === null}
                onClick={() => onSizeChange(null)}
              >
                Todos
              </SheetChip>
              {uniqueSizes.map((s) => (
                <SheetChip
                  key={s}
                  active={sizeFilter === s}
                  onClick={() => onSizeChange(s)}
                >
                  {s}
                </SheetChip>
              ))}
            </div>
          </SheetSection>

          <SheetSection id="color" open={open} onToggle={setOpen} title="Color">
            <div className="flex flex-wrap gap-1.5">
              <SheetChip
                active={colorFilter === null}
                onClick={() => onColorChange(null)}
              >
                Todos
              </SheetChip>
              {uniqueColors.map((c) => (
                <SheetChip
                  key={c}
                  active={colorFilter === c}
                  onClick={() => onColorChange(c)}
                >
                  {c}
                </SheetChip>
              ))}
            </div>
          </SheetSection>

          <SheetSection
            id="precio"
            open={open}
            onToggle={setOpen}
            title="Precio máximo"
          >
            <div className="flex flex-wrap gap-1.5">
              <SheetChip
                active={maxPrice === null}
                onClick={() => onMaxPriceChange(null)}
              >
                Sin límite
              </SheetChip>
              {priceOptions.map((p) => (
                <SheetChip
                  key={p}
                  active={maxPrice === p}
                  onClick={() => onMaxPriceChange(p)}
                >
                  {formatPrice(p)}
                </SheetChip>
              ))}
            </div>
          </SheetSection>
        </div>

        <div className="flex items-center gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={onClearAll}
            className="h-12 flex-1 border border-ink/20 text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-[2] bg-ink text-[11px] font-bold uppercase tracking-[0.14em] text-bone"
          >
            Ver {filteredCount} productos
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sección plegable del bottom sheet. */
function SheetSection({
  id,
  open,
  onToggle,
  title,
  children,
}: {
  id: string;
  open: string;
  onToggle: (id: string) => void;
  title: string;
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  return (
    <div className="border-b border-ink/8 py-3">
      <button
        type="button"
        onClick={() => onToggle(isOpen ? "" : id)}
        className="flex w-full items-center justify-between py-1"
        aria-expanded={isOpen}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          {title}
        </span>
        <span className={`text-[10px] text-smoke transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

/** Chip compacto para el bottom sheet mobile. */
function SheetChip({
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
