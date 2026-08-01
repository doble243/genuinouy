import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
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
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide];
  if (!current) return null;

  const currentImg = current.images?.[0] || '/fotos_productos/Adidas_Campus_1.jpg';

  return (
    <section className="bg-[#102419] text-white relative overflow-hidden py-10 sm:py-16 border-b border-emerald-900/40">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Bold Brand Showcase */}
          <div className="lg:col-span-7 space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b3b2b] border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                GENUINOS UY • SNEAKER STORE
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                {current.name}
              </h1>
              <p className="text-base sm:text-xl text-emerald-200 font-bold uppercase tracking-wider">
                {current.brand} • Talles {current.sizes[0]} al {current.sizes[current.sizes.length - 1]}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed font-normal">
              Edición 100% auténtica disponible con stock inmediato en Uruguay. Envíos exprés a todo el país o retiro sin costo.
            </p>

            <div className="pt-2 flex items-center gap-5">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Precio UYU</span>
                <span className="text-3xl font-black text-white tracking-tight">
                  ${current.price.toLocaleString('es-UY')}
                </span>
              </div>

              <button
                onClick={() => setQuickViewProduct(current)}
                className="bg-white text-[#102419] hover:bg-emerald-100 px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-all cursor-pointer"
              >
                <span>Ver talle y comprar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Model Selector Buttons */}
            <div className="pt-4 border-t border-emerald-900/50">
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest block mb-2">
                Explorar Tendencias:
              </span>
              <div className="flex flex-wrap gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                      activeSlide === idx
                        ? 'bg-emerald-400 text-[#102419] shadow-lg scale-105'
                        : 'bg-[#1b3b2b] text-white/80 hover:text-white border border-emerald-800/60'
                    }`}
                  >
                    {slide.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Sneaker Visual Display */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={() => setQuickViewProduct(current)}
              className="relative aspect-square w-full bg-[#08120d] rounded-3xl overflow-hidden border-2 border-emerald-700/40 p-4 shadow-2xl group cursor-pointer"
            >
              <img
                key={current.id}
                src={currentImg}
                alt={current.name}
                className="w-full h-full object-cover object-center rounded-2xl transform group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              {/* Prev / Next Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-emerald-600 transition-all border border-white/20 z-20 cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-emerald-600 transition-all border border-white/20 z-20 cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Bottom Card Info */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                    {current.brand} ORIGINAL
                  </span>
                  <h3 className="text-lg font-black text-white line-clamp-1">{current.name}</h3>
                </div>
                <span className="px-3 py-1 bg-white text-[#102419] text-xs font-black rounded-full shadow-md">
                  ${current.price.toLocaleString('es-UY')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
