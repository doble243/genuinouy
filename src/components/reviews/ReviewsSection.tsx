import { useEffect, useState } from "react";
import type { Review } from "../../types/reviews";
import { fetchApprovedByProduct } from "../../lib/reviewsService";
import { RatingStars } from "./RatingStars";
import { ReviewCard } from "./ReviewCard";

/**
 * ReviewsSection — promedio + lista de reseñas aprobadas de un producto.
 * El promedio se calcula en cliente sobre las aprobadas (media, 1 decimal).
 * Cero aprobadas → placeholder, sin UI rota. Refetch al cambiar productId.
 */
export function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReviews(null);
    setError(null);

    fetchApprovedByProduct(productId)
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las reseñas.");
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (error) {
    return (
      <p className="text-[12.5px] text-smoke" role="status">
        {error}
      </p>
    );
  }

  if (reviews === null) {
    return (
      <p className="text-[12.5px] text-smoke" role="status">
        Cargando reseñas…
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border-t border-ink/8 pt-6">
        <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
          Reseñas
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
          Todavía no hay reseñas de este producto.
        </p>
      </div>
    );
  }

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgLabel = avg.toFixed(1);

  return (
    <div className="border-t border-ink/8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-smoke">
          Reseñas
        </h3>
        <div className="flex items-center gap-2">
          <RatingStars value={avg} />
          <span className="text-[12.5px] font-bold text-ink">{avgLabel}</span>
          <span className="text-[11.5px] text-smoke">
            · basado en {reviews.length}{" "}
            {reviews.length === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
    </div>
  );
}
