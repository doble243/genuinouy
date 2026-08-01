import React from 'react';
import { ShieldCheck, Truck, Phone, MapPin, MessageCircle, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <img
              src="/logo_genuinos.webp"
              alt="Genuinos UY Logo"
              className="h-10 sm:h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
              }}
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              Tienda especialista en calzado urbano y deportivo 100% auténtico en Uruguay. Ediciones originales con envíos garantizados.
            </p>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Garantías Genuinos UY</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#1b3b2b]" />
                <span>100% Calzado Auténtico</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Truck className="w-4 h-4 text-[#1b3b2b]" />
                <span>Envíos Rápidos a Todo Uruguay</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <MessageCircle className="w-4 h-4 text-[#1b3b2b]" />
                <span>Atención Vía WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Contacto Directo</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-[#1b3b2b]" />
                <span>WhatsApp: +598 91 722 213</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-[#1b3b2b]" />
                <span>Montevideo, Uruguay</span>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA Box */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">¿Consultas o Talles?</h4>
            <p className="text-xs text-gray-500">
              Escríbenos directamente por WhatsApp para consultar stock o coordinar tu entrega.
            </p>
            <a
              href="https://wa.me/59891722213"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 w-full shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Genuinos UY — Elegí Tu Estilo. Calzado 100% Auténtico.</p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-[#1b3b2b] hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>Volver Arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
