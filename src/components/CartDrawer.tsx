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
      setFormError('Por favor ingresa tu Nombre Completo');
      return;
    }
    if (!customerInfo.address.trim()) {
      setFormError('Por favor ingresa tu Dirección de Entrega');
      return;
    }
    if (!customerInfo.city.trim()) {
      setFormError('Por favor ingresa tu Ciudad o Departamento');
      return;
    }

    setFormError('');
    sendWhatsAppOrder(cartItems, customerInfo, cartTotal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-gray-900 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#1b3b2b]" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Tu Bolsa de Compras</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Cerrar bolsa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
                <p className="text-lg text-gray-800 font-bold">Tu Bolsa está Vacía</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Selecciona tus zapatillas y realiza tu pedido directo por WhatsApp.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-forest px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-block mt-4 cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Product List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modelos Seleccionados</span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-gray-400 hover:text-red-600 font-bold uppercase transition-colors cursor-pointer"
                    >
                      Vaciar Bolsa
                    </button>
                  </div>

                  {cartItems.map((item) => {
                    const subtotal = item.product.price * item.quantity;
                    const itemImg = item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/logo_genuinos.webp';
                    return (
                      <div
                        key={item.cartItemId}
                        className="flex gap-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 relative group"
                      >
                        <img
                          src={itemImg}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl bg-white flex-shrink-0 border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
                          }}
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-extrabold text-gray-900 line-clamp-1">{item.product.name}</h4>
                              <button
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-[#1b3b2b] font-bold mt-1">
                              Talle EU: <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900">{item.selectedSize}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black text-[#1b3b2b]">
                              ${subtotal.toLocaleString('es-UY')} <span className="text-[10px] text-gray-500 font-normal">UYU</span>
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                                aria-label="Reducir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 min-w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
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
                <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-[#1b3b2b] text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Datos de Envío (WhatsApp)</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Nombre Completo <span className="text-red-500">*</span>
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                        Dirección <span className="text-red-500">*</span>
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                        Depto / Ciudad <span className="text-red-500">*</span>
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Notas de Entrega <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={customerInfo.notes || ''}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      placeholder="Ej: Horario de preferencia..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#1b3b2b] font-medium"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Summary & Action */}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                      <span className="uppercase tracking-wider">Total del Pedido</span>
                      <span className="text-2xl font-black text-[#1b3b2b]">
                        ${cartTotal.toLocaleString('es-UY')} UYU
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-whatsapp py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-white" />
                      Enviar Pedido por WhatsApp
                    </button>
                    <p className="text-[10px] text-gray-500 text-center font-medium">
                      Atención inmediata por WhatsApp (+598 91 722 213) para coordinar pago y despacho.
                    </p>
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
