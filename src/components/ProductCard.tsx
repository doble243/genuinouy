import React, { useState } from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
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

  const cuotaAmount = Math.round(product.price / 6);

  return (
    <div
      onMouseEnter={() => setCurrentImg(secondaryImg)}
      onMouseLeave={() => setCurrentImg(primaryImg)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col group hover:shadow-xl hover:border-gray-300 transition-all duration-200 relative"
    >
      {/* Favorite Floating Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-md ${
          favorited
            ? 'bg-red-500 text-white'
            : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white border border-gray-200'
        }`}
        title={favorited ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
      </button>

      {/* Sneaker Photo Container */}
      <div
        className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer flex items-center justify-center p-2"
        onClick={() => setQuickViewProduct(product)}
      >
        <img
          src={currentImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
          loading="lazy"
        />

        {/* Brand Tag Pill */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="bg-white/95 text-[#1b3b2b] text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm border border-gray-200">
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
            className="bg-white text-[#1b3b2b] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Vista Rápida
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
            {product.category || product.brand}
          </span>
          <h3
            onClick={() => setQuickViewProduct(product)}
            className="text-base font-extrabold text-gray-900 group-hover:text-[#1b3b2b] transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Sizes Preview Pills */}
          <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-bold text-gray-400 uppercase">Talles:</span>
            {product.sizes.slice(0, 5).map((sz) => (
              <span key={sz} className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                {sz}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[9px] text-gray-400 font-bold">+</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">
              6 cuotas de ${cuotaAmount.toLocaleString('es-UY')}
            </span>
            <span className="text-lg font-black text-[#1b3b2b]">
              ${product.price.toLocaleString('es-UY')} <span className="text-xs font-semibold text-gray-500">UYU</span>
            </span>
          </div>

          <button
            onClick={() => setQuickViewProduct(product)}
            className="btn-forest px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sumar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
