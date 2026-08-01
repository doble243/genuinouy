import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { AppTab } from '../types';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { activeTab, setActiveTab, favorites } = useCatalog();

  const handleTabClick = (tab: AppTab) => {
    if (tab === 'cart') {
      setIsCartOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-2 px-2 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around text-center">
        {/* 1. Inicio */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 active:scale-95 transition-all ${
            activeTab === 'home' ? 'text-[#1b3b2b]' : 'text-gray-400'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#1b3b2b]' : 'text-gray-400'}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Inicio</span>
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => handleTabClick('catalog')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 active:scale-95 transition-all ${
            activeTab === 'catalog' ? 'text-[#1b3b2b]' : 'text-gray-400'
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'catalog' ? 'text-[#1b3b2b]' : 'text-gray-400'}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Explorar</span>
        </button>

        {/* 3. Favoritos */}
        <button
          onClick={() => handleTabClick('favorites')}
          className={`relative flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 active:scale-95 transition-all ${
            activeTab === 'favorites' ? 'text-[#1b3b2b]' : 'text-gray-400'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] font-black bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Favoritos</span>
        </button>

        {/* 4. Carrito */}
        <button
          onClick={() => handleTabClick('cart')}
          className="relative flex flex-col items-center gap-1 text-gray-400 cursor-pointer py-1 px-2.5 active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#1b3b2b]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] font-black bg-[#1b3b2b] text-white rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-900">Carrito</span>
        </button>

        {/* 5. Cuenta / Perfil */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer py-1 px-2.5 active:scale-95 transition-all ${
            activeTab === 'profile' ? 'text-[#1b3b2b]' : 'text-gray-400'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-[#1b3b2b]' : 'text-gray-400'}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Cuenta</span>
        </button>
      </div>
    </div>
  );
};
