import { useEffect, useRef, useState } from "react";
import type { Review } from "../../types/reviews";
import { fetchFeaturedReviews } from "../../lib/reviewsService";
import { ReviewCard } from "./ReviewCard";
import { ChevronLeft, ChevronRight, SectionHead } from "../ui";

const AUTO_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

/**
 * ReviewsCarousel — carrusel de reseñas destacadas (home).
 * - Auto-rota cada 5s SOLO con 2+ reseñas; pausa en hover/focus.
 * - `prefers-reduced-motion: reduce` → jamás inicia el timer.
 * - Swipe táctil > 40px → prev/next. Flechas + dots 44px.
 * - 0 destacadas → null; exactamente 1 → tarjeta estática sin timer.
 */
export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedReviews()
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Observa prefers-reduced-motion (no se usa para arrancar el timer).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const count = reviews ? reviews.length : 0;

  // Timer de auto-rotación: solo con 2+ reseñas, sin pausa y sin reduced motion.
  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, reduced]);

  if (reviews === null) return null;
  if (count === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + count) % count);
  const goNext = () => setIndex((i) => (i + 1) % count);

  // Caso single: tarjeta estática, sin controles ni timer.
  if (count === 1) {
    return (
      <section className="py-14 md:py-24">
        <div className="edge mx-auto max-w-[1600px]">
          <SectionHead title="Reseñas destacadas" />
          <div className="mt-8 max-w-[380px]">
            <ReviewCard review={reviews[0]} />
          </div>
        </div>
      </section>
    );
  }

  const safeIndex = index % count;

  return (
    <section
      role="region"
      aria-roledescription="Carrusel"
      aria-label="Reseñas destacadas"
      className="py-14 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="edge mx-auto max-w-[1600px]">
        <SectionHead title="Reseñas destacadas" />
      </div>

      <div className="edge relative mx-auto mt-8 max-w-[1600px]">
        <div
          className="relative min-h-[320px] overflow-hidden"
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchX.current;
            const delta = endX - touchX.current;
            if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
              if (delta < 0) goNext();
              else goPrev();
            }
            touchX.current = null;
          }}
        >
          {/* Track aria-live: solo anuncia cambios, no el estado inicial */}
          <div className="relative" aria-live="polite">
            {reviews.map((r, i) => (
              <div
                key={r.id}
                role="group"
                aria-roledescription="Diapositiva"
                aria-label={`${i + 1} de ${count}`}
                aria-hidden={i !== safeIndex}
                className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                  i === safeIndex
                    ? "relative z-10 opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <div className="mx-auto max-w-[420px] px-1">
                  <ReviewCard review={r} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="Reseña anterior"
          className="absolute left-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-bone text-ink/70 transition-colors hover:border-gold-500 hover:text-gold-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Siguiente reseña"
          className="absolute right-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-bone text-ink/70 transition-colors hover:border-gold-500 hover:text-gold-600"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="mt-6 flex items-center justify-center gap-2">
          {reviews.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a la reseña ${i + 1}`}
              aria-current={i === safeIndex ? "true" : undefined}
              className={`grid h-11 min-w-11 place-items-center rounded-full px-1 text-[11px] font-bold transition-colors ${
                i === safeIndex
                  ? "text-ink"
                  : "text-smoke hover:text-ink"
              }`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === safeIndex ? "h-2 w-6 bg-gold-500" : "h-2 w-2 bg-ink/20"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
