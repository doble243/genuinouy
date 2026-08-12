-- =============================================================================
-- Genuinos UY — Migration 0005: Product Reviews
-- =============================================================================
--
-- Reseñas de productos, administradas por admin (sin alta anónima).
-- House pattern: migración 0001 (RLS vía profiles.role = 'admin').
--
-- Almacenamiento:
--   - rating 1..5 (CHECK)
--   - photo_url = URL webp de Cloudinary (preset unsigned genuinos_webp,
--     carpeta genuinos/reviews) — opcional
--   - verified_purchase = columna almacenada, SIN auto-computación (futuro)
--   - approved = gate de visibilidad en storefront (solo approved = true)
--   - featured = selección para el carrusel de reseñas destacadas de la home
--   - sort_order = orden manual de admin
--
-- RLS:
--   - anon: SELECT de filas approved = true únicamente
--   - admin (profiles.role = 'admin'): ALL (select/insert/update/delete)
--   - NO hay INSERT anónimo: las reseñas son admin-managed

create table if not exists public.product_reviews (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products(id) on delete cascade,
  customer_name     text not null,
  rating            smallint not null check (rating between 1 and 5),
  title             text,
  body              text,
  size              text,
  photo_url         text,          -- Cloudinary webp delivery URL
  verified_purchase boolean not null default false,
  approved          boolean not null default false,
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_product_reviews_product          on public.product_reviews (product_id);
create index if not exists idx_product_reviews_approved_product on public.product_reviews (approved, product_id);
create index if not exists idx_product_reviews_featured         on public.product_reviews (featured, approved, sort_order);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.product_reviews enable row level security;

-- Storefront: solo ve reseñas aprobadas (spec gate: unapproved nunca se muestra)
drop policy if exists reviews_anon_select_approved on public.product_reviews;
create policy reviews_anon_select_approved
  on public.product_reviews for select
  using (approved = true);

-- Admin: control total (select/insert/update/delete) vía profiles.role = 'admin'
drop policy if exists reviews_admin_all on public.product_reviews;
create policy reviews_admin_all
  on public.product_reviews for all
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

-- -----------------------------------------------------------------------------
-- Refresh PostgREST schema cache (idempotente, fuerza el reload)
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';
