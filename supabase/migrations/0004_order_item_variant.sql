-- =============================================================================
-- Genuinos UY — Migration 0004: order_items variant snapshot
-- =============================================================================
--
-- When a customer picks a variant (size/color/other with a photo) and the
-- order is submitted, we save three pieces of context per order_items row:
--
--   product_variant_id  text   -- the variant's id (uuid-style string from client)
--   variant_label        text   -- human label, e.g. "Talle 42 - Negro"
--   variant_image        text   -- URL of the variant photo at order time
--
-- Nullable: products without variants just don't write these columns.
--
-- Apply from Dashboard → SQL Editor → New Query → paste this SQL. Idempotent.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'order_items'
      and column_name = 'product_variant_id'
  ) then
    alter table public.order_items
      add column product_variant_id text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'order_items'
      and column_name = 'variant_label'
  ) then
    alter table public.order_items
      add column variant_label text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'order_items'
      and column_name = 'variant_image'
  ) then
    alter table public.order_items
      add column variant_image text;
  end if;
end $$;

notify pgrst, 'reload schema';
