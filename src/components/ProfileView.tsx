import React from 'react';
import { User, Package, MapPin, Phone, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProfileView: React.FC = () => {
  const { customerInfo, setCustomerInfo } = useCart();

  const mockOrders = [
    {
      id: 'GEN-84920',
      date: '15 de Julio, 2026',
      status: 'Entregado',
      items: 'Adidas Campus 80s (Talle 41)',
      total: '$ 2.990 UYU',
    },
    {
      id: 'GEN-73911',
      date: '02 de Junio, 2026',
      status: 'Entregado',
      items: 'Nike Air Force 1 (Talle 42)',
      total: '$ 2.390 UYU',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center text-2xl font-black font-serif-brand shadow-lg">
          {customerInfo.name ? customerInfo.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-extrabold text-gray-900 font-serif-brand">
            {customerInfo.name || 'Cliente GENUINOS'}
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            {customerInfo.city ? `Ubicación: ${customerInfo.city}, Uruguay` : 'Cliente Registrado • Uruguay'}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-3">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-[#1b3b2b] border border-emerald-200">
              ✓ Cuenta Verificada
            </span>
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              2 Pedidos Realizados
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info Edit Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 font-serif-brand flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#1b3b2b]" />
          Datos Predefinidos de Envío
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              placeholder="Ej: Martín Rodríguez"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Departamento / Ciudad</label>
            <input
              type="text"
              value={customerInfo.city}
              onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
              placeholder="Ej: Montevideo"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-700 mb-1">Dirección Habitual de Entrega</label>
            <input
              type="text"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              placeholder="Ej: Av. 18 de Julio 1234, Apto 402"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#1b3b2b]"
            />
          </div>
        </div>
      </div>

      {/* Mis Pedidos Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 font-serif-brand flex items-center gap-2">
          <Package className="w-5 h-5 text-[#1b3b2b]" />
          Historial de Pedidos Recientes
        </h3>

        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-900">{order.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 font-medium mt-1">{order.items}</p>
                <p className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {order.date}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-sm font-black text-[#1b3b2b] block">{order.total}</span>
                <span className="text-[10px] text-gray-400">Pago confirmado</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Direct Contact */}
      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#1b3b2b] flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Soporte y Consultas de Pedidos</h4>
            <p className="text-gray-600 font-medium">Atención inmediata vía WhatsApp +598 91 722 213.</p>
          </div>
        </div>
        <a
          href="https://wa.me/59891722213"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Contactar Asesor
        </a>
      </div>
    </div>
  );
};
