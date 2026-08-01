import React from 'react';
import { MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050608] border-t border-white/5 py-10 px-4 text-center space-y-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <img
          src="/logo_genuinos.webp"
          alt="GENUINOS Logo"
          className="h-9 w-auto object-contain opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />

        <a
          href="https://wa.me/59891722213"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 hover:text-white text-xs font-bold transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Consultas WhatsApp: +598 91 722 213</span>
        </a>

        <p className="text-[11px] text-gray-500 font-medium">
          © {new Date().getFullYear()} GENUINOS UY — Calzado 100% Auténtico en Uruguay.
        </p>
      </div>
    </footer>
  );
};
