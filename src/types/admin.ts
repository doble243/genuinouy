import type { Product, ProductVariant } from "../lib/data";

export type AdminProduct = Product & {
  sku?: string;
  stock?: number;
  category?: string;
  gender?: "Unisex" | "Hombre" | "Mujer" | "Niños" | string;
  images?: string[];
  inStock?: boolean;
  createdAt?: string;
  variants?: ProductVariant[];
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  imageUrl: string;
  align: "left" | "center" | "right";
  sortOrder: number;
  active: boolean;
  createdAt?: string;
};

export type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "hero"
  | "categories"
  | "coupons";

export type StoreOption = {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
};
