import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { sendWhatsAppOrder } from '../utils/whatsapp';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    customerInfo,
    setCustomerInfo,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
  } = useCart();

  const [formError, setFormError] = useState<string>('');

  if (!isCartOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name.trim()) {
      setFormError('Ingresá tu nombre completo');
      return;
    }
    if (!customerInfo.address.trim()) {
      setFormError('Ingresá tu dirección de entrega');
      return;
    }

    setFormError('');
    sendWhatsAppOrder(cartItems, customerInfo, cartTotal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0c0e] text-white flex flex-col shadow-2xl border-l border-white/10">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#121518]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white tracking-tight">Tu Carrito</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto" />
                <p className="text-lg text-white font-bold font-serif-brand">Tu carrito está vacío</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Explorá nuestro catálogo e incorporá tus championes favoritos.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-dark-primary px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-block mt-4 cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Product List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modelos Seleccionados</span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-gray-400 hover:text-red-400 font-bold uppercase transition-colors cursor-pointer"
                    >
                      Vaciar
                    </button>
                  </div>

                  {cartItems.map((item) => {
                    const subtotal = item.product.price * item.quantity;
                    const itemImg = item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/logo_genuinos.webp';
                    return (
                      <div
                        key={item.cartItemId}
                        className="flex gap-4 p-3.5 rounded-2xl bg-[#121518] border border-white/10 relative group"
                      >
                        <img
                          src={itemImg}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl bg-[#181b20] flex-shrink-0 border border-white/5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                          }}
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-extrabold text-white line-clamp-1">{item.product.name}</h4>
                              <button
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="text-gray-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-emerald-400 font-bold mt-1">
                              Talle EU: <span className="bg-[#1f242b] px-2 py-0.5 rounded text-white">{item.selectedSize}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black text-white">
                              ${subtotal.toLocaleString('es-UY')} <span className="text-[10px] text-gray-400 font-normal">UYU</span>
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-[#1f242b] border border-white/10 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-1 text-gray-400 hover:text-white cursor-pointer"
                                aria-label="Reducir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-white min-w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1 text-gray-400 hover:text-white cursor-pointer"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Customer Checkout Form */}
                <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Datos de Envío</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Nombre Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => {
                        setCustomerInfo({ ...customerInfo, name: e.target.value });
                        if (formError) setFormError('');
                      }}
                      placeholder="Ej: Martín Rodríguez"
                      className="w-full bg-[#121518] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Dirección <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.address}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, address: e.target.value });
                          if (formError) setFormError('');
                        }}
                        placeholder="Ej: Av. 18 de Julio 1234"
                        className="w-full bg-[#121518] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Depto / Ciudad <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.city}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, city: e.target.value });
                          if (formError) setFormError('');
                        }}
                        placeholder="Ej: Montevideo"
                        className="w-full bg-[#121518] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-medium"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 flex items-center gap-2 text-red-400 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Summary & Action */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                      <span className="uppercase tracking-wider">Total</span>
                      <span className="text-2xl font-black text-white">
                        ${cartTotal.toLocaleString('es-UY')} UYU
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-whatsapp-dark py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-white" />
                      Confirmar Pedido vía WhatsApp
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
