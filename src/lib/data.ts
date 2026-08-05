export const LOGO = "https://genuinos.simplemente.com.uy/logo_genuinos.webp";

export type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  compareAt?: number;
  image: string;
  hover: string;
  isNew?: boolean;
  sizes: string[];
  inStock?: boolean;
  category?: string;
  gender?: string;
  description?: string;
  sku?: string;
  availableQuantity?: number;
  images?: string[];
  featured?: boolean;
};

const px = (id: number, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=${w}`;

const SZ = ["38", "39", "40", "41", "42", "43", "44"];
const SZ_SHORT = ["39", "40", "41", "42", "43"];

export const newArrivals: Product[] = [
  {
    id: "na-1",
    brand: "New Balance",
    name: "574 Suede Grey",
    price: 8990,
    image: px(30755567),
    hover: px(8473456),
    isNew: true,
    sizes: SZ,
  },
  {
    id: "na-2",
    brand: "Nike",
    name: "Court Vision Low",
    price: 7490,
    image: px(24702077),
    hover: px(4296075),
    isNew: true,
    sizes: SZ_SHORT,
  },
  {
    id: "na-3",
    brand: "Jordan",
    name: "Air Jordan 1 Mid",
    price: 14900,
    image: px(11718014),
    hover: px(16923479),
    isNew: true,
    sizes: SZ,
  },
  {
    id: "na-4",
    brand: "Adidas",
    name: "Forum Low Blue",
    price: 9890,
    image: px(19869759),
    hover: px(27988923),
    sizes: SZ,
  },
  {
    id: "na-5",
    brand: "Puma",
    name: "RS-X Chunky",
    price: 8290,
    image: px(27256441),
    hover: px(27274317),
    isNew: true,
    sizes: SZ_SHORT,
  },
  {
    id: "na-6",
    brand: "Asics",
    name: "Gel Lyte Runner",
    price: 10490,
    image: px(6744427),
    hover: px(8473482),
    sizes: SZ,
  },
];

export const mostWanted: Product[] = [
  {
    id: "mw-1",
    brand: "Jordan",
    name: "Air Jordan 1 Low Fragment",
    price: 16900,
    compareAt: 19900,
    image: px(16923479),
    hover: px(11718014),
    sizes: SZ,
  },
  {
    id: "mw-2",
    brand: "Adidas",
    name: "Metallic Runner",
    price: 9490,
    image: px(27988923),
    hover: px(27113471),
    sizes: SZ_SHORT,
  },
  {
    id: "mw-3",
    brand: "Nike",
    name: "Air Max Tech",
    price: 12490,
    image: px(28645957),
    hover: px(29699313),
    sizes: SZ,
  },
  {
    id: "mw-4",
    brand: "Converse",
    name: "Canvas Low Off White",
    price: 5990,
    compareAt: 7490,
    image: px(4296075),
    hover: px(24702077),
    sizes: SZ,
  },
];

export const retroRunning: Product[] = [
  {
    id: "rr-1",
    brand: "New Balance",
    name: "574 Suede Grey",
    price: 8990,
    image: px(30755567),
    hover: px(8473456),
    sizes: SZ,
  },
  {
    id: "rr-2",
    brand: "Asics",
    name: "Gel Lyte Runner",
    price: 10490,
    image: px(8473456),
    hover: px(6744427),
    sizes: SZ,
  },
  {
    id: "rr-3",
    brand: "Puma",
    name: "Trinomic Fade",
    price: 7890,
    image: px(8473482),
    hover: px(19882430),
    sizes: SZ_SHORT,
  },
];

export const allProducts = [...newArrivals, ...mostWanted, ...retroRunning];

export const brands = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Jordan", slug: "jordan" },
  { name: "New Balance", slug: "newbalance" },
  { name: "Puma", slug: "puma" },
  { name: "Converse", slug: "converse" },
  { name: "Vans", slug: "vans" },
  { name: "Asics", slug: "asics" },
  { name: "Reebok", slug: "reebok" },
  { name: "Under Armour", slug: "underarmour" },
];

export const brandLogo = (slug: string, color = "1a1a1a") =>
  `https://cdn.simpleicons.org/${slug}/${color}`;

export const uy = (n: number) =>
  "$ " + n.toLocaleString("es-UY", { maximumFractionDigits: 0 });

export const HERO_IMG =
  "https://images.pexels.com/photos/29183247/pexels-photo-29183247.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1800";

export const CAT_SHOES =
  "https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1100";
export const CAT_SALE =
  "https://images.pexels.com/photos/8473456/pexels-photo-8473456.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1100";

export const EDITORIAL_IMG =
  "https://images.pexels.com/photos/10301339/pexels-photo-10301339.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1400";
