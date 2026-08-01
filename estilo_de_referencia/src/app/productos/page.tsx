import Link from "next/link";
import { CATEGORIES, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  categoria?: string;
  q?: string;
  orden?: string;
}>;

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { categoria, q, orden } = await searchParams;
  const items = await getProducts({ category: categoria, q, sort: orden });

  const buildUrl = (cat?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("categoria", cat);
    if (q) params.set("q", q);
    if (orden) params.set("orden", orden);
    const s = params.toString();
    return `/productos${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand/70">
        Catálogo
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold text-stone-900">
        {categoria
          ? CATEGORIES.find((c) => c.slug === categoria)?.label ?? "Catálogo"
          : "Todo el calzado"}
      </h1>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={buildUrl()}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            !categoria
              ? "bg-brand text-white"
              : "bg-white text-stone-600 ring-1 ring-brand/20 hover:bg-brand/5"
          }`}
        >
          Todos
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={buildUrl(cat.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              categoria === cat.slug
                ? "bg-brand text-white"
                : "bg-white text-stone-600 ring-1 ring-brand/20 hover:bg-brand/5"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <form
        method="get"
        action="/productos"
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar modelo…"
          className="w-full max-w-xs rounded-full border border-brand/20 bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          name="orden"
          defaultValue={orden ?? ""}
          className="rounded-full border border-brand/20 bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">Destacados primero</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Aplicar
        </button>
      </form>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-brand/30 bg-white p-12 text-center">
          <p className="text-4xl">👟</p>
          <p className="mt-3 font-serif text-xl font-semibold text-stone-800">
            No encontramos resultados
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Probá con otra búsqueda o mirá el catálogo completo.
          </p>
          <Link
            href="/productos"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white"
          >
            Ver todo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
