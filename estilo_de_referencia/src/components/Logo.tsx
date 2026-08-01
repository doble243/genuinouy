import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex flex-col leading-none">
      <span
        className={`font-serif text-2xl font-bold tracking-wide sm:text-3xl ${
          dark ? "text-white" : "text-brand"
        }`}
      >
        GENUINOS
        <sup className="ml-1 text-xs font-semibold tracking-widest align-super">
          UY
        </sup>
      </span>
      <span
        className={`mt-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-xs ${
          dark ? "text-white/80" : "text-brand/80"
        }`}
      >
        <span aria-hidden className="inline-block">
          »»&mdash;&rarr;
        </span>
        Elegí tu estilo
      </span>
    </Link>
  );
}
