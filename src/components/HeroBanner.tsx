import React from 'react';
import { ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedBrand } = useCatalog();

  const brands = [
    'Adidas', 'Nike', 'Converse', 'Puma', 'Vans', 'New Balance', 'Louis Vuitton', 'Calzado Kids'
  ];

  return (
    <section className="bg-white border-b border-gray-200 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Slogan Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1b3b2b]">
            GENUINOS UY • ELEGÍ TU ESTILO
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Calzado Auténtico en <span className="text-[#1b3b2b]">Uruguay</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Catálogo exclusivo con stock de Adidas, Nike, Jordan, Puma, Vans, Converse y más. Pedidos fáciles y entrega directa a todo el país vía WhatsApp.
        </p>

        {/* Value Highlights */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-700 pt-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <ShieldCheck className="w-4 h-4 text-[#1b3b2b]" />
            <span>100% Auténticos</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <Truck className="w-4 h-4 text-[#1b3b2b]" />
            <span>Envíos Nacionales</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-50 border border-gray-200">
            <MessageCircle className="w-4 h-4 text-[#1b3b2b]" />
            <span>WhatsApp +598 91 722 213</span>
          </div>
        </div>

        {/* Brand Selector Buttons */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Filtrar por Marca
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand);
                  const grid = document.getElementById('catalog-grid');
                  grid?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#1b3b2b] hover:text-white transition-all cursor-pointer border border-gray-200 active:scale-95"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
