import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { SearchX } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { filteredProducts, resetFilters } = useCatalog();

  return (
    <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <SearchX className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No encontramos ese modelo</h3>
          <p className="text-xs text-gray-400">Proba buscando por marca como Nike, Adidas o Jordan.</p>
          <button
            onClick={resetFilters}
            className="btn-dark-primary px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Ver todos los championes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
