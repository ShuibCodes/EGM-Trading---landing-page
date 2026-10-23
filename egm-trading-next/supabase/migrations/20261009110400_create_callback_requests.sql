-- Callback requests captured by the website.
-- Calling columns are reserved for the AgentZero integration and are not written here.
-- No database webhook is created in this migration.

create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_e164 text not null,
  vehicle text,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  -- UK calendar date of requested_at. Stamped by trigger so the unique index can use it.
  -- timestamptz AT TIME ZONE is STABLE, so Postgres will not index that expression directly.
  requested_on date not null,
  call_placed_at timestamptz,
  last_attempt_at timestamptz,
  call_ended_at timestamptz,
  next_retry_at timestamptz,
  vapi_call_id text,
  ended_reason text,
  summary text,
  attempts integer not null default 0,
  outcome jsonb,
  constraint callback_requests_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint callback_requests_phone_e164_format check (phone_e164 ~ '^\+44[1-9][0-9]{9}$'),
  constraint callback_requests_vehicle_length check (vehicle is null or char_length(vehicle) <= 120),
  constraint callback_requests_status_present check (char_length(status) > 0),
  constraint callback_requests_attempts_nonnegative check (attempts >= 0)
);

comment on table public.callback_requests is
  'Website callback leads. status defaults to pending. Call timing, Vapi id, summary, and outcome are updated by the calling integration.';

-- Europe/London includes GMT and BST. The trigger overwrites any client-supplied date.
-- This table-specific name and plain CREATE avoid replacing a shared project function.
create function public.callback_requests_set_requested_on()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.requested_on := (new.requested_at at time zone 'Europe/London')::date;
  return new;
end;
$$;

create trigger callback_requests_set_requested_on
before insert or update of requested_at
on public.callback_requests
for each row
execute function public.callback_requests_set_requested_on();

create unique index callback_requests_one_per_phone_per_uk_day
  on public.callback_requests (phone_e164, requested_on);

alter table public.callback_requests enable row level security;

revoke all on table public.callback_requests from anon, authenticated;
-- New tables inherit full service_role privileges. Revoke first so DELETE is not retained.
revoke all on table public.callback_requests from service_role;
grant select, insert, update on table public.callback_requests to service_role;

revoke all on function public.callback_requests_set_requested_on() from public, anon, authenticated;
grant execute on function public.callback_requests_set_requested_on() to service_role;
