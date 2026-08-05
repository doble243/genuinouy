import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Mapa nombre-archivo → URL Cloudinary webp (claves en minúscula).
 * Se genera una vez con la subida inicial; si una foto nueva no está en el
 * mapa, el pipeline cae al path local tradicional.
 */
const cloudinaryMapPath = path.join(rootDir, 'src', 'lib', 'cloudinaryProducts.json');
let cloudinaryMap = {};
try {
  cloudinaryMap = JSON.parse(fs.readFileSync(cloudinaryMapPath, 'utf8'));
} catch {
  cloudinaryMap = {};
}

/** Resuelve un nombre de foto local (ej. Adidas_2000_1.jpg) a su URL webp. */
function resolvePhotoUrl(img) {
  if (!img) return img;
  // URLs absolutas ya migradas → tal cual
  if (/^https?:\/\//.test(img)) return img;
  const base = path.basename(img).toLowerCase().normalize('NFC').replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
  const cloudUrl = cloudinaryMap[base];
  if (cloudUrl) return cloudUrl;
  return img.startsWith('/') ? img : `/fotos_productos/${img}`;
}

export function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseProductRow(headers, rowValues) {
  const getField = (name) => {
    const idx = headers.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
    return idx !== -1 ? (rowValues[idx] || '').trim() : '';
  };

  const id = getField('ID');
  const name = getField('Nombre');
  const category = getField('Categoría/Modelo') || getField('Categoria/Modelo');
  const brand = getField('Marca');
  const gender = getField('Género') || getField('Genero');
  const rawPrice = getField('Precio');
  const currency = getField('Moneda') || 'UYU';
  const formattedPrice = getField('Precio Formateado');
  const description = getField('Descripción') || getField('Descripcion') || 'Sin descripción';
  const rawQty = getField('Cantidad Disponible');
  const status = getField('Estado') || 'Nuevo';
  const sku = getField('SKU');
  const whatsappLink = getField('Enlace de Compra (WhatsApp)');
  const fotosLocalesRaw = getField('Fotos Locales');

  if (!id || !name) {
    throw new Error(`Malformed product row: missing ID or Name`);
  }

  const price = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
  if (isNaN(price) || price < 0) {
    throw new Error(`Invalid non-numeric price '${rawPrice}' for product '${name}' (ID: ${id})`);
  }

  const availableQuantity = parseInt(rawQty, 10);
  const qty = isNaN(availableQuantity) ? 1 : availableQuantity;

  let images = [];
  if (fotosLocalesRaw) {
    images = fotosLocalesRaw
      .split(';')
      .map(img => img.trim())
      .filter(Boolean)
      .map(resolvePhotoUrl);
  }
  if (images.length === 0) {
    images = ['/logo_genuinos.webp'];
  }

  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44];

  return {
    id,
    name,
    category,
    brand,
    gender,
    price,
    currency,
    formattedPrice: formattedPrice || `$ ${price.toLocaleString('es-UY')} UYU`,
    description: description === 'Sin descripción' ? 'Calzado 100% auténtico importado. Edición limitada.' : description,
    availableQuantity: qty,
    inStock: qty > 0,
    status,
    sku,
    whatsappLink,
    sizes,
    images,
  };
}

export function parseCSVContent(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = parseCSVLine(lines[0]);
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) {
      if (values.join('').trim() === '') continue;
    }
    const product = parseProductRow(headers, values);
    products.push(product);
  }

  return products;
}

export function runParser() {
  const csvPath = path.join(rootDir, 'productos.csv');
  const outputDir = path.join(rootDir, 'src', 'data');
  const outputPath = path.join(outputDir, 'products.json');
  const publicDir = path.join(rootDir, 'public');
  const publicFotosDir = path.join(publicDir, 'fotos_productos');

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: productos.csv not found at ${csvPath}`);
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const products = parseCSVContent(csvContent);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`Successfully compiled ${products.length} products to ${outputPath}`);

    // Ensure public assets exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const rootLogo = path.join(rootDir, 'logo_genuinos.webp');
    const publicLogo = path.join(publicDir, 'logo_genuinos.webp');
    if (fs.existsSync(rootLogo) && !fs.existsSync(publicLogo)) {
      fs.copyFileSync(rootLogo, publicLogo);
      console.log('Copied logo_genuinos.webp to public/');
    }

    const rootFotos = path.join(rootDir, 'fotos_productos');
    if (fs.existsSync(rootFotos)) {
      if (!fs.existsSync(publicFotosDir)) {
        fs.mkdirSync(publicFotosDir, { recursive: true });
      }
      const files = fs.readdirSync(rootFotos);
      for (const file of files) {
        const srcFile = path.join(rootFotos, file);
        const destFile = path.join(publicFotosDir, file);
        if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
          fs.copyFileSync(srcFile, destFile);
        }
      }
      console.log(`Synced ${files.length} product photos to public/fotos_productos/`);
    }

  } catch (err) {
    console.error(`CSV Parsing Failed: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runParser();
}
