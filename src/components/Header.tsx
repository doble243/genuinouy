import React from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { filterState, setSearchQuery, setActiveTab } = useCatalog();
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Banner Ticker */}
      <div className="bg-[#1b3b2b] text-white text-[11px] font-bold uppercase tracking-widest py-2 px-4 text-center">
        <span>GENUINOS UY • CALZADO 100% AUTÉNTICO • WHATSAPP +598 91 722 213</span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          className="flex items-center cursor-pointer flex-shrink-0"
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            src="/logo_genuinos.webp"
            alt="GENUINOS UY"
            className="h-10 sm:h-12 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
            }}
          />
        </div>

        {/* Search Field */}
        <div className="flex-1 max-w-xs sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Adidas, Nike, Jordan..."
              className="w-full bg-stone-100 border border-stone-200 rounded-full pl-10 pr-9 py-2 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b3b2b] text-white hover:bg-[#12271c] transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
          aria-label="Ver Carrito de Compras"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">
            Bolsa
          </span>
          {cartCount > 0 && (
            <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black bg-white text-[#1b3b2b] rounded-full shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
