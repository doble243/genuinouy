import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Heart, X, ArrowRight, Menu } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export const Header: React.FC = () => {
  const { products, filterState, setSearchQuery, setActiveTab, setSelectedCategory, setSelectedBrand, favorites } = useCatalog();
  const { cartCount, setIsCartOpen, setQuickViewProduct } = useCart();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const query = filterState.searchQuery.trim().toLowerCase();

  // Instant matching products
  const matchingProducts: Product[] = query.length > 0
    ? products.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesCategory = p.category ? p.category.toLowerCase().includes(query) : false;
        const matchesSize = p.sizes ? p.sizes.some(s => s.toString() === query) : false;
        return matchesName || matchesBrand || matchesCategory || matchesSize;
      }).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setQuickViewProduct(product);
    setShowDropdown(false);
  };

  const navItems = [
    { label: 'Nuevos', action: () => { setSelectedCategory('Todas'); setSelectedBrand('Todos'); setActiveTab('catalog'); } },
    { label: 'Championes', action: () => { setSelectedCategory('Championes'); setSelectedBrand('Todos'); setActiveTab('catalog'); } },
    { label: 'Ropa', action: () => { setSelectedCategory('Ropa'); setSelectedBrand('Todos'); setActiveTab('catalog'); } },
    { label: 'Marcas', action: () => { const el = document.getElementById('marcas-section'); el?.scrollIntoView({ behavior: 'smooth' }); } },
    { label: 'Ofertas', action: () => { setSelectedCategory('Ofertas'); setSelectedBrand('Todos'); setActiveTab('catalog'); } },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Banner Ticker */}
      <div className="bg-[#1b3b2b] text-white text-[11px] font-bold uppercase tracking-widest py-2 px-4 text-center">
        <span>ENVÍOS A TODO URUGUAY · PAGÁ EN HASTA 6 CUOTAS</span>
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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-xs font-black uppercase tracking-wider text-stone-700 hover:text-[#1b3b2b] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Instant Live Search Input & Dropdown */}
        <div ref={searchRef} className="flex-1 max-w-xs sm:max-w-md relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={filterState.searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Buscar Adidas, Nike, Jordan, talle..."
              className="w-full bg-stone-100 border border-stone-200 rounded-full pl-10 pr-9 py-2 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] focus:ring-2 focus:ring-[#1b3b2b]/10 transition-all shadow-inner"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Instant Autocomplete Results Dropdown */}
          {showDropdown && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <span>Resultados Encontrados ({matchingProducts.length})</span>
                <span className="text-[#1b3b2b]">Presioná para ver</span>
              </div>

              {matchingProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500 font-medium">
                  No se encontraron championes con "{filterState.searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {matchingProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-3 hover:bg-stone-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || '/logo_genuinos.webp'}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl bg-stone-100 border border-stone-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                          }}
                        />
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#1b3b2b] tracking-wider block">
                            {p.brand}
                          </span>
                          <h4 className="text-xs font-extrabold text-stone-900 line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] text-stone-500">
                            Talles {p.sizes[0]}-{p.sizes[p.sizes.length - 1]}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <span className="text-xs font-black text-[#1b3b2b]">
                          ${p.price.toLocaleString('es-UY')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Favorites & Cart */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('favorites')}
            className="relative p-2 text-stone-600 hover:text-[#1b3b2b] transition-colors cursor-pointer hidden sm:block"
            title="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 text-[10px] font-black bg-red-500 text-white rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-[#1b3b2b] cursor-pointer"
            aria-label="Menú de Navegación"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-xs font-black uppercase tracking-wider text-stone-800 hover:text-[#1b3b2b]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
