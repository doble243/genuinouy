import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

export const VisualCategoryBar: React.FC = () => {
  const { setSelectedCategory, setSelectedBrand, setActiveTab } = useCatalog();

  const categoryBlocks = [
    {
      title: 'Championes',
      subtitle: 'Ediciones exclusivas & modelos icónicos',
      cta: 'Ver catálogo',
      image: '/fotos_productos/Adidas_Campus_1.jpg',
      category: 'Championes',
    },
    {
      title: 'Ropa & Accesorios',
      subtitle: 'Indumentaria urbana y complementos',
      cta: 'Explorar',
      image: '/fotos_productos/Puma_Palermo_1.jpg',
      category: 'Ropa',
    },
    {
      title: 'Ofertas / Últimos Pares',
      subtitle: 'Precios especiales de temporada',
      cta: 'Ver ofertas',
      image: '/fotos_productos/Nike_Air_Force_1_1.jpg',
      category: 'Ofertas',
    },
  ];

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedBrand('Todos');
    setActiveTab('catalog');
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-[#faf9f6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryBlocks.map((block) => (
            <div
              key={block.title}
              onClick={() => handleCategoryClick(block.category)}
              className="relative h-80 sm:h-96 rounded-2xl overflow-hidden group cursor-pointer border border-stone-200 shadow-sm"
            >
              {/* Background Image */}
              <img
                src={block.image}
                alt={block.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                }}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Minimal Superimposed Text & Subtle CTA */}
              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <h3 className="text-2xl font-black tracking-tight">{block.title}</h3>
                <p className="text-xs text-stone-300 font-medium">{block.subtitle}</p>
                <div className="pt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 group-hover:text-white transition-colors">
                  <span>{block.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
