import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'wqrjusxmyklienzqlket';

async function runSql(query) {
  if (!ACCESS_TOKEN) {
    throw new Error('SUPABASE_ACCESS_TOKEN environment variable is required');
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`SQL Error: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('📦 Setting up Supabase Database Schema...');

  const schemaSql = `
    -- Create products table
    CREATE TABLE IF NOT EXISTS public.products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT,
      gender TEXT,
      price NUMERIC NOT NULL,
      description TEXT,
      sku TEXT,
      in_stock BOOLEAN DEFAULT true,
      available_quantity INTEGER DEFAULT 10,
      sizes JSONB DEFAULT '[]'::jsonb,
      images JSONB DEFAULT '[]'::jsonb,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create orders table
    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name TEXT,
      phone TEXT,
      address TEXT,
      city TEXT DEFAULT 'Montevideo',
      notes TEXT,
      total_amount NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create order_items table
    CREATE TABLE IF NOT EXISTS public.order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES public.products(id),
      selected_size INTEGER,
      quantity INTEGER DEFAULT 1,
      unit_price NUMERIC NOT NULL
    );

    -- Enable RLS
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Public read access for products" ON public.products;
    DROP POLICY IF EXISTS "Public insert access for orders" ON public.orders;
    DROP POLICY IF EXISTS "Public insert access for order_items" ON public.order_items;

    -- Public Policies
    CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Public insert access for orders" ON public.orders FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public insert access for order_items" ON public.order_items FOR INSERT WITH CHECK (true);
  `;

  await runSql(schemaSql);
  console.log('✅ Database tables and RLS policies created!');

  // Load products.json
  const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  console.log(`🚀 Seeding ${products.length} products into Supabase...`);

  for (const p of products) {
    const imagesJson = JSON.stringify(p.images || []).replace(/'/g, "''");
    const sizesJson = JSON.stringify(p.sizes || []).replace(/'/g, "''");
    const nameEscaped = p.name.replace(/'/g, "''");
    const brandEscaped = p.brand.replace(/'/g, "''");
    const categoryEscaped = (p.category || '').replace(/'/g, "''");
    const genderEscaped = (p.gender || '').replace(/'/g, "''");
    const descEscaped = (p.description || '').replace(/'/g, "''");
    const skuEscaped = (p.sku || '').replace(/'/g, "''");

    const upsertQuery = `
      INSERT INTO public.products (id, name, brand, category, gender, price, description, sku, in_stock, available_quantity, sizes, images, featured)
      VALUES (
        '${p.id}',
        '${nameEscaped}',
        '${brandEscaped}',
        '${categoryEscaped}',
        '${genderEscaped}',
        ${p.price},
        '${descEscaped}',
        '${skuEscaped}',
        ${p.inStock ? 'true' : 'false'},
        ${p.availableQuantity || 10},
        '${sizesJson}'::jsonb,
        '${imagesJson}'::jsonb,
        ${p.featured ? 'true' : 'false'}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        brand = EXCLUDED.brand,
        category = EXCLUDED.category,
        gender = EXCLUDED.gender,
        price = EXCLUDED.price,
        description = EXCLUDED.description,
        sku = EXCLUDED.sku,
        in_stock = EXCLUDED.in_stock,
        available_quantity = EXCLUDED.available_quantity,
        sizes = EXCLUDED.sizes,
        images = EXCLUDED.images,
        featured = EXCLUDED.featured;
    `;

    await runSql(upsertQuery);
  }

  console.log('🎉 Supabase database fully initialized & populated with all 26 products!');
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
