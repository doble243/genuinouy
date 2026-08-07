-- =============================================================================
-- Genuinos UY — Migration 0003: Product variants
-- =============================================================================
--
-- Each product can now have one or more variants. A variant is a structured
-- row carrying its own attribute (size/color/other), label, image, sku and
-- stock. The existing `sizes` array stays for backwards compatibility; new
-- products can use either (or both).
--
-- variant object shape:
--   {
--     id:        uuid,             -- client-generated
--     type:      'size' | 'color' | 'other',
--     value:     string,           -- raw value, e.g. "42", "Negro"
--     label:     string,           -- display label, e.g. "Talle 42", "Negro Mate"
--     image:     string | null,    -- Cloudinary URL of the variant photo
--     sku:       string | null,    -- variant SKU (overrides product SKU)
--     stock:     number,           -- per-variant stock
--     in_stock:  boolean           -- per-variant availability
--   }

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'variants'
  ) then
    alter table public.products
      add column variants jsonb not null default '[]'::jsonb;
  end if;
end $$;

notify pgrst, 'reload schema';
