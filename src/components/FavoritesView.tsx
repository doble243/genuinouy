import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';

export const FavoritesView: React.FC = () => {
  const { products, favorites, setActiveTab } = useCatalog();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-brand flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Favoritos
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Championes que guardaste para volver a ver
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-white/10 text-white rounded-full border border-white/10">
          {favoriteProducts.length} Guardados
        </span>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <Heart className="w-16 h-16 text-gray-700 mx-auto" />
          <h3 className="text-xl font-bold text-white font-serif-brand">No tenés favoritos guardados</h3>
          <p className="text-xs text-gray-400">
            Tocá el corazón en cualquier producto para agregarlo a esta sección.
          </p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="btn-dark-primary px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Ver championes</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
