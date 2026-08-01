import React, { useState } from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { filterState, setSearchQuery, setActiveTab } = useCatalog();
  const { cartCount, setIsCartOpen } = useCart();
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0c0e]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between">
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
          alt="GENUINOS"
          className="h-8 sm:h-10 w-auto object-contain rounded-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />
      </div>

      {/* Right Controls: Compact Search & Cart */}
      <div className="flex items-center gap-3">
        {showSearchInput ? (
          <div className="relative animate-fadeIn">
            <input
              type="text"
              autoFocus
              value={filterState.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelo..."
              className="bg-[#181b20] border border-white/20 rounded-full text-xs font-semibold text-white placeholder-gray-500 pl-4 pr-8 py-1.5 focus:outline-none focus:border-emerald-400 w-44 sm:w-64"
            />
            <button
              onClick={() => {
                setShowSearchInput(false);
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearchInput(true)}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          aria-label="Ver Carrito"
        >
          <ShoppingBag className="w-5 h-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] font-black bg-emerald-400 text-black rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
