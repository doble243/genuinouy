import React from 'react';
import { ArrowUp, MessageCircle, Phone, MapPin, ShieldCheck, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#35493a] text-white py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Intro */}
          <div className="space-y-3">
            <img
              src="/logo_genuinos.webp"
              alt="GENUINOS UY Logo"
              className="h-10 w-auto object-contain bg-white/10 p-1.5 rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
              }}
            />
            <p className="font-serif-brand text-xl italic text-amber-300">
              Elegí tu estilo
            </p>
            <p className="text-xs text-white/80 leading-relaxed">
              Calzado 100% auténtico importado. Zapatillas, botas y calzado urbano seleccionado con amor en Uruguay.
            </p>
          </div>

          {/* Guarantees */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif-brand text-lg font-bold text-white">Garantías GENUINOS</h4>
            <ul className="space-y-2 text-white/80 font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>100% Auténticos Garantizado</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-300" />
                <span>Envíos DAC / Mirtrans 24-72 hs</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-300" />
                <span>30 días para cambios de talle</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif-brand text-lg font-bold text-white">Contacto Directo</h4>
            <ul className="space-y-2 text-white/80 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: +598 91 722 213</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Av. Artigas esq. Gral. Rivera, Pando</span>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-[#47624d] p-5 rounded-2xl border border-white/20 space-y-3 text-xs">
            <h4 className="font-serif-brand text-lg font-bold text-white">¿Consultas o Talles?</h4>
            <p className="text-white/80">
              Escríbenos por WhatsApp para verificar disponibilidad de talle o asesorarte al instante.
            </p>
            <a
              href="https://wa.me/59891722213"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 w-full shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Chat WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p>© {new Date().getFullYear()} GENUINOS UY — Elegí Tu Estilo. Pando, Uruguay.</p>
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
