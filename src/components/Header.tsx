import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import {
  storefrontWhatsappUrl,
  STORE_PHONE,
  STORE_GREETING,
} from "../lib/whatsapp";
import { Bag, Close, Grid, Heart, Home, Menu, Search } from "./ui";

const NAV = [
  { label: "Nuevos", href: "#nuevos", target: "nuevos" },
  { label: "Championes", href: "#productos", target: "productos" },
  { label: "Marcas", href: "#marcas", target: "marcas" },
  { label: "Ofertas", href: "#ofertas", target: "ofertas" },
];

const SECTION_IDS = NAV.map((n) => n.target);

/** Scroll-spy: reports the section currently crossing the viewport center. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [ids.join("|")]);

  return active;
}

export function Header() {
  const {
    count,
    setCartOpen,
    setSearchOpen,
    setWishOpen,
    menuOpen,
    setMenuOpen,
    wish,
  } = useStore();
  const active = useActiveSection(SECTION_IDS);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-obsidian text-bone">
        <div className="edge mx-auto flex h-8 max-w-[1600px] items-center justify-between text-[10.5px] font-medium uppercase tracking-[0.18em]">
          <div className="mx-auto flex items-center gap-2.5 sm:mx-0 sm:gap-6">
            <span>Envíos a todo Uruguay</span>
            <span className="hidden text-gold-500 sm:inline">·</span>
            <span className="hidden sm:inline">Pagá en cuotas</span>
          </div>
          <a
            href="#admin"
            className="hidden items-center gap-1.5 font-bold text-gold-400 transition-colors hover:text-gold-300 sm:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse" />
            Panel Admin
          </a>
        </div>
      </div>

      <header className="header-chrome sticky top-0 z-50 border-b">
        <div className="edge mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between gap-4">
          <a
            href="#top"
            className="genuinos-header-logo shrink-0 transition-opacity hover:opacity-70"
            aria-label="GENUINOS inicio"
          >
            <img
              src="/assets/genuinos/logo-header-forest.svg"
              alt="GENUINOS"
              draggable={false}
            />
          </a>

          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV.map((n) => {
              const isActive = active === n.target;
              return (
                <a
                  key={n.label}
                  href={n.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`group relative rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-200 hover:bg-ink/[0.04] ${
                    isActive ? "text-ink" : "text-ink/65 hover:text-ink"
                  }`}
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-3.5 bottom-1 h-px origin-left bg-gold-500 transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5">
            <IconBtn label="Buscar" onClick={() => setSearchOpen(true)}>
              <Search className="h-[19px] w-[19px]" />
            </IconBtn>

            <IconBtn
              label={`Favoritos${wish.length > 0 ? ` (${wish.length})` : ""}`}
              onClick={() => setWishOpen(true)}
            >
              <Heart
                className="h-[19px] w-[19px]"
                fill={wish.length > 0 ? "currentColor" : "none"}
              />
              {wish.length > 0 && <Badge value={wish.length} />}
            </IconBtn>

            <a
              href="#cuenta"
              aria-label="Mi cuenta"
              className="grid h-10 w-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-[19px] w-[19px]" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>

            <IconBtn
              label={`Carrito${count > 0 ? ` (${count})` : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <Bag className="h-[19px] w-[19px]" />
              {count > 0 && <Badge value={count} />}
            </IconBtn>

            <IconBtn
              label="Abrir menú"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-[19px] w-[19px]" />
            </IconBtn>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BottomNav active={active} />
    </>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-ink ring-2 ring-bone">
      {value > 99 ? "99+" : value}
    </span>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative inline-grid h-11 w-11 place-items-center rounded-full text-ink/75 transition-[color,background-color,transform] duration-200 hover:bg-ink/[0.05] hover:text-ink active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { wish, setWishOpen } = useStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[70] lg:hidden ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-obsidian/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-bone shadow-[-24px_0_60px_-40px_rgba(0,0,0,0.6)] transition-transform duration-[380ms] ease-[var(--ease-out-expo)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[var(--header-h)] items-center justify-between px-5">
          <span className="genuinos-header-logo">
            <img
              src="/assets/genuinos/logo-header-forest.svg"
              alt="GENUINOS"
              draggable={false}
            />
          </span>
          <button
            aria-label="Cerrar menú"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Menú" className="mt-2 flex flex-col px-5">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-ink/8 py-4 text-[22px] font-extrabold tracking-[-0.025em] transition-colors active:text-gold-600"
            >
              {n.label}
            </a>
          ))}

          <button
            type="button"
            onClick={() => {
              onClose();
              setWishOpen(true);
            }}
            className="flex items-center justify-between border-b border-ink/8 py-4 text-left text-[22px] font-extrabold tracking-[-0.025em] transition-colors active:text-gold-600"
          >
            Favoritos
            <span className="flex items-center gap-2 text-[13px] font-semibold text-smoke">
              {wish.length > 0 && wish.length}
              <Heart
                className="h-5 w-5"
                fill={wish.length > 0 ? "currentColor" : "none"}
              />
            </span>
          </button>
        </nav>

        <div className="mt-auto px-5 pb-8 text-[12px] leading-relaxed text-smoke">
          <a
            href="#admin"
            onClick={onClose}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gold-500/30 bg-obsidian px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gold-400"
          >
            <span className="h-2 w-2 rounded-full bg-gold-400 motion-safe:animate-pulse" />
            Panel Admin
          </a>
          <p className="font-semibold text-ink">Atención directa</p>
          <div className="mt-1 flex items-center gap-3">
            <a
              href={
                storefrontWhatsappUrl(
                  STORE_PHONE,
                  STORE_GREETING,
                ) ?? "#"
              }
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-ink/30 underline-offset-2 active:text-gold-600"
            >
              WhatsApp
            </a>
            <span className="text-ink/30">·</span>
            <a
              href="https://www.instagram.com/genuinosuyy/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-ink/30 underline-offset-2 active:text-gold-600"
            >
              Instagram @genuinosuyy
            </a>
          </div>
          <p className="mt-3">Envíos a todo Uruguay · Pagá en cuotas</p>
        </div>
      </aside>
    </div>
  );
}

function BottomNav({ active }: { active: string | null }) {
  const { setSearchOpen, setCartOpen, searchOpen, cartOpen, count } =
    useStore();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlayOpen = searchOpen || cartOpen;

  const items = [
    {
      label: "Inicio",
      icon: Home,
      current: !overlayOpen && atTop,
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      label: "Catálogo",
      icon: Grid,
      current: !overlayOpen && !atTop && active === "productos",
      action: () =>
        document
          .getElementById("productos")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Buscar",
      icon: Search,
      current: searchOpen,
      action: () => setSearchOpen(true),
    },
    {
      label: "Carrito",
      icon: Bag,
      current: cartOpen,
      badge: count,
      action: () => setCartOpen(true),
    },
  ];

  return (
    <nav
      aria-label="Navegación rápida"
      className="tabbar fixed inset-x-0 bottom-0 z-40 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ label, icon: Icon, action, badge, current }) => (
          <li key={label} className="contents">
            <button
              type="button"
              onClick={action}
              aria-current={current ? "page" : undefined}
              className={`relative flex min-h-[var(--tabbar-h)] flex-col items-center justify-center gap-1 transition-colors duration-200 active:bg-ink/[0.04] ${
                current ? "text-ink" : "text-ink/55"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-x-5 top-0 h-0.5 origin-center rounded-full bg-gold-500 transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                  current ? "scale-x-100" : "scale-x-0"
                }`}
              />
              <span className="relative grid place-items-center">
                <Icon className="h-[21px] w-[21px]" />
                {!!badge && (
                  <span className="absolute -right-2.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-ink">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold tracking-[0.02em]">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
