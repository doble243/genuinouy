import { supabase } from "./supabase";
import type { HeroSlide } from "../types/admin";

/**
 * Capa de datos para el carrusel del Hero (tabla `hero_slides`).
 * Espeja el estilo de `src/lib/adminService.ts`.
 */

export type DbHeroSlideRow = {
  id: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  button_text?: string | null;
  button_href?: string | null;
  image_url?: string | null;
  align?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
  created_at?: string | null;
};

export type CreateHeroSlideInput = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  imageUrl?: string;
  align?: HeroSlide["align"];
  sortOrder?: number;
  active?: boolean;
};

export type UpdateHeroSlideInput = Partial<CreateHeroSlideInput>;

/**
 * Mapea una fila de la base de datos Supabase al tipo HeroSlide de la UI.
 */
export function mapDbToHeroSlide(item: DbHeroSlideRow | any): HeroSlide {
  const align =
    item.align === "center" || item.align === "right" ? item.align : "left";
  return {
    id: String(item.id),
    eyebrow: item.eyebrow || "",
    title: item.title || "",
    subtitle: item.subtitle || "",
    buttonText: item.button_text || "",
    buttonHref: item.button_href || "",
    imageUrl: item.image_url || "",
    align,
    sortOrder: Number(item.sort_order) || 0,
    active:
      item.active !== undefined && item.active !== null
        ? Boolean(item.active)
        : true,
    createdAt: item.created_at || undefined,
  };
}

/**
 * Obtiene todos los slides del hero desde Supabase (incluye inactivos,
 * porque el panel de admin necesita verlos todos).
 */
export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Error al obtener slides del hero: ${error.message}`);
  }
  return (data || []).map(mapDbToHeroSlide);
}

/**
 * Crea un nuevo slide. `sort_order` por defecto = máximo actual + 1.
 */
export async function createHeroSlide(
  input: CreateHeroSlideInput
): Promise<HeroSlide> {
  const { data: orderRows, error: orderErr } = await supabase
    .from("hero_slides")
    .select("sort_order");

  if (orderErr) {
    throw new Error(`Error al crear slide del hero: ${orderErr.message}`);
  }
  const maxOrder = (orderRows || []).reduce(
    (max, row) => Math.max(max, Number(row.sort_order) || 0),
    0
  );

  const dbPayload = {
    eyebrow: input.eyebrow || "",
    title: input.title || "",
    subtitle: input.subtitle || "",
    button_text: input.buttonText || "",
    button_href: input.buttonHref || "#nuevos",
    image_url: input.imageUrl || "",
    align: input.align || "left",
    sort_order:
      input.sortOrder !== undefined ? input.sortOrder : maxOrder + 1,
    active: input.active !== undefined ? input.active : true,
  };

  const { data, error } = await supabase
    .from("hero_slides")
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear slide del hero: ${error.message}`);
  }
  if (!data) {
    throw new Error("No se obtuvieron datos tras crear el slide.");
  }

  return mapDbToHeroSlide(data);
}

/**
 * Actualiza un slide existente por su ID (acepta `sortOrder` para reordenar).
 */
export async function updateHeroSlide(
  id: string,
  input: UpdateHeroSlideInput
): Promise<HeroSlide> {
  const dbPayload: Record<string, any> = {};

  if (input.eyebrow !== undefined) dbPayload.eyebrow = input.eyebrow;
  if (input.title !== undefined) dbPayload.title = input.title;
  if (input.subtitle !== undefined) dbPayload.subtitle = input.subtitle;
  if (input.buttonText !== undefined) dbPayload.button_text = input.buttonText;
  if (input.buttonHref !== undefined) dbPayload.button_href = input.buttonHref;
  if (input.imageUrl !== undefined) dbPayload.image_url = input.imageUrl;
  if (input.align !== undefined) dbPayload.align = input.align;
  if (input.sortOrder !== undefined) dbPayload.sort_order = input.sortOrder;
  if (input.active !== undefined) dbPayload.active = input.active;

  const { data, error } = await supabase
    .from("hero_slides")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar slide del hero: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No se encontró el slide con ID ${id}.`);
  }

  return mapDbToHeroSlide(data);
}

/**
 * Elimina un slide por su ID.
 */
export async function deleteHeroSlide(id: string): Promise<void> {
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) {
    throw new Error(`Error al eliminar slide del hero: ${error.message}`);
  }
}
