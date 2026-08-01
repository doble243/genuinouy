import React from 'react';

export const HomeSections: React.FC = () => {
  return (
    <>
      {/* Beneficios Section from estilo_de_referencia */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
        {[
          {
            icon: '🚚',
            title: 'Envíos a todo Uruguay',
            text: 'Por DAC o Mirtrans en 24-72 hs. Retiro gratis en el local de Pando o Montevideo.',
          },
          {
            icon: '💳',
            title: 'Pagá como quieras',
            text: 'Efectivo, transferencia bancaria o Mercado Pago en hasta 6 cuotas sin recargo.',
          },
          {
            icon: '🔄',
            title: 'Cambios sin drama',
            text: 'Tenés 30 días para cambiar el talle o modelo, de manera rápida y sin vueltas.',
          },
        ].map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-[#47624d]/15 bg-white p-6 text-center shadow-xs"
          >
            <div className="text-4xl mb-2">{b.icon}</div>
            <h3 className="font-serif-brand text-xl font-bold text-stone-900">
              {b.title}
            </h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </section>

      {/* Ubicación & Local Section from estilo_de_referencia */}
      <section id="ubicacion" className="bg-[#35493a] py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              Nuestro local
            </p>
            <h2 className="mt-1 font-serif-brand text-3xl font-bold text-white">
              Te esperamos en Pando 🇺🇾
            </h2>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">
              Estamos en pleno centro de Pando, a pasos de la plaza. Vení a probarte los modelos, tomarte un mate con nosotros y llevarte el par perfecto.
            </p>
            <ul className="mt-6 space-y-3 text-xs text-white/90 font-medium">
              <li>📍 Av. Artigas esq. Gral. Rivera, Pando, Canelones</li>
              <li>🕐 Lunes a viernes de 9:00 a 19:00</li>
              <li>🕐 Sábados de 9:00 a 13:00</li>
              <li>📱 WhatsApp: +598 91 722 213</li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/20">
            <iframe
              title="Mapa de Pando, Uruguay"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-55.9720%2C-34.7280%2C-55.9430%2C-34.7080&layer=mapnik&marker=-34.7180%2C-55.9580"
              className="h-80 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
};
