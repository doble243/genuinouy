import React from 'react';
import { ArrowRight, ShieldCheck, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';

export const HomeSections: React.FC = () => {
  const { products, setSelectedBrand, setSelectedCategory, setActiveTab } = useCatalog();

  // Recién llegados (New Arrivals)
  const newArrivals = products.slice(0, 6);

  // Los más buscados (Featured Products)
  const featuredProducts = products.filter(p => p.featured || p.name.includes('Air') || p.name.includes('Campus')).slice(0, 4);

  // Editorial Campaign Selection
  const campaignProducts = products.slice(4, 7);

  const brandList = [
    { name: 'Adidas', logo: '/logo_genuinos.webp' },
    { name: 'Nike', logo: '/logo_genuinos.webp' },
    { name: 'Jordan', logo: '/logo_genuinos.webp' },
    { name: 'Puma', logo: '/logo_genuinos.webp' },
    { name: 'Vans', logo: '/logo_genuinos.webp' },
    { name: 'New Balance', logo: '/logo_genuinos.webp' },
    { name: 'Louis Vuitton', logo: '/logo_genuinos.webp' },
  ];

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    setSelectedCategory('Todas');
    setActiveTab('catalog');
    const catalogGrid = document.getElementById('catalog-grid');
    catalogGrid?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 py-8">
      
      {/* 4. RECIÉN LLEGADOS */}
      <section id="recien-llegados-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Recién llegados</h2>
            <p className="text-xs text-stone-500 font-medium">Los ingresos más recientes en nuestro catálogo</p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('Todas');
              setSelectedBrand('Todos');
              setActiveTab('catalog');
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#1b3b2b] hover:underline uppercase tracking-wider cursor-pointer"
          >
            <span>Ver todo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. MARCAS */}
      <section id="marcas-section" className="bg-white border-y border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-stone-900 uppercase tracking-widest">Elegí tu marca</h2>
            <p className="text-xs text-stone-500 font-medium mt-1">Curaduría de las mejores firmas del mundo</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {brandList.map((brand) => (
              <button
                key={brand.name}
                onClick={() => handleBrandSelect(brand.name)}
                className="px-5 py-3 rounded-xl border border-stone-200 hover:border-[#1b3b2b] text-xs font-black uppercase tracking-widest text-stone-800 hover:text-[#1b3b2b] hover:bg-stone-50 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COLECCIÓN EDITORIAL (Urban Essentials) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12271c] text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xl border border-stone-800">
          
          {/* Campaign Visual Banner */}
          <div className="lg:col-span-5 relative h-72 lg:h-auto overflow-hidden">
            <img
              src="/fotos_productos/New_Balance_530_1.jpg"
              alt="Urban Essentials"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12271c] via-transparent to-transparent opacity-90 lg:hidden" />
            <div className="absolute bottom-6 left-6 right-6 space-y-1 lg:hidden">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Campaña 2026</span>
              <h3 className="text-2xl font-black">Urban Essentials</h3>
            </div>
          </div>

          {/* Campaign Selection Grid */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-2 hidden lg:block">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Colección Editorial</span>
              <h2 className="text-3xl font-black text-white">Urban Essentials</h2>
              <p className="text-xs text-stone-300">Siluetas clásicas para el uso diario con confort y durabilidad.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {campaignProducts.map((p) => (
                <div key={p.id} className="bg-white/5 rounded-2xl p-3 border border-white/10 text-white space-y-2">
                  <img
                    src={p.images?.[0] || '/logo_genuinos.webp'}
                    alt={p.name}
                    className="w-full aspect-square object-cover rounded-xl bg-black/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                    }}
                  />
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-400">{p.brand}</span>
                    <h4 className="text-xs font-bold line-clamp-1">{p.name}</h4>
                    <span className="text-xs font-black text-white">${p.price.toLocaleString('es-UY')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('Todas');
                  setSelectedBrand('Todos');
                  setActiveTab('catalog');
                }}
                className="bg-white text-[#12271c] hover:bg-emerald-100 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <span>Ver la colección completa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRODUCTOS DESTACADOS (Los Más Buscados) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Los más buscados</h2>
            <p className="text-xs text-stone-500 font-medium">Modelos recomendados por nuestro equipo</p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('Todas');
              setSelectedBrand('Todos');
              setActiveTab('catalog');
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#1b3b2b] hover:underline uppercase tracking-wider cursor-pointer"
          >
            <span>Ver todo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. BLOQUE DE CONFIANZA */}
      <section className="bg-stone-100 border-y border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs font-bold text-stone-700 uppercase tracking-wider space-y-1">
            <p className="text-stone-900 font-black text-sm">
              Envíos a todo Uruguay · Pagos seguros en 6 cuotas · Atención directa por WhatsApp
            </p>
            <p className="text-stone-500 text-[11px] font-normal">
              Garantía de autenticidad en cada par importado. Stock listo para entrega rápida.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
