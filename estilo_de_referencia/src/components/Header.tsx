"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Catálogo" },
  { href: "/productos?categoria=zapatillas", label: "Zapatillas" },
  { href: "/productos?categoria=botas", label: "Botas" },
  { href: "/#ubicacion", label: "Ubicación" },
];

export function Header() {
  const { totalItems, ready } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition hover:text-brand ${
                pathname === l.href.split("?")[0] && !l.href.includes("?") && !l.href.includes("#")
                  ? "text-brand"
                  : "text-stone-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/carrito"
            className="relative inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Carrito</span>
            {ready && totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-brand-dark">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand/20 text-brand md:hidden"
            aria-label="Abrir menú"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-brand/10 bg-cream px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-brand/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
