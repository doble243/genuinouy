import { useEffect, useState } from "react";
import {
  brandLogo,
  brands,
  CAT_SALE,
  CAT_SHOES,
  EDITORIAL_IMG,
  HERO_IMG,
  uy,
} from "../lib/data";
import { useStore } from "../lib/store";
import { ProductCard } from "./ProductCard";
import {
  Arrow,
  ChevronLeft,
  ChevronRight,
  LogoWatermark,
  Reveal,
  SectionHead,
} from "./ui";
import { fetchHeroSlides } from "../lib/heroService";
import type { HeroSlide } from "../types/admin";
import { resolveImageUrl } from "../lib/cloudinary";
import { storefrontWhatsappUrl } from "../lib/whatsapp";

/** Marcador de contenido borrador: todo copy nuevo requiere confirmación del dueño. */
const DRAFT_BADGE =
  "Borrador — texto a confirmar por el dueño";

/* ============================ HERO ============================ */

// Slide por defecto: replica el hero estático original para que el sitio
// nunca quede en blanco (sin slides en DB o si el fetch falla).
const FALLBACK_HERO_SLIDE: HeroSlide = {
  id: "fallback",
  eyebrow: "Nuevos ingresos",
  title: "Los pares que no\npasan desapercibidos.",
  subtitle:
    "Selección corta de championes originales, con stock real en Uruguay.",
  buttonText: "Ver nuevos ingresos",
  buttonHref: "#nuevos",
  imageUrl: HERO_IMG,
  align: "left",
  sortOrder: 0,
  active: true,
};

// Alineación horizontal del bloque de texto (cross-axis de la columna flex).
const ALIGN_CONTENT: Record<HeroSlide["align"], string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

// Overlay legible: izq = de izquierda a derecha, centro = simétrico, der = inverso.
const ALIGN_OVERLAY: Record<HeroSlide["align"], string> = {
  left: "bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-obsidian/10 md:bg-gradient-to-r md:from-obsidian/80 md:via-obsidian/25 md:to-transparent",
  center:
    "bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-obsidian/10 md:bg-gradient-to-r md:from-obsidian/60 md:via-obsidian/30 md:to-obsidian/60",
  right: "bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-obsidian/10 md:bg-gradient-to-l md:from-obsidian/80 md:via-obsidian/25 md:to-transparent",
};

// Ancho máximo del bloque de texto (centrado cuando align === center).
const ALIGN_TITLE_BOX: Record<HeroSlide["align"], string> = {
  left: "max-w-[620px]",
  center: "mx-auto max-w-[760px]",
  right: "max-w-[620px]",
};

const HERO_INTERVAL_MS = 6000;

function HeroSlideContent({
  slide,
  hidden = false,
}: {
  slide: HeroSlide;
  hidden?: boolean;
}) {
  const align = slide.align || "left";
  const imgSrc = resolveImageUrl(slide.imageUrl) || HERO_IMG;
  const titleLines = (slide.title || "").split("\n");
  const eyeAlign =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "";

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={hidden}
    >
      <img
        src={imgSrc}
        alt={slide.eyebrow || "GENUINOS"}
        fetchPriority={hidden ? "low" : undefined}
        loading={hidden ? "lazy" : "eager"}
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
      <div className={`absolute inset-0 ${ALIGN_OVERLAY[align]}`} />

      <div
        className={`edge absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end pb-12 md:justify-center md:pb-0 ${ALIGN_CONTENT[align]}`}
      >
        <Reveal className={ALIGN_TITLE_BOX[align]}>
          {slide.eyebrow && (
            <p
              className={`mb-4 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-bone/70 ${eyeAlign}`}
            >
              <span className="h-px w-8 bg-gold-500" />
              {slide.eyebrow}
            </p>
          )}
          <h1 className="text-[34px] font-extrabold leading-[0.98] tracking-[-0.035em] text-bone sm:text-[46px] md:text-[62px] lg:text-[74px]">
            {titleLines.map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          {slide.subtitle && (
            <p
              className={`mt-4 max-w-[420px] text-[14px] leading-relaxed text-bone/70 md:text-[16px] ${
                align === "center" ? "mx-auto" : ""
              }`}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.buttonText && (
            <a
              href={slide.buttonHref || "#nuevos"}
              tabIndex={hidden ? -1 : undefined}
              className="group mt-8 inline-flex items-center gap-3 bg-bone px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-ink transition-colors duration-300 hover:bg-gold-500"
            >
              {slide.buttonText}
              <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          )}
        </Reveal>
      </div>
    </div>
  );
}

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [current, setCurrentState] = useState(0);

  // Carga los slides del hero; usa solo los activos; ante error → null (fallback).
  useEffect(() => {
    let cancelled = false;
    fetchHeroSlides()
      .then((all) => {
        if (cancelled) return;
        const active = all.filter((s) => s.active);
        setSlides(active.length > 0 ? active : null);
      })
      .catch(() => {
        if (!cancelled) setSlides(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-avance automático cada ~6s (solo con más de un slide).
  useEffect(() => {
    if (!slides || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrentState((c) => (c + 1) % slides.length);
    }, HERO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides]);

  const hasCarousel = slides !== null && slides.length > 0;
  const activeSlides = slides ?? [FALLBACK_HERO_SLIDE];
  const safeIndex = hasCarousel ? current % activeSlides.length : 0;

  const goPrev = () =>
    setCurrentState(
      (c) => (c - 1 + activeSlides.length) % activeSlides.length
    );
  const goNext = () =>
    setCurrentState((c) => (c + 1) % activeSlides.length);

  return (
    <section id="top" className="relative overflow-hidden bg-obsidian">
      <div className="relative h-[78svh] min-h-[520px] w-full md:h-[86svh] md:min-h-[600px]">
        {activeSlides.map((slide, i) => (
          <HeroSlideContent
            key={slide.id}
            slide={slide}
            hidden={hasCarousel && i !== safeIndex}
          />
        ))}

        {hasCarousel && activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-bone/25 bg-obsidian/40 text-bone backdrop-blur-sm transition-colors hover:border-gold-500 hover:bg-obsidian/70 hover:text-gold-400 md:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente slide"
              className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-bone/25 bg-obsidian/40 text-bone backdrop-blur-sm transition-colors hover:border-gold-500 hover:bg-obsidian/70 hover:text-gold-400 md:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
              {activeSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentState(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === safeIndex ? "w-7 bg-gold-500" : "w-2 bg-bone/40 hover:bg-bone/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
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
    title: "Últimos pares",
    meta: "Talles limitados",
    img: CAT_SALE,
    span: "md:col-span-2 md:row-span-2",
    ratio: "aspect-[4/3] md:aspect-auto md:h-full",
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
  const { newArrivals } = useStore();
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
  const { products } = useStore();
  // Últimos 3 productos para la editorial
  const editorialProducts = products.slice(products.length - 3);
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
            {editorialProducts.map((p) => (
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
  const { mostWanted } = useStore();
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
const TRUST_TILES = [
  { label: "Envíos a todo Uruguay", href: "#envios" },
  { label: "Cambios por talle", href: "#cambios" },
  { label: "Guía de talles", href: "#talles" },
  { label: "Atención directa", href: "#contacto" },
];

export function Trust() {
  return (
    <section className="border-y border-ink/8">
      <div className="edge mx-auto max-w-[1600px] py-6">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
            {TRUST_TILES.map((t, i) => (
              <span
                key={t.label}
                className="flex items-center gap-x-6 gap-y-3"
              >
                {i > 0 && <span className="hidden text-gold-500 sm:inline">·</span>}
                <a
                  href={t.href}
                  className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-gold-600 md:text-[12.5px]"
                >
                  {t.label}
                </a>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================= INFO (envíos/cambios/talles/cómo comprar) ========================= */
const INFO_BLOCKS = [
  {
    id: "envios",
    title: "Envíos",
    body: "Hacemos envíos a todo Uruguay por agencia o cadetería. El costo depende de tu zona y lo coordinamos por WhatsApp al confirmar tu pedido. Los envíos salen desde Pando, Canelones.",
  },
  {
    id: "cambios",
    title: "Cambios",
    body: "Aceptamos cambios por defecto y por talle. Tenés 5 días desde que recibís el par para coordinarlo por WhatsApp. Los championes deben estar sin uso y con la caja original.",
  },
  {
    id: "talles",
    title: "Guía de talles",
    body: "Trabajamos con la medida media de cada modelo: la mayoría de los championes calzan talle estándar (equivale al talle que usás habitualmente). Ante dudas entre dos talles, recomendamos el más grande y te asesoramos por WhatsApp antes de comprar.",
  },
  {
    id: "contacto",
    title: "Cómo comprar",
    body: "Elegí tu par, agregalo al carrito y completá tus datos. Te contactamos por WhatsApp para coordinar pago y entrega.",
  },
];

export function StoreInfoSection() {
  const [open, setOpen] = useState<string>(INFO_BLOCKS[0].id);

  return (
    <section id="info" className="bg-bone-200/50 py-14 md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <Reveal>
          <SectionHead title="Información útil" sub="Envios · Cambios · Talles" />
        </Reveal>

        <div className="mt-8 grid gap-3 md:mt-10">
          {INFO_BLOCKS.map((b) => {
            const isOpen = open === b.id;
            return (
              <Reveal key={b.id} delay={60}>
                <div
                  id={b.id}
                  className="scroll-mt-[calc(var(--header-h)+1rem)] border border-ink/10 bg-bone"
                >
                  <button
                    type="button"
                    id={`heading-${b.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`panel-${b.id}`}
                    onClick={() => setOpen(isOpen ? "" : b.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-7"
                  >
                    <span className="text-[14px] font-bold tracking-[-0.01em] text-ink md:text-[16px]">
                      {b.title}
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-gold-500 text-gold-600"
                          : "border-ink/15 text-ink/60"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  <div
                    id={`panel-${b.id}`}
                    role="region"
                    aria-labelledby={`heading-${b.id}`}
                    className={`grid transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-ink/8 px-5 pb-5 pt-4 md:px-7">
                        <p className="text-[13.5px] leading-relaxed text-ink/75">
                          {b.body}
                        </p>
                        {b.id === "contacto" && (
                          <a
                            href={
                              storefrontWhatsappUrl(
                                "+59891722213",
                                "Hola! Quiero saber cómo comprar en GENUINOS.",
                              ) ?? "#contacto"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 bg-ink px-5 py-3 text-[11.5px] font-bold uppercase tracking-[0.18em] text-bone transition-colors hover:bg-gold-500 hover:text-ink"
                          >
                            Hablar por WhatsApp
                            <Arrow className="h-4 w-4" />
                          </a>
                        )}
                        <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                          {DRAFT_BADGE}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ========================= SOBRE GENUINOS ========================= */
export function BrandStorySection() {
  return (
    <section className="bg-[#3c5c48] py-14 text-bone md:py-24">
      <div className="edge mx-auto max-w-[1600px]">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="mb-3 flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-bone/70">
              <span className="h-px w-8 bg-gold-500" />
              Sobre Genuinos
            </p>
            <h2 className="genuinos-display text-[34px] leading-[1.02] tracking-[-0.01em] md:text-[54px]">
              ELEGÍ TU ESTILO
            </h2>
            <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-bone/75 md:text-[15.5px]">
              Genuinos nace en Pando, Uruguay, con una idea simple: championes
              originales, seleccionados a mano y con stock real. Somos una
              tienda multi-marca de reventa — traemos los pares que valen la
              pena y los publicamos cuando están en nuestras manos.
            </p>
            <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-bone/75 md:text-[15.5px]">
              Sin fotos de catálogo, sin promesas vacías: lo que ves es lo que
              hay, y te lo enviamos a todo Uruguay.
            </p>
            <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bone/50">
              {DRAFT_BADGE}
            </p>
          </Reveal>

          <Reveal delay={120} className="md:col-span-5">
            <div className="ml-auto max-w-[380px] border border-bone/20 p-8 text-center md:p-10">
              <p className="genuinos-display text-[64px] leading-none text-bone md:text-[84px]">
                G
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-bone/70">
                Pando · Uruguay
              </p>
              <p className="mt-2 text-[12px] text-bone/60">
                Multi-marca de championes originales con stock real.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================ FOOTER ============================ */
const FOOT = [
  {
    title: "Ayuda",
    links: [
      { label: "Envíos", href: "#envios" },
      { label: "Cambios", href: "#cambios" },
      { label: "Guía de talles", href: "#talles" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
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
          <div className="md:col-span-5">
            <div className="genuinos-lockup relative">
              <img
                src="/assets/genuinos/logo-full-white.svg"
                alt="GENUINOS"
                draggable={false}
              />
            </div>
            <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-bone/55">
              Championes originales seleccionados. Pando, Uruguay.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/genuinos.uy"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-bone/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/59891722213"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-bone/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
              Ayuda
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOT[0].links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[13px] text-bone/75 transition-colors hover:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="https://wa.me/59891722213"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-bone/75 transition-colors hover:text-bone"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="tel:+59891722213"
                  className="text-[13px] text-bone/75 transition-colors hover:text-bone"
                >
                  +598 91 722 213
                </a>
              </li>
            </ul>
          </div>

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
        </div>
      </div>
    </footer>
  );
}
