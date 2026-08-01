import React from 'react';
import { useCatalog } from '../context/CatalogContext';

export const VisualCategoryBar: React.FC = () => {
  const { filterState, setSelectedBrand, setSelectedCategory, setActiveTab } = useCatalog();

  const chips = [
    { label: 'Todos', type: 'category', value: 'Todas' },
    { label: 'Nuevos', type: 'category', value: 'Lifestyle' },
    { label: 'Nike', type: 'brand', value: 'Nike' },
    { label: 'Adidas', type: 'brand', value: 'Adidas' },
    { label: 'Jordan', type: 'brand', value: 'Jordan' },
    { label: 'Running', type: 'category', value: 'Running' },
    { label: 'Ofertas', type: 'category', value: 'Ofertas' },
  ];

  return (
    <div className="bg-[#0a0c0e] py-4 px-4 overflow-x-auto no-scrollbar border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {chips.map((chip) => {
          const isActive =
            chip.type === 'brand'
              ? filterState.selectedBrand === chip.value
              : filterState.selectedCategory === chip.value;

          return (
            <button
              key={chip.label}
              onClick={() => {
                if (chip.type === 'brand') {
                  setSelectedBrand(chip.value);
                  setSelectedCategory('Todas');
                } else {
                  setSelectedCategory(chip.value as any);
                  setSelectedBrand('Todos');
                }
                setActiveTab('catalog');
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'bg-[#14171c] text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
