import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useCatalog();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1b3b2b] text-white px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-bold uppercase tracking-wider animate-bounce">
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      <span>{toastMessage}</span>
    </div>
  );
};
