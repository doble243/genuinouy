import type { ReactNode, SVGProps } from "react";
import { useReveal } from "../lib/store";
import { LOGO } from "../lib/data";

/* ---------- Reveal ---------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "header";
}) {
  const ref = useReveal<HTMLDivElement>();
  const T = Tag as "div";
  return (
    <T
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </T>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({
  title,
  link,
  sub,
}: {
  title: string;
  link?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        {sub && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            {sub}
          </p>
        )}
        <h2 className="text-[22px] font-extrabold leading-none tracking-[-0.02em] md:text-[30px]">
          {title}
        </h2>
      </div>
      {link && (
        <a
          href="#"
          className="group hidden shrink-0 items-center gap-1.5 text-[13px] font-semibold text-smoke transition-colors hover:text-ink sm:inline-flex"
        >
          {link}
          <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      )}
    </div>
  );
}

/* ---------- Logo ---------- */
export function Logo({
  className = "h-7",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={LOGO}
      alt="GENUINOS"
      width={160}
      height={40}
      className={`${className} w-auto object-contain ${
        invert ? "brightness-0 invert" : ""
      }`}
      draggable={false}
    />
  );
}

/* Marca de agua: logo enorme, monocromo y apenas visible */
export function LogoWatermark({
  className = "",
  tone = "light",
  opacity = 0.05,
}: {
  className?: string;
  tone?: "light" | "dark";
  opacity?: number;
}) {
  return (
    <img
      src={LOGO}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none object-contain ${
        tone === "light" ? "brightness-0 invert" : "brightness-0"
      } ${className}`}
      style={{ opacity }}
      draggable={false}
    />
  );
}

/* ---------- Iconos (stroke fino, discretos) ---------- */
type I = SVGProps<SVGSVGElement>;
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Search = (p: I) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);
export const Heart = (p: I) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const Bag = (p: I) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 1 1 6 0V8" />
  </svg>
);
export const Menu = (p: I) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const Close = (p: I) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const Arrow = (p: I) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Plus = (p: I) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Minus = (p: I) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);
export const Home = (p: I) => (
  <svg {...base} {...p}>
    <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z" />
  </svg>
);
export const Grid = (p: I) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="7" />
    <rect x="13" y="4" width="7" height="7" />
    <rect x="4" y="13" width="7" height="7" />
    <rect x="13" y="13" width="7" height="7" />
  </svg>
);
