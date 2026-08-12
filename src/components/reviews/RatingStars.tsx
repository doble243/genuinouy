/**
 * RatingStars — 5 estrellas SVG con relleno parcial (width-clip) para
 * promedios. Accesible: `aria-label="Calificación X de 5"`.
 */
export function RatingStars({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const percent = (clamped / 5) * 100;
  const star = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className="inline-flex items-center"
      aria-label={`Calificación ${clamped.toFixed(1).replace(/\.0$/, "")} de 5`}
      role="img"
    >
      <span className="relative inline-flex">
        {/* Fondo: 5 estrellas huecas */}
        <span className="flex text-gold-500/25">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              fill="currentColor"
              className={star}
              aria-hidden="true"
            >
              <path d="M12 2.5l2.95 6.06 6.6.84-4.83 4.62 1.21 6.53L12 17.44 6.07 20.55l1.21-6.53L2.45 9.4l6.6-.84L12 2.5z" />
            </svg>
          ))}
        </span>
        {/* Frente: relleno parcial recortado por ancho */}
        <span
          className="absolute inset-0 overflow-hidden text-gold-500"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        >
          <span className="flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`${star} shrink-0`}
                aria-hidden="true"
              >
                <path d="M12 2.5l2.95 6.06 6.6.84-4.83 4.62 1.21 6.53L12 17.44 6.07 20.55l1.21-6.53L2.45 9.4l6.6-.84L12 2.5z" />
              </svg>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
}
