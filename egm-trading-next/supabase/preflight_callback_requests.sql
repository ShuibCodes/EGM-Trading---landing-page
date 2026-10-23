-- Read-only catalog inspection for the callback migration.
-- An empty object list means none of these names exist in public.
-- This script does not change schema or rows.

select
  object_schema,
  object_name,
  object_type,
  detail
from (
  select
    n.nspname as object_schema,
    c.relname as object_name,
    case c.relkind
      when 'r' then 'table'
      when 'p' then 'partitioned table'
      when 'v' then 'view'
      when 'm' then 'materialized view'
      when 'i' then 'index'
      when 'S' then 'sequence'
      when 'f' then 'foreign table'
      when 'c' then 'composite type'
      else c.relkind::text
    end as object_type,
    null::text as detail
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'callback_requests',
      'callback_requests_one_per_phone_per_uk_day',
      'callback_requests_set_requested_on'
    )

  union all

  select
    n.nspname,
    p.proname,
    'function',
    pg_catalog.pg_get_function_identity_arguments(p.oid)
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'callback_requests_set_requested_on'

  union all

  select
    n.nspname,
    t.tgname,
    'trigger',
    c.relname
  from pg_catalog.pg_trigger t
  join pg_catalog.pg_class c on c.oid = t.tgrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and not t.tgisinternal
    and t.tgname = 'callback_requests_set_requested_on'

  union all

  select
    n.nspname,
    ty.typname,
    'type',
    null::text
  from pg_catalog.pg_type ty
  join pg_catalog.pg_namespace n on n.oid = ty.typnamespace
  where n.nspname = 'public'
    and ty.typname in (
      'callback_requests',
      'callback_requests_one_per_phone_per_uk_day',
      'callback_requests_set_requested_on'
    )
) objects
order by object_name, object_type;

select exists (
  select 1
  from information_schema.tables
  where table_schema = 'public'
    and table_name = 'callback_requests'
    and table_type = 'BASE TABLE'
) as callback_requests_table_exists;

select
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'callback_requests'
order by ordinal_position;
