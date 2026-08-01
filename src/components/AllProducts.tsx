import { useMemo } from "react";
import { useStore } from "../lib/store";
import { ProductCard } from "./ProductCard";
import { Reveal, SectionHead } from "./ui";

export function AllProducts() {
  const { products, brandFilter, setBrandFilter } = useStore();

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  const filtered = useMemo(() => {
    if (!brandFilter) return products;
    return products.filter((p) => p.brand === brandFilter);
  }, [products, brandFilter]);

  return (
    <section id="productos" className="py-14 md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Todos los productos" link="Ver nuevos" />
        </Reveal>

        <Reveal className="mt-6 md:mt-8">
          <div className="track no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
            <Chip active={brandFilter === null} onClick={() => setBrandFilter(null)}>
              Todos
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
        </Reveal>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-[14px] text-smoke">
            No hay productos de {brandFilter}
          </p>
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
      className={`shrink-0 border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ease-out ${
        active
          ? "border-gold-500 bg-gold-500 text-ink"
          : "border-ink/15 bg-bone text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
