import { useState } from "react";
import { uy, type Product } from "../lib/data";
import { useStore } from "../lib/store";
import { Heart } from "./ui";

export function ProductCard({
  p,
  size = "md",
}: {
  p: Product;
  size?: "md" | "sm";
}) {
  const { add, wish, toggleWish } = useStore();
  const [quick, setQuick] = useState(false);
  const liked = wish.includes(p.id);

  return (
    <article className="group relative">
      <div
        className="relative overflow-hidden bg-bone-200"
        onMouseLeave={() => setQuick(false)}
      >
        <div className="aspect-[4/5] w-full">
          <img
            src={p.image}
            alt={`${p.brand} ${p.name}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-[opacity,transform] duration-[600ms] ease-out group-hover:scale-[1.03] md:group-hover:opacity-0"
          />
          <img
            src={p.hover}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 hidden h-full w-full scale-[1.03] object-cover opacity-0 transition-opacity duration-[600ms] ease-out group-hover:opacity-100 md:block"
          />
        </div>

        {p.isNew && (
          <span className="absolute left-0 top-0 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-bone">
            Nuevo
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWish(p.id)}
          aria-label={liked ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={liked}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center text-ink/70 transition-colors hover:text-ink"
        >
          <Heart
            className="h-[18px] w-[18px]"
            fill={liked ? "currentColor" : "none"}
            style={liked ? { color: "var(--color-gold-600)" } : undefined}
          />
        </button>

        {/* Quick add — solo desktop */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:block">
          {!quick ? (
            <button
              type="button"
              onClick={() => setQuick(true)}
              className="w-full bg-ink/92 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-bone backdrop-blur-sm transition-colors hover:bg-ink"
            >
              Agregar
            </button>
          ) : (
            <div className="flex flex-wrap gap-px bg-ink/92 p-px backdrop-blur-sm">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    add(p, s);
                    setQuick(false);
                  }}
                  className="flex-1 bg-ink/0 py-2 text-[12px] font-semibold text-bone transition-colors hover:bg-gold-500 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">
          {p.brand}
        </p>
        <h3
          className={`mt-1 line-clamp-2 font-semibold leading-snug tracking-[-0.01em] ${
            size === "sm" ? "text-[13px]" : "text-[14px] md:text-[15px]"
          }`}
        >
          {p.name}
        </h3>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span
            className={`font-bold tracking-[-0.01em] ${
              p.compareAt ? "text-gold-600" : ""
            } ${size === "sm" ? "text-[13px]" : "text-[15px]"}`}
          >
            {uy(p.price)}
          </span>
          {p.compareAt && (
            <span className="text-[12px] text-smoke line-through">
              {uy(p.compareAt)}
            </span>
          )}
        </p>
      </div>

      {/* Add móvil: toda la card abre el detalle; botón discreto de talle rápido */}
      <button
        type="button"
        onClick={() => add(p, p.sizes[Math.floor(p.sizes.length / 2)])}
        className="mt-2 w-full border border-ink/12 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/80 transition-colors active:bg-ink active:text-bone md:hidden"
      >
        Agregar
      </button>
    </article>
  );
}
