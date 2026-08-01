import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';

export const HeroBanner: React.FC = () => {
  const { setActiveTab, products } = useCatalog();
  const { setQuickViewProduct } = useCart();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const heroFeaturedProducts = products.filter(
    (p) => p.name.includes('Campus') || p.name.includes('Air') || p.name.includes('Jordan') || p.name.includes('530')
  ).slice(0, 4);

  const slides = heroFeaturedProducts.length > 0 ? heroFeaturedProducts : products.slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];
  if (!current) return null;

  const currentImg = current.images?.[0] || '/fotos_productos/Adidas_Campus_1.jpg';

  return (
    <section className="relative w-full h-[65vh] sm:h-[75vh] bg-[#0c1611] overflow-hidden">
      {/* Full Bleed Background Image with Smooth Fade */}
      <div className="absolute inset-0">
        <img
          key={current.id}
          src={currentImg}
          alt={current.name}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />
        {/* Integrated Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1611] via-[#0c1611]/60 to-black/30" />
      </div>

      {/* Hero Interactive Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8 sm:py-12 z-20">
        {/* Top Tagline */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            GENUINOS UY • COLECCIÓN AUTÉNTICA 2026
          </span>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
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

        {/* Hero Central Content */}
        <div className="space-y-4 max-w-2xl text-left">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {current.name}
          </h1>

          <p className="text-sm sm:text-base text-gray-200 font-medium max-w-lg leading-relaxed">
            {current.brand} • Calzado 100% auténtico importado en Uruguay. Stock inmediato en todas las tallas.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${current.price.toLocaleString('es-UY')} <span className="text-xs font-semibold text-gray-300">UYU</span>
            </span>

            <button
              onClick={() => setQuickViewProduct(current)}
              className="bg-white text-[#1b3b2b] px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            >
              <span>Ver talle y comprar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Interactive Sneaker Selector Pills */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex-shrink-0 hidden sm:inline">
              Modelos Destacados:
            </span>
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  activeSlide === idx
                    ? 'bg-emerald-400 text-black font-extrabold shadow-lg scale-105'
                    : 'bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/10'
                }`}
              >
                {slide.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveTab('catalog');
              const grid = document.getElementById('catalog-grid');
              grid?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-wider cursor-pointer flex-shrink-0"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prev / Next Slider Arrows */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer z-30"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer z-30"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};
