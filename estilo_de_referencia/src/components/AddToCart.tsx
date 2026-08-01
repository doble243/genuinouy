"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

type Props = {
  productId: number;
  slug: string;
  name: string;
  priceUyu: number;
  imageUrl: string;
  sizes: string[];
  stock: number;
};

export function AddToCart({
  productId,
  slug,
  name,
  priceUyu,
  imageUrl,
  sizes,
  stock,
}: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (goToCart: boolean) => {
    if (!size) {
      setError("Elegí un talle antes de continuar");
      return;
    }
    setError(null);
    addItem({ productId, slug, name, size, priceUyu, imageUrl }, quantity);
    if (goToCart) {
      router.push("/carrito");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-stone-700">Talle (UY)</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSize(s);
              setError(null);
            }}
            className={`h-11 w-11 rounded-xl border text-sm font-semibold transition ${
              size === s
                ? "border-brand bg-brand text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-brand"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <p className="text-sm font-semibold text-stone-700">Cantidad</p>
        <div className="flex items-center rounded-full border border-stone-300 bg-white">
          <button
            onClick={() => setQuantity((v) => Math.max(1, v - 1))}
            className="h-10 w-10 text-lg font-bold text-stone-600 hover:text-brand"
            aria-label="Restar"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((v) => Math.min(stock, v + 1))}
            className="h-10 w-10 text-lg font-bold text-stone-600 hover:text-brand"
            aria-label="Sumar"
          >
            +
          </button>
        </div>
        <span className="text-xs text-stone-500">{stock} disponibles</span>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {added && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          ✓ ¡Agregado al carrito!
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleAdd(false)}
          className="rounded-full border-2 border-brand px-8 py-3 font-semibold text-brand transition hover:bg-brand/5"
        >
          Agregar al carrito
        </button>
        <button
          onClick={() => handleAdd(true)}
          className="rounded-full bg-brand px-8 py-3 font-semibold text-white shadow-md transition hover:bg-brand-dark"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
