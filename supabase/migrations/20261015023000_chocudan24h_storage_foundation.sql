-- Chocudan24h only: durable state storage and private media bucket.
-- The application server uses the service role key; no client policies are opened here.
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create index if not exists app_state_updated_at_idx
  on public.app_state (updated_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chocudan24h-media',
  'chocudan24h-media',
  false,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/avif']::text[]
)
on conflict (id) do nothing;
