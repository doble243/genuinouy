"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  size: string;
  priceUyu: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, size: string) => void;
  setQuantity: (productId: number, size: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  totalUyu: number;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "genuinos-uy-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === item.productId && i.size === item.size,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
          return next;
        }
        return [...prev, { ...item, quantity }];
      });
    };
    const removeItem = (productId: number, size: string) =>
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && i.size === size)),
      );
    const setQuantity = (productId: number, size: string, quantity: number) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !(i.productId === productId && i.size === size))
          : prev.map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, quantity }
                : i,
            ),
      );
    const clear = () => setItems([]);
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalUyu = items.reduce((acc, i) => acc + i.quantity * i.priceUyu, 0);
    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      totalItems,
      totalUyu,
      ready,
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatUyu(amount: number) {
  return `$U ${amount.toLocaleString("es-UY")}`;
}
