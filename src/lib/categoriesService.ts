import { supabase } from "./supabase";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Calzados", slug: "calzados", description: "Championes y calzado urbano" },
  { id: "cat-2", name: "Indumentaria", slug: "indumentaria", description: "Ropa deportiva y casual" },
  { id: "cat-3", name: "Accesorios", slug: "accesorios", description: "Gorros, medias y mochilas" },
];

const DEFAULT_BRANDS: BrandItem[] = [
  { id: "b-1", name: "Nike", slug: "nike" },
  { id: "b-2", name: "Adidas", slug: "adidas" },
  { id: "b-3", name: "Puma", slug: "puma" },
  { id: "b-4", name: "New Balance", slug: "new-balance" },
  { id: "b-5", name: "Jordan", slug: "jordan" },
];

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data && data.length > 0) return data as CategoryItem[];
  } catch {
    /* fallback */
  }
  return DEFAULT_CATEGORIES;
}

export async function fetchBrands(): Promise<BrandItem[]> {
  try {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data && data.length > 0) return data as BrandItem[];
  } catch {
    /* fallback */
  }
  return DEFAULT_BRANDS;
}

export async function saveCategory(cat: Omit<CategoryItem, "id"> & { id?: string }): Promise<CategoryItem> {
  const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
  try {
    if (cat.id && !cat.id.startsWith("cat-")) {
      const { data, error } = await supabase
        .from("categories")
        .update({ name: cat.name, slug, description: cat.description })
        .eq("id", cat.id)
        .select()
        .single();
      if (!error && data) return data as CategoryItem;
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: cat.name, slug, description: cat.description })
        .select()
        .single();
      if (!error && data) return data as CategoryItem;
    }
  } catch (err) {
    console.warn("[GENUINOS] Category save DB fallback:", err);
  }
  return { id: cat.id || `cat-${Date.now()}`, name: cat.name, slug, description: cat.description };
}

export async function saveBrand(brand: Omit<BrandItem, "id"> & { id?: string }): Promise<BrandItem> {
  const slug = brand.slug || brand.name.toLowerCase().replace(/\s+/g, "-");
  try {
    if (brand.id && !brand.id.startsWith("b-")) {
      const { data, error } = await supabase
        .from("brands")
        .update({ name: brand.name, slug })
        .eq("id", brand.id)
        .select()
        .single();
      if (!error && data) return data as BrandItem;
    } else {
      const { data, error } = await supabase
        .from("brands")
        .insert({ name: brand.name, slug })
        .select()
        .single();
      if (!error && data) return data as BrandItem;
    }
  } catch (err) {
    console.warn("[GENUINOS] Brand save DB fallback:", err);
  }
  return { id: brand.id || `b-${Date.now()}`, name: brand.name, slug };
}
