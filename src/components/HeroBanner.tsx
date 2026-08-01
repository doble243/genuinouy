import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';

export const HeroBanner: React.FC = () => {
  const { setActiveTab, products, setSelectedCategory, setSelectedBrand } = useCatalog();
  const { setQuickViewProduct } = useCart();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const heroFeaturedProducts = products.filter(
    (p) => p.name.includes('Campus') || p.name.includes('Air') || p.name.includes('Jordan') || p.name.includes('530')
  ).slice(0, 4);

  const slides = heroFeaturedProducts.length > 0 ? heroFeaturedProducts : products.slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];
  if (!current) return null;

  const currentImg = current.images?.[0] || '/fotos_productos/Adidas_Campus_1.jpg';

  const handleExploreNewArrivals = () => {
    setSelectedCategory('Todas');
    setSelectedBrand('Todos');
    setActiveTab('catalog');
    const catalogEl = document.getElementById('recien-llegados-section') || document.getElementById('catalog-grid');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[80vh] sm:h-[88vh] bg-[#0d1712] overflow-hidden flex flex-col justify-between">
      {/* Background Photography with Soft Contrast Fade */}
      <div className="absolute inset-0 z-0">
        <img
          key={current.id}
          src={currentImg}
          alt={current.name}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />
        {/* Subtle Dark Gradient Overlay for Reading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1712] via-black/40 to-black/30" />

        {/* Subtle Low-Opacity GENUINOS Watermark Logo in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
          <img
            src="/logo_genuinos.webp"
            alt=""
            className="w-[80vw] max-w-4xl h-auto object-contain filter grayscale invert"
          />
        </div>
      </div>

      {/* Hero Header Tag & Carousel Dots */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 z-10 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          {current.brand} • COLECCIÓN 2026
        </span>

        {/* Carousel Dots */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero Main Editorial Copy & Single Clear CTA */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10 z-10 space-y-4">
        <div className="space-y-2 text-left max-w-xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Los pares que no pasan desapercibidos.
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
            Descubrí los nuevos ingresos importados con stock inmediato en Uruguay.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleExploreNewArrivals}
            className="bg-white hover:bg-stone-100 text-[#1b3b2b] px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow-2xl active:scale-95 transition-all cursor-pointer"
          >
            <span>Ver nuevos ingresos</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setQuickViewProduct(current)}
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-wider bg-black/40 px-4 py-3.5 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <span>Ver {current.name}</span>
          </button>
        </div>
      </div>

      {/* Slider Prev / Next Arrows */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-emerald-600 backdrop-blur-sm border border-white/10 hidden sm:flex cursor-pointer z-30 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-emerald-600 backdrop-blur-sm border border-white/10 hidden sm:flex cursor-pointer z-30 transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};
