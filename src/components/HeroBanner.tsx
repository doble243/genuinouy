import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';

export const HeroBanner: React.FC = () => {
  const { products } = useCatalog();
  const { setQuickViewProduct } = useCart();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const featuredProducts = products.filter(
    (p) => p.name.includes('Campus') || p.name.includes('Air') || p.name.includes('Samba')
  ).slice(0, 3);

  const slides = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[activeIndex];
  if (!currentSlide) return null;

  const primaryImg = currentSlide.images?.[0] || '/logo_genuinos.webp';

  return (
    <section className="relative w-full h-[72vh] sm:h-[80vh] bg-[#050608] overflow-hidden">
      {/* Editorial Background Image */}
      <div className="absolute inset-0">
        <img
          src={primaryImg}
          alt={currentSlide.name}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0e] via-[#0a0c0e]/30 to-transparent" />
      </div>

      {/* Carousel Dots / Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              activeIndex === idx ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Hero Bottom Details & CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 flex flex-col items-start space-y-3 max-w-7xl mx-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
          DESTACADO • {currentSlide.brand}
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif-brand leading-none">
          {currentSlide.name}
        </h1>

        <div className="flex items-center gap-4 pt-1">
          <span className="text-xl sm:text-2xl font-black text-white">
            ${currentSlide.price.toLocaleString('es-UY')} <span className="text-xs font-normal text-gray-400">UYU</span>
          </span>

          <button
            onClick={() => setQuickViewProduct(currentSlide)}
            className="btn-dark-primary px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl cursor-pointer"
          >
            <span>Ver modelos</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Prev / Next Controls */}
      <button
        onClick={() => setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md border border-white/10 hidden sm:flex cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
};
