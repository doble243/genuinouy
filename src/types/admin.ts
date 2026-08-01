import type { Product } from "../lib/data";

export type AdminProduct = Product & {
  sku?: string;
  stock?: number;
  category?: string;
  gender?: "Unisex" | "Hombre" | "Mujer" | "Niños" | string;
  images?: string[];
  inStock?: boolean;
  createdAt?: string;
};

export type AdminTab = "dashboard" | "products";

export type StoreOption = {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
};
