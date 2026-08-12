import type { Review } from "../../types/reviews";
import { resolveImageUrl } from "../../lib/cloudinary";
import { RatingStars } from "./RatingStars";

/**
 * ReviewCard — tarjeta de reseña para lista de producto y carrusel de home.
 * Sin foto → placeholder `bg-bone-200` en aspect-square (sin layout shift).
 * Sin talle → chip omitido. Badge "Compra verificada" solo si corresponde.
 */
export function ReviewCard({ review }: { review: Review }) {
  const photo = resolveImageUrl(review.photo_url) || null;

  return (
    <article className="flex h-full flex-col gap-3">
      {photo ? (
        <div className="aspect-square w-full overflow-hidden bg-bone-200">
          <img
            src={photo}
            alt={`Foto de ${review.customer_name}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-bone-200" aria-hidden="true" />
      )}

      <div className="flex items-center justify-between gap-2">
        <RatingStars value={review.rating} />
        {review.size && (
          <span className="border border-ink/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-smoke">
            Talle {review.size}
          </span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[12.5px] font-bold tracking-[-0.01em] text-ink">
            {review.customer_name}
          </p>
          {review.verified_purchase && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Compra verificada
            </span>
          )}
        </div>

        {review.title && (
          <h3 className="mt-1 text-[13px] font-bold leading-snug text-ink">
            {review.title}
          </h3>
        )}
        {review.body && (
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink/70">
            {review.body}
          </p>
        )}
      </div>
    </article>
  );
}
