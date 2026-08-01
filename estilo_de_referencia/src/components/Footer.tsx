import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm text-white/70">
            Calzado con estilo genuino en el corazón de Pando, Canelones.
            Zapatillas, botas, mocasines y tacos para todos los gustos.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold">Tienda</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/productos" className="hover:text-white">
                Catálogo completo
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=zapatillas" className="hover:text-white">
                Zapatillas
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=botas" className="hover:text-white">
                Botas
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=mocasines" className="hover:text-white">
                Mocasines
              </Link>
            </li>
            <li>
              <Link href="/productos?categoria=tacos" className="hover:text-white">
                Tacos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold">Visitanos</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>📍 Av. Artigas y Gral. Rivera, Pando</li>
            <li>Canelones, Uruguay</li>
            <li>🕐 Lun a Vie: 9:00 – 19:00</li>
            <li>🕐 Sábados: 9:00 – 13:00</li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>📱 +598 99 123 456</li>
            <li>✉️ hola@genuinosuy.com</li>
            <li>📷 @genuinos.uy</li>
          </ul>
          <p className="mt-4 rounded-lg bg-white/10 p-3 text-xs text-white/80">
            Envíos a todo el país por DAC / Mirtrans. Retiro sin costo en el
            local de Pando.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} GENUINOS UY — Elegí tu estilo. Pando,
        Uruguay.
      </div>
    </footer>
  );
}
