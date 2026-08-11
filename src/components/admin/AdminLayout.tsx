import { useState, type ReactNode } from "react";
import type { AdminTab, StoreOption } from "../../types/admin";
import { LOGO } from "../../lib/data";

interface AdminLayoutProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onOpenNewProductModal: () => void;
  onExitAdmin?: () => void;
  children: ReactNode;
  storeOptions?: StoreOption[];
  currentStoreId?: string;
  onStoreChange?: (storeId: string) => void;
}

const DEFAULT_STORES: StoreOption[] = [
  { id: "store-central", name: "GENUINOS - Casa Central", location: "Pando, UY", isOnline: true },
  { id: "store-carrasco", name: "GENUINOS - Tienda Online", location: "genuinos.simplemente.com.uy", isOnline: true },
];

export function AdminLayout({
  activeTab,
  setActiveTab,
  onOpenNewProductModal,
  onExitAdmin,
  children,
  storeOptions = DEFAULT_STORES,
  currentStoreId = "store-central",
  onStoreChange,
}: AdminLayoutProps) {
  const [selectedStore, setSelectedStore] = useState<string>(currentStoreId);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);

  const activeStore = storeOptions.find((s) => s.id === selectedStore) || storeOptions[0];

  const handleSelectStore = (id: string) => {
    setSelectedStore(id);
    onStoreChange?.(id);
    setStoreMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bone text-ink font-sans flex flex-col md:flex-row antialiased selection:bg-gold-500 selection:text-black">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-obsidian text-bone border-r border-ink/80 min-h-screen sticky top-0 h-screen z-30">
        {/* Brand & Store Header */}
        <div className="p-5 border-b border-ink/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={LOGO}
                alt="GENUINOS"
                className="h-6 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(212,168,83,0.5))' }}
              />
              <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border border-gold-500/30 uppercase">
                ADMIN
              </span>
            </div>
          </div>

          {/* Desktop Store Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStoreMenuOpen(!storeMenuOpen)}
              className="w-full bg-ink/70 hover:bg-ink border border-white/10 hover:border-gold-500/40 rounded-lg p-2.5 flex items-center justify-between text-left transition-colors group"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  <p className="text-xs font-bold text-bone truncate">{activeStore.name}</p>
                </div>
                <p className="text-[11px] text-smoke truncate pl-3.5">{activeStore.location}</p>
              </div>
              <svg
                className={`w-4 h-4 text-smoke group-hover:text-gold-400 transition-transform duration-200 shrink-0 ${
                  storeMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {storeMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-obsidian border border-white/15 rounded-lg shadow-2xl py-1 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-smoke uppercase tracking-wider border-b border-white/10">
                  Seleccionar Sucursal / Tienda
                </div>
                {storeOptions.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStore(st.id)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-ink transition-colors ${
                      st.id === selectedStore ? "bg-ink/80 text-gold-400 font-semibold" : "text-bone/80"
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-medium">{st.name}</p>
                      <p className="text-[10px] text-smoke">{st.location}</p>
                    </div>
                    {st.id === selectedStore && (
                      <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={onOpenNewProductModal}
            className="w-full bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-gold-500/10 active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex-1 flex flex-col gap-1 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "dashboard"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "products"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventario & Productos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "orders"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Pedidos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "customers"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Clientes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "categories"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10M7 17h10" />
            </svg>
            Categorías y Marcas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("coupons")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "coupons"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Cupones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "hero"
                ? "bg-ink text-gold-400 border-l-4 border-gold-500 pl-2.5"
                : "text-smoke hover:text-bone hover:bg-ink/40"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-2-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Hero / Carrusel
          </button>

          <a
            href="/"
            onClick={(e) => {
              if (onExitAdmin) {
                e.preventDefault();
                onExitAdmin();
              }
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold text-smoke hover:text-bone hover:bg-ink/40 transition-all mt-auto"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver Tienda Pública
            </div>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-smoke">Ir</span>
          </a>
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-ink/60 bg-ink/30 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gold-500/20 text-gold-400 font-extrabold flex items-center justify-center text-xs border border-gold-500/30">
            GA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-bone truncate">Genuinos Admin</p>
            <p className="text-[10px] text-smoke truncate">Super Administrador</p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Top Bar */}
        <header className="bg-obsidian text-bone border-b border-ink/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between md:px-8">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="GENUINOS" className="h-5 w-auto object-contain md:hidden" style={{ filter: 'drop-shadow(0 0 6px rgba(212,168,83,0.4))' }} />
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-smoke">Admin Panel</span>
              <span className="text-smoke">/</span>
              <span className="font-bold text-bone uppercase tracking-wider">
                {activeTab === "dashboard"
                  ? "Dashboard Stats"
                  : activeTab === "orders"
                  ? "Pedidos"
                  : activeTab === "customers"
                  ? "Clientes"
                  : activeTab === "hero"
                  ? "Hero / Carrusel"
                  : "Gestión de Productos"}
              </span>
            </div>
            <div className="md:hidden flex items-center gap-1.5 bg-ink px-2.5 py-1 rounded-full text-[11px] border border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-semibold text-bone truncate max-w-[140px]">{activeStore.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewProductModal}
              className="hidden sm:flex md:hidden items-center gap-1.5 bg-gold-500 text-obsidian font-bold text-xs px-3 py-1.5 rounded-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo
            </button>

            <a
              href="/"
              className="p-2 text-smoke hover:text-bone rounded-lg bg-ink/60 border border-white/10 md:hidden flex items-center text-xs gap-1"
              title="Ver Tienda"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-obsidian/95 backdrop-blur-md border-t border-ink/80 px-2 py-1.5 z-40 flex items-center justify-around shadow-2xl">
        {/* Dashboard Button */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
            activeTab === "dashboard"
              ? "text-gold-400 font-bold bg-white/5"
              : "text-smoke hover:text-bone"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "dashboard" ? 2.2 : 1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        {/* Productos Button */}
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
            activeTab === "products"
              ? "text-gold-400 font-bold bg-white/5"
              : "text-smoke hover:text-bone"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "products" ? 2.2 : 1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-[10px] tracking-tight">Productos</span>
        </button>

        {/* Pedidos Button */}
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
            activeTab === "orders"
              ? "text-gold-400 font-bold bg-white/5"
              : "text-smoke hover:text-bone"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "orders" ? 2.2 : 1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] tracking-tight">Pedidos</span>
        </button>

        {/* Prominent Gold "+ Nuevo" Button */}
        <button
          type="button"
          onClick={onOpenNewProductModal}
          className="flex flex-col items-center justify-center -mt-5 min-w-[56px] min-h-[56px] bg-gradient-to-br from-gold-400 to-gold-600 text-obsidian rounded-full shadow-lg shadow-gold-500/25 border-2 border-obsidian active:scale-95 transition-transform"
          aria-label="Agregar Nuevo Producto"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Clientes Button */}
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
            activeTab === "customers"
              ? "text-gold-400 font-bold bg-white/5"
              : "text-smoke hover:text-bone"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "customers" ? 2.2 : 1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] tracking-tight">Clientes</span>
        </button>

        {/* Hero Button */}
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
            activeTab === "hero"
              ? "text-gold-400 font-bold bg-white/5"
              : "text-smoke hover:text-bone"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === "hero" ? 2.2 : 1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-2-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] tracking-tight">Hero</span>
        </button>

        {/* Ver Tienda Button */}
        <a
          href="/"
          onClick={(e) => {
            if (onExitAdmin) {
              e.preventDefault();
              onExitAdmin();
            }
          }}
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl text-smoke hover:text-bone transition-all"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-[10px] tracking-tight">Tienda</span>
        </a>
      </div>
    </div>
  );
}
