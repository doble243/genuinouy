import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

const SEED: Array<Omit<Product, "id" | "createdAt">> = [
  {
    name: "Zapatillas Urban Court",
    slug: "zapatillas-urban-court",
    description:
      "Zapatillas urbanas de estilo basket con capellada premium y suela de goma vulcanizada. Comodidad total para el día a día en Pando y donde quieras ir.",
    category: "zapatillas",
    gender: "unisex",
    priceUyu: 2890,
    oldPriceUyu: 3490,
    sizes: "37,38,39,40,41,42,43",
    imageUrl:
      "https://images.pexels.com/photos/27100548/pexels-photo-27100548.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 14,
  },
  {
    name: "Zapatillas Silver Denim",
    slug: "zapatillas-silver-denim",
    description:
      "Zapatillas plateadas metalizadas que combinan perfecto con denim. El toque de brillo que tu look estaba esperando.",
    category: "zapatillas",
    gender: "mujer",
    priceUyu: 3190,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27113471/pexels-photo-27113471.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 9,
  },
  {
    name: "Zapatillas Black Classic",
    slug: "zapatillas-black-classic",
    description:
      "Un clásico que nunca falla: zapatillas negras minimalistas, livianas y versátiles para combinar con todo tu guardarropas.",
    category: "zapatillas",
    gender: "unisex",
    priceUyu: 2590,
    oldPriceUyu: null,
    sizes: "36,37,38,39,40,41,42",
    imageUrl:
      "https://images.pexels.com/photos/27988921/pexels-photo-27988921.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 20,
  },
  {
    name: "Zapatillas Violet Studio",
    slug: "zapatillas-violet-studio",
    description:
      "Zapatillas moradas de edición limitada, con amortiguación reforzada y diseño moderno que no pasa desapercibido.",
    category: "zapatillas",
    gender: "mujer",
    priceUyu: 3390,
    oldPriceUyu: 3990,
    sizes: "35,36,37,38,39",
    imageUrl:
      "https://images.pexels.com/photos/27113473/pexels-photo-27113473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 7,
  },
  {
    name: "Zapatillas Runner Azul",
    slug: "zapatillas-runner-azul",
    description:
      "Zapatillas deportivas azules con suela de alto agarre y plantilla acolchonada. Ideales para entrenar o caminar todo el día.",
    category: "zapatillas",
    gender: "hombre",
    priceUyu: 3590,
    oldPriceUyu: null,
    sizes: "39,40,41,42,43,44",
    imageUrl:
      "https://images.pexels.com/photos/19869753/pexels-photo-19869753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 12,
  },
  {
    name: "Zapatillas Blossom",
    slug: "zapatillas-blossom",
    description:
      "Zapatillas blancas frescas de líneas suaves, tan cómodas como delicadas. Perfectas para primavera y verano.",
    category: "zapatillas",
    gender: "mujer",
    priceUyu: 2790,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27988920/pexels-photo-27988920.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 11,
  },
  {
    name: "Botas Cuero Campo",
    slug: "botas-cuero-campo",
    description:
      "Botas de cuero genuino uruguayo con costura reforzada. Resistentes, atemporales y cada vez más lindas con el uso.",
    category: "botas",
    gender: "unisex",
    priceUyu: 4990,
    oldPriceUyu: 5890,
    sizes: "37,38,39,40,41,42,43",
    imageUrl:
      "https://images.pexels.com/photos/27256470/pexels-photo-27256470.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 8,
  },
  {
    name: "Botas Chelsea Bicolor",
    slug: "botas-chelsea-bicolor",
    description:
      "Botas estilo chelsea en combinación negro y marrón, con elásticos laterales y taco bajo. Elegancia sin esfuerzo.",
    category: "botas",
    gender: "unisex",
    priceUyu: 4590,
    oldPriceUyu: null,
    sizes: "36,37,38,39,40,41,42",
    imageUrl:
      "https://images.pexels.com/photos/27256456/pexels-photo-27256456.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 10,
  },
  {
    name: "Botas Taco Alto Suede",
    slug: "botas-taco-alto-suede",
    description:
      "Botas de caña alta en cuero marrón con puño de gamuza y taco firme. El infaltable del invierno uruguayo.",
    category: "botas",
    gender: "mujer",
    priceUyu: 5490,
    oldPriceUyu: 6290,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27256471/pexels-photo-27256471.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 6,
  },
  {
    name: "Botinetas Block Heel",
    slug: "botinetas-block-heel",
    description:
      "Botinetas de cuero al tobillo con taco bloque de altura media. Comodidad y estilo para la oficina o la noche.",
    category: "botas",
    gender: "mujer",
    priceUyu: 4290,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27256462/pexels-photo-27256462.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 9,
  },
  {
    name: "Botas Night Out",
    slug: "botas-night-out",
    description:
      "Botas negras de taco alto con suela de diseño exclusivo. Para las noches en que querés brillar.",
    category: "botas",
    gender: "mujer",
    priceUyu: 5190,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39",
    imageUrl:
      "https://images.pexels.com/photos/27256450/pexels-photo-27256450.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 5,
  },
  {
    name: "Mocasines Trío Clásico",
    slug: "mocasines-trio-clasico",
    description:
      "Mocasines de cuero disponibles en marrón, azul marino y beige. Suaves, flexibles y elegantes desde el primer uso.",
    category: "mocasines",
    gender: "mujer",
    priceUyu: 3490,
    oldPriceUyu: 3990,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27256452/pexels-photo-27256452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 15,
  },
  {
    name: "Mocasines Cuña Marrón",
    slug: "mocasines-cuna-marron",
    description:
      "Mocasines de cuero marrón con taco de cuña bajo. Tan versátiles que sirven para una reunión o un paseo por la plaza.",
    category: "mocasines",
    gender: "mujer",
    priceUyu: 3290,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27256454/pexels-photo-27256454.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 13,
  },
  {
    name: "Mocasines Beige Wedge",
    slug: "mocasines-beige-wedge",
    description:
      "Mocasines beige de cuero con cuña, terminación premium y plantilla anatómica. Comodidad elegante todo el día.",
    category: "mocasines",
    gender: "mujer",
    priceUyu: 3390,
    oldPriceUyu: null,
    sizes: "35,36,37,38,39,40",
    imageUrl:
      "https://images.pexels.com/photos/27256448/pexels-photo-27256448.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: false,
    stock: 10,
  },
  {
    name: "Stilettos Color Pop",
    slug: "stilettos-color-pop",
    description:
      "Stilettos vibrantes en naranja, amarillo y negro. El taco perfecto para eventos, fiestas y ocasiones especiales.",
    category: "tacos",
    gender: "mujer",
    priceUyu: 3890,
    oldPriceUyu: 4490,
    sizes: "35,36,37,38,39",
    imageUrl:
      "https://images.pexels.com/photos/27256446/pexels-photo-27256446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    featured: true,
    stock: 8,
  },
];

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  if (count === 0) {
    await db.insert(products).values(SEED);
  }
  seeded = true;
}

export const CATEGORIES = [
  { slug: "zapatillas", label: "Zapatillas" },
  { slug: "botas", label: "Botas" },
  { slug: "mocasines", label: "Mocasines" },
  { slug: "tacos", label: "Tacos" },
] as const;

export function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export async function getProducts(opts?: {
  category?: string;
  q?: string;
  sort?: string;
}) {
  await ensureSeed();
  const conditions = [];
  if (opts?.category && CATEGORIES.some((c) => c.slug === opts.category)) {
    conditions.push(eq(products.category, opts.category));
  }
  if (opts?.q) {
    const pattern = `%${opts.q}%`;
    conditions.push(
      or(ilike(products.name, pattern), ilike(products.description, pattern)),
    );
  }
  const orderBy =
    opts?.sort === "precio-asc"
      ? asc(products.priceUyu)
      : opts?.sort === "precio-desc"
        ? desc(products.priceUyu)
        : desc(products.featured);

  return db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy, asc(products.id));
}

export async function getFeaturedProducts() {
  await ensureSeed();
  return db
    .select()
    .from(products)
    .where(eq(products.featured, true))
    .orderBy(asc(products.id))
    .limit(6);
}

export async function getProductBySlug(slug: string) {
  await ensureSeed();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedProducts(category: string, excludeId: number) {
  await ensureSeed();
  return db
    .select()
    .from(products)
    .where(and(eq(products.category, category), sql`${products.id} <> ${excludeId}`))
    .limit(3);
}

export function formatUyu(amount: number) {
  return `$U ${amount.toLocaleString("es-UY")}`;
}
