-- =============================================================================
-- Genuinos UY — Migration 0002: Realtime publication
-- =============================================================================
--
-- Enables Postgres logical replication on the tables we want to subscribe to
-- from the browser. Supabase Realtime pulls from publication
-- 'supabase_realtime'; without adding the tables here, postgres_changes
-- subscriptions silently receive no events.
--
-- Apply from Supabase Dashboard → SQL Editor → New Query → paste this SQL.
-- Safe to re-run: the DO block guards against missing publication.

do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

-- Add each table once. ALTER PUBLICATION ADD does not have IF NOT EXISTS, so
-- we wrap in a check using pg_publication_tables.
do $$
declare
  t text;
  tables_to_add text[] := array[
    'orders',
    'order_items',
    'customers',
    'saved_carts'
  ];
begin
  foreach t in array tables_to_add loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
