import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, AlertCircle, Plus, Minus, Check, MessageCircle, Ruler, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { createWhatsAppOrderUrl } from '../utils/whatsapp';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartOpen } = useCart();
  const { setShowSizeGuide, showToast } = useCatalog();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<boolean>(false);

  useEffect(() => {
    if (quickViewProduct) {
      const initialImg =
        quickViewProduct.images && quickViewProduct.images.length > 0
          ? quickViewProduct.images[0]
          : '/logo_genuinos.webp';
      setSelectedImage(initialImg);
      setSelectedSize(null);
      setQuantity(1);
      setSizeError(false);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(quickViewProduct, selectedSize, quantity);
    showToast(`Sumado a la Bolsa (Talle ${selectedSize}) 🛍️`);
    setQuickViewProduct(null);
    setIsCartOpen(true);
  };

  const handleDirectWhatsAppBuy = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    const singleItemCart = [
      {
        id: `${quickViewProduct.id}-${selectedSize}`,
        product: quickViewProduct,
        selectedSize,
        quantity,
      },
    ];
    const url = createWhatsAppOrderUrl(singleItemCart, { name: '', address: '', notes: '' });
    window.open(url, '_blank');
  };

  const images = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : ['/logo_genuinos.webp'];

  const sizes = quickViewProduct.sizes && quickViewProduct.sizes.length > 0
    ? quickViewProduct.sizes
    : [36, 37, 38, 39, 40, 41, 42, 43, 44];

  const cuotaAmount = Math.round(quickViewProduct.price / 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col justify-between items-center gap-4 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-2">
            <img
              src={selectedImage}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-center rounded-xl"
              onError={() => setSelectedImage('/logo_genuinos.webp')}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full pb-1 no-scrollbar justify-start sm:justify-center">
              {images.map((img, idx) => {
                const isSelected = selectedImage === img;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1b3b2b] ring-2 ring-[#1b3b2b]/20 scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${quickViewProduct.name} vista ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Sticky Actions */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto bg-white">
          <div>
            {/* Brand & Stock Badges */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#1b3b2b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {quickViewProduct.brand}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Stock Inmediato
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-serif-brand">{quickViewProduct.name}</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{quickViewProduct.category} • {quickViewProduct.gender}</p>

            {/* Price & Installments */}
            <div className="mt-4 pb-4 border-b border-gray-100">
              <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider block">
                Hasta 6 cuotas sin recargo de ${cuotaAmount.toLocaleString('es-UY')} UYU
              </span>
              <span className="text-3xl font-black text-[#1b3b2b]">
                ${quickViewProduct.price.toLocaleString('es-UY')} <span className="text-sm font-semibold text-gray-500">UYU</span>
              </span>
            </div>

            {/* Size Selector Grid & Size Guide Trigger */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Elegí tu talle (EU)
                </label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[#1b3b2b] font-bold underline hover:opacity-80 flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Guía de talles
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1b3b2b] text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Seleccioná un talle antes de continuar</span>
                </div>
              )}
            </div>

            {/* Delivery & Assurance Info */}
            <div className="mt-6 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Truck className="w-4 h-4 text-[#1b3b2b]" />
                <span>Retirá o recibí donde estés en Uruguay</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-4 h-4 text-[#1b3b2b]" />
                <span>Garantía de autenticidad 100% oficial GENUINOS</span>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Cantidad</span>
              <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-black text-gray-900 px-2 min-w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full btn-forest py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              Sumar al Carrito
            </button>

            <button
              onClick={handleDirectWhatsAppBuy}
              className="w-full btn-whatsapp py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Comprar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
