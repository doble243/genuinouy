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
      className="group cursor-pointer flex flex-col space-y-2 relative transition-all duration-300 active:scale-[0.98]"
    >
      {/* Heart Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
          favorited
            ? 'bg-red-500 text-white'
            : 'bg-black/30 text-white/70 hover:text-white border border-white/10'
        }`}
        title={favorited ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
      >
        <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
      </button>

      {/* Sneaker Photography Container */}
      <div className="relative aspect-square w-full bg-[#121518] rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-white/5 group-hover:border-white/20 transition-colors">
        <img
          src={currentImg}
          alt={product.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
          loading="lazy"
        />
      </div>

      {/* Minimal Card Details */}
      <div className="px-1 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            {product.brand}
          </span>
          <span className="text-[9px] font-semibold text-gray-500">
            Talles {product.sizes[0]}-{product.sizes[product.sizes.length - 1]}
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm font-black text-white">
            ${product.price.toLocaleString('es-UY')} <span className="text-[10px] text-gray-400 font-medium">UYU</span>
          </span>
        </div>
      </div>
    </div>
  );
};
