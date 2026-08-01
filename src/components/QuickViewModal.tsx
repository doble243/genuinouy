import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Ruler, Truck, ShieldCheck, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { createWhatsAppOrderUrl } from '../utils/whatsapp';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartOpen } = useCart();
  const { products, setShowSizeGuide, showToast } = useCatalog();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState<boolean>(false);

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
    }
  }, [quickViewProduct]);

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
      className="fixed inset-0 z-50 bg-[#050608]/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto animate-fadeIn"
      onClick={() => setQuickViewProduct(null)}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0a0c0e]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/10">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
          {quickViewProduct.brand}
        </span>
        <button
          onClick={() => setQuickViewProduct(null)}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Container */}
      <div
        className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8 pb-32"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Product Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full bg-[#121518] rounded-3xl overflow-hidden flex items-center justify-center p-4 border border-white/10 shadow-2xl">
            <img
              src={selectedImage}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-center rounded-2xl"
              onError={() => setSelectedImage('/logo_genuinos.webp')}
            />
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === img ? 'border-emerald-400 scale-105' : 'border-white/10 opacity-60'
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

        {/* Product Details Header */}
        <div className="space-y-2 text-left">
          <h1 className="text-3xl font-black text-white tracking-tight font-serif-brand">
            {quickViewProduct.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">
              ${quickViewProduct.price.toLocaleString('es-UY')} <span className="text-xs text-gray-400 font-normal">UYU</span>
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              6 cuotas de ${cuotaAmount.toLocaleString('es-UY')}
            </span>
          </div>
        </div>

        {/* Visual Size Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">
              Elegí tu talle (EU)
            </span>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-xs text-emerald-400 font-bold underline flex items-center gap-1 cursor-pointer"
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
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-[#14171c] text-gray-200 hover:bg-[#1f242b] border border-white/10'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {sizeError && (
            <p className="text-xs font-bold text-red-400 pt-1">
              * Por favor elegí un talle antes de agregar al carrito
            </p>
          )}
        </div>

        {/* Accordions */}
        <div className="border-t border-b border-white/10 divide-y divide-white/10 text-xs">
          {/* Details Accordion */}
          <div>
            <button
              onClick={() => setOpenSection(openSection === 'details' ? null : 'details')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-gray-200 cursor-pointer"
            >
              <span>Detalles del modelo</span>
              {openSection === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSection === 'details' && (
              <div className="pb-4 text-gray-400 leading-relaxed">
                {quickViewProduct.description}
                <p className="mt-2 text-white font-semibold">SKU: {quickViewProduct.sku || 'GEN-001'}</p>
              </div>
            )}
          </div>

          {/* Shipping Accordion */}
          <div>
            <button
              onClick={() => setOpenSection(openSection === 'shipping' ? null : 'shipping')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-gray-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Envíos y entregas en Uruguay
              </span>
              {openSection === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSection === 'shipping' && (
              <div className="pb-4 text-gray-400 space-y-1.5">
                <p>• Montevideo: Entregas en 24 a 48 hs.</p>
                <p>• Interior del país: Envíos por DAC o Mirtrans a domicilio o agencia.</p>
                <p>• Retiro sin costo en zonas coordinadas de Montevideo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
              Modelos relacionados
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => setQuickViewProduct(rel)}
                  className="aspect-square bg-[#121518] rounded-xl overflow-hidden p-2 border border-white/5 cursor-pointer hover:border-white/20 transition-all"
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

      {/* Sticky Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c0e]/95 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className="btn-dark-primary py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span>Agregar</span>
          </button>

          <button
            onClick={handleDirectWhatsAppBuy}
            className="btn-whatsapp-dark py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
