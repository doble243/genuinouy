import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
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
    <section className="relative w-full min-h-[70vh] sm:min-h-[75vh] bg-[#0c1611] overflow-hidden flex flex-col justify-between">
      {/* Background Photography with High Contrast Gradient */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1611] via-[#0c1611]/70 to-black/40" />
      </div>

      {/* Hero Header Pill & Navigation Dots */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 sm:pt-8 z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400">
            GENUINOS UY • 100% AUTÉNTICOS
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
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

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 space-y-3 text-left">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
            {current.brand} • STOCK EN URUGUAY
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {current.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 font-medium max-w-lg leading-relaxed">
            Calzado original con garantía de autenticidad. Envíos express a todo el país o retiro inmediato.
          </p>

          <div className="flex items-center gap-4 pt-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Precio Contado</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                ${current.price.toLocaleString('es-UY')} <span className="text-xs font-semibold text-gray-300">UYU</span>
              </span>
            </div>

            <button
              onClick={() => setQuickViewProduct(current)}
              className="bg-emerald-400 text-black px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-emerald-300 active:scale-95 transition-all cursor-pointer"
            >
              <span>Ver Talle y Comprar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Sneaker Selector Pills */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 z-10">
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex-shrink-0 hidden sm:inline">
              Novedades:
            </span>
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(idx)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                  activeSlide === idx
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-black/50 backdrop-blur-md text-white/80 hover:text-white border border-white/10'
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
            <span>Ver Todo el Catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prev / Next Slider Arrows */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer z-30"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer z-30"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};
