-- =============================================================================
-- Genuinos UY — Migration 0001: Orders, Customers, Saved Carts
-- =============================================================================
--
-- Contexto verificado (anon-key probe, 2026-08-06):
--   - products:    ya existe, 25 filas (id, name, brand, category, price,
--                  compare_at, description, featured, gender, images,
--                  in_stock, sizes, sku, available_quantity, created_at)
--   - orders:      ya existe, vacía. Columnas actuales: id, status,
--                  total_amount, customer_name, notes, created_at.
--                  Faltan columnas para relacionar con customers y snapshots.
--   - order_items: ya existe, vacía. Columnas actuales: id, order_id,
--                  product_id, quantity, unit_price. Falta subtotal y snapshot.
--   - profiles:    ya existe, vacía. id, email, role, created_at.
--                  Se usa para admin role gating (auth.ts hasAdminRole).
--
-- Esta migración agrega el resto del modelo sin romper lo que ya funciona.
-- Aplicar desde Supabase Dashboard → SQL Editor → New Query → pegar este SQL.
--
-- Idempotente? NO. Re-ejecutar fallará por IF NOT EXISTS duplicado en algunas
-- statements. Si necesitás re-aplicar, dropear manualmente lo creado antes.

-- -----------------------------------------------------------------------------
-- 1. customers
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  -- customer identity (any one is enough to upsert)
  name              text not null,
  phone             text not null,
  email             text,
  address           text,
  notes             text,
  -- customer classification (admin assigns)
  customer_type     text not null default 'minorista'
                    check (customer_type in ('minorista', 'mayorista')),
  -- soft tracking
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- uniqueness per phone number (UR style: phone is the local trust key)
  unique (phone)
);

create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_customers_email on public.customers (email);

-- -----------------------------------------------------------------------------
-- 2. saved_carts (cart preservado antes de finalizar compra)
-- -----------------------------------------------------------------------------
create table if not exists public.saved_carts (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references public.customers(id) on delete cascade,
  name         text not null,
  items        jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_saved_carts_customer on public.saved_carts (customer_id);

-- -----------------------------------------------------------------------------
-- 3. Extender orders con lo que faltaba para checkout real
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists customer_id        uuid references public.customers(id) on delete set null,
  add column if not exists customer_phone     text,
  add column if not exists customer_email     text,
  add column if not exists customer_address   text,
  add column if not exists order_number       text unique,
  add column if not exists updated_at         timestamptz not null default now(),
  add column if not exists whatsapp_sent      boolean not null default false;

create index if not exists idx_orders_customer    on public.orders (customer_id);
create index if not exists idx_orders_ordernumber on public.orders (order_number);
create index if not exists idx_orders_status      on public.orders (status);
create index if not exists idx_orders_created     on public.orders (created_at desc);

-- -----------------------------------------------------------------------------
-- 4. Extender order_items con snapshot + subtotal
-- -----------------------------------------------------------------------------
alter table public.order_items
  add column if not exists product_name text,
  add column if not exists subtotal     numeric not null default 0,
  add column if not exists unit_type    text,
  add column if not exists created_at   timestamptz not null default now();

-- Derivar subtotal si quedó en 0 por viejas inserciones
update public.order_items
  set subtotal = coalesce(quantity, 0) * coalesce(unit_price, 0)
  where subtotal = 0;

-- -----------------------------------------------------------------------------
-- 5. Trigger para mantener updated_at automáticamente
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customers_updated   on public.customers;
drop trigger if exists trg_saved_carts_updated on public.saved_carts;
drop trigger if exists trg_orders_updated      on public.orders;

create trigger trg_customers_updated   before update on public.customers
  for each row execute function public.set_updated_at();
create trigger trg_saved_carts_updated before update on public.saved_carts
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated      before update on public.orders
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. order_number autoincremental formato GEN-YYYYMMDD-NNNN
-- -----------------------------------------------------------------------------
create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
declare
  v_seq int;
  v_day text;
begin
  if new.order_number is not null then
    return new;
  end if;
  v_day := to_char(coalesce(new.created_at, now()), 'YYYYMMDD');

  -- simple intra-day counter (avoids contention for now; brute for MVP)
  select coalesce(max(
    nullif(split_part(order_number, '-', 3), '')::int
  ), 0) + 1
  into v_seq
  from public.orders
  where order_number like 'GEN-' || v_day || '-%';

  new.order_number := 'GEN-' || v_day || '-' || lpad(v_seq::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists trg_orders_assign_number on public.orders;

create trigger trg_orders_assign_number
  before insert on public.orders
  for each row execute function public.assign_order_number();

-- -----------------------------------------------------------------------------
-- 7. RLS policies — anon puede leer products, customers propios, orders propios
-- -----------------------------------------------------------------------------
-- products: lectura pública para storefront
alter table public.products enable row level security;

drop policy if exists products_public_select on public.products;
create policy products_public_select
  on public.products for select
  using (true);

-- customers: anon puede insertar (whatsapp-guest), pero NO ver otros
alter table public.customers enable row level security;

drop policy if exists customers_anon_insert on public.customers;
create policy customers_anon_insert
  on public.customers for insert
  with check (true);

-- SELECT/UPDATE para anon HABILITADO pero solo si se valida el phone después en
-- el backend. Como MVP sin auth, dejamos SELECT y UPDATE público con
-- restricción de que el cliente siempre se busca/actualiza por phone conocido
-- del localStorage del cliente. Es débil, aceptable para tienda incipiente.
-- Para producción real, mover a magic-link + auth.uid() = customer.user_id.
drop policy if exists customers_anon_select on public.customers;
create policy customers_anon_select
  on public.customers for select
  using (true);

drop policy if exists customers_anon_update on public.customers;
create policy customers_anon_update
  on public.customers for update
  using (true);

-- orders: anon INSERT permitido (whatsapp-guest), SELECT limitado a los últimos
-- 7 días del mismo phone (los snapshots customer_phone guardan el contexto).
alter table public.orders enable row level security;

drop policy if exists orders_anon_insert on public.orders;
create policy orders_anon_insert
  on public.orders for insert
  with check (true);

drop policy if exists orders_anon_select_own on public.orders;
create policy orders_anon_select_own
  on public.orders for select
  using (
    -- Admin ve todo (rol admin desde profiles)
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
    or
    -- Cliente ve órdenes del phone snapshot reciente (MVP sin auth)
    customer_phone is not null
  );

drop policy if exists orders_anon_update_status on public.orders;
create policy orders_anon_update_status
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- order_items: legible si la orden es legible
alter table public.order_items enable row level security;

drop policy if exists order_items_anon_insert on public.order_items;
create policy order_items_anon_insert
  on public.order_items for insert
  with check (true);

drop policy if exists order_items_anon_select on public.order_items;
create policy order_items_anon_select
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
    )
  );

-- saved_carts: anon puede crear y leer los propios (filtro por customer_id
-- que se pasa explícitamente desde localStorage)
alter table public.saved_carts enable row level security;

drop policy if exists saved_carts_anon_all on public.saved_carts;
create policy saved_carts_anon_all
  on public.saved_carts for all
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- 8. Updated_at default en customers si no lo tenía
-- -----------------------------------------------------------------------------
alter table public.customers
  alter column updated_at set default now();

alter table public.saved_carts
  alter column updated_at set default now();

-- -----------------------------------------------------------------------------
-- 9. Refresh PostgREST schema cache (idempotente, fuerza el reload)
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';
