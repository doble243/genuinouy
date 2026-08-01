"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatUyu, useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const { items, totalUyu, clear, ready } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState("retiro");

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-500">
        Cargando…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-5xl">🧾</p>
        <h1 className="mt-4 font-serif text-3xl font-bold">
          No hay nada para pagar
        </h1>
        <p className="mt-2 text-stone-500">Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          email: form.get("email"),
          address: form.get("address"),
          city: form.get("city"),
          deliveryMethod: form.get("deliveryMethod"),
          paymentMethod: form.get("paymentMethod"),
          notes: form.get("notes"),
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo crear el pedido");
      }
      clear();
      router.push(`/pedido/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-stone-900">
        Finalizar compra
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-brand/10 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="font-serif text-xl font-bold">Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-stone-700">
                  Nombre completo *
                </label>
                <input name="customerName" required className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-stone-700">
                  Celular / WhatsApp *
                </label>
                <input
                  name="phone"
                  required
                  placeholder="099 123 456"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-stone-700">
                  Email (opcional)
                </label>
                <input name="email" type="email" className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold">Entrega</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-4 text-sm ${
                  deliveryMethod === "retiro"
                    ? "border-brand bg-brand/5"
                    : "border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="retiro"
                  checked={deliveryMethod === "retiro"}
                  onChange={() => setDeliveryMethod("retiro")}
                  className="mr-2 accent-brand"
                />
                <span className="font-semibold">Retiro en el local</span>
                <p className="mt-1 text-stone-500">
                  Av. Artigas esq. Gral. Rivera, Pando — Gratis
                </p>
              </label>
              <label
                className={`cursor-pointer rounded-xl border p-4 text-sm ${
                  deliveryMethod === "envio"
                    ? "border-brand bg-brand/5"
                    : "border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="envio"
                  checked={deliveryMethod === "envio"}
                  onChange={() => setDeliveryMethod("envio")}
                  className="mr-2 accent-brand"
                />
                <span className="font-semibold">Envío por agencia</span>
                <p className="mt-1 text-stone-500">
                  DAC / Mirtrans a todo Uruguay (a cargo del comprador)
                </p>
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-stone-700">
                  Dirección {deliveryMethod === "envio" ? "*" : "(opcional)"}
                </label>
                <input
                  name="address"
                  required={deliveryMethod === "envio"}
                  placeholder="Calle y número"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-stone-700">
                  Ciudad / Departamento
                </label>
                <input
                  name="city"
                  defaultValue="Pando, Canelones"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold">Pago</h2>
            <select
              name="paymentMethod"
              className={`${inputClass} mt-4`}
              defaultValue="efectivo"
            >
              <option value="efectivo">Efectivo (en el local o contra entrega)</option>
              <option value="transferencia">Transferencia bancaria</option>
              <option value="mercadopago">Mercado Pago (hasta 6 cuotas)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              Notas para el pedido (opcional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Ej: paso a retirar el sábado…"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Enviando pedido…" : "Confirmar pedido"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-brand/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Tu pedido</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li
                key={`${i.productId}-${i.size}`}
                className="flex items-center gap-3 text-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={i.imageUrl}
                  alt={i.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-stone-800">{i.name}</p>
                  <p className="text-stone-500">
                    Talle {i.size} × {i.quantity}
                  </p>
                </div>
                <span className="font-semibold text-brand">
                  {formatUyu(i.priceUyu * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-brand">{formatUyu(totalUyu)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
