"use client";

import Link from "next/link";
import { formatUyu, useCart } from "@/lib/cart";

export default function CarritoPage() {
  const { items, removeItem, setQuantity, totalUyu, ready } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-500">
        Cargando carrito…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-stone-500">
          Descubrí nuestro calzado y elegí tu estilo.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-stone-900">
        Tu carrito
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-2xl border border-brand/10 bg-white p-4 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/productos/${item.slug}`}
                      className="font-serif text-lg font-semibold text-stone-900 hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-stone-500">Talle {item.size}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-stone-300">
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.size, item.quantity - 1)
                      }
                      className="h-8 w-8 font-bold text-stone-600 hover:text-brand"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.size, item.quantity + 1)
                      }
                      className="h-8 w-8 font-bold text-stone-600 hover:text-brand"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-brand">
                    {formatUyu(item.priceUyu * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-brand/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            Resumen
          </h2>
          <div className="mt-4 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatUyu(totalUyu)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Se coordina al confirmar</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold text-stone-900">
            <span>Total</span>
            <span className="text-brand">{formatUyu(totalUyu)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-brand py-3 text-center font-semibold text-white transition hover:bg-brand-dark"
          >
            Finalizar compra
          </Link>
          <Link
            href="/productos"
            className="mt-3 block text-center text-sm font-semibold text-brand hover:underline"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
