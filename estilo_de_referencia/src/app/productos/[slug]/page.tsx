import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categoryLabel,
  formatUyu,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id);
  const hasDiscount =
    product.oldPriceUyu != null && product.oldPriceUyu > product.priceUyu;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-stone-500">
        <Link href="/" className="hover:text-brand">
          Inicio
        </Link>{" "}
        /{" "}
        <Link href="/productos" className="hover:text-brand">
          Catálogo
        </Link>{" "}
        /{" "}
        <Link
          href={`/productos?categoria=${product.category}`}
          className="hover:text-brand"
        >
          {categoryLabel(product.category)}
        </Link>{" "}
        / <span className="text-stone-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-brand-dark">
              OFERTA
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand/70">
            {categoryLabel(product.category)} ·{" "}
            {product.gender === "unisex"
              ? "Unisex"
              : product.gender === "mujer"
                ? "Mujer"
                : "Hombre"}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-stone-900">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">
              {formatUyu(product.priceUyu)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-stone-400 line-through">
                {formatUyu(product.oldPriceUyu!)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Hasta 6 cuotas sin recargo con Mercado Pago
          </p>

          <p className="mt-6 leading-relaxed text-stone-700">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCart
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceUyu={product.priceUyu}
              imageUrl={product.imageUrl}
              sizes={product.sizes.split(",")}
              stock={product.stock}
            />
          </div>

          <div className="mt-8 space-y-2 rounded-2xl border border-brand/10 bg-white p-5 text-sm text-stone-600">
            <p>🚚 Envíos a todo Uruguay por DAC / Mirtrans (24-72 hs)</p>
            <p>🏬 Retiro gratis en nuestro local de Pando, Canelones</p>
            <p>🔄 Cambio de talle sin costo dentro de los 30 días</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            También te puede gustar
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
