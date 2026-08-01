import {
  brandLogo,
  brands,
  CAT_APPAREL,
  CAT_SALE,
  CAT_SHOES,
  EDITORIAL_IMG,
  HERO_IMG,
  mostWanted,
  newArrivals,
  retroRunning,
  uy,
} from "../lib/data";
import { ProductCard } from "./ProductCard";
import { Arrow, Logo, LogoWatermark, Reveal, SectionHead } from "./ui";

/* ============================ HERO ============================ */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-obsidian">
      <div className="relative h-[78svh] min-h-[520px] w-full md:h-[86svh] md:min-h-[600px]">
        <img
          src={HERO_IMG}
          alt="Championes originales seleccionados por GENUINOS"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />

        {/* Marca de agua enorme, apenas visible */}
        <LogoWatermark
          tone="light"
          opacity={0.07}
          className="absolute -right-[12%] top-1/2 w-[85%] max-w-none -translate-y-1/2 md:-right-[6%] md:w-[52%]"
        />

        {/* Overlay leve solo para lectura */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-obsidian/10 md:bg-gradient-to-r md:from-obsidian/80 md:via-obsidian/25 md:to-transparent" />

        <div className="edge absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end pb-12 md:justify-center md:pb-0">
          <Reveal className="max-w-[620px]">
            <p className="mb-4 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-bone/70">
              <span className="h-px w-8 bg-gold-500" />
              Nuevos ingresos
            </p>
            <h1 className="text-[34px] font-extrabold leading-[0.98] tracking-[-0.035em] text-bone sm:text-[46px] md:text-[62px] lg:text-[74px]">
              Los pares que no
              <br />
              pasan desapercibidos.
            </h1>
            <p className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-bone/70 md:text-[16px]">
              Selección corta de championes originales, con stock real en
              Uruguay.
            </p>
            <a
              href="#nuevos"
              className="group mt-8 inline-flex items-center gap-3 bg-bone px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-gold-500"
            >
              Ver nuevos ingresos
              <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ========================= CATEGORÍAS ========================= */
const CATS = [
  {
    title: "Championes",
    meta: "Todos los modelos",
    img: CAT_SHOES,
    span: "md:col-span-2 md:row-span-2",
    ratio: "aspect-[4/5] md:aspect-auto md:h-full",
  },
  {
    title: "Ropa y accesorios",
    meta: "Buzos, remeras, medias",
    img: CAT_APPAREL,
    span: "md:col-span-2",
    ratio: "aspect-[4/3] md:aspect-[16/9]",
  },
  {
    title: "Últimos pares",
    meta: "Talles limitados",
    img: CAT_SALE,
    span: "md:col-span-2",
    ratio: "aspect-[4/3] md:aspect-[16/9]",
  },
];

export function Categories() {
  return (
    <section id="categorias" className="edge mx-auto max-w-[1600px] py-14 md:py-24">
      <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
        {CATS.map((c, i) => (
          <Reveal
            key={c.title}
            delay={i * 70}
            className={`group relative overflow-hidden bg-bone-200 ${c.span}`}
          >
            <a href="#nuevos" className="block h-full">
              <div className={`w-full overflow-hidden ${c.ratio}`}>
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                <div>
                  <h3 className="text-[20px] font-extrabold leading-none tracking-[-0.025em] text-bone md:text-[26px]">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] text-bone/65">{c.meta}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-bone/35 text-bone transition-colors duration-300 group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-ink">
                  <Arrow className="h-4 w-4" />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ======================= RECIÉN LLEGADOS ======================= */
export function NewArrivals() {
  return (
    <section id="nuevos" className="py-4 md:py-6">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Recién llegados" link="Ver todo" />
        </Reveal>
      </div>

      <Reveal className="mt-6 md:mt-8">
        <div className="track no-scrollbar flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:gap-5 md:px-10 xl:px-16">
          {newArrivals.map((p) => (
            <div
              key={p.id}
              className="w-[62vw] shrink-0 sm:w-[38vw] md:w-[30vw] lg:w-[23vw] xl:w-[20vw]"
            >
              <ProductCard p={p} />
            </div>
          ))}
          <div className="hidden w-px shrink-0 md:block" />
        </div>
      </Reveal>
    </section>
  );
}

/* ============================ MARCAS ============================ */
export function Brands() {
  return (
    <section id="marcas" className="border-y border-ink/8 bg-bone-200/70 py-12 md:py-16">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-smoke">
            Elegí tu marca
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-8 grid grid-cols-3 items-center gap-x-6 gap-y-8 sm:grid-cols-5 md:mt-10 lg:grid-cols-10">
            {brands.map((b) => (
              <a
                key={b.slug}
                href="#marcas"
                title={b.name}
                className="group flex h-8 items-center justify-center"
              >
                <img
                  src={brandLogo(b.slug, "1a1a1a")}
                  alt={b.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-auto max-w-[86px] object-contain opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ====================== COLECCIÓN EDITORIAL ====================== */
export function Editorial() {
  return (
    <section className="relative overflow-hidden bg-obsidian py-14 text-bone md:py-24">
      <LogoWatermark
        tone="light"
        opacity={0.045}
        className="absolute -left-[18%] top-1/2 w-[80%] max-w-none -translate-y-1/2 md:-left-[8%] md:w-[42%]"
      />
      <div className="edge relative mx-auto grid max-w-[1600px] items-center gap-8 md:grid-cols-12 md:gap-12">
        <Reveal className="md:col-span-5">
          <div className="overflow-hidden">
            <img
              src={EDITORIAL_IMG}
              alt="Colección Retro Running"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
            />
          </div>
        </Reveal>

        <div className="md:col-span-7">
          <Reveal>
            <p className="mb-3 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-gold-400">
              <span className="h-px w-8 bg-gold-500" />
              Colección
            </p>
            <h2 className="text-[32px] font-extrabold leading-[0.98] tracking-[-0.03em] md:text-[48px]">
              Retro running
            </h2>
            <p className="mt-4 max-w-[440px] text-[14px] leading-relaxed text-bone/60 md:text-[15px]">
              Siluetas de archivo, suela gruesa y gamuza. Cuatro pares elegidos
              a mano.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-8 grid grid-cols-3 gap-3 md:mt-10 md:gap-5">
            {retroRunning.map((p) => (
              <a key={p.id} href="#nuevos" className="group block">
                <div className="overflow-hidden bg-obsidian-700">
                  <img
                    src={p.image}
                    alt={`${p.brand} ${p.name}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-bone/45">
                  {p.brand}
                </p>
                <h3 className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-snug md:text-[13.5px]">
                  {p.name}
                </h3>
                <p className="mt-1 text-[12.5px] font-bold text-gold-400 md:text-[14px]">
                  {uy(p.price)}
                </p>
              </a>
            ))}
          </Reveal>

          <Reveal delay={140}>
            <a
              href="#nuevos"
              className="group mt-8 inline-flex items-center gap-3 border border-bone/25 px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 hover:border-gold-500 hover:text-gold-400"
            >
              Ver la colección
              <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ======================= LOS MÁS BUSCADOS ======================= */
export function MostWanted() {
  return (
    <section id="ofertas" className="py-14 md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Los más buscados" link="Ver todo" />
        </Reveal>
      </div>

      {/* Mobile: carrusel */}
      <Reveal className="mt-6 md:hidden">
        <div className="track no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
          {mostWanted.map((p) => (
            <div key={p.id} className="w-[62vw] shrink-0">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </Reveal>

      {/* Desktop: grilla */}
      <div className="edge mx-auto hidden max-w-[1600px] md:block">
        <div className="mt-10 grid grid-cols-4 gap-5">
          {mostWanted.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================== CONFIANZA ========================== */
export function Trust() {
  return (
    <section className="border-y border-ink/8">
      <div className="edge mx-auto max-w-[1600px] py-6">
        <Reveal>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11.5px] font-semibold uppercase tracking-[0.16em] text-smoke md:text-[12.5px]">
            <span className="text-ink">Envíos a todo Uruguay</span>
            <span className="text-gold-500">·</span>
            <span className="text-ink">Pagos seguros</span>
            <span className="text-gold-500">·</span>
            <span className="text-ink">Atención directa</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ FOOTER ============================ */
const FOOT = [
  {
    title: "Tienda",
    links: ["Nuevos ingresos", "Championes", "Ropa y accesorios", "Últimos pares"],
  },
  { title: "Marcas", links: ["Nike", "Adidas", "Jordan", "New Balance"] },
  { title: "Ayuda", links: ["Envíos", "Cambios", "Guía de talles", "Contacto"] },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-obsidian pb-[calc(6rem+env(safe-area-inset-bottom))] pt-14 text-bone md:pb-12 md:pt-20">
      <LogoWatermark
        tone="light"
        opacity={0.04}
        className="pointer-events-none absolute -bottom-[10%] left-1/2 w-[120%] max-w-none -translate-x-1/2 md:w-[60%]"
      />
      <div className="edge relative mx-auto max-w-[1600px]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo className="h-8" invert />
            <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-bone/55">
              Championes originales seleccionados. Montevideo, Uruguay.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                className="border border-bone/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                Instagram
              </a>
              <a
                href="#"
                className="border border-bone/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {FOOT.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13px] text-bone/75 transition-colors hover:text-bone"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
              Medios de pago
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Visa", "Mastercard", "OCA", "Mercado Pago", "Transferencia"].map(
                (m) => (
                  <span
                    key={m}
                    className="border border-bone/15 px-2.5 py-1.5 text-[10.5px] font-medium text-bone/60"
                  >
                    {m}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-bone/10 pt-6 text-[11.5px] text-bone/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} GENUINOS. Todos los derechos reservados.</p>
          <p className="flex gap-5">
            <a href="#" className="transition-colors hover:text-bone/70">
              Términos
            </a>
            <a href="#" className="transition-colors hover:text-bone/70">
              Privacidad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
