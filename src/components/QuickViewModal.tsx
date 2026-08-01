import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Ruler, Truck, ShoppingBag, MessageCircle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { createWhatsAppOrderUrl } from '../utils/whatsapp';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartOpen } = useCart();
  const { products, setShowSizeGuide, showToast } = useCatalog();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Accordion states
  const [openSection, setOpenSection] = useState<'details' | 'shipping' | null>(null);

  useEffect(() => {
    if (quickViewProduct) {
      const initialImg =
        quickViewProduct.images && quickViewProduct.images.length > 0
          ? quickViewProduct.images[0]
          : '/logo_genuinos.webp';
      setSelectedImage(initialImg);
      setSelectedSize(null);
      setSizeError(false);
      setOpenSection(null);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(quickViewProduct, selectedSize, 1);
    showToast(`Sumado a la bolsa (Talle ${selectedSize}) 🛍️`);
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
        quantity: 1,
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

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== quickViewProduct.id && (p.brand === quickViewProduct.brand || p.gender === quickViewProduct.gender))
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative w-full max-w-2xl bg-white text-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#47624d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {quickViewProduct.brand}
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Stock disponible
            </span>
          </div>
          <button
            onClick={() => setQuickViewProduct(null)}
            className="p-2 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div ref={scrollContainerRef} className="overflow-y-auto p-6 space-y-6 pb-28">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-stone-200">
              <img
                src={selectedImage}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover object-center rounded-xl"
                onError={() => setSelectedImage('/logo_genuinos.webp')}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                      selectedImage === img ? 'border-[#47624d] ring-2 ring-[#47624d]/20 scale-105' : 'border-stone-200 opacity-70'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${quickViewProduct.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif-brand">
              {quickViewProduct.name}
            </h2>
            <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
              {quickViewProduct.category} • {quickViewProduct.gender}
            </p>

            <div className="pt-3 pb-3 border-b border-stone-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Precio Contado</span>
                <span className="text-3xl font-black text-[#47624d]">
                  ${quickViewProduct.price.toLocaleString('es-UY')} <span className="text-xs text-stone-500 font-normal">UYU</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  6x de ${cuotaAmount.toLocaleString('es-UY')} UYU
                </span>
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                Elegí tu talle (EU)
              </span>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-[#47624d] font-bold underline flex items-center gap-1 cursor-pointer"
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
                    className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#47624d] text-white shadow-md scale-105'
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {sizeError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                * Por favor seleccioná un talle para continuar
              </p>
            )}
          </div>

          {/* Accordions */}
          <div className="border-t border-b border-stone-200 divide-y divide-stone-100 text-xs">
            {/* Details */}
            <div>
              <button
                onClick={() => setOpenSection(openSection === 'details' ? null : 'details')}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-stone-800 cursor-pointer"
              >
                <span>Detalles y descripción del modelo</span>
                {openSection === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'details' && (
                <div className="pb-3 text-stone-600 leading-relaxed">
                  {quickViewProduct.description}
                  <p className="mt-2 text-stone-900 font-bold">SKU: {quickViewProduct.sku || 'GEN-001'}</p>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div>
              <button
                onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-stone-800 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#47624d]" />
                  Envíos a todo Uruguay
                </span>
                {openSection === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'shipping' && (
                <div className="pb-3 text-stone-600 space-y-1">
                  <p>• Montevideo: Envíos en 24 a 48 hs.</p>
                  <p>• Interior del país: Envíos por DAC o Mirtrans.</p>
                  <p>• Retiro gratis en local o zonas coordinadas.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-stone-400">
                Modelos sugeridos
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(rel);
                    }}
                    className="aspect-square bg-stone-100 rounded-xl overflow-hidden p-2 border border-stone-200 cursor-pointer hover:border-[#47624d] transition-all hover:scale-105 active:scale-95"
                  >
                    <img
                      src={rel.images?.[0] || '/logo_genuinos.webp'}
                      alt={rel.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ALWAYS VISIBLE Sticky Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 p-4 shadow-2xl flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-brand py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sumar al Carrito</span>
          </button>

          <button
            onClick={handleDirectWhatsAppBuy}
            className="flex-1 btn-whatsapp py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comprar por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
