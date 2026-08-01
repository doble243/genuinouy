import Link from "next/link";
import type { Product } from "@/db/schema";
import { categoryLabel, formatUyu } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.oldPriceUyu != null && product.oldPriceUyu > product.priceUyu;
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-dark">
            OFERTA
          </span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
            DESTACADO
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand/70">
          {categoryLabel(product.category)}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-stone-900">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">
            {formatUyu(product.priceUyu)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-stone-400 line-through">
              {formatUyu(product.oldPriceUyu!)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Talles {product.sizes.split(",")[0]} al{" "}
          {product.sizes.split(",").slice(-1)[0]}
        </p>
      </div>
    </Link>
  );
}
