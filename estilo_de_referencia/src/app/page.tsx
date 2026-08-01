import Link from "next/link";
import { getFeaturedProducts, CATEGORIES } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  zapatillas:
    "https://images.pexels.com/photos/27100548/pexels-photo-27100548.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  botas:
    "https://images.pexels.com/photos/27256470/pexels-photo-27256470.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mocasines:
    "https://images.pexels.com/photos/27256452/pexels-photo-27256452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  tacos:
    "https://images.pexels.com/photos/27256446/pexels-photo-27256446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              <span aria-hidden>»»&mdash;&rarr;</span> Pando · Uruguay
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight sm:text-6xl">
              GENUINOS
              <sup className="ml-2 text-2xl align-super">UY</sup>
            </h1>
            <p className="mt-2 font-serif text-2xl italic text-white/90">
              Elegí tu estilo
            </p>
            <p className="mt-6 max-w-md text-white/80">
              Calzado genuino para caminar tu ciudad con personalidad.
              Zapatillas, botas, mocasines y tacos seleccionados con amor desde
              nuestro local en Pando, Canelones.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="rounded-full bg-amber-400 px-8 py-3 font-semibold text-brand-dark shadow-lg transition hover:bg-amber-300"
              >
                Ver catálogo
              </Link>
              <Link
                href="#ubicacion"
                className="rounded-full border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Visitá el local
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/27256471/pexels-photo-27256471.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Botas de cuero GENUINOS UY"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white px-5 py-3 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Temporada
              </p>
              <p className="font-serif text-lg font-bold text-brand">
                Hasta 20% OFF 🔥
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand/70">
              Categorías
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-stone-900">
              ¿Qué estás buscando?
            </h2>
          </div>
          <Link
            href="/productos"
            className="hidden text-sm font-semibold text-brand hover:underline sm:block"
          >
            Ver todo →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CATEGORY_IMAGES[cat.slug]}
                alt={cat.label}
                className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent" />
              <span className="absolute bottom-4 left-4 font-serif text-xl font-bold text-white">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand/70">
            Selección especial
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-stone-900">
            Destacados de la semana
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/productos"
              className="inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
        {[
          {
            icon: "🚚",
            title: "Envíos a todo Uruguay",
            text: "Por DAC o Mirtrans en 24-72 hs. Retiro gratis en el local de Pando.",
          },
          {
            icon: "💳",
            title: "Pagá como quieras",
            text: "Efectivo, transferencia bancaria o Mercado Pago en hasta 6 cuotas.",
          },
          {
            icon: "🔄",
            title: "Cambios sin drama",
            text: "Tenés 30 días para cambiar el talle o modelo, sin vueltas.",
          },
        ].map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-brand/10 bg-white p-6 text-center shadow-sm"
          >
            <div className="text-4xl">{b.icon}</div>
            <h3 className="mt-3 font-serif text-xl font-bold text-stone-900">
              {b.title}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{b.text}</p>
          </div>
        ))}
      </section>

      {/* Ubicación */}
      <section id="ubicacion" className="bg-brand-dark py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
              Nuestro local
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold">
              Te esperamos en Pando 🇺🇾
            </h2>
            <p className="mt-4 text-white/80">
              Estamos en pleno centro de Pando, a pasos de la plaza. Vení a
              probarte los modelos, tomarte un mate con nosotros y llevarte el
              par perfecto.
            </p>
            <ul className="mt-6 space-y-3 text-white/90">
              <li>📍 Av. Artigas esq. Gral. Rivera, Pando, Canelones</li>
              <li>🕐 Lunes a viernes de 9:00 a 19:00</li>
              <li>🕐 Sábados de 9:00 a 13:00</li>
              <li>📱 WhatsApp: +598 99 123 456</li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <iframe
              title="Mapa de Pando, Uruguay"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-55.9720%2C-34.7280%2C-55.9430%2C-34.7080&layer=mapnik&marker=-34.7180%2C-55.9580"
              className="h-80 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
