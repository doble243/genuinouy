import React from 'react';
import { X, Ruler, Check } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

export const SizeGuideModal: React.FC = () => {
  const { showSizeGuide, setShowSizeGuide } = useCatalog();

  if (!showSizeGuide) return null;

  const sizeTable = [
    { eu: 36, us: 5.5, cm: 23.0 },
    { eu: 37, us: 6.0, cm: 23.5 },
    { eu: 38, us: 6.5, cm: 24.0 },
    { eu: 39, us: 7.5, cm: 25.0 },
    { eu: 40, us: 8.0, cm: 25.5 },
    { eu: 41, us: 8.5, cm: 26.0 },
    { eu: 42, us: 9.5, cm: 27.0 },
    { eu: 43, us: 10.0, cm: 27.5 },
    { eu: 44, us: 11.0, cm: 28.5 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={() => setShowSizeGuide(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowSizeGuide(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-[#1b3b2b]">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold font-serif-brand">Guía de Talles GENUINOS</h3>
            <p className="text-xs text-gray-500 font-semibold">Equivalencias en talle EU, US y centímetros</p>
          </div>
        </div>

        {/* Size Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-center text-xs">
            <thead className="bg-[#1b3b2b] text-white font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Talle EU</th>
                <th className="py-2.5 px-3">Talle US</th>
                <th className="py-2.5 px-3">Largo (CM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {sizeTable.map((row) => (
                <tr key={row.eu} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-extrabold text-[#1b3b2b]">{row.eu}</td>
                  <td className="py-2 px-3">{row.us}</td>
                  <td className="py-2 px-3">{row.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1.5">
          <p className="font-bold text-gray-900 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#1b3b2b]" /> ¿Cómo medir tu pie?
          </p>
          <p>Colocá tu pie sobre una hoja de papel pegada al suelo, marcá el talón y el dedo más largo. Medí la distancia en cm y buscala en la tabla.</p>
        </div>

        <button
          onClick={() => setShowSizeGuide(false)}
          className="w-full btn-forest py-3 rounded-xl text-xs uppercase font-bold tracking-wider"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
