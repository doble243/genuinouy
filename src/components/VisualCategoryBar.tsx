import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { VisualCategory } from '../types';

export const VisualCategoryBar: React.FC = () => {
  const { setSelectedCategory, setSelectedBrand, setActiveTab } = useCatalog();

  const categories: { label: string; slug: VisualCategory; img: string }[] = [
    {
      label: 'Zapatillas',
      slug: 'Lifestyle',
      img: 'https://images.pexels.com/photos/27100548/pexels-photo-27100548.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      label: 'Running',
      slug: 'Running',
      img: 'https://images.pexels.com/photos/27256470/pexels-photo-27256470.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      label: 'Básquet & Skate',
      slug: 'Skate',
      img: 'https://images.pexels.com/photos/27256452/pexels-photo-27256452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      label: 'Niños & Ofertas',
      slug: 'Kids',
      img: 'https://images.pexels.com/photos/27256446/pexels-photo-27256446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#47624d]">
            Categorías
          </p>
          <h2 className="font-serif-brand text-3xl font-bold text-stone-900 mt-1">
            ¿Qué estás buscando?
          </h2>
        </div>
        <button
          onClick={() => {
            setSelectedCategory('Todas');
            setSelectedBrand('Todos');
            setActiveTab('catalog');
          }}
          className="text-xs font-bold text-[#47624d] hover:underline hidden sm:block cursor-pointer"
        >
          Ver todo el catálogo →
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.label}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setActiveTab('catalog');
              const grid = document.getElementById('catalog-grid');
              grid?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative overflow-hidden rounded-2xl shadow-sm aspect-[4/5] cursor-pointer"
          >
            <img
              src={cat.img}
              alt={cat.label}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#35493a]/90 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 font-serif-brand text-xl font-bold text-white">
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
