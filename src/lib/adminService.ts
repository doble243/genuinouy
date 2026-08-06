import { supabase } from "./supabase";
import type { Product } from "./data";
import { cdnUrl, resolveImageUrl } from "./cloudinary";

/** Imagen de respaldo en Cloudinary (webp) cuando no hay foto cargada. */
const FALLBACK_IMG = cdnUrl("genuinos/assets/cat_shoes", "f_auto,q_auto");

export type DbProductRow = {
  id: string;
  name: string;
  brand: string;
  category?: string | null;
  gender?: string | null;
  price: number;
  description?: string | null;
  sku?: string | null;
  in_stock?: boolean | null;
  available_quantity?: number | null;
  sizes?: (number | string)[] | null;
  images?: string[] | null;
  featured?: boolean | null;
  created_at?: string | null;
};

export type CreateProductInput = {
  name: string;
  brand: string;
  price: number;
  compareAt?: number;
  category?: string;
  gender?: string;
  description?: string;
  sku?: string;
  in_stock?: boolean;
  available_quantity?: number;
  sizes?: (string | number)[];
  images?: string[];
  featured?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

/**
 * Mapea una fila de la base de datos Supabase al tipo Product utilizado en la UI.
 */
export function mapDbToProduct(item: DbProductRow | any): Product {
  const rawImages =
    Array.isArray(item.images) && item.images.length > 0 ? item.images : [];
  const images = rawImages.map(resolveImageUrl);
  const mainImage = images[0] || item.image || FALLBACK_IMG;
  const hoverImage = images[1] || item.hover || mainImage || FALLBACK_IMG;
  const sizes = (item.sizes || [38, 39, 40, 41, 42, 43, 44]).map(String);

  return {
    id: String(item.id),
    brand: item.brand || "",
    name: item.name || "",
    price: Number(item.price) || 0,
    compareAt:
      item.compare_at !== undefined && item.compare_at !== null
        ? Number(item.compare_at)
        : undefined,
    image: mainImage,
    hover: hoverImage,
    isNew: item.category === "Nuevos Ingresos" || Boolean(item.featured),
    sizes,
    inStock: item.in_stock !== undefined && item.in_stock !== null ? Boolean(item.in_stock) : true,
    category: item.category || undefined,
    gender: item.gender || undefined,
    description: item.description || undefined,
    sku: item.sku || undefined,
    availableQuantity:
      item.available_quantity !== undefined && item.available_quantity !== null
        ? Number(item.available_quantity)
        : 1,
    images: images.length > 0 ? images : [mainImage],
    featured: Boolean(item.featured),
  };
}

/**
 * Obtiene todos los productos desde la tabla 'products' en Supabase.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
  return (data || []).map(mapDbToProduct);
}

/**
 * Crea un nuevo producto en Supabase.
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const dbPayload = {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `gen-${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
    name: input.name,
    brand: input.brand,
    price: input.price,
    compare_at: input.compareAt ?? null,
    category: input.category || "General",
    gender: input.gender || "Unisex",
    description: input.description || "",
    sku: input.sku || `SKU-${Date.now()}`,
    in_stock: input.in_stock !== undefined ? input.in_stock : true,
    available_quantity: input.available_quantity !== undefined ? input.available_quantity : 1,
    sizes: input.sizes
      ? input.sizes.map((s) => Number(s)).filter((n) => !isNaN(n))
      : [38, 39, 40, 41, 42, 43, 44],
    images:
      input.images && input.images.length > 0
        ? input.images.map(resolveImageUrl)
        : [FALLBACK_IMG, FALLBACK_IMG],
    featured: Boolean(input.featured),
  };

  const { data, error } = await supabase
    .from("products")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear el producto: ${error.message}`);
  }
  if (!data) {
    throw new Error("No se obtuvieron datos tras crear el producto.");
  }

  return mapDbToProduct(data);
}

/**
 * Actualiza un producto existente por su ID.
 */
export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const dbPayload: Record<string, any> = {};

  if (input.name !== undefined) dbPayload.name = input.name;
  if (input.brand !== undefined) dbPayload.brand = input.brand;
  if (input.price !== undefined) dbPayload.price = input.price;
  if (input.compareAt !== undefined) dbPayload.compare_at = input.compareAt ?? null;
  if (input.category !== undefined) dbPayload.category = input.category;
  if (input.gender !== undefined) dbPayload.gender = input.gender;
  if (input.description !== undefined) dbPayload.description = input.description;
  if (input.sku !== undefined) dbPayload.sku = input.sku;
  if (input.in_stock !== undefined) dbPayload.in_stock = input.in_stock;
  if (input.available_quantity !== undefined)
    dbPayload.available_quantity = input.available_quantity;
  if (input.sizes !== undefined) {
    dbPayload.sizes = input.sizes.map((s) => Number(s)).filter((n) => !isNaN(n));
  }
  if (input.images !== undefined) dbPayload.images = input.images.map(resolveImageUrl);
  if (input.featured !== undefined) dbPayload.featured = input.featured;

  const { data, error } = await supabase
    .from("products")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar el producto: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No se encontró el producto con ID ${id}.`);
  }

  return mapDbToProduct(data);
}

/**
 * Elimina un producto por su ID.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(`Error al eliminar el producto: ${error.message}`);
  }
}

/**
 * Alterna o actualiza el estado de stock (in_stock) de un producto.
 */
export async function toggleStock(
  id: string,
  targetInStock?: boolean
): Promise<Product> {
  let nextState: boolean;

  if (targetInStock !== undefined) {
    nextState = targetInStock;
  } else {
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("in_stock")
      .eq("id", id)
      .single();

    if (fetchErr) {
      throw new Error(`Error al consultar stock del producto: ${fetchErr.message}`);
    }
    nextState = current ? !current.in_stock : false;
  }

  const { data, error } = await supabase
    .from("products")
    .update({ in_stock: nextState })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al cambiar el estado de stock: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No se encontró el producto con ID ${id}.`);
  }

  return mapDbToProduct(data);
}

/**
 * Actualiza únicamente el precio de un producto.
 */
export async function updatePrice(id: string, newPrice: number): Promise<Product> {
  if (typeof newPrice !== "number" || isNaN(newPrice) || newPrice < 0) {
    throw new Error("El precio debe ser un número válido mayor o igual a 0.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ price: newPrice })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar el precio: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No se encontró el producto con ID ${id}.`);
  }

  return mapDbToProduct(data);
}
