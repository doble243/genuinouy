import React from 'react';
import { PackageSearch, RefreshCw } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useCatalog } from '../context/CatalogContext';

export const ProductGrid: React.FC = () => {
  const { filteredProducts, resetFilters } = useCatalog();

  if (filteredProducts.length === 0) {
    return (
      <div id="catalog-grid" className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto p-10 rounded-2xl glass-card border border-zinc-800">
          <PackageSearch className="w-14 h-14 text-amber-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-2xl font-black uppercase text-white mb-2 font-display">Sin Resultados</h3>
          <p className="text-xs text-zinc-400 mb-6">
            No encontramos zapatillas que coincidan con la búsqueda o marca seleccionada. Intenta ajustar los criterios.
          </p>
          <button
            onClick={resetFilters}
            className="gold-gradient-btn px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 cursor-pointer shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Restablecer Filtros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
