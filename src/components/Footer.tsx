import React from 'react';
import { ArrowUp, MessageCircle, Phone, MapPin, ShieldCheck, Truck, CreditCard, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#12271c] text-white py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Info */}
          <div className="space-y-3">
            <img
              src="/logo_genuinos.webp"
              alt="GENUINOS UY Logo"
              className="h-10 w-auto object-contain bg-white/10 p-1.5 rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
              }}
            />
            <p className="text-xs text-stone-300 leading-relaxed">
              Curaduría de championes originales importados en Uruguay. Colecciones auténticas de Adidas, Nike, Jordan, Puma, Vans y New Balance.
            </p>
          </div>

          {/* Guarantees */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">Atención & Envíos</h4>
            <ul className="space-y-2 text-stone-300 font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Calzado Auténtico Garantizado</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Envíos en el día a todo Uruguay</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Pagá hasta en 6 cuotas sin recargo</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">Contacto Directo</h4>
            <ul className="space-y-2 text-stone-300 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: +598 91 722 213</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Av. Artigas esq. Gral. Rivera, Pando</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-emerald-400" />
                <span>@genuinos.uy</span>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp CTA */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">¿Asesoramiento por Talles?</h4>
            <p className="text-stone-300">
              Escríbenos por WhatsApp para verificar disponibilidad de talle o coordinar tu compra directa.
            </p>
            <a
              href="https://wa.me/59891722213"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 w-full shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} GENUINOS UY — Calzado Auténtico. Canelones, Uruguay.</p>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-bold uppercase cursor-pointer"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
