import React from 'react';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { FilterState } from '../types';

export const FilterBar: React.FC = () => {
  const {
    filteredProducts,
    filterState,
    genders,
    setSelectedGender,
    setSortBy,
    resetFilters,
  } = useCatalog();

  const isFilterActive =
    filterState.selectedBrand !== 'Todos' ||
    filterState.selectedGender !== 'Todos' ||
    filterState.sortBy !== 'featured' ||
    filterState.searchQuery.trim().length > 0;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Gender Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {genders.map((gender) => {
              const isActive = filterState.selectedGender === gender;
              return (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1b3b2b] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {gender}
                </button>
              );
            })}
          </div>

          {/* Right Section: Sort & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-gray-500 font-semibold">
              Productos: <strong className="text-gray-900 font-bold">{filteredProducts.length}</strong>
            </span>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={filterState.sortBy}
                onChange={(e) => setSortBy(e.target.value as FilterState['sortBy'])}
                className="bg-gray-100 border border-gray-200 rounded-lg pl-8 pr-8 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#1b3b2b] appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A-Z</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold uppercase transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
