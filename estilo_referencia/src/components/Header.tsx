import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { Bag, Close, Grid, Heart, Home, Logo, Menu, Search } from "./ui";

const NAV = [
  { label: "Nuevos", href: "#nuevos" },
  { label: "Championes", href: "#categorias" },
  { label: "Ropa", href: "#categorias" },
  { label: "Marcas", href: "#marcas" },
  { label: "Ofertas", href: "#ofertas" },
];

export function Header() {
  const { count, setCartOpen, setSearchOpen, menuOpen, setMenuOpen, wish } =
    useStore();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Barra superior fina */}
      <div className="bg-obsidian text-bone">
        <div className="edge mx-auto flex h-8 max-w-[1600px] items-center justify-center gap-6 text-[10.5px] font-medium uppercase tracking-[0.18em]">
          <span>Envíos a todo Uruguay</span>
          <span className="hidden text-gold-500 sm:inline">·</span>
          <span className="hidden sm:inline">Pagá en cuotas</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
          solid
            ? "border-b border-ink/8 bg-bone/85 backdrop-blur-xl"
            : "border-b border-transparent bg-bone"
        }`}
      >
        <div className="edge mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 md:h-16">
          <a href="#top" className="shrink-0" aria-label="GENUINOS inicio">
            <Logo className="h-7 md:h-8" />
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="group relative py-1 text-[13px] font-semibold tracking-[-0.01em] text-ink/75 transition-colors hover:text-ink"
              >
                {n.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 md:gap-1">
            <IconBtn label="Buscar" onClick={() => setSearchOpen(true)}>
              <Search className="h-[19px] w-[19px]" />
            </IconBtn>

            <IconBtn label="Favoritos" className="hidden md:inline-grid">
              <Heart className="h-[19px] w-[19px]" />
              {wish.length > 0 && <Dot />}
            </IconBtn>

            <IconBtn label="Carrito" onClick={() => setCartOpen(true)}>
              <Bag className="h-[19px] w-[19px]" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </IconBtn>

            <IconBtn
              label="Menú"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-[19px] w-[19px]" />
            </IconBtn>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BottomNav />
    </>
  );
}

function Dot() {
  return (
    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
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
      className={`relative inline-grid h-10 w-10 place-items-center text-ink/80 transition-colors hover:text-ink ${className}`}
    >
      {children}
    </button>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-[70] lg:hidden ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-obsidian/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-bone transition-transform duration-[380ms] ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-5">
          <Logo className="h-7" />
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center text-ink/70"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex flex-col px-5">
          {NAV.map((n, i) => (
            <a
              key={n.label}
              href={n.href}
              onClick={onClose}
              className="border-b border-ink/8 py-4 text-[22px] font-extrabold tracking-[-0.025em] transition-colors active:text-gold-600"
              style={{ transitionDelay: `${i * 20}ms` }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-5 pb-8 text-[12px] leading-relaxed text-smoke">
          <p className="font-semibold text-ink">Atención directa</p>
          <p className="mt-1">WhatsApp · Instagram @genuinos.uy</p>
          <p className="mt-3">Envíos a todo Uruguay · Pagá en cuotas</p>
        </div>
      </aside>
    </div>
  );
}

function BottomNav() {
  const { setSearchOpen, setCartOpen, count, setMenuOpen } = useStore();
  const items = [
    { label: "Inicio", icon: Home, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Buscar", icon: Search, action: () => setSearchOpen(true) },
    { label: "Catálogo", icon: Grid, action: () => setMenuOpen(true) },
    { label: "Carrito", icon: Bag, action: () => setCartOpen(true), badge: count },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/8 bg-bone/92 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {items.map(({ label, icon: Icon, action, badge }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-ink/70 transition-colors active:text-ink"
          >
            <Icon className="h-[19px] w-[19px]" />
            <span className="text-[10px] font-semibold tracking-[0.02em]">
              {label}
            </span>
            {!!badge && (
              <span className="absolute right-[26%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
