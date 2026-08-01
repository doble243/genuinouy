import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';

export const FavoritesView: React.FC = () => {
  const { products, favorites, setActiveTab } = useCatalog();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-brand flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Mis Favoritos
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Modelos guardados para revisar y comprar cuando quieras
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-[#1b3b2b] rounded-full border border-emerald-200">
          {favoriteProducts.length} Guardados
        </span>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <Heart className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-xl font-bold text-gray-800 font-serif-brand">No tenés favoritos guardados todavía</h3>
          <p className="text-xs text-gray-500">
            Tocá el icono del corazón en cualquier producto del catálogo para tenerlo siempre a mano.
          </p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="btn-forest px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Explorar Modelos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
