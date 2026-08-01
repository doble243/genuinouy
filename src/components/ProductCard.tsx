import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setQuickViewProduct } = useCart();
  const { isFavorite, toggleFavorite } = useCatalog();

  const primaryImg = product.images?.[0] || '/logo_genuinos.webp';
  const secondaryImg = (product.images && product.images.length > 1) ? product.images[1] : primaryImg;

  const [currentImg, setCurrentImg] = useState<string>(primaryImg);
  const favorited = isFavorite(product.id);

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      onMouseEnter={() => setCurrentImg(secondaryImg)}
      onMouseLeave={() => setCurrentImg(primaryImg)}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col group hover:border-stone-400 transition-all duration-200 cursor-pointer relative"
    >
      {/* Subtle Wishlist Heart Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className={`absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full backdrop-blur-sm transition-all active:scale-90 cursor-pointer ${
          favorited
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white border border-stone-200'
        }`}
        title={favorited ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
      >
        <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
      </button>

      {/* Neutral Background Product Photo */}
      <div className="relative aspect-square w-full bg-stone-100 p-2 flex items-center justify-center overflow-hidden">
        <img
          src={currentImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
          loading="lazy"
        />

        {/* Small Brand Badge */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          <span className="bg-white/95 text-[#1b3b2b] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-stone-200">
            {product.brand}
          </span>
        </div>
      </div>

      {/* Clean Minimal Info */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
            {product.category || product.brand}
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-[#1b3b2b] transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <span className="text-sm sm:text-base font-black text-[#1b3b2b]">
            ${product.price.toLocaleString('es-UY')} <span className="text-[10px] font-semibold text-stone-400">UYU</span>
          </span>

          <span className="text-[10px] font-bold text-stone-500 uppercase group-hover:text-[#1b3b2b]">
            Ver talle →
          </span>
        </div>
      </div>
    </div>
  );
};
