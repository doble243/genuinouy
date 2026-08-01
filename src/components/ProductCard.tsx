import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
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

  const hasOffer = product.price <= 2400;

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      onMouseEnter={() => setCurrentImg(secondaryImg)}
      onMouseLeave={() => setCurrentImg(primaryImg)}
      className="group overflow-hidden rounded-2xl border border-[#47624d]/15 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between relative"
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
            : 'bg-white/90 text-stone-400 hover:text-red-500 hover:bg-white border border-stone-200'
        }`}
        title={favorited ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
      </button>

      {/* Sneaker Photo Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-100 p-2 flex items-center justify-center">
        <img
          src={currentImg}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105 rounded-xl"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />

        {/* Badges from estilo_de_referencia */}
        {hasOffer ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black text-[#35493a] shadow-sm">
            OFERTA 🔥
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-[#47624d] px-3 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-sm">
            {product.brand}
          </span>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="bg-white text-[#35493a] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Vista Rápida
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#47624d]/80">
            {product.category || product.brand}
          </p>
          <h3 className="mt-1 font-serif-brand text-lg font-bold text-stone-900 line-clamp-1 group-hover:text-[#47624d] transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-[#47624d]">
              ${product.price.toLocaleString('es-UY')} <span className="text-xs font-semibold text-stone-500">UYU</span>
            </span>
            <p className="text-[11px] text-stone-500 font-medium">
              Talles {product.sizes[0]} al {product.sizes[product.sizes.length - 1]}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="btn-brand p-2.5 rounded-xl text-xs font-bold flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
            title="Seleccionar talle"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
