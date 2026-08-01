import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';

export const HeroBanner: React.FC = () => {
  const { setActiveTab, products } = useCatalog();
  const { setQuickViewProduct } = useCart();

  const featuredProduct = products.find((p) => p.name.includes('Campus')) || products[0];
  const featuredImg = featuredProduct?.images?.[0] || '/fotos_productos/Adidas_Campus_1.jpg';

  return (
    <section className="bg-[#47624d] text-white py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Text Content */}
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
            <span aria-hidden>»»───────────&rarr;</span> Uruguay
          </p>

          <h1 className="font-serif-brand text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
            GENUINOS<sup className="ml-1 text-2xl font-sans text-amber-300">UY</sup>
          </h1>

          <p className="font-serif-brand text-2xl sm:text-3xl italic text-white/90">
            Elegí tu estilo
          </p>

          <p className="text-sm sm:text-base text-white/80 max-w-md font-normal leading-relaxed">
            Calzado genuino para caminar tu ciudad con personalidad. Zapatillas, botas y calzado urbano seleccionado con amor en Uruguay.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab('catalog');
                const grid = document.getElementById('catalog-grid');
                grid?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-amber px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/59891722213"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full border border-white/40 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Sneaker Card */}
        <div className="relative">
          <div
            onClick={() => featuredProduct && setQuickViewProduct(featuredProduct)}
            className="overflow-hidden rounded-3xl shadow-2xl bg-[#35493a] border border-white/20 aspect-[4/3] sm:aspect-square relative group cursor-pointer"
          >
            <img
              src={featuredImg}
              alt="Destacado GENUINOS UY"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-200 text-stone-900 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#35493a]">
                  Temporada 2026
                </p>
                <p className="font-serif-brand text-base font-bold text-stone-900 line-clamp-1">
                  {featuredProduct?.name || 'Adidas Campus 80s'}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-400 text-[#35493a] font-extrabold text-xs rounded-full shadow-sm flex-shrink-0">
                Hasta 20% OFF 🔥
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
