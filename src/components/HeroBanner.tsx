import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
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
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];
  if (!current) return null;

  const currentImg = current.images?.[0] || '/fotos_productos/Adidas_Campus_1.jpg';

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] bg-black overflow-hidden flex flex-col justify-between">
      {/* 100% Full Bleed Background Photography */}
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
        {/* Subtle Gradient Overlay for High Contrast Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
      </div>

      {/* Top Header Tag & Carousel Dots */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest text-white">
            GENUINOS UY • ELEGÍ TU ESTILO
          </span>
        </div>

        {/* Carousel Slider Dots */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-7 bg-emerald-400' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero Bottom Product Info & CTA Floating Over Full-Screen Image */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 z-10 space-y-6">
        
        {/* Sneaker Title & Pricing */}
        <div className="space-y-2 text-left max-w-2xl">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-400 bg-black/50 px-3 py-1 rounded-md backdrop-blur-sm border border-emerald-500/30">
            {current.brand} • STOCK INMEDIATO EN URUGUAY
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {current.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Precio Final UYU</span>
              <span className="text-3xl sm:text-4xl font-black text-white">
                ${current.price.toLocaleString('es-UY')}
              </span>
            </div>

            <button
              onClick={() => setQuickViewProduct(current)}
              className="bg-emerald-400 hover:bg-emerald-300 text-black px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow-2xl active:scale-95 transition-all cursor-pointer"
            >
              <span>Ver talle y comprar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Model Selector Buttons Floating at Bottom */}
        <div className="pt-4 border-t border-white/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-widest flex-shrink-0 hidden sm:inline">
              Modelos en Pantalla:
            </span>
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                  activeSlide === idx
                    ? 'bg-white text-black shadow-2xl scale-105'
                    : 'bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/20'
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
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-wider cursor-pointer flex-shrink-0 bg-black/60 px-4 py-2 rounded-full border border-white/20"
          >
            <span>Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prev / Next Carousel Controls */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 text-white hover:bg-emerald-500 backdrop-blur-md border border-white/20 hidden sm:flex cursor-pointer z-30 transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/60 text-white hover:bg-emerald-500 backdrop-blur-md border border-white/20 hidden sm:flex cursor-pointer z-30 transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};
