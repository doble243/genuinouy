import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC = ({ product }) => {
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
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col group hover:shadow-lg hover:border-stone-300 transition-all duration-200 cursor-pointer relative"
    >
      {/* Heart Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-sm ${
          favorited
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white border border-stone-200'
        }`}
        title={favorited ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
      </button>

      {/* Sneaker Photography Container */}
      <div className="relative aspect-square w-full bg-stone-100 p-2 flex items-center justify-center overflow-hidden">
        <img
          src={currentImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
          loading="lazy"
        />

        {/* Brand Badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="bg-white/95 text-[#1b3b2b] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs border border-stone-200">
            {product.brand}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="bg-white text-[#1b3b2b] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Vista Rápida
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">
            {product.category || product.brand}
          </span>
          <h3 className="text-base font-extrabold text-stone-900 group-hover:text-[#1b3b2b] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Talles {product.sizes[0]} al {product.sizes[product.sizes.length - 1]}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Precio</span>
            <span className="text-lg font-black text-[#1b3b2b]">
              ${product.price.toLocaleString('es-UY')} <span className="text-xs font-semibold text-stone-500">UYU</span>
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="bg-[#1b3b2b] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 hover:bg-[#12271c]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Talles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
