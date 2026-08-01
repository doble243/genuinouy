import React from 'react';
import { useCatalog } from '../context/CatalogContext';

export const SplashScreen: React.FC = () => {
  const { showSplash, setShowSplash } = useCatalog();

  if (!showSplash) return null;

  return (
    <div
      onClick={() => setShowSplash(false)}
      className="fixed inset-0 z-50 bg-[#08110b] flex flex-col items-center justify-center p-6 text-center transition-opacity duration-500 cursor-pointer"
    >
      <div className="space-y-6 animate-pulse">
        <img
          src="/logo_genuinos.webp"
          alt="Genuinos UY Logo"
          className="h-16 sm:h-20 w-auto object-contain mx-auto border border-white/20 rounded-2xl p-1 bg-[#112418] shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo_genuinos.webp';
          }}
        />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
            Calzado 100% Auténtico • Uruguay
          </p>
          <div className="flex justify-center gap-1.5 pt-2">
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
