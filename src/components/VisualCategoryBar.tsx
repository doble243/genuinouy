import React from 'react';
import { useCatalog } from '../context/CatalogContext';

export const VisualCategoryBar: React.FC = () => {
  const { filterState, setSelectedBrand, setSelectedCategory, setActiveTab } = useCatalog();

  const brandChips = [
    { label: 'Todos', brand: 'Todos', category: 'Todas' },
    { label: 'Adidas', brand: 'Adidas', category: 'Todas' },
    { label: 'Nike', brand: 'Nike', category: 'Todas' },
    { label: 'Jordan', brand: 'Jordan', category: 'Todas' },
    { label: 'Puma', brand: 'Puma', category: 'Todas' },
    { label: 'Vans', brand: 'Vans', category: 'Todas' },
    { label: 'New Balance', brand: 'New Balance', category: 'Todas' },
    { label: 'Ofertas 🔥', brand: 'Todos', category: 'Ofertas' },
  ];

  return (
    <div className="bg-white border-b border-stone-200 py-3.5 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {brandChips.map((chip) => {
            const isActive =
              chip.category === 'Ofertas'
                ? filterState.selectedCategory === 'Ofertas'
                : filterState.selectedBrand === chip.brand && filterState.selectedCategory === 'Todas';

            return (
              <button
                key={chip.label}
                onClick={() => {
                  if (chip.category === 'Ofertas') {
                    setSelectedCategory('Ofertas');
                    setSelectedBrand('Todos');
                  } else {
                    setSelectedBrand(chip.brand);
                    setSelectedCategory('Todas');
                  }
                  setActiveTab('catalog');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#1b3b2b] text-white shadow-sm font-extrabold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
