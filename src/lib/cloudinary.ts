/**
 * Cloudinary integration for GENUINOS.
 *
 * - Uploads go through an UNSIGNED upload preset (`genuinos_webp`) so the
 *   client never needs the API secret (safe for the single-file Vercel bundle).
 * - The preset forces format=webp + quality=auto on ingestion, so every asset
 *   is stored and served as webp.
 * - `resolveImage` maps legacy local product-photo paths (`/fotos_productos/X.jpg`)
 *   to their Cloudinary webp URL so the existing catalog data works unchanged.
 */
import cloudinaryMap from "./cloudinaryProducts.json";

export const CLOUD_NAME = "kbvbumav";
export const UPLOAD_PRESET = "genuinos_webp";

export type CloudinaryEnv = {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string; // opcional: se usa solo para signed uploads, nunca en el bundle
};

export const cloudinaryConfig: CloudinaryEnv = {
  cloudName:
    (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || CLOUD_NAME,
  uploadPreset:
    (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || UPLOAD_PRESET,
};

export const CLOUDINARY_CDN = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;

/** Construye una URL de entrega desde un public_id (con webp + q auto). */
export function cdnUrl(
  publicId: string,
  opts = "f_webp,q_auto"
): string {
  const clean = publicId.replace(/^\/+/, "");
  return `${CLOUDINARY_CDN}/${opts}/${clean}`;
}

/** Mapa productivo: nombre de archivo local (estable) → URL webp Cloudinary. */
const localToCloud: Record<string, string> = cloudinaryMap;

/**
 * Convierte cualquier referencia de imagen del catálogo a su URL Cloudinary
 * webp. Acepta:
 *  - rutas locales `/fotos_productos/Adidas_2000_1.jpg`
 *  - nombres de archivo `Adidas_2000_1.jpg`
 *  - URLs absolutas ya en res.cloudinary.com (se dejan como están)
 *  - cualquier otra URL (pexels, etc.) que no tenga contraparte aquí
 */
export function resolveImageUrl(src?: string | null): string {
  if (!src) return "";

  // Ya es un asset de nuestro Cloudinary → respetar.
  if (src.includes(`res.cloudinary.com/${cloudinaryConfig.cloudName}`)) {
    return src;
  }

  // Extraer el nombre de archivo base (con o sin directorio local).
  const fileName = src.split("/").pop() || src;
  // Normalizar Unicode (NFC) para no chocar con claves NFD en el mapa.
  const base = fileName.toLowerCase().normalize("NFC").split(/\.(jpg|jpeg|png|webp|avif)$/i)[0];

  const match = localToCloud[base];
  if (match) return match;

  return src;
}

/**
 * Sube un archivo directamente a Cloudinary usando el preset UNSIGNED.
 * Corrige el caso: no envío el signature, el preset es unsigned.
 * Devuelve la URL webp de entrega.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = "genuinos"
): Promise<string> {
  const { cloudName, uploadPreset } = cloudinaryConfig;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("upload_preset", uploadPreset);
  // Public ID opcional: usamos un nombre único derivado del archivo.
  const name = file.name.replace(/\.[^.]+$/, "").replace(/[^\w\-]+/g, "_") || "asset";
  form.append("public_id", `${folder ? `${folder}/` : ""}${name}-${Date.now()}`);
  form.append("file", file);

  const resp = await fetch(url, { method: "POST", body: form });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Cloudinary upload failed (${resp.status}): ${body}`);
  }

  const data = await resp.json();
  // `public_id` garantiza webp porque el preset fuerza f_webp,q_auto.
  return cdnUrl(data.public_id as string);
}