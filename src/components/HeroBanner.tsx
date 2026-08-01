import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <section className="bg-[#47624d] text-white py-10 sm:py-16 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Brand Statement & Quick Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#35493a] border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
              Colección 2026 • Uruguay
            </span>
          </div>

          <h1 className="font-serif-brand text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
            GENUINOS<sup className="ml-1 text-2xl font-sans text-amber-300">UY</sup>
          </h1>

          <p className="font-serif-brand text-2xl sm:text-3xl italic text-white/90">
            Elegí tu estilo
          </p>

          <p className="text-sm sm:text-base text-white/80 max-w-lg font-normal leading-relaxed">
            Championes 100% auténticos importados. Selección exclusiva de Adidas, Nike, Jordan, Puma, Vans y New Balance con envíos a todo Uruguay.
          </p>

          {/* Featured Models Quick Switch Pills */}
          <div className="pt-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-2">
              Modelos Destacados en Tendencia:
            </p>
            <div className="flex flex-wrap gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeSlide === idx
                      ? 'bg-amber-400 text-[#35493a] font-extrabold shadow-md scale-105'
                      : 'bg-[#35493a]/80 text-white/80 hover:text-white border border-white/20'
                  }`}
                >
                  {slide.name.split(' ')[0]} {slide.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab('catalog');
                const grid = document.getElementById('catalog-grid');
                grid?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-amber px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/59891722213"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full border border-white/40 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp +598 91 722 213</span>
            </a>
          </div>
        </div>

        {/* Right Column: High Impact Featured Sneaker Showcase Card */}
        <div className="lg:col-span-5">
          <div className="relative group">
            <div
              onClick={() => setQuickViewProduct(current)}
              className="overflow-hidden rounded-3xl shadow-2xl bg-[#35493a] border-2 border-white/20 aspect-square relative cursor-pointer"
            >
              <img
                key={current.id}
                src={currentImg}
                alt={current.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Prev / Next Slider Controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all z-20"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 border border-white/20 transition-all z-20"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Overlay Details Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-stone-200 text-stone-900 flex items-center justify-between z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#35493a]">
                    {current.brand} • STOCK INMEDIATO
                  </p>
                  <p className="font-serif-brand text-base font-bold text-stone-900 line-clamp-1">
                    {current.name}
                  </p>
                  <p className="text-xs font-black text-[#47624d]">
                    ${current.price.toLocaleString('es-UY')} UYU
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-amber-400 text-[#35493a] font-black text-xs rounded-full shadow-sm flex-shrink-0">
                  Talles {current.sizes[0]}-{current.sizes[current.sizes.length - 1]}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
