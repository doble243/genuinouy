import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "GENUINOS UY — Tienda de calzado en Pando, Uruguay",
  description:
    "Zapatillas, botas, mocasines y tacos con estilo genuino. Tienda de calzado en Pando, Canelones. Envíos a todo Uruguay. Elegí tu estilo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${playfair.variable} ${jost.variable} bg-cream font-sans text-stone-900 antialiased`}
      >
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
