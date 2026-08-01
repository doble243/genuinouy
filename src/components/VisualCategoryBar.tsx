import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { VisualCategory } from '../types';
import { Flame, Sparkles, Footprints, Flame as RunningIcon, Dumbbell, Baby, Tag } from 'lucide-react';

export const VisualCategoryBar: React.FC = () => {
  const { filterState, setSelectedCategory, setActiveTab } = useCatalog();

  const categories: { name: VisualCategory; icon: React.ReactNode; color: string }[] = [
    { name: 'Todas', icon: <Sparkles className="w-4 h-4" />, color: 'bg-gray-100 text-gray-800' },
    { name: 'Lifestyle', icon: <Footprints className="w-4 h-4" />, color: 'bg-emerald-50 text-[#1b3b2b]' },
    { name: 'Running', icon: <RunningIcon className="w-4 h-4" />, color: 'bg-blue-50 text-blue-800' },
    { name: 'Básquet', icon: <Dumbbell className="w-4 h-4" />, color: 'bg-amber-50 text-amber-800' },
    { name: 'Skate', icon: <Tag className="w-4 h-4" />, color: 'bg-purple-50 text-purple-800' },
    { name: 'Kids', icon: <Baby className="w-4 h-4" />, color: 'bg-pink-50 text-pink-800' },
    { name: 'Ofertas', icon: <Flame className="w-4 h-4" />, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 flex-shrink-0">
          Categorías:
        </span>
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = filterState.selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setActiveTab('catalog');
                  const grid = document.getElementById('catalog-grid');
                  grid?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#1b3b2b] text-white shadow-md font-extrabold'
                    : `${cat.color} hover:opacity-80 border border-gray-200/80`
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
